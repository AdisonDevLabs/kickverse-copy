'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Search, ShoppingBag, X, Home, Grid, Tag, MessageCircle } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { brand } from '@/lib/data/brand';
import { navSearchSuggestions } from '@/lib/data/categories';
import { AnnouncementBar } from './AnnouncementBar';

// Apply the same luxury curve used in animations.ts
const premiumEasing: [number, number, number, number] = [0.16, 1, 0.3, 1];

const SneakerIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M4 6h5.426a1 1 0 0 1 .863 .496l1.064 1.823a3 3 0 0 0 1.896 1.407l4.677 1.114a4 4 0 0 1 3.074 3.89v2.27a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10a1 1 0 0 1 1 -1z" />
    <path d="M14 13l1 -2" />
  </svg>
);

const CleatIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {/* Base shoe shape */}
    <path d="M4 6h5.426a1 1 0 0 1 .863 .496l1.064 1.823a3 3 0 0 0 1.896 1.407l4.677 1.114a4 4 0 0 1 3.074 3.89v2.27a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10a1 1 0 0 1 1 -1z" />
    {/* Swoosh/Detail line */}
    <path d="M14 13l1 -2" />
    {/* Cleat studs on the bottom */}
    <path d="M6 20v2 M10 20v2 M14 20v2 M18 20v2" />
  </svg>
);

