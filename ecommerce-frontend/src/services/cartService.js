import apiClient from '../api/axiosInstance';
import { API_CONFIG } from '../config/apiConfig';

export const placeOrder = async (checkoutForm, cartItems) => {
  const orderRequest = {
    receiverName: checkoutForm.receiverName,
    receiverPhone: checkoutForm.receiverPhone,
    deliveryAddress: checkoutForm.deliveryAddress,
    paymentMethod: checkoutForm.paymentMethod,
    promotionCode: checkoutForm.promotionCode || null,
    items: cartItems.map(item => ({
      productId: item.product.id,
      quantity: item.quantity
    }))
  };

  try {
    const response = await apiClient.post(API_CONFIG.API.PLACE_ORDER, orderRequest);
    return response.data;  // Trả về OrderResponse DTO từ backend
  } catch (error) {
    console.error('Failed to place order', error.response?.data || error.message);
    throw error;  // Để component xử lý alert/thông báo lỗi
  }
};
