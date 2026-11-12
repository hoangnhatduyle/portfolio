import type { ImageMetadata } from 'astro';

const modules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/**/*.{png,jpg,jpeg,svg}',
  {
    eager: true,
  },
);

function buildIndex(): ReadonlyMap<string, ImageMetadata> {
  const index = new Map<string, ImageMetadata>();
  for (const [path, mod] of Object.entries(modules)) {
    const name = path.slice(path.lastIndexOf('/') + 1);
    // Content files refer to images by file name, so two files with one name would be ambiguous.
    if (index.has(name))
      throw new Error(`Duplicate image file name "${name}" in src/assets/ (${path})`);
    index.set(name, mod.default);
  }
  return index;
}

const byName = buildIndex();

/** Resolve a content-file image key (e.g. "aegis.svg") to its imported asset. Fails the build if missing. */
export function image(key: string): ImageMetadata {
  const found = byName.get(key);
  if (!found) throw new Error(`Missing image asset "${key}" in src/assets/`);
  return found;
}
