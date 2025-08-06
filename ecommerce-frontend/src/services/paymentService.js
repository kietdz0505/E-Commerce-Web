import apiClient from '../api/axiosInstance';
import { API_CONFIG } from '../config/apiConfig';

export const createMomoPayment = async (orderId) => {
    try {
        const response = await apiClient.post(API_CONFIG.API.CREATE_MOMO_PAYMENT(orderId));
        return response.data;
    } catch (error) {
        console.error('Failed to create Momo payment:', error);
        throw error;
    }
};

export const createVnpayPayment = async (orderId) => {
    try {
        const response = await apiClient.post(API_CONFIG.API.CREATE_VNPAY_PAYMENT(orderId));
        return response.data;
    } catch (error) {
        console.error('Failed to create VNPay payment:', error);
        throw error;
    }
};
