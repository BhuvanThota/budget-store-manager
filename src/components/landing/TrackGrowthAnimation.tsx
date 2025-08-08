// src/components/landing/TrackGrowthAnimation.tsx
'use client';

import React, { useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { TrendingUp, BarChart3, Eye, Target } from 'lucide-react';

const chartData = [
  { height: 40, color: "bg-blue-500", delay: 0 },
  { height: 60, color: "bg-green-500", delay: 0.1 },
  { height: 50, color: "bg-purple-500", delay: 0.2 },
  { height: 80, color: "bg-orange-500", delay: 0.3 },
  { height: 70, color: "bg-red-500", delay: 0.4 },
];

export default function TrackGrowthAnimation() {
  const barsControls = useAnimationControls();
  const trendLineControls = useAnimationControls();
  const insightsControls = useAnimationControls();
  const eyeControls = useAnimationControls();

  useEffect(() => {
    const sequence = async () => {
      while (true) {
        // Reset everything
        barsControls.set({ height: 0, opacity: 0 });
        trendLineControls.set({ pathLength: 0, opacity: 0 });
        insightsControls.set({ scale: 0, opacity: 0 });
        eyeControls.set({ scale: 1, opacity: 0.6 });

        // 1. Eye icon appears (watching/analyzing)
        await eyeControls.start({
          opacity: 1,
          transition: { duration: 0.5, ease: "easeOut" }
        });

        // 2. Bars grow with stagger
        await barsControls.start(i => ({
          height: `${chartData[i].height}%`,
          opacity: 1,
          transition: { 
            duration: 0.8, 
            delay: chartData[i].delay,
            ease: "easeOut" 
          }
        }));

        // 3. Trend line draws across
        await trendLineControls.start({
          pathLength: 1,
          opacity: 1,
          transition: { duration: 1.2, ease: "easeInOut" }
        });

        // 4. Eye transforms to insights with celebration
        await eyeControls.start({
          scale: 0,
          opacity: 0,
          transition: { duration: 0.3, ease: "easeIn" }
        });

        await insightsControls.start({
          scale: 1,
          opacity: 1,
          transition: { duration: 0.5, ease: "easeOut" }
        });

        // 5. Bars pulse to show they're "alive" with data
        barsControls.start(i => ({
          scale: [1, 1.05, 1],
          transition: {
            duration: 0.8,
            delay: i * 0.1,
            ease: "easeInOut"
          }
        }));

        // 6. Hold the view
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 7. Brief fade out before restart
        await Promise.all([
          barsControls.start({ opacity: 0.3, transition: { duration: 0.5 } }),
          trendLineControls.start({ opacity: 0.3, transition: { duration: 0.5 } }),
          insightsControls.start({ opacity: 0.3, transition: { duration: 0.5 } })
        ]);

        await new Promise(resolve => setTimeout(resolve, 500));
      }
    };
    
    sequence();
  }, [barsControls, trendLineControls, insightsControls, eyeControls]);

  return (
    <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-2 left-2 w-3 h-3 bg-emerald-400 rounded-full"></div>
        <div className="absolute top-6 right-4 w-2 h-2 bg-teal-400 rounded-full"></div>
        <div className="absolute bottom-4 left-6 w-4 h-4 bg-cyan-400 rounded-full"></div>
        <div className="absolute bottom-2 right-2 w-2 h-2 bg-emerald-400 rounded-full"></div>
        <div className="absolute top-1/2 right-8 w-1 h-1 bg-teal-400 rounded-full"></div>
        <div className="absolute top-1/4 left-8 w-1 h-1 bg-cyan-400 rounded-full"></div>
      </div>

      {/* Floating Analytics Icons */}
      {[Target, BarChart3].map((Icon, i) => (
        <motion.div
          key={i}
          className="absolute w-4 h-4 text-teal-300 opacity-50"
          style={{
            left: `${20 + i * 50}%`,
            top: `${15 + i * 60}%`,
          }}
          animate={{
            y: [-8, -16, -8],
            opacity: [0.3, 0.7, 0.3],
            rotate: [0, 360]
          }}
          transition={{
            duration: 4,
            delay: i * 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Icon size={16} />
        </motion.div>
      ))}

      {/* Main Chart Container */}
      <div className="relative w-32 h-24 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-3">
        {/* Chart Bars */}
        <div className="flex items-end justify-between h-full gap-1">
          {chartData.map((bar, i) => (
            <motion.div
              key={i}
              className={`w-4 ${bar.color} rounded-t-sm relative overflow-hidden`}
              custom={i}
              animate={barsControls}
              style={{ height: 0 }}
            >
              {/* Bar shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-transparent to-white/30"
                animate={{
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.2 + 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Trend Line SVG Overlay */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 60"
          style={{ transform: 'scaleY(-1)' }} // Flip to make line go up
        >
          <motion.path
            d="M 15 25 Q 30 15 45 20 Q 60 10 75 5 Q 85 8 90 12"
            stroke="#10b981"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="2 2"
            animate={trendLineControls}
          />
        </svg>

        {/* Growth Percentage Indicator */}
        <motion.div
          className="absolute -top-6 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1"
          animate={insightsControls}
        >
          <TrendingUp size={10} />
          +23%
        </motion.div>
      </div>

      {/* Analyzing Eye Icon (transforms to insights) */}
      <motion.div
        className="absolute top-4 left-4 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center border border-white/50"
        animate={eyeControls}
      >
        <Eye size={16} className="text-teal-600" />
      </motion.div>

      {/* Insights Badge (appears after analysis) */}
      <motion.div
        className="absolute top-4 left-4 w-8 h-8 bg-teal-500 rounded-full shadow-md flex items-center justify-center"
        animate={insightsControls}
      >
        <BarChart3 size={16} className="text-white" />
      </motion.div>

      {/* Data Points Floating Around */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-teal-400 rounded-full"
          style={{
            left: `${25 + i * 15}%`,
            top: `${60 + (i % 2) * 20}%`,
          }}
          animate={{
            y: [-15, -25, -15],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2.5,
            delay: 1.5 + i * 0.3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Loading Dots for Analysis */}
      <motion.div
        className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1"
        animate={{
          opacity: [1, 0]
        }}
        transition={{
          duration: 3,
          delay: 2,
          repeat: Infinity,
          repeatDelay: 2
        }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 h-1 bg-teal-400 rounded-full"
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

      {/* "Analyzing..." Text */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-teal-600 bg-teal-100 px-3 py-1 rounded-full"
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0.9, 1, 1, 0.9]
        }}
        transition={{
          duration: 4,
          delay: 0.5,
          repeat: Infinity,
          repeatDelay: 2
        }}
      >
        Analyzing...
      </motion.div>

      {/* Success Insights Badge */}
      <motion.div
        className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1"
        animate={insightsControls}
      >
        <TrendingUp size={12} />
        Insights!
      </motion.div>
    </div>
  );
}