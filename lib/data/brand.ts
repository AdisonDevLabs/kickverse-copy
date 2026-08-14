// lib/data/brand.ts
import { Truck, Package, Star, Sparkles, Tag, CheckCircle, ShieldCheck } from 'lucide-react';

export const brand = {
  name: "KICKVERSE KE",
  url: "https://kickverse.co.ke/",
  shortName: "KICKVERSE",
  logo: "/kickverse.png",
  logo1: "/android-chrome-512x512.png",
  tagline: "HOME OF THE BEST SNEAKERS & CLEATS",
  description:
    "Shop with us for Genuine quality and best prices. 100% Verified Secure Shopping",
  location: "Nairobi, Kenya",
  seo: {
    title: "KICKVERSE KE | HOME OF THE BEST SNEAKERS & CLEATS",
    description: "Shop with us for Genuine quality and best prices.",
    ogImage: "/kickverse.png",
    favicon: "/favicon.ico",
    appleIcon: "/apple-touch-icon.png",
  },

  hero: {
    badge: "Tested, trusted and approved",
    headlineTop: "HOME OF THE BEST",
    headlineHighlight: "SNEAKERS & CLEATS",
    backgroundImage: "/IMG_3305.jpg",
    sneakersImage: "/sneakers.jpg",
    soccerCleatsImage: "/soccer-cleats.jpg",
    officialsImage: "/officials.jpg",
    opensSandalsImage: "/opens-sandals.jpg",
    ctaPrimary: "Order on WhatsApp",
    ctaSecondary: "Shop Collection",
  },

  sections: {
    featured: {
      title: "Featured Collection",
      subtitle: "Browse our curated selection of genuine quality sneakers and soccer cleats."
    },
    flashDeals: {
      badge: "Live Offers",
      title: "Flash Deals",
      subtitle: "Grab your favorite styles before they are gone",
      cta: "View All Deals"
    },
    newArrivals: {
      badge: "Updated Weekly",
      title: "Latest Styles",
      subtitle: "Fresh styles added weekly — be the first to own them.",
      cta: "View All Arrivals",
      trendingBadgePrefix: "Trending in"
    },
    bestSellers: {
      badge: "Customer Favorites",
      title: "BEST SELLERS",
      subtitle: "Tested, trusted and approved.",
      cta: "View All Favorites"
    },
    whyUs: {
      badge: "Trust & Reliability",
      titleTop: "WHY SHOP WITH",
      subtitle: "Shop with us for Genuine quality and best prices."
    },
    reviews: {
      badge: "Tested, trusted and approved",
      titleTop: "WHAT OUR",
      titleBottom: "CUSTOMERS SAY"
    },
    whatsappCta: {
      badge: "We Are Online",
      titleTop: "START YOUR",
      titleBottom: "ORDER NOW",
      subtitle: "Chat with us directly on WhatsApp to confirm size, price, and delivery details."
    }
  },

  whatsappNumber: "254713625575",
  contacts: {
    sneakers: {
      phone: "0713625575",
      whatsapp: "254713625575"
    },
    bootRoom: {
      phone: "0794584404",
      whatsapp: "254794584404"
    }
  },
  whatsappMessage: {
    general:
      "Hello KICKVERSE KE,\n\nI would like to place an order.\n\nProduct(s):\n\nSize:\nQuantity:\nDelivery Location:\n\nPlease confirm availability and total price.\n\nThank you.",
  },
  socialLinks: {
    instagram: "https://instagram.com/kickverse.ke_",
    facebook: "https://facebook.com/", // Add your FB link here later
    tiktok: "https://www.tiktok.com/@kickverse_?_r=1&_t=ZS-98UxHbNXiWS",
    tiktokBootRoom: "https://www.tiktok.com/@bootroomkenya?_r=1&_t=ZS-98UxJXGo06H",
    tiktokSoleKraft: "https://www.tiktok.com/@solekraft?_r=1&_t=ZS-98UxNemc1X3",
    whatsappCommunity: "https://chat.whatsapp.com/DZMzWpLnP9WDFjZ4PCrENq"
  },
  deliveryInfo: {
    standard: "Small delivery fee charged for orders outside CBD & Doorstep deliveries.",
    nairobi: "Complimentary delivery exclusively within the Nairobi CBD",
  },
  trustStatements: [
    "We Deliver countrywide",
    "Genuine quality and best prices",
    "Order and Pay on delivery",
    "Tested, trusted and approved",
  ],
  features: [
    {
      title: "Genuine Quality",
      description: "Shop with us for Genuine quality and best prices."
    },
    {
      title: "Countrywide Delivery",
      description: "We Deliver countrywide."
    },
    {
      title: "Nairobi CBD Delivery",
      description: "Enjoy complimentary delivery exclusively within the Nairobi CBD boundaries."
    },
    {
      title: "Pay after Delivery",
      description: "Order and Pay after delivery (locations around Nairobi) and its environs."
    }
  ],
  whatsappTrustSignals: [
    "We Deliver countrywide",
    "Genuine quality",
    "Tested, trusted and approved",
    "Pay on delivery available"
  ],
  whatsappMockChat: [
    {
      sender: "user",
      text: `Hello Kickverse

I'd like to order:

• Nike Vapor 17 Elite × 1
Size 42 | White/Blue

Delivery: Nairobi CBD
Subtotal: KSh 5,200

Please confirm availability, total payable and payment method.

Thank you.`,
      time: "10:05 AM"
    },
    {
      sender: "brand",
      text: `Yes, they are available.\n\nSince it's within Nairobi CBD, delivery is FREE!\n\nYou can order and pay on delivery.\n\nSend your exact location when ready.`,
      time: "10:06 AM"
    }
  ],
  salesCallout: "Tested, trusted and approved"
};

export const announcementMessages = [
  { text: "Call / WhatsApp: 0713 625 575 | 0794 584 404", icon: Sparkles },
  { text: "We Deliver countrywide", icon: Truck },
  { text: "Comes Boxed & Well Packed", icon: Package },
  { text: "Tested, trusted and approved", icon: Star },
  { text: "Order and Pay on delivery", icon: Tag },
];

export const cartTrustFeatures = [
  { text: "We Deliver countrywide", icon: Truck },
  { text: "Genuine quality", icon: CheckCircle },
  { text: "Tested, trusted and approved", icon: ShieldCheck },
  { text: "Order and Pay on delivery", icon: Package },
];

export const footerQuickShopLinks = [
  { label: "Sneakers", href: "/shop?type=sneakers" },
  { label: "Soccer Cleats", href: "/shop?type=soccer-cleats" },
  { label: "Official Shoes", href: "/shop?category=official-shoes" },
  { label: "Opens & Sandals", href: "/shop?category=opens-sandals" },
];

export const footerSupportLinks = [
  { label: "How to Order", href: "/policies#how-to-order" },
  { label: "Delivery Info", href: "/policies#delivery" },
  { label: "Size Guide", href: "/policies#size-guide" },
  { label: "Returns & Exchanges", href: "/policies#returns" },
  { label: "FAQ", href: "/policies#faq" },
];