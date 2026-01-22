import { defineField } from 'sanity'
import { toPlainText } from '../../utils/to-plain-text'
import sectionId from '../ui/sectionId'

const name = 'ContactForm'
const title = 'Contact Form'
const icon = () => '📝'

export default defineField({
  name,
  type: 'object',
  title,
  icon,
  fields: [
    defineField({
      name: 'showMessage',
      type: 'boolean',
      title: 'Show Message Field',
      description: 'If enabled, a message textarea will be shown in the form.',
      initialValue: false,
    }),
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
      name: 'paragraph',
      type: 'PortableText',
      title: 'Paragraph',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'badge',
      type: 'object',
      title: 'Badge',
      fields: [
        defineField({
          name: 'icon',
          type: 'image',
          title: 'Icon',
          options: {
            accept: 'image/svg+xml',
          },
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'text',
          type: 'string',
          title: 'Text',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'formStates',
      type: 'object',
      title: 'Form States',
      fields: [
        defineField({
          name: 'success',
          type: 'object',
          title: 'Success',
          options: {
            collapsed: false,
            collapsible: false,
          },
          fields: [
            defineField({
              name: 'heading',
              type: 'Heading',
              title: 'Heading',
              validation: (Rule) => Rule.required(),
              initialValue: [
                {
                  _type: 'block',
                  style: 'normal',
                  children: [{ _type: 'span', text: 'Pomyślnie wysłano wiadomość' }],
                },
              ],
            }),
            defineField({
              name: 'paragraph',
              type: 'PortableText',
              title: 'Paragraph',
              validation: (Rule) => Rule.required(),
              initialValue: [
                {
                  _type: 'block',
                  style: 'normal',
                  children: [
                    {
                      _type: 'span',
                      text: 'Odpowiemy najszybciej jak to będzie możliwe.',
                    },
                  ],
                },
              ],
            }),
          ],
        }),
        defineField({
          name: 'error',
          type: 'object',
          title: 'Error',
          options: {
            collapsed: false,
            collapsible: false,
          },
          fields: [
            defineField({
              name: 'heading',
              type: 'Heading',
              title: 'Heading',
              validation: (Rule) => Rule.required(),
              initialValue: [
                {
                  _type: 'block',
                  style: 'normal',
                  children: [{ _type: 'span', text: 'Wiadomość nie została wysłana' }],
                },
              ],
            }),
            defineField({
              name: 'paragraph',
              type: 'PortableText',
              title: 'Paragraph',
              validation: (Rule) => Rule.required(),
              initialValue: [
                {
                  _type: 'block',
                  style: 'normal',
                  children: [{ _type: 'span', text: 'Spróbuj ponownie lub skontaktuj się z nami telefonicznie.' }],
                },
              ],
            }),
          ],
        }),
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
