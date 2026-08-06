// app/product/[id]/ProductDetailsClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Minus, Plus, ShoppingBag, MessageCircle, ArrowLeft, ShieldCheck, Truck, X, HelpCircle, CheckCircle, SearchX, Quote, Activity, Wind, Target, Zap, Camera } from 'lucide-react';
import { formatPrice } from '@/lib/data';
import { productReviews } from '@/lib/data/testimonials';
import { brand } from '@/lib/data/brand';
import { useCart } from '@/lib/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/animations';

export default function ProductDetailsClient({ product, relatedProducts, recentlyViewed, sizeGuides }: any) {
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();
  
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes?.[0] || '');
  const [activeImage, setActiveImage] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState(sizeGuides?.[0]?.id || '');
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  // Derived state: The gallery acts as the variant selector
  const selectedColor = product?.colors && product.colors.length > 0 
    ? (product.colors[activeImage] || product.colors[0]) 
    : '';

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImage(0); 
    if (product) {
       setSelectedSize(product.sizes?.[0] || '');
       if (product.productType === 'Soccer Cleats' && sizeGuides) {
         const cleatGuide = sizeGuides.find((g: any) => g.id.toLowerCase().includes('cleat') || g.id.toLowerCase().includes('performance'));
         if (cleatGuide) setActiveGuideTab(cleatGuide.id);
       }
    }
  }, [product?.id, product, sizeGuides]);

  if (!product) {
    return (
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-brand-dark text-white pt-[120px]">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6"><SearchX className="h-8 w-8 text-gray-400" /></div>
        <h2 className="font-display text-3xl md:text-4xl uppercase tracking-wide mb-3">Product Not Found</h2>
        <button onClick={() => router.push('/shop')} className="inline-flex h-14 px-8 bg-white text-black font-bold uppercase tracking-widest hover:bg-brand-primary transition-colors items-center justify-center rounded-md mt-6">Back to Shop</button>
      </motion.div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleImageSelect = (idx: number) => {
    setActiveImage(idx);
  };

  const triggerSizeError = () => {
    setSizeError(true);
    document.getElementById('size-selector-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => setSizeError(false), 3000);
  };

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes && product.sizes.length > 0) return triggerSizeError();
    addToCart(product, selectedSize, selectedColor, quantity);
    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 4000);
  };
  
  const [quantity, setQuantity] = useState(1);
  const handleWhatsAppCheckout = () => {
    if (!selectedSize && product.sizes && product.sizes.length > 0) return triggerSizeError();
    const productUrl = window.location.href;
    const message = `Hello ${brand.name},\n\nI'd like to order:\n\n• Product: ${product.name}\n${selectedSize ? `• Size: ${selectedSize}\n` : ''}${selectedColor ? `• Color: ${selectedColor}\n` : ''}• Quantity: ${quantity}\n\nPlease confirm availability.\n\n${productUrl}`;
    window.open(`https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="bg-brand-dark text-white min-h-screen relative pb-28 md:pb-0">
      
      {/* Context-Aware Breadcrumbs */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-brand-card py-4 px-6 border-b border-white/10 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center text-xs font-bold uppercase tracking-widest text-gray-500">
          <Link href="/" className="hover:text-white transition-colors">Home</Link> <span className="mx-2 text-white/20">/</span>
          <Link href="/shop" className="hover:text-white transition-colors">Shop</Link> <span className="mx-2 text-white/20">/</span>
          <span className="text-brand-primary truncate">{product.name}</span>
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="md:hidden w-full bg-brand-card border-b border-white/10 px-4 py-3">
        <button onClick={() => router.back()} className="flex items-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back To Shop
        </button>
      </motion.div>

      <div className="pt-6 md:pt-12">
        <div className="max-w-7xl mx-auto px-0 md:px-6 md:pb-12">
          <div className="flex flex-col md:flex-row gap-0 md:gap-12 lg:gap-16">
            
            {/* Image Gallery (Source of truth for variants) */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="md:w-1/2 md:sticky md:top-24 h-fit z-10">
              <div className="relative aspect-[3/4] md:aspect-[4/5] w-full max-h-[calc(100vh-200px)] bg-brand-card overflow-hidden border-b md:border border-white/10 group md:rounded-md">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImage}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, { offset }) => {
                      if (offset.x < -50) handleImageSelect((activeImage + 1) % images.length);
                      else if (offset.x > 50) handleImageSelect((activeImage - 1 + images.length) % images.length);
                    }}
                  >
                    <Image src={images[activeImage]} alt={`${product.name} view`} fill priority className="object-cover" />
                  </motion.div>
                </AnimatePresence>
                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md z-20 md:hidden pointer-events-none">
                  {activeImage + 1} / {images.length}
                </div>
              </div>
              
              <div className="hidden md:flex gap-4 mt-4 overflow-x-auto hide-scrollbar pb-2">
                {images.map((img: string, idx: number) => (
                  <button 
                    key={idx} onClick={() => handleImageSelect(idx)}
                    className={`relative w-24 aspect-square flex-shrink-0 bg-brand-card border rounded-md overflow-hidden transition-all ${activeImage === idx ? 'border-brand-primary opacity-100' : 'border-white/10 opacity-50 hover:opacity-100'}`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Product Info Panel */}
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="md:w-1/2 p-6 md:p-0 flex flex-col z-0">
              
              {/* Identity Header */}
              <motion.div variants={staggerItem} className="mb-8 mt-2 md:mt-0 border-b border-white/10 pb-6">
                <h1 className="font-display uppercase tracking-wide text-3xl sm:text-4xl text-white leading-[1.1] mb-2">{product.name}</h1>
                <div className="flex items-center text-brand-primary mb-4 text-xs font-bold tracking-widest">
                  {[1,2,3,4,5].map((s) => <Star key={s} className={`h-4 w-4 ${s <= (product.rating || 5) ? 'fill-current' : 'text-gray-600'}`} />)}
                  <span className="ml-2 text-white">{product.rating || '5.0'} ({product.reviews || '120'} Reviews)</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-sans font-medium text-white">{formatPrice(product.price)}</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-primary flex items-center bg-brand-primary/10 px-2 py-1 rounded-md"><CheckCircle className="w-3 h-3 mr-1" /> In Stock</span>
                </div>
              </motion.div>

              {/* Colorway & Size */}
              <motion.div variants={staggerItem} className="space-y-6 mb-8">
                {selectedColor && (
                  <div>
                    <span className="font-bold text-gray-400 uppercase tracking-widest text-xs block mb-2">Selected Colorway</span>
                    <div className="text-sm font-bold text-white uppercase tracking-widest">{selectedColor}</div>
                    <div className="flex gap-2 mt-3">
                      {product.colors?.map((_: any, idx: number) => (
                        <div key={idx} className={`w-2 h-2 rounded-full ${idx === activeImage ? 'bg-brand-primary' : 'bg-white/20'}`} />
                      ))}
                    </div>
                  </div>
                )}

                {product.sizes && product.sizes.length > 0 && (
                  <div id="size-selector-container" className={`transition-colors duration-300 rounded-md ${sizeError ? 'bg-red-500/10 border border-red-500/50 p-4 -mx-4' : ''}`}>
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-white uppercase tracking-widest text-xs flex items-center">Select Size {sizeError && <span className="text-red-500 ml-3 animate-pulse">Required *</span>}</span>
                      <button onClick={() => setShowSizeGuide(true)} className="text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:text-white flex items-center underline underline-offset-4"><HelpCircle className="w-3 h-3 mr-1" /> Size Guide</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size: string) => (
                        <button
                          key={size} onClick={() => { setSelectedSize(size); setSizeError(false); }}
                          className={`h-12 flex-1 min-w-[60px] rounded-md font-bold text-sm transition-all border ${selectedSize === size ? 'bg-brand-primary text-black border-brand-primary' : 'bg-brand-card border-white/10 text-white hover:border-white'}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Action Buttons */}
              <motion.div variants={staggerItem} className="flex flex-col gap-4 mb-8 border-b border-white/10 pb-8">
                <div className="mb-2">
                  <span className="font-bold text-white uppercase tracking-widest text-xs block mb-3">Quantity</span>
                  <div className="inline-flex items-center border border-white/20 bg-brand-card rounded-md overflow-hidden">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"><Minus className="h-4 w-4" /></button>
                    <span className="w-12 text-center text-sm font-bold text-white">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"><Plus className="h-4 w-4" /></button>
                  </div>
                </div>

                {/* Primary CTA */}
                <button onClick={handleWhatsAppCheckout} className="w-full h-16 bg-[#25D366] text-black font-bold uppercase tracking-widest text-sm flex items-center justify-center hover:bg-[#1ebe57] transition-colors rounded-md shadow-lg shadow-[#25D366]/20">
                  <MessageCircle className="h-5 w-5 mr-3" /> ORDER ON WHATSAPP
                </button>
                
                {/* Secondary CTA */}
                <button onClick={handleAddToCart} className="w-full h-14 bg-transparent border border-white/20 text-white font-bold uppercase tracking-widest text-xs flex items-center justify-center hover:bg-white/5 transition-colors rounded-md">
                  <ShoppingBag className="h-4 w-4 mr-2" /> ADD TO CART
                </button>
              </motion.div>

              {/* Trust Badges - 4 Compact Cards */}
              <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3 mb-10">
                <div className="bg-brand-card p-4 rounded-md border border-white/5 flex items-center gap-3">
                  <Truck className="h-5 w-5 text-gray-400 shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white">24-48 Hours</span>
                </div>
                <div className="bg-brand-card p-4 rounded-md border border-white/5 flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-gray-400 shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white">Authentic Gear</span>
                </div>
                <div className="bg-brand-card p-4 rounded-md border border-white/5 flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-gray-400 shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white">Secure Packaging</span>
                </div>
                <div className="bg-brand-card p-4 rounded-md border border-white/5 flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-gray-400 shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white">WhatsApp Support</span>
                </div>
              </motion.div>

              {/* Details & Specs */}
              <motion.div variants={staggerItem} className="space-y-8 mb-12">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-3">About This Boot</h3>
                  <p className="text-gray-400 leading-relaxed font-light text-sm">{product.description}</p>
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-3">Performance Specs</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 p-3 rounded-md flex items-center gap-3"><Activity className="w-4 h-4 text-brand-primary" /><span className="text-[10px] uppercase font-bold text-gray-300">FG & AG Surface</span></div>
                    <div className="bg-white/5 p-3 rounded-md flex items-center gap-3"><Wind className="w-4 h-4 text-brand-primary" /><span className="text-[10px] uppercase font-bold text-gray-300">Lightweight</span></div>
                    <div className="bg-white/5 p-3 rounded-md flex items-center gap-3"><Target className="w-4 h-4 text-brand-primary" /><span className="text-[10px] uppercase font-bold text-gray-300">Precision Touch</span></div>
                    <div className="bg-white/5 p-3 rounded-md flex items-center gap-3"><Zap className="w-4 h-4 text-brand-primary" /><span className="text-[10px] uppercase font-bold text-gray-300">Explosive Speed</span></div>
                  </div>
                </div>
              </motion.div>
              
            </motion.div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section id="reviews" className="border-t border-white/10 bg-brand-dark py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} className="flex flex-col md:flex-row justify-between items-start mb-12 border-b border-white/10 pb-8">
              <div>
                <h2 className="font-display uppercase tracking-wide text-3xl md:text-5xl text-white mb-4">Reviews</h2>
                <div className="flex items-center text-brand-primary mb-6">
                  {[1,2,3,4,5].map((s) => <Star key={s} className="h-6 w-6 fill-current" />)}
                  <span className="ml-3 text-xl font-bold text-white tracking-widest">{product.rating || '5.0'} / 120 Reviews</span>
                </div>
                <button className="px-8 py-4 bg-brand-card border border-white/20 text-white rounded-md font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-colors">Write Review</button>
              </div>
              
              {/* Photo Reviews Gallery */}
              <div className="mt-8 md:mt-0">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Photo Reviews</h4>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map((idx) => (
                    <div key={idx} className="w-16 h-16 bg-white/5 rounded-md border border-white/10 flex items-center justify-center hover:border-brand-primary transition-colors cursor-pointer">
                      <Camera className="w-5 h-5 text-gray-600" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {productReviews.map((review) => (
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} key={review.id} className="bg-brand-card p-6 border border-white/5 flex flex-col rounded-md">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-white font-bold tracking-widest uppercase text-sm">{review.name}</h4>
                    </div>
                  </div>
                  <div className="flex mb-4 text-brand-primary">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'text-gray-700'}`} />)}
                  </div>
                  <p className="text-gray-300 font-light text-sm italic mb-6 flex-1 relative"><span className="relative z-10">&quot;{review.text}&quot;</span></p>
                  {review.purchased && <div className="text-[10px] font-bold uppercase tracking-widest text-brand-primary flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Verified Buyer</div>}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Similar Boots */}
        {relatedProducts.length > 0 && (
          <section className="py-20 bg-brand-card border-t border-white/10 px-6">
            <div className="max-w-7xl mx-auto">
              <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} className="font-display uppercase tracking-wide text-3xl md:text-5xl text-center mb-12 text-white">Similar Boots</motion.h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((prod: any) => (
                  <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} key={prod.id}>
                    <Link href={`/product/${prod.id}`} className="group flex flex-col hover:-translate-y-1 transition-transform duration-300">
                      <div className="relative aspect-[3/4] w-full bg-brand-dark overflow-hidden rounded-md mb-4 border border-transparent group-hover:border-white/10">
                        <Image src={prod.image} alt={prod.name} fill className="object-cover group-hover:scale-[1.03] opacity-90 group-hover:opacity-100 transition-transform duration-700" />
                      </div>
                      <div className="text-left w-full mt-auto">
                        <h3 className="font-sans font-medium text-white line-clamp-2 mb-1 group-hover:text-brand-primary transition-colors text-sm sm:text-base leading-tight">{prod.name}</h3>
                        <div className="font-sans font-medium text-white text-sm">{formatPrice(prod.price)}</div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Recently Viewed */}
        <section className="py-20 bg-brand-dark border-t border-white/10 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} className="text-xs uppercase font-bold tracking-[0.2em] text-gray-500 mb-8 border-b border-white/10 pb-4">Recently Viewed</motion.h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {recentlyViewed.map((prod: any) => (
                  <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} key={prod.id}>
                    <Link href={`/product/${prod.id}`} className="group">
                      <div className="relative aspect-square w-full bg-brand-card rounded-md overflow-hidden border border-white/5 group-hover:border-white/20 transition-colors">
                        <Image src={prod.image} alt={prod.name} fill className="object-cover" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
            </div>
          </div>
        </section>

        {/* Mobile Sticky Action Bar */}
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-brand-dark/95 backdrop-blur-md border-t border-white/10 p-4 z-50 flex items-center justify-between gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Price</span>
            <span className="text-lg font-bold text-white leading-none">{formatPrice(product.price)}</span>
          </div>
          <button onClick={handleWhatsAppCheckout} className="flex-1 h-12 bg-[#25D366] text-black font-bold uppercase tracking-widest text-[11px] flex items-center justify-center hover:bg-[#1ebe57] transition-colors rounded-md">
            <MessageCircle className="h-4 w-4 mr-2" /> ORDER ON WA
          </button>
        </div>

        {/* Size Guide Modal */}
        <AnimatePresence>
          {showSizeGuide && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSizeGuide(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-brand-card border border-white/10 shadow-2xl overflow-hidden rounded-md z-10"
              >
                <div className="flex justify-between items-center p-6 border-b border-white/10 bg-brand-dark">
                  <h3 className="font-display text-2xl uppercase tracking-wide text-white">Size Guide</h3>
                  <button
                    onClick={() => setShowSizeGuide(false)}
                    className="p-2 bg-transparent hover:bg-white/10 rounded-md text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                    Our products generally run true to size. If you are between sizes, we recommend ordering a size up.
                  </p>
                  
                  <div className="overflow-x-auto print:overflow-visible rounded-md border border-white/10">
                    {sizeGuides && sizeGuides.length > 1 && (
                      <div className="flex gap-2 p-4 border-b border-white/10 bg-white/5">
                        {sizeGuides.map((guide: any) => (
                          <button
                            key={guide.id}
                            onClick={() => setActiveGuideTab(guide.id)}
                            className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md transition-colors ${
                              activeGuideTab === guide.id ? 'bg-brand-primary text-black' : 'text-gray-400 hover:text-white bg-white/5'
                            }`}
                          >
                            {guide.name}
                          </button>
                        ))}
                      </div>
                    )}

                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                          {(() => {
                            const activeGuide = sizeGuides?.find((g: any) => g.id === activeGuideTab) || sizeGuides?.[0];
                            return activeGuide?.headers?.map((header: string, idx: number) => (
                              <th key={idx} className="px-4 py-3 font-bold text-white uppercase tracking-widest text-[10px]">
                                {header}
                              </th>
                            ));
                          })()}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {(() => {
                          const activeGuide = sizeGuides?.find((g: any) => g.id === activeGuideTab) || sizeGuides?.[0];
                          return activeGuide?.rows?.map((row: string[], rowIdx: number) => (
                            <tr key={rowIdx} className="hover:bg-white/5 transition-colors text-gray-300">
                              {row.map((cell: string, cellIdx: number) => (
                                <td key={cellIdx} className={`px-4 py-3 ${cellIdx === 0 ? 'font-bold text-brand-primary' : ''}`}>
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-8 bg-brand-primary/10 border border-brand-primary/20 p-4 flex items-start gap-4 rounded-md">
                    <MessageCircle className="w-6 h-6 text-brand-primary shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-brand-primary mb-1">Still Unsure?</h4>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3 leading-relaxed">Send us a message and we&apos;ll help you find your perfect fit.</p>
                      <a href={`https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent("I need help with sizing/options!")}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-white hover:text-brand-primary underline underline-offset-4 uppercase tracking-widest">Chat on WhatsApp</a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}