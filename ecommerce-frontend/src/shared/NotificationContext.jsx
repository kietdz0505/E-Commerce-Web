import React, { createContext, useContext, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/notificationContext.css';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {

  // ===== CORE FUNCTION =====
  const notify = useCallback((message, type = 'info', options = {}) => {
    const isMobile = window.innerWidth < 576;

    toast(message, {
      type,
      position: isMobile ? "top-center" : "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
      ...options
    });
  }, []);

  // ===== PRESET FUNCTIONS =====
  const success = (msg, options) => notify(msg, 'success', options);
  const error = (msg, options) => notify(msg, 'error', options);
  const warning = (msg, options) => notify(msg, 'warning', options);
  const info = (msg, options) => notify(msg, 'info', options);

  // ===== PREVENT DUPLICATE =====
  const notifyOnce = (id, message, type = 'info') => {
    const isMobile = window.innerWidth < 576;
    if (!toast.isActive(id)) {
      toast(message, { 
        toastId: id, 
        type,
        position: isMobile ? "top-center" : "top-right",
        theme: "colored"
      });
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notify,
        success,
        error,
        warning,
        info,
        notifyOnce
      }}
    >
      {children}

      <ToastContainer
        limit={3} 
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);