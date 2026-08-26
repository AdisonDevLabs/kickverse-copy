// app/(storefront)/product/[id]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { brand } from '@/lib/data/brand';
import ProductDetailsClient from './ProductDetailsClient';
import { getDb } from '@/lib/db';
import { products, testimonials, sizeGuides, colorMap } from '@/lib/db/schema';
import { eq, and, not, sql, desc } from 'drizzle-orm';

export const revalidate = 60;

type Props = {
  params: Promise<{ id: string }>;
}

function detectBrand(productName: string): string {
  const knownBrands = ['Nike', 'Adidas', 'Jordan', 'Puma', 'New Balance', 'On Running', 'Asics', 'Vans', 'Converse', 'Timberland', 'Clarks'];
  const matched = knownBrands.find((b) => new RegExp(`\\b${b}\\b`, 'i').test(productName));
  return matched || 'Kickverse';
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const db = await getDb();
  
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  const product = result[0];
  
  if (!product) {
    notFound(); 
  }

  const detectedBrand = detectBrand(product.name);
  const previewImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : product.image;

  const absoluteImageUrl = previewImage.startsWith('http') 
    ? previewImage 
    : `${brand.url.replace(/\/$/, '')}${previewImage.startsWith('/') ? '' : '/'}${previewImage}`;

  const baseKeywords = [
    product.name,
    `Buy ${product.name} Nairobi`,
    `Buy ${product.name} online Kenya`,
    `${product.name} price in Kenya`,
    `Original ${product.name} delivery Nairobi`,
    `${detectedBrand} shoes Nairobi`,
    `${product.category} Nairobi CBD`,
    'Pay on delivery shoes Nairobi',
    'Kickverse KE',
  ];

  // FIXED: Checked product.category for Official Shoes and Sandals instead of productType
  if (product.productType === 'Soccer Cleats') {
    baseKeywords.push(
      'Football boots Kenya',
      'Soccer cleats Nairobi CBD',
      'Original soccer boots Nairobi',
      'Firm Ground FG football boots Kenya',
      'Artificial Grass AG turf shoes Nairobi',
      'Buy soccer cleats online Nairobi'
    );
  } else if (product.category === 'Official Shoes') {
    baseKeywords.push(
      'Pure leather official shoes Nairobi',
      'Men formal shoes Nairobi CBD',
      'Office loafers Nairobi',
      'Genuine leather shoes Kenya'
    );
  } else if (product.category === 'Opens & Sandals' || (product.category && product.category.toLowerCase().includes('sandal'))) {
    baseKeywords.push(
      'Casual slides Nairobi',
      'Men leather sandals Kenya',
      'Suede clogs Nairobi',
      'Comfort sandals delivery Nairobi'
    );
  } else {
    baseKeywords.push(
      'Sneakers Nairobi',
      'Original streetwear shoes Kenya',
      'Affordable sneakers Nairobi CBD',
      'Trending sneakers Kenya'
    );
  }

  const formattedPrice = `KSh ${Number(product.price).toLocaleString()}`;
  const metaTitle = `Buy ${product.name} in Nairobi, Kenya | ${brand.name}`;

  const cleanDescription = (product.description || '')
    .replace(/(<([^>]+)>)/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 120);

  const localDescription = `Buy original ${product.name} for ${formattedPrice} at ${brand.name}. Free expedited delivery within Nairobi CBD, pay on delivery available across Nairobi & nationwide Kenya. ${cleanDescription}...`;

  return {
    title: product.name, 
    description: localDescription,
    keywords: baseKeywords,
    alternates: {
      canonical: `${brand.url}/product/${id}`,
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
      title: `${product.name} - ${formattedPrice} | ${brand.name} Nairobi`,
      description: localDescription,
      url: `${brand.url}/product/${id}`,
      siteName: brand.name,
      images: [
        {
          url: absoluteImageUrl,
          width: 800,
          height: 800,
          alt: `Buy ${product.name} online in Nairobi Kenya at Kickverse`,
        },
      ],
      locale: 'en_KE',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | ${brand.name} Nairobi`,
      description: localDescription,
      images: [absoluteImageUrl],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const db = await getDb();
  
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  const product = result[0];

  if (!product) {
    notFound(); 
  }

  const [allSizeGuides, allColorMaps, relatedPool, productReviews, recentlyViewedPool] = await Promise.all([
    db.select().from(sizeGuides),
    db.select().from(colorMap),
    db.select({ id: products.id, name: products.name, price: products.price, image: products.image })
      .from(products)
      .where(and(eq(products.productType, product.productType), eq(products.isAccessory, false), not(eq(products.id, product.id))))
      .orderBy(desc(products.createdAt))
      .limit(12),
    db.select()
      .from(testimonials)
      .where(and(eq(testimonials.product, product.id), eq(testimonials.isApproved, true)))
      .orderBy(desc(testimonials.id)),
    db.select({ id: products.id, name: products.name, image: products.image })
      .from(products)
      .where(not(eq(products.id, product.id)))
      .orderBy(sql`CASE WHEN ${products.productType} = ${product.productType} THEN 0 ELSE 1 END`, desc(products.createdAt))
      .limit(20)
  ]);

  const relatedProducts = relatedPool.sort(() => 0.5 - Math.random()).slice(0, 4);
  const recentlyViewed = recentlyViewedPool.sort(() => 0.5 - Math.random()).slice(0, 8);

  const imagesList = product.images && product.images.length > 0 ? product.images : [product.image];
  const absoluteImages = imagesList.map((img: string) =>
    img.startsWith('http') ? img : `${brand.url.replace(/\/$/, '')}${img.startsWith('/') ? '' : '/'}${img}`
  );

  const detectedBrand = detectBrand(product.name);
  const reviewCount = productReviews.length;
  const averageRating = reviewCount > 0
    ? (productReviews.reduce((acc, curr) => acc + Number(curr.rating || 5), 0) / reviewCount).toFixed(1)
    : Number(product.rating || 5.0).toFixed(1);

  const productSchema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: absoluteImages,
    description: product.description?.replace(/(<([^>]+)>)/gi, '') || product.name,
    sku: `KV-${product.id}`,
    mpn: `KV-${product.id}`,
    category: product.category,
    brand: {
      '@type': 'Brand',
      name: detectedBrand,
    },
    offers: {
      '@type': 'Offer',
      url: `${brand.url}/product/${product.id}`,
      priceCurrency: 'KES',
      price: product.price,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: brand.name,
        url: brand.url,
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
    },
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
      // FIXED: Used rev.date instead of rev.createdAt
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
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      
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