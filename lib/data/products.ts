// lib/data/products.ts

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  rating: number;
  reviews: number;
  sizes: string[];
  colors: string[];
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isFlashDeal?: boolean;
  description: string;
}

export const products: Product[] = [
  {
    "id": "p1",
    "name": "Minimalist All-White Derbies",
    "price": 3200,
    "originalPrice": 4500,
    "image": "/Minimalist All-White Derbies.png",
    "images": ["/Minimalist All-White Derbies.png"],
    "category": "Men's Shoes",
    "rating": 4.8,
    "reviews": 24,
    "sizes": ["40", "41", "42", "43", "44"],
    "colors": ["White"],
    "isNewArrival": true,
    "isBestSeller": false,
    "isFlashDeal": false,
    "description": "Clean, crisp, and effortless. These matte white lace-ups bring a sharp, contemporary edge to classic formal wear. Perfect for when you want to look polished without looking like you tried too hard."
  },
  {
    "id": "p2",
    "name": "Pearl & Rhinestone Luxury Statement Heels",
    "price": 5500,
    "originalPrice": 7500,
    "image": "/Pearl & Rhinestone Luxury Statement Heels.png",
    "images": ["/Pearl & Rhinestone Luxury Statement Heels.png", "/Pearl & Rhinestone Luxury Statement Heels1.png", "/Pearl & Rhinestone Luxury Statement Heels2.png"],
    "category": "Women's Heels",
    "rating": 5.0,
    "reviews": 12,
    "sizes": ["36", "37", "38", "39", "40"],
    "colors": ["Cream/Silver"],
    "isNewArrival": true,
    "isBestSeller": true,
    "isFlashDeal": false,
    "description": "Pure elegance for a special day. These stunning heels are heavily detailed with delicate pearls, tiny floral accents, and a show-stopping crystal peacock design along the side. Absolute head-turners for weddings or major events."
  },
  {
    "id": "p3",
    "name": "Rugged Terrain Adventure Sandals",
    "price": 2400,
    "originalPrice": 3500,
    "image": "/Rugged Terrain Adventure Sandals.png",
    "images": ["/Rugged Terrain Adventure Sandals.png"],
    "category": "Unisex Sandals",
    "rating": 4.5,
    "reviews": 42,
    "sizes": ["38", "39", "40", "41", "42"],
    "colors": ["Grey/Teal/Yellow"],
    "isNewArrival": false,
    "isBestSeller": false,
    "isFlashDeal": true,
    "description": "Built for comfort on the move. These combine the breathability of a sandal with the tough, grippy sole of a sneaker. Featuring a bold teal-accented sole and adjustable straps, they're ready for long walks or casual weekend hangs."
  },
  {
    "id": "p4",
    "name": "Retro Low-Profile Trainers",
    "price": 2800,
    "originalPrice": 4000,
    "image": "/Retro Low-Profile Trainers.png",
    "images": ["/Retro Low-Profile Trainers.png"],
    "category": "Sneakers",
    "rating": 4.7,
    "reviews": 88,
    "sizes": ["39", "40", "41", "42", "43", "44"],
    "colors": ["Black/Gum"],
    "isNewArrival": false,
    "isBestSeller": true,
    "isFlashDeal": false,
    "description": "A timeless classic that goes with absolutely any outfit. They feature a sleek dark upper, a clean white midsole, and a grippy, serrated gum sole. Lightweight, comfortable, and perfect for daily wear."
  },
  {
    "id": "p5",
    "name": "Floral Embroidered Mesh Mules",
    "price": 3000,
    "originalPrice": 4200,
    "image": "/Floral Embroidered Mesh Mules.png",
    "images": ["/Floral Embroidered Mesh Mules.png"],
    "category": "Women's Heels",
    "rating": 4.6,
    "reviews": 19,
    "sizes": ["36", "37", "38", "39", "40"],
    "colors": ["Beige/Orange"],
    "isNewArrival": true,
    "isBestSeller": false,
    "isFlashDeal": false,
    "description": "Soft, feminine, and uniquely stylish. These pointed-toe mules pair delicate orange and white floral embroidery on a sheer mesh upper with a trendy clear strap for a secure fit. Perfect for brunch or outdoor afternoon events."
  },
  {
    "id": "p6",
    "name": "Mustard Yellow Knit Slip-Ons",
    "price": 2500,
    "originalPrice": 3800,
    "image": "/Mustard Yellow Knit Slip-Ons.png",
    "images": ["/Mustard Yellow Knit Slip-Ons.png"],
    "category": "Sneakers",
    "rating": 4.9,
    "reviews": 65,
    "sizes": ["37", "38", "39", "40", "41", "42"],
    "colors": ["Mustard Yellow"],
    "isNewArrival": false,
    "isBestSeller": true,
    "isFlashDeal": false,
    "description": "Add a bold pop of color to your rotation. These ultra-lightweight, breathable knit sneakers hug your feet like a sock, while the chunky white cushioned sole keeps you comfortable from morning to night."
  },
  {
    "id": "p7",
    "name": "Metallic Cap-Toe White Oxfords",
    "price": 3500,
    "originalPrice": 5000,
    "image": "/Metallic Cap-Toe White Oxfords.png",
    "images": ["/Metallic Cap-Toe White Oxfords.png"],
    "category": "Men's Shoes",
    "rating": 4.4,
    "reviews": 15,
    "sizes": ["40", "41", "42", "43"],
    "colors": ["White/Silver"],
    "isNewArrival": true,
    "isBestSeller": false,
    "isFlashDeal": false,
    "description": "Classic tailoring meets a futuristic twist. These white smart shoes feature a brilliant metallic silver cap-toe with subtle brogue detailing along the seams. Ideal for anyone looking to stand out at a formal gathering."
  },
  {
    "id": "p8",
    "name": "Silver Mesh Casual Flats",
    "price": 1800,
    "originalPrice": 2500,
    "image": "/Silver Mesh Casual Flats.png",
    "images": ["/Silver Mesh Casual Flats.png", "/Silver Mesh Casual Flats1.png"],
    "category": "Women's Flats",
    "rating": 4.3,
    "reviews": 31,
    "sizes": ["36", "37", "38", "39", "40", "41"],
    "colors": ["Grey/Silver"],
    "isNewArrival": false,
    "isBestSeller": false,
    "isFlashDeal": true,
    "description": "Lightweight and flexible for busy days on your feet. These breathable mesh flats feature a secure top strap and a durable textured outsole, giving you a perfect blend of casual ease and reliable support."
  },
  {
    "id": "p9",
    "name": "Premium Black Leather Split-Toe Sandals",
    "price": 4500,
    "originalPrice": 6000,
    "image": "/Premium Black Leather Split-Toe Sandals.png",
    "images": ["/Premium Black Leather Split-Toe Sandals.png"],
    "category": "Unisex Sandals",
    "rating": 4.8,
    "reviews": 18,
    "sizes": ["38", "39", "40", "41", "42", "43"],
    "colors": ["Black"],
    "isNewArrival": true,
    "isBestSeller": false,
    "isFlashDeal": false,
    "description": "Bold, high-fashion, and unmistakably unique. These premium black leather sandals feature a distinct split-toe design and thick cross-straps with a secure ankle buckle. Perfect if you like your style to stand out from the crowd."
  },
  {
    "id": "p10",
    "name": "FIFA World Cup 2026 Splash Graphic Tee",
    "price": 1500,
    "originalPrice": 2200,
    "image": "/FIFA World Cup 2026 Splash Graphic Tee.jpg",
    "images": ["/FIFA World Cup 2026 Splash Graphic Tee.jpg", "/FIFA World Cup 2026 Splash Graphic Tee1.jpg", ""],
    "category": "Men's Clothing",
    "rating": 4.7,
    "reviews": 34,
    "sizes": ["S", "M", "L", "XL", "XXL"],
    "colors": ["White", "Black"],
    "isNewArrival": true,
    "isBestSeller": true,
    "isFlashDeal": false,
    "description": "Celebrate the beautiful game with this tournament-ready graphic tee. Featuring a vibrant explosion of global flags and soccer elements around the official 2026 emblem, its soft cotton build keeps you cool from the stands to the streets."
  },
  {
    "id": "p11",
    "name": "FIFA World Cup 2026 Host Country Trio Tee",
    "price": 1500,
    "originalPrice": 2200,
    "image": "/FIFA World Cup 2026 Host Country Trio Tee.jpg",
    "images": ["/FIFA World Cup 2026 Host Country Trio Tee.jpg"],
    "category": "Men's Clothing",
    "rating": 4.6,
    "reviews": 18,
    "sizes": ["S", "M", "L", "XL"],
    "colors": ["Black"],
    "isNewArrival": true,
    "isBestSeller": false,
    "isFlashDeal": false,
    "description": "Rep the historic three-nation tournament with pride. This sleek black tee showcases brushed flag graphics of Mexico, the United States, and Canada underneath bold 'WORLD CUP 2026' lettering. Perfect for dedicated football fans."
  },
  {
    "id": "p12",
    "name": "Slogan & Graphic Streetwear Tee Pack",
    "price": 1200,
    "originalPrice": 1800,
    "image": "/Slogan & Graphic Streetwear Tee Pack.jpg",
    "images": ["/Slogan & Graphic Streetwear Tee Pack.jpg"],
    "category": "Men's Clothing",
    "rating": 4.4,
    "reviews": 56,
    "sizes": ["M", "L", "XL", "XXL"],
    "colors": ["Red", "White", "Black", "Yellow"],
    "isNewArrival": false,
    "isBestSeller": true,
    "isFlashDeal": false,
    "description": "Make a bold statement with our collection of expressive graphic tees. From motivational self-growth quotes and faith-inspired prints to vintage Americana aesthetics, these crewnecks offer a comfortable fit with plenty of personality."
  },
  {
    "id": "p13",
    "name": "Nike Classic Core White T-Shirt",
    "price": 2500,
    "originalPrice": 3500,
    "image": "/Nike Classic Core White T-Shirt.jpg",
    "images": ["/Nike Classic Core White T-Shirt.jpg"],
    "category": "Men's Clothing",
    "rating": 4.9,
    "reviews": 120,
    "sizes": ["S", "M", "L", "XL", "XXL"],
    "colors": ["White"],
    "isNewArrival": false,
    "isBestSeller": true,
    "isFlashDeal": false,
    "description": "An absolute wardrobe essential. This premium Nike sportswear tee features a lightweight, breathable cotton blend decorated with the iconic embroidered Swoosh on the left chest. Built for effortless daily layering or gym sessions."
  }
];

export const getBestSellers = () => products.filter((p) => p.isBestSeller);
export const getNewArrivals = () => products.filter((p) => p.isNewArrival);
export const getFlashDeals = () => products.filter((p) => p.isFlashDeal);
export const getProductById = (id: string) => products.find((p) => p.id === id);

export const colorMap: Record<string, string> = {
  'Black': '#000000',
  'White': '#ffffff',
  'Red': '#ff0000',
  'Beige': '#f5f5dc',
  'Nude': '#e3bc9a',
  'Brown': '#8b4513',
  'Silver': '#c0c0c0',
  'Gold': '#ffd700',
  'Blue': '#0000ff',
  'Pink': '#ffc0cb'
};

export const sizeGuideData = [
  {eu: 36, uk: 3, us: 5, cm: 22.5},
  {eu: 37, uk: 4, us: 6, cm: 23.5},
  {eu: 38, uk: 5, us: 7, cm: 24},
  {eu: 39, uk: 6, us: 8, cm: 25},
  {eu: 40, uk: 7, us: 9, cm: 25.5},
  {eu: 41, uk: 8, us: 10, cm: 26.5},
  {eu: 42, uk: 9, us: 11, cm: 27},
];