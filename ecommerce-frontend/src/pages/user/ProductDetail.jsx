import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

import { getApiUrl } from '../../config/apiConfig';
import { useCart } from '../../shared/CartContext';
import { useNotification } from '../../shared/NotificationContext';
import { useAuth } from '../../shared/AuthContext';

import Header from '../../components/Header';
import ProductReviews from '../../components/ProductReviews';
import ReviewForm from '../../components/ReviewForm';
import LoginPopup from '../../components/LoginPopup';
import RegisterPopup from '../../components/RegisterPopup';

import { FiShoppingCart, FiHeart, FiBox } from "react-icons/fi";
import { FaStar } from "react-icons/fa";

import { toast } from 'react-toastify';

import '../../styles/productDetail.css';

const ProductDetail = () => {
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const { success, error, warning } = useNotification();

  // ===== TITLE =====
  useEffect(() => {
    const prev = document.title;
    document.title = "Chi tiết sản phẩm";
    return () => (document.title = prev);
  }, []);

  // ===== FETCH PRODUCT =====
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(getApiUrl('PRODUCT_DETAIL', productId));
        setProduct(res.data);
      } catch (err) {
        console.error(err);
        error("Không thể tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // ===== ADD TO CART =====
  const handleAddToCart = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      setShowLogin(true);
      warning('Vui lòng đăng nhập để thêm vào giỏ');
      return;
    }

    if (!product.stock || product.stock <= 0) {
      error('Sản phẩm đã hết hàng');
      return;
    }

    const toastId = toast.loading("Đang thêm vào giỏ...");

    try {
      addToCart({
        id: product.id,
        product,
        price: product.price
      });

      toast.update(toastId, {
        render: "Đã thêm vào giỏ hàng!",
        type: "success",
        isLoading: false,
        autoClose: 1500
      });

    } catch (err) {
      console.error(err);

      toast.update(toastId, {
        render: "Thêm vào giỏ thất bại!",
        type: "error",
        isLoading: false,
        autoClose: 2000
      });
    }
  };

  // ===== REVIEW =====
  const handleReviewSubmitted = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
  };

  // ===== LOADING =====
  if (loading) {
    return <div className="az-loading">Đang tải chi tiết sản phẩm...</div>;
  }

  if (!product) {
    return <div className="az-error">Không tìm thấy sản phẩm.</div>;
  }

  return (
    <>
      {/* ===== HEADER ===== */}
      <Header onLoginClick={() => setShowLogin(true)} />

      {/* ===== AUTH POPUP ===== */}
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

      {/* ===== MAIN ===== */}
      <div className="az-detail-container">
        <div className="az-detail-card">
          <div className="az-detail-grid">

            {/* IMAGE */}
            <div className="az-detail-img-box">
              <img
                src={product.imageUrl || 'https://via.placeholder.com/500'}
                alt={product.name}
                className="az-detail-img"
              />
            </div>

            {/* INFO */}
            <div className="az-detail-info">

              <h1 className="az-detail-title">{product.name}</h1>

              {/* PRICE */}
              <div className="az-detail-price">
                {product.price
                  ? product.price.toLocaleString('vi-VN') + '₫'
                  : 'Liên hệ'}
              </div>

              {/* META */}
              <div className="az-detail-meta">
                <span>{product.brandName || 'Không có thương hiệu'}</span>

                <span>
                  <FiBox className="az-icon" />
                  {product.stock > 0
                    ? `Còn ${product.stock} sản phẩm`
                    : "Hết hàng"}
                </span>
              </div>

              {/* RATING */}
              <div className="az-detail-rating">
                <FaStar className="az-star" />
                {product.averageRating
                  ? Number(product.averageRating).toFixed(1)
                  : '0'}
              </div>

              {/* DESC */}
              <p className="az-detail-desc">
                {product.description || 'Không có mô tả.'}
              </p>

              {/* ACTION */}
              <div className="az-detail-actions">
                <button
                  className="az-btn-primary"
                  onClick={handleAddToCart}
                  disabled={!product.stock}
                >
                  <FiShoppingCart className="az-btn-icon" />
                  {product.stock ? "Thêm vào giỏ" : "Hết hàng"}
                </button>

                <button className="az-btn-outline">
                  <FiHeart className="az-btn-icon" />
                  Yêu thích
                </button>
              </div>

              <Link to="/" className="az-back-link">
                ← Quay về trang chủ
              </Link>
            </div>

          </div>
        </div>

        {/* ===== REVIEWS ===== */}
        <div className="az-detail-review">
          <ProductReviews
            productId={product.id}
            appendedReviews={reviews}
          />
        </div>
      </div>
    </>
  );
};

export default ProductDetail;