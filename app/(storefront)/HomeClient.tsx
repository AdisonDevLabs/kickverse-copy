// app/HomeClient.tsx

'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { fadeUp, fadeLeft, heroReveal, staggerContainer, staggerItem } from '@/lib/animations';
import { ArrowRight, Star, ShoppingBag, Truck, ShieldCheck, Clock, MessageCircle, Flame, Eye, Zap, Sparkles, Wallet, CheckCircle, Heart, Tag, Grid } from 'lucide-react';
import { formatPrice } from '@/lib/data';
import { reviewAvatars, reviewStats } from '@/lib/data/testimonials';
import { brand } from '@/lib/data/brand';

// Define the props we expect from the server
export default function HomeClient({ initialProducts, initialCategories, initialTestimonials }: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Set duration to 6 Days, 14 Hours, 45 Minutes
    const FLASH_DEAL_DURATION = 6 * 24 * 3600 * 1000 + 14 * 3600 * 1000 + 45 * 60 * 1000;
    
    // Check if the user already has a running countdown
    let endTime = localStorage.getItem('kickverse_flash_deal_end');
    
    // If no timer exists, or if the previous one expired, start a new 6-day timer
    if (!endTime || parseInt(endTime) < Date.now()) {
      endTime = (Date.now() + FLASH_DEAL_DURATION).toString();
      localStorage.setItem('kickverse_flash_deal_end', endTime);
    }

    const calculateRemaining = () => {
      const remaining = Math.floor((parseInt(endTime as string) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    };

    // Set initial time and start interval
    setTimeLeft(calculateRemaining());
    const timer = setInterval(() => {
      setTimeLeft(calculateRemaining());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    // Prevent Next.js hydration mismatch errors on first load
    if (!mounted) return "06d : 14h : 45m : 30s"; 
    
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    // Format elegantly as Days : Hours : Minutes : Seconds
    return `${d.toString().padStart(2, '0')}d : ${h.toString().padStart(2, '0')}h : ${m.toString().padStart(2, '0')}m : ${s.toString().padStart(2, '0')}s`;
  };

  // 1. Filter using the live database props instead of dummyProducts
  const sneakerProducts = initialProducts.filter((p: any) => p.productType === 'Sneakers');

  const newArrivals = initialProducts.filter((p: any) => p.isNewArrival).slice(0, 4);
  const bestSellers = initialProducts.filter((p: any) => p.isBestSeller);
  const flashDeals = initialProducts.filter((p: any) => p.isFlashDeal);

  const sneakerCategories = initialCategories.filter((collection: any) => 
    sneakerProducts.some((p: any) => p.category === collection.name)
  );
  
  // Fallback in case no products are mapped yet
  const displayCategories = sneakerCategories.length > 0 ? sneakerCategories : initialCategories;

  // 3. Filter Soccer Cleats and their corresponding categories
  const cleatProducts = initialProducts.filter((p: any) => p.productType === 'Soccer Cleats');
  const displayCleatCategories = initialCategories.filter((collection: any) => 
    cleatProducts.some((p: any) => p.category === collection.name)
  );

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen bg-brand-dark text-white">
      {/* 
        Redesigned Hero Section
        Unified section with full background image.
        Grid cards placed directly beneath the CTAs.
      */}
      <section ref={heroRef} className="relative h-[calc(100svh-180px)] md:h-[calc(100svh-96px)] min-h-[500px] md:min-h-[650px] w-full flex flex-col justify-center overflow-hidden bg-black">
        
        {/* Full Section Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={brand.hero?.backgroundImage || "/pexels-wedding-maps-130174465-10114295.jpg"}
            alt="Hero Background"
            fill
            priority
            referrerPolicy="no-referrer"
            className="hero-image object-cover object-right md:object-center opacity-80 md:opacity-100"
          />
          {/* Mobile dark overlay for guaranteed readability */}
          <div className="absolute inset-0 bg-black/60 md:hidden z-0" />
          
          {/* Desktop heavy black gradient on left side fading seamlessly to the image */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent hidden md:block z-0" />
          
          {/* Bottom fade to blend with the next section
          <div className="absolute inset-x-0 bottom-0 h-24 md:h-32 bg-gradient-to-t from-brand-card to-transparent z-0" /> */}
        </div>

        {/* Content Wrapper */}
        <motion.div 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="relative z-10 max-w-7xl mx-auto w-full flex flex-col items-start text-left px-4 sm:px-6 lg:px-16 xl:px-24"
        >
            {/* Trust Label Pill */}
            <motion.div
              variants={staggerItem}
              className="inline-flex items-center space-x-1.5 bg-transparent border border-white/20 rounded-full px-2.5 py-1 mb-2 sm:mb-4"
            >
              <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-brand-primary" />
              <span className="text-white text-[8px] sm:text-[10px] font-bold tracking-widest uppercase">
                {brand.hero?.badge || "TESTED, TRUSTED AND APPROVED"}
              </span>
            </motion.div>

            {/* Main Headline */}
            <div className="overflow-hidden mb-2 sm:mb-3 w-full">
              <motion.h1 
                variants={heroReveal}
                className="font-display uppercase tracking-wider text-[2rem] sm:text-5xl md:text-6xl lg:text-[5rem] leading-[0.95] text-white drop-shadow-2xl"
              >
                {brand.hero?.headlineTop || "HOME OF THE BEST"} <br/> 
                <span className="text-brand-primary">{brand.hero?.headlineHighlight || "SNEAKERS & CLEATS"}</span>
              </motion.h1>
            </div>

            {/* Subheadline */}
            <motion.p 
              variants={staggerItem}
              className="text-gray-300 text-[11px] sm:text-sm md:text-base max-w-[280px] sm:max-w-lg mb-3 sm:mb-5 font-medium leading-relaxed drop-shadow-md"
            >
              {brand.description}
            </motion.p>
            
            {/* Micro Trust Row */}
            <motion.div 
              variants={staggerItem}
              className="flex flex-wrap items-center gap-y-1 sm:gap-y-2 gap-x-2 sm:gap-x-4 mb-4 sm:mb-6 text-[8px] sm:text-[10px] md:text-xs font-bold uppercase tracking-widest text-white drop-shadow-md"
            >
              <div className="flex items-center">
                <Truck className="h-2.5 w-2.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-brand-primary" /> {brand.trustStatements[0] || "We Deliver countrywide"}
              </div>
              <span className="text-white/40 hidden sm:block">•</span>
              <div className="flex items-center">
                <ShieldCheck className="h-2.5 w-2.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-brand-primary" /> {brand.trustStatements[1] || "Genuine quality"}
              </div>
               <span className="text-white/40 hidden xl:block">•</span>
               <div className="hidden sm:flex items-center">
                <Wallet className="h-2.5 w-2.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-brand-primary" /> {brand.trustStatements[2] || "Pay on delivery"}
              </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div 
              variants={staggerItem}
              className="flex flex-row w-full sm:w-auto gap-2 sm:gap-3"
            >
               <a 
                href={`https://wa.me/${brand.whatsappNumber}`} 
                target="_blank"
                rel="noreferrer"
                className="h-9 sm:h-12 px-3 sm:px-6 rounded-md bg-brand-primary text-black font-bold uppercase tracking-widest text-[9px] sm:text-xs flex items-center justify-center hover:bg-brand-hover transition-colors shadow-lg shadow-brand-primary/20 flex-1 sm:flex-none"
               >
                 <MessageCircle className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Order on WhatsApp
               </a>
               <Link 
                href="/shop" 
                className="h-9 sm:h-12 px-3 sm:px-6 rounded-md bg-transparent border border-white text-white font-bold uppercase tracking-widest text-[9px] sm:text-xs flex items-center justify-center hover:bg-white hover:text-black transition-colors flex-1 sm:flex-none"
               >
                 {brand.hero?.ctaSecondary || "SHOP COLLECTION"}
               </Link>
            </motion.div>

            {/* Choose Your Collection Cards (Moved directly below CTAs) */}
            <motion.div 
              variants={staggerItem} 
              className="w-full max-w-sm sm:max-w-lg md:max-w-2xl mt-6 sm:mt-10"
            >
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                {/* Sneakers Card */}
                <Link 
                  href="/shop?type=sneakers" 
                  className="relative h-24 sm:h-32 md:h-40 rounded-lg overflow-hidden group block border border-white/10 hover:border-brand-primary transition-all shadow-lg bg-black"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-10 group-hover:from-black/80 transition-colors duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                  
                  <Image
                    src={displayCategories?.[0]?.image || brand.hero?.backgroundImage || "/pexels-wedding-maps-130174465-10114295.jpg"}
                    alt="Shop Sneakers"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                  />
                  
                  <div className="absolute inset-0 z-20 flex flex-col justify-end p-2.5 sm:p-4 md:p-5 text-left">
                    <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full border border-brand-primary flex items-center justify-center mb-1 sm:mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-primary w-2.5 h-2.5 sm:w-4 sm:h-4"><path d="M2 14h20.4l-1.9-6H5.5L2 14z"/><path d="M22 14v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4"/><path d="M9 14v4"/><path d="M15 14v4"/></svg>
                    </div>
                    <h3 className="text-white font-display uppercase tracking-widest text-xs sm:text-xl md:text-2xl drop-shadow-lg mb-0.5 group-hover:text-brand-primary transition-colors leading-none">
                      SNEAKERS
                    </h3>
                    <p className="text-gray-300 text-[6px] sm:text-[9px] md:text-[10px] font-medium mb-1.5 sm:mb-3 truncate">Lifestyle • Streetwear</p>
                    <div className="bg-white text-black text-[6px] sm:text-[8px] md:text-[9px] font-bold uppercase tracking-widest px-2 py-1 sm:px-3 sm:py-1.5 rounded-sm w-max flex items-center group-hover:bg-brand-primary transition-colors">
                      <span className="hidden sm:inline-block mr-1">SHOP</span> <ArrowRight className="sm:ml-1 h-2 w-2 sm:h-2.5 sm:w-2.5" />
                    </div>
                  </div>
                </Link>

                {/* Cleats Card */}
                <Link 
                  href="/shop?type=soccer-cleats" 
                  className="relative h-24 sm:h-32 md:h-40 rounded-lg overflow-hidden group block border border-white/10 hover:border-brand-primary transition-all shadow-lg bg-black"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-10 group-hover:from-black/80 transition-colors duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                  
                  <Image
                    src={displayCleatCategories?.[0]?.image || brand.hero?.backgroundImage || "/pexels-wedding-maps-130174465-10114295.jpg"}
                    alt="Shop Soccer Cleats"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                  />
                  
                  <div className="absolute inset-0 z-20 flex flex-col justify-end p-2.5 sm:p-4 md:p-5 text-left">
                    <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full border border-brand-primary flex items-center justify-center mb-1 sm:mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-primary w-2.5 h-2.5 sm:w-4 sm:h-4"><circle cx="12" cy="12" r="10"/><path d="M12 12 7.5 9"/><path d="M12 12v5.5"/><path d="M12 12l4.5-3"/><path d="m14 19-2-1.5-2 1.5"/><path d="m5 15 2.5-1.5"/><path d="m19 15-2.5-1.5"/><path d="m10 5 2 1.5 2-1.5"/></svg>
                    </div>
                    <h3 className="text-white font-display uppercase tracking-widest text-xs sm:text-xl md:text-2xl drop-shadow-lg mb-0.5 group-hover:text-brand-primary transition-colors leading-none">
                      CLEATS
                    </h3>
                    <p className="text-gray-300 text-[6px] sm:text-[9px] md:text-[10px] font-medium mb-1.5 sm:mb-3 truncate">Matchday • Training</p>
                    <div className="bg-white text-black text-[6px] sm:text-[8px] md:text-[9px] font-bold uppercase tracking-widest px-2 py-1 sm:px-3 sm:py-1.5 rounded-sm w-max flex items-center group-hover:bg-brand-primary transition-colors">
                      <span className="hidden sm:inline-block mr-1">SHOP</span> <ArrowRight className="sm:ml-1 h-2 w-2 sm:h-2.5 sm:w-2.5" />
                    </div>
                  </div>
                </Link>
              </div>
            </motion.div>

        </motion.div>
      </section>

      {/* Featured Sneakers Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-brand-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 sm:mb-12 md:mb-16">
            <motion.h2 
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} 
              className="font-display uppercase tracking-wide text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white"
            >
              Featured Sneakers
            </motion.h2>
            <motion.p 
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} 
              className="text-gray-300 max-w-sm mt-2 sm:mt-3 md:mt-0 font-medium text-xs sm:text-sm md:text-base"
            >
              {brand.sections?.featured?.subtitle || "Find your type. Browse by style and step out in confidence."}
            </motion.p>
          </div>
          
          <div className="overflow-hidden pb-4 sm:pb-8 md:pb-0 -mx-4 sm:-mx-6 px-4 sm:px-6 md:mx-0 md:px-0 relative group">
            {/* Edge fades for seamless look */}
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-brand-card to-transparent z-10 pointer-events-none hidden md:block" />
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-brand-card to-transparent z-10 pointer-events-none hidden md:block" />
            
            <motion.div 
              className="flex w-max gap-3 sm:gap-4 md:gap-6"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 35 }}
            >
              {/* 3. Map over the filtered displayCategories */}
              {[...displayCategories, ...displayCategories, ...displayCategories, ...displayCategories].map((collection: any, idx: number) => (
                <div 
                  key={idx} 
                  className={`relative w-[75vw] sm:w-[300px] md:w-[400px] shrink-0 h-[300px] sm:h-[400px] md:h-[500px]`}
                >
                  <Link 
                    // 4. Force the URL to pre-filter by Sneakers
                    href={`/shop?type=sneakers&category=${collection.slug}`} 
                    className="block w-full h-full overflow-hidden group/card rounded-md sm:rounded-lg bg-neutral-900 border border-white/5 relative"
                  >
                    <div className="absolute inset-0 bg-black/40 group-hover/card:bg-black/60 transition-colors duration-500 z-10" />
                    <Image
                      src={collection.image}
                      alt={collection.name}
                      fill
                      referrerPolicy="no-referrer"
                      className="object-cover transition-transform duration-1000 group-hover/card:scale-110 opacity-80 group-hover/card:opacity-100"
                    />
                    
                    <div className="absolute inset-x-0 top-0 p-4 sm:p-6 z-20 flex justify-between items-start opacity-100 transition-opacity">
                       <div className="bg-brand-primary text-black rounded-sm sm:rounded-md text-[8px] sm:text-[10px] md:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 uppercase tracking-widest">
                         {collection.label}
                       </div>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 md:p-8 flex flex-col justify-end z-20 transition-transform duration-500">
                      <h3 className="text-white font-display uppercase tracking-wider text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-1 sm:mb-2 shadow-black drop-shadow-xl group-hover/card:text-brand-primary transition-colors">{collection.name}</h3>
                      <div className="flex mt-2 sm:mt-4 opacity-100 md:opacity-0 md:-translate-y-4 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-500">
                        <span className="flex items-center rounded-sm sm:rounded-md text-white text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-widest bg-white/20 md:bg-white/10 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 border border-white/20 group-hover/card:bg-brand-primary group-hover/card:text-black group-hover/card:border-brand-primary">
                          Shop Now <ArrowRight className="ml-1.5 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Flash Deals Section */}
      {flashDeals.length > 0 && (
        <section className="py-12 sm:py-16 md:py-24 bg-brand-dark border-y border-brand-accent/20 relative overflow-hidden">
          {/* Subtle dark radial gradient for depth */}
          <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-[#1a0a00] to-transparent pointer-events-none opacity-50 z-0" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} 
                className="w-full md:w-auto"
              >
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <div className="bg-brand-accent text-white text-[9px] sm:text-xs font-bold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-md uppercase tracking-widest flex items-center animate-pulse">
                     <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" /> {brand.sections?.flashDeals?.badge || "Live Now"}
                  </div>
                  <div className="flex items-center text-brand-accent font-mono text-[10px] sm:text-xl lg:text-3xl font-bold rounded-md bg-brand-accent/10 px-2.5 sm:px-4 py-1 sm:py-2 border border-brand-accent/30 shadow-lg shadow-brand-accent/20">
                    <Clock className="h-3 w-3 sm:h-5 sm:w-5 mr-1.5 sm:mr-3" />
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                </div>
                <h2 className="font-display uppercase tracking-wide text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white drop-shadow-lg leading-none mb-1 sm:mb-0">
                  {brand.sections?.flashDeals?.title || "Flash Deals"}
                </h2>
                <p className="text-brand-primary font-bold uppercase tracking-widest text-[9px] sm:text-sm mt-2 sm:mt-3 flex items-center">
                  <Flame className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" /> {brand.sections?.flashDeals?.subtitle || "Grab your favorite styles before they're gone."}
                </p>
              </motion.div>
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} 
                className="mt-4 md:mt-0"
              >
                <Link href="/shop?category=deals" className="h-7 sm:h-8 px-4 sm:px-8 bg-transparent border sm:border-2 border-white text-white font-bold hover:bg-white hover:text-brand-accent rounded-md transition-colors flex items-center justify-center uppercase tracking-widest text-[9px] sm:text-sm w-max">
                  {brand.sections?.flashDeals?.cta || "View All Deals"} <ArrowRight className="ml-1.5 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
              </motion.div>
            </div>
            
            <div className="flex -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:grid md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-6 sm:pb-8 md:pb-0 after:content-[''] after:min-w-[16px] sm:after:min-w-[24px] md:after:hidden">
              {flashDeals.map((product: any) => {
                return (
                 <motion.div 
                  initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} 
                  key={product.id} 
                  className="relative min-w-[80vw] sm:min-w-[45vw] md:min-w-0 snap-center group flex flex-col bg-brand-card border border-white/10 hover:border-brand-accent transition-colors overflow-hidden rounded-md"
                 >
                  <Link href={`/product/${product.id}`} className="block relative aspect-[4/3] bg-black overflow-hidden group-hover:opacity-90 transition-opacity rounded-t-md">
                    {/* Discount Badge */}
                    {product.originalPrice && (
                      <div className="absolute top-2 left-2 z-20 rounded-md bg-brand-accent text-white text-[9px] sm:text-sm font-display uppercase tracking-widest px-2 py-0.5 sm:px-3 sm:py-1 shadow-lg shadow-brand-accent/40">
                        -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                      </div>
                    )}
                    
                    {/* Social Proof Badge */}
                     <div className="absolute top-2 right-2 z-20 bg-black/60 backdrop-blur-md text-white border rounded-md border-white/10 text-[8px] sm:text-[10px] font-bold px-2 py-1 sm:px-3 sm:py-1.5 uppercase tracking-widest flex items-center">
                       <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-1.5 text-brand-primary" /> High Demand
                     </div>

                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      referrerPolicy="no-referrer"
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100"
                    />
                  </Link>
                  
                  {/* Stock Indicator Progress Bar */}
                  <div className="px-3 sm:px-5 pt-3 sm:pt-4">
                    <div className="flex justify-between text-[8px] sm:text-xs uppercase tracking-widest text-brand-accent mb-1.5 sm:mb-2 font-bold">
                       <span>Selling Fast</span>
                       <span>Limited Stock</span>
                    </div>
                    <div className="w-full bg-white/10 h-1 sm:h-1.5 rounded-full">
                       <div className="bg-brand-accent h-full rounded-full" style={{ width: `85%` }}></div>
                    </div>
                  </div>

                  <div className="px-3 sm:px-5 pt-3 sm:pt-4 pb-0 flex flex-col">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-poppins font-semibold text-sm sm:text-md text-white group-hover:text-brand-accent transition-colors">
                        {product.name}
                      </h3>
                      <div className="mt-1.5 sm:mt-2 flex items-center gap-2 sm:gap-3">
                        <span className="font-display tracking-widest text-lg sm:text-xl text-brand-primary">{formatPrice(product.price)}</span>
                        {product.originalPrice && (
                          <span className="text-gray-500 font-semibold line-through text-[10px] sm:text-sm">{formatPrice(product.originalPrice)}</span>
                        )}
                      </div>
                    </Link>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="p-3 sm:p-4 mt-auto flex flex-col gap-1.5 sm:gap-2 relative z-30">
                       <a 
                        href={`https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(
                          `👋 Hello ${brand.name},\n\nI would like to grab this flash deal:\n\n📦 *Item:* ${product.name}\n💰 *Price:* Ksh ${product.price}\n\nPlease let me know the next steps for delivery`
                        )}\n\n${brand.url}/product/${product.id}`}
                        target="_blank" rel="noreferrer"
                        className="w-full bg-brand-primary text-black rounded-md font-bold py-1.5 sm:py-2.5 hover:bg-brand-hover transition-colors flex justify-center items-center uppercase tracking-widest text-[8px] sm:text-xs"
                       >
                         <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" /> Order On WhatsApp
                       </a>
                      <Link 
                        href={`/product/${product.id}`}
                        className="w-full bg-transparent border rounded-md border-white/20 text-white font-bold py-1.5 sm:py-2.5 hover:bg-white hover:text-black transition-colors flex justify-center items-center uppercase tracking-widest text-[8px] sm:text-xs"
                       >
                         Select Option
                       </Link>
                  </div>
                </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Soccer Cleats Category Section (Static & Circular) */}
      {displayCleatCategories.length > 0 && (
        <section className="py-12 sm:py-16 md:py-24 bg-brand-dark relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} className="inline-flex items-center text-brand-primary mb-2 sm:mb-4">
                <Tag className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest">Dominate The Pitch</span>
              </motion.div>
              <motion.h2 
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} 
                className="font-display uppercase tracking-wide text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-2 sm:mb-4"
              >
                Soccer Cleats
              </motion.h2>
              <motion.p 
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} 
                className="text-gray-300 max-w-2xl mx-auto font-medium text-xs sm:text-sm md:text-lg"
              >
                Engineered for speed, precision, and control. Find the perfect fit for your game.
              </motion.p>
            </div>

            {/* Static Grid Layout with Circular Containers */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-12 justify-items-center">
              {displayCleatCategories.map((collection: any, idx: number) => (
                <motion.div 
                  key={idx}
                  initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp}
                  className="flex flex-col items-center group w-full"
                >
                  <Link 
                    href={`/shop?type=soccer-cleats&category=${collection.slug}`}
                    className="block relative w-[35vw] h-[35vw] sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-2 sm:border-4 border-white/5 group-hover:border-brand-primary transition-all duration-500 shadow-2xl mb-3 sm:mb-6 bg-neutral-900"
                  >
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                    <Image
                      src={collection.image}
                      alt={collection.name}
                      fill
                      referrerPolicy="no-referrer"
                      className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    />
                  </Link>
                  
                  <h3 className="font-display uppercase tracking-wider text-lg sm:text-xl md:text-2xl text-white group-hover:text-brand-primary transition-colors text-center mb-1.5 sm:mb-2">
                    {collection.name}
                  </h3>
                  
                  <Link 
                    href={`/shop?type=soccer-cleats&category=${collection.slug}`}
                    className="text-[8px] sm:text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors flex items-center bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/10 group-hover:bg-brand-primary group-hover:text-black group-hover:border-brand-primary"
                  >
                    Explore <ArrowRight className="ml-1.5 sm:ml-2 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals Grid */}
      <section className="py-12 sm:py-16 md:py-24 bg-brand-card border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 sm:mb-12 md:mb-16">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp}>
              <div className="inline-flex items-center text-brand-primary mb-2 sm:mb-4">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest">{brand.sections?.newArrivals?.badge || "Updated Weekly"}</span>
              </div>
              <h2 className="font-display uppercase tracking-wide text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white">
                {brand.sections?.newArrivals?.title || "Latest Styles"}
              </h2>
              <p className="text-gray-300 mt-2 sm:mt-4 max-w-xl font-medium text-xs sm:text-sm md:text-lg">
                {brand.sections?.newArrivals?.subtitle || "Fresh styles added weekly — be the first to own them."}
              </p>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} className="mt-4 md:mt-0">
              <Link href="/shop?category=new-arrivals" className="h-8 sm:h-12 px-4 sm:px-8 border border-white/20 text-white font-bold hover:bg-white hover:text-black transition-colors flex items-center justify-center uppercase tracking-widest text-[9px] sm:text-sm group rounded-md w-max">
                {brand.sections?.newArrivals?.cta || "View All Arrivals"} <ArrowRight className="ml-1.5 sm:ml-3 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
            {newArrivals.map((product: any) => (
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} 
                key={product.id} 
                className="group flex flex-col bg-transparent lg:hover:-translate-y-2 transition-transform duration-500"
              >
                <div className="relative aspect-[3/4] bg-neutral-900 border border-white/10 overflow-hidden mb-3 sm:mb-5 block rounded-md">
                  <Link href={`/product/${product.id}`} className="block w-full h-full absolute inset-0 z-10">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      referrerPolicy="no-referrer"
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out opacity-90 group-hover:opacity-100"
                    />
                  </Link>
                </div>
                
                <div className="flex-1 flex flex-col text-center px-1">
                  <p className="text-[7px] sm:text-[10px] text-brand-primary font-bold uppercase tracking-widest mb-1 sm:mb-1.5 flex justify-center items-center">
                    <Flame className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" /> {brand.sections?.newArrivals?.trendingBadgePrefix || "Trending in"} {brand.location}
                  </p>
                  <Link href={`/product/${product.id}`}>
                    <h3 className="font-poppins font-semibold text-white text-sm sm:text-base md:text-lg line-clamp-1 mb-1 sm:mb-2 group-hover:text-brand-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <span className="font-display tracking-widest text-lg sm:text-xl text-white">{formatPrice(product.price)}</span>
                  </div>

                  {/* Actions - Always visible below content */}
                  <div className="mt-3 sm:mt-4 flex flex-col gap-1.5 sm:gap-2 w-full">
                     <a 
                      href={`https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(
                        `👋 Hello ${brand.name} team,\n\nI just saw your new arrival and I would love to get my hands on it!\n\n✨ *Item:* ${product.name}\n💰 *Price:* Ksh ${product.price}\n\nIs this currently in stock, and what are the delivery options?`
                      )}\n\n${brand.url}/product/${product.id}`}
                      target="_blank" rel="noreferrer"
                      className="w-full bg-brand-primary text-black font-bold py-1.5 sm:py-2 rounded-md transition-colors flex justify-center items-center uppercase tracking-widest text-[7px] sm:text-[9px] md:text-xs hover:bg-brand-hover"
                     >
                       <MessageCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 mr-1 sm:mr-2" /> Order on WhatsApp
                     </a>
                     <Link 
                      href={`/product/${product.id}`}
                      className="w-full bg-transparent border border-white/20 text-white font-bold py-1.5 sm:py-2 rounded-md transition-colors flex justify-center items-center uppercase tracking-widest text-[8px] sm:text-[10px] md:text-xs hover:bg-white hover:text-black"
                     >
                       Select Option
                     </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-brand-dark border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 sm:mb-12 md:mb-16">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp}>
              <div className="inline-flex items-center text-brand-accent mb-2 sm:mb-4">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest">{brand.sections?.bestSellers?.badge || "Customer Favorites"}</span>
              </div>
              <h2 className="font-display uppercase tracking-wide text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white">
                {brand.sections?.bestSellers?.title || "BEST SELLERS"}
              </h2>
              <p className="text-gray-300 mt-2 sm:mt-4 max-w-xl font-medium text-xs sm:text-sm md:text-lg">
                {brand.sections?.bestSellers?.subtitle || "Trusted and loved by hundreds of happy customers."}
              </p>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} className="mt-4 md:mt-0">
              <Link href="/shop?category=best-sellers" className="h-8 sm:h-12 px-4 sm:px-8 border border-white/20 text-white font-bold hover:bg-white hover:text-black transition-colors flex items-center justify-center uppercase tracking-widest text-[9px] sm:text-sm group rounded-md w-max">
                {brand.sections?.bestSellers?.cta || "View All Favorites"} <ArrowRight className="ml-1.5 sm:ml-3 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
            {bestSellers.slice(0, 4).map((product: any) => (
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} 
                key={product.id} 
                className="group flex flex-col bg-transparent"
              >
                <div className="relative aspect-[4/5] bg-neutral-900 border border-white/10 overflow-hidden mb-3 sm:mb-5 block group-hover:border-brand-accent transition-colors rounded-md">                  
                  <Link href={`/product/${product.id}`} className="block w-full h-full absolute inset-0 z-10">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      referrerPolicy="no-referrer"
                      className="object-cover transition-transform duration-700 ease-in-out opacity-90 group-hover:opacity-100 group-hover:scale-105"
                    />
                  </Link>
                </div>
                
                <div className="flex-1 flex flex-col text-left px-1">
                  <div className="flex items-center gap-1 mb-1 sm:mb-2">
                    <div className="flex text-brand-accent">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                      ))}
                    </div>
                    <span className="text-gray-400 text-[8px] sm:text-xs font-bold ml-1">(120+ Reviews)</span>
                  </div>
                  <Link href={`/product/${product.id}`}>
                    <h3 className="font-poppins font-semibold text-white text-sm sm:text-base md:text-lg line-clamp-1 mb-1 group-hover:text-brand-accent transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <span className="font-display tracking-widest text-sm sm:text-base md:text-sm text-white">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                       <span className="text-gray-500 font-semibold line-through text-[9px] sm:text-xs md:text-sm">{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>
                  
                  <div className="text-[7px] sm:text-[9px] md:text-[10px] text-gray-400 uppercase tracking-widest mb-3 sm:mb-4 flex items-center">
                    <ShoppingBag className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 text-gray-500" /> {brand.salesCallout}
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex flex-col gap-1.5 sm:gap-2 w-full">
                     <a 
                      href={`https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(
                        `👋 Hello ${brand.name}!\n\nI saw this is one of your best sellers and I'd love to order one before it sells out:\n\n🌟 *Item:* ${product.name}\n💰 *Price:* Ksh ${product.price}\n\nPlease let me know if you still have stock and the next steps for delivery`
                      )}\n\n${brand.url}/product/${product.id}`}
                      target="_blank" rel="noreferrer"
                      className="w-full bg-brand-primary text-black font-bold py-1.5 sm:py-2 rounded-md transition-colors flex justify-center items-center uppercase tracking-widest text-[7px] sm:text-[9px] md:text-xs hover:bg-brand-hover"
                     >
                       <MessageCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 mr-1 sm:mr-2" /> Order on WhatsApp
                     </a>
                     <Link 
                      href={`/product/${product.id}`}
                      className="w-full bg-transparent border border-white/20 text-white font-bold py-1.5 sm:py-2 rounded-md transition-colors flex justify-center items-center uppercase tracking-widest text-[8px] sm:text-[10px] md:text-xs hover:bg-white hover:text-black"
                     >
                       Select Option
                     </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Customers Choose Us */}
      <section className="py-12 sm:py-16 md:py-24 bg-brand-card border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} className="inline-flex items-center text-brand-primary mb-2 sm:mb-4">
              <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest">
                {brand.sections?.whyUs?.badge || "Trust & Reliability"}
              </span>
            </motion.div>
            <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} className="font-display uppercase tracking-wide text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-3 sm:mb-6">
              {brand.sections?.whyUs?.titleTop || "WHY SHOP WITH"}<br/>
              {brand.name.toUpperCase()}
            </motion.h2>
            <motion.p initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} className="text-gray-300 max-w-2xl mx-auto font-medium text-xs sm:text-sm md:text-lg">
              {brand.sections?.whyUs?.subtitle || "We focus on quality, affordability, and fast service to make your shopping experience effortless."}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {/* Feature 1 */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} className="bg-brand-dark min-h-[160px] sm:min-h-[200px] md:min-h-[220px] p-5 sm:p-6 md:p-8 lg:p-10 border border-white/5 hover:border-brand-primary/50 transition-all duration-300 group cursor-default rounded-md">
              <div className="bg-white/5 w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-brand-primary/10 transition-colors rounded-md">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:text-brand-primary transition-colors" />
              </div>
              <h3 className="font-display tracking-widest uppercase text-lg sm:text-xl text-white mb-2 sm:mb-3">{brand.features[0].title}</h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                {brand.features[0].description}
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} className="bg-brand-dark min-h-[160px] sm:min-h-[200px] md:min-h-[220px] p-5 sm:p-6 md:p-8 lg:p-10 border border-white/5 hover:border-brand-primary/50 transition-all duration-300 group cursor-default rounded-md">
              <div className="bg-white/5 w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-brand-primary/10 transition-colors rounded-md">
                <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:text-brand-primary transition-colors" />
              </div>
              <h3 className="font-display tracking-widest uppercase text-lg sm:text-xl text-white mb-2 sm:mb-3">{brand.features[1].title}</h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                {brand.features[1].description}
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} className="bg-brand-dark min-h-[160px] sm:min-h-[200px] md:min-h-[220px] p-5 sm:p-6 md:p-8 lg:p-10 border border-white/5 hover:border-brand-primary/50 transition-all duration-300 group cursor-default rounded-md">
              <div className="bg-white/5 w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-brand-primary/10 transition-colors rounded-md">
                <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:text-brand-primary transition-colors" />
              </div>
              <h3 className="font-display tracking-widest uppercase text-lg sm:text-xl text-white mb-2 sm:mb-3">{brand.features[2].title}</h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                {brand.features[2].description}
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} className="bg-brand-dark min-h-[160px] sm:min-h-[200px] md:min-h-[220px] p-5 sm:p-6 md:p-8 lg:p-10 border border-white/5 hover:border-brand-primary/50 transition-all duration-300 group cursor-default rounded-md">
              <div className="bg-white/5 w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-brand-primary/10 transition-colors rounded-md">
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:text-brand-primary transition-colors" />
              </div>
              <h3 className="font-display tracking-widest uppercase text-lg sm:text-xl text-white mb-2 sm:mb-3">{brand.features[3].title}</h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                {brand.features[3].description}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-brand-dark relative overflow-hidden border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 sm:mb-12 md:mb-16">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp}>
              <div className="inline-flex items-center text-brand-primary mb-2 sm:mb-4">
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest">
                  {brand.sections?.reviews?.badge || "Real Customer Reviews"}
                </span>
              </div>
              <h2 className="font-display uppercase tracking-wide text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-3 sm:mb-6">
                {brand.sections?.reviews?.titleTop || "WHAT OUR"} <br className="hidden md:block"/>
                {brand.sections?.reviews?.titleBottom || "CUSTOMERS SAY"}
              </h2>
              <div className="flex items-center gap-3 sm:gap-4 mt-4 sm:mt-6">
                <div className="flex -space-x-2 sm:-space-x-3">
                  {reviewAvatars.map((src, idx) => (
                    <Image key={idx} src={src} width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white object-cover" alt={`User ${idx + 1}`} />
                  ))}
                </div>
                <div>
                  <div className="flex text-brand-accent mb-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />)}
                  </div>
                  <p className="text-white text-[8px] sm:text-[10px] md:text-xs font-bold tracking-widest uppercase">{reviewStats.averageRating} • {reviewStats.totalCustomers}</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="overflow-hidden pb-4 sm:pb-8 md:pb-0 -mx-4 sm:-mx-6 px-4 sm:px-6 md:mx-0 md:px-0 relative group">
            {/* Edge fades for seamless look */}
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-brand-dark to-transparent z-10 pointer-events-none hidden md:block" />
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-brand-dark to-transparent z-10 pointer-events-none hidden md:block" />
            
            <motion.div 
              className="flex w-max gap-4 sm:gap-6"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
            >
              {/* 3. Map over the initialTestimonials passed from the server */}
              {[...initialTestimonials, ...initialTestimonials, ...initialTestimonials, ...initialTestimonials].map((review: any, idx: number) => (
                <div 
                  key={`${review.id}-${idx}`} 
                  className="w-[80vw] sm:w-[350px] md:w-[400px] shrink-0 bg-brand-card border border-white/5 hover:border-brand-primary/30 p-4 sm:p-5 md:p-6 flex flex-col group/review rounded-md transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="flex justify-between items-start mb-4 sm:mb-6">
                    <div className="flex text-brand-accent">
                      {[...Array(5)].map((_, i) => (
                         <Star key={i} className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(review.rating) ? 'fill-current' : 'text-gray-600'}`} />
                      ))}
                    </div>
                    <div className="bg-brand-primary/10 text-brand-primary text-[8px] sm:text-[10px] right-3 font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 uppercase rounded-sm sm:rounded-md tracking-widest flex items-center border border-brand-primary/20">
                      <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" /> Verified Order
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm sm:text-base md:text-lg italic mb-6 sm:mb-8 flex-1 leading-relaxed">
                    &ldquo;{review.text}&rdquo;
                  </p>
                  
                  <div className="flex items-center gap-3 sm:gap-4 mt-auto">
                    <Image
                      src={review.profile}
                      alt={review.name}
                      width={48}
                      height={48}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white/10 group-hover/review:border-brand-primary/50 transition-colors"
                    />
                    <div>
                      <p className="text-white font-bold text-xs sm:text-sm tracking-wide">{review.name}</p>
                      <p className="text-gray-400 text-[10px] sm:text-xs mt-0.5 sm:mt-1 flex items-center font-medium">
                        Purchased: <span className="text-brand-primary ml-1">{review.product}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="py-12 sm:py-16 md:py-24 bg-brand-card relative overflow-hidden border-t border-white/5">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] md:w-[800px] md:h-[800px] bg-brand-primary/5 rounded-full blur-[80px] md:blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            
            {/* Left Content */}
            <div className="flex flex-col items-start text-left">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} className="inline-flex items-center text-brand-primary bg-brand-primary/10 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md mb-4 sm:mb-8 border border-brand-primary/20">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-primary animate-pulse mr-2 sm:mr-3"></div>
                <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest">
                  {brand.sections?.whatsappCta?.badge || "We Are Online"}
                </span>
              </motion.div>
              
              <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} className="font-display uppercase tracking-wide text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white mb-4 sm:mb-6 leading-[1.1]">
                {brand.sections?.whatsappCta?.titleTop || "START YOUR"} <br className="hidden md:block"/>
                {brand.sections?.whatsappCta?.titleBottom || "ORDER NOW"}
              </motion.h2>
              
              <motion.p initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} className="text-gray-300 font-medium text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-10 max-w-lg leading-relaxed">
                {brand.sections?.whatsappCta?.subtitle || "Chat with us directly on WhatsApp to confirm size, price, and delivery in minutes."}
              </motion.p>

              {/* Trust Signals Grid */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12 w-full max-w-lg">
                <div className="flex items-center text-gray-300">
                   <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-brand-primary mr-2 sm:mr-3" />
                   <span className="font-medium text-xs sm:text-sm">{brand.whatsappTrustSignals[0]}</span>
                </div>
                <div className="flex items-center text-gray-300">
                   <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-brand-primary mr-2 sm:mr-3" />
                   <span className="font-medium text-xs sm:text-sm">{brand.whatsappTrustSignals[1]}</span>
                </div>
                <div className="flex items-center text-gray-300">
                   <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-brand-primary mr-2 sm:mr-3" />
                   <span className="font-medium text-xs sm:text-sm">{brand.whatsappTrustSignals[2]}</span>
                </div>
                <div className="flex items-center text-gray-300">
                   <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-brand-primary mr-2 sm:mr-3" />
                   <span className="font-medium text-xs sm:text-sm">{brand.whatsappTrustSignals[3]}</span>
                </div>
              </motion.div>

              {/* Primary CTA */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <a 
                  href={`https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(brand.whatsappMessage.general)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 sm:h-12 md:h-14 lg:h-16 px-4 sm:px-6 lg:px-8 bg-brand-primary text-black font-bold text-md rounded-md items-center justify-center hover:bg-brand-hover transition-all hover:scale-105 uppercase tracking-widest group shadow-2xl shadow-brand-primary/40 text-[10px] sm:text-xs lg:text-sm"
                >
                  <MessageCircle className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 group-hover:scale-110 transition-transform" />
                  Order on WhatsApp
                </a>
              </motion.div>
            </div>

            {/* Right Visual mock */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeLeft}
              className="relative w-full max-w-lg mx-auto lg:ml-auto"
            >
              <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-brand-card to-transparent z-10 pointer-events-none"></div>
              
              <div className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden shadow-2xl relative">
                {/* Chat Header */}
                <div className="bg-[#242424] px-4 sm:px-6 py-3 sm:py-4 flex items-center border-b border-white/5">
                   {/* DYNAMIC LOGO / FALLBACK SHORTNAME */}
                   <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-800 flex items-center justify-center mr-3 sm:mr-4 border border-white/10 overflow-hidden shrink-0">
                     {brand.logo ? (
                       <Image src={brand.logo} alt={brand.name} fill className="object-cover" />
                     ) : (
                       <span className="font-display text-white text-base sm:text-lg">
                         {brand.shortName || brand.name.substring(0, 2).toUpperCase()}
                       </span>
                     )}
                   </div>
                   <div>
                     <p className="text-white font-bold text-xs sm:text-sm">{brand.name}</p>
                     <p className="text-brand-primary text-[10px] sm:text-xs font-medium">Online</p>
                   </div>
                   <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 ml-auto" />
                </div>
                
                {/* Chat Body */}
                <div className="p-4 sm:p-6 pb-16 sm:pb-20 space-y-3 sm:space-y-4 bg-black/20">
                   
                   {brand.whatsappMockChat.map((msg, idx) => (
                      msg.sender === 'brand' ? (
                        <div key={idx} className="flex w-full mt-2 space-x-2 sm:space-x-3 max-w-[85%] sm:max-w-xs">
                          {/* DYNAMIC LOGO / FALLBACK SHORTNAME */}
                          <div className="relative flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-neutral-800 flex items-center justify-center mt-auto border border-white/10 overflow-hidden">
                             {brand.logo ? (
                               <Image src={brand.logo} alt={brand.name} fill className="object-cover" />
                             ) : (
                               <span className="font-display text-white text-[10px] sm:text-xs">
                                 {brand.shortName || brand.name.substring(0, 2).toUpperCase()}
                               </span>
                             )}
                          </div>
                          <div className="bg-[#242424] p-3 sm:p-4 rounded-xl rounded-bl-sm border border-white/5 shadow-md">
                             <p className="text-gray-300 text-xs sm:text-sm whitespace-pre-wrap">{msg.text}</p>
                             <p className="text-gray-500 text-[8px] sm:text-[10px] text-right mt-1">{msg.time}</p>
                          </div>
                       </div>
                      ) : (
                        <div key={idx} className="flex w-full mt-2 space-x-2 sm:space-x-3 max-w-[85%] sm:max-w-sm ml-auto justify-end">
                          <div className="bg-brand-primary/20 p-3 sm:p-4 rounded-xl rounded-br-sm border border-brand-primary/30 shadow-md">
                             <p className="text-gray-300 text-xs sm:text-sm whitespace-pre-wrap">{msg.text}</p>
                             <div className="flex justify-end items-center mt-1 space-x-1">
                                <p className="text-gray-400 text-[8px] sm:text-[10px]">{msg.time}</p>
                                <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-brand-primary" />
                             </div>
                          </div>
                       </div>
                      )
                   ))}

                </div>

                {/* Chat Input */}
                <div className="absolute bottom-0 inset-x-0 bg-[#242424] p-3 sm:p-4 flex items-center border-t border-white/5 z-20">
                   <div className="bg-[#1A1A1A] w-full rounded-md h-8 sm:h-10 flex items-center px-3 sm:px-4 border border-white/5">
                      <p className="text-gray-500 text-xs sm:text-sm">Message...</p>
                   </div>
                   <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-brand-primary flex items-center justify-center ml-2 sm:ml-3 flex-shrink-0">
                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-black fill-black" />
                   </div>
                </div>
              </div>
            </motion.div>
            
          </div>
        </div>
      </section>
    </div>
  );
}