import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { collectConsoleErrors, stubExternals } from './helpers';

test.beforeEach(async ({ page }) => {
  await stubExternals(page);
});

test.describe('page', () => {
  test('loads with the hero and no console or CSP errors', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('./');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('production systems');
    await expect(page.locator('.hero__availability')).toContainText(
      'Research opportunities, Summer 2027',
    );
    await expect(page.locator('.hero__availability')).toContainText(
      'Full-time roles after graduating May 2028',
    );
    expect(errors).toEqual([]);
  });

  test('shows derived stats: 4 employers and 2 papers', async ({ page }) => {
    await page.goto('./');
    const stats = page.locator('.stats');
    await expect(
      stats.locator('.stat', { hasText: 'Industry employers' }).locator('dd'),
    ).toHaveText('4');
    await expect(
      stats.locator('.stat', { hasText: 'Papers under review' }).locator('dd'),
    ).toHaveText('2');
  });

  test('research cards withhold titles', async ({ page }) => {
    await page.goto('./');
    await expect(page.getByText('Title withheld while under review.')).toHaveCount(2);
    await expect(page.getByText('Under review · NAACL 2027')).toHaveCount(2);
  });

  test('résumé link points at the PDF and it is served', async ({ page, request }) => {
    await page.goto('./');
    const href = await page
      .getByRole('link', { name: 'Résumé (PDF)' })
      .first()
      .getAttribute('href');
    expect(href).toMatch(/documents\/Hoang_Nhat_Duy_Le_Resume\.pdf$/);
    const response = await request.get(href!);
    expect(response.status()).toBe(200);
  });

  test('removed content is gone', async ({ page }) => {
    await page.goto('./');
    const body = page.locator('body');
    for (const gone of [
      'Huffman',
      'Radix',
      'Covid',
      'Data Science Club',
      'Immersion',
      'SPSS',
      'Bootstrap',
    ]) {
      await expect(body).not.toContainText(gone);
    }
  });
});

test.describe('tabs', () => {
  test('experience: selecting a role swaps the panel', async ({ page }) => {
    await page.goto('./');
    await page.locator('#experience').scrollIntoViewIfNeeded();
    await page.getByRole('tab', { name: 'First Solar' }).click();
    await expect(page.getByRole('tabpanel', { name: /First Solar/ })).toBeVisible();
    await expect(page.getByText('about 1.2 seconds')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'First Solar' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  test('projects: arrow keys move between tabs and AEGIS is shown first', async ({ page }) => {
    await page.goto('./');
    const first = page.getByRole('tab', { name: 'AEGIS' });
    await expect(first).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('Winner · Best Use of Auth0 · MakeUC 2026')).toBeVisible();
    await first.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'myHomes' })).toBeFocused();
    await expect(page.getByRole('tabpanel', { name: 'myHomes' })).toBeVisible();
  });

  test('paused trading project is labelled honestly', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('tab', { name: /Multi-Agent AI Trading/ }).click();
    await expect(page.getByText('Paused – prototype')).toBeVisible();
  });
});

test.describe('contact dialog', () => {
  test('opens from the hero, closes with Escape, and returns focus', async ({ page }) => {
    await page.goto('./');
    const trigger = page.locator('.hero').getByRole('button', { name: 'Get in touch' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Get in touch' });
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('opens from the footer', async ({ page }) => {
    await page.goto('./');
    await page.locator('footer').getByRole('button', { name: 'Get in touch' }).click();
    await expect(page.getByRole('dialog', { name: 'Get in touch' })).toBeVisible();
  });

  test('shows inline errors on an empty submit and sends nothing', async ({ page }) => {
    let posted = false;
    await page.route('https://formspree.io/**', (route) => {
      posted = true;
      return route.fulfill({ status: 200, body: '{}' });
    });
    await page.goto('./');
    await page.locator('.hero').getByRole('button', { name: 'Get in touch' }).click();
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByText('Please enter your name.')).toBeVisible();
    await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
    await expect(page.getByLabel('Name')).toHaveAttribute('aria-invalid', 'true');
    expect(posted).toBe(false);
  });

  test('a valid message posts to Formspree and confirms', async ({ page }) => {
    let body = '';
    await page.route('https://formspree.io/**', (route) => {
      body = route.request().postData() ?? '';
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });
    await page.goto('./');
    await page.locator('.hero').getByRole('button', { name: 'Get in touch' }).click();
    await page.getByLabel('Name').fill('Ada Lovelace');
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByLabel('Message').fill('Would love to chat about your research.');
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByText(/Your message is on its way/)).toBeVisible();
    expect(body).toContain('Ada Lovelace');
  });

  test('a filled honeypot fakes success but sends nothing', async ({ page }) => {
    let posted = false;
    await page.route('https://formspree.io/**', (route) => {
      posted = true;
      return route.fulfill({ status: 200, body: '{}' });
    });
    await page.goto('./');
    await page.locator('.hero').getByRole('button', { name: 'Get in touch' }).click();
    await page.getByLabel('Name').fill('Bot');
    await page.getByLabel('Email').fill('bot@example.com');
    await page.getByLabel('Message').fill('Buy my cheap spam products now.');
    await page
      .locator('#cf-gotcha')
      .evaluate((el: HTMLInputElement) => (el.value = 'http://spam.example'));
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByText(/Your message is on its way/)).toBeVisible();
    expect(posted).toBe(false);
  });

  test('shows a friendly error when sending fails', async ({ page }) => {
    await page.route('https://formspree.io/**', (route) =>
      route.fulfill({ status: 500, body: 'no' }),
    );
    await page.goto('./');
    await page.locator('.hero').getByRole('button', { name: 'Get in touch' }).click();
    await page.getByLabel('Name').fill('Ada');
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByLabel('Message').fill('Hello there, this should fail.');
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByText(/Something went wrong/)).toBeVisible();
  });
});

