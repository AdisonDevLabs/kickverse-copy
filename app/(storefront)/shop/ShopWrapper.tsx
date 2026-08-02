'use client';

import dynamic from 'next/dynamic';

// Dynamically import the ShopClient with SSR strictly disabled
const ShopClientDynamic = dynamic(() => import('./ShopClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark">
      <div className="w-8 h-8 rounded-full border-4 border-white/20 border-t-brand-primary animate-spin" />
    </div>
  ),
});

export default function ShopWrapper({ initialProducts }: { initialProducts: any[] }) {
  return <ShopClientDynamic initialProducts={initialProducts} />;
}