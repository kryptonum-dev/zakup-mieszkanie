import { defineField } from 'sanity'
import sectionId from '../ui/sectionId'

const name = 'ActionBar'
const title = 'Action Bar (Call/SMS)'
const icon = () => '📞'

export default defineField({
  name,
  type: 'object',
  title,
  icon,
  fields: [
    defineField({
      name: 'phoneNumber',
      type: 'string',
      title: 'Phone Number',
      description: 'Phone number for call/SMS buttons (e.g., +48502387352)',
      validation: (Rule) => Rule.required(),
      initialValue: '+48502387352',
    }),
    defineField({
      name: 'displayPhoneNumber',
      type: 'string',
      title: 'Display Phone Number',
      description: 'Formatted phone number shown to users (e.g., 502 387 352)',
      validation: (Rule) => Rule.required(),
      initialValue: '502 387 352',
    }),
    defineField({
      name: 'callButtonText',
      type: 'string',
      title: 'Call Button Text',
      validation: (Rule) => Rule.required(),
      initialValue: '📞 Zadzwoń teraz',
    }),
    defineField({
      name: 'smsButtonText',
      type: 'string',
      title: 'SMS Button Text',
      validation: (Rule) => Rule.required(),
      initialValue: '💬 Napisz SMS',
    }),
    defineField({
      name: 'contactLabel',
      type: 'string',
      title: 'Contact Label',
      description: 'Text shown above the phone number on desktop',
      validation: (Rule) => Rule.required(),
      initialValue: 'Bezpośredni kontakt:',
    }),
    ...sectionId,
  ],
  preview: {
    select: {
      phoneNumber: 'displayPhoneNumber',
    },
    prepare: ({ phoneNumber }) => ({
      title: title,
      subtitle: phoneNumber,
      media: icon,
    }),
  },
})
