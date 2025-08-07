'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Users, 
  DollarSign,
  ArrowRight,
  CheckCircle,
  AlertTriangle} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Mock data matching your actual dashboard
const mockStats = [
  { label: 'Revenue', value: '₹24,500', icon: DollarSign, bgColor: 'bg-yellow-50', textColor: 'text-yellow-600' },
  { label: 'Profit', value: '₹8,200', icon: TrendingUp, bgColor: 'bg-green-50', textColor: 'text-green-600' },
  { label: 'Orders', value: '156', icon: ShoppingCart, bgColor: 'bg-indigo-50', textColor: 'text-indigo-600' },
  { label: 'Products', value: '89', icon: Package, bgColor: 'bg-purple-50', textColor: 'text-purple-600' }
];

const mockLowStockItems = [
  { name: 'Premium Coffee', stock: 3 },
  { name: 'Energy Drink', stock: 1 },
  { name: 'Protein Bar', stock: 2 }
];

const chartData = [
  { day: 'Mon', orders: 12 },
  { day: 'Tue', orders: 18 },
  { day: 'Wed', orders: 8 },
  { day: 'Thu', orders: 24 },
  { day: 'Fri', orders: 32 },
  { day: 'Sat', orders: 28 },
  { day: 'Sun', orders: 16 }
];

