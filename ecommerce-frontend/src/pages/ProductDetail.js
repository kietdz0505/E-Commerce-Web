

// ProductDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getApiUrl } from '../config/apiConfig';
import axios from 'axios';
import ProductReviews from '../components/ProductReviews';
import ReviewForm from '../components/ReviewForm';
import LoginPopup from '../components/LoginPopup';
import { useCart } from '../shared/CartContext';
import { useNotification } from '../shared/NotificationContext';



const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loginPopupOpen, setLoginPopupOpen] = useState(false);
  const { addToCart } = useCart();
  const { showNotification } = useNotification();


  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Chi tiết mặt hàng";

    return () => {
      document.title = previousTitle;
    };
  }, []);

  const handleLoginClick = () => {
    setLoginPopupOpen(true);
  };

  const handleAddToCart = (e) => {
  e.preventDefault();

  const token = localStorage.getItem('token');
  if (!token) {
    showNotification('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!', 'danger');
    return;
  }

  addToCart({ id: product.id, product, price: product.price });
  showNotification('Đã thêm sản phẩm vào giỏ hàng!', 'success');
};


  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await axios.get(getApiUrl('PRODUCT_DETAIL', productId));
        setProduct(response.data);
      } catch (error) {
        console.error('Failed to fetch product detail', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [productId]);

  const handleReviewSubmitted = (newReview) => {
    setReviews(prevReviews => [newReview, ...prevReviews]);
  };

  if (loading) return <div className="text-center my-5">Đang tải chi tiết sản phẩm...</div>;
  if (!product) return <div className="text-center my-5 text-danger">Không tìm thấy sản phẩm.</div>;

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-md-6">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/500x500?text=No+Image'}
            alt={product.name}
            className="img-fluid rounded shadow"
            style={{ background: '#f8f9fa', objectFit: 'contain', height: 'auto', maxHeight: 500 }}
          />
        </div>

        <div className="col-md-6">
          <h2 className="fw-bold mb-3">{product.name}</h2>
          <p className="fs-4 text-danger fw-bold">
            {product.price != null ? product.price.toLocaleString('vi-VN') + '₫' : 'Liên hệ'}
          </p>
          <p className="text-muted">{product.description || 'Không có mô tả.'}</p>
          <p className="text-muted">Thương hiệu: {product.brandName || 'Không có'}</p>
          <p className="text-muted">Hàng tồn: {product.stock || 'Hết hàng'}</p>
          <p className="text-muted">
            Đánh giá: {product.averageRating ? parseFloat(Number(product.averageRating).toFixed(1)) : '0'} <i className="bi bi-star-fill text-warning"></i>
          </p>
          <div className="d-flex gap-2 mt-4">
            <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>
              <i className="bi bi-cart-plus me-2"></i>Thêm vào giỏ
            </button>
            <button className="btn btn-outline-secondary btn-lg">
              <i className="bi bi-heart me-2"></i>Yêu thích
            </button>
          </div>

          <div className="mt-4">
            <Link to="/" className="btn btn-link">&larr; Quay về trang chủ</Link>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <ProductReviews productId={product.id} appendedReviews={reviews} />

      {/* Review Form */}
      <ReviewForm onLoginClick={handleLoginClick} productId={product.id} onReviewSubmitted={handleReviewSubmitted} />
      <LoginPopup
        open={loginPopupOpen}
        onClose={() => setLoginPopupOpen(false)}
        onSwitchToRegister={() => { }}
      />
    </div>
  );
};

export default ProductDetail;
