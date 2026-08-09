'use client';

import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "motion/react";

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
}

export default function AnimatedCounter({ value, decimals = 0 }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const motionValue = useMotionValue(0);
  
  const springValue = useSpring(motionValue, { 
    damping: 50, 
    stiffness: 100,
    restDelta: 0.001
  });
  
  const displayValue = useTransform(springValue, (current) => 
    current.toFixed(decimals)
  );

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, motionValue, value]);

  return <motion.span ref={ref}>{displayValue}</motion.span>;
}