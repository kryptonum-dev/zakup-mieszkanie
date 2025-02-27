export { default, type PortableTextValue } from './index.astro';
export { portableTextToHTML } from './portable-text-to-html';

export const PortableTextQuery = (name: string) => `
  ${name}[] {
    ...,
    markDefs[] {
      _type == "link" => {
        _type,
        _key,
        type,
        "href": select(type == "internal" => internal -> slug.current, type == "external" => external, "#"),
      },
    },
  },
`
