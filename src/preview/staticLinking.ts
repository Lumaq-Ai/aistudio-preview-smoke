// Preview-only replacement for expo-router/build/fork/useLinking (web).
// Linking is what mirrors router state into the URL (history.replaceState on
// mount, pushState on navigation). The static preview keeps the URL fixed:
// the initial route comes from the page (see PreviewEntry) and in-app
// navigation stays in memory.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const upstream = require('expo-router/build/fork/useLinking.js');

export const getInitialURLWithTimeout = upstream.getInitialURLWithTimeout;
export const series = upstream.series;

export function useLinking(ref: unknown, options: Record<string, unknown>, onUnhandledLinking: unknown) {
  return upstream.useLinking(ref, { ...options, enabled: false }, onUnhandledLinking);
}
