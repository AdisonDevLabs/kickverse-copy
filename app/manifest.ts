import { MetadataRoute } from 'next';
import { brand } from '@/lib/data/brand';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.name,
    short_name: brand.shortName,
    description: brand.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: brand.seo.favicon,
        sizes: '16x16 32x32',
        type: 'image/x-icon',
      },
      {
        src: brand.logo1,
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}