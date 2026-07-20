// components/NavBar.tsx

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Heart, ShoppingBag, Menu, X, Home, Grid, Tag, MessageCircle } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { brand } from '@/lib/data/brand';
import { navSearchSuggestions, navLinksData } from '@/lib/data/categories';
import { AnnouncementBar } from './AnnouncementBar';

// Apply the same luxury curve used in your animations.ts
const premiumEasing: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function NavBar() {
  const { cartCount, setIsCartOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartPulse, setCartPulse] = useState(false);
  const [prevCartCount, setPrevCartCount] = useState(cartCount);

  useEffect(() => {
    if (cartCount > prevCartCount) {
      setCartPulse(true);
      const timer = setTimeout(() => setCartPulse(false), 300);
      return () => clearTimeout(timer);
    }
    setPrevCartCount(cartCount);
  }, [cartCount, prevCartCount]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <AnnouncementBar />
      {/* Desktop Header & Mobile Top Bar */}
      <header className={`fixed top-10 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-brand-dark/95 backdrop-blur-md shadow-2xl py-1 border-b border-white/5' : 'bg-transparent py-1 border-b border-white/10'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-[60px] relative">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="mr-2 sm:mr-3 z-10 flex-shrink-0 focus:outline-none">
                <Image 
                  src={brand.logo} 
                  alt={`${brand.name} Logo`} 
                  width={44} 
                  height={44} 
                  className="rounded-full object-cover border border-white/10 w-9 h-9 md:w-11 md:h-11"
                />
              </Link>
              <Link href="/" className="font-display tracking-[0.15em] text-white flex flex-col justify-center mt-1 rounded-md focus:outline-none absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
                <span className="text-xl sm:text-2xl md:text-3xl font-black uppercase leading-none whitespace-nowrap">
                  {brand.name.split(' ')[0]}
                  <span className="text-brand-primary">
                    {brand.name.split(' ').length > 1 ? ' ' + brand.name.split(' ')[1] : ''}
                  </span>
                </span>
                {brand.name.split(' ').length > 2 && (
                  <span className="hidden md:block text-[8px] tracking-[0.3em] uppercase text-gray-400 mt-1 font-sans">
                    {brand.name.split(' ').slice(2).join(' ')}
                  </span>
                )}
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinksData.map((link, idx) => (
                <Link key={idx} href={link.href} className={`text-[11px] uppercase tracking-widest font-bold ${link.baseTextClass} ${link.hoverTextClass} transition-colors relative group rounded-md px-2 py-1 ${link.isLive ? 'flex items-center' : ''}`}>
                  {link.label}
                  {link.isLive && (
                    <span className="ml-2 bg-brand-accent text-white text-[9px] px-1.5 py-0.5 rounded-sm animate-pulse flex items-center leading-none">LIVE</span>
                  )}
                  <span className={`absolute -bottom-1.5 left-2 w-0 h-px transition-all group-hover:w-[calc(100%-16px)] ${link.underlineClass}`}></span>
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4 md:space-x-6">
              
              {/* Search Toggle */}
              <div className="relative hidden sm:block">
                <button 
                  className="text-white hover:text-brand-primary transition-colors flex items-center p-2 rounded-md"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                >
                  {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                </button>
                
                {/* Search Dropdown - Updated ease */}
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: premiumEasing }}
                      className="absolute top-10 right-0 w-72 bg-brand-card border border-white/10 rounded-md shadow-2xl p-4 origin-top-right z-50"
                    >
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="Search products..." 
                          className="w-full bg-brand-dark text-white border border-white/5 rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-primary transition-colors"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className="mt-4">
                        <p className="text-[10px] uppercase tracking-widest text-brand-primary mb-3 font-bold">Suggested</p>
                        <div className="flex flex-wrap gap-2">
                          {navSearchSuggestions.map((suggestion, idx) => (
                            <span key={idx} className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 cursor-pointer transition-colors text-white rounded-md">
                              {suggestion}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* WhatsApp CTA (Desktop) */}
              <a 
                href={`https://wa.me/${brand.whatsappNumber}`} 
                target="_blank" 
                rel="noreferrer"
                className="hidden lg:flex items-center bg-brand-primary text-black px-5 py-2 rounded-md text-xs font-bold uppercase tracking-wide hover:bg-brand-hover transition-all hover:scale-105 shadow-[0_0_15px_-3px_rgba(0,0,0,0.3)]"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Order via WhatsApp
              </a>

               {/* Cart */}
              <button 
                className="text-white hover:text-brand-primary transition-colors relative group p-2 rounded-md"
                onClick={() => setIsCartOpen(true)}
              >
                <motion.div
                  animate={cartPulse ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <ShoppingBag className="h-6 w-6 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all" />
                </motion.div>
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-brand-accent text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-brand-dark">
                    {cartCount}
                  </span>
                )}
              </button>
              
              {/* Heart (Low Priority) */}
              <button className="text-gray-400 hover:text-white transition-colors hidden lg:block opacity-50 hover:opacity-100 p-2 rounded-md">
                <Heart className="h-5 w-5" />
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Hub (Simplified to 4 elements to fix fat-finger issues) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-card/95 backdrop-blur-lg border-t border-white/5 px-6 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] z-[55]">
        <div className="flex justify-between items-center mb-1 max-w-sm mx-auto">
          <Link href="/" className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white transition-colors w-16 p-1 rounded-md">
            <Home className="h-5 w-5" />
            <span className="text-[9px] font-medium tracking-wide uppercase">Home</span>
          </Link>
          
          <Link href="/shop" className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white transition-colors w-16 p-1 rounded-md">
            <Grid className="h-5 w-5" />
            <span className="text-[9px] font-medium tracking-wide uppercase">Shop</span>
          </Link>
          
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
          
          <a href={`https://wa.me/${brand.whatsappNumber}`} target="_blank" rel="noreferrer" className="flex flex-col items-center space-y-1 text-gray-400 hover:text-brand-primary transition-colors w-16 p-1 rounded-md">
            <MessageCircle className="w-5 h-5" />
            <span className="text-[9px] font-bold tracking-wide uppercase text-center w-full">Order</span>
          </a>
        </div>
      </div>
    </>
  );
}