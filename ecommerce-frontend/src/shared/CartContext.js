import { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/apiConfig';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const fetchCartItems = async () => {
    try {
      const response = await axios.get(getApiUrl('GET_CART_ITEMS'), {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      const url = getApiUrl('ADD_TO_CART', product.id, quantity);
      const response = await axios.post(url, null, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      const newItem = response.data;

      setCartItems((prev) => {
        const exists = prev.find(item => item.id === newItem.id);
        if (exists) {
          return prev.map(item => item.id === newItem.id ? { ...item, quantity: newItem.quantity } : item);
        } else {
          return [...prev, newItem];
        }
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const clearCartContext = () => {
    setCartItems([]);
  };

  const clearCart = async () => {
    try {
      await axios.delete(getApiUrl('CLEAR_CART'), {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const updateCartItem = async (cartItemId, quantity) => {
  try {
    await axios.put(getApiUrl('UPDATE_CART_ITEM', cartItemId, quantity), null, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    // Update local state sau khi server thành công
    setCartItems(prev =>
      prev.map(item =>
        item.id === cartItemId ? { ...item, quantity } : item
      )
    );
  } catch (error) {
    console.error('Error updating cart item:', error);
  }
};

const incrementItem = async (cartItemId) => {
  const item = cartItems.find(item => item.id === cartItemId);
  if (item) {
    await updateCartItem(cartItemId, item.quantity + 1);
  }
};

const decrementItem = async (cartItemId) => {
  const item = cartItems.find(item => item.id === cartItemId);
  if (item) {
    if (item.quantity > 1) {
      await updateCartItem(cartItemId, item.quantity - 1);
    } else {
      await removeItem(cartItemId);  // Nếu còn 1 thì xóa luôn
    }
  }
};

const removeItem = async (cartItemId) => {
  try {
    await axios.delete(getApiUrl('REMOVE_CART_ITEM', cartItemId), {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    // Xóa khỏi local state
    setCartItems(prev => prev.filter(item => item.id !== cartItemId));
  } catch (error) {
    console.error('Error removing cart item:', error);
  }
};


  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      fetchCartItems,
      addToCart,            
      clearCartContext,
      clearCart,
      cartCount,
      incrementItem,
      decrementItem,
      removeItem,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
