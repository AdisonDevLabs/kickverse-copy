// lib/animations.ts

import { Variants } from 'motion/react';

// Explicitly type as a tuple of 4 numbers to satisfy Framer Motion's Easing type
const premiumEasing: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: premiumEasing } 
  }
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.8, ease: premiumEasing } 
  }
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.8, ease: premiumEasing } 
  }
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.8, ease: premiumEasing } 
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.8, ease: premiumEasing } 
  }
};

export const imageReveal: Variants = {
  hidden: { opacity: 0, scale: 1.05, filter: 'blur(10px)' },
  visible: { 
    opacity: 1, 
    scale: 1, 
    filter: 'blur(0px)',
    transition: { duration: 1.2, ease: premiumEasing } 
  }
};

export const heroReveal: Variants = {
  hidden: { y: "100%" },
  visible: { 
    y: 0, 
    transition: { duration: 1.2, ease: premiumEasing } 
  }
};

// Container to trigger children stagger naturally
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    }
  }
};

// Children item that reacts to staggerContainer
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: premiumEasing } 
  }
};

// Interactive / Hover States (use with whileHover)
export const hoverLift = {
  y: -5,
  transition: { duration: 0.4, ease: premiumEasing }
};

export const hoverScale = {
  scale: 1.03,
  transition: { duration: 0.4, ease: premiumEasing }
};

export const magneticButton = {
  transition: { type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }
};