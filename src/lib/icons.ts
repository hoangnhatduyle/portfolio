import {
  siAngular,
  siCplusplus,
  siDocker,
  siDotnet,
  siFastapi,
  siJavascript,
  siKubernetes,
  siOpenjdk,
  siPhp,
  siPostgresql,
  siPython,
  siReact,
  siRedis,
  siTypescript,
} from 'simple-icons';

/**
 * Brand marks (simple-icons, CC0) as SVG path data. They are inlined into the HTML at build time,
 * so there is no runtime request and no client-side JavaScript. Azure and SQL Server have no mark in
 * the open set; skills without an `icon` key simply render as text-only chips.
 */
const ICONS: Readonly<Record<string, string>> = {
  angular: siAngular.path,
  cplusplus: siCplusplus.path,
  docker: siDocker.path,
  dotnet: siDotnet.path,
  fastapi: siFastapi.path,
  java: siOpenjdk.path,
  javascript: siJavascript.path,
  kubernetes: siKubernetes.path,
  php: siPhp.path,
  postgresql: siPostgresql.path,
  python: siPython.path,
  react: siReact.path,
  redis: siRedis.path,
  typescript: siTypescript.path,
};

/** SVG path for an icon key, or null when the key is missing or unknown. */
export function iconPath(name: string | undefined): string | null {
  return name !== undefined && Object.hasOwn(ICONS, name) ? ICONS[name] : null;
}
