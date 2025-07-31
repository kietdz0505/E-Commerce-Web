import React, { useEffect, useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { getAllCategories } from "../api/categoryApi";
import { getApiUrl } from '../config/apiConfig';
import PaginationConfig from "../config/paginationConfig";
import LoginPopup from "../components/LoginPopup";
import RegisterPopup from "../components/RegisterPopup";
import Header from "../components/Header";
import ProductList from '../pages/ProductList';
import { getAllProducts, getProductsByCategory, searchProducts } from '../api/productApi';import SearchBar from "../components/SearchBar";

function Home() {

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

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
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
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

    getProductsByCategory(categoryId, page, PaginationConfig.DEFAULT_PAGE_SIZE)
      .then((res) => {
        const data = res.data;
        setProducts(Array.isArray(data.content) ? data.content : []);
        setCurrentPage(page);
        setTotalPages(data.totalPages);
        setLoading(false);

        setTimeout(() => {
          const productListSection = document.getElementById("product-list-section");
          if (productListSection) {
            productListSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      })
      .catch((err) => {
        console.error('Failed to load products by category', err);
        setLoading(false);
      });
  };

  const handleSearch = (filters) => {
  setLoading(true);

  searchProducts(filters)
    .then(res => {
      console.log("Search API Response:", res.data);
      const data = res.data;
      setProducts(Array.isArray(data.content) ? data.content : []);
      setCurrentPage(0);
      setTotalPages(data.totalPages);
      setSelectedCategoryId(null);
      setLoading(false);
    })
    .catch(err => {
      console.error('Failed to search products', err.response ? err.response.data : err);
      setLoading(false);
    });
};
  
  const handlePageChange = (page) => {
    if (selectedCategoryId) {
      loadProductsByCategory(selectedCategoryId, page);
    } else {
      loadProducts(page);
    }
  };

  return (
    <div className="homepage bg-light" style={{ minHeight: "100vh" }}>
      <Header currentUser={currentUser} onLoginClick={() => setShowLogin(true)} />
      <LoginPopup open={showLogin} onClose={() => setShowLogin(false)} onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }} />
      <RegisterPopup open={showRegister} onClose={() => setShowRegister(false)} onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }} />

      {/* Hero Banner */}
      <section className="py-5 text-white text-center" style={{ background: "linear-gradient(120deg, #1976d2 60%, #42a5f5 100%)" }}>
        <div className="container">
          <h1 className="display-3 fw-bold mb-3 text-shadow">
            {currentUser ? <>Chào mừng <span className="text-warning fw-bolder">{currentUser.name}</span> đến với AZStore</> : 'Chào mừng đến với AZStore'}
          </h1>
          <p className="lead mb-4 fs-4">Siêu thị điện tử - Giá tốt mỗi ngày!</p>
          <button className="btn btn-warning btn-lg fw-bold shadow">
            <FaShoppingCart className="me-2 mb-1" />Mua ngay
          </button>
        </div>
      </section>
      {/* Thanh tìm kiếm */}
      <SearchBar onSearch={handleSearch} />
      {/* Danh mục sản phẩm */}
      <section className="py-4 bg-white">
        <div className="container">
          <h2 className="mb-4 text-center">Danh mục sản phẩm</h2>
          <div className="row justify-content-center g-3">
            {categories.map((cat) => (
              <div key={cat.id} className="col-6 col-sm-4 col-md-3">
                <div
                  role="button"
                  tabIndex={0}
                  className={`card text-center shadow-sm h-100 py-3 border-0 rounded-4 category-hover ${selectedCategoryId === cat.id ? 'border-primary border-2' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => loadProductsByCategory(cat.id)}
                  onKeyPress={(e) => { if (e.key === 'Enter') loadProductsByCategory(cat.id); }}
                >
                  <div className="fs-1 mb-2">{cat.icon}</div>
                  <div className="fw-semibold fs-5">{cat.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sản phẩm */}
      <ProductList
        products={products}
        selectedCategoryId={selectedCategoryId}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        loading={loading}
      />
    </div>
  );
}

export default Home;
