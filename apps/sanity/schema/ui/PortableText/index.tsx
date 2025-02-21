import { defineField } from 'sanity'
import { isValidUrl } from '../../../utils/is-valid-url'
import { CustomInput } from './CustomInput'

export const PortableText = ({
  name,
  title,
  allowHeadings = false,
}: {
  name?: string
  title?: string
  allowHeadings?: boolean
}) =>
  defineField({
    name: name || 'PortableText',
    type: 'array',
    title: title || 'Portable Text',
    components: {
      // @ts-ignore
      input: CustomInput,
    },
    of: [
      {
        type: 'block',
        styles: [
          { title: 'Normal', value: 'normal' },
          ...(allowHeadings
            ? [
                { title: 'Heading 2', value: 'h2' },
                { title: 'Heading 3', value: 'h3' },
              ]
            : []),
        ],
        lists: [
          { title: 'Bullet', value: 'bullet' },
          { title: 'Numbered', value: 'number' },
        ],
        marks: {
          decorators: [
            { title: 'Strong', value: 'strong' },
            { title: 'Emphasis', value: 'em' },
          ],
          annotations: [
            defineField({
              name: 'link',
              type: 'object',
              title: 'Link',
              icon: () => '🔗',
              fields: [
                defineField({
                  name: 'href',
                  type: 'string',
                  title: 'URL',
                  description:
                    'Enter a URL. Use full URLs starting with "https://" for external links, or start with "/" for internal pages.',
                  validation: (Rule) => [
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
            }),
          ],
        },
      },
    ],
  })

export default PortableText({})
