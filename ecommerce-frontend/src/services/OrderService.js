import apiClient from '../api/axiosInstance';
import { API_CONFIG } from '../config/apiConfig';
import PaginationConfig from '../config/paginationConfig';

export const getMyOrders = async (page = PaginationConfig.DEFAULT_PAGE, size = PaginationConfig.DEFAULT_PAGE_SIZE) => {
    try {
        const response = await apiClient.get(API_CONFIG.API.GET_MY_ORDERS(page, size));
        return response.data;
    } catch (error) {
        console.error('Failed to fetch my orders:', error);
        return null;
    }
};
