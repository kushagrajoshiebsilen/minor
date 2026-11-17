import React, { useState, useEffect } from 'react';
import IntroSplash from './components/IntroSplash';
import AtelierHeader from './components/AtelierHeader';
import OnboardingView from './components/OnboardingView';
import RoleSelectorView from './components/RoleSelectorView';
import KarigarStudioView from './components/KarigarStudioView';
import BuyerMarketplaceView from './components/BuyerMarketplaceView';
import LanguageModal from './components/LanguageModal';
import AiSettingsModal from './components/AiSettingsModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import { getTranslations } from './i18n/languages';
import { INITIAL_HERITAGE_PRODUCTS } from './data/heritageCatalog';
import { getAiConfig, fetchServerAiStatus } from './ai/aiService';
import { ORDER_STATUS } from './utils/orderEngine';

function readStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  // 1. Intro cinematic video splash (plays start.mp4 on load, replayable anytime)
  const [showIntro, setShowIntro] = useState(true);

  // 2. Language across 15 Indian languages
  const [language, setLanguage] = useState(() => localStorage.getItem('kb_v2_lang') || 'en');

  // 3. Navigation & Auth
  const [phone, setPhone] = useState(() => localStorage.getItem('kb_v2_phone') || '');
  const [currentPage, setCurrentPage] = useState(1); // 1: Onboarding | 2: Role | 3: Workspace
  const [role, setRole] = useState(null); // 'karigar' | 'buyer'

  // 4. Profiles
  const [karigarProfile, setKarigarProfile] = useState(() =>
    readStored('kb_v2_karigar', { name: '', location: '' })
  );
  const [buyerProfile, setBuyerProfile] = useState(() =>
    readStored('kb_v2_buyer', { name: 'Aditi Sharma', location: 'Bengaluru, Karnataka' })
  );

  // 5. Shared Marketplace Catalog, Orders, Cart & Wishlist
  const [products, setProducts] = useState(() =>
    readStored('kb_v2_products', INITIAL_HERITAGE_PRODUCTS)
  );
  const [orders, setOrders] = useState(() => readStored('kb_v2_orders', []));
  const [cartItems, setCartItems] = useState(() => readStored('kb_v2_cart', []));
  const [wishlist, setWishlist] = useState(() => readStored('kb_v2_wishlist', []));

  // 6. Modals & Drawers
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [checkoutSource, setCheckoutSource] = useState('cart'); // 'cart' | 'buynow'

  // 7. Provider-Agnostic AI Status
  const [aiConfig, setAiConfig] = useState(getAiConfig);
  const [serverAiKeys, setServerAiKeys] = useState({});

  useEffect(() => {
    fetchServerAiStatus().then((status) => {
      setServerAiKeys(status.serverKeysConfigured || {});
    });
  }, []);

  // Persist states
  useEffect(() => {
    localStorage.setItem('kb_v2_lang', language);
  }, [language]);

  useEffect(() => {
    if (phone) localStorage.setItem('kb_v2_phone', phone);
  }, [phone]);

  useEffect(() => {
    localStorage.setItem('kb_v2_karigar', JSON.stringify(karigarProfile));
  }, [karigarProfile]);

  useEffect(() => {
    localStorage.setItem('kb_v2_buyer', JSON.stringify(buyerProfile));
  }, [buyerProfile]);

  useEffect(() => {
    localStorage.setItem('kb_v2_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('kb_v2_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('kb_v2_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('kb_v2_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const t = getTranslations(language);
  const cartTotalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const pendingOrdersCount = orders.filter((o) => o.status === ORDER_STATUS.PENDING_KARIGAR).length;
  const hasLiveAiKey = Boolean(aiConfig?.apiKey?.trim()) || Boolean(serverAiKeys?.[aiConfig?.provider || 'grok']);

  // Cart & Product Handlers
  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId, qty) => {
    if (qty <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== productId));
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: qty } : item))
    );
  };

  const handleRemoveCartItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleBuyNow = (product) => {
    setCheckoutItems([{ ...product, quantity: 1 }]);
    setCheckoutSource('buynow');
    setIsCheckoutOpen(true);
  };

  const handleProceedFromCart = () => {
    setCheckoutItems(cartItems);
    setCheckoutSource('cart');
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderCreated = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    if (checkoutSource === 'cart') {
      setCartItems([]);
    }
  };

  const handleAddProduct = (craft) => {
    setProducts((prev) => [craft, ...prev]);
  };

  const handleDeleteProduct = (craftId) => {
    setProducts((prev) => prev.filter((p) => p.id !== craftId));
  };

  const handleToggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  return (
    <div className="min-h-screen flex flex-col relative" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      {/* Fixed Full-Screen Artisan Workbench Background + Warm Veil */}
      <div className="atelier-backdrop" aria-hidden="true" />
      <div className="atelier-veil" aria-hidden="true" />

      {/* Fullscreen Cinematic Intro Video (start.mp4) */}
      {showIntro && <IntroSplash onFinish={() => setShowIntro(false)} t={t} />}

      {/* Floating Royal Indigo Header */}
      <AtelierHeader
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        role={role}
        setRole={setRole}
        language={language}
        t={t}
        phone={phone}
        cartCount={cartTotalCount}
        pendingOrdersCount={pendingOrdersCount}
        aiConfig={aiConfig}
        hasLiveAiKey={hasLiveAiKey}
        onOpenLanguage={() => setIsLanguageOpen(true)}
        onOpenAiSettings={() => setIsAiSettingsOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onReplayIntro={() => setShowIntro(true)}
      />

      {/* Active Page Workspace */}
      <main className="flex-1 pb-10">
        {currentPage === 1 && (
          <OnboardingView
            language={language}
            setLanguage={setLanguage}
            phone={phone}
            setPhone={setPhone}
            onContinue={() => setCurrentPage(2)}
            t={t}
          />
        )}

        {currentPage === 2 && (
          <RoleSelectorView
            onSelectRole={(selected) => {
              setRole(selected);
              setCurrentPage(3);
            }}
            onBack={() => setCurrentPage(1)}
            phone={phone}
            t={t}
          />
        )}

        {currentPage === 3 && role === 'karigar' && (
          <KarigarStudioView
            karigarProfile={karigarProfile}
            setKarigarProfile={setKarigarProfile}
            products={products}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            orders={orders}
            setOrders={setOrders}
            onSwitchToBuyer={() => setRole('buyer')}
            onBack={() => setCurrentPage(2)}
            language={language}
            t={t}
          />
        )}

        {currentPage === 3 && role === 'buyer' && (
          <BuyerMarketplaceView
            buyerProfile={buyerProfile}
            setBuyerProfile={setBuyerProfile}
            products={products}
            orders={orders}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onSwitchToKarigar={() => setRole('karigar')}
            onBack={() => setCurrentPage(2)}
            language={language}
            t={t}
          />
        )}
      </main>

      {/* Regal Translucent Footer */}
      <footer className="px-4 sm:px-6 pb-5">
        <div className="max-w-7xl mx-auto indigo-glass rounded-2xl px-5 py-4 text-[#f7f1e3]/80 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © 2026 <strong className="text-[#faf4e8]">KarigarBazaar</strong> — Royal Indian Artisan Atelier (SIH 2026)
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
            <span>15 Indian Languages</span>
            <span className="text-[#c88d28]">•</span>
            <span>Provider-Agnostic AI (Grok / Gemini)</span>
            <span className="text-[#c88d28]">•</span>
            <span>0% Middleman Commerce</span>
          </div>
        </div>
      </footer>

      {/* Global Modals & Drawers */}
      <LanguageModal
        isOpen={isLanguageOpen}
        onClose={() => setIsLanguageOpen(false)}
        language={language}
        setLanguage={setLanguage}
        t={t}
      />

      <AiSettingsModal
        isOpen={isAiSettingsOpen}
        onClose={() => setIsAiSettingsOpen(false)}
        onConfigChange={(updated) => setAiConfig(updated)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedFromCart}
        t={t}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        itemsToBuy={checkoutItems}
        buyerProfile={buyerProfile}
        phone={phone}
        onOrderCreated={handleOrderCreated}
        t={t}
      />
    </div>
  );
}
