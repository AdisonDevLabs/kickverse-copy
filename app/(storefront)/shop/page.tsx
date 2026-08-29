import { Metadata } from 'next';
import { getDb } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { brand } from '@/lib/data/brand';
import ShopWrapper from './ShopWrapper';
import { desc } from 'drizzle-orm';
import { unstable_cache } from 'next/cache'

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
    if (str === 'opens-and-sandals') return 'Opens & Sandals'; // Custom override
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const categoryName = formatString(categoryRaw);
  const typeName = formatString(typeRaw);

  // 3. Construct intelligent fallbacks based on available parameters
  let dynamicTitle = `Premium Sneakers, Soccer Cleats & Official Shoes | ${brand.name} Nairobi`;
  let dynamicDescription = `Browse authentic footwear at ${brand.name}. Enjoy complimentary expedited delivery across the Nairobi CBD and trusted pay-on-delivery service countrywide.`;
  
  if (categoryName && typeName) {
    dynamicTitle = `Buy ${categoryName} ${typeName} Online in Nairobi | ${brand.name}`;
    dynamicDescription = `Shop our curated collection of ${categoryName} ${typeName}. 100% verified pairs with fast delivery in Nairobi and across Kenya.`;
  } else if (categoryName) {
    dynamicTitle = `Buy Authentic ${categoryName} Online Nairobi, Kenya | ${brand.name}`;
    dynamicDescription = `Explore affordable and authentic ${categoryName} online. Secure your pair today with complimentary CBD delivery in Nairobi.`;
  } else if (typeName) {
    dynamicTitle = `Shop ${typeName} in Nairobi, Kenya | Pay on Delivery - ${brand.name}`;
    dynamicDescription = `Browse our complete catalog of professional ${typeName}. Find the perfect fit with fast, reliable pay-on-delivery logistics in Kenya.`;
  }

  // Build clean, accurate self-referencing canonical URL
  const canonicalParams = new URLSearchParams();
  if (typeRaw) canonicalParams.set('type', typeRaw);
  if (categoryRaw) canonicalParams.set('category', categoryRaw);
  
  const queryString = canonicalParams.toString();
  const canonicalUrl = `${brand.url.replace(/\/$/, '')}/shop${queryString ? `?${queryString}` : ''}`;

  // 4. Inject highly specific, localized search keywords dynamically
  const dynamicKeywords = [
    categoryName ? `${categoryName} delivery Nairobi` : '',
    categoryName ? `Buy ${categoryName} online Kenya` : '',
    typeName ? `${typeName} Nairobi CBD` : '',
    'Buy sneakers online Nairobi',
    'Soccer cleats FG AG Turf Kenya',
    'Official pure leather shoes Nairobi',
    'Pay on delivery shoes Kenya',
    'Kickverse KE',
  ].filter(Boolean);

  return {
    title: dynamicTitle,
    description: dynamicDescription,
    keywords: dynamicKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: dynamicTitle,
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

// 2. Wrap the D1 query in a dedicated cached function
const getCachedProducts = unstable_cache(
  async () => {
    const db = await getDb();
    return db.select({
      id: products.id,
      name: products.name,
      price: products.price,
      originalPrice: products.originalPrice,
      image: products.image,
      productType: products.productType,
      category: products.category,
      rating: products.rating,
      reviews: products.reviews,
      sizes: products.sizes,
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
  },
  ['shop-products-500'], // Cache key
  { 
    revalidate: 3600, // Revalidate every hour
    tags: ['products'] // Allows you to call revalidateTag('products') on upload
  }
);

// 2. Add searchParams to the component props kickverse.storxia.tech
export default async function ShopPage({ searchParams }: Props) {
  
  
  const allProducts = await getCachedProducts();{/*await db.select({
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
  ).limit(500);*/}

  const baseUrl = brand.url.replace(/\/$/, '');

  const jsonLdGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${baseUrl}/shop/#breadcrumb`,
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': baseUrl },
          { '@type': 'ListItem', 'position': 2, 'name': 'Shop', 'item': `${baseUrl}/shop` }
        ]
      },
      {
        '@type': 'ItemList',
        '@id': `${baseUrl}/shop/#itemlist`,
        'name': 'Kickverse Footwear Collection Nairobi',
        'description': 'Comprehensive catalog of sneakers, soccer cleats, and official shoes available for delivery in Nairobi, Kenya.',
        'url': `${baseUrl}/shop`,
        'numberOfItems': allProducts.length,
        'itemListElement': allProducts.slice(0, 50).map((product, index) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'url': `${baseUrl}/product/${product.id}`,
          'name': product.name
        }))
      },
      {
        '@type': 'FAQPage',
        '@id': `${baseUrl}/shop/#faq`,
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'Do you offer delivery in Nairobi CBD?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes, we offer complimentary expedited delivery exclusively within the Nairobi CBD.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Can I pay on delivery for shoes in Kenya?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Absolutely. We operate a trusted pay-on-delivery service for Nairobi and immediate environs to ensure 100% secure shopping.'
            }
          }
        ]
      }
    ]
  };

  const safeJsonLd = JSON.stringify(jsonLdGraph).replace(/</g, '\\u003c');

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