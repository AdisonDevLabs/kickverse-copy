// app/(storefront)/layout.tsx
import { CartProvider } from '@/lib/CartContext';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';

export default function StorefrontLayout({children}: {children: React.ReactNode}) {
  return (
    <CartProvider>
      <NavBar />
      <CartDrawer />
      <main className="flex flex-col min-h-screen pt-[96px] md:pt-[100px] pb-[88px] md:pb-0">
        {children}
      </main>
      <Footer />
    </CartProvider>
  );
}