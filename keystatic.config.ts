import { config, fields, collection, singleton } from '@keystatic/core';

export default config({
  // Use local storage in development to save files to the local file system.
  // Note: For a pure Vite React SPA, 'local' storage requires running the Keystatic CLI locally,
  // otherwise you can use 'github' storage.
  storage: {
    kind: 'local',
  },
  singletons: {
    settings: singleton({
      label: 'Configurações do Site',
      path: 'src/content/settings',
      format: 'json',
      schema: {
        languages: fields.array(
          fields.object({
            code: fields.text({ label: 'Código do Idioma (ex: pt, en)' }),
            label: fields.text({ label: 'Rótulo (ex: PT, EN)' }),
          }),
          {
            label: 'Idiomas Suportados',
            itemLabel: props => props.fields.label.value || 'Novo Idioma',
          }
        ),
        topHeader: fields.object({
          leftLinks: fields.array(
            fields.object({
              label: fields.text({ label: 'Rótulo do Link' }),
              url: fields.text({ label: 'URL do Link' }),
            }),
            { label: 'Links da Esquerda', itemLabel: props => props.fields.label.value || 'Link' }
          ),
          rightLinks: fields.array(
            fields.object({
              label: fields.text({ label: 'Rótulo do Link' }),
              url: fields.text({ label: 'URL do Link' }),
            }),
            { label: 'Links da Direita (ex: Apoio ao Cliente)', itemLabel: props => props.fields.label.value || 'Link' }
          ),
        }),
      },
    }),
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
