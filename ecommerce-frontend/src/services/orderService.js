import apiClient from '../api/axiosInstance';
import { API_CONFIG } from '../config/apiConfig';
import PaginationConfig from '../config/paginationConfig';
import { getApiUrl } from '../config/apiConfig';

export const getMyOrders = async (page = PaginationConfig.DEFAULT_PAGE, size = PaginationConfig.DEFAULT_PAGE_SIZE) => {
    try {
        const response = await apiClient.get(API_CONFIG.API.GET_MY_ORDERS(page, size));
        return response.data;
    } catch (error) {
        console.error('Failed to fetch my orders:', error);
        throw error; // Ném lỗi để xử lý ở component
    }
};

export const cancelOrder = async (orderId) => {
    const url = getApiUrl('CANCEL_ORDER', orderId);
    console.log("Gửi yêu cầu hủy đến:", url);
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });

    console.log("Phản hồi từ server:", response.status, response.statusText);
    if (!response.ok) {
        const errorText = await response.text();
        console.error("Lỗi từ server:", errorText);
        throw new Error(errorText || 'Hủy đơn hàng thất bại');
    }
    
    const result = await response.text();
    console.log("Kết quả hủy đơn:", result);
    return result;
};