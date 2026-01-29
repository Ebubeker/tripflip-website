import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tripflip.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/planning/', '/trip/', '/trips/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
