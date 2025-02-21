import { defineField } from 'sanity'
import { toPlainText } from '../../utils/to-plain-text'
import sectionId from '../ui/sectionId'

const name = 'Process'
const title = 'Process'
const icon = () => '📋'

export default defineField({
  name,
  type: 'object',
  title,
  icon,
  fields: [
    defineField({
      name: 'label',
      type: 'string',
      title: 'Label',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heading',
      type: 'Heading',
      title: 'Heading',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'cta',
      type: 'cta',
      title: 'Call To Action',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'steps',
      type: 'array',
      title: 'Process Steps',
      validation: (Rule) => Rule.required().length(4),
      of: [
        {
          type: 'object',
          name: 'step',
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
