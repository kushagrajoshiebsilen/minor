import React, { useState, useEffect } from 'react';
import EditorialIntroSplash from './components/EditorialIntroSplash';
import EditorialNavbar from './components/EditorialNavbar';
import EditorialLandingView from './components/EditorialLandingView';
import EditorialArtisanFlow from './components/EditorialArtisanFlow';
import EditorialShopView from './components/EditorialShopView';
import EditorialLoginPage from './components/EditorialLoginPage';
import EditorialEnquireModal from './components/EditorialEnquireModal';
import EditorialLoginModal from './components/EditorialLoginModal';
import LanguageModal from './components/LanguageModal';
import { INITIAL_HERITAGE_PRODUCTS } from './data/heritageCatalog';

function readStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  // Intro splash: show once per session using sessionStorage
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('kb_editorial_intro_shown');
  });

  const handleFinishIntro = () => {
    sessionStorage.setItem('kb_editorial_intro_shown', 'true');
    setShowIntro(false);
  };

  // Language across 15 Indian languages
  const [language, setLanguage] = useState(() => localStorage.getItem('kb_v2_lang') || 'en');

  // Route state: 'landing' (default) | 'artisan' | 'shop' | 'login'
  const [currentRoute, setCurrentRoute] = useState('landing');

  // Artisan and Buyer Profiles (only treat as logged in if phone is set)
  const [phone, setPhone] = useState(() => localStorage.getItem('kb_v2_phone') || '');
  const [artisanProfile, setArtisanProfile] = useState(() =>
    readStored('kb_v2_karigar', { name: 'Sitadevi Paswan', location: 'Jitwarpur, Bihar' })
  );

  // Products
  const [products, setProducts] = useState(() =>
    readStored('kb_v2_editorial_products', INITIAL_HERITAGE_PRODUCTS)
  );

  // Modals
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [enquiryItem, setEnquiryItem] = useState(null);

  // Persist storage
  useEffect(() => {
    localStorage.setItem('kb_v2_lang', language);
  }, [language]);

  useEffect(() => {
    if (phone) {
      localStorage.setItem('kb_v2_phone', phone);
    } else {
      localStorage.removeItem('kb_v2_phone');
    }
  }, [phone]);

  useEffect(() => {
    localStorage.setItem('kb_v2_karigar', JSON.stringify(artisanProfile));
  }, [artisanProfile]);

  useEffect(() => {
    localStorage.setItem('kb_v2_editorial_products', JSON.stringify(products));
  }, [products]);

  const handleAddProduct = (craft) => {
    setProducts((prev) => [craft, ...prev]);
  };

  const handleLogout = () => {
    setPhone('');
    localStorage.removeItem('kb_v2_phone');
    setCurrentRoute('landing');
  };

  return (
    <div
      className="min-h-screen flex flex-col relative text-[#2B3A67] font-body"
      dir={language === 'ur' ? 'rtl' : 'ltr'}
    >
      {/* Whole website fixed artisan workbench backdrop + warm veil */}
      <div className="site-backdrop" aria-hidden="true" />
      <div className="site-veil" aria-hidden="true" />

      {/* Intro Splash: Fullscreen video on first visit per session */}
      {showIntro && <EditorialIntroSplash onFinish={handleFinishIntro} />}

      {/* Slim, cream Navbar - Hidden on Artisan Atelier and Login page */}
      {currentRoute !== 'artisan' && currentRoute !== 'login' && (
        <EditorialNavbar
          currentRoute={currentRoute}
          onNavigate={(route) => setCurrentRoute(route)}
          language={language}
          onOpenLanguage={() => setIsLanguageOpen(true)}
          artisanName={phone ? artisanProfile?.name : null}
          onOpenLogin={() => {
            if (phone) {
              setCurrentRoute('artisan');
            } else {
              setCurrentRoute('login');
            }
          }}
        />
      )}

      {/* Main Route Content */}
      <main className="flex-1 w-full relative z-10">
        {currentRoute === 'landing' && (
          <EditorialLandingView
            onStartSelling={() => {
              if (phone) {
                setCurrentRoute('artisan');
              } else {
                setCurrentRoute('login');
              }
            }}
            onBrowseCrafts={() => setCurrentRoute('shop')}
            onEnquire={(item) => setEnquiryItem(item)}
            language={language}
          />
        )}

        {currentRoute === 'login' && (
          <EditorialLoginPage
            onLoginSuccess={() => setCurrentRoute('artisan')}
            onNavigateHome={() => setCurrentRoute('landing')}
            language={language}
            phone={phone}
            setPhone={setPhone}
            artisanProfile={artisanProfile}
            onProfileUpdate={(updated) => setArtisanProfile(updated)}
          />
        )}

        {currentRoute === 'artisan' && (
          <EditorialArtisanFlow
            artisanProfile={artisanProfile}
            onProfileUpdate={(updated) => setArtisanProfile(updated)}
            language={language}
            setLanguage={setLanguage}
            onPublishCraft={handleAddProduct}
            onLogout={handleLogout}
          />
        )}

        {currentRoute === 'shop' && (
          <EditorialShopView
            products={products}
            onEnquire={(item) => setEnquiryItem(item)}
            language={language}
          />
        )}
      </main>

      {/* Modals */}
      <LanguageModal
        isOpen={isLanguageOpen}
        onClose={() => setIsLanguageOpen(false)}
        language={language}
        setLanguage={setLanguage}
      />

      <EditorialLoginModal
        isOpen={isLoginOpen}
        onClose={(res) => {
          setIsLoginOpen(false);
          if (res?.navigateToSeller) {
            setCurrentRoute('artisan');
          }
        }}
        phone={phone}
        setPhone={setPhone}
        artisanProfile={artisanProfile}
        onProfileUpdate={(updated) => setArtisanProfile(updated)}
      />

      <EditorialEnquireModal
        item={enquiryItem}
        onClose={() => setEnquiryItem(null)}
      />
    </div>
  );
}
