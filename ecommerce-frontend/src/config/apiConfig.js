import PaginationConfig from './paginationConfig';

export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',

  OAUTH: {
    FACEBOOK: '/oauth2/authorization/facebook',
    GOOGLE: '/oauth2/authorization/google',
    LOCAL: '/auth/login',
    REGISTER: '/auth/register'
  },

  API: {
    PRODUCTS: '/api/products',
    CATEGORIES: '/api/categories',
    USERS: '/api/users',
    DASHBOARD: '/api/dashboard',
    PROFILE: '/api/users/me',
    EDIT_PROFILE: '/api/users/profile',
    CHANGE_PASSWORD: '/api/users/change-password',
    CATEGORY_PRODUCTS: (categoryId, page = PaginationConfig.DEFAULT_PAGE, size = PaginationConfig.DEFAULT_SIZE) =>
      `/api/categories/${categoryId}/products?page=${page}&size=${size}`
  }
};

// OAuth URL Helper
export const getOAuthUrl = (provider) => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.OAUTH[provider.toUpperCase()]}`;
};

// API URL Helper
export const getApiUrl = (endpoint, ...params) => {
  const apiEndpoint = API_CONFIG.API[endpoint.toUpperCase()];
  if (typeof apiEndpoint === 'function') {
    return `${API_CONFIG.BASE_URL}${apiEndpoint(...params)}`;
  }
  return `${API_CONFIG.BASE_URL}${apiEndpoint}`;
};
