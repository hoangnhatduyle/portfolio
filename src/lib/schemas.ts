import { z } from 'astro/zod';

/** "YYYY-MM" */
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Expected YYYY-MM');
const endMonth = z.union([month, z.literal('present')]);

/** "YYYY-MM" strings sort lexicographically, so a plain comparison orders them. */
const endsAfterStart = (v: { start: string; end: string }): boolean =>
  v.end === 'present' || v.end >= v.start;
const RANGE_ERROR = { message: 'end must not be before start', path: ['end'] };

// Every object is strict: a typo in a content file fails the build instead of being dropped.
const link = z.strictObject({
  label: z.string().min(1),
  href: z.string().min(1),
  external: z.boolean().default(true),
});

export const profileSchema = z.strictObject({
  name: z.string(),
  role: z.string(),
  headline: z.string(),
  headlineAccent: z.string(),
  summary: z.string(),
  availability: z.strictObject({ research: z.string(), fullTime: z.string() }),
  links: z.strictObject({
    github: z.url(),
    linkedin: z.url(),
    email: z.email(),
    resume: z.string(),
  }),
  /** Typed, not derived: these cannot be computed from the data files. */
  stats: z.strictObject({ years: z.string(), customers: z.string() }),
});

export const experienceSchema = z
  .strictObject({
    id: z.string(),
    company: z.string(),
    role: z.string(),
    kind: z.enum(['industry', 'research']),
    start: month,
    end: endMonth,
    logo: z.string(),
    achievements: z.array(z.string().min(1)).min(1),
    tags: z.array(z.string()),
  })
  .refine(endsAfterStart, RANGE_ERROR);

export const projectSchema = z
  .strictObject({
    id: z.string(),
    title: z.string(),
    status: z.enum(['active', 'shipped', 'paused']),
    statusLabel: z.string().optional(),
    start: month,
    end: endMonth,
    summary: z.string(),
    role: z.string().optional(),
    award: z.string().optional(),
    note: z.string().optional(),
    featured: z.boolean().default(false),
    image: z.string(),
    imageAlt: z.string(),
    /** Diagrams ("contain") are shown whole on `imageBg`; photos ("cover") fill the frame. */
    imageFit: z.enum(['cover', 'contain']).default('cover'),
    imageBg: z.string().optional(),
    tags: z.array(z.string()),
    links: z.array(link).default([]),
    team: z.array(z.string()).default([]),
    action: z.enum(['open-chat']).optional(),
  })
  .refine(endsAfterStart, RANGE_ERROR);

/** Strict, so a stray `title` or `authors` key fails validation (papers are under review). */
export const researchSchema = z.strictObject({
  id: z.string(),
  status: z.enum(['under-review', 'in-preparation']),
  venue: z.string(),
  topic: z.string(),
});

export const skillItemSchema = z.strictObject({
  name: z.string().min(1),
  /** Key into the brand-icon registry (src/lib/icons.ts); omitted when no mark exists. */
  icon: z.string().optional(),
});

export const skillTierSchema = z.strictObject({
  id: z.enum(['daily', 'working', 'earlier']),
  title: z.string(),
  caption: z.string(),
  items: z.array(skillItemSchema).min(1),
});

export const educationSchema = z
  .strictObject({
    id: z.string(),
    school: z.string(),
    location: z.string(),
    logo: z.string(),
    start: month,
    end: month,
    endLabel: z.string().optional(),
    bullets: z.array(z.string()).length(3),
  })
  .refine(endsAfterStart, RANGE_ERROR);

export const testimonialSchema = z.strictObject({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  org: z.string(),
  quote: z.string(),
  photo: z.string(),
  logo: z.string(),
});

/** An array of `item`s whose `id`s must be unique (ids become DOM ids for tabs and panels). */
export function collection<T extends z.ZodType<{ id: string }>>(item: T) {
  return z.array(item).superRefine((items, ctx) => {
    const seen = new Set<string>();
    items.forEach((entry, index) => {
      if (seen.has(entry.id)) {
        ctx.addIssue({
          code: 'custom',
          message: `Duplicate id "${entry.id}"`,
          path: [index, 'id'],
        });
      }
      seen.add(entry.id);
    });
  });
}

export type Profile = z.infer<typeof profileSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Research = z.infer<typeof researchSchema>;
export type SkillItem = z.infer<typeof skillItemSchema>;
export type SkillTier = z.infer<typeof skillTierSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Testimonial = z.infer<typeof testimonialSchema>;
