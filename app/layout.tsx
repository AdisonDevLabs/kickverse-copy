// app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Anton, Poppins } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';
import { brand } from '@/lib/data/brand';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const poppins = Poppins({
  weight: '600',
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  alternates: {
    canonical: '/',
  },
  title: {
    default: brand.seo.title, // Fallback for the homepage
    template: `%s | ${brand.shortName} kenya`, // Automatically appends brand name to inner pages
  },
  description: brand.seo.description,

  keywords: [
    'Sneakers Nairobi',
    'Buy soccer cleats Kenya',
    'Turf football boots Nairobi',
    'Official leather shoes Nairobi CBD',
    'Affordable sneakers Kenya',
    'Nike Airmax Nairobi',
    'Jordan 4 Kenya',
    'Pay on delivery shoes Nairobi',
    'Kickverse KE',
  ],

  authors: [{ name: brand.name }],
  creator: brand.name,
  publisher: brand.name,
  category: 'Footwear & Sporting Goods',
  openGraph: {
    title: 'Kickverse KE | Premium Sneakers, Cleats & Shoes in Nairobi',
    description: 'Explore 280+ sneakers, professional soccer cleats, and official leather shoes. Fast doorstep delivery across Nairobi County with pay-on-delivery options.',
    url: brand.url,
    siteName: 'Kickverse KE',
    images: [
      {
        url: brand.seo.ogImage, 
        width: 1200,
        height: 630,
        alt: 'Kickverse KE - Nairobi Footwear and Cleats Collection',
      },
    ],
    locale: 'en_KE', // Updated to Kenyan locale for localized search relevance
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kickverse KE | Footwear & Soccer Cleats Nairobi',
    description: 'Buy original sneakers, soccer cleats, and official shoes with free delivery within Nairobi CBD and trusted pay on delivery.',
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
  },
  icons: {
    icon: brand.seo.favicon,
    apple: brand.seo.appleIcon,
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['ShoeStore', 'OnlineStore'],
    'name': brand.name,
    alternateName: ['Kickverse', 'Kickverse KE', 'Kickverse Kenya', 'KickVerse', 'KickVerse Store'],
    'url': brand.url,
    'logo': `${brand.url}${brand.logo}`,
    'description': brand.description,
    'priceRange': 'KSh 1,999 - KSh 6,500',
    'currenciesAccepted': 'KES',
    'paymentAccepted': 'Cash on Delivery, M-Pesa, Mobile Money',
    'telephone': brand.contacts.sneakers.phone,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': ['Nairobi Central Business District (CBD)', 'Tom Mboya Street'],
      'addressLocality': 'Nairobi',
      'addressRegion': 'Nairobi County',
      'addressCountry': 'KE',
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': -1.286389,
      'longitude': 36.817223,
    },
    'areaServed': [
      { '@type': 'City', 'name': 'Nairobi' },
      { '@type': 'AdministrativeArea', 'name': 'Nairobi County' },
      { '@type': 'AdministrativeArea', 'name': 'Westlands' },
      { '@type': 'AdministrativeArea', 'name': 'Kasarani' },
      { '@type': 'AdministrativeArea', 'name': 'Karen' },
      { '@type': 'AdministrativeArea', 'name': 'Langata' },
      { '@type': 'Country', 'name': 'Kenya' },
    ],
    'openingHoursSpecification': [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        'opens': '00:00',
        'closes': '23:59',
      },
    ],
    'contactPoint': [
      {
        '@type': 'ContactPoint',
        'telephone': brand.contacts?.sneakers?.phone,
        'contactType': 'sales',
        'contactOption': 'WhatsApp Ordering',
        'areaServed': 'KE',
        'availableLanguage': ['en', 'sw'],
      },
      {
        '@type': 'ContactPoint',
        'telephone': brand.contacts?.bootRoom?.phone || brand.contacts?.sneakers?.phone,
        'contactType': 'customer support',
        'contactOption': 'Boot Room Cleats Support',
        'areaServed': 'KE',
        'availableLanguage': ['en', 'sw'],
      },
    ],
    'sameAs': [
      brand.socialLinks?.instagram,
      brand.socialLinks?.tiktok,
      brand.socialLinks?.tiktokBootRoom,
    ].filter(Boolean),
  };
  return (
    <html lang="en-KE" className={`scroll-smooth ${inter.variable} ${anton.variable} ${poppins.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans bg-brand-dark text-white antialiased selection:bg-brand-primary selection:text-black min-h-screen flex flex-col">
        {children}
      </body>
      <GoogleAnalytics gaId="G-ZQBZMLZNS1" />
    </html>
  );
}