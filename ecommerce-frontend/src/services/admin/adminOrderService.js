import axios from 'axios';
import { API_CONFIG } from '../../config/apiConfig';

// Lấy tất cả đơn hàng (phân trang)
export const getAllOrders = async (page = 0, size = 10, sortDirection = 'desc') => {
    const token = localStorage.getItem('token');
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API.ADMIN_ORDERS.GET_ALL_ORDERS(page, size, sortDirection)}`;
    const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

// Lấy chi tiết 1 đơn hàng
export const getOrderById = async (id) => {
    const token = localStorage.getItem('token');
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API.ADMIN_ORDERS.GET_ORDER_BY_ID(id)}`;
    const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (id, status) => {
    const token = localStorage.getItem('token');
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API.ADMIN_ORDERS.UPDATE_ORDER_STATUS(id, status)}`;
    await axios.put(url, null, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// Xóa đơn hàng
export const deleteOrder = async (id) => {
    const token = localStorage.getItem('token');
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API.ADMIN_ORDERS.DELETE_ORDER(id)}`;
    await axios.delete(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

const adminOrderService = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
};
export default adminOrderService;