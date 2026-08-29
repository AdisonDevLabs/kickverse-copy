// app/(storefront)/page.tsx
import { getDb } from '@/lib/db';
import { products, categories, testimonials, storeSettings } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { brand } from '@/lib/data/brand';
import HomeClient from './HomeClient';

// 1. Tell Next.js to use Cloudflare's Edge network
export const revalidate = 60;

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

  // 1. WebSite Schema with SearchAction
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${brand.url}/#website`,
    name: brand.name,
    alternateName: ['Kickverse', 'Kickverse Kenya', 'Kickverse KE', 'kickverse.co.ke'],
    url: brand.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${brand.url}/shop?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  // 2. OnlineStore & ShoeStore LocalBusiness Schema
  const storeSchema = {
    '@context': 'https://schema.org',
    '@type': ['OnlineStore', 'ShoeStore'],
    '@id': `${brand.url}/#store`,
    name: brand.name,
    alternateName: 'Kickverse KE',
    url: brand.url,
    logo: `${brand.url}${brand.logo}`,
    image: `${brand.url}${brand.logo1}`,
    description: brand.description,
    telephone: `+${brand.whatsappNumber}`,
    priceRange: 'KSh 1,999 - KSh 6,500',
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
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: `+254${brand.contacts.sneakers.phone.substring(1)}`,
        contactType: 'sales & customer service',
        areaServed: 'KE',
        availableLanguage: ['English', 'Swahili']
      },
      {
        '@type': 'ContactPoint',
        telephone: `+254${brand.contacts.bootRoom.phone.substring(1)}`,
        contactType: 'technical sports footwear',
        areaServed: 'KE',
        availableLanguage: ['English', 'Swahili']
      }
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toString(),
      reviewCount: (totalReviews > 0 ? totalReviews : 120).toString(),
      bestRating: '5',
      worstRating: '1'
    }
  };

  // 3. ItemList Schema for Featured Products
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Top Footwear in Nairobi - Kickverse KE',
    itemListElement: allProducts.slice(0, 10).map((product: any, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${brand.url}/product/${product.id}`,
      name: product.name
    }))
  };

  // 4. FAQPage Schema for Local Intent Queries
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Do you offer free shoe delivery in Nairobi CBD?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Kickverse KE provides complimentary, expedited delivery exclusively within the Nairobi Central Business District (CBD).'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I pay on delivery for shoes in Nairobi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, we offer Pay On Delivery for orders delivered within Nairobi County and surrounding environs. You can inspect your footwear upon arrival before making payment via M-Pesa or cash.'
        }
      },
      {
        '@type': 'Question',
        name: 'What types of soccer cleats are available at Kickverse KE?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We stock Artificial Grass (AG), Turf (TF), and Firm Ground (FG) football boots including the Nike Mercurial, Phantom, Adidas Predator, F50, and Puma Future series suited for Nairobi playing surfaces.'
        }
      }
    ]
  };

  // 3. Construct JSON-LD Schema.org Data for the Storefront Homepage
  const storeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: brand.name,
    url: brand.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${brand.url}/shop?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
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