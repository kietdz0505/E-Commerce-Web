import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import { useCart } from './shared/CartContext';
import { useAuth } from './shared/AuthContext';

import ScrollToTop from './shared/ScrollToTop';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPopup from './components/LoginPopup';
import ChatbotWidget from './shared/ChatbotWidget';

const Home = lazy(() => import('./pages/user/Home'));
const UserProfile = lazy(() => import('./pages/user/UserProfile'));
const EditProfile = lazy(() => import('./pages/user/EditProfile'));
const SearchPage = lazy(() => import('./pages/user/SearchPage'));
const ProductDetail = lazy(() => import('./pages/user/ProductDetail'));
const CartPage = lazy(() => import('./pages/user/CartPage'));
const MyOrdersPage = lazy(() => import('./pages/user/MyOrdersPage'));
const OrderCheckoutPage = lazy(() => import('./pages/user/OrderCheckoutPage'));
const OAuth2RedirectHandler = lazy(() => import('./OAuth2RedirectHandler'));
const OrderDetail = lazy(() => import('./pages/user/OrderDetail'));
const UserPromotionPage = lazy(() => import('./pages/user/UserPromotionPage'));

import AdminRoute from './routers/AdminRoute';

const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminPromotionsPage = lazy(() => import('./pages/admin/AdminPromotionsPage'));
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminBrandPage = lazy(() => import('./pages/admin/AdminBrandPage'));
const AdminReportPage = lazy(() => import('./pages/admin/AdminReportPage'));
const AdminUserPromotionPage = lazy(() => import('./pages/admin/AdminUserPromotionPage'));
const AdminChatbotPage = lazy(() => import('./pages/admin/AdminChatbotPage'));

const LoadingFallback = () => (
  <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-white">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const AppLayout = () => {
  const { currentUser, loading } = useAuth();
  const { fetchCartItems, clearCartContext } = useCart();
  const [loginPopupOpen, setLoginPopupOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchCartItems();
    } else {
      clearCartContext();
    }
  }, [currentUser]);

  if (loading) {
    return null;
  }

  const adminGuard = (Component) => (
    <AdminRoute currentUser={currentUser} loading={loading}>
      <Component />
    </AdminRoute>
  );

  return (
    <>
      <ScrollToTop />
      <div className="d-flex flex-column min-vh-100">
        <Header
          onLoginClick={() => setLoginPopupOpen(true)}
          currentUser={currentUser}
        />

        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* USER */}
            <Route path="/" element={<Home currentUser={currentUser} />} />
            <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
            <Route path="/profile" element={<UserProfile currentUser={currentUser} />} />
            <Route path="/profile/edit" element={<EditProfile currentUser={currentUser} />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<OrderCheckoutPage />} />
            <Route path="/my-orders" element={<MyOrdersPage />} />
            <Route path="/order/:id" element={<OrderDetail />} />
            <Route path="/promotions/my" element={<UserPromotionPage currentUser={currentUser} />} />

            {/* ADMIN */}
            <Route path="/admin" element={adminGuard(AdminDashboardPage)} />
            <Route path="/admin/products" element={adminGuard(AdminProductsPage)} />
            <Route path="/admin/categories" element={adminGuard(AdminCategoriesPage)} />
            <Route path="/admin/orders" element={adminGuard(AdminOrdersPage)} />
            <Route path="/admin/promotions" element={adminGuard(AdminPromotionsPage)} />
            <Route path="/admin/reviews" element={adminGuard(AdminReviewsPage)} />
            <Route path="/admin/users" element={adminGuard(AdminUsersPage)} />
            <Route path="/admin/brands" element={adminGuard(AdminBrandPage)} />
            <Route path="/admin/report" element={adminGuard(AdminReportPage)} />
            <Route path="/admin/send-promotion-email" element={adminGuard(AdminUserPromotionPage)} />
            <Route path="/admin/chatbot" element={adminGuard(AdminChatbotPage)} />
          </Routes>
        </Suspense>

        <Footer />

        <LoginPopup
          open={loginPopupOpen}
          onClose={() => setLoginPopupOpen(false)}
          onSwitchToRegister={() => {}}
        />

        <ChatbotWidget />
      </div>
    </>
  );
};

import { NotificationProvider } from './shared/NotificationContext';
import { CartProvider } from './shared/CartContext';
import { AuthProvider } from './shared/AuthContext';

const App = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <CartProvider>
          <AppLayout />
        </CartProvider>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;