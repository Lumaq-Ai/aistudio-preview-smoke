// The route a static preview page renders. scripts/preview-pages.mjs writes it
// into each page as <meta name="aistudio-preview-route">; without the tag
// (dev server, normal hosting) the browser location is used as usual.
export const PREVIEW_ROUTE_META = 'aistudio-preview-route';
const SAFE_ROUTE = /^\/(?:[A-Za-z0-9._~-]+(?:\/[A-Za-z0-9._~-]+)*)?$/;

function isSafeRoute(value: string): boolean {
  return SAFE_ROUTE.test(value) && !value.split('/').some((segment) => segment === '.' || segment === '..');
}

export function readPreviewRoute(doc: Pick<Document, 'querySelector'> | undefined): string | undefined {
  const value = doc?.querySelector(`meta[name="${PREVIEW_ROUTE_META}"]`)?.getAttribute('content') ?? undefined;
  return value && isSafeRoute(value) ? value : undefined;
}

// A present but invalid tag must not silently fall back to the URL (that would
// render the not-found screen as if it were valid): fail the boot instead, which
// the bridge reports as an invalidated document (fail-closed).
export function requirePreviewRoute(doc: Pick<Document, 'querySelector'> | undefined): string | undefined {
  const tag = doc?.querySelector(`meta[name="${PREVIEW_ROUTE_META}"]`);
  if (!tag) return undefined;
  const route = readPreviewRoute(doc);
  if (!route) throw new Error('Invalid aistudio-preview-route tag');
  return route;
}
