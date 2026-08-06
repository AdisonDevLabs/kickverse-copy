// app/(storefront)/layout.tsx
import { Suspense } from 'react';
import { CartProvider } from '@/lib/CartContext';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';

export default function StorefrontLayout({children}: {children: React.ReactNode}) {
  return (
    <CartProvider>
      {/* Wrap the NavBar in a Suspense boundary to isolate useSearchParams() */}
      <Suspense>
        <NavBar />
      </Suspense>
      <CartDrawer />
      {/* 
        Adjusted top padding to perfectly match header height:
        Mobile: 32px (Announcement) + 48px (NavBar) = 80px
        Desktop: 32px (Announcement) + 55px (NavBar) = 87px
      */}
      <main className="flex flex-col min-h-screen pt-[80px] md:pt-[87px] pb-[88px] md:pb-0">
        {children}
      </main>
      <Footer />
    </CartProvider>
  );
}