import { defineConfig } from 'bunup';

export default defineConfig({
	entry: ['src/index.ts'],
	external: ['react', 'react-dom', 'next', 'nuqs'],
	dts: true,
});
