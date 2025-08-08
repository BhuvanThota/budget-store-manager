// src/components/landing/MakeASaleAnimation.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shirt, IndianRupee } from 'lucide-react';

export default function MakeASaleAnimation() {
  return (
    <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-2 left-2 w-4 h-4 bg-green-400 rounded-full"></div>
        <div className="absolute top-6 right-4 w-2 h-2 bg-emerald-400 rounded-full"></div>
        <div className="absolute bottom-4 left-6 w-3 h-3 bg-teal-400 rounded-full"></div>
        <div className="absolute bottom-2 right-2 w-2 h-2 bg-green-400 rounded-full"></div>
      </div>

      {/* Modern POS Terminal (Responsive) */}
      <motion.div
        className="absolute inset-x-2 sm:inset-x-4 bottom-0 h-12 md:h-16 bg-gradient-to-r from-slate-800 to-slate-700 rounded-t-lg md:rounded-t-xl shadow-2xl border-t-2 md:border-t-4 border-green-500"
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-1.5 left-2 right-2 h-4 md:h-6 bg-slate-900 rounded-md flex items-center justify-center">
          <motion.div className="text-green-400 text-[8px] md:text-xs font-mono" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.3 }}>
            SALE COMPLETE ✓
          </motion.div>
        </div>
        <div className="absolute bottom-1 left-2 right-2 flex gap-1">{[1, 2, 3, 4].map((i) => (<motion.div key={i} className="w-2 h-1 md:w-3 md:h-2 bg-slate-600 rounded-sm" initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 0.6 + i * 0.1, duration: 0.2 }} />))}</div>
      </motion.div>

      {/* Product (Responsive Icon Size) */}
      <motion.div className="absolute z-10" initial={{ x: "-150%", y: 0, scale: 1, rotate: 0 }} whileInView={{ x: "150%", y: -10, scale: 0.8, rotate: 15 }} transition={{ duration: 3, delay: 0.5, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}>
        <div className="relative">
          <motion.div className="absolute -bottom-1 left-1 w-8 h-2 md:w-12 md:h-3 bg-gray-400 rounded-full opacity-30 blur-sm" animate={{ scaleX: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="relative" animate={{ y: [0, -4, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
            <div className="absolute inset-0 bg-green-400 rounded-full blur-md opacity-60"></div>
            <Shirt className="w-8 h-8 md:w-12 md:h-12 text-green-600 relative z-10 drop-shadow-lg" />
          </motion.div>
        </div>
      </motion.div>

      {/* Money/Payment (Responsive Icon Size) */}
      <motion.div className="absolute z-10" initial={{ x: "150%", y: 0, scale: 0.8, rotate: -15 }} whileInView={{ x: "-150%", y: 10, scale: 1, rotate: 0 }} transition={{ duration: 3, delay: 0.5, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}>
        <div className="relative">
          <motion.div className="absolute -bottom-1 left-1 w-8 h-2 md:w-12 md:h-3 bg-gray-400 rounded-full opacity-30 blur-sm" animate={{ scaleX: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}/>
          <motion.div className="relative" animate={{ y: [0, -4, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-60"></div>
            <IndianRupee className="w-8 h-8 md:w-12 md:h-12 text-yellow-600 relative z-10 drop-shadow-lg" />
          </motion.div>
        </div>
      </motion.div>

      {[...Array(6)].map((_, i) => (<motion.div key={i} className="absolute w-1 h-1 md:w-2 md:h-2 bg-green-400 rounded-full" style={{ left: `${20 + i * 12}%`, top: `${30 + (i % 2) * 20}%` }} animate={{ y: [-20, -40, -20], opacity: [0, 1, 0], scale: [0, 1, 0] }} transition={{ duration: 2, delay: 1 + i * 0.2, repeat: Infinity, repeatType: "loop" }} />))}
      
      {/* Central Exchange Icon (Responsive) */}
      <motion.div className="absolute inset-0 flex items-center justify-center" initial={{ scale: 0, rotate: -90 }} whileInView={{ scale: 1, rotate: 0 }} transition={{ delay: 1.2, duration: 0.5, type: "spring" }}>
        <motion.div className="w-12 h-12 md:w-16 md:h-16 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center border-2 border-green-200" animate={{ scale: [1, 1.1, 1], boxShadow: ["0 4px 6px -1px rgba(0, 0, 0, 0.1)", "0 20px 25px -5px rgba(34, 197, 94, 0.3)", "0 4px 6px -1px rgba(0, 0, 0, 0.1)"] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-4 h-4 md:w-6 md:h-6 text-green-600"><path d="M7 16L17 8M17 8H11M17 8V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 8L7 16M7 16H13M7 16V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></motion.div>
        </motion.div>
      </motion.div>

      <motion.div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-full shadow-md" initial={{ scale: 0, rotate: -45 }} whileInView={{ scale: 1, rotate: 0 }} animate={{ y: -2 }} transition={{ default: { type: "spring", stiffness: 200, delay: 2 }, y: { duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" } }}>SOLD!</motion.div>
    </div>
  );
}