import { defineField } from 'sanity'
import { isUniqueSlug } from './is-unique-slug'
import { slugify } from './slugify'

export const defineSlugForDocument = ({
  source,
  prefix = '',
  additionalFields = {},
  slug,
}: {
  source?: string
  prefix?: string
  additionalFields?: Record<string, any>
  slug?: string
}) => [
  ...(source
    ? []
    : [
        defineField({
          name: 'name',
          type: 'string',
          title: 'Name',
          description: 'The name of the document, used for display in the Breadcrumbs.',
          validation: (Rule) => Rule.required(),
          ...additionalFields,
        }),
      ]),
  defineField({
    name: 'slug',
    type: 'slug',
    title: `Slug`,
    ...additionalFields,
    description: (
      <>
        Slug is a unique identifier for the document, used for SEO and links.
        {slug && (
          <>
            {' '}
            <strong>
              <em>That slug can&apos;t be changed.</em>
            </strong>
          </>
        )}
        {prefix && (
          <>
            {' '}
            The slug should start with a prefix: <strong>{prefix}</strong>
          </>
        )}
      </>
    ),
    ...(!!slug && {
      initialValue: { current: slug },
      readOnly: true,
    }),
    options: {
      source: source || 'name',
      slugify: (slug: string) => `${prefix || '/'}${slugify(slug)}`,
      isUnique: isUniqueSlug,
    },
    validation: (Rule) =>
      Rule.required().custom((value) => {
        if (prefix && value?.current && !value.current.startsWith(prefix)) {
          return `Slug should start with ${prefix}`
        }
        return true
      }),
  }),
]
