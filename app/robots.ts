import { MetadataRoute } from 'next';
import { brand } from '@/lib/data/brand';

export default function robots(): MetadataRoute.Robots {
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
    sitemap: `${brand.url}sitemap.xml`,
  };
}