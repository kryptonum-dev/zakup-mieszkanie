import { defineField, defineType } from 'sanity'
import { defineSlugForDocument } from '../../utils/define-slug-for-document'

const icon = () => '📄'

export default defineType({
  name: 'page',
  title: 'Landing',
  type: 'document',
  icon,
  options: { documentPreview: true },
  fields: [
    defineField({
      name: 'localSettings',
      title: 'Local Settings',
      description: 'Override global settings specifically for this page',
      type: 'object',
      group: 'localSettings',
      options: { collapsible: true },
      fields: [
        defineField({
          name: 'email',
          type: 'string',
          title: 'Email',
          validation: (Rule) => Rule.email(),
        }),
        defineField({
          name: 'tel',
          type: 'string',
          title: 'Phone number (optional)',
        }),
        defineField({
          name: 'header',
          type: 'object',
          title: 'Header Configuration',
          options: { collapsible: true },
          fields: [
            defineField({
              name: 'navigation',
              type: 'array',
              title: 'Navigation Links',
              validation: (Rule) => Rule.required().max(4),
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'text',
                      type: 'string',
                      title: 'Link Text',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'href',
                      type: 'string',
                      title: 'URL',
                      description:
                        'Use full URLs starting with "https://" for external links, or start with "/" for internal pages.',
                      validation: (Rule) => [
                        Rule.required(),
                        Rule.custom((value) => {
                          if (!value) return 'URL is required'
                          if (!value.startsWith('https://') && !value.startsWith('/') && !value.startsWith('#')) {
                            return 'Link must start with "https://", "/" for internal pages, or "#" for section links'
                          }
                          return true
                        }),
                      ],
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'text',
                      subtitle: 'href',
                    },
                    prepare({ title, subtitle }) {
                      return {
                        title,
                        subtitle,
                        media: () => '🔗',
                      }
                    },
                  },
                },
              ],
            }),
            defineField({
              name: 'cta',
              type: 'cta',
              title: 'CTA Button',
              options: {
                collapsible: false,
              },
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'name',
      type: 'string',
      title: 'Name',
      description: 'Individual name for this landing page, used for Sanity Display Name',
      validation: (Rule) => Rule.required(),
      group: 'content',
    }),
    ...defineSlugForDocument({ source: 'name' }).map((field) => ({ ...field, group: 'content' })),
    defineField({
      name: 'components',
      type: 'components',
      title: 'Page Components',
      group: 'content',
    }),
    defineField({
      name: 'seo',
      type: 'seo',
      title: 'SEO',
      group: 'content',
    }),
  ],
  groups: [
    {
      name: 'localSettings',
      title: '⚙️ Local Settings',
    },
    {
      name: 'content',
      title: '📝 Content',
    },
  ],
  preview: {
    select: {
      title: 'seo.title',
      slug: 'slug.current',
    },
    prepare({ title, slug }) {
      return {
        title,
        subtitle: slug,
        icon,
      }
    },
  },
})
