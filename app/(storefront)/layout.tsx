// app/(storefront)/layout.tsx
import { Suspense } from 'react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { CartProvider } from '@/lib/CartContext';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { brand } from '@/lib/data/brand';

const CartDrawer = dynamic(() => import('@/components/CartDrawer').then(mod => mod.CartDrawer));

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  title: {
    default: brand.seo.title,
    template: `%s | ${brand.name}`,
  },
  description: brand.seo.description,
  keywords: [
    'sneakers Nairobi',
    'buy sneakers online Kenya',
    'soccer cleats Nairobi',
    'artificial turf football boots Kenya',
    'official shoes Nairobi CBD',
    'pure leather shoes Kenya',
    'pay on delivery shoes Nairobi',
    'authentic footwear Kenya',
    'Kickverse KE',
    'best shoe store Nairobi'
  ],
  alternates: {
    canonical: brand.url,
  },
  openGraph: {
    title: brand.seo.title,
    description: brand.seo.description,
    url: brand.url,
    siteName: brand.name,
    locale: 'en_KE',
    type: 'website',
    images: [
      {
        url: brand.seo.ogImage,
        width: 1200,
        height: 630,
        alt: `${brand.name} - Online Footwear Store Nairobi`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: brand.seo.title,
    description: brand.seo.description,
    images: [brand.seo.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'geo.region': 'KE-30',
    'geo.placename': 'Nairobi',
    'geo.position': '-1.286389;36.817223',
    'ICBM': '-1.286389, 36.817223',
  }
};

export default function StorefrontLayout({children}: {children: React.ReactNode}) {
  return (
    <CartProvider>
      {/* Wrap the NavBar in a Suspense boundary to isolate useSearchParams() */}
      <Suspense>
        <NavBar />
      </Suspense>
      <CartDrawer />
      <main className="flex flex-col min-h-screen pt-[80px] md:pt-[87px] pb-[88px] md:pb-0">
        {children}
      </main>
      <Footer />
    </CartProvider>
  );
}