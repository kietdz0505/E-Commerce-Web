// src/services/admin/adminOrderService.js
import { API_CONFIG } from '../../config/apiConfig';
import apiClient from '../../api/axiosInstance';

const adminOrderService = {
  // Lấy tất cả đơn hàng (phân trang)
  getAllOrders: (page = 0, size = 10, sortDirection = 'desc') =>
    apiClient
      .get(API_CONFIG.API.ADMIN_ORDERS.GET_ALL_ORDERS(page, size, sortDirection))
      .then(res => res.data),

  // Lấy chi tiết 1 đơn hàng
  getOrderById: (id) =>
    apiClient
      .get(API_CONFIG.API.ADMIN_ORDERS.GET_ORDER_BY_ID(id))
      .then(res => res.data),

  // Cập nhật trạng thái đơn hàng
  updateOrderStatus: (id, status) =>
    apiClient
      .put(API_CONFIG.API.ADMIN_ORDERS.UPDATE_ORDER_STATUS(id, status)),

  // Xóa đơn hàng
  deleteOrder: (id) =>
    apiClient
      .delete(API_CONFIG.API.ADMIN_ORDERS.DELETE_ORDER(id)),
};

export default adminOrderService;
