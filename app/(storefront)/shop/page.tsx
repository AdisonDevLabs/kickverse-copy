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

// SEO Slug Generator Helper
function createSlug(name: string, id: string) {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  return `${cleanName}-${id}`;
}

function detectBrand(productName: string): string {
  const knownBrands = ['Nike', 'Adidas', 'Jordan', 'Puma', 'New Balance', 'On Running', 'Asics', 'Vans', 'Converse', 'Timberland', 'Clarks'];
  const matched = knownBrands.find((b) => new RegExp(`\\b${b}\\b`, 'i').test(productName));
  return matched || 'Kickverse';
}

// Normalizes query parameters into clean display text
function formatParam(str?: string): string {
  if (!str) return '';
  const specialCases: Record<string, string> = {
    'opens-and-sandals': 'Opens & Sandals',
    'soccer-cleats': 'Soccer Cleats',
    'official-shoes': 'Official Shoes',
    'hiking-boots': 'Hiking Boots',
    'boots': 'Walking & Hiking Boots',
    'sneakers': 'Sneakers',
  };
  if (specialCases[str.toLowerCase()]) return specialCases[str.toLowerCase()];
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

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

  const categoryName = formatParam(categoryRaw);
  const typeName = formatParam(typeRaw);
  const activeTaxonomy = categoryName || typeName;

  // 3. Construct intelligent fallbacks based on available parameters
  let dynamicTitle = `Buy Sneakers, Boots & Cleats in Kenya | Best Prices in Nairobi - ${brand.name}`;
  let dynamicDescription = `Shop 100% authentic footwear at ${brand.name} Kenya. Explore sneakers, soccer cleats, hiking boots & formal shoes at competitive prices in KSh. Pay on delivery available across Nairobi & nationwide.`;
  
  if (categoryName && typeName) {
    dynamicTitle = `${categoryName} ${typeName} Price in Kenya | Buy Online at ${brand.name}`;
    dynamicDescription = `Order authentic ${categoryName} ${typeName} online in Kenya. Check current prices in KSh, compare sizes, and get same-day dispatch within Nairobi CBD from ${brand.name}.`;
  } else if (categoryRaw?.toLowerCase().includes('boot') || typeRaw?.toLowerCase().includes('boot')) {
    dynamicTitle = `Hiking & Walking Boots Price in Kenya | Outdoor Shoes Nairobi - ${brand.name}`;
    dynamicDescription = `Explore rugged walking boots, outdoor hiking boots, and trail shoes in Kenya. Durable traction, waterproof protection, and fast delivery in Nairobi.`;
  } else if (typeName === 'Soccer Cleats' || categoryName === 'Soccer Cleats') {
    dynamicTitle = `Soccer Cleats & Football Boots Kenya | FG AG Turf Prices in Nairobi - ${brand.name}`;
    dynamicDescription = `Shop original soccer cleats, turf shoes, and Firm Ground football boots in Nairobi, Kenya. Best prices in KSh with instant WhatsApp order & CBD delivery.`;
  } else if (typeName === 'Official Shoes' || categoryName === 'Official Shoes') {
    dynamicTitle = `Men's Official & Leather Shoes Price in Kenya | Nairobi CBD - ${brand.name}`;
    dynamicDescription = `Buy genuine leather official shoes, loafers, and formal office footwear in Nairobi. Best prices in KSh with pay-on-delivery across Kenya.`;
  } else if (typeName === 'Sneakers' || categoryName === 'Sneakers') {
    dynamicTitle = `Latest Sneakers in Nairobi, Kenya | Original Shoes Price in KSh - ${brand.name}`;
    dynamicDescription = `Shop trending Nike, Adidas Samba, New Balance 9060, Asics, and Dunks in Kenya. 100% verified original pairs with free Nairobi CBD dispatch.`;
  } else if (activeTaxonomy) {
    dynamicTitle = `${activeTaxonomy} in Nairobi, Kenya | Buy Authentic at ${brand.name}`;
    dynamicDescription = `Browse authentic ${activeTaxonomy} at ${brand.name}. Best prices in Kenyan Shillings with same-day Nairobi delivery and nationwide shipping.`;
  }

  // Build clean, accurate self-referencing canonical URL
  const canonicalParams = new URLSearchParams();
  if (typeRaw) canonicalParams.set('type', typeRaw);
  if (categoryRaw) canonicalParams.set('category', categoryRaw);
  
  const queryString = canonicalParams.toString();
  const canonicalUrl = `${brand.url.replace(/\/$/, '')}/shop${queryString ? `?${queryString}` : ''}`;
  const ogImage = `${brand.url.replace(/\/$/, '')}/banner.jpg`;

  // 4. Inject highly specific, localized search keywords dynamically
  const dynamicKeywords = [
    activeTaxonomy ? `${activeTaxonomy} price in Kenya` : 'shoes price in Kenya',
    activeTaxonomy ? `buy ${activeTaxonomy} Nairobi` : 'buy sneakers Nairobi',
    activeTaxonomy ? `${activeTaxonomy} Nairobi CBD` : 'sneakers Kenya',
    'shoes price in ksh',
    'how much in kenyan shillings',
    'pay on delivery shoes Nairobi',
    'original sneakers Kenya',
    'authentic footwear Kenya',
    'hiking boots Nairobi',
    'walking boots Kenya',
    'soccer cleats Nairobi',
    'football boots Kenya',
    'official leather shoes Nairobi',
    'adidas samba Kenya',
    'asics Nairobi',
    'nike dunks Kenya',
    'new balance 9060 price in Kenya',
    brand.name,
    'Kickverse KE',
  ];

  return {
    title: dynamicTitle,
    description: dynamicDescription,
    keywords: dynamicKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: dynamicTitle,
      description: dynamicDescription,
      url: canonicalUrl,
      siteName: brand.name,
      locale: 'en_KE',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${brand.name} Footwear Catalog Nairobi Kenya`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: dynamicTitle,
      description: dynamicDescription,
      images: [ogImage],
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
    ).limit(1000);
  },
  ['shop-products-all'], // Cache key
  { 
    revalidate: 3600, // Revalidate every hour
    tags: ['products'] // Allows you to call revalidateTag('products') on upload
  }
);

// 2. Add searchParams to the component props kickverse.storxia.tech
export default async function ShopPage({ searchParams }: Props) {
  
  
  const [resolvedParams, allProducts] = await Promise.all([
    searchParams,
    getCachedProducts(),
  ]);
  {/*await db.select({
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

  const categoryRaw = typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined;
  const typeRaw = typeof resolvedParams.type === 'string' ? resolvedParams.type : undefined;
  const categoryName = formatParam(categoryRaw);
  const typeName = formatParam(typeRaw);
  const activeTaxonomy = categoryName || typeName;

  const baseUrl = brand.url.replace(/\/$/, '');
  const canonicalParams = new URLSearchParams();
  if (typeRaw) canonicalParams.set('type', typeRaw);
  if (categoryRaw) canonicalParams.set('category', categoryRaw);
  const queryString = canonicalParams.toString();
  const currentUrl = `${baseUrl}/shop${queryString ? `?${queryString}` : ''}`;

  // Construct context-aware Breadcrumbs
  const breadcrumbElements: Array<{ '@type': string; position: number; name: string; item: string }> = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
    { '@type': 'ListItem', position: 2, name: 'Shop', item: `${baseUrl}/shop` },
  ];

  if (activeTaxonomy) {
    breadcrumbElements.push({
      '@type': 'ListItem',
      position: 3,
      name: activeTaxonomy,
      item: currentUrl,
    });
  }

  const jsonLdGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${currentUrl}/#webpage`,
        url: currentUrl,
        name: activeTaxonomy ? `${activeTaxonomy} in Kenya | ${brand.name}` : `Footwear Collection Nairobi | ${brand.name}`,
        description: `Explore authentic sneakers, boots, and soccer cleats with live prices in KSh and pay on delivery across Kenya.`,
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${baseUrl}/#website`,
          name: brand.name,
          url: baseUrl,
        },
        breadcrumb: {
          '@id': `${currentUrl}/#breadcrumb`,
        },
        mainEntity: {
          '@id': `${currentUrl}/#itemlist`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${currentUrl}/#breadcrumb`,
        'itemListElement': breadcrumbElements,
      },
      {
        '@type': 'ItemList',
        '@id': `${currentUrl}/#itemlist`,
        name: activeTaxonomy ? `${activeTaxonomy} - Kickverse Kenya` : 'All Footwear - Kickverse Kenya',
        description: `Complete catalog of verified sneakers, football boots, hiking boots, and official shoes available in Nairobi, Kenya.`,
        'url': currentUrl,
        'numberOfItems': allProducts.length,
        'itemListElement': allProducts.slice(0, 60).map((product, index) => {
          const productUrl = `${baseUrl}/product/${createSlug(product.name, product.id)}`;
          const imageUrl = product.image.startsWith('http')
            ? product.image
            : `${baseUrl}${product.image.startsWith('/') ? '' : '/'}${product.image}`;

          return {
            '@type': 'ListItem',
            position: index + 1,
            url: productUrl,
            name: product.name,
            item: {
              '@type': 'Product',
              name: product.name,
              description: `Buy original ${product.name} in Kenya. Authentic ${detectBrand(product.name)} footwear available with pay on delivery in Nairobi.`,
              url: productUrl,
              image: imageUrl,
              brand: {
                '@type': 'Brand',
                name: detectBrand(product.name),
              },
              offers: {
                '@type': 'Offer',
                priceCurrency: 'KES',
                price: product.price,
                validFrom: '2026-01-01',
                priceValidUntil: '2027-12-31',
                availability: 'https://schema.org/InStock',
                itemCondition: 'https://schema.org/NewCondition',
                seller: {
                  '@type': 'Organization',
                  name: brand.name,
                },
                shippingDetails: {
                  '@type': 'OfferShippingDetails',
                  shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'KES' },
                  shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'KE', addressRegion: 'Nairobi County' },
                  deliveryTime: {
                    '@type': 'ShippingDeliveryTime',
                    handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
                    transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' },
                  },
                },
                hasMerchantReturnPolicy: {
                  '@type': 'MerchantReturnPolicy',
                  applicableCountry: 'KE',
                  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                  merchantReturnDays: 7,
                  returnMethod: 'https://schema.org/ReturnByMail',
                  returnFees: 'https://schema.org/FreeReturn'
                }
              },
            },
          };
        }),
      },
      {
        '@type': 'FAQPage',
        '@id': `${currentUrl}/shop/#faq`,
        'mainEntity': [
          {
            '@type': 'Question',
            name: 'How much do sneakers and shoes cost in Kenya?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Footwear prices at Kickverse range from KSh 3,500 to KSh 14,500 depending on the model, brand, and type (sneakers, soccer cleats, hiking boots, or official shoes). All prices are displayed in Kenyan Shillings (KSh).`,
            },
          },
          {
            '@type': 'Question',
            name: 'Are all shoes at Kickverse authentic and original?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Every pair in our catalog is guaranteed 100% authentic and original. We inspect each pair prior to packaging and provide pay-on-delivery in Nairobi so you can verify the item before payment.',
            },
          },
          {
            '@type': 'Question',
            name: 'Where can I buy original sneakers, boots, and cleats in Nairobi?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'You can order directly online at Kickverse KE or via WhatsApp. We provide complimentary expedited dispatch within Nairobi CBD and reliable courier delivery nationwide across Kenya.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I pay on delivery for shoes in Kenya?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. We provide Pay on Delivery across Nairobi and surrounding environs. You inspect your shoes first to ensure the right fit and quality before making payment.',
            },
          },
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