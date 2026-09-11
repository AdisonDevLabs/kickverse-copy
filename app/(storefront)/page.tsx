// app/(storefront)/page.tsx
import { getDb } from '@/lib/db';
import { products, categories, testimonials, storeSettings } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { brand } from '@/lib/data/brand';
import HomeClient from './HomeClient';

// 1. Tell Next.js to use Cloudflare's Edge network
export const revalidate = 60;

// Add SEO Slug Generator Helper
function createSlug(name: string, id: string) {
  if (!name) return id;
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  return `${cleanName}-${id}`;
}

function detectBrand(productName: string): string {
  const knownBrands = ['Nike', 'Adidas', 'Jordan', 'Puma', 'New Balance', 'On Running', 'Asics', 'Vans', 'Converse', 'Timberland', 'Clarks'];
  const matched = knownBrands.find((b) => new RegExp(`\\b${b}\\b`, 'i').test(productName));
  return matched || 'Kickverse';
}

export default async function HomePage() {
  // 2. Await the database initialization
  const db = await getDb();

  // --- PERFORMANCE FIX: Fire all 4 database queries concurrently! ---
  const [allProducts, heroCategories, globalTestimonials, settingsResult] = await db.batch([
    
    // Query 1: Products
    db.select({
      id: products.id,
      name: products.name,
      price: products.price,
      originalPrice: products.originalPrice,
      image: products.image,
      productType: products.productType,
      category: products.category,
      rating: products.rating,
      reviews: products.reviews,
      isNewArrival: products.isNewArrival,
      isBestSeller: products.isBestSeller,
      isFlashDeal: products.isFlashDeal,
      createdAt: products.createdAt,
    })
    .from(products)
    .orderBy(desc(products.createdAt)),

    // Query 2: Categories
    db.select().from(categories),

    // Query 3: Testimonials
    db.select({
      id: testimonials.id,
      name: testimonials.name,
      location: testimonials.location,
      rating: testimonials.rating,
      text: testimonials.text,
      profile: testimonials.profile,
      reviewImage: testimonials.reviewImage, // <--- IMAGE FIX: Added the missing image column! 
      date: testimonials.date,
      purchased: testimonials.purchased,
      isGlobal: testimonials.isGlobal,
      productName: products.name, 
    })
    .from(testimonials)
    .leftJoin(products, eq(testimonials.product, products.id))
    .where(and(eq(testimonials.isGlobal, true), eq(testimonials.isApproved, true))),

    // Query 4: Store Settings
    db.select().from(storeSettings).where(eq(storeSettings.id, 1)).limit(1)
  ]);

  const storeConfig = settingsResult[0] || { 
    happyCustomersText: '500+ Happy Customers', 
    defaultAvatar: '/pexels-wedding-maps-130174465-10114295.jpg',
    fallbackRating: '4.8'
  };

  const totalReviews = globalTestimonials.length;
  const averageRating = totalReviews > 0 
    ? Number((globalTestimonials.reduce((acc: number, curr: any) => acc + curr.rating, 0) / totalReviews).toFixed(1))
    : Number(storeConfig.fallbackRating || 4.8);

  const baseUrl = brand.url.replace(/\/$/, '');

  const jsonLdGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        name: brand.name,
        // Captures search typos: kick verse (pos 9.5), kicksverse (pos 63.3)
        alternateName: ['Kickverse', 'Kick verse', 'Kicksverse', 'Kickverse Kenya', 'Kickverse KE', 'kickverse.co.ke'],
        url: baseUrl,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/shop?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': ['OnlineStore', 'ShoeStore'],
        '@id': `${baseUrl}/#store`,
        name: brand.name,
        alternateName: 'Kickverse KE',
        url: baseUrl,
        logo: `${baseUrl}${brand.logo}`,
        image: `${baseUrl}${brand.logo1}`,
        description: brand.description,
        telephone: `+${brand.whatsappNumber}`,
        priceRange: 'KSh 2,500 - KSh 15,000',
        currenciesAccepted: 'KES',
        paymentAccepted: 'Cash on Delivery, M-Pesa, Mobile Money',
        areaServed: [
          { '@type': 'City', name: 'Nairobi' },
          { '@type': 'AdministrativeArea', name: 'Nairobi County' },
          { '@type': 'Country', name: 'Kenya' }
        ],
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Nairobi CBD',
          addressRegion: 'Nairobi County',
          addressCountry: 'KE'
        },
        sameAs: [
          brand.socialLinks.instagram,
          brand.socialLinks.tiktok,
          brand.socialLinks.tiktokBootRoom,
          brand.socialLinks.whatsappCommunity
        ],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: averageRating.toString(),
          reviewCount: (totalReviews > 0 ? totalReviews : 120).toString(),
          bestRating: '5',
          worstRating: '1'
        }
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${baseUrl}/#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` }
        ]
      },
      {
        '@type': 'ItemList',
        '@id': `${baseUrl}/#itemlist`,
        name: 'Top Footwear & Sneakers in Nairobi - Kickverse KE',
        // Injects full product entities so Google displays price tags in search results
        itemListElement: allProducts.slice(0, 15).map((product: any, index: number) => {
          const productUrl = `${baseUrl}/product/${createSlug(product.name, product.id)}`;
          const imageUrl = product.image.startsWith('http') ? product.image : `${baseUrl}${product.image.startsWith('/') ? '' : '/'}${product.image}`;
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
                seller: { '@type': 'Organization', name: brand.name },
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
              }
            }
          };
        })
      },
      {
        '@type': 'FAQPage',
        '@id': `${baseUrl}/#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How much do shoes and sneakers cost in Kenyan shillings?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Prices at Kickverse range from KSh 2,500 to KSh 15,000 depending on the model. All prices on our website are clearly listed in Kenyan Shillings (KSh).'
            }
          },
          {
            '@type': 'Question',
            name: 'How do I know the sneakers and shoes are authentic and original?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'We guarantee that 100% of the footwear we sell is authentic and original. We inspect every pair thoroughly, and you can inspect them yourself upon delivery before paying.'
            }
          },
          {
            '@type': 'Question',
            name: 'Do you sell hiking boots and walking boots in Kenya?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! We carry a wide selection of durable outdoor hiking boots, walking boots, and trail shoes designed for tough terrain.'
            }
          },
          {
            '@type': 'Question',
            name: 'Can I pay on delivery for shoes in Nairobi?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, we offer Pay On Delivery for orders delivered within Nairobi County and surrounding environs. Inspect your shoes upon arrival before making payment.'
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
      <HomeClient 
        initialProducts={allProducts} 
        initialCategories={heroCategories} 
        initialTestimonials={globalTestimonials}
        storeSettings={storeConfig}
      />
    </>
  );
}