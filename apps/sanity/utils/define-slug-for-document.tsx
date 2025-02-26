import { defineField, type SlugDefinition, type SlugOptions } from 'sanity'
import { isUniqueSlug } from './is-unique-slug'
import { slugify } from './slugify'

const isProduction = process.env.NODE_ENV === 'production';

type DefineSlugConfig = {
  source?: string;
  slug?: string;
}

export const defineSlugForDocument = ({
  source,
  slug
}: DefineSlugConfig) => [
    ...(source ? [] : [
      defineField({
        name: 'name',
        type: 'string',
        title: 'Name',
        description: 'The name of the document, used for display in the Breadcrumbs.',
        validation: (Rule) => Rule.required(),
      }),
    ]),
    defineField({
      name: 'slug',
      type: 'slug',
      title: `Slug`,
      description: (
        <>
          Slug is a unique identifier for the document, used for SEO and links.
          {(isProduction && !!slug) && (
            <><strong><em>That slug can&apos;t be changed.</em></strong></>
          )}
        </>
      ),
      readOnly: isProduction && !!slug,
      options: {
        source: source || 'name',
        slugify: (value) => `/${slugify(value)}`,
        isUnique: isUniqueSlug,
      },
      validation: (Rule) =>
        Rule.required().custom((value) => {
          if (!value?.current) return true;
          if (!value.current.startsWith('/')) {
            return 'Slug should start with /'
          }
          const slugWithoutPrefix = value.current.substring(1);
          if (slugWithoutPrefix && slugWithoutPrefix !== slugify(slugWithoutPrefix)) {
            return 'There is a typo in the slug. Remember that slug can contain only lowercase letters, numbers and dashes.';
          }
          return true
        }),
    }),
  ]
