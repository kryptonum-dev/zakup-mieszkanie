import { defineType } from 'sanity'

export default defineType({
  name: 'components',
  type: 'array',
  title: 'Components',
  description:
    'Build your page by adding customizable components. Drag and drop to reorder, each component renders sequentially to create your landing page layout.',
  of: [],
  options: {
    insertMenu: {
      filter: true,
      showIcons: true,
      views: [
        { name: 'grid', previewImageUrl: (schemaTypeName) => `/static/${schemaTypeName}.webp` },
        { name: 'list' },
      ],
    },
  },
})
