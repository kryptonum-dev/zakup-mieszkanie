import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { media } from 'sanity-plugin-media'
import { structureTool } from 'sanity/structure'
import { structure } from './structure'
import { schemaTypes, singletonActions, singletonTypes } from './structure/schema-types'

export default defineConfig({
  name: 'default',
  title: 'Zakup Mieszkanie',
  projectId: 'euw0a8f3',
  dataset: 'production',
  apiVersion: '2025-02-26',

  plugins: [
    structureTool({ structure }),
    media(),
    visionTool()
  ],

  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },

  document: {
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({ action }) => action && singletonActions.has(action))
        : input,
  },
})
