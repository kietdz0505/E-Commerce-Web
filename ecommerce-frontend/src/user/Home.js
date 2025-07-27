import React, { useEffect, useState } from "react";
import { getAllProducts } from "../api/productApi";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaShoppingCart, FaGift, FaStore, FaGoogle, FaFacebookF } from "react-icons/fa";
import { getAllCategories } from "../api/categoryApi";


function LoginPopup({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="modal show fade" tabIndex="-1" style={{ display: "block", background: "rgba(0,0,0,0.35)" }} onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
        <div className="modal-content rounded-4 shadow">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title w-100 text-center fw-bold">Đăng nhập</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body pt-2">
            <form className="d-flex flex-column gap-3 mb-3">
              <input type="email" className="form-control rounded-pill px-4" placeholder="Email" required />
              <input type="password" className="form-control rounded-pill px-4" placeholder="Mật khẩu" required />
              <button type="submit" className="btn btn-primary rounded-pill fw-bold py-2">Đăng nhập</button>
            </form>
            <div className="text-center my-2 text-secondary">Hoặc đăng nhập bằng</div>
            <div className="d-flex gap-3 justify-content-center">
              <button className="btn btn-outline-danger rounded-pill d-flex align-items-center gap-2 px-4 py-2 fw-bold">
                <FaGoogle className="fs-5" /> Google
              </button>
              <button className="btn btn-outline-primary rounded-pill d-flex align-items-center gap-2 px-4 py-2 fw-bold">
                <FaFacebookF className="fs-5" /> Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  useEffect(() => {
    getAllCategories()
      .then((res) => {
        const arr = Array.isArray(res.data)
          ? res.data
          : [];
        setCategories(arr);
        setLoading(false);
      })
      .catch((err) => {
        setError("Không thể tải danh mục. Vui lòng thử lại sau.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    getAllProducts()
      .then((res) => {
        const arr = Array.isArray(res.data.content)
          ? res.data.content
          : [];
        setProducts(arr);
        setLoading(false);
      })
      .catch((err) => {
        setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="homepage bg-light" style={{ minHeight: "100vh", paddingTop: 64 }}>
      <LoginPopup open={showLogin} onClose={() => setShowLogin(false)} />
      {/* Header */}
      <Header onLoginClick={() => setShowLogin(true)} />

      {/* Hero Banner */}
      <section className="py-5 text-white text-center" style={{background: "linear-gradient(120deg, #1976d2 60%, #42a5f5 100%)"}}>
        <div className="container">
          <h1 className="display-3 fw-bold mb-3 text-shadow">Chào mừng đến với AZStore</h1>
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
              <div className="col-6 col-sm-4 col-md-3" key={cat.name}>
                <div className="card text-center shadow-sm h-100 py-3 border-0 rounded-4 category-hover">
                  <div className="fs-1 mb-2">{cat.icon}</div>
                  <div className="fw-semibold fs-5">{cat.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sản phẩm nổi bật */}
      <section className="py-4 bg-light">
        <div className="container">
          <h2 className="mb-4 text-center">Sản phẩm nổi bật</h2>
          {loading ? (
            <div className="text-center">Đang tải sản phẩm...</div>
          ) : error ? (
            <div className="text-danger text-center">{error}</div>
          ) : (
            <div className="row g-4 justify-content-center">
              {products && products.length > 0 ? (
                products.map((prod, idx) => (
                  <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={prod.id || prod._id || prod.name}>
                    <div className="card h-100 shadow-sm border-0 rounded-4 product-hover position-relative">
                      {idx < 4 && <span className="badge bg-danger position-absolute top-0 end-0 m-2">Hot</span>}
                      <img src={prod.imageUrl || "https://via.placeholder.com/200x200?text=No+Image"} alt={prod.name} className="card-img-top p-3 rounded-4 product-img-hover" style={{ height: 180, objectFit: "contain", background: "#f8f9fa" }} />
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title">{prod.name}</h5>
                        {prod.description && <p className="card-text small text-secondary mb-2" style={{minHeight: 36}}>{prod.description.slice(0, 40)}{prod.description.length > 40 ? '...' : ''}</p>}
                        <p className="card-text text-danger fw-bold mb-2 fs-5">{prod.price ? prod.price.toLocaleString("vi-VN") + "₫" : "Liên hệ"}</p>
                        <button className="btn btn-primary mt-auto w-100">
                          <FaShoppingCart className="me-2 mb-1" />Mua ngay
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center">Không có sản phẩm nào.</div>
              )}
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

      {/* Footer */}
      <Footer />
      <style>{`
        .category-hover:hover {
          box-shadow: 0 8px 24px rgba(25, 118, 210, 0.18);
          background: #e3f2fd;
          transform: translateY(-2px) scale(1.03);
          transition: all 0.2s;
        }
        .product-hover:hover {
          box-shadow: 0 8px 32px rgba(25, 118, 210, 0.18);
          transform: translateY(-2px) scale(1.03);
          transition: all 0.2s;
        }
        .product-img-hover:hover {
          filter: brightness(1.08) drop-shadow(0 2px 8px #1976d2aa);
          transition: filter 0.2s;
        }
        .text-shadow {
          text-shadow: 0 2px 8px #1976d2aa;
        }
      `}</style>
    </div>
  );
}

export default Home;
