import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'global',
  type: 'document',
  title: 'Global Settings',
  description:
    'Global settings will apply for all landing pages. If the landing local settings are set, they will take precedence.',
  icon: () => '🌍',
  fields: [
    defineField({
      name: 'email',
      type: 'string',
      title: 'Email',
      validation: (Rule) => Rule.required().email(),
      group: 'contact',
    }),
    defineField({
      name: 'tel',
      type: 'string',
      title: 'Phone number (optional)',
      group: 'contact',
    }),
    defineField({
      name: 'phoneWidget',
      type: 'object',
      title: 'Floating Phone Widget',
      group: 'contact',
      options: { collapsible: true },
      fields: [
        defineField({
          name: 'phoneNumber',
          type: 'string',
          title: 'Phone Number',
          description: 'Phone number for the floating widget (e.g., +48123456789)',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'tooltipText',
          type: 'string',
          title: 'Tooltip Text',
          description: 'Text shown on hover (e.g., "Skontaktuj się z ekspertem Krzysztofem Iwanem")',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'avatar',
          type: 'image',
          title: 'Avatar Image',
          description: 'Small circular image for the widget',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'videoTeasers',
          type: 'array',
          title: 'Video teasers',
          description: 'Short vertical video(s) used for the expanding teaser. Upload as File (format: .webm or .mp4).',
          of: [{ type: 'file', options: { accept: '.webm, .mp4' } }],
        }),
      ],
    }),
    defineField({
      name: 'socials',
      type: 'object',
      title: 'Social media',
      options: { collapsible: true },
      group: 'social',
      fields: [
        defineField({
          name: 'instagram',
          type: 'url',
          title: 'Instagram',
          validation: (Rule) => Rule.uri({ scheme: ['https'] }).error('Provide a valid URL (starting with https://)'),
        }),
        defineField({
          name: 'facebook',
          type: 'url',
          title: 'Facebook',
          validation: (Rule) => Rule.uri({ scheme: ['https'] }).error('Provide a valid URL (starting with https://)'),
        }),
        defineField({
          name: 'tiktok',
          type: 'url',
          title: 'TikTok',
          validation: (Rule) => Rule.uri({ scheme: ['https'] }).error('Provide a valid URL (starting with https://)'),
        }),
        defineField({
          name: 'linkedin',
          type: 'url',
          title: 'LinkedIn',
          validation: (Rule) => Rule.uri({ scheme: ['https'] }).error('Provide a valid URL (starting with https://)'),
        }),
      ],
    }),
    defineField({
      name: 'address',
      type: 'object',
      title: 'Address (optional)',
      options: { columns: 2, collapsible: true },
      group: 'address',
      fields: [
        defineField({
          name: 'street',
          type: 'string',
          title: 'Street',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'city',
          type: 'string',
          title: 'City',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'postalCode',
          type: 'string',
          title: 'Postal Code',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'country',
          type: 'string',
          title: 'Country Code',
          description: 'Use uppercase ISO 3166-1 country code (e.g., PL or POL)',
          validation: (Rule) =>
            Rule.required()
              .uppercase()
              .custom((value) => {
                if (!value) return true
                if (!/^[A-Z]{2,3}$/.test(value)) {
                  return 'Country code must be 2 or 3 uppercase letters (ISO 3166-1 Alpha-2 or Alpha-3)'
                }
                return true
              }),
        }),
      ],
    }),
    defineField({
      name: 'seo',
      type: 'object',
      title: 'Global SEO',
      validation: (Rule) => Rule.required(),
      group: 'seo',
      fields: [
        defineField({
          name: 'img',
          type: 'image',
          title: 'Social Share Image',
          validation: (Rule) => Rule.required(),
          description: (
            <>
              Social Share Image is visible when sharing website on social media. The dimensions of the image should be
              1200x630px. For maximum compatibility, use JPG or PNG formats, as WebP may not be supported everywhere. If
              this field is left empty, the image defined in <a href="/structure/global">global settings</a> will be
              used.
            </>
          ),
        }),
      ],
    }),
    defineField({
      name: 'OrganizationSchema',
      type: 'object',
      title: 'Organization structured data',
      validation: (Rule) => Rule.required(),
      group: 'organization',
      description: (
        <>
          Learn more about{' '}
          <a
            href="https://developers.google.com/search/docs/appearance/structured-data/organization?hl=en"
            target="_blank"
            rel="noreferrer"
          >
            Organization structured data
          </a>
        </>
      ),
      options: { collapsible: true },
      fields: [
        defineField({
          name: 'name',
          type: 'string',
          title: 'Name',
          description: 'Enter the name of your organization as you want it to appear in search results.',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'description',
          type: 'text',
          rows: 3,
          title: 'Description',
          description: 'A brief description of your organization that will appear in search results.',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'businessDetails',
          type: 'object',
          title: 'Business Details (optional)',
          description:
            "Additional business information that enhances your organization's visibility in search results and builds trust with potential customers. While optional, providing these details can significantly improve your SEO ranking.",
          options: { collapsible: true },
          fields: [
            defineField({
              name: 'vatID',
              type: 'string',
              title: 'VAT ID (NIP)',
              validation: (Rule) => Rule.regex(/^[0-9]{10}$/, 'NIP must be 10 digits'),
            }),
            defineField({
              name: 'regon',
              type: 'string',
              title: 'REGON',
              validation: (Rule) => Rule.regex(/^[0-9]{9}$/, 'REGON must be 9 digits'),
            }),
            defineField({
              name: 'legalName',
              type: 'string',
              title: 'Legal Company Name',
            }),
            defineField({
              name: 'foundingDate',
              type: 'date',
              title: 'Company Founding Date',
            }),
            defineField({
              name: 'founder',
              type: 'string',
              title: 'Founder (Full Name)',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'analytics',
      title: 'Analytics',
      type: 'object',
      group: 'analytics',
      options: { collapsible: true },
      fields: [
        defineField({
          name: 'gtm_id',
          type: 'string',
          title: 'Google Tag Manager ID',
          description: 'Format: GTM-XXXXXX. Container ID for managing analytics tools (GA4, Facebook Pixel, etc.).',
        }),
        defineField({
          name: 'ga4_id',
          type: 'string',
          title: 'Google Analytics 4 ID',
          description: 'Format: G-XXXXXXXXXX. Used for GA4 tracking.',
        }),
        defineField({
          name: 'meta_pixel_id',
          type: 'string',
          title: 'Meta (Facebook) Pixel ID',
          description: 'Format: XXXXXXXXXX. Used for Meta Pixel and Conversion API tracking.',
        }),
        defineField({
          name: 'meta_conversion_token',
          type: 'string',
          title: 'Meta Conversion API Token',
          description: 'Secret token for server-side Meta Conversion API tracking.',
        }),
      ],
    }),
  ],
  groups: [
    {
      name: 'contact',
      title: '📞 Contact Information',
    },
    {
      name: 'social',
      title: '🔗 Social Media',
    },
    {
      name: 'address',
      title: '📍 Address',
    },
    {
      name: 'seo',
      title: '🔍 SEO',
    },
    {
      name: 'organization',
      title: '🏢 Organization',
    },
    {
      name: 'analytics',
      title: '📊 Analytics',
    },
  ],
  preview: {
    prepare: () => ({
      title: 'Global settings',
    }),
  },
})
