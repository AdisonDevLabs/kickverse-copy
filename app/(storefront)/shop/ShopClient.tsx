// app/shop/ShopClient.tsx

'use client';

import React, { useState, useEffect, Suspense, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Filter, ChevronDown, Check, X, SlidersHorizontal, MessageCircle, Search, Heart, Eye, Star, SearchX } from 'lucide-react';
import { formatPrice } from '@/lib/data';
// Removed the static 'products' import, keeping static constants
import { brand } from '@/lib/data/brand';
import { discoveryChips, filterCategories, searchSuggestions, priceRanges, filterSizes } from '@/lib/data/categories';
import { motion, AnimatePresence } from 'motion/react';
import { staggerContainer, staggerItem, fadeIn, fadeUp } from '@/lib/animations';

function ShopContent({ initialProducts }: { initialProducts: any[] }) {
  const searchParams = useSearchParams();
  const rawCategory = searchParams.get('category');
  
  const getInitialFilterCategory = (cat: string | null) => {
    if (!cat) return 'All';
    if (cat === 'sneakers') return 'Sneakers';
    if (cat === 'kids') return 'Kids';
    if (cat === 'ladies-shoes') return 'Ladies Shoes';
    if (cat === 'school-shoes') return 'School Shoes';
    return 'All';
  };

  const getInitialDiscoveryMode = (cat: string | null) => {
    if (cat === 'deals') return 'deals';
    if (cat === 'new-arrivals') return 'just-dropped';
    if (cat === 'best-sellers') return 'best-sellers';
    return 'all'; 
  };

  const [filterCategory, setFilterCategory] = useState<string>(() => getInitialFilterCategory(rawCategory));
  const [filterPrice, setFilterPrice] = useState<string | null>(null);
  const [filterSize, setFilterSize] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [sortOption, setSortOption] = useState('default');
  const [discoveryMode, setDiscoveryMode] = useState<string>(() => getInitialDiscoveryMode(rawCategory));
  
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [visibleCount, setVisibleCount] = useState(8);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (rawCategory) {
      setFilterCategory(getInitialFilterCategory(rawCategory));
      setDiscoveryMode(getInitialDiscoveryMode(rawCategory));
    }
  }, [rawCategory]);

  useEffect(() => {
    setVisibleCount(8);
  }, [filterCategory, filterPrice, filterSize, searchQuery, sortOption, discoveryMode]);

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
      setVisibleCount(prev => prev + 8);
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
  }, [filterCategory, filterPrice, filterSize, sortOption, discoveryMode]);

  const sortedAndFilteredProducts = useMemo(() => {
    // USING THE DATABASE PRODUCTS PASSED FROM THE SERVER
    let result = [...initialProducts];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query)
      );
    }

    if (filterCategory && filterCategory !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === filterCategory.toLowerCase());
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
  }, [searchQuery, filterCategory, filterPrice, filterSize, discoveryMode, sortOption, initialProducts]);

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
      <div className="bg-brand-card pt-8 md:pt-12 pb-8 px-6 border-b border-white/5 relative">
        <motion.div 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center lg:items-start lg:text-left"
        >
          
          <motion.nav 
            variants={staggerItem}
            className="flex items-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500 mb-6"
          >
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2 text-white/20">/</span>
            <span className="text-white">Shop</span>
          </motion.nav>

          <motion.div 
            variants={staggerItem}
            className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary mb-3"
          >
            Discover Our Collection
          </motion.div>

          <motion.h1 
            variants={staggerItem}
            className="font-display font-black uppercase tracking-wide text-4xl sm:text-5xl md:text-6xl text-white mb-4 leading-none"
          >
            {discoveryMode === 'deals' && filterCategory === 'All' ? 'Flash Deals' : 
             discoveryMode === 'just-dropped' && filterCategory === 'All' ? 'New Arrivals' :
             discoveryMode === 'best-sellers' && filterCategory === 'All' ? 'Best Sellers' :
             filterCategory && filterCategory !== 'All' ? filterCategory : 'Shop Collection'}
          </motion.h1>
          
          <motion.p 
            variants={staggerItem}
            className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-lg mx-auto lg:mx-0"
          >
            {brand.description}
          </motion.p>

          <motion.div 
            variants={staggerItem}
            className="mt-8 pt-6 border-t border-white/5 w-full flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6"
          >
             <span className="flex items-center text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400"><Check className="w-3 h-3 mr-1.5 text-brand-primary" /> {brand.trustStatements[0] || "Fast Delivery"}</span>
             <span className="flex items-center text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400"><Check className="w-3 h-3 mr-1.5 text-brand-primary" /> {brand.trustStatements[2] || "WhatsApp Ordering"}</span>
             <span className="flex items-center text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400"><Check className="w-3 h-3 mr-1.5 text-brand-primary" /> {brand.trustStatements[1] || "Quality Checked"}</span>
             <span className="flex items-center text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400"><Check className="w-3 h-3 mr-1.5 text-brand-primary" /> {brand.trustStatements[3] || "Secure Ordering"}</span>
          </motion.div>
          
        </motion.div>
      </div>

      {/* Search & Quick Filter Bar */}
      <div className="sticky top-0 z-40 bg-brand-card/95 backdrop-blur-md border-b border-white/5 py-3 md:py-4 transition-all">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            
            {/* Search Input */}
            <div className="relative w-full md:w-64 lg:w-72 flex-shrink-0">
              <input 
                type="text" 
                placeholder="Search styles..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-dark text-white border border-white/10 rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-primary transition-colors"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            
            {/* Discovery Chips */}
            <div className="flex-1 w-full overflow-x-auto hide-scrollbar flex gap-2 pb-1 md:pb-0 items-center">
              {discoveryChips.map((chip) => {
                const isCategoryChip = ['sneakers', 'kids', 'ladies-shoes', 'school-shoes'].includes(chip.id);
                const mappedCategory = isCategoryChip ? 
                  (chip.id === 'sneakers' ? 'Sneakers' : 
                   chip.id === 'kids' ? 'Kids' : 
                   chip.id === 'ladies-shoes' ? 'Ladies Shoes' : 'School Shoes') : null;

                const isActive = !searchQuery && (
                  isCategoryChip ? filterCategory === mappedCategory : discoveryMode === chip.id && filterCategory === 'All'
                );

                return (
                  <button
                    key={chip.id}
                    onClick={() => { 
                      clearAllFilters(); 
                      if (isCategoryChip && mappedCategory) {
                        setFilterCategory(mappedCategory);
                      } else {
                        setDiscoveryMode(chip.id);
                      }
                    }}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-md text-[10px] sm:text-xs font-bold tracking-widest transition-colors ${
                      isActive
                        ? 'bg-white text-black shadow-lg shadow-white/20'
                        : 'bg-brand-dark text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="appearance-none bg-brand-dark border border-white/10 px-4 py-2 pr-8 rounded-md text-[10px] uppercase font-bold tracking-widest text-white focus:outline-none focus:border-white/50 cursor-pointer"
                >
                  <option className="bg-brand-dark text-white" value="default">Default</option>
                  <option className="bg-brand-dark text-white" value="trending-now">Trending Now</option>
                  <option className="bg-brand-dark text-white" value="best-selling">Best Selling</option>
                  <option className="bg-brand-dark text-white" value="new-arrivals">New Arrivals</option>
                  <option className="bg-brand-dark text-white" value="price-low">Price: Low to High</option>
                  <option className="bg-brand-dark text-white" value="price-high">Price: High to Low</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-500" />
              </div>
              <button 
                onClick={() => setIsAdvancedFiltersOpen(true)}
                className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-widest bg-brand-dark hover:bg-white/10 border border-white/10 px-4 py-2 rounded-md transition-colors"
              >
                <Filter className="h-3 w-3" />
                <span>Filters</span>
              </button>
            </div>
          </div>
          
          {/* Mobile Actions */}
          <div className="md:hidden flex items-center justify-between mt-2 pt-2 border-t border-white/5">
              <div className="relative flex-1 mr-2">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full appearance-none bg-transparent border-none py-1 pr-8 text-xs font-bold uppercase tracking-widest text-white focus:outline-none"
                >
                  <option className="bg-brand-dark text-white" value="default">Default</option>
                  <option className="bg-brand-dark text-white" value="trending-now">Trending Now</option>
                  <option className="bg-brand-dark text-white" value="best-selling">Best Selling</option>
                  <option className="bg-brand-dark text-white" value="new-arrivals">New Arrivals</option>
                  <option className="bg-brand-dark text-white" value="price-low">Price: Low to High</option>
                  <option className="bg-brand-dark text-white" value="price-high">Price: High to Low</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-500" />
              </div>
              <button 
                onClick={() => setIsAdvancedFiltersOpen(true)}
                className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-widest py-1 pl-4 border-l border-white/10"
              >
                <Filter className="h-3 w-3" />
                <span>Filters</span>
              </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex-1 w-full">
          {/* Active Discovery State */}
          <motion.div 
            initial="hidden" animate="visible" variants={fadeIn}
            className="flex flex-wrap items-center justify-between mb-4"
          >
             <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="text-sm font-medium text-white flex items-center">
                  <span className="text-gray-500 mr-2">Showing:</span> 
                  {searchQuery ? `Search Results for "${searchQuery}"` : 
                   filterCategory !== 'All' ? filterCategory :
                   discoveryMode === 'deals' ? 'Flash Deals' :
                   discoveryMode === 'all' ? 'All Styles' :
                   discoveryChips.find(c => c.id === discoveryMode)?.context || 'All Styles'}
                </div>
                <div className="hidden sm:block w-1 h-1 rounded-full bg-white/20"></div>
                <div className="text-sm font-medium text-white flex items-center">
                  <span className="text-gray-500 mr-2">Sorted by:</span>
                  {sortOption === 'default' ? 'Default' :
                   sortOption === 'trending-now' ? 'Trending Now' :
                   sortOption === 'best-selling' ? 'Best Selling' :
                   sortOption === 'new-arrivals' ? 'New Arrivals' :
                   sortOption === 'price-low' ? 'Price: Low to High' : 'Price: High to Low'}
                </div>
             </div>
             
             <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-2 sm:mt-0">
               {sortedAndFilteredProducts.length} {sortedAndFilteredProducts.length === 1 ? 'Product' : 'Products'}
             </div>
          </motion.div>

          {/* Active Filter Summary */}
          {hasActiveFilters && (
            <motion.div 
              initial="hidden" animate="visible" variants={staggerContainer}
              className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-white/5"
            >
              <motion.span variants={staggerItem} className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mr-2">Filters:</motion.span>
              {searchQuery && (
                <motion.div variants={staggerItem} className="flex items-center bg-white/5 border border-white/10 rounded-md px-3 py-1 text-[10px] text-white uppercase tracking-wider">
                  &quot;{searchQuery}&quot;
                  <button onClick={() => setSearchQuery('')} className="ml-2 text-gray-400 hover:text-white"><X className="h-3 w-3" /></button>
                </motion.div>
              )}
              {filterCategory && filterCategory !== 'All' && (
                <motion.div variants={staggerItem} className="flex items-center bg-white/5 border border-white/10 rounded-md px-3 py-1 text-[10px] text-white uppercase tracking-wider">
                  {filterCategory}
                  <button onClick={() => setFilterCategory('All')} className="ml-2 text-gray-400 hover:text-white"><X className="h-3 w-3" /></button>
                </motion.div>
              )}
              {filterPrice && (
                <motion.div variants={staggerItem} className="flex items-center bg-white/5 border border-white/10 rounded-md px-3 py-1 text-[10px] text-white uppercase tracking-wider">
                  {filterPrice}
                  <button onClick={() => setFilterPrice(null)} className="ml-2 text-gray-400 hover:text-white"><X className="h-3 w-3" /></button>
                </motion.div>
              )}
              {filterSize && (
                <motion.div variants={staggerItem} className="flex items-center bg-white/5 border border-white/10 rounded-md px-3 py-1 text-[10px] text-white uppercase tracking-wider">
                  Size: {filterSize}
                  <button onClick={() => setFilterSize(null)} className="ml-2 text-gray-400 hover:text-white"><X className="h-3 w-3" /></button>
                </motion.div>
              )}
              <motion.button 
                variants={staggerItem}
                onClick={clearAllFilters}
                className="text-[10px] text-white hover:text-brand-primary transition-colors uppercase tracking-widest font-bold ml-2 underline underline-offset-4"
              >
                Clear All
              </motion.button>
            </motion.div>
          )}

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12 border-t border-white/10 pt-4">
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
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12 border-t border-white/10 pt-8"
              >
                {sortedAndFilteredProducts.slice(0, visibleCount).map((product, index) => {
                  const isSeparator = index > 0 && index % 12 === 0;
                  const separatorText = index === 12 ? 'Trending Right Now' : (index === 24 ? 'Customer Favorites' : 'Recently Added');
                  
                  return (
                    <React.Fragment key={product.id}>
                      {isSeparator && (
                        <motion.div 
                          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} 
                          className="col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5 py-12 md:py-16 flex items-center justify-center border-y border-white/5 my-4"
                        >
                          <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-brand-primary">{separatorText}</span>
                        </motion.div>
                      )}
                      <motion.div 
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

                          {/* Quick Actions - Always visible on touch devices via responsive classes */}
                          <div className="absolute top-3 right-3 z-30 flex flex-col gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button className="h-8 w-8 bg-white text-black rounded-md flex items-center justify-center hover:bg-brand-primary transition-colors shadow-lg" aria-label="Save">
                              <Heart className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={(e) => { e.preventDefault(); setQuickViewProduct(product); }}
                              className="h-8 w-8 bg-white text-black rounded-md flex items-center justify-center hover:bg-brand-primary transition-colors shadow-lg" aria-label="Quick View">
                              <Eye className="h-4 w-4" />
                            </button>
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
                            <h3 className="font-sans font-medium text-white line-clamp-2 mb-1 group-hover:text-brand-primary transition-colors text-sm sm:text-base leading-tight">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="font-sans font-medium text-brand-primary text-sm">{formatPrice(product.price)}</span>
                              {product.originalPrice && (
                                <span className="text-xs text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                              )}
                            </div>
                            <div className="flex items-center text-xs text-gray-400 mb-4 h-4">
                              {product.rating ? (
                                <span className="flex items-center text-gray-400">
                                  <Star className="w-3 h-3 fill-brand-primary text-brand-primary mr-1" /> {product.rating} Rating
                                </span>
                              ) : product.reviews ? (
                                <span>{product.reviews}+ Reviews</span>
                              ) : null}
                            </div>
                          </Link>

                          {/* CTAs */}
                          <div className="mt-auto pt-2 w-full">
                             <a 
                              href={`https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(
                                `👋 Hello ${brand.name},\n\nI was browsing your store and I'm interested in ordering this item:\n\n🛍️ *Item:* ${product.name}\n💰 *Price:* Ksh ${product.price}\n\n${brand.url}/product/${product.id}`
                              )}`}
                              target="_blank" rel="noreferrer"
                              className="w-full bg-brand-primary text-black font-bold h-10 rounded-md hover:bg-brand-hover transition-colors flex justify-center items-center uppercase tracking-widest text-[10px] sm:text-xs z-20 relative"
                             >
                               <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" /> WhatsApp
                             </a>
                          </div>
                        </div>
                      </motion.div>
                    </React.Fragment>
                  );
                })}
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

      {/* Persistent WhatsApp Floating CTA */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        <a 
          href={`https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(`Hello ${brand.name}, I'm interested in ordering from your website. Could you assist me with availability, options, and delivery? Thank you.`)}`}
          target="_blank" rel="noreferrer"
          className="relative flex items-center justify-center p-4 bg-brand-primary text-black rounded-full hover:bg-brand-hover transition-colors shadow-2xl shadow-brand-primary/30 group overflow-hidden"
        >
          <MessageCircle className="h-6 w-6 relative z-10 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:block max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[150px] group-hover:ml-3 transition-all duration-300 font-bold uppercase tracking-widest text-sm relative z-10">
            Need Help?
          </span>
          <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:animate-[ping_1.5s_ease-out_infinite] pointer-events-none"></div>
        </a>
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
                    {filterCategories.map((cat) => (
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
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickViewProduct(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl rounded-md max-h-[90vh] bg-brand-card border border-white/10 shadow-2xl overflow-y-auto hide-scrollbar flex flex-col md:flex-row z-10"
            >
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black rounded-md text-white transition-colors border border-white/10"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Image Sec */}
              <div className="w-full md:w-1/2 relative bg-brand-dark aspect-square md:aspect-auto md:min-h-[500px]">
                 <Image
                    src={quickViewProduct.image}
                    alt={quickViewProduct.name}
                    fill
                    referrerPolicy="no-referrer"
                    className="object-cover rounded-t-md md:rounded-l-md md:rounded-tr-none"
                  />
              </div>

              {/* Content Sec */}
              <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
                <div className="mb-2 uppercase tracking-widest text-[10px] text-brand-primary font-bold">
                  {quickViewProduct.category}
                </div>
                <h2 className="font-display uppercase tracking-wide text-2xl sm:text-3xl lg:text-4xl text-white leading-tight mb-2">
                  {quickViewProduct.name}
                </h2>
                
                <div className="flex items-end gap-3 mb-6">
                  <span className="font-sans font-medium text-brand-primary text-xl">{formatPrice(quickViewProduct.price)}</span>
                  {quickViewProduct.originalPrice && (
                    <span className="text-sm text-gray-500 line-through mb-0.5">{formatPrice(quickViewProduct.originalPrice)}</span>
                  )}
                </div>

                <p className="text-gray-400 text-sm leading-relaxed mb-8">
                  {quickViewProduct.description}
                </p>

                {quickViewProduct.sizes && quickViewProduct.sizes.length > 0 && (
                  <div className="mb-8">
                    <span className="font-bold text-white uppercase tracking-widest text-xs block mb-3">Available Sizes / Options</span>
                    <div className="flex flex-wrap gap-2">
                      {quickViewProduct.sizes.map((size: string) => (
                        <div
                          key={size}
                          className="h-10 px-4 rounded-md border border-white/20 text-white flex items-center justify-center font-bold text-sm bg-white/5"
                        >
                          {size}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-6 border-t border-white/10">
                   <a 
                    href={`https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(`I'm interested in: ${quickViewProduct.name}`)}`}
                    target="_blank" rel="noreferrer"
                    className="w-full h-14 bg-brand-primary text-black font-bold hover:bg-brand-hover transition-colors flex justify-center items-center uppercase tracking-widest text-sm mb-3 rounded-md"
                   >
                     <MessageCircle className="h-5 w-5 mr-3" /> Order on WhatsApp
                   </a>
                   <Link
                     href={`/product/${quickViewProduct.id}`}
                     className="w-full h-12 border border-white/20 text-white font-bold rounded-md hover:bg-white hover:text-black transition-colors flex justify-center items-center uppercase tracking-widest text-xs"
                   >
                     View Full Details
                   </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function ShopClient({ initialProducts }: { initialProducts: any[] }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-white/20 border-t-brand-primary animate-spin" /></div>}>
      <ShopContent initialProducts={initialProducts} />
    </Suspense>
  );
}