import { expect, test } from '../../src/fixtures';

const pages = ['/', '/login', '/register'];

const requiredHeaders: { header: string; check: RegExp; why: string }[] = [
  { header: 'strict-transport-security', check: /max-age=\d+/, why: 'HTTPS only (HSTS)' },
  { header: 'x-content-type-options', check: /^nosniff$/, why: 'no MIME sniffing' },
  { header: 'content-security-policy', check: /frame-ancestors|default-src/, why: 'CSP' },
  { header: 'referrer-policy', check: /./, why: 'limits what leaks in the Referer header' },
];

test.describe(
  'Security headers',
  {
    tag: ['@security', '@gdpr', '@known-bug'],
    annotation: {
      type: 'issue',
      description: 'BUG-015: pages are served without security headers',
    },
  },
  () => {
    for (const path of pages) {
      test(`${path} is served with the standard security headers`, async ({ request }) => {
        const response = await request.get(path);
        expect(response.status(), `${path} loads`).toBe(200);
        const headers = response.headers();

        for (const { header, check, why } of requiredHeaders) {
          await test.step(header, () => {
            expect.soft(headers[header] ?? '', `${header} (${why})`).toMatch(check);
          });
        }

        await test.step('x-powered-by', () => {
          expect.soft(headers['x-powered-by'], 'does not reveal the framework').toBeUndefined();
        });
      });
    }
  },
);
