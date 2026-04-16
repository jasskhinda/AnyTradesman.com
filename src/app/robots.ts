import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/admin',
          '/api/',
          '/business',
          '/leads',
          '/my-quotes',
          '/my-requests',
          '/messages',
          '/settings',
          '/login',
          '/register',
          '/forgot-password',
          '/email-verified',
        ],
      },
    ],
    sitemap: 'https://anytradesmen.com/sitemap.xml',
  };
}
