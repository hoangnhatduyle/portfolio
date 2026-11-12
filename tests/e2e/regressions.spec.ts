import { expect, test } from '@playwright/test';
import { stubExternals } from './helpers';

test.beforeEach(async ({ page }) => {
  await stubExternals(page);
});

test.describe('AI panel layout', () => {
  test('the chat iframe fills the panel after the "waking up" banner hides', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: /Ask my AI/ }).click();
    const status = page.locator('[data-ai-status]');
    await expect(status).toBeHidden(); // hides itself once the frame loads
    const frame = await page.locator('[data-ai-frame]').boundingBox();
    // Regression: hiding the banner used to shift the grid rows and collapse the frame to ~150px.
    expect(frame?.height ?? 0).toBeGreaterThan(300);
  });

  test('the frame is sandboxed without top navigation and sends no referrer', async ({ page }) => {
    await page.goto('./');
    const frame = page.locator('[data-ai-frame]');
    const sandbox = await frame.getAttribute('sandbox');
    expect(sandbox).toContain('allow-scripts');
    expect(sandbox).not.toContain('allow-top-navigation');
    await expect(frame).toHaveAttribute('referrerpolicy', 'no-referrer');
  });
});

test.describe('contact dialog edge cases', () => {
  test('after opening from the mobile menu, Escape returns focus to the menu button', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'mobile menu only');
    await page.goto('./');
    const toggle = page.getByRole('button', { name: 'Menu' });
    await toggle.click();
    await page.locator('#mobile-menu').getByRole('button', { name: 'Get in touch' }).click();
    const dialog = page.getByRole('dialog', { name: 'Get in touch' });
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(toggle).toBeFocused();
  });

  test('a drag that starts in the form and ends on the backdrop keeps the dialog open', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'the mobile dialog is full-screen and has no backdrop');
    await page.goto('./');
    await page.locator('.hero').getByRole('button', { name: 'Get in touch' }).click();
    const dialog = page.getByRole('dialog', { name: 'Get in touch' });
    await page.getByLabel('Message').fill('Some text I am about to select with the mouse.');
    const box = (await page.getByLabel('Message').boundingBox())!;
    await page.mouse.move(box.x + 20, box.y + 20);
    await page.mouse.down();
    await page.mouse.move(8, 8); // release over the backdrop
    await page.mouse.up();
    await expect(dialog).toBeVisible();
    await expect(page.getByLabel('Message')).toHaveValue(/about to select/);
  });

  test('a plain click on the backdrop still closes it', async ({ page, isMobile }) => {
    test.skip(isMobile, 'the mobile dialog is full-screen and has no backdrop');
    await page.goto('./');
    await page.locator('.hero').getByRole('button', { name: 'Get in touch' }).click();
    const dialog = page.getByRole('dialog', { name: 'Get in touch' });
    await page.mouse.click(8, 8);
    await expect(dialog).toBeHidden();
  });

  test('closing mid-send never shows a stale result on the reopened form', async ({ page }) => {
    await page.route('https://formspree.io/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 900));
      await route
        .fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' })
        .catch(() => undefined);
    });
    await page.goto('./');
    const open = () => page.locator('.hero').getByRole('button', { name: 'Get in touch' }).click();
    await open();
    await page.getByLabel('Name').fill('Ada');
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByLabel('Message').fill('A message that will be cancelled in flight.');
    await page.getByRole('button', { name: 'Send message' }).click();
    await page.keyboard.press('Escape');
    await open();
    await page.waitForTimeout(1400); // longer than the delayed response
    await expect(page.locator('[data-form-status]')).toHaveText('');
  });
});

