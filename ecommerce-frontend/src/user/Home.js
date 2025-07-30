import React, { useEffect, useState } from "react";
import { getAllProducts } from "../api/productApi";
import { FaShoppingCart, FaGift, FaStore } from "react-icons/fa";
import { getAllCategories } from "../api/categoryApi";
import { getApiUrl } from '../config/apiConfig';
import LoginPopup from "../components/LoginPopup";
import RegisterPopup from "../components/RegisterPopup";
import Header from "../components/Header";

// Trong component Home

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const handleSwitchToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(getApiUrl('profile'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          console.log('Current User:', data);
          setCurrentUser(data);
        })
        .catch(err => console.error('Failed to fetch user', err));
    }
  }, []);

  const closeModals = () => {
    setShowLogin(false);
    setShowRegister(false);
  };
  useEffect(() => {
    setLoading(true);
    Promise.all([getAllCategories(), getAllProducts()])
      .then(([catRes, prodRes]) => {
        setCategories(Array.isArray(catRes.data) ? catRes.data : []);
        setProducts(Array.isArray(prodRes.data.content) ? prodRes.data.content : []);
        setLoading(false);
      })
      .catch(err => {
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        setLoading(false);
      });
  }, []);

  const loadProductsByCategory = (categoryId) => {
  const url = getApiUrl('CATEGORY_PRODUCTS', categoryId, 0, 8);

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      console.log('Products by Category:', data);
      setProducts(Array.isArray(data.content) ? data.content : []);
    })
    .catch((err) => console.error('Failed to load products by category', err));
};


  return (
    <div className="homepage bg-light" style={{ minHeight: "100vh", paddingTop: 64 }}>
      <Header
        currentUser={currentUser}
        onLoginClick={() => setShowLogin(true)}  // <-- Thêm dòng này
      />
      {/* Popup Login + Register */}
      <LoginPopup
        open={showLogin}
        onClose={closeModals}
        onSwitchToRegister={handleSwitchToRegister}
      />
      <RegisterPopup
        open={showRegister}
        onClose={closeModals}
        onSwitchToLogin={handleSwitchToLogin}
      />

      {/* Hero Banner */}
      <section className="py-5 text-white text-center" style={{ background: "linear-gradient(120deg, #1976d2 60%, #42a5f5 100%)" }}>
        <div className="container">
          <h1 className="display-3 fw-bold mb-3 text-shadow">
            {currentUser ? (
              <>
                Chào mừng <span className="text-warning fw-bolder">{currentUser.name}</span> đến với AZStore
              </>
            ) : 'Chào mừng đến với AZStore'}
          </h1>

          <p className="lead mb-4 fs-4">Siêu thị điện tử - Giá tốt mỗi ngày!</p>
          <button className="btn btn-warning btn-lg fw-bold shadow">
            <FaShoppingCart className="me-2 mb-1" />Mua ngay
          </button>
        </div>
      </section>


      {/* Danh mục sản phẩm */}
      <section className="py-4 bg-white">
        <div className="container">
          <h2 className="mb-4 text-center">Danh mục sản phẩm</h2>
          <div className="row justify-content-center g-3">
            {categories.map((cat) => (
              <div
                className="col-6 col-sm-4 col-md-3"
                key={cat.name}
                onClick={() => loadProductsByCategory(cat.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card text-center shadow-sm h-100 py-3 border-0 rounded-4 category-hover">
                  <div className="fs-1 mb-2">{cat.icon}</div>
                  <div className="fw-semibold fs-5">{cat.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

{/* Sản phẩm */}
<section className="py-4 bg-light">
  <div className="container">
    <h2 className="mb-4 text-center">
      {selectedCategoryId ? 'Sản phẩm theo danh mục' : 'Sản phẩm nổi bật'}
    </h2>

    {loading ? (
      <div className="text-center">Đang tải sản phẩm...</div>
    ) : error ? (
      <div className="text-danger text-center">{error}</div>
    ) : (
      <div className="row g-4 justify-content-center">
        {(selectedCategoryId ? categoryProducts : products).map((prod, idx) => (
          <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={prod.id || prod._id || prod.name}>
            <div className="card h-100 shadow-sm border-0 rounded-4 product-hover position-relative">
              {!selectedCategoryId && idx < 4 && (
                <span className="badge bg-danger position-absolute top-0 end-0 m-2">Hot</span>
              )}
              <img src={prod.imageUrl || "https://via.placeholder.com/200x200?text=No+Image"} alt={prod.name} className="card-img-top p-3 rounded-4 product-img-hover" style={{ height: 180, objectFit: "contain", background: "#f8f9fa" }} />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{prod.name}</h5>
                {prod.description && (
                  <p className="card-text small text-secondary mb-2" style={{ minHeight: 36 }}>
                    {prod.description.slice(0, 40)}
                    {prod.description.length > 40 ? '...' : ''}
                  </p>
                )}
                <p className="card-text text-danger fw-bold mb-2 fs-5">
                  {prod.price ? prod.price.toLocaleString("vi-VN") + "₫" : "Liên hệ"}
                </p>
                <button className="btn btn-primary mt-auto w-100">
                  <FaShoppingCart className="me-2 mb-1" />Mua ngay
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Pagination cho sản phẩm theo danh mục */}
    {selectedCategoryId && totalPages > 1 && (
      <div className="d-flex justify-content-center mt-4">
        <button
          className="btn btn-outline-secondary mx-1"
          disabled={currentPage === 0}
          onClick={() => loadProductsByCategory(selectedCategoryId, currentPage - 1)}
        >
          Trước
        </button>
        <span className="mx-2 align-self-center">
          Trang {currentPage + 1} / {totalPages}
        </span>
        <button
          className="btn btn-outline-secondary mx-1"
          disabled={currentPage === totalPages - 1}
          onClick={() => loadProductsByCategory(selectedCategoryId, currentPage + 1)}
        >
          Tiếp
        </button>
      </div>
    )}
  </div>
</section>

      {/* Ưu đãi */}
      <section className="py-4 bg-white">
        <div className="container">
          <div className="alert alert-warning d-flex align-items-center justify-content-center gap-3 mb-0 fs-5 shadow-sm" role="alert">
            <FaGift className="me-2 fs-3" />
            <span>Ưu đãi đặc biệt: Giảm giá đến 50% cho các sản phẩm phụ kiện!</span>
            <button className="btn btn-outline-primary btn-lg ms-3">Xem ngay</button>
          </div>
        </div>
      </section>

      {/* Giới thiệu */}
      <section className="py-4 bg-light">
        <div className="container text-center">
          <FaStore className="fs-1 mb-2 text-primary" />
          <h2 className="mb-3 mt-2">Về AZStore</h2>
          <p className="mx-auto fs-5 text-secondary" style={{ maxWidth: 600 }}>
            AZStore là hệ thống bán lẻ điện tử uy tín, cung cấp các sản phẩm chính hãng với giá tốt nhất thị trường. Dịch vụ khách hàng tận tâm, giao hàng nhanh chóng trên toàn quốc.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Home;
