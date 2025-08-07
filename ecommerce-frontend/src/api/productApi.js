import axios from 'axios';
import { getApiUrl} from '../config/apiConfig';
import PaginationConfig from '../config/paginationConfig';

// ✅ Get All Products
export const getAllProducts = (page = PaginationConfig.DEFAULT_PAGE, size = PaginationConfig.DEFAULT_PAGE_SIZE) => {
  return axios.get(getApiUrl('PRODUCTS', page, size));
};

// ✅ Get Products by Category
export const getProductsByCategory = (categoryId, page = PaginationConfig.DEFAULT_PAGE, size = PaginationConfig.DEFAULT_PAGE_SIZE) => {
  return axios.get(getApiUrl('CATEGORY_PRODUCTS', categoryId, page, size));
};

// ✅ Get Brands by Category
export const getBrandsByCategory = (categoryId, page = PaginationConfig.DEFAULT_PAGE, size = PaginationConfig.DEFAULT_PAGE_SIZE) => {
  return axios.get(getApiUrl('BRANDS_BY_CATEGORY', categoryId, page, size));
};

// ✅ Get Products by Brand
export const getProductsByBrand = (brandId, page = PaginationConfig.DEFAULT_PAGE, size = PaginationConfig.DEFAULT_PAGE_SIZE) => {
  return axios.get(getApiUrl('PRODUCTS_BY_BRAND', brandId, page, size));
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
    Object.entries(params).filter(([_, v]) => v !== null && v !== '')
  );

  return axios.get(getApiUrl('SEARCH', filteredParams));
};
