import React, { useEffect, useState, useRef } from "react";
import { getAllCategories } from "../api/categoryApi";
import { getApiUrl } from '../config/apiConfig';
import PaginationConfig from "../config/paginationConfig";
import LoginPopup from "../components/LoginPopup";
import RegisterPopup from "../components/RegisterPopup";
import Header from "../components/Header";
import ProductList from '../pages/ProductList';
import SearchBar from "../components/SearchBar";
import { getAllProducts, getProductsByCategory, searchProducts } from '../api/productApi';
import { getBrandsByCategory } from '../api/brandApi';
import axios from 'axios';
import HeroBanner from "../components/HeroBanner";
import CategoryList from "../components/CategoryList";
import BrandList from "../components/BrandList";

function Home() {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(getApiUrl('PROFILE'), {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setCurrentUser(data))
        .catch(err => console.error('Failed to fetch user', err));
    }
  }, []);

  useEffect(() => {
    getAllCategories()
      .then((res) => {
        setCategories(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => console.error('Failed to load categories', err));

    loadProducts(0);
  }, []);

  const loadProducts = (page = PaginationConfig.DEFAULT_PAGE) => {
    setLoading(true);
    getAllProducts(page, PaginationConfig.DEFAULT_PAGE_SIZE)
      .then((res) => {
        const data = res.data;
        setProducts(Array.isArray(data.content) ? data.content : []);
        setCurrentPage(page);
        setTotalPages(data.totalPages);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load products', err);
        setLoading(false);
      });
  };

  const loadProductsByCategory = (categoryId, page = PaginationConfig.DEFAULT_PAGE) => {
    setLoading(true);
    setSelectedCategoryId(categoryId);
    setSelectedBrandId(null);
    setSelectedPriceRange(null);
    setSearchKeyword('');

    Promise.all([
      getProductsByCategory(categoryId, page, PaginationConfig.DEFAULT_PAGE_SIZE),
      getBrandsByCategory(categoryId)
    ])
      .then(([productsRes, brandsRes]) => {
        const productsData = productsRes.data;
        const brandsData = brandsRes.data;

        setProducts(Array.isArray(productsData.content) ? productsData.content : []);
        setBrands(Array.isArray(brandsData) ? brandsData : []);

        setCurrentPage(page);
        setTotalPages(productsData.totalPages);
        setLoading(false);

        scrollToProductList();
      })
      .catch((err) => {
        console.error('Failed to load products/brands by category', err);
        setLoading(false);
      });
  };

  const fetchProductsByCategoryAndBrand = async (categoryId, brandId, page = 0) => {
    setLoading(true);
    try {
      const url = getApiUrl('PRODUCTS_BY_CATEGORY_AND_BRAND', categoryId, brandId, page, PaginationConfig.DEFAULT_PAGE_SIZE);
      const response = await axios.get(url);
      const data = response.data;

      setProducts(Array.isArray(data.content) ? data.content : []);
      setCurrentPage(page);
      setTotalPages(data.totalPages);
      setLoading(false);
      scrollToProductList();
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const handleSearch = (filters) => {
    setLoading(true);
    setSearchKeyword(filters.keyword || '');
    setSelectedPriceRange(filters.minPrice !== null || filters.maxPrice !== null ? filters : null);
    setSelectedRating(filters.minRating || null);
    searchProducts(filters)
      .then(res => {
        const data = res.data;

        setProducts(Array.isArray(data.content) ? data.content : []);
        setCurrentPage(filters.page || 0);
        setTotalPages(data.totalPages);

        setSelectedCategoryId(null);
        setSelectedBrandId(null);
        setBrands([]);
        setLoading(false);

        scrollToProductList();
      })
      .catch(err => {
        console.error('Failed to search products', err.response ? err.response.data : err);
        setLoading(false);
      });
  };

  const handleBuyNowClick = () => {
    const productListSection = document.getElementById("product-list-section");
    if (productListSection) {
      productListSection.scrollIntoView({ behavior: "smooth" });
    }
  };


  const handleBrandClick = (brandId) => {
    setSelectedBrandId(brandId);
    fetchProductsByCategoryAndBrand(selectedCategoryId, brandId, 0);
  };

  const handlePageChange = (page) => {
    if (searchKeyword || selectedPriceRange !== null || selectedRating !== null) {
      const filters = {
        keyword: searchKeyword || '',
        minPrice: selectedPriceRange?.min || null,
        maxPrice: selectedPriceRange?.max || null,
        minRating: selectedRating || null,
        page: page,
        size: PaginationConfig.DEFAULT_PAGE_SIZE
      };


      handleSearch(filters);
    } else if (selectedBrandId && selectedCategoryId) {
      fetchProductsByCategoryAndBrand(selectedCategoryId, selectedBrandId, page);
    } else if (selectedCategoryId) {
      loadProductsByCategory(selectedCategoryId, page);
    } else {
      loadProducts(page);
    }
  };

  const resetFilters = () => {
    setSelectedCategoryId(null);
    setSelectedBrandId(null);
    setSelectedPriceRange(null);
    setSelectedRating(null);
    setSearchKeyword('');
    loadProducts(0);
  };

  const scrollToProductList = () => {
    setTimeout(() => {
      const productListSection = document.getElementById("product-list-section");
      if (productListSection) {
        productListSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="homepage bg-light" style={{ minHeight: "100vh" }}>
      <Header currentUser={currentUser} onLoginClick={() => setShowLogin(true)} />
      <LoginPopup open={showLogin} onClose={() => setShowLogin(false)} onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }} />
      <RegisterPopup open={showRegister} onClose={() => setShowRegister(false)} onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }} />

      <HeroBanner currentUser={currentUser} onBuyNowClick={handleBuyNowClick} />
      <SearchBar onSearch={handleSearch} />

      <div className="container">
        <div className="text-center my-3">
          <button className="btn btn-outline-secondary" onClick={resetFilters}>Xóa bộ lọc</button>
        </div>
      </div>

      <section className="py-4 bg-white" style={{ marginTop: '2rem' }}>
        <div className="container">
          <h2 className="mb-4 text-center fw-bold">Danh mục sản phẩm</h2>
          <section id="product-list-section">
            <CategoryList categories={categories} selectedCategoryId={selectedCategoryId} onCategoryClick={loadProductsByCategory} />
          </section>
          <BrandList brands={brands} selectedBrandId={selectedBrandId} onBrandClick={handleBrandClick} />
        </div>
      </section>

      <ProductList
        products={products}
        selectedCategoryId={selectedCategoryId}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        loading={loading}
        selectedBrandId={selectedBrandId}
      />
    </div>
  );
}

export default Home;
