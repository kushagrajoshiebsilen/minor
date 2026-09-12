import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Page1Auth from './components/Page1Auth';
import Page2Role from './components/Page2Role';
import Page3Karigar from './components/Page3Karigar';
import Page3Buyer from './components/Page3Buyer';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import { translations } from './locales/translations';
import { initialProducts } from './data/initialProducts';
import './App.css';

export default function App() {
  // 1. Language state (en, hi, bn, etc.)
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('sih_lang') || 'en';
  });

  // 2. Auth & Page navigation state
  const [phone, setPhone] = useState(() => {
    return localStorage.getItem('sih_phone') || '';
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [role, setRole] = useState(null); // 'karigar' | 'buyer'

  // 3. Profiles
  const [karigarProfile, setKarigarProfile] = useState(() => {
    const saved = localStorage.getItem('sih_karigar_profile');
    return saved ? JSON.parse(saved) : { name: '', location: '' };
  });

  const [buyerProfile, setBuyerProfile] = useState(() => {
    const saved = localStorage.getItem('sih_buyer_profile');
    return saved ? JSON.parse(saved) : { name: 'Aditi Sharma', location: 'Bengaluru, Karnataka' };
  });

  // 4. Products Catalog (Shared state between Karigar & Buyer)
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('sih_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  // 5. Cart & Checkout State
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('sih_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState([]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('sih_lang', language);
  }, [language]);

  useEffect(() => {
    if (phone) localStorage.setItem('sih_phone', phone);
  }, [phone]);

  useEffect(() => {
    localStorage.setItem('sih_karigar_profile', JSON.stringify(karigarProfile));
  }, [karigarProfile]);

  useEffect(() => {
    localStorage.setItem('sih_buyer_profile', JSON.stringify(buyerProfile));
  }, [buyerProfile]);

  useEffect(() => {
    localStorage.setItem('sih_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sih_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Current translation dictionary
  const t = translations[language] || translations.en;

  // Cart operations
  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const handleUpdateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  // Immediate "Buy Now" handler (opens checkout directly with 1 item)
  const handleBuyNow = (product) => {
    setCheckoutItems([{ ...product, quantity: 1 }]);
    setIsCheckoutOpen(true);
  };

  // Proceed to checkout with all cart items
  const handleProceedFromCart = () => {
    setCheckoutItems(cartItems);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Add newly listed product by Karigar
  const handleAddProduct = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  // Order success cleanup
  const handleOrderSuccess = () => {
    // If checkout items were from cart, clear cart
    if (checkoutItems.length === cartItems.length) {
      setCartItems([]);
    }
  };

  const cartTotalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900 selection:bg-amber-100 selection:text-amber-900">
      
      {/* Global Application Header */}
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        role={role}
        setRole={setRole}
        language={language}
        setLanguage={setLanguage}
        t={t}
        phone={phone}
        cartCount={cartTotalCount}
        setIsCartOpen={setIsCartOpen}
      />

      {/* Main Multi-Page Container */}
      <main className="flex-1">
        {currentPage === 1 && (
          <Page1Auth
            language={language}
            setLanguage={setLanguage}
            phone={phone}
            setPhone={setPhone}
            onContinue={() => setCurrentPage(2)}
            t={t}
          />
        )}

        {currentPage === 2 && (
          <Page2Role
            onSelectRole={(selectedRole) => {
              setRole(selectedRole);
              setCurrentPage(3);
            }}
            onBack={() => setCurrentPage(1)}
            phone={phone}
            t={t}
          />
        )}

        {currentPage === 3 && role === 'karigar' && (
          <Page3Karigar
            karigarProfile={karigarProfile}
            setKarigarProfile={setKarigarProfile}
            products={products}
            onAddProduct={handleAddProduct}
            onSwitchToBuyer={() => setRole('buyer')}
            onBack={() => setCurrentPage(2)}
            language={language}
            t={t}
          />
        )}

        {currentPage === 3 && role === 'buyer' && (
          <Page3Buyer
            buyerProfile={buyerProfile}
            setBuyerProfile={setBuyerProfile}
            products={products}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onSwitchToKarigar={() => setRole('karigar')}
            onBack={() => setCurrentPage(2)}
            t={t}
          />
        )}
      </main>

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={handleProceedFromCart}
        t={t}
      />

      {/* Checkout / Payment Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        itemsToBuy={checkoutItems}
        buyerProfile={buyerProfile}
        phone={phone}
        onOrderSuccess={handleOrderSuccess}
        t={t}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © 2026 <strong>KarigarBazaar</strong> — Smart India Hackathon (SIH 2026).
          </div>
          <div className="flex items-center gap-4 text-stone-400">
            <span>Direct Artisan Commerce</span>
            <span>•</span>
            <span>Vocal for Local</span>
            <span>•</span>
            <span>Zero Middleman</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
