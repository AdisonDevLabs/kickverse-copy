// lib/data/categories.ts

export interface Category {
  name: string;
  slug: string;
  label?: string;
  image: string;
  span?: string;
}

// These act as fallbacks if the database is empty
export const categories: Category[] = [
  {
    name: "Official Shoes",
    slug: "official-shoes",
    label: "Trending Now",
    image: "/Minimalist All-White Derbies.png",
    span: "md:col-span-2",
  },
  {
    name: "Opens & Sandals",
    slug: "opens-sandals",
    label: "Best Sellers",
    image: "/Rugged Terrain Adventure Sandals.png",
    span: "md:col-span-2",
  },
  {
    name: "SNEAKERS",
    slug: "sneakers",
    label: "New Arrivals",
    image: "/Retro Low-Profile Trainers.png",
    span: "md:col-span-2",
  },
  {
    name: "Soccer Cleats",
    slug: "soccer-cleats",
    label: "Pitch Ready",
    image: "/FIFA World Cup 2026 Splash Graphic Tee.jpg",
    span: "md:col-span-2",
  },
];

export const heroCategories = categories.slice(0, 5);

export const discoveryChips = [
  { id: 'trending', label: '🔥 Trending', context: 'Trending Styles' },
  { id: 'best-sellers', label: '⭐ Best Sellers', context: 'Best Sellers' },
  { id: 'just-dropped', label: '🆕 Just Dropped', context: 'New Arrivals' },
  { id: 'budget-picks', label: '💰 Budget Picks', context: 'Budget Friendly' },
  { id: 'premium-styles', label: '✨ Premium Styles', context: 'Premium Collection' },
];

// UPDATED: Now matches your actual inventory types for the Advanced Filter Drawer
export const filterCategories = [
  'All', 
  'Sneakers', 
  'Soccer Cleats', 
  'Official Shoes', 
  'Opens & Sandals', 
  'Jordan', 
  'Air Max'
];

// UPDATED: Fixes the search bar placeholder suggestions
export const searchSuggestions = [
  'Trending Sneakers', 
  'Soccer Cleats', 
  'Official Shoes', 
  'Sandals', 
  'Budget Picks'
];

// UPDATED: Fixes the mobile search menu quick links
export const navSearchSuggestions = ['Sneakers', 'Cleats', 'New Arrivals'];

export const navLinksData = [
  { label: "Home", href: "/", baseTextClass: "text-white", hoverTextClass: "hover:text-[#C6FF00]", underlineClass: "bg-[#C6FF00]", isLive: false },
  { label: "Shop", href: "/shop", baseTextClass: "text-white", hoverTextClass: "hover:text-[#C6FF00]", underlineClass: "bg-[#C6FF00]", isLive: false },
  { label: "New Drops", href: "/shop?category=new-arrivals", baseTextClass: "text-gray-400", hoverTextClass: "hover:text-white", underlineClass: "bg-white", isLive: false },
  { label: "Trending", href: "/shop?category=trending", baseTextClass: "text-gray-400", hoverTextClass: "hover:text-white", underlineClass: "bg-white", isLive: false },
  { label: "Deals", href: "/shop?category=deals", baseTextClass: "text-gray-400", hoverTextClass: "hover:text-[#FF0000]", underlineClass: "bg-[#FF0000]", isLive: true },
];

export const priceRanges = ['Under 2,000', '2,000 - 4,000', 'Over 4,000'];

export const filterSizes = ['34', '35', '36', '37', '38', '39', '40', '41', '42', '43', "44", "45"];