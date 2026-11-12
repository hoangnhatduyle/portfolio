import type { Experience, Profile, Research } from './schemas';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface Stats {
  readonly years: string;
  readonly employers: number;
  readonly customers: string;
  readonly papers: number;
}

function formatMonth(value: string): string {
  const [year, month] = value.split('-');
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

/** "2025-02","2026-05" -> "Feb 2025 – May 2026"; a single month collapses to "Nov 2026". */
export function formatPeriod(start: string, end: string): string {
  if (start === end) return formatMonth(start);
  return `${formatMonth(start)} – ${end === 'present' ? 'Present' : formatMonth(end)}`;
}

/** Employers and papers are derived from the data so they cannot drift from the lists. */
export function computeStats(
  profile: Profile,
  experience: readonly Experience[],
  research: readonly Research[],
): Stats {
  return {
    years: profile.stats.years,
    employers: new Set(experience.filter((e) => e.kind === 'industry').map((e) => e.company)).size,
    customers: profile.stats.customers,
    papers: research.length,
  };
}