export function NavBar() {
  const { cartCount, setIsCartOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false); // Mobile
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false); // Desktop
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart Pulse State
  const [cartPulse, setCartPulse] = useState(false);
  const [prevCartCount, setPrevCartCount] = useState(cartCount);

  // Desktop Mega Menu Hover State
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Active route tracking
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const isTabActive = (path: string, queryType?: string) => {
    if (!pathname) return false;
    if (queryType) {
      return pathname === path && (searchParams?.get('type') === queryType || searchParams?.get('category') === queryType);
    }
    return pathname === path && !searchParams?.get('type') && !searchParams?.get('category');
  };

  const handleSearchSubmit = (query: string) => {
    if (!query.trim()) return;
    setIsSearchOpen(false);
    setIsDesktopSearchOpen(false);
    setSearchQuery('');
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  useEffect(() => {
    if (cartCount > prevCartCount) {
      setCartPulse(true);
      const timer = setTimeout(() => setCartPulse(false), 300);
      return () => clearTimeout(timer);
    }
    setPrevCartCount(cartCount);
  }, [cartCount, prevCartCount]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <AnnouncementBar />
      {/* Header Container */}
      <header className={`fixed top-8 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-brand-dark/95 backdrop-blur-md shadow-2xl py-1 border-b border-white/5' : 'bg-transparent py-1 border-b border-white/10'}`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12 md:h-[55px] w-full">
            
            {/* Left: Logo */}
            <div className="flex-shrink-0 flex items-center z-20">
              <Link href="/" className="z-10 focus:outline-none">
                <Image 
                  src={brand.logo} 
                  alt={`${brand.name} Logo`} 
                  width={44} 
                  height={44} 
                  // Added bg-white, object-contain, and padding so transparent logos are fully visible and readable
                  className="bg-white rounded-full object-contain p-0.5 border border-white/20 w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 shadow-sm"
                />
              </Link>
            </div>

            {/* Center: Brand Name (Mobile & Tablet Only - Flex-1 prevents overlap) */}
            <div className="flex-1 flex lg:hidden items-center justify-center min-w-0 z-10 px-2">
              <Link href="/" className="font-display tracking-[0.05em] sm:tracking-[0.15em] text-white flex flex-col items-center rounded-md focus:outline-none min-w-0 max-w-full">
                <span className="text-[17px] sm:text-xl font-black uppercase leading-none truncate w-full text-center">
                  {brand.name.split(' ')[0]}
                  <span className="text-brand-primary">
                    {brand.name.split(' ').length > 1 ? ' ' + brand.name.split(' ')[1] : ''}
                  </span>
                </span>
                {brand.name.split(' ').length > 2 && (
                  <span className="hidden sm:block text-[8px] tracking-[0.3em] uppercase text-gray-400 mt-1 font-sans truncate text-center w-full">
                    {brand.name.split(' ').slice(2).join(' ')}
                  </span>
                )}
              </Link>
            </div>

            {/* Desktop Navigation (Visible strictly on lg & up) */}
            <nav className="hidden lg:flex flex-1 justify-center items-center space-x-6 xl:space-x-8 z-20">
              {/* Home */}
              <Link href="/" className={`text-xs uppercase tracking-widest font-bold transition-colors relative group py-2 ${isTabActive('/') ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                Home
                <span className={`absolute -bottom-1 left-0 w-full h-[2px] rounded-full transition-transform duration-300 origin-left ${isTabActive('/') ? 'bg-brand-primary scale-x-100' : 'bg-brand-primary scale-x-0 group-hover:scale-x-100'}`}></span>
              </Link>

              {/* Sneakers Mega Menu */}
              <div 
                className="relative group py-4"
                onMouseEnter={() => setActiveDropdown('sneakers')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link href="/shop?type=sneakers" className={`text-xs uppercase tracking-widest font-bold transition-colors relative flex items-center ${isTabActive('/shop', 'sneakers') ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                  Sneakers <span className="ml-1.5 text-[8px] opacity-70 transition-transform group-hover:rotate-180">▼</span>
                  <span className={`absolute -bottom-3 left-0 w-full h-[2px] rounded-full transition-transform duration-300 origin-left ${isTabActive('/shop', 'sneakers') ? 'bg-brand-primary scale-x-100' : 'bg-brand-primary scale-x-0 group-hover:scale-x-100'}`}></span>
                </Link>
                <AnimatePresence>
                  {activeDropdown === 'sneakers' && (
                    <div className="absolute top-[calc(100%-8px)] left-0 pt-2 z-50">
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: premiumEasing }}
                        className="w-56 bg-brand-card/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-4 overflow-hidden"
                      >
                        <div className="px-5 pb-3 border-b border-white/5 mb-2">
                          <p className="text-[10px] font-bold text-white uppercase tracking-widest">Sneakers</p>
                          <div className="w-6 h-0.5 bg-brand-primary mt-2 rounded-full"></div>
                        </div>
                        <div className="flex flex-col">
                          {['Jordan', 'Air Force', 'Air Max', 'SB Dunk', 'New Balance', 'Adidas', 'Doc Martens'].map(brandItem => (
                              <Link key={brandItem} href={`/shop?type=sneakers&brand=${brandItem.toLowerCase().replace(' ', '-')}`} className="px-5 py-2 text-xs text-gray-300 hover:text-brand-primary hover:bg-white/5 transition-colors group/item flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-transparent group-hover/item:bg-brand-primary transition-colors mr-2"></span>
                                {brandItem}
                              </Link>
                          ))}
                        </div>
                        <div className="px-5 pt-3 mt-1 border-t border-white/5">
                          <Link href="/shop?type=sneakers" className="text-xs text-brand-primary font-bold hover:text-white transition-colors flex items-center group/btn">
                              View All <span className="ml-1 transition-transform group-hover/btn:translate-x-1">→</span>
                          </Link>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Soccer Cleats Mega Menu */}
              <div 
                className="relative group py-4"
                onMouseEnter={() => setActiveDropdown('cleats')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link href="/shop?type=soccer-cleats" className={`text-xs uppercase tracking-widest font-bold transition-colors relative flex items-center ${isTabActive('/shop', 'soccer-cleats') ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                  Soccer Cleats <span className="ml-1.5 text-[8px] opacity-70 transition-transform group-hover:rotate-180">▼</span>
                  <span className={`absolute -bottom-3 left-0 w-full h-[2px] rounded-full transition-transform duration-300 origin-left ${isTabActive('/shop', 'soccer-cleats') ? 'bg-brand-primary scale-x-100' : 'bg-brand-primary scale-x-0 group-hover:scale-x-100'}`}></span>
                </Link>
                <AnimatePresence>
                  {activeDropdown === 'cleats' && (
                    <div className="absolute top-[calc(100%-8px)] left-0 pt-2 z-50">
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: premiumEasing }}
                        className="w-56 bg-brand-card/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-4 overflow-hidden"
                      >
                        <div className="px-5 pb-3 border-b border-white/5 mb-2">
                          <p className="text-[10px] font-bold text-white uppercase tracking-widest">Soccer Cleats</p>
                          <div className="w-6 h-0.5 bg-brand-primary mt-2 rounded-full"></div>
                        </div>
                        <div className="flex flex-col">
                          {['Mercurial', 'Phantom', 'Tiempo', 'Predator', 'F50', 'Future', 'Ultra'].map(model => (
                              <Link key={model} href={`/shop?type=soccer-cleats&model=${model.toLowerCase()}`} className="px-5 py-2 text-xs text-gray-300 hover:text-brand-primary hover:bg-white/5 transition-colors group/item flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-transparent group-hover/item:bg-brand-primary transition-colors mr-2"></span>
                                {model}
                              </Link>
                          ))}
                        </div>
                        <div className="px-5 pt-3 mt-1 border-t border-white/5">
                          <Link href="/shop?type=soccer-cleats" className="text-xs text-brand-primary font-bold hover:text-white transition-colors flex items-center group/btn">
                              View All <span className="ml-1 transition-transform group-hover/btn:translate-x-1">→</span>
                          </Link>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Flash Deals */}
              <Link href="/shop?category=deals" className={`text-xs uppercase tracking-widest font-bold transition-colors relative group py-2 ${isTabActive('/shop', 'deals') ? 'text-white' : 'text-gray-400 hover:text-[#FF0000]'}`}>
                Flash Deals
                <span className={`absolute -bottom-1 left-0 w-full h-[2px] rounded-full transition-transform duration-300 origin-left ${isTabActive('/shop', 'deals') ? 'bg-[#FF0000] scale-x-100' : 'bg-[#FF0000] scale-x-0 group-hover:scale-x-100'}`}></span>
              </Link>

              {/* Trending */}
              <Link href="/shop?category=trending" className={`text-xs uppercase tracking-widest font-bold transition-colors relative group py-2 ${isTabActive('/shop', 'trending') ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                Trending
                <span className={`absolute -bottom-1 left-0 w-full h-[2px] rounded-full transition-transform duration-300 origin-left ${isTabActive('/shop', 'trending') ? 'bg-brand-primary scale-x-100' : 'bg-brand-primary scale-x-0 group-hover:scale-x-100'}`}></span>
              </Link>

              {/* New Arrivals */}
              <Link href="/shop?category=new-arrivals" className={`text-xs uppercase tracking-widest font-bold transition-colors relative group py-2 ${isTabActive('/shop', 'new-arrivals') ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                New Arrivals
                <span className={`absolute -bottom-1 left-0 w-full h-[2px] rounded-full transition-transform duration-300 origin-left ${isTabActive('/shop', 'new-arrivals') ? 'bg-brand-primary scale-x-100' : 'bg-brand-primary scale-x-0 group-hover:scale-x-100'}`}></span>
              </Link>
            </nav>

            {/* Right: Quick Actions */}
            <div className="flex-shrink-0 flex items-center justify-end space-x-2 lg:space-x-5 z-20">
              
              {/* MOBILE Search Toggle */}
              <div className="relative lg:hidden">
                <button 
                  className="text-brand-primary transition-colors flex items-center p-1.5 rounded-md"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                >
                  {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                </button>
                
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: premiumEasing }}
                      className="fixed inset-x-0 top-[96px] bottom-0 bg-brand-dark/95 backdrop-blur-xl border-t border-white/10 shadow-2xl p-4 z-50 overflow-y-auto"
                    >
                      <div className="relative max-w-3xl mx-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="Search products..." 
                          className="w-full bg-brand-dark text-white border border-white/5 rounded-md pl-10 pr-4 py-3 text-base focus:outline-none focus:border-brand-primary transition-colors"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearchSubmit(searchQuery);
                          }}
                          autoFocus
                        />
                      </div>
                      <div className="mt-6 max-w-3xl mx-auto">
                        <p className="text-[10px] uppercase tracking-widest text-brand-primary mb-3 font-bold">Suggested</p>
                        <div className="flex flex-wrap gap-y-3 gap-2">
                          {navSearchSuggestions.map((suggestion, idx) => (
                            <span 
                              key={idx} 
                              onClick={() => handleSearchSubmit(suggestion)}
                              className="text-sm bg-white/5 hover:bg-white/10 px-4 py-2 cursor-pointer transition-colors text-white rounded-md"
                            >
                              {suggestion}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* DESKTOP Expanding Search */}
              <div className="hidden lg:flex relative items-center justify-end w-8 h-8">
                <AnimatePresence>
                  {!isDesktopSearchOpen && (
                    <motion.button 
                      key="icon"
                      exit={{ opacity: 0 }}
                      onClick={() => setIsDesktopSearchOpen(true)}
                      className="absolute right-0 text-white hover:text-brand-primary transition-colors p-1.5 z-10"
                    >
                      <Search className="h-5 w-5" />
                    </motion.button>
                  )}
                  {isDesktopSearchOpen && (
                    <motion.div 
                      key="input"
                      initial={{ width: 32, opacity: 0 }}
                      animate={{ width: 280, opacity: 1 }}
                      exit={{ width: 32, opacity: 0 }}
                      transition={{ duration: 0.3, ease: premiumEasing }}
                      className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center z-50"
                    >
                      <div className="w-full relative shadow-2xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="Search products..." 
                          className="w-full bg-brand-dark/95 text-white border border-white/20 rounded-full pl-9 pr-8 py-2 text-sm focus:outline-none focus:border-brand-primary transition-colors backdrop-blur-md"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearchSubmit(searchQuery);
                          }}
                          autoFocus
                        />
                        <button 
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                          onClick={() => {
                            setIsDesktopSearchOpen(false);
                            setSearchQuery('');
                          }}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Desktop Categories Overlay */}
                      {searchQuery.length === 0 && (
                        <div className="absolute top-[calc(100%+16px)] right-0 w-full bg-brand-card/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 z-50">
                          <p className="text-[10px] uppercase text-brand-primary mb-3 font-bold tracking-widest">Categories</p>
                          <div className="flex flex-col gap-2">
                            <Link href="/shop?type=sneakers" onClick={() => setIsDesktopSearchOpen(false)} className="text-sm text-gray-300 hover:text-white flex items-center group">
                               <span className="w-1.5 h-1.5 bg-white/20 group-hover:bg-brand-primary transition-colors rounded-full mr-2"></span> Sneakers
                            </Link>
                            <Link href="/shop?type=soccer-cleats" onClick={() => setIsDesktopSearchOpen(false)} className="text-sm text-gray-300 hover:text-white flex items-center group">
                               <span className="w-1.5 h-1.5 bg-white/20 group-hover:bg-brand-primary transition-colors rounded-full mr-2"></span> Soccer Cleats
                            </Link>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

               {/* Cart */}
              <button 
                className="text-brand-primary lg:text-white hover:text-brand-primary transition-colors relative group p-1.5 lg:p-2 rounded-md flex items-center lg:gap-2"
                onClick={() => setIsCartOpen(true)}
              >
                <motion.div
                  animate={cartPulse ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <ShoppingBag className="h-5 w-5 lg:h-5 lg:w-5 group-hover:drop-shadow-[0_0_8px_rgba(198,255,0,0.5)] transition-all" />
                  {/* Mobile Badge Layering */}
                  {cartCount > 0 && (
                    <span className="lg:hidden absolute -top-1 -right-1 bg-brand-accent text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-brand-dark">
                      {cartCount}
                    </span>
                  )}
                </motion.div>
                {/* Desktop Notification Badge */}
                <div className="hidden lg:flex items-center bg-brand-primary/10 px-2 py-0.5 rounded-full border border-brand-primary/20">
                  <span className="font-bold text-xs text-brand-primary">{cartCount}</span>
                </div>
              </button>

              {/* WhatsApp CTA (Mobile Icon Preserved) */}
              <a 
                href={`https://wa.me/${brand.whatsappNumber}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-brand-primary p-1.5 flex lg:hidden hover:scale-105 transition-transform"
              >
                <MessageCircle className="h-5 w-5" />
              </a>

              {/* WhatsApp CTA (Desktop Real Pill Button) */}
              <a 
                href={`https://wa.me/${brand.whatsappNumber}`} 
                target="_blank" 
                rel="noreferrer"
                className="hidden lg:flex items-center bg-brand-primary text-black px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide hover:bg-[#b3e600] transition-all hover:scale-105 shadow-[0_0_15px_-3px_rgba(198,255,0,0.4)]"
              >
                Order Now
              </a>

            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Hub (100% UNTOUCHED) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-brand-card/95 backdrop-blur-lg border-t border-white/5 px-6 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] z-[55]">
        <div className="flex justify-between items-center mb-1 max-w-sm mx-auto">
          {/* 1. Home */}
          <Link href="/" className={`relative flex flex-col items-center space-y-1 w-16 p-1 rounded-md transition-all ${isTabActive('/') ? 'text-brand-primary' : 'text-gray-400 hover:text-white'}`}>
            {isTabActive('/') && <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-primary rounded-full"></div>}
            <Home className="h-5 w-5" />
            <span className="text-[9px] font-medium tracking-wide uppercase">Home</span>
          </Link>
          
          {/* 2. Sneakers */}
          <Link href="/shop?type=sneakers" className={`relative flex flex-col items-center space-y-1 w-16 p-1 rounded-md transition-all ${isTabActive('/shop', 'sneakers') ? 'text-brand-primary' : 'text-gray-400 hover:text-white'}`}>
            {isTabActive('/shop', 'sneakers') && <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-primary rounded-full"></div>}
            <SneakerIcon className="h-5 w-5" />
            <span className="text-[9px] font-medium tracking-wide uppercase">Sneakers</span>
          </Link>
          
          {/* 3. Cart Icon */}
          <div className="relative">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="bg-brand-primary text-black p-3 rounded-full flex flex-col items-center justify-center h-14 w-14 border-[3px] border-brand-card shadow-lg focus:outline-none"
            >
              <motion.div animate={cartPulse ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>
                <ShoppingBag className="h-5 w-5" />
              </motion.div>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-accent text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-brand-card">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
          
          {/* 4. Soccer Cleats */}
          <Link href="/shop?type=soccer-cleats" className={`relative flex flex-col items-center space-y-1 w-16 p-1 rounded-md transition-all ${isTabActive('/shop', 'soccer-cleats') ? 'text-brand-primary' : 'text-gray-400 hover:text-white'}`}>
            {isTabActive('/shop', 'soccer-cleats') && <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-primary rounded-full"></div>}
            <CleatIcon className="h-5 w-5" />
            <span className="text-[8px] sm:text-[9px] font-medium tracking-wide uppercase text-center w-full whitespace-nowrap">
              Soccer Cleats
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}