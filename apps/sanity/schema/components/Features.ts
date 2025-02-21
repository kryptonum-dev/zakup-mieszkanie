import { defineField } from 'sanity'
import { toPlainText } from '../../utils/to-plain-text'
import sectionId from '../ui/sectionId'

const name = 'Features'
const title = 'Features'
const icon = () => '✨'

export default defineField({
  name,
  type: 'object',
  title,
  icon,
  fields: [
    defineField({
      name: 'heading',
      type: 'Heading',
      title: 'Heading',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'features',
      type: 'array',
      title: 'Features',
      validation: (Rule) => Rule.required().max(6),
      of: [
        {
          type: 'object',
          name: 'feature',
          fields: [
            {
              name: 'icon',
              type: 'image',
              title: 'Icon (SVG)',
              options: {
                accept: '.svg',
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'heading',
              type: 'Heading',
              title: 'Heading',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'paragraph',
              type: 'PortableText',
              title: 'Paragraph',
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              title: 'heading',
              subtitle: 'paragraph',
              media: 'icon',
            },
          },
        },
      ],
    }),
    ...sectionId,
  ],
  preview: {
    select: {
      heading: 'heading',
    },
    prepare: ({ heading }) => ({
      title: title,
      subtitle: toPlainText(heading),
      media: icon,
    }),
  },
})
