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


    SEARCH: (params = {}) => {
      const {
        keyword = '',
        minPrice,
        maxPrice,
        minRating,
        page = PaginationConfig.DEFAULT_PAGE,
        size = PaginationConfig.DEFAULT_PAGE_SIZE
      } = params;

      const searchParams = new URLSearchParams();

      if (keyword) searchParams.append('keyword', keyword);
      if (minPrice != null) searchParams.append('minPrice', minPrice);
      if (maxPrice != null) searchParams.append('maxPrice', maxPrice);
      if (minRating != null) searchParams.append('minRating', minRating);

      searchParams.append('page', page);
      searchParams.append('size', size);

      return `/api/products/search?${searchParams.toString()}`;
    },
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
