import { describe, expect, test } from 'vitest';
import { AI_ORIGIN, AI_URL, FORM_ENDPOINT, FORM_ORIGIN } from '../../src/lib/config';
import { experience, profile, projects, research } from '../../src/lib/content';
import { computeStats } from '../../src/lib/format';
import {
  collection,
  educationSchema,
  experienceSchema,
  profileSchema,
  projectSchema,
} from '../../src/lib/schemas';
import { isExternal, joinBase } from '../../src/lib/url';

describe('collection (unique ids)', () => {
  test('accepts distinct ids', () => {
    expect(collection(experienceSchema).safeParse(experience).success).toBe(true);
  });

  test('rejects a duplicate id and points at it', () => {
    const dup = [experience[0], { ...experience[1], id: experience[0].id }];
    const result = collection(experienceSchema).safeParse(dup);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].message).toContain(experience[0].id);
  });
});

describe('strict schemas', () => {
  test('a typo in a project key fails instead of being silently dropped', () => {
    expect(projectSchema.safeParse({ ...projects[0], imageAlts: 'oops' }).success).toBe(false);
  });

  test('unknown keys fail on profile and experience too', () => {
    expect(profileSchema.safeParse({ ...profile, extra: 1 }).success).toBe(false);
    expect(experienceSchema.safeParse({ ...experience[0], rolee: 'x' }).success).toBe(false);
  });
});

describe('date ranges', () => {
  test('an end before the start is rejected', () => {
    expect(
      experienceSchema.safeParse({ ...experience[1], start: '2025-02', end: '2024-01' }).success,
    ).toBe(false);
    expect(
      projectSchema.safeParse({ ...projects[1], start: '2026-05', end: '2026-01' }).success,
    ).toBe(false);
    expect(
      educationSchema.safeParse({
        id: 'x',
        school: 's',
        location: 'l',
        logo: 'a.png',
        start: '2028-05',
        end: '2026-08',
        bullets: ['a', 'b', 'c'],
      }).success,
    ).toBe(false);
  });

  test('"present" and equal months are allowed', () => {
    expect(experienceSchema.safeParse({ ...experience[0], end: 'present' }).success).toBe(true);
    expect(
      projectSchema.safeParse({ ...projects[0], start: '2026-11', end: '2026-11' }).success,
    ).toBe(true);
  });
});

describe('computeStats', () => {
  test('employers counts distinct companies, not roles', () => {
    const industry = experience.filter((e) => e.kind === 'industry');
    const twoRolesOneCompany = [...industry, { ...industry[0], id: 'second-role' }];
    expect(computeStats(profile, twoRolesOneCompany, research).employers).toBe(industry.length);
  });
});

describe('joinBase', () => {
  test.each([
    ['/portfolio', 'og.png', '/portfolio/og.png'],
    ['/portfolio/', 'og.png', '/portfolio/og.png'],
    ['/portfolio/', '/og.png', '/portfolio/og.png'],
    ['/', 'documents/a.pdf', '/documents/a.pdf'],
  ])('joins base %s with %s', (base, path, expected) => {
    expect(joinBase(base, path)).toBe(expected);
  });

  test.each([
    'https://x.dev/a',
    'mailto:a@b.co',
    'tel:+15551234',
    '//cdn.example.com/x.js',
    '#top',
  ])('leaves %s untouched', (href) => {
    expect(joinBase('/portfolio/', href)).toBe(href);
  });
});

describe('isExternal', () => {
  test('treats http(s) and protocol-relative URLs as external, nothing else', () => {
    expect(isExternal('https://a.dev')).toBe(true);
    expect(isExternal('//a.dev')).toBe(true);
    expect(isExternal('documents/a.ino')).toBe(false);
    expect(isExternal('mailto:a@b.co')).toBe(false);
  });
});

describe('config', () => {
  test('origins are derived from the endpoints so the CSP cannot drift', () => {
    expect(AI_ORIGIN).toBe(new URL(AI_URL).origin);
    expect(FORM_ORIGIN).toBe(new URL(FORM_ENDPOINT).origin);
    expect(AI_ORIGIN).toMatch(/^https:\/\//);
    expect(FORM_ORIGIN).toBe('https://formspree.io');
  });
});
