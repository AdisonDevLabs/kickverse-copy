// app/(storefront)/product/[id]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { brand } from '@/lib/data/brand';
import ProductDetailsClient from './ProductDetailsClient';
import { getDb } from '@/lib/db';
import { products, testimonials, sizeGuides, colorMap } from '@/lib/db/schema';
<<<<<<< HEAD
import { eq, and, not, sql, desc } from 'drizzle-orm'; // Added desc
=======
import { eq, and, not, sql, desc } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
>>>>>>> c89ed85 (fix:image and cloudflare database reads)

export const revalidate = 60;

type Props = {
  params: Promise<{ id: string }>;
}

<<<<<<< HEAD
=======
function detectBrand(productName: string): string {
  const knownBrands = ['Nike', 'Adidas', 'Jordan', 'Puma', 'New Balance', 'On Running', 'Asics', 'Vans', 'Converse', 'Timberland', 'Clarks'];
  const matched = knownBrands.find((b) => new RegExp(`\\b${b}\\b`, 'i').test(productName));
  return matched || 'Kickverse';
}

// 1. Cache the single product fetch to deduplicate calls between Metadata and the Page
const getCachedProduct = unstable_cache(
  async (id: string) => {
    const db = await getDb();
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  },
  ['single-product'], 
  { revalidate: 3600, tags: ['products'] }
);

// 2. Cache the heavy relational queries together. 
// FIX: productType is strictly typed to prevent the Drizzle ORM TypeScript error.
const getCachedProductAssets = unstable_cache(
  async (productId: string, productType: 'Sneakers' | 'Soccer Cleats') => {
    const db = await getDb();
    const [allSizeGuides, allColorMaps, relatedPool, productReviews, recentlyViewedPool] = await Promise.all([
      db.select().from(sizeGuides),
      db.select().from(colorMap),
      db.select({ id: products.id, name: products.name, price: products.price, image: products.image })
        .from(products)
        .where(and(eq(products.productType, productType), eq(products.isAccessory, false), not(eq(products.id, productId))))
        .orderBy(desc(products.createdAt))
        .limit(12),
      db.select()
        .from(testimonials)
        .where(and(eq(testimonials.product, productId), eq(testimonials.isApproved, true)))
        .orderBy(desc(testimonials.id)),
      db.select({ id: products.id, name: products.name, image: products.image })
        .from(products)
        .where(not(eq(products.id, productId)))
        .orderBy(sql`CASE WHEN ${products.productType} = ${productType} THEN 0 ELSE 1 END`, desc(products.createdAt))
        .limit(20)
    ]);
    return { allSizeGuides, allColorMaps, relatedPool, productReviews, recentlyViewedPool };
  },
  ['product-assets-relational'],
  { revalidate: 3600, tags: ['products', 'reviews', 'settings'] }
);

>>>>>>> c89ed85 (fix:image and cloudflare database reads)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  // 3. Use the cached function instead of raw DB call
  const product = await getCachedProduct(id);
  
  if (!product) {
    notFound(); // <-- 2. Trigger true 404 here
  }

  const previewImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : product.image;

  const absoluteImageUrl = previewImage.startsWith('http') 
    ? previewImage 
    : `${brand.url.replace(/\/$/, '')}${previewImage.startsWith('/') ? '' : '/'}${previewImage}`;

  // 1. Generate highly specific, intent-driven keywords dynamically
  const baseKeywords = [
    product.name,
    `${product.name} Kenya`,
    `Buy ${product.name} online`,
    `${product.category} Nairobi`,
    `${product.productType} delivery Kenya`,
    'Kickverse'
  ];

<<<<<<< HEAD
  // 2. Inject niche keywords based on the exact product type
=======
>>>>>>> c89ed85 (fix:image and cloudflare database reads)
  if (product.productType === 'Soccer Cleats') {
    baseKeywords.push('Football boots Kenya', 'Soccer cleats Nairobi', 'Firm ground boots');
  } else {
    baseKeywords.push('Sneakers Kenya', 'Streetwear shoes Nairobi', 'Original sneakers');
  }

  // 3. Craft a localized, conversion-focused meta description
  const cleanDescription = product.description.replace(/(<([^>]+)>)/gi, "").substring(0, 90);
  const localDescription = `Buy the ${product.name} at ${brand.name}. Premium ${product.category.toLowerCase()} available for fast delivery in Nairobi and across Kenya. ${cleanDescription}...`;

  return {
    title: product.name, 
    description: localDescription,
    keywords: baseKeywords,
    alternates: {
      canonical: `${brand.url}/product/${id}`,
    },
    openGraph: {
      title: `${product.name} | ${brand.shortName}`,
      description: localDescription,
      url: `${brand.url}/product/${id}`,
      siteName: brand.name,
      images: [
        {
          url: absoluteImageUrl,
          width: 800,
          height: 800,
          alt: `Buy ${product.name} in kenya`,
        },
      ],
      locale: 'en_KE',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: localDescription,
      images: [absoluteImageUrl],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  
<<<<<<< HEAD
  // 1. Fetch the main product
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  const product = result[0];
=======
  // 4. Instantly fetches from cache (no DB query since metadata already cached it)
  const product = await getCachedProduct(id);
>>>>>>> c89ed85 (fix:image and cloudflare database reads)

  if (!product) {
    notFound(); // <-- 3. Trigger true 404 here too
  }

  // 5. Instantly fetches related assets from cache
  const { allSizeGuides, allColorMaps, relatedPool, productReviews, recentlyViewedPool } = await getCachedProductAssets(product.id, product.productType);


  const relatedProducts = relatedPool.sort(() => 0.5 - Math.random()).slice(0, 4);
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
      url: `${brand.url}/product/${product.id}`,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: brand.name,
      },
    },
<<<<<<< HEAD
=======
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: averageRating,
      reviewCount: reviewCount > 0 ? reviewCount : Math.max(Number(product.reviews || 1), 1),
      bestRating: '5',
      worstRating: '1',
    },
  };

  if (productReviews.length > 0) {
    productSchema.review = productReviews.slice(0, 5).map((rev) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: rev.name || 'Verified Buyer' },
      datePublished: rev.date ? new Date(rev.date).toISOString().split('T')[0] : '2026-01-01',
      reviewBody: rev.text,
      reviewRating: { '@type': 'Rating', ratingValue: rev.rating || 5, bestRating: '5', worstRating: '1' },
    }));
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${brand.url}/` },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: `${brand.url}/shop` },
      { '@type': 'ListItem', position: 3, name: product.category, item: `${brand.url}/shop?category=${encodeURIComponent(product.category.toLowerCase().replace(/\s+/g, '-'))}` },
      { '@type': 'ListItem', position: 4, name: product.name, item: `${brand.url}/product/${product.id}` },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How do I order the ${product.name} in Nairobi?`,
        acceptedAnswer: { '@type': 'Answer', text: `You can easily order the ${product.name} online at Kickverse KE or directly via WhatsApp. We provide prompt dispatch with direct communication.` },
      },
      {
        '@type': 'Question',
        name: 'Do you offer Pay on Delivery in Nairobi and across Kenya?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. Kickverse KE offers Pay on Delivery across Nairobi and surrounding environs. You can inspect your shoes before completing payment.' },
      },
      {
        '@type': 'Question',
        name: `Are the sizes for ${product.name} standard fit?`,
        acceptedAnswer: { '@type': 'Answer', text: `Yes, our pairs run true to standard sizing. If you have wider feet, we recommend selecting half a size up. Consult our interactive Size Guide for exact measurements.` },
      },
    ],
>>>>>>> c89ed85 (fix:image and cloudflare database reads)
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