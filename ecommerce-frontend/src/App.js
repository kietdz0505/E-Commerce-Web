import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { NotificationProvider } from './shared/NotificationContext';
import { CartProvider, useCart } from './shared/CartContext';
import { getApiUrl } from './config/apiConfig';
import ChatbotWidget from './shared/ChatbotWidget';  // thêm import
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './api/axiosInstance';

import Header from './components/Header';
import Footer from './components/Footer';
import LoginPopup from './components/LoginPopup';
import Home from './user/Home';
import UserProfile from './pages/UserProfile';
import EditProfile from './user/EditProfile';
import SearchPage from './pages/SearchPage';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import MyOrdersPage from './pages/MyOrdersPage';
import OrderCheckoutPage from './pages/OrderCheckoutPage';
import OAuth2RedirectHandler from './OAuth2RedirectHandler';
import OrderDetail from './pages/OrderDetail';
import UserPromotionPage from './pages/UserPromotionPage';


// Admin pages
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
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loginPopupOpen, setLoginPopupOpen] = useState(false);
  const { fetchCartItems, clearCartContext } = useCart();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      fetch(getApiUrl('profile'), {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setCurrentUser(data);
          localStorage.setItem('user', JSON.stringify({ ...data, token }));
          fetchCartItems();
        })
        .catch(err => {
          console.error('Failed to fetch user', err);
          clearCartContext();
          localStorage.removeItem('user');
        })
        .finally(() => setLoadingUser(false));
    } else {
      clearCartContext();
      localStorage.removeItem('user');
      setLoadingUser(false);
    }
  }, []);

  const fetchUserProfile = () => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(getApiUrl('profile'), {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          console.log("User data from API:", data);
          setCurrentUser(data);
          localStorage.setItem('user', JSON.stringify({ ...data, token }));
        })
        .catch(err => console.error('Failed to fetch user', err));
    }
  };

  const handleLoginClick = () => setLoginPopupOpen(true);
  const handleCloseLoginPopup = () => setLoginPopupOpen(false);

  return (
    <>
      <div className="d-flex flex-column min-vh-100">
        <Header onLoginClick={handleLoginClick} currentUser={currentUser} />

        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <div className="container">
            <Link className="navbar-brand fw-bold" to="/">AZStore</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className="nav-link" to="/search">Tìm kiếm</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <Routes>
          {/* Route người dùng */}
          <Route path="/" element={<Home currentUser={currentUser} />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          <Route path="/profile" element={<UserProfile currentUser={currentUser} />} />
          <Route path="/profile/edit" element={<EditProfile currentUser={currentUser} onUpdateSuccess={fetchUserProfile} />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/product/:productId" element={<ProductDetail onLoginClick={handleLoginClick} />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrderCheckoutPage />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />
          <Route path="/order/:id" element={<OrderDetail />} />
          <Route path="/promotions/my" element={<UserPromotionPage currentUser={currentUser} />} />

          {/* Route admin */}
          <Route path="/admin/products" element={<AdminRoute currentUser={currentUser} loading={loadingUser}><AdminProductsPage /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute currentUser={currentUser} loading={loadingUser}><AdminCategoriesPage /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute currentUser={currentUser} loading={loadingUser}><AdminOrdersPage /></AdminRoute>} />
          <Route path="/admin/promotions" element={<AdminRoute currentUser={currentUser} loading={loadingUser}><AdminPromotionsPage /></AdminRoute>} />
          <Route path="/admin/reviews" element={<AdminRoute currentUser={currentUser} loading={loadingUser}><AdminReviewsPage /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute currentUser={currentUser} loading={loadingUser}><AdminUsersPage /></AdminRoute>} />
          <Route path="/admin" element={<AdminRoute currentUser={currentUser} loading={loadingUser}><AdminDashboardPage /></AdminRoute>} />
          <Route path="/admin/brands" element={<AdminRoute currentUser={currentUser} loading={loadingUser}><AdminBrandPage /></AdminRoute>} />
          <Route path="/admin/report" element={<AdminRoute currentUser={currentUser} loading={loadingUser}><AdminReportPage /></AdminRoute>} />
          <Route path="/admin/send-promotion-email" element={<AdminRoute currentUser={currentUser} loading={loadingUser}><AdminUserPromotionPage /></AdminRoute>} />
          <Route path="/admin/chatbot" element={<AdminRoute currentUser={currentUser} loading={loadingUser}><AdminChatbotPage /></AdminRoute>} />

        </Routes>

        <Footer />

        <LoginPopup open={loginPopupOpen} onClose={handleCloseLoginPopup} onSwitchToRegister={() => { }} />
        <ChatbotWidget />
      </div>
    </>
  );
};

const App = () => (
  <NotificationProvider>
    <CartProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </CartProvider>
  </NotificationProvider>
);

export default App;
