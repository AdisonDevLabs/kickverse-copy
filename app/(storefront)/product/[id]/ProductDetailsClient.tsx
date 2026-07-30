// app/product/[id]/ProductDetailsClient.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Star, Minus, Plus, ShoppingBag, MessageCircle, Heart, ArrowLeft, ShieldCheck, Truck, X, HelpCircle, CheckCircle, ChevronLeft, SearchX, Quote } from 'lucide-react';
import { formatPrice } from '@/lib/data';
import { productReviews } from '@/lib/data/testimonials';
import { brand } from '@/lib/data/brand';
import { useCart } from '@/lib/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/animations';

export default function ProductDetailsClient({ product, relatedProducts, recentlyViewed, sizeGuides, colorMap }: any) {
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();
  
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState<string>(product?.colors?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState(sizeGuides?.[0]?.id || '');

  const colorMapObj = Object.fromEntries(
    colorMap?.map((c: any) => [c.colorName, c.hexCode]) || []
  );

  const [showAddedToast, setShowAddedToast] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [isStickyVisible, setIsStickyVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImage(0); 
    if (product) {
       setSelectedSize(product.sizes?.[0] || '');
       setSelectedColor(product.colors?.[0] || '');
       
       // Default size guide tab based on product type
       if (product.productType === 'Soccer Cleats' && sizeGuides) {
         const cleatGuide = sizeGuides.find((g: any) => g.id.toLowerCase().includes('cleat') || g.id.toLowerCase().includes('performance'));
         if (cleatGuide) setActiveGuideTab(cleatGuide.id);
       }
    }
  }, [product?.id, product, sizeGuides]);

  // Handle Sticky Mobile CTA Visibility
  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA after scrolling past the main action buttons (approx 600px down)
      setIsStickyVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!product) {
    return (
      <motion.div 
        initial="hidden" animate="visible" variants={fadeUp}
        className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-brand-dark text-white pt-[120px]"
      >
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
          <SearchX className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="font-display text-3xl md:text-4xl uppercase tracking-wide mb-3">Product Not Found</h2>
        <p className="text-gray-400 max-w-md mx-auto mb-10 text-sm md:text-base">This product might be out of stock or the link might be broken.</p>
        <button onClick={() => router.push('/shop')} className="inline-flex h-14 px-8 bg-white text-black font-bold uppercase tracking-widest hover:bg-brand-primary transition-colors items-center justify-center rounded-md">
          Back to Shop
        </button>
      </motion.div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    if (images.length <= 1) return;
    
    const colorLower = color.toLowerCase();
    
    let matchedIdx = images.findIndex((img: string) => {
      const imgName = img.toLowerCase();
      return imgName.includes(colorLower) || 
             colorLower.split(' ').some((term: string) => term.length > 1 && imgName.includes(term));
    });
    
    if (matchedIdx === -1 && product.colors) {
      const cIdx = product.colors.indexOf(color);
      if (cIdx >= 0 && cIdx < images.length) {
        matchedIdx = cIdx;
      }
    }
    
    if (matchedIdx !== -1) {
      setActiveImage(matchedIdx);
    }
  };

  const handleImageSelect = (idx: number) => {
    setActiveImage(idx);
    if (!product.colors || product.colors.length <= 1) return;
    
    const imgName = images[idx].toLowerCase();
    
    let matchedColor = product.colors.find((c: string) => {
       const cLower = c.toLowerCase();
       return imgName.includes(cLower) ||
              cLower.split(' ').some((term: string) => term.length > 1 && imgName.includes(term));
    });
    
    if (!matchedColor && idx < product.colors.length) {
       matchedColor = product.colors[idx];
    }
    
    if (matchedColor) {
       setSelectedColor(matchedColor);
    }
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
    setTimeout(() => {
      setShowAddedToast(false);
    }, 4000);
  };
  
  const handleWhatsAppCheckout = () => {
    if (!selectedSize && product.sizes && product.sizes.length > 0) return triggerSizeError();

    const productUrl = window.location.href;

    const message = `Hello ${brand.name},\n\nI'd like to order:\n\n• Product: ${product.name}\n${selectedSize ? `• Size/Option: ${selectedSize}\n` : ''}${selectedColor ? `• Color: ${selectedColor}\n` : ''}• Quantity: ${quantity}\n\nPlease confirm availability and delivery details.\n\nThank you.\n\n${productUrl}`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${brand.whatsappNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="bg-brand-dark text-white min-h-screen relative pb-20 md:pb-0">
      
      {/* Schema.org JSON-LD Breadcrumbs for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": `${brand.url}/` },
              { "@type": "ListItem", "position": 2, "name": "Shop", "item": `${brand.url}/shop` },
              { "@type": "ListItem", "position": 3, "name": product.category, "item": `${brand.url}/shop?category=${product.category.toLowerCase().replace(/\s+/g, '-')}` },
              { "@type": "ListItem", "position": 4, "name": product.name, "item": `${brand.url}/product/${product.id}` }
            ]
          })
        }}
      />

      {/* Mini Cart Notification Toast */}
      <AnimatePresence>
        {showAddedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 right-4 md:right-8 z-[100] bg-brand-card border border-brand-primary/50 shadow-[0_10px_40px_rgba(0,0,0,0.3)] p-4 flex flex-col sm:flex-row items-center gap-4 min-w-[320px] rounded-md"
          >
            <div className="flex items-center text-brand-primary">
               <CheckCircle className="h-5 w-5 mr-3" />
               <span className="font-bold text-sm uppercase tracking-widest text-white">Added to Cart</span>
            </div>
            <div className="flex items-center gap-3 mt-2 sm:mt-0 sm:ml-auto w-full sm:w-auto">
               <button onClick={() => setShowAddedToast(false)} className="text-xs text-gray-400 hover:text-white uppercase tracking-widest font-bold flex-1 sm:flex-none text-center">
                 Continue Shopping
               </button>
               <div className="w-px h-4 bg-white/20 hidden sm:block"></div>
               <button onClick={() => { setShowAddedToast(false); setIsCartOpen(true); }} className="text-xs text-brand-primary hover:text-white uppercase tracking-widest font-bold flex-1 sm:flex-none text-center">
                 View Cart
               </button>
            </div>
            <button onClick={() => setShowAddedToast(false)} className="absolute top-2 right-2 text-gray-400 hover:text-white sm:hidden">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context-Aware Breadcrumbs (Desktop) */}
      <motion.div 
        initial="hidden" animate="visible" variants={fadeUp}
        className="bg-brand-card py-4 px-6 border-b border-white/10 hidden md:block"
      >
        <div className="max-w-7xl mx-auto flex items-center text-xs font-bold uppercase tracking-widest text-gray-500">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span className="mx-2 text-white/20">/</span>
          <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
          <span className="mx-2 text-white/20">/</span>
          
          {product.productType && (
             <>
               <span className="text-white">{product.productType}</span>
               <span className="mx-2 text-white/20">/</span>
             </>
          )}

          <Link href={`/shop?category=${product.category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-white transition-colors">
            {product.category}
          </Link>
          <span className="mx-2 text-white/20">/</span>
          
          <span className="text-brand-primary truncate">{product.name}</span>
        </div>
      </motion.div>

      {/* Mobile Back Button */}
      <motion.div 
        initial="hidden" animate="visible" variants={fadeUp}
        className="md:hidden w-full bg-brand-card border-b border-white/10 px-4 py-3"
      >
        <button onClick={() => router.back()} className="flex items-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back To Shop
        </button>
      </motion.div>

      <div className="pt-6 md:pt-12">
        <div className="max-w-7xl mx-auto px-0 md:px-6 md:pb-12">
          <div className="flex flex-col md:flex-row gap-0 md:gap-12 lg:gap-16">
            
            {/* Image Gallery with Mobile Drag Gestures */}
            <motion.div 
              initial="hidden" animate="visible" variants={fadeUp}
              className="md:w-1/2 md:sticky md:top-24 h-fit z-10"
            >
              <div className="relative aspect-[3/4] md:aspect-[4/5] w-full max-h-[calc(100vh-200px)] bg-brand-card overflow-hidden border-b md:border border-white/10 group md:rounded-md">
                {product.isFlashDeal ? (
                  <div className="absolute top-4 left-4 z-20 bg-brand-accent text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest shadow-xl rounded-md">Sale</div>
                ) : product.isNewArrival ? (
                  <div className="absolute top-4 left-4 z-20 bg-white text-black text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest shadow-xl rounded-md">New Arrival</div>
                ) : product.isBestSeller ? (
                  <div className="absolute top-4 left-4 z-20 bg-brand-primary text-black text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest shadow-xl rounded-md">Best Seller</div>
                ) : null}
                
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
                      if (offset.x < -50) {
                        handleImageSelect((activeImage + 1) % images.length);
                      } else if (offset.x > 50) {
                        handleImageSelect((activeImage - 1 + images.length) % images.length);
                      }
                    }}
                  >
                    <Image
                      src={images[activeImage]}
                      alt={`${product.name} - View ${activeImage + 1}`}
                      fill
                      priority
                      referrerPolicy="no-referrer"
                      className="object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-out pointer-events-none"
                    />
                  </motion.div>
                </AnimatePresence>
                
                {/* Mobile Image Counter Overlay */}
                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md z-20 md:hidden pointer-events-none">
                  {activeImage + 1} / {images.length}
                </div>
              </div>
              
              {/* Desktop Thumbnails */}
              <div className="hidden md:flex gap-4 mt-4 overflow-x-auto hide-scrollbar pb-2">
                {images.map((img: string, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => handleImageSelect(idx)}
                    className={`relative w-24 aspect-square flex-shrink-0 bg-brand-card border rounded-md overflow-hidden transition-all ${activeImage === idx ? 'border-brand-primary opacity-100' : 'border-white/10 opacity-50 hover:opacity-100'}`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx + 1}`} fill referrerPolicy="no-referrer" className="object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Product Info Panel */}
            <motion.div 
              initial="hidden" animate="visible" variants={staggerContainer}
              className="md:w-1/2 p-6 md:p-0 flex flex-col z-0"
            >
              <motion.div variants={staggerItem} className="mb-8 mt-2 md:mt-0">
                <h1 className="font-display uppercase tracking-wide text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-[1.1] mb-4">
                  {product.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center text-brand-primary">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`h-4 w-4 ${s <= (product.rating || 5) ? 'fill-current' : 'text-gray-600'}`} />
                    ))}
                    <span className="ml-2 text-sm font-bold text-white tracking-widest">{product.rating || '5.0'}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-white/20"></div>
                  <Link href="#reviews" className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-white underline underline-offset-4">
                    {product.reviews || '120'} Reviews
                  </Link>
                  <div className="w-1 h-1 rounded-full bg-white/20"></div>
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-primary flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" /> In Stock
                  </span>
                </div>
                
                <div className="flex flex-col gap-1 items-start">
                  <div className="flex items-end gap-4">
                    <span className="text-3xl sm:text-4xl font-sans font-medium text-white">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-lg sm:text-xl text-gray-500 line-through mb-1.5">{formatPrice(product.originalPrice)}</span>
                    )}
                    {product.originalPrice && (
                      <span className="ml-2 bg-brand-accent/10 text-brand-accent rounded-md text-[10px] font-bold px-2 py-1 uppercase tracking-widest mb-2 border border-brand-accent/20 hidden sm:block">
                        Save {Math.round((1 - product.price / product.originalPrice!) * 100)}%
                      </span>
                    )}
                  </div>
                  
                  {/* Urgency Indicator */}
                  {product.isFlashDeal && (
                    <div className="flex items-center mt-2">
                      <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse mr-2"></div>
                      <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">High Demand - Limited Stock</span>
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div variants={staggerItem} className="space-y-8 mb-10 py-8 border-y border-white/10">
                
                {product.colors && product.colors.length > 0 && (
                  <div>
                    <span className="font-bold text-white uppercase tracking-widest text-xs block mb-4">Color: <span className="font-medium text-brand-primary ml-1">{selectedColor || 'Select'}</span></span>
                    <div className="flex flex-wrap gap-4">
                      {product.colors.map((color: string) => {
                        const primaryColor = color.split('/')[0].trim();
                        const hexColor = colorMapObj[primaryColor] || colorMapObj[color] || '#333';
                        return (
                          <button
                            key={color}
                            onClick={() => handleColorSelect(color)}
                            aria-pressed={selectedColor === color}
                            aria-label={`Select Color: ${color}`}
                            className={`relative w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center ${
                              selectedColor === color ? 'border-brand-primary scale-110' : 'border-white/10 hover:border-white/50'
                            }`}
                          >
                            <div className="w-9 h-9 rounded-full shadow-inner border border-white/5" style={{ backgroundColor: hexColor }}></div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {product.sizes && product.sizes.length > 0 && (
                  <div 
                    id="size-selector-container" 
                    className={`transition-colors duration-300 rounded-md ${sizeError ? 'bg-red-500/10 border border-red-500/50 p-4 -mx-4' : 'border border-transparent p-0 mx-0'}`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-white uppercase tracking-widest text-xs flex items-center">
                        Size / Option 
                        {sizeError && <span className="text-red-500 ml-3 animate-pulse">Required *</span>}
                      </span>
                      <button 
                        onClick={() => setShowSizeGuide(true)}
                        className="text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:text-white flex items-center underline underline-offset-4"
                      >
                        <HelpCircle className="w-3 h-3 mr-1" /> Size Guide
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      {product.sizes.map((size: string) => (
                        <button
                          key={size}
                          onClick={() => { setSelectedSize(size); setSizeError(false); }}
                          aria-pressed={selectedSize === size}
                          aria-label={`Select Size: ${size}`}
                          className={`h-12 flex-1 min-w-[64px] rounded-md font-bold text-sm transition-all border ${
                            selectedSize === size
                              ? 'bg-brand-primary text-black border-brand-primary'
                              : sizeError
                                ? 'bg-transparent border-red-500/50 text-white hover:border-white'
                                : 'bg-transparent border-white/20 text-white hover:border-white'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    
                    {/* Contextual Fit Note for Cleats */}
                    {product.productType === 'Soccer Cleats' && (
                      <p className="mt-3 text-[10px] text-brand-primary/80 uppercase tracking-widest flex items-center">
                         <HelpCircle className="w-3 h-3 mr-1" />
                         Performance boots run snug. Consider half a size up for wide feet.
                      </p>
                    )}
                  </div>
                )}
              </motion.div>

              <motion.div variants={staggerItem} className="flex flex-col gap-4 mb-8">
                <div className="mb-2">
                  <span className="font-bold text-white uppercase tracking-widest text-xs block mb-3">Quantity</span>
                  <div className="inline-flex items-center border border-white/20 bg-brand-card rounded-md overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center text-sm font-bold text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleAddToCart}
                  className="w-full h-16 sm:h-20 bg-brand-primary text-black font-bold uppercase tracking-widest text-sm sm:text-base flex items-center justify-center hover:bg-brand-hover transition-colors shadow-[0_0_20px_-5px_rgba(0,0,0,0.3)] rounded-md"
                >
                  <ShoppingBag className="h-5 w-5 mr-3" />
                  ADD TO CART
                </button>
                
                <button 
                  onClick={handleWhatsAppCheckout}
                  className="w-full h-14 bg-transparent border border-brand-primary text-brand-primary font-bold uppercase tracking-widest text-xs flex items-center justify-center hover:bg-brand-primary hover:text-black transition-colors rounded-md"
                >
                  <MessageCircle className="h-4 w-4 mr-2" /> ORDER ON WHATSAPP
                </button>
              </motion.div>

              {/* Context-Aware Delivery & Trust Info */}
              <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-brand-card p-6 border border-white/5 mb-12 rounded-md">
                <div className="flex items-start">
                  <Truck className="h-5 w-5 mr-3 text-gray-400 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-1">Fast Delivery</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                      {product.productType === 'Soccer Cleats' ? 'Ready for Matchday Delivery' : 'Across Kenya within 24-48 hrs'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ShieldCheck className="h-5 w-5 mr-3 text-gray-400 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-1">Quality Guaranteed</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                      {product.productType === 'Soccer Cleats' ? 'Authentic Performance Gear' : 'Pristine Packaging & Box'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 text-gray-400 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-1">Secure Packaging</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Delivered in pristine condition</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MessageCircle className="h-5 w-5 mr-3 text-gray-400 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-1">WhatsApp Support</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Direct help from our team</p>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={staggerItem} className="space-y-10">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4 border-b border-white/10 pb-2">Overview</h3>
                  <p className="text-gray-400 leading-relaxed font-light text-sm">
                    {product.description}
                  </p>
                </div>

                {/* Dynamic Context-Aware Features */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4 border-b border-white/10 pb-2">
                    {product.productType === 'Soccer Cleats' ? 'Performance Specs' : 'Design & Craft'}
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-2 text-sm text-gray-400 font-light">
                    {product.productType === 'Soccer Cleats' ? (
                      <>
                        <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-brand-primary" /> Multi-Directional Traction</li>
                        <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-brand-primary" /> Precision Touch Upper</li>
                        <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-brand-primary" /> Anatomical Lockdown Fit</li>
                        <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-brand-primary" /> Lightweight Construction</li>
                        {product.name.includes('FG') && <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-brand-accent" /> Firm Ground (FG) Optimized</li>}
                        {product.name.includes('AG') && <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-brand-accent" /> Artificial Grass (AG) Ready</li>}
                        {product.name.includes('SG') && <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-brand-accent" /> Soft Ground (SG) Optimized</li>}
                        {product.name.includes('TF') && <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-brand-accent" /> Turf (TF) Ready</li>}
                      </>
                    ) : (
                      <>
                        <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-brand-primary" /> Iconic Silhouette</li>
                        <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-brand-primary" /> Premium Material Blend</li>
                        <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-brand-primary" /> All-Day Comfort Midsole</li>
                        <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-brand-primary" /> Durable Street Traction</li>
                        <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-brand-primary" /> Versatile Styling</li>
                      </>
                    )}
                  </ul>
                </div>
              </motion.div>
              
            </motion.div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section id="reviews" className="border-t border-white/10 bg-brand-dark py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp}
              className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12"
            >
              <div>
                <h2 className="font-display uppercase tracking-wide text-3xl md:text-5xl text-white mb-4">Why Customers Love It</h2>
                <div className="flex items-center text-brand-primary">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className="h-5 w-5 fill-current" />
                  ))}
                  <span className="ml-3 text-lg font-bold text-white tracking-widest">{product.rating || '5.0'} OUT OF 5</span>
                </div>
              </div>
              <button className="mt-6 md:mt-0 px-8 py-4 bg-transparent border border-white text-white rounded-md font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors">
                Write a Review
              </button>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {productReviews.map((review) => (
                <motion.div 
                  initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp}
                  key={review.id} 
                  className="bg-brand-card p-6 border border-white/5 flex flex-col rounded-md"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-white font-bold tracking-widest uppercase text-sm">{review.name}</h4>
                      <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">{review.location}</span>
                    </div>
                    <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{review.date}</div>
                  </div>
                  
                  <div className="flex mb-4 text-brand-primary">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'text-gray-700'}`} />
                    ))}
                  </div>
                  
                  <p className="text-gray-300 font-light text-sm italic mb-6 flex-1 bg-white/5 p-4 rounded-md relative">
                    <Quote className="absolute top-2 left-2 text-white/5 w-8 h-8" />
                    <span className="relative z-10">&quot;{review.text}&quot;</span>
                  </p>
                  
                  {review.purchased && (
                    <div className="text-[10px] font-bold uppercase tracking-widest text-brand-primary flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" /> Verified Buyer
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-20 bg-brand-card border-t border-white/10 px-6">
            <div className="max-w-7xl mx-auto">
              <motion.h2 
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp}
                className="font-display uppercase tracking-wide text-3xl md:text-5xl text-center mb-12 text-white"
              >
                Complete The Look
              </motion.h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((prod: any) => (
                  <motion.div 
                    initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp}
                    key={prod.id}
                  >
                    <Link href={`/product/${prod.id}`} className="group flex flex-col hover:-translate-y-1 transition-transform duration-300">
                      <div className="relative aspect-[3/4] w-full bg-brand-dark overflow-hidden rounded-md mb-4 border border-transparent group-hover:border-white/10">
                        <Image
                          src={prod.image}
                          alt={prod.name}
                          fill
                          referrerPolicy="no-referrer"
                          className="object-cover group-hover:scale-[1.03] opacity-90 group-hover:opacity-100 transition-transform duration-700"
                        />
                      </div>
                      <div className="text-left w-full mt-auto">
                        <h3 className="font-sans font-medium text-white line-clamp-2 mb-1 group-hover:text-brand-primary transition-colors text-sm sm:text-base leading-tight">
                          {prod.name}
                        </h3>
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
            <motion.h2 
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp}
              className="text-xs uppercase font-bold tracking-[0.2em] text-gray-500 mb-8 border-b border-white/10 pb-4"
            >
              More To Discover
            </motion.h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {recentlyViewed.map((prod: any) => (
                  <motion.div 
                    initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp}
                    key={prod.id}
                  >
                    <Link href={`/product/${prod.id}`} className="group">
                      <div className="relative aspect-square w-full bg-brand-card rounded-md overflow-hidden border border-white/5 group-hover:border-white/20 transition-colors">
                        <Image src={prod.image} alt={prod.name} fill className="object-cover" referrerPolicy="no-referrer" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
            </div>
          </div>
        </section>

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

        {/* Mobile Sticky Action Bar */}
        <AnimatePresence>
          {isStickyVisible && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="md:hidden fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 bg-brand-card/95 backdrop-blur-md border-t border-white/10 p-3 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex gap-2"
            >
              <button 
                onClick={handleAddToCart}
                className="flex-1 h-12 bg-brand-primary text-black font-bold uppercase tracking-widest text-xs flex items-center justify-center rounded-md"
              >
                Add To Cart
              </button>
              <button 
                onClick={handleWhatsAppCheckout}
                className="flex-[0.3] h-12 bg-transparent border border-brand-primary text-brand-primary flex items-center justify-center rounded-md hover:bg-brand-primary hover:text-black transition-colors"
                aria-label="Order on WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}