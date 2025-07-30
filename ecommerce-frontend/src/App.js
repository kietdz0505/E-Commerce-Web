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
import EditProfile from './user/EditProfile';  // <-- Import EditProfile component


const App = () => {
  const [currentUser, setCurrentUser] = useState(null);

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
    // Mở popup login hoặc redirect login page
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
      <Routes>
        <Route path="/admin/*" element={<AppAdmin />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
        <Route path="/profile" element={<UserProfile currentUser={currentUser} />} />
        <Route path="/profile/edit" element={<EditProfile currentUser={currentUser} onUpdateSuccess={fetchUserProfile} />} />
        <Route path="/" element={<Home currentUser={currentUser} />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;
