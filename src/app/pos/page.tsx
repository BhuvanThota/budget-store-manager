// src/app/pos/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Product } from '@/types/product';
import CartModal, { CartItem } from '@/components/CartModal';
import CartSidebar from '@/components/CartSidebar'; // Import the new component
import { ShoppingCart, Plus, Minus } from 'lucide-react';

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartMap = useMemo(() => new Map(cart.map(item => [item.id, item])), [cart]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    // FIX: Changed to use the new `costPrice` field directly.
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
      fetchProducts(); 
    } catch (error) {
      console.error(error);
      alert('There was an error creating the order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.sellPrice * item.quantity, 0);

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
        <div className="w-[60%] h-full">
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="p-6 pb-8">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading products...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                  {products.filter(p => p.currentStock > 0).map(product => {
                    const cartItem = cartMap.get(product.id);
                    return (
                      <div 
                        key={product.id} 
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
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout (<760px) */}
      <div className="min-[760px]:hidden">
        <div className="container mx-auto p-4 md:p-6 pb-32">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading products...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.filter(p => p.currentStock > 0).map(product => {
                const cartItem = cartMap.get(product.id);
                return (
                  <div 
                    key={product.id} 
                    className={`bg-white rounded-lg shadow-md border transition-all duration-200 hover:shadow-lg ${
                      cartItem ? 'border-brand-primary ring-2 ring-brand-primary ring-opacity-20' : 'border-gray-200'
                    }`}
                  >
                    <div className="p-4">
                      <div className="text-center">
                        <h3 className="font-bold text-gray-800 text- leading-tight line-clamp-2 min-h-[2.5rem]">
                          {product.name}
                        </h3>
                        <div className="space-y-1 mb-3">
                          <div className="text-lg font-bold text-brand-primary">₹{product.sellPrice.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">Stock: {product.currentStock}</div>
                        </div>
                      </div>
                      {cartItem ? (
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleUpdateQuantity(product.id, cartItem.quantity - 1)}
                            className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all active:scale-95 shadow-sm"
                          >
                            <Minus size={16} />
                          </button>
                          <div className="bg-gray-100 rounded-lg px-3 py-1 min-w-[3rem] text-center">
                            <span className="font-bold text-lg text-gray-800">{cartItem.quantity}</span>
                          </div>
                          <button 
                            onClick={() => handleUpdateQuantity(product.id, cartItem.quantity + 1)}
                            className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all active:scale-95 shadow-sm"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2.5 px-3 rounded-lg transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2"
                        >
                          <Plus size={16} />
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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