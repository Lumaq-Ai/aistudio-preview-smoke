import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { BASE_TOKEN, baseHref, buildPreviewPages, readScreens, rewriteBase, routeFile, routePage } from './preview-pages.mjs';

test('routes map to exact html files', () => {
  assert.equal(routeFile('/'), 'index.html');
  assert.equal(routeFile('/about'), 'about.html');
  assert.equal(routeFile('/settings/profile'), 'settings/profile.html');
  for (const bad of ['about', '/../x', '/a//b', '/a/', '/a?b', '/a#b', '/%2e%2e', '/a b']) assert.throws(() => routeFile(bad));
});

test('base href climbs to the artifact root', () => {
  assert.equal(baseHref('index.html'), './');
  assert.equal(baseHref('about.html'), './');
  assert.equal(baseHref('settings/profile.html'), '../');
  assert.equal(baseHref('a/b/c.html'), '../../');
});

test('placeholder becomes page-relative in html/js and file-relative in css', () => {
  assert.equal(rewriteBase(`src="${BASE_TOKEN}/_expo/a.js"`, '.html', 'index.html'), 'src="_expo/a.js"');
  assert.equal(rewriteBase(`{uri:"${BASE_TOKEN}/assets/x.png"}`, '.js', '_expo/static/js/web/e.js'), '{uri:"assets/x.png"}');
  assert.equal(rewriteBase(`n="${BASE_TOKEN}"`, '.js', 'e.js'), 'n=""');
  assert.equal(rewriteBase(`url(${BASE_TOKEN}/assets/f.ttf)`, '.css', '_expo/static/css/w.css'), 'url(../../../assets/f.ttf)');
});

test('route page carries base and route before any other head content', () => {
  const { file, html } = routePage('<!DOCTYPE html><html><head lang="x"><title>t</title></head></html>', '/settings/profile');
  assert.equal(file, 'settings/profile.html');
  assert.match(html, /<head lang="x"><base href="\.\.\/"><meta name="aistudio-preview-route" content="\/settings\/profile"><title>/);
});

test('manifest routes must not collide', () => {
  assert.deepEqual(readScreens({ screens: [{ route: '/' }, { route: '/a' }, { route: '/a' }] }), ['/', '/a']);
  assert.throws(() => readScreens({ screens: [] }));
  assert.throws(() => readScreens({ screens: [{ route: '/a/' }] }));
});

test('buildPreviewPages writes every screen and leaves no placeholder', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'preview-pages-'));
  const dist = join(dir, 'dist');
  await mkdir(join(dist, '_expo'), { recursive: true });
  await writeFile(join(dist, 'index.html'), `<html><head><script src="${BASE_TOKEN}/_expo/e.js" defer></script></head><body></body></html>`);
  await writeFile(join(dist, '_expo', 'e.js'), `m.exports={uri:"${BASE_TOKEN}/assets/x.png"}`);
  await writeFile(join(dir, 'screens.json'), JSON.stringify({ version: 1, screens: [{ id: 'h', route: '/' }, { id: 'p', route: '/settings/profile' }] }));
  assert.deepEqual(await buildPreviewPages(dist, join(dir, 'screens.json')), ['index.html', 'settings/profile.html']);
  const page = await readFile(join(dist, 'settings', 'profile.html'), 'utf8');
  assert.match(page, /<base href="\.\.\/"><meta name="aistudio-preview-route" content="\/settings\/profile"><script src="_expo\/e\.js"/);
  assert.equal(await readFile(join(dist, '_expo', 'e.js'), 'utf8'), 'm.exports={uri:"assets/x.png"}');
  await assert.rejects(buildPreviewPages(dist, join(dir, 'screens.json')), /No \/__aistudio_preview_base__ found/);
});
