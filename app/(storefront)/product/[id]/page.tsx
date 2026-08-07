// app/(storefront)/product/[id]/page.tsx
import { Metadata } from 'next';
import { brand } from '@/lib/data/brand';
import ProductDetailsClient from './ProductDetailsClient';
import { getDb } from '@/lib/db';
import { products, testimonials, sizeGuides, colorMap } from '@/lib/db/schema';
import { eq, and, not, sql, desc } from 'drizzle-orm'; // Added desc

export const revalidate = 60;

type Props = {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const db = await getDb();
  
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  const product = result[0];
  
  if (!product) {
    return { title: 'Product Not Found' };
  }

  const previewImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : product.image;

  const absoluteImageUrl = previewImage.startsWith('http') 
    ? previewImage 
    : `${brand.url.replace(/\/$/, '')}${previewImage.startsWith('/') ? '' : '/'}${previewImage}`;

  return {
    title: product.name, 
    description: product.description,
    openGraph: {
      title: product.name,
      description: `Order the ${product.name} directly on WhatsApp.`,
      url: `${brand.url}product/${id}`,
      siteName: brand.name,
      images: [
        {
          url: absoluteImageUrl,
          width: 800,
          height: 800,
          alt: `${product.name} preview image`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: `Order the ${product.name} directly on WhatsApp.`,
      images: [absoluteImageUrl],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const db = await getDb();
  
  // 1. Fetch the main product
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  const product = result[0];

  if (!product) {
    return <ProductDetailsClient product={null} relatedProducts={[]} recentlyViewed={[]} accessories={[]} />;
  }

  const allSizeGuides = await db.select().from(sizeGuides);
  const allColorMaps = await db.select().from(colorMap);

  // 2. ZONE 1: Substitute Products (Same type, NOT an accessory)
  // Fix: Fetch 12 newest items predictably, then shuffle in memory to save DB reads
  const relatedPool = await db.select({
    id: products.id,
    name: products.name,
    price: products.price,
    image: products.image,
  })
    .from(products)
    .where(and(
      eq(products.productType, product.productType), 
      eq(products.isAccessory, false), 
      not(eq(products.id, product.id))
    ))
    .orderBy(desc(products.createdAt))
    .limit(12);
  
  const productReviews = await db.select()
    .from(testimonials)
    .where(and(
      eq(testimonials.product, product.id),
      eq(testimonials.isApproved, true)
    ))
    .orderBy(desc(testimonials.id));


  const relatedProducts = relatedPool.sort(() => 0.5 - Math.random()).slice(0, 4);

  // 3. Fetch recently viewed/others (prioritize current product type, then randomize, limit 8)
  const recentlyViewedPool = await db.select({
    id: products.id,
    name: products.name,
    image: products.image,
  })
    .from(products)
    .where(not(eq(products.id, product.id)))
    .orderBy(
      sql`CASE WHEN ${products.productType} = ${product.productType} THEN 0 ELSE 1 END`, 
      desc(products.createdAt)
    )
    .limit(20);


  const recentlyViewed = recentlyViewedPool.sort(() => 0.5 - Math.random()).slice(0, 8);

  const previewImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : product.image;

  const absoluteImageUrl = previewImage.startsWith('http') 
    ? previewImage 
    : `${brand.url.replace(/\/$/, '')}${previewImage.startsWith('/') ? '' : '/'}${previewImage}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [absoluteImageUrl],
    description: product.description,
    category: product.category,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'KES',
      price: product.price,
      url: `${brand.url}product/${product.id}`,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: brand.name,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailsClient 
        product={product} 
        reviews={productReviews}
        relatedProducts={relatedProducts} 
        recentlyViewed={recentlyViewed}
        sizeGuides={allSizeGuides}
        colorMap={allColorMaps}
      />
    </>
  );
}