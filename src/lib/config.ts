/**
 * Third-party endpoints, defined once. Components use the URLs; the Content-Security-Policy in
 * layouts/Base.astro derives its origins from the same constants so the two can never disagree.
 */
export const AI_URL = 'https://personal-ai-delta.vercel.app/';
export const AI_ORIGIN = new URL(AI_URL).origin;

export const FORM_ENDPOINT = 'https://formspree.io/f/mpzkqegp';
export const FORM_ORIGIN = new URL(FORM_ENDPOINT).origin;
