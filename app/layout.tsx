// app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Anton, Poppins } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';
import { brand } from '@/lib/data/brand';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
});

const poppins = Poppins({
  weight: '600',
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  alternates: {
    canonical: '/',
  },
  title: {
    default: brand.seo.title, // Fallback for the homepage
    template: `%s | ${brand.shortName}`, // Automatically appends brand name to inner pages
  },
  description: brand.seo.description,

  authors: [{ name: brand.name }],
  creator: brand.name,
  openGraph: {
    title: brand.seo.title,
    description: brand.seo.description,
    url: brand.url,
    siteName: brand.name, 
    images: [
      {
        url: brand.seo.ogImage, 
        width: 1200,
        height: 630,
        alt: `${brand.name} preview image`,
      },
    ],
    locale: 'en_KE', // Updated to Kenyan locale for localized search relevance
    type: 'website',
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
  icons: {
    icon: brand.seo.favicon,
    apple: brand.seo.appleIcon,
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ShoeStore',
    'name': brand.name,
    alternateName: ['Kickverse', 'Kickverse Kenya', 'KickVerse'],
    'url': brand.url,
    'logo': `${brand.url}${brand.logo}`,
    'description': brand.description,
    'telephone': brand.contacts.sneakers.phone,
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': 'Nairobi',
      'addressCountry': 'KE',
    },
    'sameAs': [
      brand.socialLinks.instagram,
      brand.socialLinks.tiktok,
      brand.socialLinks.tiktokBootRoom,
    ],
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