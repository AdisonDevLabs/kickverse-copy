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
  title: `Store Policies, Delivery & Pay on Delivery Support | ${brand.name} Nairobi`,
  description: `Official store policies for ${brand.name}. Learn about Pay on Delivery in Nairobi, complimentary CBD dispatch, countrywide courier shipping across Kenya, 48-hour exchanges, and sneaker sizing.`,
  keywords: [
    "Kickverse store policies",
    "sneakers pay on delivery Nairobi",
    "buy shoes online Nairobi CBD",
    "soccer cleats delivery Kenya",
    "Kickverse returns and exchanges",
    "shoe sizing guide Kenya"
  ],
  alternates: {
    canonical: "/policies",
  },
  openGraph: {
    title: `Store Policies & Support | ${brand.name} Kenya`,
    description: `Complete guide on shopping, delivery logistics, returns, and shoe sizing with ${brand.name} in Nairobi and across Kenya.`,
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
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": domain
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Policies & Support",
            "item": `${domain}/policies`
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How do I order sneakers and soccer cleats from Kickverse KE?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Browse our collection on kickverse.co.ke and click the 'Order on WhatsApp' button on any product page. Our customer support team will immediately confirm your exact size, verify stock availability, and coordinate delivery details directly with you."
            }
          },
          {
            "@type": "Question",
            "name": "Does Kickverse KE offer Pay on Delivery in Nairobi?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. We offer convenient Pay on Delivery (PoD) for all orders within Nairobi County and its immediate environs. Additionally, doorstep delivery within the Nairobi Central Business District (CBD) is completely complimentary."
            }
          },
          {
            "@type": "Question",
            "name": "How does parcel delivery work outside Nairobi?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "For orders shipped outside Nairobi across Kenya, payment confirmation is required prior to dispatch. Once verified, packages are shipped through trusted countrywide courier and parcel services for prompt doorstep or station collection."
            }
          },
          {
            "@type": "Question",
            "name": "What is the return and exchange policy at Kickverse KE?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We accept exchange requests within 48 hours of delivery for different sizes or styles. All returned items must be completely clean, unworn, and preserved in their original condition with all tags and packaging intact."
            }
          },
          {
            "@type": "Question",
            "name": "How do I choose the correct shoe or cleat size?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We recommend choosing your standard UK or EU footwear size. If you are ordering performance soccer cleats (FG, AG, or TF) or specific sneaker silhouettes, our team can advise you on exact fit and half-size adjustments directly over WhatsApp before dispatch."
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

            {/* Section 2: Delivery & Logistics */}
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

            {/* Section 3: Returns & Exchanges */}
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

            {/* Section 4: Size & Surface Guide */}
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

            {/* Section 5: Frequently Asked Questions */}
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