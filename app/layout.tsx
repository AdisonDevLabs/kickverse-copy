// app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Anton, Poppins } from 'next/font/google';
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
  title: {
    default: brand.seo.title, // Fallback for the homepage
    template: `%s | ${brand.shortName}`, // Automatically appends brand name to inner pages
  },
  description: brand.seo.description,
  keywords: [
    'Sneakers Kenya',
    'Football boots Kenya',
    'Soccer Cleats Nairobi',
    'Nike Mercurial',
    'Adidas Predator',
    'Kickverse KE',
    'Original sneakers Nairobi',
    'Buy shoes online Kenya'
  ],
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
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable} ${anton.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className="font-sans bg-brand-dark text-white antialiased selection:bg-brand-primary selection:text-black min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}