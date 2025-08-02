import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppAdmin from './admin/AppAdmin';
import Home from './user/Home';
import UserProfile from './pages/UserProfile';
import Header from './components/Header';
import Footer from './components/Footer';
import OAuth2RedirectHandler from './OAuth2RedirectHandler';
import { getApiUrl } from './config/apiConfig';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import EditProfile from './user/EditProfile';
import { Link } from 'react-router-dom';
import SearchPage from './pages/SearchPage';
import ProductDetail from './pages/ProductDetail';
import LoginPopup from './components/LoginPopup';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginPopupOpen, setLoginPopupOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(getApiUrl('profile'), {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setCurrentUser(data))
        .catch(err => console.error('Failed to fetch user', err));
    }
  }, []);

  const handleLoginClick = () => {
    setLoginPopupOpen(true);
  };

  const handleCloseLoginPopup = () => {
    setLoginPopupOpen(false);
  };

  const fetchUserProfile = () => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(getApiUrl('profile'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          console.log('Updated User:', data);
          setCurrentUser(data);
        })
        .catch(err => console.error('Failed to fetch user', err));
    }
  };

  return (
    <BrowserRouter>
      <Header onLoginClick={handleLoginClick} currentUser={currentUser} />

      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">AZStore</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
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
        <Route path="/admin/*" element={<AppAdmin />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
        <Route path="/profile" element={<UserProfile currentUser={currentUser} />} />
        <Route path="/profile/edit" element={<EditProfile currentUser={currentUser} onUpdateSuccess={fetchUserProfile} />} />
        <Route path="/" element={<Home currentUser={currentUser} />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/product/:productId" element={<ProductDetail onLoginClick={handleLoginClick} />} />
      </Routes>

      <Footer />

      {/* Popup Login */}
      <LoginPopup
        open={loginPopupOpen}
        onClose={handleCloseLoginPopup}
        onSwitchToRegister={() => { }}
      />
    </BrowserRouter>
  );
};

export default App;
