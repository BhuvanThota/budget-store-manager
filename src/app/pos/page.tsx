// src/app/pos/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Product } from '@/types/product';
import { Category } from '@/types/category'; // NEW: Import Category
import CartModal, { CartItem } from '@/components/CartModal';
import CartSidebar from '@/components/CartSidebar';
import { ShoppingCart, Plus, Minus, Search, Package, Tag } from 'lucide-react'; // NEW: Import Tag

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); // NEW: State for categories
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(''); // NEW: State for category filter

  const cartMap = useMemo(() => new Map(cart.map(item => [item.id, item])), [cart]);

  // MODIFIED: Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const inStock = p.currentStock > 0;
      const matchesSearch = !searchQuery.trim() || p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategoryId || p.categoryId === selectedCategoryId;
      return inStock && matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategoryId]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/categories'),
      ]);
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch initial data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    const costAtSale = product.costPrice;
    setCart(prevCart => [...prevCart, { ...product, quantity: 1, costAtSale }]);
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== productId));
      return;
    }

    const productInInventory = products.find(p => p.id === productId);
    if (productInInventory && newQuantity > productInInventory.currentStock) {
      alert(`Cannot add more than available stock (${productInInventory.currentStock}).`);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear the cart?')) {
      setCart([]);
    }
  };

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    const totalAmount = cart.reduce((sum, item) => sum + item.sellPrice * item.quantity, 0);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems: cart, totalAmount }),
      });

      if (!res.ok) throw new Error('Failed to create order');

      alert('Order created successfully!');
      setCart([]);
      setIsCartOpen(false);
      fetchInitialData();
    } catch (error) {
      console.error(error);
      alert('There was an error creating the order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.sellPrice * item.quantity, 0);

  const LoadingState = () => (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading products...</p>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-gray-100 rounded-full p-6 mb-4">
        <Package size={48} className="text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-600 mb-2">
        {searchQuery || selectedCategoryId ? 'No products found' : 'No products available'}
      </h3>
      <p className="text-gray-500">
        {searchQuery || selectedCategoryId
          ? `No products match your search or filter. Try different criteria.`
          : 'Add products to your inventory to start selling.'
        }
      </p>
    </div>
  );
  
  // Desktop Product Card Component
  const DesktopProductCard = ({ product }: { product: Product }) => {
    const cartItem = cartMap.get(product.id);
    return (
      <div 
        className={`bg-white rounded-lg shadow-md border transition-all duration-200 hover:shadow-lg ${
          cartItem ? 'border-brand-primary ring-2 ring-brand-primary ring-opacity-20' : 'border-gray-200'
        }`}
      >
        <div className="p-3">
          <div className="text-center">
            <h3 className="font-bold text-gray-800 text-md leading-tight line-clamp-2 min-h-[2rem]">
              {product.name}
            </h3>
            <div className="space-y-1 mb-3">
              <div className="text-sm font-bold text-brand-primary">₹{product.sellPrice.toFixed(2)}</div>
              <div className="text-xs text-gray-500">Stock: {product.currentStock}</div>
            </div>
          </div>
          {cartItem ? (
            <div className="flex items-center justify-center gap-1">
              <button 
                onClick={() => handleUpdateQuantity(product.id, cartItem.quantity - 1)}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-all active:scale-95 shadow-sm"
              >
                <Minus size={12} />
              </button>
              <div className="bg-gray-100 rounded-lg px-2 py-1 min-w-[2rem] text-center">
                <span className="font-bold text-sm text-gray-800">{cartItem.quantity}</span>
              </div>
              <button 
                onClick={() => handleUpdateQuantity(product.id, cartItem.quantity + 1)}
                className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-full w-6 h-6 flex items-center justify-center transition-all active:scale-95 shadow-sm"
              >
                <Plus size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleAddToCart(product)}
              className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2 px-2 rounded-lg transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1 text-xs"
            >
              <Plus size={12} />
              Add
            </button>
          )}
        </div>
      </div>
    );
  };

  // Mobile Product Card Component (Smaller)
  const MobileProductCard = ({ product }: { product: Product }) => {
    const cartItem = cartMap.get(product.id);
    return (
      <div 
        className={`bg-white rounded-lg shadow-md border transition-all duration-200 hover:shadow-lg ${
          cartItem ? 'border-brand-primary ring-2 ring-brand-primary ring-opacity-20' : 'border-gray-200'
        }`}
      >
        <div className="p-2.5">
          <div className="text-center">
            <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2 min-h-[2rem]">
              {product.name}
            </h3>
            <div className="space-y-1 mb-2">
              <div className="text-sm font-bold text-brand-primary">₹{product.sellPrice.toFixed(2)}</div>
              <div className="text-xs text-gray-500">Stock: {product.currentStock}</div>
            </div>
          </div>
          {cartItem ? (
            <div className="flex items-center justify-center gap-1.5">
              <button 
                onClick={() => handleUpdateQuantity(product.id, cartItem.quantity - 1)}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-all active:scale-95 shadow-sm"
              >
                <Minus size={12} />
              </button>
              <div className="bg-gray-100 rounded-lg px-2 py-1 min-w-[2rem] text-center">
                <span className="font-bold text-sm text-gray-800">{cartItem.quantity}</span>
              </div>
              <button 
                onClick={() => handleUpdateQuantity(product.id, cartItem.quantity + 1)}
                className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-full w-6 h-6 flex items-center justify-center transition-all active:scale-95 shadow-sm"
              >
                <Plus size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleAddToCart(product)}
              className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-1.5 px-2 rounded-lg transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1 text-xs"
            >
              <Plus size={12} />
              Add
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Layout (760px+) */}
      <div className="hidden min-[760px]:flex h-[calc(100vh-80px)] gap-1">
        <div className="w-[40%] h-full">
          <CartSidebar 
            cart={cart}
            isSubmitting={isSubmitting}
            handleClearCart={handleClearCart}
            handleConfirmOrder={handleConfirmOrder}
            handleUpdateQuantity={handleUpdateQuantity}
          />
        </div>
        <div className="w-[60%] h-full flex flex-col">
          {/* MODIFIED: Search & Filter Bar - Desktop */}
          <div className="bg-white border-b rounded-lg p-4 shadow-sm space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-gray-500" />
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Filter by category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="p-4">
              {isLoading ? (
                <LoadingState />
              ) : filteredProducts.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                  {filteredProducts.map(product => (
                    <DesktopProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout (<760px) */}
      <div className="min-[760px]:hidden flex flex-col h-[calc(100vh-80px)]">
        {/* MODIFIED: Search & Filter Bar - Mobile */}
        <div className="bg-white border-b p-3 shadow-sm space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full p-2.5 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
            />
          </div>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-xs"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto pb-24">
          <div className="p-3">
            {isLoading ? (
              <LoadingState />
            ) : filteredProducts.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {filteredProducts.map(product => (
                  <MobileProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>

        {cart.length > 0 && (
          <div className="fixed bottom-6 right-6 z-30">
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-full w-16 h-16 shadow-2xl flex items-center justify-center transition-all active:scale-95 relative group"
            >
              <ShoppingCart size={24} className="text-white" />
              <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-10 h-8 flex items-center justify-center text-sm font-bold shadow-md">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </div>
              <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-gray-800 text-white text-sm rounded-lg py-2 px-3 whitespace-nowrap">
                  {cartItemCount} items • ₹{cartTotal.toFixed(2)}
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </button>
          </div>
        )}

        <CartModal
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onConfirmOrder={handleConfirmOrder}
          onClearCart={handleClearCart}
          isSubmitting={isSubmitting}
        />
      </div>
    </>
  );
}