test.describe('scrollspy and tabs', () => {
  test('the last section is current at the bottom even on a tall viewport', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'sidebar is desktop only');
    await page.setViewportSize({ width: 1440, height: 1500 });
    await page.goto('./');
    await page.locator('.sidebar').getByRole('link', { name: 'Feedback' }).click();
    await expect(page.locator('.sidebar [data-nav="feedback"]')).toHaveAttribute(
      'aria-current',
      'location',
    );
    await expect(page.locator('.sidebar [aria-current="location"]')).toHaveCount(1);
  });

  test('scrolling back to the hero clears the highlight', async ({ page, isMobile }) => {
    test.skip(isMobile, 'sidebar is desktop only');
    await page.goto('./');
    await page.locator('.sidebar').getByRole('link', { name: 'Skills' }).click();
    await expect(page.locator('.sidebar [data-nav="skills"]')).toHaveAttribute(
      'aria-current',
      'location',
    );
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect(page.locator('.sidebar [aria-current="location"]')).toHaveCount(0);
  });

  test('tabs: Home/End, wrap-around and roving tabindex', async ({ page }) => {
    await page.goto('./');
    const tabs = page.locator('#projects [role="tab"]');
    const count = await tabs.count();
    await tabs.first().focus();
    await page.keyboard.press('End');
    await expect(tabs.nth(count - 1)).toBeFocused();
    await expect(tabs.nth(count - 1)).toHaveAttribute('tabindex', '0');
    await expect(tabs.first()).toHaveAttribute('tabindex', '-1');
    await page.keyboard.press('ArrowRight'); // wraps to the first
    await expect(tabs.first()).toBeFocused();
    await page.keyboard.press('ArrowLeft'); // wraps back to the last
    await expect(tabs.nth(count - 1)).toBeFocused();
    await page.keyboard.press('Home');
    await expect(tabs.first()).toBeFocused();
    await expect(page.locator('#projects [role="tabpanel"]:not([hidden])')).toHaveCount(1);
  });

  test('Up/Down arrows do not move horizontal tabs', async ({ page }) => {
    await page.goto('./');
    const first = page.locator('#projects [role="tab"]').first();
    await first.focus();
    await page.keyboard.press('ArrowDown');
    await expect(first).toBeFocused();
  });
});

test.describe('motion', () => {
  test('with normal motion, cards start hidden and reveal on scroll', async ({ page }) => {
    await page.goto('./');
    const card = page.locator('#feedback .reveal').first();
    expect(await card.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveClass(/is-visible/);
    await expect.poll(() => card.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  });
});

test.describe('AI chat dialog (large, near full-screen)', () => {
  test('opens as a large dialog that leaves the page visible around it (full-screen on phones)', async ({
    page,
    isMobile,
  }) => {
    await page.goto('./');
    await page.getByRole('button', { name: /Ask my AI/ }).click();
    const dialog = page.getByRole('dialog', { name: 'Chat with my AI assistant' });
    await expect(dialog).toBeVisible();
    // measure the resting position, not the entry animation's first frame
    await dialog.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
    const box = (await dialog.boundingBox())!;
    const viewport = page.viewportSize()!;
    if (isMobile) {
      expect(box.width).toBeGreaterThanOrEqual(viewport.width * 0.98); // a phone gets the whole screen
    } else {
      // big, but clearly a dialog: roughly 60-85% of the window, centred, with margin on every side
      expect(box.width).toBeGreaterThanOrEqual(viewport.width * 0.6);
      expect(box.width).toBeLessThanOrEqual(viewport.width * 0.85);
      expect(box.height).toBeGreaterThanOrEqual(viewport.height * 0.6);
      expect(box.height).toBeLessThanOrEqual(viewport.height * 0.85);
      expect(Math.abs(box.x + box.width / 2 - viewport.width / 2)).toBeLessThan(2);
      expect(Math.abs(box.y + box.height / 2 - viewport.height / 2)).toBeLessThan(2);
    }
    // and the chat itself gets nearly all of the dialog
    const frame = (await page.locator('[data-ai-frame]').boundingBox())!;
    expect(frame.height).toBeGreaterThanOrEqual(box.height * 0.8);
  });

  test('the page behind is inert while the chat is open', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: /Ask my AI/ }).click();
    await expect(page.getByRole('dialog', { name: 'Chat with my AI assistant' })).toBeVisible();
    // Whatever is on top at the page's corner (the backdrop on desktop, the sheet itself on a phone)
    // must belong to the dialog, never to the page content behind it.
    const belongsToDialog = await page.evaluate(
      () => document.elementFromPoint(4, 4)?.closest('dialog') !== null,
    );
    expect(belongsToDialog).toBe(true);
  });

  test('a click on the backdrop closes it and focus returns to the button', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'the mobile chat is full-screen and has no backdrop');
    await page.goto('./');
    const fab = page.getByRole('button', { name: /Ask my AI/ });
    await fab.click();
    const dialog = page.getByRole('dialog', { name: 'Chat with my AI assistant' });
    await expect(dialog).toBeVisible();
    await page.mouse.click(4, 4);
    await expect(dialog).toBeHidden();
    await expect(fab).toBeFocused();
  });

  test('the page does not scroll behind the open chat, and scrolling is restored after', async ({
    page,
  }) => {
    await page.goto('./');
    await page.getByRole('button', { name: /Ask my AI/ }).click();
    await expect(page.locator('html')).toHaveClass(/ai-open/);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe(
      'hidden',
    );
    await page.keyboard.press('Escape');
    await expect(page.locator('html')).not.toHaveClass(/ai-open/);
  });
});
