import { defineField, defineType } from 'sanity'
import { toPlainText } from '../../utils/to-plain-text'

const title = 'FAQ Collection'
const icon = () => '❓'

export default defineType({
  name: 'Faq_Collection',
  type: 'document',
  title,
  icon,
  fields: [
    defineField({
      name: 'question',
      type: 'Heading',
      title: 'Question',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answer',
      type: 'PortableText',
      title: 'Answer',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'question',
      subtitle: 'answer',
    },
    prepare: ({ title, subtitle }) => ({
      title: toPlainText(title),
      subtitle: toPlainText(subtitle),
      icon,
    }),
  },
})
