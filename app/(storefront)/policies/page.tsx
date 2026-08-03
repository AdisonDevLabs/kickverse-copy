// app/(storefront)/policies/page.tsx
import React from 'react';
import { Metadata } from 'next';
import { Truck, RefreshCw, MessageCircle, Ruler, HelpCircle, CheckCircle } from 'lucide-react';
import { brand } from '@/lib/data/brand';

export const metadata: Metadata = {
  title: `Store Policies & Support | ${brand.name}`,
  description: "Information regarding delivery, returns, exchanges, sizing, and how to order from Kickverse KE.",
};

export default function PoliciesPage() {
  return (
    <div className="bg-brand-dark min-h-screen text-white pt-12 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="font-display text-3xl md:text-5xl uppercase tracking-wide text-white mb-4">
            Store Policies & Support
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            Everything you need to know about shopping with {brand.name}. If you have any further questions, our team is always available on WhatsApp.
          </p>
        </div>

        <div className="space-y-8">
          
          {/* How to Order */}
          <section id="how-to-order" className="bg-brand-card p-6 md:p-8 rounded-lg border border-white/5 scroll-mt-32 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <div className="flex items-center mb-6 text-brand-primary border-b border-white/5 pb-4">
              <MessageCircle className="w-6 h-6 mr-3" />
              <h2 className="font-display text-xl md:text-2xl uppercase tracking-widest">How to Order</h2>
            </div>
            <div className="space-y-4 text-gray-300 text-sm md:text-base leading-relaxed">
              <p>We have streamlined our ordering process to be as personal and fast as possible via WhatsApp:</p>
              <ul className="space-y-3 pl-2 mt-4">
                <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-3 mt-1 text-brand-primary shrink-0" /> Browse our collection and find the style you love.</li>
                <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-3 mt-1 text-brand-primary shrink-0" /> Click the <strong>"Order on WhatsApp"</strong> button on any product page.</li>
                <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-3 mt-1 text-brand-primary shrink-0" /> Our team will instantly receive your desired item, confirm your size, verify availability, and arrange delivery details directly with you.</li>
              </ul>
            </div>
          </section>

          {/* Delivery Information */}
          <section id="delivery" className="bg-brand-card p-6 md:p-8 rounded-lg border border-white/5 scroll-mt-32 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div className="flex items-center mb-6 text-brand-primary border-b border-white/5 pb-4">
              <Truck className="w-6 h-6 mr-3" />
              <h2 className="font-display text-xl md:text-2xl uppercase tracking-widest">Delivery Information</h2>
            </div>
            <ul className="space-y-5 text-gray-300 text-sm md:text-base leading-relaxed">
              <li className="bg-black/20 p-4 rounded-md border border-white/5">
                <strong className="text-white block mb-1 text-base">Within Nairobi (Pay on Delivery)</strong> 
                We offer convenient <strong>Pay on Delivery (PoD)</strong> for all orders within Nairobi and its immediate environs. Delivery within the Nairobi CBD is completely complimentary.
              </li>
              <li className="bg-black/20 p-4 rounded-md border border-white/5">
                <strong className="text-white block mb-1 text-base">Outside Nairobi (Pay Before Delivery)</strong> 
                For all orders being shipped outside of Nairobi, <strong>payment is required before the order is dispatched</strong>. Once payment is confirmed, we will ship your package via our trusted countrywide courier partners.
              </li>
            </ul>
          </section>

          {/* Returns & Exchanges */}
          <section id="returns" className="bg-brand-card p-6 md:p-8 rounded-lg border border-white/5 scroll-mt-32 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="flex items-center mb-6 text-brand-primary border-b border-white/5 pb-4">
              <RefreshCw className="w-6 h-6 mr-3" />
              <h2 className="font-display text-xl md:text-2xl uppercase tracking-widest">Returns & Exchanges</h2>
            </div>
            <ul className="space-y-5 text-gray-300 text-sm md:text-base leading-relaxed">
              <li>
                <strong className="text-white">Returns:</strong> We accept returns strictly within <strong>48 hours</strong> of you receiving your order. Please contact our support team immediately via WhatsApp if you wish to initiate a return.
              </li>
              <li>
                <strong className="text-white">Exchanges:</strong> We gladly accept exchanges for different sizes or styles. However, to qualify for an exchange, the product <strong>must be completely clean, unused, and in its original best quality condition</strong>. We reserve the right to reject exchanges if the item shows any signs of wear, dirt, or damage.
              </li>
            </ul>
          </section>

          {/* Size Guide */}
          <section id="size-guide" className="bg-brand-card p-6 md:p-8 rounded-lg border border-white/5 scroll-mt-32 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <div className="flex items-center mb-6 text-brand-primary border-b border-white/5 pb-4">
              <Ruler className="w-6 h-6 mr-3" />
              <h2 className="font-display text-xl md:text-2xl uppercase tracking-widest">Size Guide</h2>
            </div>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-4">
              Sneaker and cleat sizing can vary slightly between different brands (e.g., Nike vs. Adidas). We recommend ordering your standard EU or UK shoe size. 
            </p>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              If you are unsure about the fit of a specific model, please ask our team during your WhatsApp checkout. We have extensive experience with how different silhouettes fit and will ensure you get the perfect pair.
            </p>
          </section>

          {/* FAQ */}
          <section id="faq" className="bg-brand-card p-6 md:p-8 rounded-lg border border-white/5 scroll-mt-32 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
            <div className="flex items-center mb-6 text-brand-primary border-b border-white/5 pb-4">
              <HelpCircle className="w-6 h-6 mr-3" />
              <h2 className="font-display text-xl md:text-2xl uppercase tracking-widest">FAQ & Support</h2>
            </div>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6">
              Have a question that isn't covered here? Our customer support team is ready to assist you.
            </p>
            <a 
              href={`https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent("Hello Kickverse, I have a question regarding your store policies.")}`}
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center px-6 py-3 bg-brand-primary text-black font-bold uppercase tracking-widest text-xs rounded-md hover:bg-brand-hover transition-colors shadow-lg shadow-brand-primary/20"
            >
              <MessageCircle className="w-4 h-4 mr-2" /> Chat with Support
            </a>
          </section>

        </div>
      </div>
    </div>
  );
}