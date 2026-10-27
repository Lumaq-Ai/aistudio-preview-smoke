// The route a static preview page renders. scripts/preview-pages.mjs writes it
// into each page as <meta name="aistudio-preview-route">; without the tag
// (dev server, normal hosting) the browser location is used as usual.
export const PREVIEW_ROUTE_META = 'aistudio-preview-route';
const SAFE_ROUTE = /^\/(?:[A-Za-z0-9._~-]+(?:\/[A-Za-z0-9._~-]+)*)?$/;

export function readPreviewRoute(doc: Pick<Document, 'querySelector'> | undefined): string | undefined {
  const value = doc?.querySelector(`meta[name="${PREVIEW_ROUTE_META}"]`)?.getAttribute('content') ?? undefined;
  return value && SAFE_ROUTE.test(value) && !value.split('/').includes('..') ? value : undefined;
}
