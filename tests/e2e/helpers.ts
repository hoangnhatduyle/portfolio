import type { Page } from '@playwright/test';

/** Keep tests hermetic: no analytics, and a stub in place of the hosted AI assistant. */
export async function stubExternals(page: Page): Promise<void> {
  await page.route('https://www.googletagmanager.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }),
  );
  await page.route('https://personal-ai-delta.vercel.app/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><title>stub</title><p>stub assistant</p>',
    }),
  );
}

/**
 * The visible "Get in touch" button: the sidebar's on desktop, the hero's on phones
 * (the hero pair is hidden at desktop widths because the sidebar already shows it).
 */
export function contactTrigger(page: Page) {
  return page
    .locator('.hero, [aria-label="Site"]')
    .getByRole('button', { name: 'Get in touch' })
    .locator('visible=true')
    .first();
}

/** Collect console errors (this includes Content-Security-Policy violations). */
export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}
