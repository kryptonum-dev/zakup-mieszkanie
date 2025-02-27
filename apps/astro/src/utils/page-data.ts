import { DOMAIN } from '@global/constants'
import sanityFetch from '@utils/sanity.fetch'

export type GlobalAnalytics = {
  gtmId: string | null
  meta: {
    pixelId: string | null
    conversionToken: string | null
  } | null
  tiktok: {
    pixelId: string | null
    accessToken: string | null
  } | null
}

export type PageAdditionalData = {
  user_role: string
  event_hour: string
  event_day: string
  event_month: string
  page_url: string
  page_title: string
  page_type: string
  content_name: string
  content_category: string
  content_id: string
  content_description: string
  content_language: string
}

export type PageAnalyticsData = {
  analytics: GlobalAnalytics
  additionalData?: PageAdditionalData
}

export async function getGlobalAnalytics(): Promise<GlobalAnalytics> {
  try {
    const globalData = await sanityFetch<{
      analytics: GlobalAnalytics
    }>({
      query: `*[_type == "global"][0]{
        analytics {
          gtmId,
          meta {
            pixelId,
            conversionToken
          },
          tiktok {
            pixelId,
            accessToken
          }
        }
      }`,
    })

    return (
      globalData?.analytics || {
        gtmId: null,
        meta: null,
        tiktok: null,
      }
    )
  } catch (error) {
    console.error('Failed to fetch global analytics data from Sanity:', error)
    return {
      gtmId: null,
      meta: null,
      tiktok: null,
    }
  }
}

export async function getPageAdditionalData(slug: string): Promise<PageAdditionalData | undefined> {
  try {
    const pageData = await sanityFetch<{
      name: string
      _id: string
      seo: {
        title: string
        description: string
      }
      slug: string
    }>({
      query: `*[_type == "page" && slug.current == $slug][0]{
        name,
        "slug": slug.current,
        _id,
        seo {
          title,
          description
        }
      }`,
      params: { slug: slug || '/' },
    })

    if (!pageData) return undefined

    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const eventHour = `${hours.toString().padStart(2, '0')}-${minutes.toString().padStart(2, '0')}`
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]
    const eventDay = days[now.getDay()]
    const eventMonth = months[now.getMonth()]
    const fullUrl = `${DOMAIN}/${pageData.slug}`

    return {
      user_role: 'guest',
      event_hour: eventHour,
      event_day: eventDay,
      event_month: eventMonth,
      page_url: fullUrl,
      page_title: pageData.seo.title,
      page_type: 'landing_page',
      content_name: pageData.name,
      content_category: 'Bez kategorii',
      content_id: pageData._id,
      content_description: pageData.seo.description,
      content_language: 'pl',
    }
  } catch (error) {
    console.error('Failed to fetch page data from Sanity:', error)
    return undefined
  }
}

export async function getPageAnalyticsData(slug: string): Promise<PageAnalyticsData> {
  const analytics = await getGlobalAnalytics()
  const additionalData = await getPageAdditionalData(slug)

  return {
    analytics,
    additionalData,
  }
}
