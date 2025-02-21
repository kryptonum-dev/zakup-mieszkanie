import { Box, Text, Tooltip } from '@sanity/ui'
import { defineField, defineType } from 'sanity'
import { isValidUrl } from '../../utils/is-valid-url'

const name = 'cta'
const title = 'Call To Action (CTA)'
const icon = () => '🗣️'

export default defineType({
  name,
  type: 'object',
  title,
  icon,
  fields: [
    defineField({
      name: 'text',
      type: 'string',
      title: 'Text',
      description: 'The text that will be displayed on the button.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'theme',
      type: 'string',
      title: 'Theme',
      description: (
        <>
          <em>Primary</em> (main button) or <em>Secondary</em> (less important)
        </>
      ),
      options: {
        list: ['primary', 'secondary'],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'primary',
      validation: (Rule) => Rule.required(),
      fieldset: 'style',
    }),
    defineField({
      name: 'href',
      type: 'string',
      title: 'URL',
      description:
        'Enter a URL. Use full URLs starting with "https://" for external links, or start with "/" for internal pages.',
      validation: (Rule) => [
        Rule.required(),
        Rule.custom((value) => {
          if (!value) return 'URL is required'
          if (
            !value.startsWith('https://') &&
            !value.startsWith('mailto:') &&
            !value.startsWith('tel:') &&
            !value.startsWith('/')
          ) {
            return 'Link must start with "https://", "mailto:", "tel:" or "/" for internal pages'
          }
          if (!value.startsWith('/') && !isValidUrl(value)) return 'Invalid URL'
          return true
        }),
      ],
    }),
  ],
  fieldsets: [
    {
      name: 'style',
      title: 'Style',
      options: {
        columns: 2,
      },
    },
  ],
  preview: {
    select: {
      title: 'text',
      theme: 'theme',
      href: 'href',
    },
    prepare({ title, theme, href }) {
      return {
        title: `${title}`,
        subtitle: href,
        media: () => (
          <Tooltip
            content={
              <Box padding={1}>
                <Text size={1}>{theme === 'primary' ? 'Primary button' : 'Secondary button'}</Text>
              </Box>
            }
            placement="top"
            portal
          >
            <span>{icon()}</span>
          </Tooltip>
        ),
      }
    },
  },
})
