/**
 * Global declaration of the domain for the application.
 * This constant is used for constructing full URLs and determining external links.
 * @constant
 */
export const DOMAIN: string = 'https://zakup-mieszkanie.pl'

/**
 * Domain used for preview functionality in development environment.
 * This constant defines the URL where content previews are rendered.
 * @constant
 */
export const PREVIEW_DOMAIN: string = import.meta.env.SANITY_STUDIO_PREVIEW_DOMAIN;
