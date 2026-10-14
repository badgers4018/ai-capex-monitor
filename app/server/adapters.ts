import { ServiceError, archive, sourceConfig, sha } from './core.js';
export type Feature = { attributes: Record<string, any>; geometry?: { x: number; y: number } };
export type LayerSnapshot = {
  scope: string;
  layerId: number;
  metadata: any;
  metadataHash: string;
  schemaFingerprint: string;
  expected: number;
  features: { feature: Feature; archiveHash: string; archiveUri: string; locator: any }[];
};
const HOST = 'gisweb.pwcva.gov';
export function allowedUrl(input: string) {
  const u = new URL(input);
  if (
    u.protocol !== 'https:' ||
    u.hostname !== HOST ||
    u.username ||
    u.password ||
    u.port ||
    !u.pathname.startsWith('/arcgis/rest/services/Planning/Build_Out_Analysis/MapServer')
  )
    throw new ServiceError(400, 'Source URL not allowed');
  return u;
}
export async function fetchJson(url: string, fetcher: typeof fetch = fetch) {
  allowedUrl(url);
  const response = await fetcher(url, {
    headers: { 'User-Agent': 'AI-Capex-Monitor/0.1 public-source-validation' },
    redirect: 'error',
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok)
    throw new ServiceError(response.status === 403 ? 403 : 502, `Source HTTP ${response.status}`);
  const reader = response.body?.getReader();
  if (!reader) throw new ServiceError(502, 'Empty source body');
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value!.length;
    if (size > 8388608) {
      await reader.cancel();
      throw new ServiceError(502, 'Source payload exceeds 8 MiB');
    }
    chunks.push(value!);
  }
  const bytes = Buffer.concat(chunks.map((x) => Buffer.from(x)));
  let data: any;
  try {
    data = JSON.parse(bytes.toString());
  } catch {
    throw new ServiceError(502, 'Invalid source JSON');
  }
  if (data.error)
    throw new ServiceError(
      502,
      'ArcGIS query error: ' + String(data.error.message || data.error.code),
    );
  return { data, bytes };
}
export function normalizedKey(value: unknown) {
  if (typeof value !== 'string' || !/^\{?[0-9a-f-]{36}\}?$/i.test(value))
    throw new ServiceError(422, 'Missing or invalid GlobalID');
  return value.replace(/[{}]/g, '').toLowerCase();
}
export function statusClaims(raw: string, source: any) {
  if (!(raw in source.construction_statuses))
    throw new ServiceError(422, 'Unknown status mapping: ' + raw);
  return {
    construction: source.construction_statuses[raw],
    entitlement: source.entitlement_statuses[raw],
  };
}
export function validateMetadata(data: any, layer: any) {
  if (data.id !== layer.id || data.name !== layer.name || !Array.isArray(data.fields))
    throw new ServiceError(422, 'Layer identity/schema drift');
  const fields = new Map(data.fields.map((f: any) => [f.name, f.type]));
  for (const [key, type] of Object.entries(layer.required_fields))
    if (fields.get(key) !== type)
      throw new ServiceError(422, 'Required field/type changed: ' + key);
  if (
    !String(data.capabilities).includes('Query') ||
    !data.advancedQueryCapabilities?.supportsPagination
  )
    throw new ServiceError(422, 'Source no longer supports paginated queries');
}
export async function collectLayer(
  layer: any,
  source = sourceConfig('pwc_dc_inventory'),
  fetcher: typeof fetch = fetch,
): Promise<LayerSnapshot> {
  const base = source.service_url + '/' + layer.id;
  const met = await fetchJson(base + '?f=pjson', fetcher);
  validateMetadata(met.data, layer);
  const metaArchive = archive(met.bytes);
  const schemaFingerprint = sha(
    JSON.stringify(met.data.fields.map((f: any) => [f.name, f.type, f.domain])),
  );
  if (
    source.schema_fingerprints?.[layer.scope] &&
    source.schema_fingerprints[layer.scope] !== schemaFingerprint
  )
    throw new ServiceError(422, 'Full source schema fingerprint changed; mapping review required');
  const countUrl =
    base + '/query?' + new URLSearchParams({ where: '1=1', returnCountOnly: 'true', f: 'json' });
  const before = await fetchJson(countUrl, fetcher);
  const expected = before.data.count;
  if (!Number.isInteger(expected) || expected < 0 || expected > 10000)
    throw new ServiceError(422, 'Invalid record count');
  const idsUrl =
    base + '/query?' + new URLSearchParams({ where: '1=1', returnIdsOnly: 'true', f: 'json' });
  const idsBefore = await fetchJson(idsUrl, fetcher);
  const normalizeIds = (ids: any) => {
    if (
      !Array.isArray(ids) ||
      ids.some((x) => !Number.isInteger(x)) ||
      new Set(ids).size !== expected ||
      ids.length !== expected
    )
      throw new ServiceError(422, 'Incomplete object-ID inventory');
    return [...ids].sort((a, b) => a - b);
  };
  const initialIds = normalizeIds(idsBefore.data.objectIds);
  const output: LayerSnapshot['features'] = [];
  const keys = new Set<string>();
  for (let offset = 0; offset < expected; offset += source.page_size) {
    const url =
      base +
      '/query?' +
      new URLSearchParams({
        where: '1=1',
        outFields: '*',
        returnGeometry: layer.kind === 'building' ? 'true' : 'false',
        outSR: '4326',
        orderByFields: 'OBJECTID ASC',
        resultOffset: String(offset),
        resultRecordCount: String(source.page_size),
        f: 'json',
      });
    const page = await fetchJson(url, fetcher);
    if (!Array.isArray(page.data.features) || page.data.features.length === 0)
      throw new ServiceError(422, 'Incomplete pagination');
    const raw = archive(page.bytes);
    for (let index = 0; index < page.data.features.length; index++) {
      const feature = page.data.features[index];
      const key = normalizedKey(feature.attributes?.GlobalID);
      if (keys.has(key)) throw new ServiceError(422, 'Duplicate source identity');
      keys.add(key);
      const attrs = feature.attributes;
      statusClaims(layer.kind === 'building' ? attrs.BuildingStatus : attrs.ProjectStatus, source);
      if (
        layer.kind === 'building' &&
        attrs.PermitStatus &&
        !source.permit_statuses.includes(attrs.PermitStatus)
      )
        throw new ServiceError(422, 'Unknown permit status: ' + attrs.PermitStatus);
      if (typeof (layer.kind === 'building' ? attrs.BuildingName : attrs.CampusName) !== 'string')
        throw new ServiceError(422, 'Invalid record label');
      output.push({
        feature,
        archiveHash: raw.hash,
        archiveUri: raw.uri,
        locator: {
          json_pointer: `/features/${index}/attributes`,
          layer: layer.id,
          source_global_id: key,
        },
      });
    }
    if (offset + page.data.features.length < expected && page.data.exceededTransferLimit === false)
      throw new ServiceError(422, 'Source prematurely ended pagination');
    await new Promise((r) => setTimeout(r, 250));
  }
  const after = await fetchJson(countUrl, fetcher);
  if (after.data.count !== expected || output.length !== expected)
    throw new ServiceError(422, 'Source changed/incomplete during collection');
  const idsAfter = normalizeIds((await fetchJson(idsUrl, fetcher)).data.objectIds);
  const collectedIds = output.map((x) => x.feature.attributes.OBJECTID).sort((a, b) => a - b);
  if (
    JSON.stringify(initialIds) !== JSON.stringify(idsAfter) ||
    JSON.stringify(initialIds) !== JSON.stringify(collectedIds)
  )
    throw new ServiceError(422, 'Object-ID inventory changed during pagination');
  return {
    scope: layer.scope,
    layerId: layer.id,
    metadata: met.data,
    metadataHash: metaArchive.hash,
    schemaFingerprint,
    expected,
    features: output,
  };
}
export async function probeSource(key: string) {
  const source = sourceConfig(key);
  if (key !== 'pwc_dc_inventory')
    return {
      key,
      access_status: source.access_status,
      readiness: source.readiness,
      enabled: false,
      activation_gate: source.activation_gate,
    };
  const results = [];
  for (const layer of source.layers) {
    const snap = await collectLayer(layer, source);
    results.push({
      scope: snap.scope,
      count: snap.expected,
      schema_fingerprint: snap.schemaFingerprint,
      metadata_hash: snap.metadataHash,
    });
  }
  return {
    key,
    access_status: 'approved',
    readiness: 'complete_local_snapshots_verified',
    production_scheduled: false,
    results,
  };
}
