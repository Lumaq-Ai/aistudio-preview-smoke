import { defineConfig } from 'vite';

// Relative base: the artifact is served under /artifacts/<deployment>/<checksum>/.
export default defineConfig({ base: './' });
