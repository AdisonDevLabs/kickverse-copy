// components/Footer.tsx

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Truck, ShieldCheck, Wallet, CheckCircle, MessageCircle, Phone, Send, Instagram, Facebook } from 'lucide-react';
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
            
            <div className="flex flex-col gap-3 mb-6">
              {/* Sneakers Contact */}
              <div className="bg-black/40 border border-white/5 rounded-md p-4 group hover:border-brand-primary/40 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-white font-bold text-sm uppercase tracking-widest leading-none mb-1.5">Sneakers</p>
                    <p className="text-gray-400 text-xs font-mono">0713 625 575</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <a 
                    href="https://wa.me/254713625575?text=Hello%20Kickverse%2C%20I%20want%20to%20inquire%20about%20sneakers" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-center bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-black border border-brand-primary/20 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> WhatsApp
                  </a>
                  <a 
                    href="tel:+254713625575" 
                    className="flex items-center justify-center bg-white/5 text-white hover:bg-white hover:text-black border border-white/10 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 mr-1.5" /> Call
                  </a>
                </div>
              </div>

              {/* Boot Room Kenya Contact */}
              <div className="bg-black/40 border border-white/5 rounded-md p-4 group hover:border-brand-primary/40 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-white font-bold text-sm uppercase tracking-widest leading-none mb-1.5">Boot Room Kenya</p>
                    <p className="text-gray-400 text-xs font-mono">0794 584 404</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <a 
                    href="https://wa.me/254794584404?text=Hello%20Boot%20Room%20Kenya%2C%20I%20want%20to%20inquire%20about%20soccer%20cleats" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-center bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-black border border-brand-primary/20 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> WhatsApp
                  </a>
                  <a 
                    href="tel:+254794584404" 
                    className="flex items-center justify-center bg-white/5 text-white hover:bg-white hover:text-black border border-white/10 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 mr-1.5" /> Call
                  </a>
                </div>
              </div>
            </div>

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