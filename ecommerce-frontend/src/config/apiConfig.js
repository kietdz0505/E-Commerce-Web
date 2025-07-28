// Cấu hình API endpoints
export const API_CONFIG = {
  // Base URL cho backend
  BASE_URL: 'http://localhost:8080',
  
  // OAuth endpoints
  OAUTH: {
    FACEBOOK: '/oauth2/authorization/facebook',
    GOOGLE: '/oauth2/authorization/google'
  },
  
  // API endpoints khác
  API: {
    PRODUCTS: '/api/products',
    CATEGORIES: '/api/categories',
    USERS: '/api/users',
    DASHBOARD: '/api/dashboard',
    PROFILE:'/api/users/me'
  }
};

// Helper functions để tạo URL đầy đủ
export const getOAuthUrl = (provider) => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.OAUTH[provider.toUpperCase()]}`;
};

export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API[endpoint.toUpperCase()]}`;
}; 