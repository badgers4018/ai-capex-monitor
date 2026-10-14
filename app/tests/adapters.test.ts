import { describe, it, expect, afterAll } from 'vitest';
import {
  allowedUrl,
  normalizedKey,
  statusClaims,
  validateMetadata,
  fetchJson,
  collectLayer,
} from '../server/adapters.js';
import { sourceConfig, closePools } from '../server/core.js';
const source = { ...sourceConfig('pwc_dc_inventory'), schema_fingerprints: undefined },
  layer = source.layers[0];
const metadata = {
  id: 10,
  name: layer.name,
  fields: Object.entries(layer.required_fields).map(([name, type]) => ({ name, type })),
  capabilities: 'Map,Query,Data',
  advancedQueryCapabilities: { supportsPagination: true },
};
const feature = {
  attributes: {
    OBJECTID: 1,
    GlobalID: '{11111111-1111-4111-8111-111111111111}',
    CampusName: 'TEST Campus',
    ProjectStatus: 'Planned',
    CaseNumber: 'TEST-REZ-1',
    LastEditDate: null,
  },
};
const ok = (obj: any) =>
  new Response(JSON.stringify(obj), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
function mock(
  options: {
    count?: number;
    page?: any[];
    countChange?: boolean;
    idsChange?: boolean;
    meta?: any;
  } = {},
) {
  let counts = 0,
    ids = 0;
  const count = options.count ?? 1;
  return async (url: any) => {
    const u = new URL(url);
    if (u.pathname.endsWith('/10')) return ok(options.meta || metadata);
    if (u.searchParams.has('returnCountOnly'))
      return ok({ count: ++counts > 1 && options.countChange ? count + 1 : count });
    if (u.searchParams.has('returnIdsOnly'))
      return ok({
        objectIds: Array.from(
          { length: count },
          (_, i) => i + 1 + (++ids > 1 && options.idsChange ? 1 : 0),
        ),
      });
    return ok({ features: options.page || [feature], exceededTransferLimit: false });
  };
}
afterAll(closePools);
describe('source identity and boundaries', () => {
  it('allows only the locked source origin', () =>
    expect(allowedUrl(source.service_url + '/9?f=json').hostname).toBe('gisweb.pwcva.gov'));
  it.each([
    'http://gisweb.pwcva.gov/arcgis/rest/services/Planning/Build_Out_Analysis/MapServer',
    'https://evil.example/',
    'https://user:pass@gisweb.pwcva.gov/arcgis/rest/services/Planning/Build_Out_Analysis/MapServer',
    'https://gisweb.pwcva.gov:444/arcgis/rest/services/Planning/Build_Out_Analysis/MapServer',
  ])('blocks arbitrary/credentialed source URL %s', (url) =>
    expect(() => allowedUrl(url)).toThrow(),
  );
  it('qualifies and normalizes actual GUIDs', () =>
    expect(normalizedKey(feature.attributes.GlobalID)).toBe(
      '11111111-1111-4111-8111-111111111111',
    ));
  it.each([null, 'OBJECTID-1', 'bad-id', 123])('rejects missing/invalid identity %s', (v) =>
    expect(() => normalizedKey(v)).toThrow(),
  );
  it('keeps permit approval separate from construction', () =>
    expect(statusClaims('Approved Site Plan', source)).toEqual({
      construction: 'unknown',
      entitlement: 'approved',
    }));
  it('keeps planned construction unknown', () =>
    expect(statusClaims('Planned', source).construction).toBe('unknown'));
  it('quarantines unknown statuses', () =>
    expect(() => statusClaims('PROBABLY STARTED', source)).toThrow('Unknown status'));
  it('validates the pinned layer fields', () =>
    expect(() => validateMetadata(metadata, layer)).not.toThrow());
  it('rejects required field type drift', () =>
    expect(() => validateMetadata({ ...metadata, fields: [] }, layer)).toThrow('Required field'));
  it('rejects layer identity drift', () =>
    expect(() => validateMetadata({ ...metadata, id: 11 }, layer)).toThrow('identity'));
  it('rejects pagination capability loss', () =>
    expect(() => validateMetadata({ ...metadata, advancedQueryCapabilities: {} }, layer)).toThrow(
      'paginated',
    ));
});
describe('bounded HTTP and completeness', () => {
  it('returns 403 without a bypass/retry', async () => {
    let n = 0;
    await expect(
      fetchJson(source.service_url + '/9', async () => {
        n++;
        return new Response('Denied', { status: 403 });
      }),
    ).rejects.toThrow('HTTP 403');
    expect(n).toBe(1);
  });
  it('rejects invalid JSON', async () =>
    await expect(
      fetchJson(source.service_url + '/9', async () => new Response('<html>Denied</html>')),
    ).rejects.toThrow('Invalid source JSON'));
  it('rejects ArcGIS JSON error responses', async () =>
    await expect(
      fetchJson(source.service_url + '/9', async () => ok({ error: { message: 'Invalid query' } })),
    ).rejects.toThrow('ArcGIS'));
  it('rejects oversized source bodies', async () =>
    await expect(
      fetchJson(source.service_url + '/9', async () => new Response('x'.repeat(8388609))),
    ).rejects.toThrow('8 MiB'));
  it('validates a full one-page fixture', async () => {
    const s = await collectLayer(layer, source, mock() as any);
    expect(s.expected).toBe(1);
    expect(s.features).toHaveLength(1);
    expect(s.features[0].archiveHash).toHaveLength(64);
  });
  it('rejects incomplete pagination', async () =>
    await expect(collectLayer(layer, source, mock({ count: 2 }) as any)).rejects.toThrow(
      'prematurely',
    ));
  it('rejects duplicate identities within a page', async () =>
    await expect(
      collectLayer(layer, source, mock({ count: 2, page: [feature, feature] }) as any),
    ).rejects.toThrow('Duplicate'));
  it('rejects a source changing its count mid-run', async () =>
    await expect(collectLayer(layer, source, mock({ countChange: true }) as any)).rejects.toThrow(
      'changed/incomplete',
    ));
  it('rejects same-count object-ID replacements', async () =>
    await expect(collectLayer(layer, source, mock({ idsChange: true }) as any)).rejects.toThrow(
      'inventory changed',
    ));
  it('rejects full schema fingerprint drift even if required fields exist', async () =>
    await expect(
      collectLayer(
        layer,
        { ...source, schema_fingerprints: { campuses: '0'.repeat(64) } },
        mock() as any,
      ),
    ).rejects.toThrow('fingerprint changed'));
});
