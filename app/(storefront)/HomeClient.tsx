// app/HomeClient.tsx

'use client';

import React, { useRef, useEffect, useState } from 'react';

import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

import { motion, useAnimationFrame, useMotionValue } from 'motion/react';
import { fadeUp, fadeLeft, heroReveal, staggerContainer, staggerItem } from '@/lib/animations';
import { ArrowRight, Pencil, Star, ShoppingBag, Truck, ShieldCheck, Clock, MessageCircle, Flame, Eye, Zap, Sparkles, Wallet, CheckCircle, Users, Tag, Grid } from 'lucide-react';

import { formatPrice } from '@/lib/data';
import { brand } from '@/lib/data/brand';

const PublicReviewModal = dynamic(() => import('@/components/PublicReviewModal').then(mod => mod.PublicReviewModal), { ssr: false });
const AnimatedCounter = dynamic(() => import('@/components/AnimatedCounter'), { ssr: false });
// Define the props we expect from the server
export default function HomeClient({ initialProducts, initialCategories, initialTestimonials, storeSettings }: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  
  // --- DRAGGABLE MARQUEE STATE ---
  const carouselRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const copyWidthRef = useRef(0); // Holds the exact pixel width of 1 copy (including gaps)
  const isPausedRef = useRef(false);
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

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

  const sneakerProducts = initialProducts.filter((p: any) => p.productType === 'Sneakers');

  const newArrivals = initialProducts.filter((p: any) => p.isNewArrival).slice(0, 6);
  const bestSellers = initialProducts.filter((p: any) => p.isBestSeller);
  const flashDeals = initialProducts.filter((p: any) => p.isFlashDeal).slice(0, 12);

  const sneakerCategories = initialCategories.filter((collection: any) => 
    sneakerProducts.some((p: any) => p.category === collection.name)
  );
  
  const displayCategories = sneakerCategories.length > 0 ? sneakerCategories : initialCategories;

  const cleatProducts = initialProducts.filter((p: any) => p.productType === 'Soccer Cleats');
  const displayCleatCategories = initialCategories.filter((collection: any) => 
    cleatProducts.some((p: any) => p.category === collection.name)
  );

  const officialProducts = initialProducts.filter((p: any) => p.category === 'Official Shoes');
  const displayOfficialCategories = initialCategories.filter((collection: any) => 
    officialProducts.some((p: any) => p.category === collection.name)
  );

  const sandalProducts = initialProducts.filter((p: any) => p.category === 'Opens & Sandals');
  const displaySandalCategories = initialCategories.filter((collection: any) => 
    sandalProducts.some((p: any) => p.category === collection.name)
  );

  // 1. Average Rating: Keep the real math, but default to your fallback if no reviews exist
  const totalReviews = initialTestimonials.length;
  const averageRating = totalReviews > 0 
    ? Number((initialTestimonials.reduce((acc: number, curr: any) => acc + curr.rating, 0) / totalReviews).toFixed(1))
    : Number(storeSettings?.fallbackRating || 4.8);

  // 2. Calculate Total Customers
  const totalCustomerss = totalReviews > 0 
    ? totalReviews 
    : 2500;

  const customerBaseline = 500; 
  const totalCustomers = customerBaseline + totalReviews;

  // 3. Calculate Verified Percentage
  const verifiedCount = initialTestimonials.filter((t: any) => t.purchased).length;
  const verifiedPercentages = totalReviews > 0 
    ? Math.round((verifiedCount / totalReviews) * 100) 
    : 100;

  const verifiedPercentage = 100;

  // Helper: Extracts initials from a name (e.g., "Faith K." -> "FK")
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-600', 'bg-green-600', 'bg-purple-600', 
      'bg-pink-600', 'bg-indigo-600', 'bg-teal-600', 'bg-orange-600'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // --- FEATURED COLLECTIONS INFINITE SCROLL SETUP ---
  useEffect(() => {
    const measure = () => {
      if (carouselRef.current && carouselRef.current.children.length > 0) {
        const children = carouselRef.current.children;
        const numItemsPerCopy = displayCategories.length;
        
        // Ensure items are actually rendered
        if (children.length < numItemsPerCopy * 2 || numItemsPerCopy === 0) return;
        
        // We measure the offset difference between the first item of Copy 1 and first item of Copy 2.
        // This gives us the EXACT pixel width of one full copy, including any flex gaps.
        const firstItem = children[0] as HTMLElement;
        const nextCopyFirstItem = children[numItemsPerCopy] as HTMLElement;
        const exactCopyWidth = nextCopyFirstItem.offsetLeft - firstItem.offsetLeft;
        
        copyWidthRef.current = exactCopyWidth;
        
        // Initial shift: start looking at the 2nd copy so the user can immediately swipe right without hitting blank space.
        if (x.get() === 0 && exactCopyWidth > 0) {
           x.set(-exactCopyWidth);
        }
      }
    };
    
    measure();
    const timeoutId = setTimeout(measure, 200);
    window.addEventListener('resize', measure);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', measure);
    };
  }, [displayCategories, x]);

  useAnimationFrame((time, delta) => {
    if (copyWidthRef.current === 0) return;

    let currentX = x.get();
    
    // 1. Move automatically ONLY if not paused
    if (!isPausedRef.current) {
      const speedPxPerMs = 0.08; // Slower, better UX
      currentX -= speedPxPerMs * delta;
    }

    // 2. Wrap boundaries ALWAYS run (even during a manual drag pause)
    const L = copyWidthRef.current;
    
    // Modulo math to ensure `currentX` ALWAYS stays safely clamped within the middle two cloned copies [-2L, -L]
    const wrap = (v: number, max: number) => ((v % max) + max) % max;
    const wrappedX = wrap(currentX + 2 * L, L) - 2 * L;

    // Apply wrapped position securely to catch over-swiping seamlessly
    if (wrappedX !== currentX) {
       x.set(wrappedX);
    } else if (!isPausedRef.current) {
       x.set(currentX); 
    }
  });

  const handleInteractionStart = () => {
    isPausedRef.current = true;
    if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
  };

  const handleInteractionEnd = () => {
    if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
    interactionTimeoutRef.current = setTimeout(() => {
      isPausedRef.current = false;
    }, 3000); // 3-second hold
  };

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen bg-brand-dark text-white -mt-[80px] md:-mt-[87px]">
      {/* 
        Redesigned Hero Section
        2. Set to min-h-[100svh] to span from the absolute top to the absolute bottom edge
        3. Add internal padding to safely center the content between the overlapping fixed navbars
      */}
      <section ref={heroRef} className="relative min-h-[100svh] w-full flex flex-col justify-center overflow-hidden bg-black pt-[80px] md:pt-[87px] pb-[88px] md:pb-0">
        
        {/* Full Section Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={brand.hero?.desktopBackgroundImage}
            alt="Kickverse KE - Original Sneakers, Soccer Cleats and Official Shoes in Nairobi Kenya"
            fill
            priority
            fetchPriority="high"
            referrerPolicy="no-referrer"
            className="hero-image object-cover object-left md:object-center opacity-80 md:opacity-100"
          />
        </div>

        {/* Content Wrapper */}
        <motion.div 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="relative z-10 max-w-7xl mx-auto w-full flex flex-col items-center text-center px-4 sm:px-6 lg:px-16 xl:px-24"
        >
            {/* Trust Label Pill */}
            <motion.div
              variants={staggerItem}
              className="inline-flex items-center justify-center space-x-1.5 bg-transparent border border-white/20 rounded-full px-2.5 py-1 mb-2 sm:mb-4"
            >
              <ShieldCheck className="h-3.5 w-3.5 sm:h-3.5 sm:w-3.5 text-brand-primary" />
              <span className="text-white text-[10px] sm:text-[10px] font-bold tracking-widest uppercase">
                {brand.hero?.badge || "TESTED, TRUSTED AND APPROVED IN NAIROBI"}
              </span>
            </motion.div>

            {/* Main Headline - Increased text sizes for all breakpoints */}
            <div className="overflow-hidden mb-4 sm:mb-6 w-full">
              <motion.h1 
                variants={heroReveal}
                className="font-display uppercase tracking-wider text-[2.8rem] sm:text-[3.5rem] md:text-[5rem] lg:text-[7rem] leading-[0.9] text-white drop-shadow-2xl"
              >
                <span className="sr-only">Premium Sneakers, Soccer Cleats & Official Shoes at Kickverse Nairobi, Kenya - </span>
                {brand.hero?.headlineTop || "HOME OF THE BEST"} <br/> 
                <span className="text-brand-primary inline-block mt-5 sm:mt-5">{brand.hero?.headlineHighlight || "SNEAKERS & CLEATS"}</span>
              </motion.h1>
            </div>

            {/* Subheadline */}
            <motion.p 
              variants={staggerItem}
              className="text-gray-100 text-[13px] sm:text-sm md:text-base max-w-[480px] sm:max-w-lg mb-5 sm:mb-5 font-medium leading-relaxed drop-shadow-xl shadow-black mx-auto"
            >
              {brand.description}
            </motion.p>
            
            {/* Micro Trust List - Centered vertically 
            <motion.div 
              variants={staggerItem}
              className="flex flex-col items-center justify-center gap-y-2 sm:gap-y-3 mb-4 sm:mb-6 text-[9px] sm:text-[11px] md:text-xs font-bold uppercase tracking-widest text-white drop-shadow-xl shadow-black"
            >
              <div className="flex items-center">
                <Truck className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-brand-primary" /> {brand.trustStatements[0] || "We Deliver countrywide"}
              </div>
              <div className="flex items-center">
                <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-brand-primary" /> {brand.trustStatements[1] || "Genuine quality"}
              </div>
               <div className="flex items-center">
                <Wallet className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-brand-primary" /> {brand.trustStatements[2] || "Pay on delivery"}
              </div>
            </motion.div>*/}

            {/* CTA Section - Added justify-center */}
            <motion.div 
              variants={staggerItem}
              className="flex flex-row justify-center w-full sm:w-auto gap-2 sm:gap-3"
            >
               <a 
                href={`https://wa.me/${brand.whatsappNumber}`} 
                target="_blank"
                rel="noreferrer"
                className="h-9 sm:h-12 px-3 sm:px-6 rounded-md bg-brand-primary text-black font-bold uppercase tracking-widest text-[11px] sm:text-xs flex items-center justify-center hover:bg-brand-hover transition-colors shadow-lg shadow-brand-primary/20 flex-1 sm:flex-none"
               >
                 <MessageCircle className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Order on WhatsApp
               </a>
               <Link 
                href="/shop?type=sneakers" 
                className="h-9 sm:h-12 px-3 sm:px-6 rounded-md bg-transparent border border-white text-white font-bold uppercase tracking-widest text-[9px] sm:text-xs flex items-center justify-center hover:bg-white hover:text-black transition-colors flex-1 sm:flex-none"
               >
                 {brand.hero?.ctaSecondary || "SHOP COLLECTION"}
               </Link>
            </motion.div>

            {/* Choose Your Collection Cards - Expanded max width to support 4 columns */}
            <motion.div 
              variants={staggerItem} 
              className="w-full max-w-sm sm:max-w-lg md:max-w-5xl lg:max-w-6xl mt-6 sm:mt-10"
            >
              {/* Changed to md:grid-cols-4 for big screens and grid-cols-2 for mobile screens */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                
                {/* 1. Sneakers Card */}
                <Link 
                  href="/shop?type=sneakers" 
                  className="relative h-24 sm:h-32 md:h-40 rounded-lg overflow-hidden group block border border-white/10 hover:border-brand-primary transition-all shadow-lg bg-black"
                >
                  
                  
                  <Image
                    src={displayCategories?.[0]?.image || brand.hero?.sneakersImage}
                    alt="Buy Original Sneakers in Nairobi - Nike, Jordan, Adidas, New Balance"
                    fill
                    className="object-cover group-hover:scale-103 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 z-20 flex flex-col justify-end p-2.5 sm:p-3 text-left">
                    <h2 className="text-white font-display uppercase tracking-widest text-xs sm:text-sm lg:text-lg drop-shadow-lg group-hover:text-brand-primary transition-colors leading-none">
                      SNEAKERS
                    </h2>
                    <div className="flex justify-between items-center w-full mt-1.5 sm:mt-2">
                      <p className="text-gray-300 text-[11px] sm:text-xs md:text-sm font-medium truncate pr-2">Lifestyle • Streetwear</p>
                      <div className="bg-white text-black text-[6px] sm:text-[8px] md:text-[9px] font-bold uppercase tracking-widest px-2 py-1 sm:px-3 sm:py-1.5 rounded-sm w-max flex items-center group-hover:bg-brand-primary transition-colors shrink-0">
                        <span className="hidden sm:inline-block mr-1">SHOP</span> <ArrowRight className="sm:ml-1 h-2 w-2 sm:h-2.5 sm:w-2.5" />
                      </div>
                    </div>
                  </div>
                </Link>

                {/* 2. Cleats Card */}
                <Link 
                  href="/shop?type=soccer-cleats" 
                  className="relative h-24 sm:h-32 md:h-40 rounded-lg overflow-hidden group block border border-white/10 hover:border-brand-primary transition-all shadow-lg bg-black"
                >
                  
                  
                  <Image
                    src={displayCleatCategories?.[0]?.image || brand.hero?.soccerCleatsImage}
                    alt="Buy Professional Soccer Cleats and Artificial Turf Trainers in Nairobi"
                    fill
                    className="object-cover group-hover:scale-103 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 z-20 flex flex-col justify-end p-2.5 sm:p-3 text-left">
                    <h2 className="text-white font-display uppercase tracking-widest text-xs sm:text-sm lg:text-lg drop-shadow-lg group-hover:text-brand-primary transition-colors leading-none">
                      SOCCER CLEATS
                    </h2>
                    <div className="flex justify-between items-center w-full mt-1.5 sm:mt-2">
                      <p className="text-gray-300 text-[11px] sm:text-xs md:text-sm font-medium truncate pr-2">Turf • Matchday</p>
                      <div className="bg-white text-black text-[6px] sm:text-[8px] md:text-[9px] font-bold uppercase tracking-widest px-2 py-1 sm:px-3 sm:py-1.5 rounded-sm w-max flex items-center group-hover:bg-brand-primary transition-colors shrink-0">
                        <span className="hidden sm:inline-block mr-1">SHOP</span> <ArrowRight className="sm:ml-1 h-2 w-2 sm:h-2.5 sm:w-2.5" />
                      </div>
                    </div>
                  </div>
                </Link>

                {/* 3. Official Shoes Card */}
                <Link 
                   href="/shop?type=official-shoes"
                  className="relative h-24 sm:h-32 md:h-40 rounded-lg overflow-hidden group block border border-white/10 hover:border-brand-primary transition-all shadow-lg bg-black"
                >
                  
                  
                  <Image
                    src={displayOfficialCategories?.[0]?.image || brand.hero?.officialsImage}
                    alt="Buy Pure Leather Official Shoes in Nairobi CBD"
                    fill
                    className="object-cover group-hover:scale-103 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 z-20 flex flex-col justify-end p-2.5 sm:p-3 text-left">
                    <h2 className="text-white font-display uppercase tracking-widest text-xs sm:text-sm lg:text-lg drop-shadow-lg group-hover:text-brand-primary transition-colors leading-none">
                      OFFICIAL SHOES
                    </h2>
                    <div className="flex justify-between items-center w-full mt-1.5 sm:mt-2">
                      <p className="text-gray-300 text-[11px] sm:text-xs md:text-sm font-medium truncate pr-2">Pure Leather • Formal</p>
                      <div className="bg-white text-black text-[6px] sm:text-[8px] md:text-[9px] font-bold uppercase tracking-widest px-2 py-1 sm:px-3 sm:py-1.5 rounded-sm w-max flex items-center group-hover:bg-brand-primary transition-colors shrink-0">
                        <span className="hidden sm:inline-block mr-1">SHOP</span> <ArrowRight className="sm:ml-1 h-2 w-2 sm:h-2.5 sm:w-2.5" />
                      </div>
                    </div>
                  </div>
                </Link>

                {/* 4. Opens & Sandals Card */}
                <Link 
                  href="/shop?type=opens-sandals"
                  className="relative h-24 sm:h-32 md:h-40 rounded-lg overflow-hidden group block border border-white/10 hover:border-brand-primary transition-all shadow-lg bg-black"
                >
                  
                  
                  <Image
                    src={displaySandalCategories?.[0]?.image || brand.hero?.opensSandalsImage}
                    alt="Buy Casual Suede Clogs and Sandals Online in Kenya"
                    fill
                    className="object-cover group-hover:scale-103 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 z-20 flex flex-col justify-end p-2.5 sm:p-3 text-left">
                    <h2 className="text-white font-display uppercase tracking-widest text-xs sm:text-sm lg:text-lg drop-shadow-lg group-hover:text-brand-primary transition-colors leading-none">
                      OPEN SHOES & SANDALS
                    </h2>
                    <div className="flex justify-between items-center w-full mt-1.5 sm:mt-2">
                      <p className="text-gray-300 text-[11px] sm:text-xs md:text-sm font-medium truncate pr-2">Suede Clogs • Summer</p>
                      <div className="bg-white text-black text-[6px] sm:text-[8px] md:text-[9px] font-bold uppercase tracking-widest px-2 py-1 sm:px-3 sm:py-1.5 rounded-sm w-max flex items-center group-hover:bg-brand-primary transition-colors shrink-0">
                        <span className="hidden sm:inline-block mr-1">SHOP</span> <ArrowRight className="sm:ml-1 h-2 w-2 sm:h-2.5 sm:w-2.5" />
                      </div>
                    </div>
                  </div>
                </Link>

              </div>
            </motion.div>

        </motion.div>
      </section>

      {/* Featured Collections Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-brand-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 sm:mb-12 md:mb-16">
            <motion.h2 
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} 
              className="font-display uppercase tracking-wide text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white"
            >
              {brand.sections?.featured?.title || "Featured Collections"}
            </motion.h2>
            <motion.p 
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} 
              className="text-gray-300 max-w-sm mt-2 sm:mt-3 md:mt-0 font-medium text-xs sm:text-sm md:text-base"
            >
              {brand.sections?.featured?.subtitle || "Browse our curated selection of original quality sneakers in Nairobi."}
            </motion.p>
          </div>
          
          <div className="overflow-hidden pb-4 sm:pb-8 md:pb-0 -mx-4 sm:-mx-6 px-4 sm:px-6 md:mx-0 md:px-0 relative group">
            {/* Edge fades for seamless look */}
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-brand-card to-transparent z-10 pointer-events-none hidden md:block" />
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-brand-card to-transparent z-10 pointer-events-none hidden md:block" />
            
            <motion.div 
              ref={carouselRef}
              className="flex w-max gap-3 sm:gap-4 md:gap-6 cursor-grab active:cursor-grabbing relative"
              style={{ x }}
              drag="x"
              onDragStart={handleInteractionStart}
              onDragEnd={handleInteractionEnd}
              onPointerDown={handleInteractionStart}
              onPointerUp={handleInteractionEnd}
              onPointerCancel={handleInteractionEnd}
              onHoverStart={handleInteractionStart}
              onHoverEnd={handleInteractionEnd}
            >
              {/* Mapping 4 exact copies ensures there's always safe space to loop within */}
              {[...displayCategories, ...displayCategories, ...displayCategories, ...displayCategories].map((collection: any, idx: number) => (
                <div 
                  key={idx} 
                  className={`relative w-[75vw] sm:w-[300px] md:w-[400px] shrink-0 h-[300px] sm:h-[400px] md:h-[500px]`}
                >
                  <Link 
                    href={`/shop?type=sneakers&category=${collection.slug}`} 
                    className="block w-full h-full overflow-hidden group/card rounded-md sm:rounded-lg bg-neutral-900 border border-white/5 relative"
                  >
                    <div className="absolute inset-0 bg-black/20 group-hover/card:bg-black/30 transition-colors duration-500 z-10" />
                    <Image
                      src={collection.image}
                      alt={`${collection.name} Footwear Collection in Nairobi Kenya`}
                      fill
                      referrerPolicy="no-referrer"
                      className="object-cover transition-transform duration-1000 group-hover/card:scale-110 opacity-90 group-hover/card:opacity-100"
                    />
                    
                    <div className="absolute inset-x-0 top-0 p-4 sm:p-6 z-20 flex justify-between items-start opacity-100 transition-opacity">
                       <div className="bg-brand-primary text-black rounded-sm sm:rounded-md text-[8px] sm:text-[10px] md:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 uppercase tracking-widest">
                         {collection.label || "Authentic"}
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
            
            {/* 
              Redesigned Responsive Header
              Mobile: Full stacked vertical hierarchy
              Tablet (md): Left title group, right-aligned stacked controls
              Desktop (lg): Left title group, right-aligned horizontal controls 
            */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 md:gap-8 mb-8 sm:mb-12">
              
              {/* Title & Subtitle Group */}
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} 
                className="flex flex-col w-full md:w-auto md:max-w-[55%]"
              >
                <h2 className="font-display uppercase tracking-wide text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white drop-shadow-lg leading-tight md:leading-none mb-2 sm:mb-3">
                  {brand.sections?.flashDeals?.title || "Flash Deals on Trending Footwear"}
                </h2>
                <p className="font-poppins text-brand-primary text-xs sm:text-sm md:text-base">
                  {brand.sections?.flashDeals?.subtitle || "Selected styles. Limited-time prices in Kenya."}
                </p>
              </motion.div>

              {/* Controls Group: Countdown & CTA */}
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} 
                className="flex flex-col md:items-end gap-3 sm:gap-4 lg:flex-row lg:items-center lg:gap-6 w-full md:w-auto mt-2 md:mt-0"
              >
                {/* Static, Premium Countdown */}
                <div className="flex items-center text-brand-accent font-mono text-sm sm:text-base font-bold rounded-md bg-brand-accent/10 px-3.5 sm:px-5 py-2 sm:py-2.5 border border-brand-accent/20 shadow-lg shadow-brand-accent/5">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="text-white text-xs sm:text-sm font-sans tracking-widest uppercase mr-2 sm:mr-3">Ends In</span>
                  <span className="tracking-wider">{formatTime(timeLeft)}</span>
                </div>

                {/* Subordinate Outlined CTA */}
                <Link href="/shop?type=sneakers&category=deals" className="inline-flex h-10 sm:h-11 px-5 sm:px-6 bg-transparent border border-white/30 text-white font-bold hover:bg-white hover:text-brand-dark hover:border-white rounded-md transition-colors duration-300 items-center justify-center uppercase tracking-widest text-xs w-max">
                  {brand.sections?.flashDeals?.cta || "View All Deals"} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </motion.div>
            </div>
            
            {/* Unchanged Product Card Rail/Grid */}
            <div className="flex -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:grid md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-6 sm:pb-8 md:pb-0 after:content-[''] after:min-w-[16px] sm:after:min-w-[24px] md:after:hidden">
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
                      alt={`${product.name} - Buy online in Nairobi Kenya with Pay on Delivery`}
                      fill
                      referrerPolicy="no-referrer"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-100 group-hover:opacity-100"
                    />
                  </Link>
                  
                  {/* Stock Indicator Progress Bar */}
                  <div className="px-3 sm:px-5 pt-3 sm:pt-4">
                    <div className="flex justify-between text-[8px] sm:text-xs uppercase tracking-widest text-brand-accent mb-1.5 sm:mb-2 font-bold">
                       <span>Limited Stock</span>
                    </div>
                    <div className="w-full bg-white/10 h-1 sm:h-1.5 rounded-full">
                       <div className="bg-brand-accent h-full rounded-full" style={{ width: `85%` }}></div>
                    </div>
                  </div>

                  <div className="px-3 sm:px-5 pt-3 sm:pt-4 pb-0 flex flex-col">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-poppins font-semibold text-sm sm:text-base text-white group-hover:text-brand-accent transition-colors">
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
                         View Details
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
                <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest">Professional Soccer Cleats & Turf Trainers</span>
              </motion.div>
              <motion.h2 
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} 
                className="font-display uppercase tracking-wide text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-2 sm:mb-4"
              >
                Soccer Cleats & Turf Boots in Nairobi
              </motion.h2>
              <motion.p 
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} 
                className="text-gray-300 max-w-2xl mx-auto font-medium text-xs sm:text-sm md:text-lg"
              >
                Engineered for artificial turf (TF), firm ground (FG), and artificial grass (AG). Find the perfect boot for Nairobi pitches.
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
                      alt={`${collection.name} Soccer Cleats and Turf Trainers in Kenya`}
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
                {brand.sections?.newArrivals?.title || "Trending Men's and Women's Footwear in Nairobi"}
              </h2>
              <p className="text-gray-300 mt-2 sm:mt-4 max-w-xl font-medium text-xs sm:text-sm md:text-lg">
                {brand.sections?.newArrivals?.subtitle || "Fresh styles added weekly — be the first to own them."}
              </p>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} className="mt-4 md:mt-0">
              <Link href="/shop?type=sneakers&category=new-arrivals" className="h-8 sm:h-12 px-4 sm:px-8 border border-white/20 text-white font-bold hover:bg-white hover:text-black transition-colors flex items-center justify-center uppercase tracking-widest text-[9px] sm:text-sm group rounded-md w-max">
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
                      alt={`Buy ${product.name} Online Nairobi - Authentic Footwear Delivery`}
                      fill
                      referrerPolicy="no-referrer"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
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
                       View Details
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
                {brand.sections?.bestSellers?.subtitle || "Trusted and loved by hundreds of happy customers across Kenya."}
              </p>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} className="mt-4 md:mt-0">
              <Link href="/shop?type=sneakers&category=best-sellers" className="h-8 sm:h-12 px-4 sm:px-8 border border-white/20 text-white font-bold hover:bg-white hover:text-black transition-colors flex items-center justify-center uppercase tracking-widest text-[9px] sm:text-sm group rounded-md w-max">
                {brand.sections?.bestSellers?.cta || "View All Favorites"} <ArrowRight className="ml-1.5 sm:ml-3 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
            {bestSellers.slice(0, 6).map((product: any) => (
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} 
                key={product.id} 
                className="group flex flex-col bg-transparent"
              >
                <div className="relative aspect-[4/5] bg-neutral-900 border border-white/10 overflow-hidden mb-3 sm:mb-5 block group-hover:border-brand-accent transition-colors rounded-md">                  
                  <Link href={`/product/${product.id}`} className="block w-full h-full absolute inset-0 z-10">
                    <Image
                      src={product.image}
                      alt={`${product.name} - Best Selling Footwear in Nairobi Kenya`}
                      fill
                      referrerPolicy="no-referrer"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
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
                       View Details
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
      <section className="py-10 sm:py-12 md:py-24 bg-brand-dark relative overflow-hidden border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          
          {/* Header - Centered Title & Subtitle */}
          <div className="flex flex-col items-center text-center mb-4 sm:mb-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp}>
              <h2 className="font-display uppercase tracking-wide text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-2 sm:mb-4">
                WHAT OUR CUSTOMERS SAY
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto font-medium text-xs sm:text-sm md:text-lg mb-2">
                Real experiences from footwear buyers across Nairobi and Kenya.
              </p>
            </motion.div>
          </div>

          {/* Stats Bar */}
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, amount: 0.1 }} 
            variants={fadeUp} 
            className="mb-4 sm:mb-10 w-full max-w-4xl mx-auto"
          >
            <div className="flex flex-row divide-x bg-brand-dark/40 overflow-hidden backdrop-blur-sm">
              
              {/* Stat 1: Average Rating */}
              <div className="flex-1 flex flex-col items-center justify-center p-6 sm:border-r border-white/10 group">
                <div className="flex items-center text-brand-primary mb-2 text-2xl sm:text-3xl font-display font-bold transition-transform duration-300 group-hover:scale-105">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-current mr-2.5" />
                  <AnimatedCounter value={averageRating} decimals={1} />
                  <span className="text-xl sm:text-2xl text-gray-500 ml-1">/5</span>
                </div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400">
                  Average Rating
                </span>
              </div>

              {/* Stat 2: Happy Customers */}
              <div className="flex-1 flex flex-col items-center justify-center p-6 sm:border-r border-white/10 group">
                <div className="flex items-center text-white mb-2 text-2xl sm:text-3xl font-display font-bold transition-transform duration-300 group-hover:scale-105">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary mr-2.5" />
                  <AnimatedCounter value={totalCustomers} decimals={0} />
                  <span className="text-brand-primary ml-1">+</span>
                </div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400">
                  Happy Customers
                </span>
              </div>

              {/* Stat 3: Verified Purchases */}
              <div className="flex-1 flex flex-col items-center justify-center p-6 group">
                <div className="flex items-center text-white mb-2 text-2xl sm:text-3xl font-display font-bold transition-transform duration-300 group-hover:scale-105">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary mr-2.5" />
                  <AnimatedCounter value={verifiedPercentage} decimals={0} />
                  <span className="text-brand-primary ml-1">%</span>
                </div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400">
                  Verified Purchases
                </span>
              </div>

            </div>
          </motion.div>

          {/* Marquee Carousel */}
          <div className="overflow-hidden pb-4 sm:pb-8 md:pb-0 -mx-4 sm:-mx-6 px-4 sm:px-6 md:mx-0 md:px-0 relative group">
            {/* Edge fades for seamless look */}
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-brand-dark to-transparent z-10 pointer-events-none hidden md:block" />
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-brand-dark to-transparent z-10 pointer-events-none hidden md:block" />
            
            <motion.div 
              className="flex w-max gap-4 sm:gap-6"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
            >
              {/* Map over the initialTestimonials passed from the server */}
              {[...initialTestimonials, ...initialTestimonials, ...initialTestimonials, ...initialTestimonials].map((review: any, idx: number) => {
                
                // Safely extract up to 2 review images from the schema's text column
                const reviewImages = review.reviewImage ? review.reviewImage.split(',').slice(0, 2) : [];

                return (
                  <div 
                    key={`${review.id}-${idx}`} 
                    className="w-[85vw] sm:w-[380px] md:w-[420px] shrink-0 bg-brand-card border border-white/5 hover:border-brand-primary/30 flex flex-col group/review rounded-xl transition-all duration-500 hover:-translate-y-2 shadow-xl overflow-hidden"
                  >
                    {/* --- TOP SECTION: Hero Image & Quote --- 
                    <div className="relative w-full h-48 sm:h-56 bg-brand-dark/50 border-b border-white/5">
                      {/* Quote Overlay 
                      <div className="absolute top-3 left-4 z-20">
                        <span className="text-brand-primary text-5xl sm:text-6xl font-serif italic font-bold leading-none drop-shadow-lg opacity-90">&ldquo;</span>
                      </div>
                      
                      {reviewImages.length > 0 ? (
                        <Image src={reviewImages[0].trim()} alt={review.productName || "Customer Photo"} fill className="object-cover" />
                      ) : (
                        /* Placeholder when no image exists 
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900/40">
                          <span className="text-gray-600 font-medium uppercase tracking-widest text-[10px] sm:text-xs">No Image Provided</span>
                        </div>*/}
                    
                      
                      {/* Subtle dark gradient overlay to ensure the quote pops against light images 
                      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent pointer-events-none z-10" />
                    </div>*/}

                    {/* --- BOTTOM SECTION: Content & Profile --- */}
                    <div className="p-5 sm:p-6 flex flex-col flex-1">
                      
                      {/* Rating & Verified Badge Row */}
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <div className="flex text-brand-accent">
                            {[...Array(5)].map((_, i) => (
                               <Star key={i} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${i < Math.floor(review.rating) ? 'fill-current' : 'text-gray-600'}`} />
                            ))}
                          </div>
                          <span className="text-white text-xs sm:text-sm font-semibold ml-1">
                            {Number(review.rating).toFixed(1)}
                          </span>
                        </div>
                        
                        {review.purchased && (
                          <div className="border border-brand-primary/60 text-brand-primary text-[9px] sm:text-[10px] font-medium px-2.5 py-1 rounded-full flex items-center shrink-0">
                            <CheckCircle className="w-3 h-3 mr-1" /> Verified Purchaser
                          </div>
                        )}
                      </div>

                      {/* Review Text Area */}
                      <div className="flex-1 mb-6">
                        <p className="text-gray-200 text-sm sm:text-base leading-relaxed break-words">
                          <span className="text-brand-primary font-serif text-xl sm:text-2xl font-bold mr-1 leading-none">
                            &ldquo;
                          </span>
                          {review.text}
                          <span className="text-brand-primary font-serif text-xl sm:text-2xl font-bold ml-1 leading-none">
                            &rdquo;
                          </span>
                        </p>
                      </div>

                      {/* Profile Footer */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 relative rounded-full overflow-hidden shrink-0 border border-white/10 bg-black">
                          {review.profile ? (
                            <Image src={review.profile} alt={review.name} fill className="object-cover" />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center text-white font-bold text-[10px] sm:text-xs tracking-wider ${getAvatarColor(review.name)}`}>
                              {getInitials(review.name)}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center">
                          <span className="text-white font-bold text-sm sm:text-base leading-tight tracking-wide">{review.name}</span>
                          {review.productName && (
                            <span className="text-brand-primary text-[10px] sm:text-xs mt-0.5 truncate max-w-[200px] sm:max-w-[240px]">
                              {review.productName}
                            </span>
                          )}
                          <span className="text-gray-500 text-[9px] sm:text-[10px] mt-0.5 uppercase tracking-widest">{review.date || 'Recently'}</span>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>

          {/* Integrated Call to Action */}
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, amount: 0.1 }} 
            variants={fadeUp} 
            className="mt-8 sm:mt-12 flex flex-col items-center justify-center"
          >
             <button 
               onClick={() => setIsReviewModalOpen(true)}
               className="group inline-flex items-center text-brand-primary hover:text-white transition-colors duration-300 font-bold text-sm sm:text-base uppercase tracking-widest cursor-pointer"
             >
               <Pencil className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
               Share Your Experience
               <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
             </button>
             <p className="text-gray-400 text-xs sm:text-sm mt-2.5 font-medium">
               We&apos;d love to hear what you think.
             </p>
          </motion.div>

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
                {brand.sections?.whatsappCta?.subtitle || "Chat directly with our Nairobi sales team on WhatsApp to confirm size, price, and instant CBD dispatch."}
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
{/* Universal Review Modal */}
      <PublicReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        // No productId passed here, so it automatically registers as a global store review!
      />

    </div>
  );
}