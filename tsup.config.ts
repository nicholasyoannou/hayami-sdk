import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    types: 'src/types.ts',
    'reddit/index': 'src/providers/reddit/index.ts',
    'anilist/index': 'src/providers/anilist/index.ts',
    'mal/index': 'src/providers/mal/index.ts',
    'youtube/index': 'src/providers/youtube/index.ts',
    'forum/index': 'src/providers/forum/index.ts',
    'animecommunity/index': 'src/providers/animecommunity/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  treeshake: true,
  splitting: true,
})
