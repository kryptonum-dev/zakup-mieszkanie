import { defineField } from 'sanity'
import { toPlainText } from '../../utils/to-plain-text'
import sectionId from '../ui/sectionId'

const name = 'VideoPlayer'
const title = 'Video Player'
const icon = () => '🎬'

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
      name: 'video',
      type: 'file',
      title: 'Video File',
      description: 'Upload a video file (MP4, WebM recommended)',
      options: {
        accept: 'video/mp4,video/webm',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'poster',
      type: 'image',
      title: 'Poster Image (optional)',
      description: 'Thumbnail shown before video playback starts',
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
