import apiClient from './axiosInstance';

export const placeOrder = async (orderRequest) => {
  const response = await apiClient.post('/api/orders', orderRequest);
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await apiClient.get(`/api/orders/${orderId}`);
  return response.data;
};

export const getMyOrders = async (page = 0, size = 5) => {
  const response = await apiClient.get(`/api/orders/my?page=${page}&size=${size}`);
  return response.data;
};
