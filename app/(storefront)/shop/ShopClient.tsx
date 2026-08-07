// app/(storefront)/shop/ShopClient.tsx
'use client';

import React, { useState, useEffect, Suspense, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Filter, ChevronDown, Check, X, SlidersHorizontal, MessageCircle, Search, Heart, Eye, Star, SearchX } from 'lucide-react';
import { formatPrice } from '@/lib/data';
import { brand } from '@/lib/data/brand';
import { discoveryChips, filterCategories, searchSuggestions, priceRanges, filterSizes } from '@/lib/data/categories';
import { motion, AnimatePresence } from 'motion/react';
import { staggerContainer, staggerItem, fadeIn, fadeUp } from '@/lib/animations';

export default function ShopClient({ initialProducts }: { initialProducts: any[] }) {
  const searchParams = useSearchParams();
  const rawCategory = searchParams.get('category');
  const normalizeSlug = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

  const rawType = searchParams.get('type');
  const rawQuery = searchParams.get('q');
  const rawBrand = searchParams.get('brand');
  const rawModel = searchParams.get('model');
  
  const getInitialFilterCategory = (cat: string | null) => {
    if (!cat) return 'All';
    if (['deals', 'new-arrivals', 'best-sellers', 'trending'].includes(cat)) {
      return 'All';
    }
    return cat.replace(/-/g, ' ');
  };

  const getInitialDiscoveryMode = (cat: string | null) => {
    if (cat === 'deals') return 'deals';
    if (cat === 'new-arrivals') return 'just-dropped';
    if (cat === 'best-sellers') return 'best-sellers';
    return 'all'; 
  };

  const getInitialProductType = (typeVal: string | null) => {
    if (!typeVal) return 'Sneakers';
    if (typeVal.toLowerCase().replace(/-/g, ' ') === 'soccer cleats') return 'Soccer Cleats';
    return 'Sneakers';
  };

  const [filterCategory, setFilterCategory] = useState<string>(() => getInitialFilterCategory(rawCategory));
  const [filterProductType, setFilterProductType] = useState<string>(() => getInitialProductType(rawType));
  const [filterPrice, setFilterPrice] = useState<string | null>(null);
  const [filterSize, setFilterSize] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    if (rawQuery) return rawQuery;
    if (rawBrand) return rawBrand.replace(/-/g, ' ');
    if (rawModel) return rawModel.replace(/-/g, ' ');
    return '';
  });
  
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [sortOption, setSortOption] = useState('default');
  const [discoveryMode, setDiscoveryMode] = useState<string>(() => getInitialDiscoveryMode(rawCategory));
  
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [visibleCount, setVisibleCount] = useState(20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // 1. Handle Categories & Types
    if (rawCategory && rawType) {
      setFilterCategory(getInitialFilterCategory(rawCategory));
      setDiscoveryMode(getInitialDiscoveryMode(rawCategory));
      setFilterProductType(getInitialProductType(rawType));
    } else if (rawCategory) {
      setFilterCategory(getInitialFilterCategory(rawCategory));
      setDiscoveryMode(getInitialDiscoveryMode(rawCategory));
      setFilterProductType('Sneakers'); 
    } else if (rawType) {
      setFilterProductType(getInitialProductType(rawType));
      setFilterCategory('All'); 
    }

    // 2. Handle Search, Brands, and Models overriding state via Navigation
    if (rawQuery) {
      setSearchQuery(rawQuery);
      if (!rawCategory && !rawType) {
        setFilterCategory('All');
        setFilterProductType('All');
      }
    } else if (rawBrand) {
      setSearchQuery(rawBrand.replace(/-/g, ' '));
    } else if (rawModel) {
      setSearchQuery(rawModel.replace(/-/g, ' '));
    } else {
      if (rawCategory || rawType) {
        setSearchQuery('');
      }
    }
  }, [rawCategory, rawType, rawQuery, rawBrand, rawModel]);

  useEffect(() => {
    setVisibleCount(20);
  }, [filterCategory, filterProductType, filterPrice, filterSize, searchQuery, sortOption, discoveryMode]);

  useEffect(() => {
    if (isAdvancedFiltersOpen || quickViewProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isAdvancedFiltersOpen, quickViewProduct]);

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 20);
      setIsLoadingMore(false);
    }, 600);
  }, [isLoadingMore]);

  const loadMoreElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        handleLoadMore();
      }
    }, { rootMargin: '200px' });

    if (node) observerRef.current.observe(node);
  }, [isLoadingMore, handleLoadMore]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [filterCategory, filterProductType, filterPrice, filterSize, sortOption, discoveryMode]);

  // 1. Dynamically extract categories based ONLY on the active Product Type
  const dynamicCategories = useMemo(() => {
    const filteredByType = initialProducts.filter(p => {
      const pType = (p.productType || 'Sneakers').toLowerCase();
      return pType === filterProductType.toLowerCase();
    });

    let rawCategories = Array.from(new Set(filteredByType.map(p => p.category))).filter(Boolean) as string[];

    // Exclude the priority categories from the alphabetical sort so they don't duplicate
    if (filterProductType === 'Sneakers') {
      rawCategories = rawCategories.filter(cat =>
        cat.toLowerCase() !== 'official shoes' &&
        cat.toLowerCase() !== 'opens & sandals'
      );
    }

    return rawCategories.sort();
  }, [initialProducts, filterProductType]);

  // 2. Create the final ordered array for the UI
  const displayCategories = useMemo(() => {
    if (filterProductType === 'Sneakers') {
      return ['Official Shoes', 'Opens & Sandals', ...dynamicCategories];
    }
    return dynamicCategories;
  }, [filterProductType, dynamicCategories]);

  // 2. UPDATED: Clean product filtering without the old hardcoded hacks
  const sortedAndFilteredProducts = useMemo(() => {
    let result = [...initialProducts];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query) ||
        (p.productType && p.productType.toLowerCase().includes(query)) 
      );
    }

    // STRICT Product Type Filtering
    if (filterProductType && filterProductType !== 'All') {
      result = result.filter(p => {
        const pType = (p.productType || 'Sneakers').toLowerCase();
        return pType === filterProductType.toLowerCase();
      });
    }

    if (filterCategory && filterCategory.toLowerCase() !== 'all') {
      const targetCategory = normalizeSlug(filterCategory);
      result = result.filter(p => {
        const prodCategory = normalizeSlug(p.category || '');
        const prodType = normalizeSlug(p.productType || ''); 
        
        return prodCategory.includes(targetCategory) || 
               targetCategory.includes(prodCategory) ||
               prodType.includes(targetCategory) || 
               targetCategory.includes(prodType);   
      });
    }

    if (filterPrice) {
      if (filterPrice.includes('Under')) {
        const val = parseInt(filterPrice.replace(/\D/g, ''));
        result = result.filter(p => p.price < val);
      } else if (filterPrice.includes('Over')) {
        const val = parseInt(filterPrice.replace(/\D/g, ''));
        result = result.filter(p => p.price > val);
      } else if (filterPrice.includes('-')) {
        const parts = filterPrice.split('-');
        const min = parseInt(parts[0].replace(/\D/g, ''));
        const max = parseInt(parts[1].replace(/\D/g, ''));
        result = result.filter(p => p.price >= min && p.price <= max);
      }
    }

    if (filterSize) {
      result = result.filter(p => p.sizes && p.sizes.includes(filterSize));
    }

    if (!searchQuery) {
      if (discoveryMode === 'best-sellers') {
        result = result.filter(p => p.isBestSeller);
      } else if (discoveryMode === 'just-dropped') {
        result = result.filter(p => p.isNewArrival);
      } else if (discoveryMode === 'deals') {
        result = result.filter(p => p.isFlashDeal);
      } else if (discoveryMode === 'budget-picks') {
        result = result.filter(p => p.price <= 3500);
      } else if (discoveryMode === 'premium-styles') {
        result = result.filter(p => p.price >= 4500);
      }
    }

    if (sortOption === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'best-selling') {
      result.sort((a, b) => (b.isBestSeller === a.isBestSeller ? 0 : b.isBestSeller ? -1 : 1));
    } else if (sortOption === 'new-arrivals') {
      result.sort((a, b) => (b.isNewArrival === a.isNewArrival ? 0 : b.isNewArrival ? -1 : 1));
    } else if (sortOption === 'trending-now') {
      result.sort((a, b) => ((b.rating || 0) * (b.reviews || 0)) - ((a.rating || 0) * (a.reviews || 0)));
    }

    return result;
  }, [searchQuery, filterCategory, filterProductType, filterPrice, filterSize, discoveryMode, sortOption, initialProducts]);

  const hasActiveFilters = (filterCategory && filterCategory !== 'All') || filterPrice || filterSize || searchQuery || sortOption !== 'default' || discoveryMode !== 'all';

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterCategory('All');
    setFilterPrice(null);
    setFilterSize(null);
    setDiscoveryMode('all');
    setSortOption('default');
  };

  return (
    <div className="bg-brand-dark min-h-screen text-white">
      {/* Page Header */}
      <div className="bg-brand-card pt-4 md:pt-6 pb-4 px-6 relative overflow-hidden">
        {/* Subtle background glow for visual hierarchy */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-full bg-brand-primary/5 blur-3xl rounded-full pointer-events-none"></div>
        
        <motion.div 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center lg:items-start lg:text-left"
        >
          <motion.h1 
            variants={staggerItem}
            className="font-display font-black uppercase tracking-wide text-3xl sm:text-4xl md:text-5xl text-white leading-none"
          >
            {discoveryMode === 'deals' && filterCategory === 'All' ? 'Flash Deals' : 
             discoveryMode === 'just-dropped' && filterCategory === 'All' ? 'New Arrivals' :
             discoveryMode === 'best-sellers' && filterCategory === 'All' ? 'Best Sellers' :
             filterCategory && filterCategory !== 'All' ? filterCategory : 
             filterProductType !== 'All' ? filterProductType :
             'Shop Collection'}
          </motion.h1>
        </motion.div>
      </div>

      {/* Refined Navigation & Controls Bar */}
      <div className="sticky top-0 z-40 bg-brand-dark/95 backdrop-blur-md transition-all py-2">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Row 1: Search, Sort, and Advanced Filters */}
          <div className="flex flex-col lg:flex-row gap-3 justify-between items-start lg:items-center mb-3">
            
            {/* Search Input */}
            <div className="relative w-full lg:max-w-md flex-shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search sneakers, cleats, or brands..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 text-white border border-white/10 rounded-full pl-12 pr-10 py-2 text-sm focus:outline-none focus:border-brand-primary focus:bg-white/10 transition-all shadow-inner placeholder:text-gray-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sort & Filter Controls */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-56">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full appearance-none bg-white/5 border border-white/10 pl-4 pr-8 py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white focus:outline-none focus:border-brand-primary cursor-pointer transition-all hover:bg-white/10"
                >
                  <option className="bg-brand-dark text-white" value="default">Sort: Default</option>
                  <option className="bg-brand-dark text-white" value="trending-now">Sort: Trending Now</option>
                  <option className="bg-brand-dark text-white" value="best-selling">Sort: Best Selling</option>
                  <option className="bg-brand-dark text-white" value="new-arrivals">Sort: New Arrivals</option>
                  <option className="bg-brand-dark text-white" value="price-low">Price: Low to High</option>
                  <option className="bg-brand-dark text-white" value="price-high">Price: High to Low</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-400" />
              </div>
              
              <button 
                onClick={() => setIsAdvancedFiltersOpen(true)}
                className="relative flex items-center justify-center bg-brand-primary text-black w-10 h-10 sm:w-auto sm:h-auto p-0 sm:px-6 sm:py-2 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-hover transition-colors shadow-lg shadow-brand-primary/20 flex-shrink-0"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline sm:ml-2">Filters</span>
                {hasActiveFilters && (
                  <span className="absolute sm:relative top-0 right-0 sm:top-auto sm:right-auto sm:ml-1 h-2.5 w-2.5 sm:h-2 sm:w-2 rounded-full bg-black block border-2 border-brand-primary sm:border-none"></span>
                )}
              </button>
            </div>
          </div>

          {/* Row 2: Scrollable Pill Navigation for Types & Collections */}
          <div className="flex items-center overflow-x-auto hide-scrollbar gap-3 pb-2 -mx-6 px-6 lg:mx-0 lg:px-0">

            <div className="flex items-center gap-2 flex-nowrap pl-1 pr-3">
              {/* 1. Main Product Type Pill (Acts as the "All" reset button) */}
              <button
                onClick={() => {
                  setFilterCategory('All');
                  setDiscoveryMode('all');
                }}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-[11px] sm:text-xs font-bold tracking-widest transition-all ${
                  filterCategory === 'All' && discoveryMode === 'all'
                    ? 'bg-white text-black shadow-md shadow-white/10'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                {filterProductType}
              </button>

              {/* 2. Ordered Categories (Priority first, then alphabetical) */}
              {displayCategories.map((cat) => {
                const isActive = filterCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setFilterCategory(isActive ? 'All' : cat);
                      setDiscoveryMode('all');
                    }}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-[11px] sm:text-xs font-bold tracking-widest transition-all ${
                      isActive
                        ? 'bg-brand-primary text-black shadow-md shadow-brand-primary/20'
                        : 'bg-transparent text-gray-400 hover:bg-white/5 hover:text-white border border-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-2">
        <div className="flex-1 w-full">
          
          {/* Active Discovery State & Filter Summary */}
          <div>
            <motion.div 
              initial="hidden" animate="visible" variants={fadeIn}
              className={`flex items-center gap-3 border-b border-white/5 pb-2 ${hasActiveFilters ? 'justify-between' : 'justify-end'}`}
            >
              
              {/* Left Side: Active Filter Tags (Scrollable on mobile to preserve side-by-side layout) */}
              <div className="flex-1 overflow-x-auto hide-scrollbar">
                <AnimatePresence>
                  {hasActiveFilters && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 w-max"
                    >
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mr-1">Active:</span>
                      
                      {searchQuery && (
                        <div className="flex items-center bg-white/10 border border-white/20 rounded-full pl-3 pr-1 py-1 text-[10px] text-white uppercase tracking-wider whitespace-nowrap">
                          "{searchQuery}"
                          <button onClick={() => setSearchQuery('')} className="ml-2 p-1 bg-black/20 rounded-full text-gray-300 hover:text-white hover:bg-black/40 transition-colors"><X className="h-3 w-3" /></button>
                        </div>
                      )}
                      {filterCategory && filterCategory !== 'All' && (
                        <div className="flex items-center bg-white/10 border border-white/20 rounded-full pl-3 pr-1 py-1 text-[10px] text-white uppercase tracking-wider whitespace-nowrap">
                          {filterCategory}
                          <button onClick={() => setFilterCategory('All')} className="ml-2 p-1 bg-black/20 rounded-full text-gray-300 hover:text-white hover:bg-black/40 transition-colors"><X className="h-3 w-3" /></button>
                        </div>
                      )}
                      {filterPrice && (
                        <div className="flex items-center bg-white/10 border border-white/20 rounded-full pl-3 pr-1 py-1 text-[10px] text-white uppercase tracking-wider whitespace-nowrap">
                          {filterPrice}
                          <button onClick={() => setFilterPrice(null)} className="ml-2 p-1 bg-black/20 rounded-full text-gray-300 hover:text-white hover:bg-black/40 transition-colors"><X className="h-3 w-3" /></button>
                        </div>
                      )}
                      {filterSize && (
                        <div className="flex items-center bg-white/10 border border-white/20 rounded-full pl-3 pr-1 py-1 text-[10px] text-white uppercase tracking-wider whitespace-nowrap">
                          Size: {filterSize}
                          <button onClick={() => setFilterSize(null)} className="ml-2 p-1 bg-black/20 rounded-full text-gray-300 hover:text-white hover:bg-black/40 transition-colors"><X className="h-3 w-3" /></button>
                        </div>
                      )}
                      
                      <button 
                        onClick={clearAllFilters}
                        className="text-[10px] text-gray-400 hover:text-brand-primary transition-colors uppercase tracking-widest font-bold ml-2 underline underline-offset-4 whitespace-nowrap"
                      >
                        Clear All
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Side: Product Count (Pinned, never shrinks) */}
              <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-white/5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full inline-flex items-center border border-white/5 flex-shrink-0 whitespace-nowrap">
                 {sortedAndFilteredProducts.length} {sortedAndFilteredProducts.length === 1 ? 'Product' : 'Products'} Found
              </div>
            </motion.div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:gap-x-6 md:gap-y-12 border-t border-white/10 pt-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-brand-card w-full mb-4 border border-white/5 rounded-md"></div>
                  <div className="h-4 bg-brand-card w-3/4 mx-auto mb-2 rounded-md"></div>
                  <div className="h-4 bg-brand-card w-1/2 mx-auto rounded-md"></div>
                </div>
              ))}
            </div>
          ) : sortedAndFilteredProducts.length === 0 ? (
            <motion.div 
              initial="hidden" animate="visible" variants={staggerContainer}
              className="py-20 md:py-32 flex flex-col items-center text-center border-t border-white/10"
            >
              <motion.div variants={staggerItem} className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <SearchX className="h-8 w-8 text-gray-400" />
              </motion.div>
              <motion.h3 variants={staggerItem} className="font-display text-2xl md:text-3xl text-white uppercase tracking-wide mb-3">We Couldn&apos;t Find A Match</motion.h3>
              <motion.p variants={staggerItem} className="text-gray-400 max-w-md mx-auto mb-10 text-sm md:text-base">Try adjusting your filters or explore our most popular styles. We receive new arrivals weekly.</motion.p>
              
              <motion.div variants={staggerItem} className="flex flex-wrap justify-center gap-3 mb-12">
                <button 
                  onClick={() => { clearAllFilters(); setDiscoveryMode('all'); setSortOption('default'); }}
                  className="h-12 px-6 bg-brand-primary text-black rounded-md text-xs font-bold uppercase tracking-widest hover:bg-brand-hover transition-colors"
                >
                  Clear Filters
                </button>
                <button 
                  onClick={() => { clearAllFilters(); setDiscoveryMode('best-sellers'); setSortOption('best-selling'); }}
                  className="h-12 px-6 bg-brand-card text-white rounded-md border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                >
                  View Best Sellers
                </button>
              </motion.div>

              {/* WhatsApp Recovery */}
              <motion.div variants={staggerItem} className="p-6 md:p-8 bg-brand-card border border-white/10 rounded-md max-w-xl w-full text-center">
                <h4 className="font-bold text-white uppercase tracking-widest text-sm mb-2">Can&apos;t find what you&apos;re looking for?</h4>
                <p className="text-gray-400 text-sm mb-6">Chat with our stylists and we&apos;ll help you personally.</p>
                <a 
                  href={`https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent("Hello, I'm looking for a specific item but couldn't find it.")}`}
                  target="_blank" rel="noreferrer"
                  className="w-full sm:w-auto inline-flex h-14 px-8 bg-brand-primary text-black rounded-md items-center justify-center font-bold uppercase tracking-widest hover:bg-brand-hover transition-colors text-sm"
                >
                  <MessageCircle className="h-5 w-5 mr-3" /> Ask On WhatsApp
                </a>
              </motion.div>

              <motion.div variants={staggerItem} className="mt-16 w-full max-w-2xl">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Search Suggestions</h4>
                <div className="flex flex-wrap justify-center gap-2">
                  {searchSuggestions.map(chip => (
                    <button 
                      key={chip}
                      onClick={() => { setSearchQuery(chip); setFilterCategory('All'); }}
                      className="px-4 py-2 bg-white/5 rounded-md border border-white/10 text-gray-300 hover:text-black hover:bg-brand-primary text-xs font-bold transition-colors uppercase tracking-widest"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <>
              <div 
                key={`${filterCategory}-${sortOption}-${searchQuery}-${discoveryMode}`}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:gap-x-6 md:gap-y-12 border-t border-white/10 pt-8"
              >
                {sortedAndFilteredProducts.slice(0, visibleCount).map((product) => (
                  <motion.div 
                    key={product.id}
                    initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} 
                    className="group flex flex-col hover:-translate-y-1 transition-transform duration-300"
                  >
                        <div className="relative aspect-[3/4] w-full bg-brand-card overflow-hidden mb-4 group-hover:shadow-lg group-hover:shadow-brand-primary/20 transition-shadow duration-300 border border-transparent rounded-md group-hover:border-white/10">
                          <Link href={`/product/${product.id}`} className="absolute inset-0 z-10" aria-label={`View ${product.name}`}></Link>
                          
                          {/* Badge */}
                          <div className="absolute top-3 left-3 z-20 shadow-xl">
                            {product.isFlashDeal ? (
                              <span className="bg-brand-accent text-white rounded-md text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest leading-none block">Sale</span>
                            ) : product.isNewArrival ? (
                              <span className="bg-white text-black rounded-md text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest leading-none block">New</span>
                            ) : product.isBestSeller ? (
                              <span className="bg-brand-primary text-black rounded-md text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest leading-none block">Best Seller</span>
                            ) : null}
                          </div>
                          
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            referrerPolicy="no-referrer"
                            className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                          />
                        </div>
                        
                        <div className="w-full text-left flex flex-col flex-1 px-1">
                          <Link href={`/product/${product.id}`} className="w-full block">
                            <h3 className="font-sans font-medium text-white line-clamp-2 mb-1 group-hover:text-brand-primary transition-colors text-xs sm:text-sm md:text-base leading-tight">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="font-sans font-medium text-brand-primary text-xs sm:text-sm md:text-base">{formatPrice(product.price)}</span>
                              {product.originalPrice && (
                                <span className="text-[10px] sm:text-xs text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                              )}
                            </div>
                            <div className="flex items-center text-[10px] sm:text-xs text-gray-400 mb-4 h-4">
                              {product.rating ? (
                                <span className="flex items-center text-gray-400">
                                  <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-brand-primary text-brand-primary mr-1" /> {product.rating} Rating
                                </span>
                              ) : product.reviews ? (
                                <span>{product.reviews}+ Reviews</span>
                              ) : null}
                            </div>
                          </Link>

                          {/* CTAs */}
                          <div className="mt-auto pt-2 w-full">
                             <Link 
                              href={`/product/${product.id}`}
                              className="w-full bg-brand-primary border border-white/10 text-black font-bold h-10 rounded-md group-hover:bg-white group-hover:text-black group-hover:border-brand-primary transition-all flex justify-center items-center uppercase tracking-widest text-[10px] sm:text-xs z-20 relative"
                             >
                               View Details
                             </Link>
                          </div>
                        </div>
                      </motion.div>
                  )
                )}
              </div>

              {/* Load More System */}
              {visibleCount < sortedAndFilteredProducts.length ? (
                <motion.div 
                  ref={loadMoreElementRef}
                  initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={fadeUp}
                  className="mt-16 sm:mt-24 flex flex-col items-center min-h-[60px]"
                >
                  {isLoadingMore && (
                    <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-brand-primary animate-spin" />
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={fadeUp}
                  className="mt-16 sm:mt-24 border-t border-white/10 pt-16 flex flex-col items-center text-center"
                >
                  <h4 className="font-display text-2xl text-white uppercase tracking-wide mb-3">You&apos;ve Reached The End</h4>
                  <p className="text-gray-400 mb-8 max-w-sm">Still looking for something specific? Let our team help you find the perfect style.</p>
                  <a 
                    href={`https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent("Hello, I'm looking for some help finding a specific style.")}`}
                    target="_blank" rel="noreferrer"
                    className="h-14 px-8 bg-brand-primary text-black rounded-md font-bold uppercase tracking-widest hover:bg-brand-hover transition-colors inline-flex items-center text-sm"
                  >
                    <MessageCircle className="h-5 w-5 mr-3" /> Chat on WhatsApp
                  </a>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Advanced Filter Drawer */}
      <AnimatePresence>
        {isAdvancedFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdvancedFiltersOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-[100dvh] w-full sm:w-[400px] bg-brand-card border-l border-white/10 shadow-2xl z-[100] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="font-display uppercase tracking-widest text-xl flex items-center text-white">
                  <SlidersHorizontal className="h-4 w-4 mr-3 text-brand-primary" /> Advanced Filters
                </h2>
                <button
                  onClick={() => setIsAdvancedFiltersOpen(false)}
                  className="p-2 -mr-2 bg-white/5 hover:bg-white/10 rounded-md text-gray-400 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold uppercase tracking-widest text-xs text-gray-400">Categories</h3>
                    {(filterCategory && filterCategory !== 'All') && (
                       <button onClick={() => setFilterCategory('All')} className="text-xs text-brand-primary hover:text-white transition-colors">Clear</button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {displayCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`px-4 py-2 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors border ${
                          (filterCategory || 'All').toLowerCase() === cat.toLowerCase()
                            ? 'bg-brand-primary text-black border-brand-primary'
                            : 'bg-brand-dark text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                   <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold uppercase tracking-widest text-xs text-gray-400">Price Range</h3>
                    {filterPrice && (
                       <button onClick={() => setFilterPrice(null)} className="text-xs text-brand-primary hover:text-white transition-colors">Clear</button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {priceRanges.map((price) => (
                      <button
                        key={price}
                        onClick={() => setFilterPrice(price)}
                         className={`px-4 py-2 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors border ${
                          filterPrice === price
                            ? 'bg-brand-primary text-black border-brand-primary'
                            : 'bg-brand-dark text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                         }`}
                      >
                        {price}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold uppercase tracking-widest text-xs text-gray-400">Size / Option</h3>
                    {filterSize && (
                       <button onClick={() => setFilterSize(null)} className="text-xs text-brand-primary hover:text-white transition-colors">Clear</button>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {filterSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setFilterSize(size)}
                         className={`py-2.5 rounded-md text-[10px] sm:text-xs font-bold transition-colors border ${
                          filterSize === size
                            ? 'bg-brand-primary text-black border-brand-primary'
                            : 'bg-brand-dark text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                         }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] border-t border-white/5 bg-brand-card flex gap-4">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 py-3.5 bg-transparent border rounded-md border-white/20 text-white hover:bg-white/5 font-bold uppercase tracking-widest text-xs transition-colors"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setIsAdvancedFiltersOpen(false)}
                  className="flex-1 py-3.5 bg-brand-primary rounded-md hover:bg-white text-black font-bold uppercase tracking-widest text-xs transition-colors"
                >
                  Show ({sortedAndFilteredProducts.length})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}