// Anything with a scheme (https:, mailto:, tel:), a protocol-relative "//host", or a "#fragment".
const PASS_THROUGH = /^([a-z][a-z0-9+.-]*:|\/\/|#)/i;

/** Join a deploy base ("/portfolio" or "/portfolio/") with a site-relative path. */
export function joinBase(base: string, path: string): string {
  if (PASS_THROUGH.test(path)) return path;
  const normalized = base.endsWith('/') ? base : `${base}/`;
  return `${normalized}${path.replace(/^\/+/, '')}`;
}

/** Prefix a site-relative path with the deploy base ("/portfolio/"). External URLs pass through. */
export function withBase(path: string): string {
  return joinBase(import.meta.env.BASE_URL, path);
}

export function isExternal(path: string): boolean {
  return /^(https?:)?\/\//i.test(path);
}
