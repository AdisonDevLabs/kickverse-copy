import { MetadataRoute } from 'next';
import { brand } from '@/lib/data/brand';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${brand.name} Kenya | Sneakers & Footwear`,
    short_name: brand.shortName,
    description: 'Shop quality sneakers, soccer cleats, and official shoes with Nairobi CBD delivery.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0A0A0A',
    theme_color: '#E5FF00',
    categories: ['shopping', 'lifestyle', 'footwear', 'sports'],
    lang: 'en-KE',
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