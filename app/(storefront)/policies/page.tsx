import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { 
  Truck, 
  RefreshCw, 
  MessageCircle, 
  Ruler, 
  HelpCircle, 
  CheckCircle, 
  ShieldCheck, 
  MapPin, 
  ChevronRight 
} from 'lucide-react';
import { brand } from '@/lib/data/brand';

export const metadata: Metadata = {
  title: `Store Policies, Authenticity & Pay on Delivery Shoes Nairobi | ${brand.name}`,
  description: `Official store policies for ${brand.name}. Learn about our 100% authenticity guarantee, Pay on Delivery in Nairobi, shoe prices in KSh, and 48-hour exchanges.`,
  keywords: [
    "Kickverse store policies",
    "pay on delivery shoes Nairobi",
    "is Kickverse authentic",
    "buy shoes online Nairobi CBD",
    "are Kickverse shoes original",
    "soccer cleats delivery Kenya",
    "where to buy sneakers in Kenya",
    "walking boots Kenya",
    "shoe prices in KSh"
  ],
  alternates: {
    canonical: "/policies",
  },
  openGraph: {
    title: `Store Policies, Authenticity & Support | ${brand.name} Kenya`,
    description: `Complete guide on shopping, delivery logistics, authenticity guarantees, and shoe sizing with ${brand.name} in Nairobi and across Kenya.`,
    url: "/policies",
    type: "website",
  },
};

