// src/components/landing/VisualWorkflow.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import AddProductsAnimation from './AddProductsAnimation';
import MakeASaleAnimation from './MakeASaleAnimation';
import TrackGrowthAnimation from './TrackGrowthAnimation';

const steps = [
  {
    title: "Add Your Products",
    description: "Easily add all your items to a centralized inventory.",
    gradient: "from-blue-500 to-indigo-600",
    bgGradient: "from-blue-50 via-indigo-50 to-purple-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-600",
    number: "01"
  },
  {
    title: "Make a Sale",
    description: "Use the POS to sell products, which automatically updates your stock.",
    gradient: "from-green-500 to-emerald-600", 
    bgGradient: "from-green-50 via-emerald-50 to-teal-50",
    borderColor: "border-green-200",
    textColor: "text-green-600",
    number: "02"
  },
  {
    title: "Track Your Growth",
    description: "Instantly see your performance with simple, clear analytics.",
    gradient: "from-teal-500 to-cyan-600",
    bgGradient: "from-emerald-50 via-teal-50 to-cyan-50", 
    borderColor: "border-teal-200",
    textColor: "text-teal-600",
    number: "03"
  }
];

export default function VisualWorkflow() {
  return (
    <section className="py-16 lg:py-24 bg-brand-background relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 right-16 w-48 h-48 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 lg:mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200/50 shadow-sm mb-6">
            <Sparkles className="w-4 h-4 text-brand-primary" />
            <span className="text-sm font-semibold text-brand-primary">Simple Workflow</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-text mb-6 leading-tight">
            It&apos;s as Easy as{' '}
            <span className="bg-gradient-to-r from-brand-primary via-brand-accent to-brand-primary bg-clip-text text-transparent">
              1, 2, 3
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our streamlined workflow lets you focus on what matters most: growing your business and delighting your customers.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-6 items-start">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.2, duration: 0.7, type: "spring", stiffness: 100 }}
              className="group relative"
            >
              {/* Connection Arrow (hidden on mobile) */}
              {index < steps.length - 1 && (
                <motion.div 
                  className="hidden lg:flex absolute top-32 -right-3 z-10 w-6 h-6 items-center justify-center"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: index * 0.2 + 0.5, duration: 0.4 }}
                >
                  <div className="w-8 h-8 bg-white rounded-full shadow-lg border-2 border-gray-200 flex items-center justify-center group-hover:border-brand-primary transition-colors duration-300">
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-primary transition-colors duration-300" />
                  </div>
                </motion.div>
              )}

              {/* Step Card */}
              <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${step.bgGradient} border ${step.borderColor} shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 group-hover:scale-[1.02]`}>
                {/* Decorative Background Element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full transform translate-x-16 -translate-y-16"></div>
                
                {/* Step Number Badge */}
                <div className="absolute top-4 left-4 z-20">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform duration-300`}>
                    <span className="text-white font-bold text-lg">{step.number}</span>
                  </div>
                </div>

                {/* Success Indicator */}
                <motion.div 
                  className="absolute top-4 right-4 z-20"
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.2 + 1, duration: 0.4 }}
                >
                  <div className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border-2 border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </motion.div>

                {/* Animation Container */}
                <div className="relative w-full h-56 flex items-center justify-center overflow-hidden mb-6">
                  {index === 0 && <AddProductsAnimation />}
                  {index === 1 && <MakeASaleAnimation />}
                  {index === 2 && <TrackGrowthAnimation />}
                </div>

                {/* Content Section */}
                <div className="relative px-6 pb-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm">
                    <h3 className={`text-xl font-bold ${step.textColor} mb-2 group-hover:text-brand-text transition-colors duration-300`}>
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Call-to-Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.8, duration: 0.7 }}
          className="text-center mt-16 lg:mt-20"
        >
          <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full border border-brand-primary/20 shadow-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-brand-text font-semibold">Ready to streamline your business?</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}