// Preview-only replacement for expo-router/build/qualified-entry (web).
// Same as upstream except that ExpoRoot receives the page's route explicitly,
// so the router never derives it from (or writes it back to) the URL.
import { ctx } from 'expo-router/_ctx';
import { ExpoRoot } from 'expo-router/build/ExpoRoot';
import { Head } from 'expo-router/build/head';
import { requirePreviewRoute } from './previewLocation';

const location = typeof document === 'undefined' ? undefined : requirePreviewRoute(document);

// scripts/preview-pages.mjs checks this marker is bundled (the shim really applied).
(globalThis as Record<string, unknown>).__aistudioPreviewEntry = true;

export function App() {
  return (
    <Head.Provider>
      <ExpoRoot context={ctx} location={location} />
    </Head.Provider>
  );
}
