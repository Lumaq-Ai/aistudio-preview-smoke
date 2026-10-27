// Preview builds export with a unique placeholder base path. Every URL Expo
// bakes into HTML/JS/CSS then carries this token, and scripts/preview-pages.mjs
// turns it into a document-relative path. The artifact's real location
// (/artifacts/{deploymentId}/{digest}/) is unknown until after the build.
const PREVIEW_BASE = '/__aistudio_preview_base__';

module.exports = ({ config }) =>
  process.env.EXPO_PUBLIC_PREVIEW === '1'
    ? { ...config, experiments: { ...config.experiments, baseUrl: PREVIEW_BASE } }
    : config;
