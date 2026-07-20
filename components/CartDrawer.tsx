// components/CartDrawer.tsx

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingBag, MessageCircle, CheckCircle, ShieldCheck, Truck, ArrowRight } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { formatPrice } from '@/lib/data';
import { brand, cartTrustFeatures } from '@/lib/data/brand';
import Image from 'next/image';

// Apply the same luxury curve used in your animations.ts
const premiumEasing: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();


  const handleWhatsAppCheckout = () => {

    const productUrl = window.location.href;

    let message = `Hello ${brand.name}\n\nI would like to order:\n\n`;
    
    items.forEach(item => {
      message += `• ${item.product.name} × ${item.quantity}\n  Option: ${item.size}${item.color ? ` | Color: ${item.color}` : ''}\n\n`;
    });

    message += `Delivery: \n\n`;
    message += `\nSubtotal: ${formatPrice(cartTotal)}\n\nPlease confirm availability, total payable and payment method\n\nThank you.\n\n${productUrl}`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${brand.whatsappNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: premiumEasing }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          />

          {/* Drawer - Removed bouncy spring, implemented smooth premium ease */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.6, ease: premiumEasing }}
            className="fixed inset-y-0 right-0 w-full max-w-[450px] bg-brand-card shadow-2xl z-[60] flex flex-col pt-safe pb-safe-offset border-l border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-brand-dark shrink-0">
              <h2 className="font-display uppercase tracking-wide text-2xl flex items-center text-white">
                Shopping Cart ({cartCount})
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 -mr-2 text-gray-400 hover:text-white transition-colors rounded-md"
                aria-label="Close cart"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 hide-scrollbar">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-20 h-20 bg-brand-dark flex items-center justify-center text-gray-500 rounded-full mb-4">
                    <ShoppingBag className="h-10 w-10 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="font-sans font-medium text-xl text-white mb-2">Your cart is empty</h3>
                    <p className="text-sm text-gray-400 max-w-[250px] mx-auto">Discover our latest styles and find your next favorite item.</p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="h-14 px-8 mt-6 bg-brand-primary text-black font-bold hover:bg-brand-hover rounded-md transition-colors uppercase tracking-widest text-sm w-full sm:w-auto"
                  >
                    CONTINUE SHOPPING
                  </button>
                  <a href="/shop?category=best-sellers" onClick={() => setIsCartOpen(false)} className="text-xs text-gray-400 hover:text-white uppercase tracking-widest font-bold mt-2 underline underline-offset-4">
                    BROWSE BEST SELLERS
                  </a>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex space-x-4 bg-transparent border-b border-white/5 pb-6">
                      <div className="relative h-28 w-24 flex-shrink-0 bg-brand-dark rounded-md overflow-hidden">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          referrerPolicy="no-referrer"
                          className="object-cover opacity-90"
                        />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start">
                          <h3 className="font-sans font-medium text-sm text-white line-clamp-2 pr-2 leading-tight">
                            {item.product.name}
                          </h3>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                            className="text-gray-500 hover:text-white transition-colors p-1 -mt-1 rounded-md"
                            aria-label="Remove item"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">
                          Option: {item.size} {item.color ? `| ${item.color}` : ''}
                        </p>
                        
                        <div className="mt-auto flex items-end justify-between pt-4">
                          <div className="flex items-center border border-white/20 bg-brand-dark overflow-hidden rounded-md">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-white leading-8">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="font-bold text-sm text-white">{formatPrice(item.product.price)}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Trust Bar directly below products */}
                  <div className="pt-2 pb-4">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Why Shop With Us</h4>
                    <div className="grid grid-cols-1 gap-2 text-[11px] text-gray-400 font-light">
                      {cartTrustFeatures.map((feature, idx) => (
                        <div key={idx} className="flex items-center">
                          <feature.icon className="h-3.5 w-3.5 mr-2 text-brand-primary" /> {feature.text}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer / Summary */}
            {items.length > 0 && (
              <div className="border-t border-white/10 bg-brand-dark shrink-0">
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Cart Summary */}
                  <div className="space-y-1 mb-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400 font-bold uppercase tracking-widest">Subtotal</span>
                      <span className="text-xl font-bold text-white">{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between items-start text-xs pt-2">
                       <span className="text-gray-500 italic max-w-[280px]">Delivery cost calculated after WhatsApp confirmation.</span>
                    </div>
                  </div>
                  
                  {/* Checkout Button */}
                  <button
                    onClick={handleWhatsAppCheckout}
                    className="w-full h-16 bg-brand-primary text-black font-bold flex items-center justify-center hover:bg-brand-hover transition-all group uppercase tracking-widest text-base shadow-[0_0_20px_-5px_rgba(0,0,0,0.3)] rounded-md"
                  >
                    <MessageCircle className="w-6 h-6 mr-3" />
                    <span>ORDER ON WHATSAPP</span>
                  </button>
                  
                  {/* Secondary CTA */}
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="w-full h-12 bg-transparent border border-white/10 text-white font-bold uppercase tracking-widest text-xs flex items-center justify-center hover:bg-white/5 transition-colors rounded-md mt-3"
                  >
                    CONTINUE SHOPPING
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}