import { Metadata } from 'next';
import { getDb } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { brand } from '@/lib/data/brand';
import ShopWrapper from './ShopWrapper';
import { desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';

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

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// 2. Add searchParams to the component props
export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;
  
  // 3. Force redirect if no type is in the URL
  if (!params.type) {
    redirect('/shop?type=sneakers');
  }
  const db = await getDb();
  const allProducts = await db.select().from(products).orderBy(
    desc(products.isPinned),
    desc(products.createdAt)
  );

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Render the wrapper which safely handles the dynamic client load */}
      <ShopWrapper initialProducts={allProducts} />
    </>
  );
}