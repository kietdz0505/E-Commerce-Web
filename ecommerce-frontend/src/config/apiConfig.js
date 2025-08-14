import { UPDATE } from 'react-admin';
import PaginationConfig from './paginationConfig';

export const API_CONFIG = {
  BASE_URL: 'https://e-commerce-web-xm8f.onrender.com',

  OAUTH: {
    FACEBOOK: '/oauth2/authorization/facebook',
    GOOGLE: '/oauth2/authorization/google',
    LOCAL: '/auth/login',
    REGISTER: '/auth/register',
  },

  API: {
    BRANDS_BY_CATEGORY: (categoryId, page = PaginationConfig.DEFAULT_PAGE, size = PaginationConfig.DEFAULT_PAGE_SIZE) =>
      `/api/brands/category/${categoryId}?page=${page}&size=${size}`,

    PRODUCTS: (page = PaginationConfig.DEFAULT_PAGE, size = PaginationConfig.DEFAULT_PAGE_SIZE) =>
      `/api/products?page=${page}&size=${size}`,

    CATEGORIES: '/api/categories',

    CATEGORY_PRODUCTS: (categoryId, page = PaginationConfig.DEFAULT_PAGE, size = PaginationConfig.DEFAULT_PAGE_SIZE) =>
      `/api/categories/${categoryId}/products?page=${page}&size=${size}`,

    PRODUCTS_BY_CATEGORY_AND_BRAND: (categoryId, brandId, page = PaginationConfig.DEFAULT_PAGE, size = PaginationConfig.DEFAULT_PAGE_SIZE) =>
      `/api/categories/${categoryId}/brands/${brandId}/products?page=${page}&size=${size}`,

    USERS: '/api/users',
    PRODUCT_DETAIL: (productId) => `/api/products/${productId}`,
    DASHBOARD: '/api/dashboard',
    PROFILE: '/api/users/me',
    EDIT_PROFILE: '/api/users/profile',
    CHANGE_PASSWORD: '/api/users/change-password',

    PRODUCT_REVIEWS: (productId) => `/api/products/${productId}/reviews`,

    PRODUCT_REVIEW_DETAIL: (productId, reviewId) => `/api/products/${productId}/reviews/${reviewId}`,

    GET_CART: '/api/cart',

    GET_CART_ITEMS: '/api/cart/items',

    ADD_TO_CART: (productId, quantity) =>
      `/api/cart/add?productId=${productId}&quantity=${quantity}`,

    UPDATE_CART_ITEM: (cartItemId, quantity) =>
      `/api/cart/update/${cartItemId}?quantity=${quantity}`,

    REMOVE_CART_ITEM: (cartItemId) =>
      `/api/cart/remove/${cartItemId}`,

    CLEAR_CART: '/api/cart/clear',

    CART_TOTAL: '/api/cart/total',

    PLACE_ORDER: '/api/orders',  // POST request

    GET_ORDER_BY_ID: (orderId) => `/api/orders/${orderId}`,  // GET request

    UPDATE_ORDER_STATUS: (orderId) => `/api/orders/${orderId}/status`,  // PUT request

    GET_MY_ORDERS: (page = PaginationConfig.DEFAULT_PAGE, size = PaginationConfig.DEFAULT_PAGE_SIZE) =>
      `/api/orders/my?page=${page}&size=${size}`,

    PROMOTIONS_BY_PRODUCTS: (productIds) => `api/promotions/by-products?productIds=${productIds.join(',')}`,

    // Payment APIs
    CREATE_MOMO_PAYMENT: (orderId) => `/api/payment/momo?orderId=${orderId}`,
    CREATE_VNPAY_PAYMENT: (orderId) => `/api/payment/vnpay?orderId=${orderId}`,

    PAYMENT_RETURN_MOMO: '/payment/momo-return',
    PAYMENT_RETURN_VNPAY: '/payment/vnpay-return',
    CANCEL_ORDER: (orderId) => `/api/orders/${orderId}/cancel`, // DELETE request
    SEARCH: (filters) => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      return `/api/products/search?${params.toString()}`;
    },

    ADMIN_CATEGORIES: {
      // Category management
      GET_CATEGORIES: (page = PaginationConfig.DEFAULT_PAGE, size = PaginationConfig.DEFAULT_PAGE_SIZE) =>
        `/api/admin/categories?page=${page}&size=${size}`,
      GET_CATEGORY_BY_ID: (id) => `/api/admin/categories/${id}`,
      CREATE_CATEGORY: '/api/admin/categories', // POST request
      UPDATE_CATEGORY: (id) => `/api/admin/categories/${id}`, // PUT request
      DELETE_CATEGORY: (id) => `/api/admin/categories/${id}`, // DELETE request
    },

    ADMIN_ORDERS: {
      GET_ALL_ORDERS: (page = PaginationConfig.DEFAULT_PAGE, size = PaginationConfig.DEFAULT_PAGE_SIZE, sortDirection = 'desc') =>
        `/api/admin/orders?page=${page}&size=${size}&sortDirection=${sortDirection}`,
      GET_ORDER_BY_ID: (id) => `/api/admin/orders/${id}`,
      UPDATE_ORDER_STATUS: (id, status) => `/api/admin/orders/${id}/status?status=${status}`,
      DELETE_ORDER: (id) => `/api/admin/orders/${id}`,
    },
    ADMIN_BRANDS: {
      GET_ALL_BRANDS: (page = PaginationConfig.DEFAULT_PAGE, size = PaginationConfig.DEFAULT_PAGE_SIZE) =>
        `/api/admin/brands?page=${page}&size=${size}`,

      GET_BRAND_BY_ID: (id) => `/api/admin/brands/${id}`,
      CREATE_BRAND: '/api/admin/brands', // POST request
      UPDATE_BRAND: (id) => `/api/admin/brands/${id}`, // PUT request
      DELETE_BRAND: (id) => `/api/admin/brands/${id}`, // DELETE request
    },

    ADMIN_PRODUCTS: {
      SEARCH_PRODUCTS: (keyword) => `/api/admin/products/search?keyword=${keyword}`,
      CREATE_PRODUCT: '/api/admin/products', // POST request
      UPDATE_PRODUCT: (id) => `/api/admin/products/${id}`, // PUT request
      DELETE_PRODUCT: (id) => `/api/admin/products/${id}`, // DELETE request
      GET_ALL_PRODUCTS: (page = PaginationConfig.DEFAULT_PAGE, size = PaginationConfig.DEFAULT_PAGE_SIZE) =>
        `/api/admin/products?page=${page}&size=${size}`, // GET request
    },

    ADMIN_PROMOTIONS: {
      CREATE_PROMOTION: '/api/admin/promotions', // POST request
      GET_PROMOTIONS: '/api/admin/promotions', // GET request
      UPDATE_PROMOTION: (id) => `/api/admin/promotions/${id}`, // PUT request
      DELETE_PROMOTION: (id) => `/api/admin/promotions/${id}`, // DELETE request
    },

    ADMIN_REVIEWS: {
      DELETE_REVIEW: (productId, reviewId) =>
        `/api/admin/products/${productId}/reviews/${reviewId}`, // DELETE request
      GET_ALL_REVIEWS: (productId, page = PaginationConfig.DEFAULT_PAGE, size = PaginationConfig.DEFAULT_PAGE_SIZE) =>
        `/api/admin/products/${productId}/reviews?page=${page}&size=${size}`, // GET request
    },

    ADMIN_USERS: {
      GET_ALL: (page = PaginationConfig.DEFAULT_PAGE, size = PaginationConfig.DEFAULT_PAGE_SIZE) => `/api/admin/users?page=${page}&size=${size}`, // GET
      GET_BY_ID: (id) => `/api/admin/users/${id}`, // GET
      DELETE: (id) => `/api/admin/users/${id}`, // DELETE
      COUNT: `/api/admin/users/count`, // GET
      UPDATE_ROLE: (id) => `/api/admin/users/${id}/role`, // PUT
      LOCK_USER: (id, lock) => `/api/admin/users/${id}/lock?lock=${lock}`, // PUT
    },
    ADMIN_DASHBOARD: '/api/admin/dashboard-stats', // GET request for dashboard stats

    ADMIN_STATS: '/api/admin/report/overview',

    ADMIN_SEND_PROMOTION : {
      SEND_ALL: (promotionId) => `/api/admin/user-promotions/send-all/${promotionId}`,
      SEND_BY_EMAIL: (promotionId, email) => `/api/admin/user-promotions/send-one/${promotionId}?email=${encodeURIComponent(email)}`
    }


  },
};

export const getOAuthUrl = (provider) => {
  const providerKey = provider.toUpperCase();
  if (!API_CONFIG.OAUTH[providerKey]) {
    throw new Error(`OAuth provider '${provider}' not supported`);
  }
  return `${API_CONFIG.BASE_URL}${API_CONFIG.OAUTH[providerKey]}`;
};

export const getApiUrl = (endpoint, ...params) => {
  const endpointKey = endpoint.toUpperCase();
  if (!API_CONFIG.API[endpointKey]) {
    throw new Error(`API endpoint '${endpoint}' not found`);
  }
  const apiEndpoint = API_CONFIG.API[endpointKey];
  const url = typeof apiEndpoint === 'function' ? `${API_CONFIG.BASE_URL}${apiEndpoint(...params)}` : `${API_CONFIG.BASE_URL}${apiEndpoint}`;
  console.log(`Generated URL for ${endpoint}: ${url}`); // Debug URL
  return url;
};
