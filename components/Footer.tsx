// components/Footer.tsx

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Truck, ShieldCheck, Wallet, CheckCircle, MessageCircle, Send, Instagram, Facebook } from 'lucide-react';
import { brand, footerQuickShopLinks, footerSupportLinks } from '@/lib/data/brand';
import { motion } from 'motion/react';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/animations';

export function Footer() {
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribed(true);
    // In production, integrate your email API here
  };

  return (
    <footer className="bg-brand-dark border-t border-white/10 pt-20 pb-8 relative z-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16"
        >
          
          {/* Brand Section */}
          <motion.div variants={staggerItem} className="lg:col-span-4 flex flex-col items-start text-left">
            <Link href="/" className="font-display font-black text-3xl tracking-tighter text-white uppercase mb-4 block">
               {brand.name.split(' ')[0]}
               <span className="text-brand-primary">
                 {brand.name.split(' ').length > 1 ? ' ' + brand.name.split(' ')[1] : ''}
               </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
              {brand.description}
            </p>
            <div className="inline-flex items-center text-brand-primary text-xs font-bold tracking-widest uppercase bg-brand-primary/10 px-3 py-1.5 border border-brand-primary/20 mb-8 rounded-md">
               <CheckCircle className="w-3 h-3 mr-2" /> Trusted by customers nationwide
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 mt-auto">
              <div className="flex items-center text-gray-500">
                <Truck className="w-4 h-4 mr-1.5 text-brand-primary" /> <span className="text-[10px] font-bold uppercase tracking-wider">{brand.deliveryInfo.standard}</span>
              </div>
              <div className="flex items-center text-gray-500">
                <ShieldCheck className="w-4 h-4 mr-1.5 text-brand-primary" /> <span className="text-[10px] font-bold uppercase tracking-wider">Quality Checked</span>
              </div>
              <div className="flex items-center text-gray-500">
                <Wallet className="w-4 h-4 mr-1.5 text-brand-primary" /> <span className="text-[10px] font-bold uppercase tracking-wider">Affordable</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Shop */}
          <motion.div variants={staggerItem} className="lg:col-span-2">
            <h4 className="font-display text-white text-lg uppercase tracking-wide mb-6">Quick Shop</h4>
            <ul className="space-y-4">
              {footerQuickShopLinks.map((link, idx) => (
                <li key={idx}><Link href={link.href} className="text-gray-400 hover:text-brand-primary text-sm transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div variants={staggerItem} className="lg:col-span-2">
            <h4 className="font-display text-white text-lg uppercase tracking-wide mb-6">Support</h4>
            <ul className="space-y-4">
              {footerSupportLinks.map((link, idx) => (
                <li key={idx}><Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </motion.div>

          {/* Contact & Newsletter */}
          <motion.div variants={staggerItem} className="lg:col-span-4">
            <h4 className="font-display text-white text-lg uppercase tracking-wide mb-6">Contact Us</h4>
            
            <a href={`https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent("I'm ready to place an order")}`} target="_blank" rel="noreferrer" className="flex items-center w-full bg-brand-primary text-black p-4 group mb-6 hover:bg-brand-hover transition-colors shadow-[0_0_15px_-3px_rgba(0,0,0,0.3)] rounded-md">
              <div className="w-10 h-10 bg-black/10 rounded-md flex items-center justify-center mr-4">
                <MessageCircle className="w-5 h-5 text-black" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-black font-bold text-sm uppercase tracking-widest leading-none mb-1">Start Order Instantly</p>
                <p className="text-black/80 text-xs">Chat on WhatsApp</p>
              </div>
              <div className="w-8 h-8 rounded-full border border-black/30 flex items-center justify-center group-hover:bg-black group-hover:text-brand-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </a>

            {/* Newsletter */}
            <div className="mt-8 pt-8 border-t border-white/5">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-2">Join Our VIP List</h4>
              <p className="text-gray-400 text-xs mb-4">Get early access to new arrivals and exclusive deals.</p>
              
              {isSubscribed ? (
                 <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-md p-4 flex items-center text-brand-primary">
                   <CheckCircle className="w-5 h-5 mr-3" />
                   <span className="text-sm font-bold uppercase tracking-widest">You're on the list!</span>
                 </div>
              ) : (
                <form className="flex w-full" onSubmit={handleSubscribe}>
                  <input type="email" required placeholder="Your email address" className="bg-brand-card text-white border border-white/10 px-4 py-3 w-full text-sm focus:outline-none focus:border-brand-primary rounded-l-md placeholder:text-gray-600 transition-colors" />
                  <button type="submit" className="bg-brand-primary text-black px-4 py-3 font-bold text-sm hover:bg-brand-hover transition-colors flex items-center justify-center min-w-[50px] rounded-r-md">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            {/* Socials */}
            <div className="mt-8 flex items-center gap-4">
              <a href={brand.socialLinks.tiktok} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition-colors flex items-center text-xs font-bold tracking-wider uppercase group rounded-md">
                TikTok
              </a>
            </div>
          </motion.div>
          
        </motion.div>
        
        {/* Copyright Bar */}
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp}
          className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 gap-4"
        >
          <p className="text-gray-500 text-[10px] sm:text-xs">
            &copy; {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
          <p className="text-gray-600 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-center md:text-right">
            Designed for mobile-first shopping experience in {brand.location}
          </p>
        </motion.div>
      </div>
    </footer>
  );
}