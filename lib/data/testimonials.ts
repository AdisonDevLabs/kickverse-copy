// lib/data/testimonials.ts

export interface Testimonial {
  id: string | number;
  name: string;
  location?: string;
  rating: number;
  text: string;
  product?: string;
  profile: string;
  date?: string;
  purchased?: boolean;
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Mary W. – Nairobi",
    location: "Nairobi",
    rating: 5,
    text: "The shoes are exactly like the pictures. Very comfortable and delivery was fast.",
    product: "Black Heels",
    profile: "https://picsum.photos/seed/mary/150/150",
  },
  {
    id: 2,
    name: "Grace M. – Mombasa",
    location: "Mombasa",
    rating: 5,
    text: "I ordered via WhatsApp and received my pair the next day. Great service!",
    product: "White Sneakers",
    profile: "https://picsum.photos/seed/grace/150/150",
  },
  {
    id: 3,
    name: "Faith K. – Kisumu",
    location: "Kisumu",
    rating: 5,
    text: "Good quality and affordable. I will definitely order again. The sizing was perfect.",
    product: "Office Loafers",
    profile: "https://picsum.photos/seed/faith/150/150",
  },
];

export const productReviews: Testimonial[] = [
  {
    id: 1,
    name: "Mary W.",
    location: "Nairobi",
    rating: 5,
    date: "2 weeks ago",
    text: "The quality exceeded my expectations. So comfortable for office wear and they look exactly like the pictures.",
    purchased: true,
    profile: "https://picsum.photos/seed/mary/150/150",
  },
  {
    id: 2,
    name: "Sarah J.",
    location: "Mombasa",
    rating: 4,
    date: "1 month ago",
    text: "Love the design and fast delivery. Fits perfectly.",
    purchased: true,
    profile: "https://picsum.photos/seed/sarah/150/150",
  },
];

export const reviewAvatars = [
  "https://picsum.photos/seed/user1/100/100",
  "https://picsum.photos/seed/user2/100/100",
  "https://picsum.photos/seed/user3/100/100"
];

export const reviewStats = {
  averageRating: "4.8/5 Average Rating",
  totalCustomers: "500+ Happy Customers"
};