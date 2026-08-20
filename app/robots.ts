import { MetadataRoute } from 'next';
import { brand } from '@/lib/data/brand';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = brand.url.replace(/\/$/, '');
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/admin/*',
        ],
      },
    ],
    sitemap: `${brand.url}/sitemap.xml`,
  };
}