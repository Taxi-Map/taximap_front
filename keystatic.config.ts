import { config, fields, collection } from '@keystatic/core';

export default config({
  // Use local storage in development to save files to the local file system.
  // Note: For a pure Vite React SPA, 'local' storage requires running the Keystatic CLI locally,
  // otherwise you can use 'github' storage.
  storage: {
    kind: 'local',
  },
  collections: {
    posts: collection({
      label: 'Artigos/Notícias',
      slugField: 'title',
      path: 'src/content/posts/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Título' } }),
        content: fields.markdoc({ label: 'Conteúdo' }),
      },
    }),
  },
});
