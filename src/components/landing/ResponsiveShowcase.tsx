// src/components/landing/ResponsiveShowcase.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Monitor, Smartphone, Wifi, Shield, Zap } from 'lucide-react';

const features = [
  {
    icon: Monitor,
    title: "Desktop Ready",
    description: "Full-featured dashboard for comprehensive management and detailed analytics",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Manage your shop on the go, anywhere, anytime with full functionality",
    color: "text-green-600",
    bgColor: "bg-green-50"
  }
];

export default function ResponsiveShowcase() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-white to-brand-background relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-40">
        <div className="absolute top-32 right-20 w-64 h-64 bg-gradient-to-br from-brand-primary/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-16 w-48 h-48 bg-gradient-to-br from-brand-accent/10 to-pink-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-2xl"></div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 relative">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 lg:mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-brand-primary/20 shadow-sm mb-6">
            <Wifi className="w-4 h-4 text-brand-primary" />
            <span className="text-sm font-semibold text-brand-primary">Cross-Platform</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-text mb-6 leading-tight">
            Manage Your Shop,{' '}
            <span className="bg-gradient-to-r from-brand-primary via-brand-accent to-brand-primary bg-clip-text text-transparent">
              Anywhere
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Whether you&apos;re at the counter, in the back office, or on the go, your shop&apos;s data is always at your fingertips with seamless synchronization.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Secure & Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Lightning Fast</span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-blue-500" />
              <span>Real-time Sync</span>
            </div>
          </div>
        </motion.div>

        {/* Device Showcase */}
        <div className="relative max-w-6xl mx-auto mb-16">
          {/* Desktop/Tablet Image - Main Focus */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            className="relative z-10"
          >
            <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-3 lg:p-4">
              {/* Browser Chrome */}
              <div className="flex items-center gap-3 mb-3 px-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 bg-gray-700 rounded-md px-3 py-1 text-gray-300 text-xs font-mono">
                  shop.yourdomain.com
                </div>
              </div>
              
              {/* Screen Content */}
              <div className="relative overflow-hidden rounded-xl lg:rounded-2xl">
                <Image
                  src="/POS_tablet.png"
                  alt="Desktop dashboard view"
                  width={1920}
                  height={1080}
                  className="w-full h-auto"
                  style={{ height: 'auto' }}
                />
                
                {/* Overlay Effects */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent"></div>
              </div>
            </div>

            {/* Floating Elements around Desktop */}
            <motion.div 
              className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-blue-200"
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 10, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <Monitor className="w-6 h-6 text-brand-primary" />
            </motion.div>
          </motion.div>
          
          {/* Mobile Device - Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -60, y: 40, scale: 0.8 }}
            whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 120 }}
            className="absolute -bottom-8 -left-8 lg:-bottom-12 lg:-left-12 w-1/3 max-w-[220px] z-20"
          >
            <div className="relative">
              {/* Phone Frame */}
              <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-2">
                {/* Notch */}
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-black rounded-full z-10"></div>
                
                {/* Screen */}
                <div className="relative overflow-hidden rounded-xl lg:rounded-2xl mt-1">
                  <Image
                    src="/dashboard_mobile.png"
                    alt="Mobile dashboard view"
                    width={400}
                    height={800}
                    className="w-full h-auto"
                    style={{ height: 'auto' }}
                  />
                </div>
              </div>

              {/* Mobile Floating Icon */}
              <motion.div 
                className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border-2 border-green-200"
                animate={{ 
                  scale: [1, 1.2, 1],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <Smartphone className="w-4 h-4 text-green-600" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
              className="group"
            >
              <div className={`relative overflow-hidden rounded-2xl ${feature.bgColor} border border-white/50 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 p-6`}>
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-brand-text transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 1, duration: 0.7 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-4 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full border border-brand-primary/20 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-gray-700">99.9% Uptime</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-gray-700">Real-time Sync</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}