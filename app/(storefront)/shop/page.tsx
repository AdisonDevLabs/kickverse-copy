import { Metadata } from 'next';
import { getDb } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { brand } from '@/lib/data/brand';
import ShopWrapper from './ShopWrapper';
import { desc } from 'drizzle-orm';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Shop All Footwear',
  description: 'Browse our complete catalog of authentic sneakers, firm ground soccer cleats, and astro turf boots. Swift delivery across Kenya.',
  openGraph: {
    title: `Shop Collection | ${brand.shortName}`,
    description: 'Browse our complete catalog of authentic sneakers and football boots in Kenya.',
    url: `${brand.url}shop`,
  },
};


// 2. Add searchParams to the component props
export default async function ShopPage() {
  
  const db = await getDb();
  const allProducts = await db.select({
    id: products.id,
    name: products.name,
    price: products.price,
    originalPrice: products.originalPrice,
    image: products.image,          // Only the single thumbnail image
    productType: products.productType,
    category: products.category,
    rating: products.rating,
    reviews: products.reviews,
    sizes: products.sizes,          // Kept because ShopClient uses this to filter
    isNewArrival: products.isNewArrival,
    isBestSeller: products.isBestSeller,
    isFlashDeal: products.isFlashDeal,
    isPinned: products.isPinned,
    isAccessory: products.isAccessory,
    createdAt: products.createdAt,
  })
  .from(products)
  .orderBy(
    desc(products.isPinned),
    desc(products.id)
  ).limit(500);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Kickverse Complete Collection',
    description: 'All available sneakers and football boots at Kickverse Kenya.',
    url: `${brand.url.replace(/\/$/, '')}/shop`,
    numberOfItems: allProducts.length,
    itemListElement: allProducts.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${brand.url.replace(/\/$/, '')}/product/${product.id}`,
      name: product.name,
    })),
  };

  const safeJsonLd = JSON.stringify(jsonLd).replace(/</g, '\\u003c');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd }}
      />
      {/* Render the wrapper which safely handles the dynamic client load */}
      <ShopWrapper initialProducts={allProducts} />
    </>
  );
}