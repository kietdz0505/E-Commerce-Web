import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';

import { BrowserRouter } from 'react-router-dom';

import './App.css';

import App from './App.jsx';

import { Toaster } from 'react-hot-toast';
import Collapse from "bootstrap/js/dist/collapse";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import 'bootstrap-icons/font/bootstrap-icons.css';
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import {
  AuthProvider
} from './shared/AuthContext';

import {
  CartProvider
} from './shared/CartContext';

import {
  NotificationProvider
} from './shared/NotificationContext';

createRoot(
  document.getElementById('root')
).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    <Toaster position="top-right" />
  </StrictMode>
);