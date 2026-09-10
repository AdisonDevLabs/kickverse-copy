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
    default: `Buy Authentic Sneakers, Cleats & Boots in Kenya | ${brand.name}`,
    template: `%s | ${brand.name} kenya`,
  },
  description: `Shop 100% authentic sneakers, walking boots, and soccer cleats in Nairobi, Kenya. Best prices in KSh. Pay on delivery available across Nairobi CBD.`,
  keywords: [
    'Kickverse', 'Kick verse', 'Kicksverse', 'Kickverse KE',
    'shoes price in Kenya', 'sneakers price in Kenya', 'how much in Kenyan shillings', 'price in ksh', 'pay on delivery shoes Nairobi',
    'sneakers Nairobi', 'latest sneakers Kenya', 'walking boots Kenya', 'hiking boots Nairobi', 'outdoor shoes Kenya',
    'soccer cleats Nairobi', 'football boots Kenya', 'artificial turf boots Kenya',
    'official shoes Nairobi CBD', 'pure leather shoes Kenya',
    'authentic footwear Kenya', 'original sneakers Nairobi', 'legit shoe store Kenya',
    'adidas samba Nairobi', 'nike dunks Kenya', 'new balance 9060 Kenya', 'asics Nairobi'
  ],
  alternates: {
    canonical: brand.url.replace(/\/$/, ''),
  },
  openGraph: {
    title: `Buy Authentic Sneakers, Cleats & Boots in Kenya | ${brand.name}`,
    description: `Shop 100% authentic sneakers, walking boots, and soccer cleats in Nairobi, Kenya. Best prices in KSh with Pay on Delivery.`,
    url: brand.url.replace(/\/$/, ''),
    siteName: brand.name,
    locale: 'en_KE',
    type: 'website',
    images: [
      {
        url: brand.seo.ogImage,
        width: 1200,
        height: 630,
        alt: `${brand.name} - Buy Authentic Footwear Online in Nairobi, Kenya`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Buy Authentic Sneakers, Cleats & Boots in Kenya | ${brand.name}`,
    description: `Shop 100% authentic sneakers, walking boots, and soccer cleats in Nairobi, Kenya. Best prices in KSh.`,
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