import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import apiClient from "../../api/axiosInstance";
import { getAllCategories } from "../../api/categoryApi";
import { getApiUrl } from '../../config/apiConfig';
import PaginationConfig from "../../config/paginationConfig";
import { getAllProducts, getProductsByCategory, searchProducts } from '../../api/productApi';
import { getBrandsByCategory } from '../../api/brandApi';

import LoginPopup from "../../components/LoginPopup";
import RegisterPopup from "../../components/RegisterPopup";
import Header from "../../components/Header";
import ProductList from './ProductList';
import SearchBar from "../../components/SearchBar";
import HeroBanner from "../../components/HeroBanner";
import CategoryList from "../../components/CategoryList";
import BrandList from "../../components/BrandList";

import '../../styles/home.css';
import '../../styles/skeleton.css';

function Home() {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [selectedBrandId, setSelectedBrandId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [selectedRating, setSelectedRating] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const location = useLocation();

  // ===== LOAD INIT =====
  useEffect(() => {
    setLoadingCategories(true);
    getAllCategories()
      .then(res => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Error loading categories:", err))
      .finally(() => setLoadingCategories(false));

    loadProducts(0);
  }, []);

  // ===== SCROLL FROM HEADER =====
  useEffect(() => {
    if (location.state?.scrollTo) {
      const el = document.getElementById(location.state.scrollTo);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  const loadProducts = (page = PaginationConfig.DEFAULT_PAGE) => {
    setLoadingProducts(true);
    getAllProducts(page, PaginationConfig.DEFAULT_PAGE_SIZE)
      .then(res => {
        const data = res.data;
        setProducts(data.content || []);
        setCurrentPage(page);
        setTotalPages(data.totalPages || 0);
      })
      .catch(err => {
        console.error("Error loading products:", err);
        setProducts([]);
      })
      .finally(() => setLoadingProducts(false));
  };

  const loadProductsByCategory = (categoryId, page = 0) => {
    setLoadingProducts(true);
    setSelectedCategoryId(categoryId);
    setSelectedBrandId(null);
    setSelectedPriceRange(null);
    setSearchKeyword('');

    Promise.all([
      getProductsByCategory(categoryId, page, PaginationConfig.DEFAULT_PAGE_SIZE),
      getBrandsByCategory(categoryId)
    ])
      .then(([pRes, bRes]) => {
        setProducts(pRes.data?.content || []);
        setBrands(bRes.data || []);
        setCurrentPage(page);
        setTotalPages(pRes.data?.totalPages || 0);
        scrollToProductList();
      })
      .catch(err => {
        console.error("Error loading category products:", err);
        setProducts([]);
      })
      .finally(() => setLoadingProducts(false));
  };

  const fetchProductsByCategoryAndBrand = async (categoryId, brandId, page = 0) => {
    setLoadingProducts(true);
    try {
      const url = getApiUrl('PRODUCTS_BY_CATEGORY_AND_BRAND', categoryId, brandId, page, PaginationConfig.DEFAULT_PAGE_SIZE);
      const res = await apiClient.get(url);

      setProducts(res.data?.content || []);
      setCurrentPage(page);
      setTotalPages(res.data?.totalPages || 0);
      scrollToProductList();
    } catch (err) {
      console.error("Error loading by category and brand:", err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSearch = (filters) => {
    setLoadingProducts(true);
    setSearchKeyword(filters.keyword || '');
    setSelectedPriceRange(filters);
    setSelectedRating(filters.minRating || null);

    searchProducts(filters)
      .then(res => {
        setProducts(res.data?.content || []);
        setCurrentPage(filters.page || 0);
        setTotalPages(res.data?.totalPages || 0);
        setSelectedCategoryId(null);
        setSelectedBrandId(null);
        setBrands([]);
        scrollToProductList();
      })
      .catch(err => {
        console.error("Search failed:", err);
        setProducts([]);
      })
      .finally(() => setLoadingProducts(false));
  };

  const handlePageChange = (page) => {
    if (searchKeyword || selectedPriceRange || selectedRating) {
      handleSearch({
        keyword: searchKeyword,
        minPrice: selectedPriceRange?.min,
        maxPrice: selectedPriceRange?.max,
        minRating: selectedRating,
        page,
        size: PaginationConfig.DEFAULT_PAGE_SIZE
      });
    } else if (selectedBrandId && selectedCategoryId) {
      fetchProductsByCategoryAndBrand(selectedCategoryId, selectedBrandId, page);
    } else if (selectedCategoryId) {
      loadProductsByCategory(selectedCategoryId, page);
    } else {
      loadProducts(page);
    }
  };

  const handleBuyNowClick = () => {
    const el = document.getElementById("product-list-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleBrandClick = (brandId) => {
    setSelectedBrandId(brandId);
    fetchProductsByCategoryAndBrand(selectedCategoryId, brandId);
  };

  const resetAllFilters = () => {
    setSelectedCategoryId(null);
    setSelectedBrandId(null);
    setSelectedPriceRange(null);
    setSelectedRating(null);
    setSearchKeyword('');
    setBrands([]);
    loadProducts(0);
  };

  const scrollToProductList = () => {
    setTimeout(() => {
      const el = document.getElementById("product-list-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="az-homepage">
      <Header onLoginClick={() => setShowLogin(true)} />

      <LoginPopup
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />

      <RegisterPopup
        open={showRegister}
        onClose={() => setShowRegister(false)}
        onSwitchToLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />

      <HeroBanner onBuyNowClick={handleBuyNowClick} />

      <SearchBar onSearch={handleSearch} onResetAll={resetAllFilters} />

      <section id="products-section" className="az-catalog-section">
        <div className="container px-md-3 px-0"> 
          <h2 className="az-section-title px-3 px-md-0">Danh mục sản phẩm</h2>

          <div id="product-list-section">
            {loadingCategories ? (
              <div className="az-mobile-scroll-container az-skeleton-scroll-wrapper">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="az-skeleton-category-item">
                    <div className="az-skeleton az-skeleton-category-circle"></div>
                    <div className="az-skeleton az-skeleton-category-text"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="az-mobile-scroll-container">
                <CategoryList
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  onCategoryClick={loadProductsByCategory}
                />
              </div>
            )}
          </div>

          {brands.length > 0 && (
            <div className="az-mobile-scroll-container">
              <BrandList
                brands={brands}
                selectedBrandId={selectedBrandId}
                onBrandClick={handleBrandClick}
              />
            </div>
          )}
        </div>
      </section>

      <ProductList
        products={products}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        loading={loadingProducts}
      />
    </div>
  );
}

export default Home;