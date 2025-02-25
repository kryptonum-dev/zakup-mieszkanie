import { defineType } from 'sanity'
import ContactForm from './components/ContactForm'
import ContactImage from './components/ContactImage'
import Faq from './components/Faq'
import Features from './components/Features'
import HeroSection from './components/HeroSection'
import Process from './components/Process'
import SimpleColumn from './components/SimpleColumn'

export default defineType({
  name: 'components',
  type: 'array',
  title: 'Components',
  description: 'Build your page by adding customizable components. Drag and drop to reorder, each component renders sequentially to create your landing page layout.',
  of: [
    HeroSection,
    SimpleColumn,
    Features,
    Process,
    ContactImage,
    Faq,
    ContactForm
  ],
  options: {
    insertMenu: {
      filter: true,
      showIcons: true,
      views: [
        { name: 'grid', previewImageUrl: (schemaTypeName) => `/static/${schemaTypeName}.webp` },
        { name: 'list' },
      ],
    },
  },
})
