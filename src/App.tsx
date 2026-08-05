import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { UserDrawer } from './components/UserDrawer';
import { ProductModal } from './components/ProductModal';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { QuickLoginModal } from './components/QuickLoginModal';
import { EmptyCartWarningModal } from './components/EmptyCartWarningModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { ToastContainer } from './components/ToastContainer';

import { HomePage } from './pages/HomePage';
import { AllItemsPage } from './pages/AllItemsPage';
import { VegetablesPage } from './pages/VegetablesPage';
import { FruitsPage } from './pages/FruitsPage';
import { SpicesPage } from './pages/SpicesPage';
import { BiscuitsPage } from './pages/BiscuitsPage';
import { ChocolatesPage } from './pages/ChocolatesPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';

const MainContent: React.FC = () => {
  const { currentView } = useApp();

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage />;
      case 'all-items':
        return <AllItemsPage />;
      case 'vegetables':
        return <VegetablesPage />;
      case 'fruits':
        return <FruitsPage />;
      case 'spices':
        return <SpicesPage />;
      case 'biscuits':
        return <BiscuitsPage />;
      case 'chocolates':
        return <ChocolatesPage />;
      case 'contact':
        return <ContactPage />;
      case 'login':
        return <LoginPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-between">
      <div>
        <Navbar />
        <main>{renderView()}</main>
      </div>
      <Footer />

      {/* Global Drawers & Modals */}
      <CartDrawer />
      <UserDrawer />
      <ProductModal />
      <CheckoutModal />
      <OrderSuccessModal />
      <QuickLoginModal />
      <EmptyCartWarningModal />
      <TrackOrderModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
