import { defineField } from 'sanity'
import { toPlainText } from '../../utils/to-plain-text'
import sectionId from '../ui/sectionId'

const name = 'Benefits'
const title = 'Benefits'
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
      validation: (Rule) => Rule.required().max(4),
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
      validation: (Rule) => Rule.required().min(1),
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
