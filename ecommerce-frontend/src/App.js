import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { NotificationProvider } from './shared/NotificationContext';
import Home from './user/Home';
import UserProfile from './pages/UserProfile';
import Header from './components/Header';
import Footer from './components/Footer';
import OAuth2RedirectHandler from './OAuth2RedirectHandler';
import { getApiUrl } from './config/apiConfig';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import MyOrdersPage from './pages/MyOrdersPage';
import './api/axiosInstance';
import EditProfile from './user/EditProfile';
import SearchPage from './pages/SearchPage';
import ProductDetail from './pages/ProductDetail';
import LoginPopup from './components/LoginPopup';
import { CartProvider, useCart } from './shared/CartContext';
import CartPage from './pages/CartPage';
import OrderCheckoutPage from './pages/OrderCheckoutPage';


const AppLayout = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginPopupOpen, setLoginPopupOpen] = useState(false);
  const { fetchCartItems, clearCartContext } = useCart();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      fetch(getApiUrl('PROFILE'), {
        headers: { 'Authorization': `Bearer ${token}` }
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
        });
    } else {
      clearCartContext();
      localStorage.removeItem('user');
    }
  }, []);

  const handleLoginClick = () => setLoginPopupOpen(true);
  const handleCloseLoginPopup = () => setLoginPopupOpen(false);

  const fetchUserProfile = () => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(getApiUrl('PROFILE'), {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setCurrentUser(data);
          localStorage.setItem('user', JSON.stringify({ ...data, token }));
        })
        .catch(err => console.error('Failed to fetch user', err));
    }
  };

  return (
    <>
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


        {/* 👇 Các route người dùng */}
        <Route path="/" element={<Home currentUser={currentUser} />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
        <Route path="/profile" element={<UserProfile currentUser={currentUser} />} />
        <Route path="/profile/edit" element={<EditProfile currentUser={currentUser} onUpdateSuccess={fetchUserProfile} />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/product/:productId" element={<ProductDetail onLoginClick={handleLoginClick} />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrderCheckoutPage />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
      </Routes>

      <Footer />

      <LoginPopup
        open={loginPopupOpen}
        onClose={handleCloseLoginPopup}
        onSwitchToRegister={() => { }}
      />
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
