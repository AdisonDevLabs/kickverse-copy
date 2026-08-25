import { Metadata } from 'next';
import { getDb } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { brand } from '@/lib/data/brand';
import ShopWrapper from './ShopWrapper';
import { desc } from 'drizzle-orm';

export const revalidate = 60;

// 1. Define Props to accept searchParams
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// 2. Replace static metadata with dynamic generateMetadata
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const categoryRaw = typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined;
  const typeRaw = typeof resolvedParams.type === 'string' ? resolvedParams.type : undefined;

  // Helper to format URL slugs (e.g., 'official-shoes' -> 'Official Shoes')
  const formatString = (str?: string) => {
    if (!str) return '';
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const categoryName = formatString(categoryRaw);
  const typeName = formatString(typeRaw);

  // 3. Construct intelligent fallbacks based on available parameters
  let dynamicTitle = 'Shop Footwear Collection';
  let dynamicDescription = `Browse authentic footwear at ${brand.name}. Swift delivery across Nairobi and Country Wide.`;
  
  if (categoryName && typeName) {
    dynamicTitle = `Shop ${categoryName} | ${typeName}`;
    dynamicDescription = `Explore our collection of ${categoryName} under ${typeName}. Fast delivery across Kenya.`;
  } else if (categoryName) {
    dynamicTitle = `Shop ${categoryName}`;
    dynamicDescription = `Buy authentic ${categoryName} online at ${brand.name}. Quality guaranteed across Kenya.`;
  } else if (typeName) {
    dynamicTitle = `Shop ${typeName}`;
    dynamicDescription = `Browse our complete catalog of ${typeName}. Find the perfect fit with fast, reliable delivery in Kenya.`;
  }

  // Build clean, accurate self-referencing canonical URL
  const canonicalParams = new URLSearchParams();
  if (typeRaw) canonicalParams.set('type', typeRaw);
  if (categoryRaw) canonicalParams.set('category', categoryRaw);
  
  const queryString = canonicalParams.toString();
  const canonicalUrl = `${brand.url.replace(/\/$/, '')}/shop${queryString ? `?${queryString}` : ''}`;

  // 4. Inject highly specific, localized search keywords dynamically
  const dynamicKeywords = [
    categoryName ? `${categoryName} Kenya` : '',
    categoryName ? `${categoryName} Nairobi` : '',
    typeName ? `${typeName} Nairobi` : '',
    categoryName ? `Buy ${categoryName} online` : '',
    'Kickverse',
    'Shoes delivery Kenya'
  ].filter(Boolean); // Removes any empty strings

  return {
    title: dynamicTitle,
    description: dynamicDescription,
    keywords: dynamicKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${dynamicTitle} | ${brand.shortName}`,
      description: dynamicDescription,
      url: canonicalUrl,
      siteName: brand.name,
      locale: 'en_KE',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: dynamicTitle,
      description: dynamicDescription,
    },
  };
}


// 2. Add searchParams to the component props kickverse.storxia.tech
export default async function ShopPage({ searchParams }: Props) {
  
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