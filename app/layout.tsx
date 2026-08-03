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
    // Core Brand & General Shoe Shopping
    'Kickverse KE',
    'Kickverse Kenya',
    'Buy shoes online Kenya',
    'Best shoe shops in Nairobi',
    'Shoe delivery Nairobi',
    'Online shoe store Kenya',
    'Affordable shoes Nairobi CBD',

    // Sneakers & Streetwear
    'Sneakers Kenya',
    'Original sneakers Nairobi',
    'Best sneaker shops Nairobi',
    'Sneaker plug Kenya',
    'Latest trending sneakers in Kenya',
    'Buy Nike Air Force 1 Nairobi',
    'Jordan retro sneakers Kenya',
    'Adidas Yeezy Nairobi',
    'Streetwear shoes Kenya',
    'Ladies sneakers online Kenya',
    'Affordable kicks Nairobi',

    // Soccer Cleats & Football Boots
    'Football boots Kenya',
    'Soccer Cleats Nairobi',
    'Buy soccer boots in Kenya',
    'Nike Mercurial Vapor Kenya',
    'Adidas Predator Nairobi',
    'Cheap football boots Nairobi CBD',
    'Puma Future soccer cleats Kenya',
    'Kids football boots Kenya',
    'Astroturf football shoes Nairobi',

    // Official & Formal Shoes
    'Buy official shoes online Kenya',
    'Men\'s official shoes Nairobi',
    'Ladies official office shoes Kenya',
    'Leather formal shoes Kenya',
    'Oxford and Derby shoes Nairobi',
    'Men\'s loafers online Kenya',
    'Gentlemen shoes Nairobi',
    'Corporate footwear Kenya',
    'Black formal shoes for work Kenya',

    // Open Shoes, Sandals & Slides
    'Ladies open shoes Kenya',
    'Flat sandals for ladies Nairobi',
    'Buy men\'s open shoes online Kenya',
    'Leather sandals men Kenya',
    'Summer slides and slippers Nairobi',
    'Heeled sandals online Kenya',
    'Gladiator sandals Nairobi',
    'Casual slippers Kenya',
    'Maasai sandals Kenya online'
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