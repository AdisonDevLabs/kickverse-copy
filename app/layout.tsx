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
  
  title: brand.seo.title,
  description: brand.seo.description,

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
    locale: 'en_US',
    type: 'website',
  },

  icons: {
    icon: brand.seo.favicon,
    apple: brand.seo.appleIcon,
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${anton.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className="font-sans bg-brand-dark text-white antialiased selection:bg-brand-primary selection:text-black">
        {/* We removed the Storefront components from here! */}
        {children}
      </body>
    </html>
  );
}