import apiClient from "../api/axiosInstance";
import { getApiUrl } from '../config/apiConfig';
import PaginationConfig from '../config/paginationConfig';

export const getAllProducts = (page = PaginationConfig.DEFAULT_PAGE, size = PaginationConfig.DEFAULT_PAGE_SIZE) => {
  return apiClient.get(getApiUrl('PRODUCTS', page, size));
};

export const getProductsByCategory = (categoryId, page = PaginationConfig.DEFAULT_PAGE, size = PaginationConfig.DEFAULT_PAGE_SIZE) => {
  return apiClient.get(getApiUrl('CATEGORY_PRODUCTS', categoryId, page, size));
};

export const getBrandsByCategory = (categoryId, page = PaginationConfig.DEFAULT_PAGE, size = PaginationConfig.DEFAULT_PAGE_SIZE) => {
  return apiClient.get(getApiUrl('BRANDS_BY_CATEGORY', categoryId, page, size));
};

export const getProductsByBrand = (brandId, page = PaginationConfig.DEFAULT_PAGE, size = PaginationConfig.DEFAULT_PAGE_SIZE) => {
  return apiClient.get(getApiUrl('PRODUCTS_BY_BRAND', brandId, page, size));
};

export const searchProducts = (filters) => {
  const params = {
    keyword: filters.keyword || '',
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minRating: filters.minRating,
    page: filters.page || 0,
    size: filters.size || PaginationConfig.DEFAULT_PAGE_SIZE
  };

  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== '')
  );

  return apiClient.get(getApiUrl('SEARCH', filteredParams));
};