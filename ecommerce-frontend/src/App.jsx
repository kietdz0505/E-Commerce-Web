import React, {
  useState,
  useEffect
} from 'react';

import {
  Routes,
  Route
} from 'react-router-dom';

import {
  NotificationProvider
} from './shared/NotificationContext';

import {
  CartProvider,
  useCart
} from './shared/CartContext';

import {
  AuthProvider,
  useAuth
} from './shared/AuthContext';

import ScrollToTop from './shared/ScrollToTop';

import Header from './components/Header';
import Footer from './components/Footer';
import LoginPopup from './components/LoginPopup';
import ChatbotWidget from './shared/ChatbotWidget';

// USER
import Home from './pages/user/Home';
import UserProfile from './pages/user/UserProfile';
import EditProfile from './pages/user/EditProfile';
import SearchPage from './pages/user/SearchPage';
import ProductDetail from './pages/user/ProductDetail';
import CartPage from './pages/user/CartPage';
import MyOrdersPage from './pages/user/MyOrdersPage';
import OrderCheckoutPage from './pages/user/OrderCheckoutPage';
import OAuth2RedirectHandler from './OAuth2RedirectHandler';
import OrderDetail from './pages/user/OrderDetail';
import UserPromotionPage from './pages/user/UserPromotionPage';

// ADMIN
import AdminRoute from './routers/AdminRoute';

import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminPromotionsPage from './pages/admin/AdminPromotionsPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminBrandPage from './pages/admin/AdminBrandPage';
import AdminReportPage from './pages/admin/AdminReportPage';
import AdminUserPromotionPage from './pages/admin/AdminUserPromotionPage';
import AdminChatbotPage from './pages/admin/AdminChatbotPage';

const AppLayout = () => {

  const {
    currentUser,
    loading
  } = useAuth();

  const {
    fetchCartItems,
    clearCartContext
  } = useCart();

  const [
    loginPopupOpen,
    setLoginPopupOpen
  ] = useState(false);

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

  const adminGuard = (
    Component
  ) => (
    <AdminRoute
      currentUser={currentUser}
      loading={loading}
    >
      <Component />
    </AdminRoute>
  );

  return (
    <>
      <ScrollToTop />

      <div className="d-flex flex-column min-vh-100">

        <Header
          onLoginClick={() =>
            setLoginPopupOpen(true)
          }
          currentUser={currentUser}
        />

        <Routes>

          {/* USER */}
          <Route
            path="/"
            element={
              <Home
                currentUser={currentUser}
              />
            }
          />

          <Route
            path="/oauth2/redirect"
            element={<OAuth2RedirectHandler />}
          />

          <Route
            path="/profile"
            element={
              <UserProfile
                currentUser={currentUser}
              />
            }
          />

          <Route
            path="/profile/edit"
            element={
              <EditProfile
                currentUser={currentUser}
              />
            }
          />

          <Route
            path="/search"
            element={<SearchPage />}
          />

          <Route
            path="/product/:productId"
            element={<ProductDetail />}
          />

          <Route
            path="/cart"
            element={<CartPage />}
          />

          <Route
            path="/orders"
            element={<OrderCheckoutPage />}
          />

          <Route
            path="/my-orders"
            element={<MyOrdersPage />}
          />

          <Route
            path="/order/:id"
            element={<OrderDetail />}
          />

          <Route
            path="/promotions/my"
            element={
              <UserPromotionPage
                currentUser={currentUser}
              />
            }
          />

          {/* ADMIN */}
          <Route
            path="/admin"
            element={adminGuard(AdminDashboardPage)}
          />

          <Route
            path="/admin/products"
            element={adminGuard(AdminProductsPage)}
          />

          <Route
            path="/admin/categories"
            element={adminGuard(AdminCategoriesPage)}
          />

          <Route
            path="/admin/orders"
            element={adminGuard(AdminOrdersPage)}
          />

          <Route
            path="/admin/promotions"
            element={adminGuard(AdminPromotionsPage)}
          />

          <Route
            path="/admin/reviews"
            element={adminGuard(AdminReviewsPage)}
          />

          <Route
            path="/admin/users"
            element={adminGuard(AdminUsersPage)}
          />

          <Route
            path="/admin/brands"
            element={adminGuard(AdminBrandPage)}
          />

          <Route
            path="/admin/report"
            element={adminGuard(AdminReportPage)}
          />

          <Route
            path="/admin/send-promotion-email"
            element={adminGuard(AdminUserPromotionPage)}
          />

          <Route
            path="/admin/chatbot"
            element={adminGuard(AdminChatbotPage)}
          />

        </Routes>

        <Footer />

        <LoginPopup
          open={loginPopupOpen}
          onClose={() =>
            setLoginPopupOpen(false)
          }
          onSwitchToRegister={() => {}}
        />

        <ChatbotWidget />

      </div>
    </>
  );
};

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