// components/AnnouncementBar.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Truck, MessageCircle, Star, Sparkles, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { brand, announcementMessages as messages } from '@/lib/data/brand';

// Apply the same luxury curve used in your animations.ts
const premiumEasing: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div 
      className="fixed top-0 left-0 right-0 bg-brand-primary text-black h-10 flex items-center justify-center px-4 z-[60] overflow-hidden font-sans w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Mobile/Tablet Rotating View */}
      <div className="md:hidden w-full h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.6, ease: premiumEasing }}
            className="flex items-center space-x-2 absolute text-[13px] font-semibold"
          >
            {React.createElement(messages[index].icon, { className: "h-3.5 w-3.5" })}
            <span>{messages[index].text}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Desktop Split View */}
      <div className="hidden md:flex w-full items-center justify-between max-w-7xl mx-auto px-4 font-semibold text-sm">
        <div className="flex items-center space-x-2">
           <Truck className="h-4 w-4" />
           <span>{messages[0].text}</span>
        </div>
        <div className="flex items-center space-x-2">
           <Sparkles className="h-4 w-4" />
           <span>{messages[2].text}</span>
        </div>
        <a 
          href={`https://wa.me/${brand.whatsappNumber}`} 
          target="_blank" 
          rel="noreferrer" 
          className="flex items-center space-x-2 cursor-pointer hover:opacity-70 transition-opacity"
        >
           <MessageCircle className="h-4 w-4" />
           <span>Order via WhatsApp</span>
        </a>
      </div>
    </div>
  );
}