const AnimatedDashboard = () => {
  const [currentView, setCurrentView] = useState(0);
  
  const views = [
    { name: 'Dashboard', bg: 'from-blue-50 to-indigo-100' },
    { name: 'Inventory', bg: 'from-purple-50 to-violet-100' },
    { name: 'Reports', bg: 'from-green-50 to-emerald-100' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentView((prev) => (prev + 1) % views.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Device Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative bg-white rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden"
        style={{ height: '420px' }}
      >
        {/* Your App's Navbar */}
        <div style={{ backgroundColor: '#3D74B6' }} className="text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-md flex items-center justify-center">
              <Package size={16} className="text-white" />
            </div>
            <span className="font-bold">Budget Shop Manager</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full"></div>
          </div>
        </div>

        {/* Animated Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="p-4 h-full"
            style={{ backgroundColor: '#FBF5DE' }}
          >
            {/* Welcome Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div>
                <div className="font-bold text-gray-800">Welcome back, Ganesh!</div>
                <div className="text-sm" style={{ color: '#3D74B6' }}>
                  Viewing dashboard for: <span className="font-semibold">Ganesh Retail Store</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {mockStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className={`${stat.bgColor} p-3 rounded-lg shadow-sm`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon size={14} className={stat.textColor} />
                    <span className="text-xs font-medium text-gray-500">{stat.label}</span>
                  </div>
                  <div className="text-sm font-bold text-gray-800">{stat.value}</div>
                </motion.div>
              ))}
            </div>

            {/* Dashboard Widgets */}
            <div className="grid grid-cols-2 gap-3">
              {/* Order Chart */}
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-1 text-sm">
                  <BarChart3 size={14} style={{ color: '#3D74B6' }} />
                  Orders (Last 7 Days)
                </h4>
                <div className="flex items-end gap-1 h-16">
                  {chartData.map((day, index) => (
                    <motion.div
                      key={day.day}
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.orders / 35) * 100}%` }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                      style={{ backgroundColor: '#3D74B6' }}
                      className="rounded-t flex-1 min-h-[4px] relative group"
                    >
                      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                        {day.day[0]}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Low Stock Warning */}
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-1 text-sm">
                  <AlertTriangle size={14} className="text-yellow-600" />
                  Low Stock Items
                </h4>
                <div className="space-y-1">
                  {mockLowStockItems.slice(0, 3).map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.8 }}
                      style={{ backgroundColor: '#FBF5DE' }}
                      className="p-1.5 rounded text-xs flex justify-between"
                    >
                      <span className="text-gray-700 truncate">{item.name}</span>
                      <span className="font-bold text-orange-600">{item.stock}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* View Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {views.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentView ? 'w-6' : ''
              }`}
              style={{ backgroundColor: index === currentView ? '#3D74B6' : '#E2E8F0' }}
            />
          ))}
        </div>

        {/* Floating Success Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full p-2 shadow-lg"
        >
          <CheckCircle size={20} />
        </motion.div>
      </motion.div>

      {/* Floating Feature Pills - Your Brand Colors */}
      <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 space-y-3 hidden lg:block">
        {[
          { text: 'Real-time Data', color: '#3D74B6' },
          { text: 'Mobile Ready', color: '#DC3C22' },
          { text: 'Easy Setup', color: '#3D74B6' }
        ].map((feature, index) => (
          <motion.div
            key={feature.text}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5 + index * 0.2 }}
            className="text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium"
            style={{ backgroundColor: feature.color }}
          >
            {feature.text}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Main Hero Component with Your Brand Theme
export default function BrandedHeroSection() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FBF5DE' }}>
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 bg-transparent py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo-budget-removebg.png"
                alt="Budget Shop Manager Logo"
                width={60}
                height={60}
                className="rounded-md"
                />
                <span className="font-bold text-lg hidden sm:inline" style={{ color: '#2D3748' }}>
                Budget Shop Manager
                </span>
            </Link>
          </div>
          <nav>
            <Link
              href="/auth/signin"
              className="text-white font-semibold py-2 px-5 rounded-lg shadow-sm transition-colors"
              style={{ backgroundColor: '#3D74B6' }}
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Marketing Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
              style={{ color: '#2D3748' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Simplify Your
              <br />
              <span style={{ color: '#3D74B6' }}>Shop Management</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              From inventory and purchases to point-of-sale, Budget Shop Manager is the 
              <span className="font-semibold" style={{ color: '#3D74B6' }}> all-in-one solution</span> designed 
              for small businesses to thrive.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/auth/signin"
                  className="inline-block w-full sm:w-auto text-center px-8 py-3 font-semibold rounded-lg text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#3D74B6' }}
                >
                  Get Started for Free
                  <ArrowRight size={18} />
                </Link>
              </motion.div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="bg-white text-gray-700 font-semibold py-3 px-8 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all duration-300"
              >
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Feature Pills using your brand colors */}
            <motion.div
              className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              {[
                { icon: Package, text: 'Smart Inventory', color: '#3D74B6' },
                { icon: ShoppingCart, text: 'Quick POS', color: '#DC3C22' },
                { icon: BarChart3, text: 'Rich Analytics', color: '#3D74B6' },
                { icon: CheckCircle, text: 'Multi-Device', color: '#DC3C22' }
              ].map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  whileHover={{ y: -2 }}
                  className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-gray-200 cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="rounded-lg p-1.5 group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: `${feature.color}20` }}
                    >
                      <feature.icon size={16} style={{ color: feature.color }} />
                    </div>
                    <span className="font-medium text-sm" style={{ color: '#2D3748' }}>
                      {feature.text}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column: Animated Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative"
          >
            <AnimatedDashboard />
          </motion.div>
        </div>

        {/* Bottom Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-20 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {[
            {
              icon: CheckCircle,
              title: 'Easy to Use',
              description: 'Intuitive interface designed for shop owners',
              bgColor: '#EAC8A6'
            },
            {
              icon: Users,
              title: 'Trusted by Shops',
              description: 'Join hundreds of satisfied business owners',
              bgColor: '#EAC8A6'
            },
            {
              icon: TrendingUp,
              title: 'Grow Revenue',
              description: 'Make smarter decisions with detailed analytics',
              bgColor: '#EAC8A6'
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + index * 0.2 }}
              whileHover={{ y: -5 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div 
                className="rounded-2xl p-4 w-fit mx-auto mb-4"
                style={{ backgroundColor: feature.bgColor }}
              >
                <feature.icon size={28} style={{ color: '#3D74B6' }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#2D3748' }}>
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}