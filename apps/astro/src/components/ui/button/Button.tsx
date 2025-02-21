import styles from './Button.module.scss'

export type Props = React.HTMLAttributes<HTMLAnchorElement> &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    text?: string | React.ReactNode
    children: React.ReactNode
    theme?: 'primary' | 'secondary'
    linkType?: 'external' | 'internal'
    href?: string
    className?: string
  }

export default function Button({
  children,
  text,
  theme = 'primary',
  linkType = 'internal',
  href,
  className,
  ...props
}: Props) {
  const Element = href ? 'a' : 'button'
  const isExternal = linkType === 'external'
  const renderedProps = {
    ...(href && { href }),
    ...(isExternal && { target: '_blank', rel: 'noreferrer' }),
    'data-theme': theme,
    className: `${styles.Button}${className ? ` ${className}` : ''}`,
    ...props,
  }

  return (
    <Element {...renderedProps}>
      <div className={styles.content}>{children}</div>
    </Element>
  )
}
