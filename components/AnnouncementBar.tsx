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
      className="fixed top-0 left-0 right-0 bg-brand-primary text-black h-8 flex items-center justify-center z-[60] overflow-hidden font-sans w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Mobile/Tablet Rotating View */}
      <div className="md:hidden w-full h-full flex items-center justify-center relative px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.6, ease: premiumEasing }}
            className="flex items-center space-x-2 absolute text-[11px] font-semibold"
          >
            {React.createElement(messages[index].icon, { className: "h-3.5 w-3.5" })}
            <span>{messages[index].text}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Desktop Continuous Marquee View */}
      <div className="hidden md:flex w-full items-center overflow-hidden">
        <motion.div 
          className="flex w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
        >
          {/* Render twice for seamless infinite looping */}
          {[...Array(2)].map((_, groupIdx) => (
            <div key={groupIdx} className="flex items-center space-x-12 px-6">
              {messages.map((msg, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-sm font-semibold whitespace-nowrap">
                  {React.createElement(msg.icon, { className: "h-4 w-4" })}
                  <span>{msg.text}</span>
                </div>
              ))}
              <a 
                href={`https://wa.me/${brand.whatsappNumber}`} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center space-x-2 text-sm font-semibold whitespace-nowrap cursor-pointer hover:opacity-70 transition-opacity"
              >
                 <MessageCircle className="h-4 w-4" />
                 <span>Order via WhatsApp</span>
              </a>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}