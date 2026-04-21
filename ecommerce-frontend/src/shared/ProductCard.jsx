import { Link } from 'react-router-dom';
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from '../shared/CartContext';
import { useNotification } from '../shared/NotificationContext';
import StarRating from '../config/StarRating'; // hoặc điều chỉnh path phù hợp


const ProductCard = ({ prod, isHot }) => {
  const { addToCart } = useCart();
  const { showNotification } = useNotification();

  const handleAddToCart = (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!', 'danger');
      return;
    }

    addToCart({ id: prod.id, product: prod, price: prod.price });
    showNotification('Đã thêm sản phẩm vào giỏ hàng!', 'success');
  };

  return (
    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
      <div className="card h-100 border-0 shadow-sm rounded-4 position-relative"
        style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.03)';
          e.currentTarget.classList.add('shadow');
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.classList.remove('shadow');
        }}>
        {isHot && (
          <span className="badge bg-danger position-absolute top-0 end-0 m-2 px-3 py-2 fs-6 rounded-pill">
            Hot
          </span>
        )}

        <Link to={`/product/${prod.id}`} className="text-decoration-none text-dark">
          <div className="p-3 d-flex flex-column align-items-center">
            <img
              src={prod.imageUrl || "https://via.placeholder.com/200x200?text=No+Image"}
              alt={prod.name}
              className="img-fluid rounded-3"
              style={{ height: '180px', objectFit: 'contain', background: '#f8f9fa' }}
            />
            <div className="w-100 mt-3">
              <h5
                className="card-title text-center text-truncate"
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {prod.name}
              </h5>

              <p className="card-text text-danger fw-bold text-center fs-5">
                {prod.price ? prod.price.toLocaleString("vi-VN") + "₫" : "Liên hệ"}
              </p>
            </div>
            <div className="d-flex justify-content-center align-items-center gap-1 mb-2">
              <span className="text-dark fw-semibold">{(prod.averageRating || 0).toFixed(1)}</span>
              <StarRating rating={prod.averageRating || 0} />
              <span className="text-muted ms-1">({prod.reviewCount || 0})</span>
            </div>
          </div>
        </Link>

        <div className="card-body pt-0">
          <button className="btn btn-primary w-100" onClick={handleAddToCart}>
            <FaShoppingCart className="me-2 mb-1" />Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
