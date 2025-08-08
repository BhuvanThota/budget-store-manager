// src/components/landing/AddProductsAnimation.tsx
'use client';

import React, { useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { Apple, BookOpen, Shirt, Package, Plus, CheckCircle } from 'lucide-react';

const productIcons = [
  { icon: Apple, color: "text-red-500", name: "Apple" },
  { icon: BookOpen, color: "text-blue-500", name: "Book" },
  { icon: Shirt, color: "text-green-500", name: "Shirt" },
];

export default function AddProductsAnimation() {
  const containerControls = useAnimationControls();
  const iconControls = useAnimationControls();
  const boxControls = useAnimationControls();
  const successControls = useAnimationControls();

  useEffect(() => {
    const sequence = async () => {
      // Loop the animation
      while (true) {
        // Reset everything (including success elements)
        boxControls.set({ 
          scale: 1, 
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          borderColor: "#d1d5db"
        });
        successControls.set({ scale: 0, opacity: 0 }); // Ensure success elements are hidden initially
        
        // 1. Products appear and start orbiting (custom positions for each)
        await iconControls.start(i => ({
          opacity: 1,
          scale: 1,
          x: i === 0 ? -80 : i === 1 ? 0 : 80,    // Left, Center, Right
          y: i === 0 ? 0 : i === 1 ? -80 : 0,     // Center, Top, Center
          transition: { delay: i * 0.2, duration: 0.5, ease: "easeOut" }
        }));

        // 2. Start orbital motion
        containerControls.start({
          rotate: 360,
          transition: { duration: 4, ease: "linear" }
        });
        
        await iconControls.start(i => ({
          rotate: -360, // Counter-rotate to keep icons upright
          transition: { delay: i * 0.1, duration: 4, ease: "linear" }
        }));
        
        // 3. Box anticipation (slight pulsing)
        boxControls.start({
          scale: [1, 1.05, 1],
          boxShadow: [
            "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            "0 20px 25px -5px rgba(59, 130, 246, 0.3)",
            "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
          ],
          borderColor: ["#d1d5db", "#3b82f6", "#d1d5db"],
          transition: { duration: 2, repeat: 1 }
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 4. Products get sucked into the box with stagger
        containerControls.stop();
        await iconControls.start(i => ({
          x: 0,
          y: 0,
          scale: [1, 0.3, 0],
          opacity: [1, 1, 0],
          rotate: 0,
          transition: { 
            duration: 0.8, 
            delay: i * 0.2,
            ease: [0.4, 0, 0.2, 1] // Custom easing for satisfying feel
          }
        }));

        // 5. Box celebration
        await boxControls.start({
          scale: [1, 1.1, 1],
          boxShadow: [
            "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            "0 25px 50px -12px rgba(34, 197, 94, 0.4)",
            "0 10px 15px -3px rgba(34, 197, 94, 0.2)"
          ],
          borderColor: ["#d1d5db", "#22c55e", "#22c55e"],
          transition: { duration: 0.6 }
        });

        // 6. Success checkmark appears
        await successControls.start({
          scale: [0, 1.3, 1],
          opacity: 1,
          transition: { duration: 0.5, stiffness: 300 }
        });

        // 7. Hold success state
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 8. Reset for next loop (spread them out to different positions)
        containerControls.set({ rotate: 0 });
        iconControls.set(i => ({
          opacity: 0,
          scale: 0,
          x: i === 0 ? -80 : i === 1 ? 0 : 80,    // Left, Center, Right
          y: i === 0 ? 0 : i === 1 ? -80 : 0,     // Center, Top, Center
          rotate: 0
        }));
      }
    };
    sequence();
  }, [containerControls, iconControls, boxControls, successControls]);

  return (
    <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-3 left-3 w-3 h-3 bg-blue-400 rounded-full"></div>
        <div className="absolute top-8 right-6 w-2 h-2 bg-indigo-400 rounded-full"></div>
        <div className="absolute bottom-6 left-8 w-4 h-4 bg-purple-400 rounded-full"></div>
        <div className="absolute bottom-3 right-3 w-2 h-2 bg-blue-400 rounded-full"></div>
        <div className="absolute top-1/2 left-2 w-1 h-1 bg-indigo-400 rounded-full"></div>
        <div className="absolute top-1/4 right-4 w-1 h-1 bg-purple-400 rounded-full"></div>
      </div>

      {/* Floating Plus Icons for Context */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-4 h-4 text-blue-300 opacity-60"
          style={{
            left: `${15 + i * 20}%`,
            top: `${20 + (i % 2) * 50}%`,
          }}
          animate={{
            y: [-10, -20, -10],
            opacity: [0.4, 0.8, 0.4],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 3,
            delay: i * 0.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Plus size={16} />
        </motion.div>
      ))}

      {/* Central Package Box */}
      <motion.div 
        className="relative z-10"
        animate={boxControls}
      >
        <motion.div
          className="w-20 h-20 bg-white rounded-2xl shadow-lg border-2 flex items-center justify-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)"
          }}
        >
          {/* Box Inner Shadow for Depth */}
          <div className="absolute inset-1 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl opacity-50"></div>
          
          {/* Package Icon */}
          <Package size={32} className="text-blue-500 relative z-10 drop-shadow-sm" />
          
          {/* Success Checkmark Overlay - starts completely hidden */}
          <motion.div
            className="absolute inset-0 bg-green-500 rounded-2xl flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={successControls}
          >
            <CheckCircle size={32} className="text-white drop-shadow-lg" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Orbiting Products */}
      <motion.div 
        className="absolute w-full h-full" 
        animate={containerControls}
      >
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
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1 }}
            >
              {/* Product Glow Effect */}
              <div className={`absolute inset-0 rounded-full blur-md opacity-60 ${
                p.color.includes('red') ? 'bg-red-400' :
                p.color.includes('blue') ? 'bg-blue-400' : 'bg-green-400'
              }`}></div>
              
              {/* Product Icon */}
              <motion.div
                className="relative z-10 bg-white rounded-full p-2 shadow-lg border-2 border-white"
                animate={{
                  y: [0, -3, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <p.icon size={24} className={`${p.color} drop-shadow-sm`} />
              </motion.div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Loading Dots Indicator */}
      <motion.div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-blue-400 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1,
              delay: i * 0.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>

      {/* "Adding..." Text */}
      <motion.div
        className="absolute top-3 left-3 text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 1, 1, 0],
          opacity: [0, 1, 1, 0]
        }}
        transition={{
          duration: 4,
          delay: 1,
          repeat: Infinity,
          repeatDelay: 3
        }}
      >
        Adding...
      </motion.div>

      {/* Success Badge - starts hidden and only shows after success */}
      <motion.div
        className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1"
        initial={{ scale: 0, opacity: 0 }}
        animate={successControls}
      >
        <CheckCircle size={12} />
        Added!
      </motion.div>
    </div>
  );
}