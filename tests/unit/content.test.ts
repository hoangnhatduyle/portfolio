import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import {
  education,
  experience,
  profile,
  projects,
  research,
  skills,
  testimonials,
} from '../../src/lib/content';
import { researchSchema } from '../../src/lib/schemas';
import { computeStats, formatPeriod } from '../../src/lib/format';
import { iconPath } from '../../src/lib/icons';

describe('content validation', () => {
  test('every collection parses and is non-empty', () => {
    for (const items of [experience, projects, research, skills, education, testimonials]) {
      expect(items.length).toBeGreaterThan(0);
    }
    expect(profile.name).toBe('Hoang Nhat Duy Le');
  });

  test('ids are unique within each collection', () => {
    for (const items of [experience, projects, research, skills, education, testimonials]) {
      const ids = items.map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe('experience', () => {
  test('is sorted newest-first by start date', () => {
    const starts = experience.map((e) => e.start);
    expect(starts).toEqual([...starts].sort().reverse());
  });

  test('does not include removed entries', () => {
    const companies = experience.map((e) => e.company.toLowerCase()).join('|');
    expect(companies).not.toMatch(/dana|immersion|data science club/);
  });

  test('has no leftover typos from the old site', () => {
    const text = JSON.stringify(experience).toLowerCase();
    expect(text).not.toContain('updation');
    expect(text).not.toContain('maintainence');
  });
});

describe('derived stats', () => {
  test('employers counts industry entries only, papers counts research entries', () => {
    const stats = computeStats(profile, experience, research);
    expect(stats.employers).toBe(4);
    expect(stats.papers).toBe(2);
    expect(stats.years).toBe(profile.stats.years);
    expect(stats.customers).toBe(profile.stats.customers);
  });
});

describe('projects', () => {
  test('a paused project never claims to be ongoing', () => {
    for (const p of projects.filter((p) => p.status === 'paused')) {
      expect(p.end).not.toBe('present');
    }
  });

  test('removed 2021 class projects are gone', () => {
    const ids = projects.map((p) => p.id);
    for (const gone of ['radix', 'huffman', 'covid-vaccine']) expect(ids).not.toContain(gone);
  });

  test('exactly one featured project, and it is AEGIS', () => {
    const featured = projects.filter((p) => p.featured);
    expect(featured.map((p) => p.id)).toEqual(['aegis']);
  });
});

describe('research placeholders', () => {
  test('exposes no title and no author order', () => {
    for (const r of research) {
      expect(r).not.toHaveProperty('title');
      expect(r).not.toHaveProperty('authors');
      expect(r.status).toBe('under-review');
    }
  });

  test('schema rejects an entry that tries to publish a title', () => {
    const bad = {
      id: 'x',
      status: 'under-review',
      venue: 'NAACL 2027',
      topic: 't',
      title: 'Secret',
    };
    expect(researchSchema.safeParse(bad).success).toBe(false);
  });
});

describe('skills', () => {
  const items = skills.flatMap((tier) => tier.items);
  const names = items.map((i) => i.name);
  const members = (tier: string) =>
    (skills.find((t) => t.id === tier)?.items ?? []).map((i) => i.name).sort();

  test('has the three tiers in order', () => {
    expect(skills.map((t) => t.id)).toEqual(['daily', 'working', 'earlier']);
  });

  test('no skill was lost: each tier has exactly its members', () => {
    expect(members('daily')).toEqual(
      [
        'Python',
        'TypeScript',
        'FastAPI',
        'React / Next.js',
        'PostgreSQL',
        'Docker',
        'RAG',
        'Agent orchestration',
        'LLM evals',
        'Agent security & provenance',
      ].sort(),
    );
    expect(members('working')).toEqual(
      ['Kubernetes', 'Redis', 'CI/CD', 'Vector stores', 'Azure', 'C# / .NET', 'Angular'].sort(),
    );
    expect(members('earlier')).toEqual(
      ['MES & PLC integration', 'PHP', 'JavaScript', 'SQL Server', 'C++', 'Java'].sort(),
    );
  });

  test('the AI and agent skills lead the Daily card', () => {
    const daily = skills.find((t) => t.id === 'daily')!.items.map((i) => i.name);
    expect(daily.slice(0, 4)).toEqual([
      'RAG',
      'Agent orchestration',
      'LLM evals',
      'Agent security & provenance',
    ]);
  });

  test('each skill appears once, and removed skills stay removed', () => {
    expect(new Set(names).size).toBe(names.length);
    for (const gone of ['SPSS', 'SAS', 'Assembly', 'Bootstrap', 'jQuery']) {
      expect(names).not.toContain(gone);
    }
  });

  test('Kubernetes is working knowledge, not daily', () => {
    expect(members('working')).toContain('Kubernetes');
    expect(members('daily')).not.toContain('Kubernetes');
  });

  test('every icon key resolves to a registered brand mark', () => {
    for (const item of items.filter((i) => i.icon)) {
      expect(iconPath(item.icon), `${item.name} -> ${item.icon}`).toMatch(/^M[\d.\-]/);
    }
  });

  test('iconPath is null for a missing or unknown icon', () => {
    expect(iconPath(undefined)).toBeNull();
    expect(iconPath('no-such-icon')).toBeNull();
  });
});

describe('education', () => {
  test('each school has exactly three bullets', () => {
    for (const e of education) expect(e.bullets).toHaveLength(3);
  });

  test('UToledo shows major+minor on one line, GPA, then co-ops', () => {
    const ut = education.find((e) => e.id === 'utoledo');
    expect(ut?.bullets[0]).toMatch(/Computer Science.*Data Science/);
    expect(ut?.bullets[1]).toContain('3.89');
    expect(ut?.bullets[2]).toMatch(/5 co-ops/);
  });
});

describe('testimonials', () => {
  test('trimmed to the three strongest', () => {
    expect(testimonials.map((t) => t.id)).toEqual(['aaron', 'heysam', 'barry']);
  });
});

describe('formatPeriod', () => {
  test('formats closed and open ranges', () => {
    expect(formatPeriod('2025-02', '2026-05')).toBe('Feb 2025 – May 2026');
    expect(formatPeriod('2026-10', 'present')).toBe('Oct 2026 – Present');
  });

  test('collapses a single-month range', () => {
    expect(formatPeriod('2026-11', '2026-11')).toBe('Nov 2026');
  });
});

describe('profile claims', () => {
  test('experience is stated as 4+ years everywhere it is typed', () => {
    expect(profile.stats.years).toBe('4+');
    expect(profile.summary).toMatch(/4\+ years/);
    expect(profile.summary).not.toMatch(/five years|5\+/i);
  });
});

describe('images and naming', () => {
  const assetFiles = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory() ? assetFiles(join(dir, entry.name)) : [entry.name],
    );
  const available = new Set(assetFiles(join(process.cwd(), 'src/assets')));

  test('every image referenced by content exists in src/assets (names are matched exactly)', () => {
    const referenced = [
      ...experience.map((e) => e.logo),
      ...projects.map((p) => p.image),
      ...education.map((e) => e.logo),
      ...testimonials.flatMap((t) => [t.photo, t.logo]),
    ];
    const missing = referenced.filter((name) => !available.has(name));
    expect(missing).toEqual([]);
  });

  test('no stray Windows download-metadata files ship in src/assets', () => {
    expect([...available].filter((name) => name.includes('Zone.Identifier'))).toEqual([]);
  });

  test('CincySI uses the supplied lab logo', () => {
    expect(experience.find((e) => e.id === 'cincysi')?.logo).toBe('CincySI_Lab final Logo.png');
  });

  test('AEGIS uses the supplied thumbnail, shown whole on a matching background', () => {
    const aegis = projects.find((p) => p.id === 'aegis');
    expect(aegis?.image).toBe('AEGIS_thumbnail.png');
    expect(aegis?.imageFit).toBe('contain');
    expect(aegis?.imageBg).toMatch(/^#[0-9a-f]{6}$/i);
  });

  test('the personal assistant is called Cadence and uses the caricature', () => {
    expect(projects.map((p) => p.id)).not.toContain('personal-assistant');
    const cadence = projects.find((p) => p.id === 'cadence');
    expect(cadence?.title).toMatch(/^Cadence\b/);
    expect(cadence?.image).toBe('Caricature.jpg');
    expect(cadence?.action).toBe('open-chat');
    expect(JSON.stringify(projects)).not.toMatch(/Personal AI Assistant/);
  });
});