test.describe('AI widget', () => {
  test('opens lazily, loads the assistant iframe, and closes with Escape', async ({ page }) => {
    await page.goto('./');
    const fab = page.getByRole('button', { name: /Ask my AI/ });
    await expect(fab).toContainText('Grounded in my résumé & research');
    await expect(page.locator('[data-ai-frame]')).not.toHaveAttribute('src', /.+/);

    await fab.click();
    const panel = page.getByRole('dialog', { name: 'Chat with my AI assistant' });
    await expect(panel).toBeVisible();
    await expect(page.locator('[data-ai-frame]')).toHaveAttribute(
      'src',
      /personal-ai-delta\.vercel\.app/,
    );
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(fab).toBeFocused();
  });

  test('the Cadence project has no chat button; only the floating button opens the chat', async ({
    page,
  }) => {
    await page.goto('./');
    await expect(page.locator('body')).not.toContainText('Chat with Cadence');
    await page.getByRole('tab', { name: 'Cadence' }).click();
    await expect(page.getByRole('button', { name: /Chat with Cadence/ })).toHaveCount(0);
  });
});

test.describe('navigation', () => {
  test('desktop sidebar marks the current section', async ({ page, isMobile }) => {
    test.skip(isMobile, 'sidebar is desktop only');
    await page.goto('./');
    await page.locator('.sidebar').getByRole('link', { name: 'Projects' }).click();
    await expect(page.locator('.sidebar [data-nav="projects"]')).toHaveAttribute(
      'aria-current',
      'location',
    );
    await expect(page.locator('#projects')).toBeInViewport();
  });

  test('mobile drawer opens, navigates, and closes', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'drawer is mobile only');
    await page.goto('./');
    const toggle = page.getByRole('button', { name: 'Menu' });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.locator('#mobile-menu').getByRole('link', { name: 'Skills' }).click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#skills')).toBeInViewport();
  });
});

test.describe('responsive + a11y', () => {
  for (const width of [320, 375, 768, 1024, 1440, 1920]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('./');
      await page.waitForLoadState('load');
      await expect(page.locator('main')).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test('axe: no serious or critical violations', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('load');
    await expect(page.locator('main')).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(blocking.map((v) => `${v.id}: ${v.nodes.length} node(s)`)).toEqual([]);
  });

  test('reduced motion shows reveal cards immediately', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('./');
    const opacity = await page
      .locator('.reveal')
      .first()
      .evaluate((el) => getComputedStyle(el).opacity);
    expect(opacity).toBe('1');
  });
});

test.describe('experience and projects polish', () => {
  test('the "Select a role" hint is gone (the tablist keeps an accessible name)', async ({
    page,
  }) => {
    await page.goto('./');
    await expect(page.locator('#experience')).not.toContainText('Select a role');
    await expect(page.locator('#experience [role="tablist"]')).toHaveAttribute(
      'aria-label',
      /role/i,
    );
  });

  test('Cadence is shown as a project and the old assistant name is gone', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('body')).not.toContainText('Personal AI Assistant');
    await page.getByRole('tab', { name: 'Cadence' }).click();
    await expect(page.getByRole('heading', { name: /^Cadence/ })).toBeVisible();
  });
});

test.describe('skills section', () => {
  test('has three simple cards: Daily, Working knowledge, Earlier career', async ({ page }) => {
    await page.goto('./');
    const cards = page.locator('#skills .tier');
    await expect(cards).toHaveCount(3);
    await expect(cards.nth(0)).toContainText('Daily');
    await expect(cards.nth(1)).toContainText('Working knowledge');
    await expect(cards.nth(2)).toContainText('Earlier career');
  });

  test('keeps every skill, with the AI skills first in Daily', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('#skills .chip')).toHaveCount(23);
    await expect(page.locator('#skills .tier').first().locator('.chip').first()).toHaveText('RAG');
  });

  test('brand icons are inline and decorative; the section stays plain-text friendly', async ({
    page,
  }) => {
    await page.goto('./');
    const icons = page.locator('#skills .chip svg');
    expect(await icons.count()).toBeGreaterThan(8);
    await expect(icons.first()).toHaveAttribute('aria-hidden', 'true');
    // the removed domain/proof layout must not come back
    await expect(page.locator('#skills')).not.toContainText('Proven in');
    await expect(page.locator('#skills')).not.toContainText('How to read this');
  });
});