export default function PoliciesPage() {
  const domain = "https://kickverse.co.ke";

  // JSON-LD Structured Data for FAQPage and Breadcrumbs
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": domain },
          { "@type": "ListItem", "position": 2, "name": "Policies & Support", "item": `${domain}/policies` }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Are the sneakers, boots, and cleats at Kickverse authentic?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. We guarantee that all footwear sold at Kickverse is 100% authentic and original. You can inspect your shoes upon delivery to verify their quality before paying."
            }
          },
          {
            "@type": "Question",
            "name": "Where can I buy original sneakers and cleats online in Kenya?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can buy original sneakers, walking boots, and cleats directly on our website, kickverse.co.ke. We offer free delivery within Nairobi CBD and Pay on Delivery for Nairobi County."
            }
          },
          {
            "@type": "Question",
            "name": "How much do shoes cost in Kenyan Shillings?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Prices range from KSh 2,500 to KSh 15,000 depending on the model. All prices on our website are transparently listed in KSh with no hidden fees."
            }
          },
          {
            "@type": "Question",
            "name": "How do I order sneakers and soccer cleats from Kickverse KE?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Browse our collection on kickverse.co.ke and click the 'Order on WhatsApp' button. Our customer support team will immediately confirm your exact size, verify stock, and coordinate delivery."
            }
          },
          {
            "@type": "Question",
            "name": "Does Kickverse KE offer Pay on Delivery in Nairobi?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. We offer convenient Pay on Delivery (PoD) for all orders within Nairobi County. Delivery within the Nairobi Central Business District (CBD) is completely complimentary."
            }
          },
          {
            "@type": "Question",
            "name": "What is the return and exchange policy at Kickverse KE?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We accept exchange requests within 48 hours of delivery for different sizes or styles. Returned items must be clean, unworn, and preserved in their original condition."
            }
          }
        ]
      }
    ]
  };

  return (
    <>
      {/* Search Engine Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="bg-brand-dark min-h-screen text-white pt-8 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center text-xs text-gray-400">
            <Link href="/" className="hover:text-brand-primary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 mx-2 text-gray-600" />
            <span className="text-gray-200">Policies & Support</span>
          </nav>

          {/* Page Header */}
          <header className="mb-12 border-b border-white/10 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl uppercase tracking-wide text-white mb-4">
              Customer Support & Store Policies
            </h1>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-2xl">
              Complete details on shopping with {brand.name}. Learn how our streamlined WhatsApp checkout, localized Nairobi delivery, reliable countrywide shipping, and hassle-free exchange workflows operate.
            </p>
          </header>

          <div className="space-y-8">
            
            {/* Section 1: How to Order */}
            <section 
              id="how-to-order" 
              aria-labelledby="how-to-order-heading"
              className="bg-brand-card p-6 md:p-8 rounded-lg border border-white/5 scroll-mt-32 shadow-sm"
            >
              <div className="flex items-center mb-6 text-brand-primary border-b border-white/5 pb-4">
                <MessageCircle className="w-6 h-6 mr-3 shrink-0" />
                <h2 id="how-to-order-heading" className="font-display text-xl md:text-2xl uppercase tracking-widest">
                  How to Order via WhatsApp
                </h2>
              </div>
              <div className="space-y-4 text-gray-300 text-sm md:text-base leading-relaxed">
                <p>
                  We have eliminated complex checkout forms to provide a direct, personal shopping experience customized for Kenyan buyers:
                </p>
                <ol className="space-y-3 pl-1 mt-4 list-decimal list-inside text-gray-200">
                  <li className="pl-1">
                    <strong>Select Your Footwear:</strong> Browse our curated catalog of sneakers, professional soccer cleats, official shoes, or casual slides.
                  </li>
                  <li className="pl-1">
                    <strong>Initiate WhatsApp Checkout:</strong> Click the <span className="text-brand-primary font-semibold">"Order on WhatsApp"</span> button on your chosen item.
                  </li>
                  <li className="pl-1">
                    <strong>Confirm Size & Logistics:</strong> Our sales representatives immediately confirm stock availability, verify sizing requirements, and schedule your doorstep dispatch.
                  </li>
                </ol>
              </div>
            </section>

            {/* Section 2: Authenticity & Pricing (New SEO Section) */}
            <section 
              id="authenticity" 
              aria-labelledby="authenticity-heading"
              className="bg-brand-card p-6 md:p-8 rounded-lg border border-white/5 scroll-mt-32 shadow-sm"
            >
              <div className="flex items-center mb-6 text-brand-primary border-b border-white/5 pb-4">
                <ShieldCheck className="w-6 h-6 mr-3 shrink-0" />
                <h2 id="authenticity-heading" className="font-display text-xl md:text-2xl uppercase tracking-widest">
                  Authenticity & Pricing Guarantees
                </h2>
              </div>
              <div className="space-y-4 text-gray-300 text-sm md:text-base leading-relaxed">
                <p>
                  We are frequently asked, <em>&ldquo;Are these shoes real?&rdquo;</em> and <em>&ldquo;How do I know they are legit?&rdquo;</em> 
                  <strong> We guarantee that 100% of the footwear sold at {brand.name} is authentic and original.</strong>
                </p>
                <p>
                  Every pair—from lifestyle sneakers and walking boots to professional soccer cleats—undergoes strict physical quality verification prior to dispatch. Furthermore, all prices are transparently listed in <strong>Kenyan Shillings (KSh)</strong> with no hidden fees, ensuring you get the best shoe prices in Kenya.
                </p>
              </div>
            </section>

            {/* Section 3: Delivery & Logistics */}
            <section 
              id="delivery" 
              aria-labelledby="delivery-heading"
              className="bg-brand-card p-6 md:p-8 rounded-lg border border-white/5 scroll-mt-32 shadow-sm"
            >
              <div className="flex items-center mb-6 text-brand-primary border-b border-white/5 pb-4">
                <Truck className="w-6 h-6 mr-3 shrink-0" />
                <h2 id="delivery-heading" className="font-display text-xl md:text-2xl uppercase tracking-widest">
                  Delivery Information & Shipping Options
                </h2>
              </div>
              <div className="space-y-4 text-gray-300 text-sm md:text-base leading-relaxed">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-black/30 p-5 rounded-md border border-white/5">
                    <div className="flex items-center text-white font-bold mb-2">
                      <MapPin className="w-4 h-4 mr-2 text-brand-primary" />
                      Nairobi & Environs (Pay on Delivery)
                    </div>
                    <p className="text-sm text-gray-300 leading-normal">
                      We offer <strong>Pay on Delivery (PoD)</strong> across Nairobi and nearby neighborhoods. Deliveries directly within the <strong>Nairobi CBD are complimentary</strong>.
                    </p>
                  </div>
                  <div className="bg-black/30 p-5 rounded-md border border-white/5">
                    <div className="flex items-center text-white font-bold mb-2">
                      <Truck className="w-4 h-4 mr-2 text-brand-primary" />
                      Countrywide Kenya (Courier Dispatch)
                    </div>
                    <p className="text-sm text-gray-300 leading-normal">
                      For upcountry deliveries outside Nairobi, <strong>payment is required prior to parcel dispatch</strong> via verified courier and bus parcel services.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Returns & Exchanges */}
            <section 
              id="returns" 
              aria-labelledby="returns-heading"
              className="bg-brand-card p-6 md:p-8 rounded-lg border border-white/5 scroll-mt-32 shadow-sm"
            >
              <div className="flex items-center mb-6 text-brand-primary border-b border-white/5 pb-4">
                <RefreshCw className="w-6 h-6 mr-3 shrink-0" />
                <h2 id="returns-heading" className="font-display text-xl md:text-2xl uppercase tracking-widest">
                  Returns & Size Exchanges
                </h2>
              </div>
              <div className="space-y-4 text-gray-300 text-sm md:text-base leading-relaxed">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <ShieldCheck className="w-5 h-5 mr-3 mt-0.5 text-brand-primary shrink-0" />
                    <span><strong>48-Hour Exchange Window:</strong> We facilitate exchanges for alternative sizes or styles within 48 hours of parcel receipt. Reach out to our WhatsApp help desk to initiate a swap.</span>
                  </li>
                  <li className="flex items-start">
                    <ShieldCheck className="w-5 h-5 mr-3 mt-0.5 text-brand-primary shrink-0" />
                    <span><strong>Item Condition Requirement:</strong> Exchanged footwear must remain completely unworn, clean, uncreased, and enclosed within the original packaging.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 5: Size & Surface Guide */}
            <section 
              id="size-guide" 
              aria-labelledby="size-guide-heading"
              className="bg-brand-card p-6 md:p-8 rounded-lg border border-white/5 scroll-mt-32 shadow-sm"
            >
              <div className="flex items-center mb-6 text-brand-primary border-b border-white/5 pb-4">
                <Ruler className="w-6 h-6 mr-3 shrink-0" />
                <h2 id="size-guide-heading" className="font-display text-xl md:text-2xl uppercase tracking-widest">
                  Footwear Sizing & Pitch Surface Guide
                </h2>
              </div>
              <div className="space-y-4 text-gray-300 text-sm md:text-base leading-relaxed">
                <p>
                  Footwear sizing can differ slightly across athletic brands (e.g., Nike, Adidas, New Balance, Puma). We utilize standard <strong>EU / UK size metrics</strong> across all product listings.
                </p>
                <div className="bg-black/20 p-4 rounded-md border border-white/5 text-sm space-y-2">
                  <h3 className="text-white font-semibold">Soccer Cleats Surface Compatibility:</h3>
                  <p><strong>Firm Ground (FG):</strong> Optimized for natural grass pitches.</p>
                  <p><strong>Artificial Grass / Turf (AG / TF):</strong> Built with shorter, dense rubber studs designed for Nairobi 5-a-side and synthetic astro-turf pitches.</p>
                </div>
                <p className="text-xs text-gray-400">
                  Unsure about the fit of a specific silhouette? Request a live insole measurement check via WhatsApp before we dispatch your order.
                </p>
              </div>
            </section>

            {/* Section 6: Frequently Asked Questions */}
            <section 
              id="faq" 
              aria-labelledby="faq-heading"
              className="bg-brand-card p-6 md:p-8 rounded-lg border border-white/5 scroll-mt-32 shadow-sm"
            >
              <div className="flex items-center mb-6 text-brand-primary border-b border-white/5 pb-4">
                <HelpCircle className="w-6 h-6 mr-3 shrink-0" />
                <h2 id="faq-heading" className="font-display text-xl md:text-2xl uppercase tracking-widest">
                  Frequently Asked Questions (FAQ)
                </h2>
              </div>
              <div className="space-y-4">
                <div className="border-b border-white/5 pb-4">
                  <h3 className="text-white font-semibold text-base mb-1">Are the sneakers, boots, and shoes authentic?</h3>
                  <p className="text-gray-300 text-sm">Yes. We guarantee that all footwear sold at Kickverse is 100% authentic and original. You can inspect your shoes upon delivery to verify their quality before paying.</p>
                </div>
                <div className="border-b border-white/5 pb-4">
                  <h3 className="text-white font-semibold text-base mb-1">Where can I buy original sneakers online in Kenya?</h3>
                  <p className="text-gray-300 text-sm">You can order directly here on kickverse.co.ke or via our WhatsApp desk. We offer free delivery within Nairobi CBD and Pay on Delivery across Nairobi County.</p>
                </div>
                <div className="border-b border-white/5 pb-4">
                  <h3 className="text-white font-semibold text-base mb-1">Are all pairs inspected before delivery?</h3>
                  <p className="text-gray-300 text-sm">Yes. Every sneaker, cleat, and official shoe undergoes strict physical quality verification prior to dispatch to ensure pristine condition.</p>
                </div>
                <div className="border-b border-white/5 pb-4">
                  <h3 className="text-white font-semibold text-base mb-1">How fast is delivery within Nairobi?</h3>
                  <p className="text-gray-300 text-sm">Most orders within Nairobi and adjacent suburbs are delivered the same day or within 24 hours of placement.</p>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base mb-1">Can I order multiple sizes to try on?</h3>
                  <p className="text-gray-300 text-sm">For selected Nairobi CBD deliveries, we can arrange for our courier to carry adjacent sizes upon prior request to ensure a tailored fit.</p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-white font-semibold">Still have questions?</h3>
                  <p className="text-xs text-gray-400">Our customer support team is available on WhatsApp.</p>
                </div>
                <a 
                  href={`https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent("Hello Kickverse KE, I have a question regarding store policies and delivery.")}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-brand-primary text-black font-bold uppercase tracking-widest text-xs rounded-md hover:bg-brand-hover transition-colors shadow-lg shadow-brand-primary/20 shrink-0"
                >
                  <MessageCircle className="w-4 h-4 mr-2" /> Chat with Support
                </a>
              </div>
            </section>

          </div>
        </div>
      </div>
    </>
  );
}