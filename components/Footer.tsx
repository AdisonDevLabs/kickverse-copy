// components/Footer.tsx

'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, ShieldCheck, Wallet, CheckCircle, MessageCircle, Instagram, Facebook, Phone, Users } from 'lucide-react';
import { brand, footerQuickShopLinks, footerSupportLinks } from '@/lib/data/brand';
import { motion } from 'motion/react';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/animations';

export function Footer() {

  return (
    <footer className="bg-brand-dark border-t border-white/10 pt-20 pb-8 relative z-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerContainer}
          className="flex flex-col gap-12 lg:gap-16 mb-12"
        >
          
          {/* TOP GRID: Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
            
            {/* Brand Section */}
            <motion.div variants={staggerItem} className="md:col-span-12 lg:col-span-4 flex flex-col items-start text-left">
              <Link href="/" aria-label="Go to Kickverse Homepage" className="font-display font-black text-3xl tracking-widest text-white uppercase mb-4 block">
                 {brand.name.split(' ')[0]}
                 <span className="text-brand-primary">
                   {brand.name.split(' ').length > 1 ? ' ' + brand.name.split(' ')[1] : ''}
                 </span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
                {brand.description}
              </p>
              <div className="inline-flex items-center text-brand-primary text-xs font-bold tracking-widest uppercase bg-brand-primary/10 px-3 py-1.5 border border-brand-primary/20 mb-6 rounded-md">
                 <CheckCircle className="w-3 h-3 mr-2" aria-hidden="true" /> Trusted by customers nationwide
              </div>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="flex items-center text-gray-500">
                  <Truck className="w-4 h-4 mr-1.5 text-brand-primary" aria-hidden="true" /> <span className="text-[10px] font-bold uppercase tracking-wider">{brand.deliveryInfo.standard}</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <ShieldCheck className="w-4 h-4 mr-1.5 text-brand-primary" aria-hidden="true" /> <span className="text-[10px] font-bold uppercase tracking-wider">Quality Checked</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <Wallet className="w-4 h-4 mr-1.5 text-brand-primary" aria-hidden="true" /> <span className="text-[10px] font-bold uppercase tracking-wider">Affordable</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Links Group */}
            <motion.div variants={staggerItem} className="md:col-span-6 lg:col-span-4 grid grid-cols-2 gap-8">
              {/* Quick Shop */}
              <div>
                <h4 className="font-display text-white text-lg uppercase tracking-wide mb-6">Quick Shop</h4>
                <ul className="space-y-4">
                  {footerQuickShopLinks.map((link, idx) => (
                    <li key={idx}><Link href={link.href} className="text-gray-400 hover:text-brand-primary text-sm transition-colors">{link.label}</Link></li>
                  ))}
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="font-display text-white text-lg uppercase tracking-wide mb-6">Support</h4>
                <ul className="space-y-4">
                  {footerSupportLinks.map((link, idx) => (
                    <li key={idx}><Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">{link.label}</Link></li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Contact Section */}
            <motion.div variants={staggerItem} className="md:col-span-6 lg:col-span-4 flex flex-col">
              <h4 className="font-display text-white text-lg uppercase tracking-wide mb-6">Contact Us</h4>
              
              <div className="flex flex-col space-y-6">
                {/* Sneakers */}
                <div className="flex flex-col space-y-2">
                  <span className="text-white font-bold text-xs uppercase tracking-widest">Sneakers</span>
                  <div className="flex flex-wrap items-center gap-3">
                    <a href={`tel:${brand.contacts.sneakers.phone}`} aria-label="Call Sneakers Department" className="text-gray-400 hover:text-brand-primary text-sm transition-colors flex items-center group">
                      <Phone className="w-3.5 h-3.5 mr-1.5 group-hover:text-brand-primary transition-colors" aria-hidden="true" /> {brand.contacts.sneakers.phone}
                    </a>
                    <span className="text-gray-700 hidden sm:inline-block">|</span>
                    <a href={`https://wa.me/${brand.contacts.sneakers.whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp Sneakers Department" className="text-gray-400 hover:text-brand-primary text-sm transition-colors flex items-center group">
                      <MessageCircle className="w-3.5 h-3.5 mr-1.5 group-hover:text-brand-primary transition-colors" aria-hidden="true" /> WhatsApp
                    </a>
                  </div>
                </div>

                {/* Boot Room Kenya */}
                <div className="flex flex-col space-y-2">
                  <span className="text-white font-bold text-xs uppercase tracking-widest">Boot Room Kenya</span>
                  <div className="flex flex-wrap items-center gap-3">
                    <a href={`tel:${brand.contacts.bootRoom.phone}`} aria-label="Call Boot Room Kenya Department" className="text-gray-400 hover:text-brand-primary text-sm transition-colors flex items-center group">
                      <Phone className="w-3.5 h-3.5 mr-1.5 group-hover:text-brand-primary transition-colors" aria-hidden="true" /> {brand.contacts.bootRoom.phone}
                    </a>
                    <span className="text-gray-700 hidden sm:inline-block">|</span>
                    <a href={`https://wa.me/${brand.contacts.bootRoom.whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp Boot Room Kenya Department" className="text-gray-400 hover:text-brand-primary text-sm transition-colors flex items-center group">
                      <MessageCircle className="w-3.5 h-3.5 mr-1.5 group-hover:text-brand-primary transition-colors" aria-hidden="true" /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>

          {/* BOTTOM GRID: Community & Socials */}
          <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-10 border-t border-white/10">
            
            {/* WhatsApp Community */}
            <div className="flex flex-col items-start">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-2">Join Our Community</h4>
              <p className="text-gray-400 text-xs mb-5 max-w-sm leading-relaxed">Get early access to new arrivals, exclusive flash deals, and restock updates.</p>
              
              <a 
                href={brand.socialLinks.whatsappCommunity}
                target="_blank"
                rel="noreferrer"
                aria-label="Join Kickverse WhatsApp Community"
                className="w-full sm:w-auto bg-brand-primary/10 border border-brand-primary/30 text-brand-primary hover:bg-brand-primary hover:text-black hover:border-brand-primary px-6 py-3 font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center rounded-md group"
              >
                <Users className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" aria-hidden="true" />
                Join on WhatsApp
              </a>
            </div>

            {/* Socials Grid */}
            <div className="flex flex-col lg:items-end">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-5 lg:text-right w-full">Follow Us</h4>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                
                {/* Instagram */}
                <a href={brand.socialLinks.instagram} target="_blank" rel="noreferrer" aria-label="Follow Kickverse on Instagram" className="flex items-center text-gray-400 hover:text-white transition-all group bg-brand-dark border border-white/10 hover:border-brand-primary/50 rounded-full pr-4 py-1 pl-1">
                  <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center mr-2.5 group-hover:bg-brand-primary group-hover:text-black transition-colors shrink-0">
                    <Instagram className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Instagram</span>
                </a>

                {/* Facebook */}
                <a href={brand.socialLinks.facebook} target="_blank" rel="noreferrer" aria-label="Follow Kickverse on Facebook" className="flex items-center text-gray-400 hover:text-white transition-all group bg-brand-dark border border-white/10 hover:border-brand-primary/50 rounded-full pr-4 py-1 pl-1">
                  <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center mr-2.5 group-hover:bg-brand-primary group-hover:text-black transition-colors shrink-0">
                    <Facebook className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Facebook</span>
                </a>

                {/* Kickverse TikTok */}
                <a href={brand.socialLinks.tiktok} target="_blank" rel="noreferrer" aria-label="Follow Kickverse KE on TikTok" className="flex items-center text-gray-400 hover:text-white transition-all group bg-brand-dark border border-white/10 hover:border-brand-primary/50 rounded-full pr-4 py-1 pl-1">
                  <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center mr-2.5 group-hover:bg-brand-primary group-hover:text-black transition-colors shrink-0">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Kickverse KE</span>
                </a>

                {/* Boot Room TikTok */}
                <a href={brand.socialLinks.tiktokBootRoom} target="_blank" rel="noreferrer" aria-label="Follow Boot Room Kenya on TikTok" className="flex items-center text-gray-400 hover:text-white transition-all group bg-brand-dark border border-white/10 hover:border-brand-primary/50 rounded-full pr-4 py-1 pl-1">
                  <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center mr-2.5 group-hover:bg-brand-primary group-hover:text-black transition-colors shrink-0">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Boot Room</span>
                </a>

                {/* Sole Kraft TikTok */}
                <a href={brand.socialLinks.tiktokSoleKraft} target="_blank" rel="noreferrer" aria-label="Follow Sole Kraft on TikTok" className="flex items-center text-gray-400 hover:text-white transition-all group bg-brand-dark border border-white/10 hover:border-brand-primary/50 rounded-full pr-4 py-1 pl-1">
                  <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center mr-2.5 group-hover:bg-brand-primary group-hover:text-black transition-colors shrink-0">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Sole Kraft</span>
                </a>

              </div>
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