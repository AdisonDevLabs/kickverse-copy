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
          // Security: Block admin and draft routes
          '/admin/',
          '/admin/*',
          '/api/admin/',
          '/api/admin/*',
          '/draft/',
          
          // SEO: Block internal search queries from being indexed
          '/*?*q=*',
          '/*?*brand=*',
          '/*?*model=*',
          
          // SEO: Block low-value faceted filtering combinations
          '/*?*sort=*',
          '/*?*size=*',
          '/*?*price=*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/', 
          '/api/admin/',
          '/draft/',
          '/*?*q=*',
          '/*?*brand=*',
          '/*?*model=*',
          '/*?*sort=*',
          '/*?*size=*',
          '/*?*price=*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}