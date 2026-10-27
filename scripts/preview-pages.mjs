#!/usr/bin/env node
// Post-export step for the AI Studio static preview (offline, no dependencies).
//
// The secure preview pipeline serves an artifact from
// /artifacts/{deploymentId}/{digest}/ with exact-file lookups only (no SPA
// fallback, no directory index below the root). The digest is computed from
// the build output, so the export cannot know its own base path. This step:
//   1. replaces the placeholder base path baked in by app.config (experiments.baseUrl) with
//      relative URLs (HTML/JS: resolved against the page's <base>, CSS:
//      relative to the stylesheet itself);
//   2. writes one HTML page per screen of .studio/design-screens.json
//      ("/" -> index.html, "/a/b" -> a/b.html), each with a <base> pointing at
//      the artifact root and the route the router must render.
//
// Usage: node scripts/preview-pages.mjs <distDir> <design-screens.json>
import { readFile, readdir, writeFile, mkdir, lstat } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const BASE_TOKEN = '/__aistudio_preview_base__';
export const ROUTE_META = 'aistudio-preview-route';
const SEGMENT = /^[A-Za-z0-9._~-]+$/;
const REWRITTEN = new Set(['.html', '.js', '.css']);
// Set by the preview-only Metro shims (src/preview/web). If an expo-router upgrade
// moves the redirected modules, the shims stop applying silently and the router
// calls the History API again; fail the build instead.
export const SHIM_MARKERS = ['__aistudioPreviewEntry', '__aistudioStaticLinking'];

export function routeFile(route) {
  if (typeof route !== 'string' || !route.startsWith('/')) throw new Error(`Invalid route: ${route}`);
  if (route === '/') return 'index.html';
  const segments = route.slice(1).split('/');
  if (segments.some(s => !SEGMENT.test(s) || s === '.' || s === '..')) throw new Error(`Unsafe route: ${route}`);
  if (segments.length === 1 && segments[0] === 'index') throw new Error('Use "/" instead of "/index"');
  return `${segments.join('/')}.html`;
}

export function baseHref(file) {
  const depth = file.split('/').length - 1;
  return depth === 0 ? './' : '../'.repeat(depth);
}

export function rewriteBase(content, kind, fileFromRoot) {
  const prefix = kind === '.css' ? baseHref(fileFromRoot) : '';
  return content.replaceAll(`${BASE_TOKEN}/`, prefix).replaceAll(BASE_TOKEN, '');
}

export function routePage(template, route) {
  const file = routeFile(route);
  const head = /<head(\s[^>]*)?>/i.exec(template);
  if (!head) throw new Error('index.html has no <head>');
  const end = head.index + head[0].length;
  const tags = `<base href="${baseHref(file)}"><meta name="${ROUTE_META}" content="${route}">`;
  return { file, html: `${template.slice(0, end)}${tags}${template.slice(end)}` };
}

export function readScreens(manifest) {
  const screens = manifest?.screens;
  if (!Array.isArray(screens) || screens.length === 0) throw new Error('design-screens.json has no screens');
  const files = new Map();
  for (const { route } of screens) {
    const file = routeFile(route);
    if (files.has(file) && files.get(file) !== route) throw new Error(`Routes collide on ${file}`);
    files.set(file, route);
  }
  return [...new Set(screens.map(s => s.route))];
}

async function regularFiles(root) {
  const entries = await readdir(root, { withFileTypes: true, recursive: true });
  return entries.filter(e => e.isFile()).map(e => join(e.parentPath ?? e.path, e.name));
}

export async function buildPreviewPages(dist, manifestPath) {
  const routes = readScreens(JSON.parse(await readFile(manifestPath, 'utf8')));
  let rewritten = 0;
  for (const path of await regularFiles(dist)) {
    const kind = path.slice(path.lastIndexOf('.'));
    if (!REWRITTEN.has(kind)) continue;
    const content = await readFile(path, 'utf8');
    if (!content.includes(BASE_TOKEN)) continue;
    await writeFile(path, rewriteBase(content, kind, relative(dist, path).split(sep).join('/')));
    rewritten++;
  }
  if (rewritten === 0) throw new Error(`No ${BASE_TOKEN} found: was the export run with EXPO_PUBLIC_PREVIEW=1?`);
  const scripts = (await regularFiles(dist)).filter(path => path.endsWith('.js'));
  const bundle = (await Promise.all(scripts.map(path => readFile(path, 'utf8')))).join('\n');
  const missing = SHIM_MARKERS.filter(marker => !bundle.includes(marker));
  if (missing.length) throw new Error(`Preview router shims not bundled (${missing.join(', ')}): check metro.config.js`);
  const template = await readFile(join(dist, 'index.html'), 'utf8');
  for (const route of routes) {
    const { file, html } = routePage(template, route);
    const target = join(dist, file);
    if (file !== 'index.html' && await lstat(target).then(() => true, () => false)) throw new Error(`Refusing to overwrite ${file}`);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, html);
  }
  if (!routes.includes('/')) await writeFile(join(dist, 'index.html'), routePage(template, '/').html);
  for (const path of await regularFiles(dist)) {
    if (REWRITTEN.has(path.slice(path.lastIndexOf('.'))) && (await readFile(path, 'utf8')).includes(BASE_TOKEN)) throw new Error(`Placeholder left in ${path}`);
  }
  return routes.map(routeFile);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [dist, manifest] = process.argv.slice(2);
  if (!dist || !manifest) { process.stderr.write('usage: preview-pages.mjs <distDir> <design-screens.json>\n'); process.exit(2); }
  buildPreviewPages(dist, manifest)
    .then(files => process.stdout.write(`preview pages: ${files.join(', ')}\n`))
    .catch(error => { process.stderr.write(`preview-pages: ${error.message}\n`); process.exit(1); });
}
