import PaginationConfig from './paginationConfig';

export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',

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
