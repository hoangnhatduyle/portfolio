import { describe, expect, test } from 'vitest';
import { NAV_ITEMS } from '../../src/lib/nav';
import { isExternal, withBase } from '../../src/lib/url';

describe('withBase', () => {
  test('prefixes site-relative paths with the base', () => {
    expect(withBase('documents/resume.pdf')).toBe(
      `${import.meta.env.BASE_URL}documents/resume.pdf`,
    );
  });

  test('strips a leading slash so the base is not doubled', () => {
    expect(withBase('/og.png')).toBe(withBase('og.png'));
  });

  test.each(['https://example.com/x', 'http://example.com', 'mailto:a@b.co', '#research'])(
    'passes %s through untouched',
    (href) => {
      expect(withBase(href)).toBe(href);
    },
  );
});

describe('isExternal', () => {
  test('detects absolute http(s) URLs only', () => {
    expect(isExternal('https://devpost.com')).toBe(true);
    expect(isExternal('documents/a.ino')).toBe(false);
    expect(isExternal('mailto:a@b.co')).toBe(false);
  });
});

describe('NAV_ITEMS', () => {
  test('has unique ids, in page order, matching the section ids on the page', () => {
    const ids = NAV_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(['research', 'experience', 'skills', 'projects', 'education', 'feedback']);
  });
});
