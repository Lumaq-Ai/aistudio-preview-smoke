const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Static preview (web export with EXPO_PUBLIC_PREVIEW=1 only): the AI Studio
// review bridge treats every history.pushState/replaceState as a document
// change. Swap two expo-router internals for preview shims so the router reads
// its route from the page and never touches the History API.
const PREVIEW_SHIMS = {
  'expo-router/build/qualified-entry': path.resolve(__dirname, 'src/preview/PreviewEntry.tsx'),
  './useLinking': path.resolve(__dirname, 'src/preview/staticLinking.ts'),
};

if (process.env.EXPO_PUBLIC_PREVIEW === '1') {
  const upstream = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    const shim = PREVIEW_SHIMS[moduleName];
    const fromRouter = moduleName === './useLinking'
      ? context.originModulePath.endsWith(path.join('expo-router', 'build', 'fork', 'NavigationContainer.js'))
      : true;
    if (platform === 'web' && shim && fromRouter) return { type: 'sourceFile', filePath: shim };
    return upstream ? upstream(context, moduleName, platform) : context.resolveRequest(context, moduleName, platform);
  };
}

module.exports = config;
