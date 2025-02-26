export { default } from './Button.tsx'
export type { Props as ButtonDataProps } from './Button.tsx'

export const ButtonDataQuery = (name: string) => `
  ${name} {
    text,
    theme,
    linkType,
    "href": select(
      linkType == "internal" => internal -> slug.current,
      linkType == "external" => external,
      linkType == "anchor" => anchor,
      "#"
    ),
  },
`
