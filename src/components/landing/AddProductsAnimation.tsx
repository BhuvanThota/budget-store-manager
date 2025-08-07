// src/components/landing/AddProductsAnimation.tsx
'use client';

import React, { useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { Apple, BookOpen, Shirt, Package } from 'lucide-react';

const productIcons = [
  { icon: Apple, color: "text-red-500" },
  { icon: BookOpen, color: "text-blue-500" },
  { icon: Shirt, color: "text-green-500" },
];

export default function AddProductsAnimation() {
  const containerControls = useAnimationControls();
  const iconControls = useAnimationControls();

  useEffect(() => {
    const sequence = async () => {
      // Loop the animation
      while (true) {
        // 1. Start circling
        containerControls.start({
          rotate: 360,
          transition: { duration: 4, ease: "linear" }
        });
        
        await iconControls.start(i => ({
          opacity: 1,
          scale: 1,
          rotate: -360,
          transition: { delay: i * 0.2, duration: 4, ease: "linear" }
        }));
        
        // Wait 3 seconds
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 2. Stop circling and go into the box
        containerControls.stop();
        await iconControls.start(i => ({
            x: 0,
            y: 0,
            scale: 0,
            opacity: 0.5,
            rotate: 0,
            transition: { duration: 0.5, ease: "easeIn", delay: i * 0.3 }
        }));
        
        // Wait 1seconds
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3. Reset for the next loop (instant)
        containerControls.set({ rotate: 0 });
        iconControls.set(i => ({
            opacity: 0,
            scale: 0,
            y: -70, // Reset to orbit radius
            x: (i - 1) * 70 // Spread them out horizontally
        }));
      }
    };
    sequence();
  }, [containerControls, iconControls]);

  return (
    <>
      <Package size={64} className="text-gray-300bg-brand-primary rounded-full p-2" />
      <motion.div className="absolute w-full h-full" animate={containerControls}>
        {productIcons.map((p, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: `calc(50% - 16px)`,
              left: `calc(50% - 16px)`,
            }}
            custom={i}
            animate={iconControls}
          >
            <p.icon size={32} className={p.color} />
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}