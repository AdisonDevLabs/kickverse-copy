// lib/data/brand.ts
import { Truck, Package, Star, Sparkles, Tag, CheckCircle, ShieldCheck } from 'lucide-react';

export const brand = {
  name: "KICKVERSE KE",
  url: "https://kickverse.co.ke",
  shortName: "KICKVERSE",
  logo: "/kickverse.png",
  logo1: "/android-chrome-512x512.png",
  tagline: "PREMIUM SNEAKERS, SOCCER CLEATS & OFFICIAL SHOES IN NAIROBI",
  description:
    "Leading online footwear store in Nairobi, Kenya. Shop original sneakers, professional artificial turf soccer cleats, pure leather official shoes, and casual clogs with complimentary Nairobi CBD delivery and pay on delivery.",
  location: "Nairobi, Kenya",
  seo: {
    title: "Kickverse KE | Premium Sneakers, Soccer Cleats & Official Shoes in Nairobi, Kenya",
    description: "Buy original sneakers, artificial turf soccer cleats (TF/AG/FG), pure leather official shoes, and casual sandals in Nairobi, Kenya. Enjoy free Nairobi CBD delivery, countrywide shipping, and secure pay on delivery.",
    ogImage: "/kickverse.png",
    favicon: "/favicon.ico",
    appleIcon: "/apple-touch-icon.png",
  },

  hero: {
    badge: "Tested, Trusted & Approved in Nairobi",
    headlineTop: "HOME OF THE BEST",
    headlineHighlight: "SNEAKERS & CLEATS",
    backgroundImage: "/background-image7.jpeg",
    sneakersImage: "/sneakers.jpg",
    soccerCleatsImage: "/soccer-cleats.jpg",
    officialsImage: "/officials.jpg",
    opensSandalsImage: "/opens-sandals.jpg",
    ctaPrimary: "Order on WhatsApp",
    ctaSecondary: "Shop Collection",
  },

  sections: {
    featured: {
      title: "Featured Footwear Collection",
      subtitle: "Browse our curated selection of original sneakers, turf cleats, and pure leather official shoes in Nairobi."
    },
    flashDeals: {
      badge: "Limited Time Offers",
      title: "Flash Deals on Trending Footwear",
      subtitle: "Grab your favorite sneaker and cleat styles before they are gone — best prices in Kenya.",
      cta: "View All Deals"
    },
    newArrivals: {
      badge: "Updated Weekly",
      title: "Trending Men's & Women's Footwear in Nairobi",
      subtitle: "Fresh sneaker drops, artificial turf football boots, and official shoes added weekly in Kenya.",
      cta: "View All Arrivals",
      trendingBadgePrefix: "Trending in"
    },
    bestSellers: {
      badge: "Customer Favorites",
      title: "Nairobi Best Sellers",
      subtitle: "Top-rated original sneakers and soccer cleats tested, trusted, and approved by happy customers across Kenya.",
      cta: "View All Favorites"
    },
    whyUs: {
      badge: "Trust & Reliability",
      titleTop: "WHY BUY FOOTWEAR FROM",
      subtitle: "Authentic quality, genuine leather, artificial turf studs, and verified pay on delivery across Nairobi."
    },
    reviews: {
      badge: "100% Verified Customer Reviews",
      titleTop: "WHAT OUR",
      titleBottom: "CUSTOMERS SAY"
    },
    whatsappCta: {
      badge: "We Are Online",
      titleTop: "START YOUR",
      titleBottom: "ORDER NOW",
      subtitle: "Chat directly with our Nairobi sales team on WhatsApp to confirm size, stock, and instant CBD dispatch."
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
    tiktok: "https://www.tiktok.com/@kickverse_",
    tiktokBootRoom: "https://www.tiktok.com/@bootroomkenya",
    tiktokSoleKraft: "https://www.tiktok.com/@solekraft",
    whatsappCommunity: "https://chat.whatsapp.com/DZMzWpLnP9WDFjZ4PCrENq"
  },
  deliveryInfo: {
    standard: "Fast doorstep delivery across Nairobi environs and reliable countrywide parcel dispatch.",
    nairobi: "Complimentary same-day delivery exclusively within the Nairobi CBD boundaries.",
  },
  trustStatements: [
    "Countrywide Delivery Across Kenya",
    "100% Genuine Quality Footwear",
    "Pay on Delivery in Nairobi",
    "Tested, Trusted and Approved",
  ],
  features: [
    {
      title: "100% Genuine Quality",
      description: "Curated collection of original streetwear sneakers, turf soccer boots, and pure leather official shoes."
    },
    {
      title: "Countrywide Kenya Delivery",
      description: "Fast, reliable parcel delivery to all major towns and estates across Kenya."
    },
    {
      title: "Free Nairobi CBD Delivery",
      description: "Enjoy complimentary, expedited delivery exclusively within the Nairobi CBD boundaries."
    },
    {
      title: "Pay After Delivery",
      description: "Order with confidence and pay upon delivery in Nairobi and surrounding metropolitan areas."
    }
  ],
  whatsappTrustSignals: [
    "Fast Countrywide Delivery",
    "100% Genuine Quality",
    "Tested, Trusted & Approved",
    "Pay on Delivery Available"
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
  salesCallout: "Tested, Trusted & Approved in Kenya"
};

export const announcementMessages = [
  { text: "Call / WhatsApp: 0713 625 575 | 0794 584 404", icon: Sparkles },
  { text: "We Deliver countrywide", icon: Truck },
  { text: "Comes Boxed & Well Packed", icon: Package },
  { text: "Tested, Trusted & Approved Footwear", icon: Star },
  { text: "Order & Pay on Delivery in Nairobi", icon: Tag },
];

export const cartTrustFeatures = [
  { text: "Fast Countrywide Delivery", icon: Truck },
  { text: "100% Genuine Quality", icon: CheckCircle },
  { text: "Tested, Trusted & Approved", icon: ShieldCheck },
  { text: "Pay on Delivery in Nairobi", icon: Package },
];

export const footerQuickShopLinks = [
  { label: "Sneakers", href: "/shop?type=sneakers" },
  { label: "Soccer Cleats", href: "/shop?type=soccer-cleats" },
  { label: "Official Shoes", href: "/shop?type=official-shoes" },
  { label: "Opens & Sandals", href: "/shop?type=opens-sandals" },
];

export const footerSupportLinks = [
  { label: "How to Order", href: "/policies#how-to-order" },
  { label: "Delivery Info", href: "/policies#delivery" },
  { label: "Size Guide", href: "/policies#size-guide" },
  { label: "Returns & Exchanges", href: "/policies#returns" },
  { label: "FAQ", href: "/policies#faq" },
];