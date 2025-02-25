import { defineField } from 'sanity'
import { toPlainText } from '../../utils/to-plain-text'
import sectionId from '../ui/sectionId'

const name = 'SimpleColumn'
const title = 'Simple Column'
const icon = () => '🗂️'

export default defineField({
  name,
  type: 'object',
  title,
  icon,
  fields: [
    defineField({
      name: 'isReversed',
      type: 'boolean',
      title: 'Is Reversed?',
      description: 'If true, the column will be reversed. Initially the image will be on the right. If that will be reversed, the image will be on the left.',
      initialValue: false,
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'label',
      type: 'string',
      title: 'Label',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'heading',
      type: 'Heading',
      title: 'Heading',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'paragraph',
      type: 'PortableText',
      title: 'Paragraph',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'cta',
      type: 'cta',
      title: 'Call To Action',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Image',
      validation: Rule => Rule.required(),
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
