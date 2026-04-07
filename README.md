# nuqs-storybook-adapter

Nuqs v2 adapter compatible with Storybook’s Next.js integration (for example `@storybook/nextjs-vite`), which provides a mock App Router and `useSearchParams()`.

## Installation

Peer dependencies: `nuqs` v2 and `next` (App Router APIs used under the hood).

```bash
npm install nuqs-storybook-adapter
# or: pnpm / yarn / bun add nuqs-storybook-adapter
```

## Usage

Configure Storybook with a Next.js framework preset so `next/navigation` works in stories. Set the initial URL or search params the way that preset documents (for example `nextjs.navigation` parameters on a story) so the adapter can seed state from the mock router.

### Decorator (global preview)

In `.storybook/preview.tsx`, register the helper so every story runs inside the adapter:

```tsx
import type { Preview } from '@storybook/react';
import { withNuqsStorybookAdapter } from 'nuqs-storybook-adapter';

const preview: Preview = {
  decorators: [withNuqsStorybookAdapter()],
};

export default preview;
```

You can pass the same optional props the underlying nuqs provider accepts (for example `defaultOptions` or `processUrlSearchParams`), without `children`:

```tsx
decorators: [
  withNuqsStorybookAdapter({
    defaultOptions: { shallow: true },
  }),
];
```

### Provider (per-story or custom decorator)

Use `NuqsStorybookAdapter` when you prefer an explicit wrapper:

```tsx
import { NuqsStorybookAdapter } from 'nuqs-storybook-adapter';

export const decorators = [
  (Story) => (
    <NuqsStorybookAdapter>
      <Story />
    </NuqsStorybookAdapter>
  ),
];
```

Optional props match nuqs’s custom adapter provider (again, besides `children`):

```tsx
<NuqsStorybookAdapter defaultOptions={{ scroll: false }}>
  <Story />
</NuqsStorybookAdapter>
```

## Development

This library is built with [Bunup](https://bunup.dev/), which wraps [Bun’s bundler](https://bun.sh/docs/bundler) for TypeScript libraries (ESM output and `.d.ts` in `dist/`).

After `bun install`, produce a release build with:

```bash
bun run build
```

Do **not** run plain `bun build` with no arguments: that is Bun’s CLI and expects explicit entrypoint files (see `bun build --help`). The npm script `build` runs `bunup` instead.

Bunup currently requires **Bun 1.3.6 or newer**; upgrade with `bun upgrade` if `bun run build` reports a version error.

## Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## License

MIT
