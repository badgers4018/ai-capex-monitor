import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { extraTrustedOrigins, trustedOrigin } from '../server/auth.js';

// Financial weekly non-regression: hashes of the files on main at 929aebb (pre-integration).
const WEEKLY_MAIN_SHA256: Record<string, string> = {
  'weekly/2026-09-06.md': '9fb1d63e65ead09a6858b63ab319e01e96abfef36b3ad0327e18e4d30dfc1970',
  'weekly/2026-09-13.md': '20a08fe4a7f84e8d8c2f8e52f0ade7fc7982ec7071249c1189c39415ded2ef99',
  'weekly/2026-09-20.md': '5e47ee3649a3f5d78725d8fa4b189711995290ed75b6127a82a84c7758107e68',
  'weekly/2026-09-27.md': 'aa7ee9375026029a3c0ecf53763f1054539813d22244bed859149a44be61b939',
  'weekly/2026-10-04.md': '0c07adb037904e220c982f978bdad247b142fd21a8acf1798168f21c4c8b2982',
  'weekly/2026-10-11.md': 'cd6befefa38470a7f97ddd723a1c94fd7474f43c49a780f4f35582d3203e1037',
  'weekly/README.md': '68e2bb2c93d8750131e010439e873a028587e037b4986b9aa3def3ad91135f02',
  'vercel.json': '869c191351ea2ecc2eaeb29603e2b7f891bdee4fbb011c672a0820f9491bbf84',
};

describe('host integration guards', () => {
  it('keeps the default trusted origins and accepts only explicit loopback extras', () => {
    expect(trustedOrigin('http://127.0.0.1:5173', [])).toBe(true);
    expect(trustedOrigin('http://127.0.0.1:3000', [])).toBe(false);
    expect(trustedOrigin('http://127.0.0.1:3000', ['http://127.0.0.1:3000'])).toBe(true);
    expect(trustedOrigin('https://evil.example', ['http://127.0.0.1:3000'])).toBe(false);
    expect(extraTrustedOrigins('http://localhost:3000, http://127.0.0.1:3000')).toHaveLength(2);
    expect(() => extraTrustedOrigins('https://monitor.example.com')).toThrow(/loopback/);
    expect(() => extraTrustedOrigins('http://0.0.0.0:3000')).toThrow(/loopback/);
  });

  it('leaves the financial weekly tape and deployment config byte-identical', () => {
    for (const [file, sha] of Object.entries(WEEKLY_MAIN_SHA256))
      expect(createHash('sha256').update(readFileSync(file)).digest('hex'), file).toBe(sha);
  });
});
