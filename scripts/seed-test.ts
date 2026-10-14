import { registerSources, ingestSource } from '../app/server/ingestion.js';
import { archive, closePools } from '../app/server/core.js';
if (!/^\/dcpi_tests_[0-9a-f]+$/.test(new URL(process.env.DATABASE_OWNER_URL!).pathname))
  throw new Error('Fixture seed refuses non-test database');
try {
  await registerSources();
  await ingestSource('pwc_dc_inventory', {
    baseline: true,
    collector: async (layer: any) => {
      const feature =
        layer.scope === 'campuses'
          ? {
              attributes: {
                GlobalID: '{11111111-1111-4111-8111-111111111111}',
                CampusName: 'TEST Evidence Campus',
                CaseNumber: 'TEST-PLAN-1',
                ProjectStatus: 'Planned',
                LastEditDate: null,
              },
            }
          : {
              attributes: {
                GlobalID: '{22222222-2222-4222-8222-222222222222}',
                BuildingName: 'TEST Building 1',
                BuildingStatus: 'Completed',
                GPIN: 'TEST-GPIN-1',
                PermitCase: 'TEST-BLD-1',
                PermitStatus: 'Finaled',
                PlanningCaseNumber: 'TEST-PLAN-1',
                Address: 'TEST address',
                YearBuilt: 2020,
                OCCDate: null,
                LastEditDate: null,
              },
            };
      const raw = archive(Buffer.from(JSON.stringify({ features: [feature] })));
      return {
        scope: layer.scope,
        layerId: layer.id,
        metadata: {},
        metadataHash: raw.hash,
        schemaFingerprint: 'TEST-fixture-not-live',
        expected: 1,
        features: [
          {
            feature,
            archiveHash: raw.hash,
            archiveUri: raw.uri,
            locator: { json_pointer: '/features/0/attributes', fixture: true },
          },
        ],
      };
    },
  });
  console.log('Synthetic TEST fixture registry ready. Not real county coverage.');
} finally {
  await closePools();
}
