import { defineField } from 'sanity'
import { toPlainText } from '../../utils/to-plain-text'
import sectionId from '../ui/sectionId'

const name = 'Faq'
const title = 'FAQ'
const icon = () => '❓'

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
      name: 'paragraph',
      type: 'PortableText',
      title: 'Paragraph',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'cta',
      type: 'cta',
      title: 'Call To Action',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'faqItems',
      type: 'array',
      title: 'FAQ Items',
      validation: (Rule) => Rule.required().min(1),
      of: [
        {
          type: 'object',
          name: 'faqItem',
          fields: [
            {
              name: 'question',
              type: 'string',
              title: 'Question',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'answer',
              type: 'PortableText',
              title: 'Answer',
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              title: 'question',
              subtitle: 'answer',
            },
            prepare: ({ title, subtitle }) => ({
              title,
              subtitle: toPlainText(subtitle),
              media: icon,
            }),
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
