import { Link } from 'react-router-dom';
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from '../shared/CartContext';
import { useNotification } from '../shared/NotificationContext';
import { useAuth } from '../shared/AuthContext';

import { toast } from 'react-toastify';

import StarRating from '../config/StarRating';
import '../styles/productCard.css';

const ProductCard = ({ prod, isHot }) => {
  const { addToCart } = useCart();
  const { success, error, warning } = useNotification();
  const { currentUser } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();

    
    if (!currentUser) {
      warning('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }

    
    if (!prod.stock || prod.stock <= 0) {
      error('Sản phẩm đã hết hàng');
      return;
    }

  
    const toastId = toast.loading("Đang thêm...");

    try {
      addToCart({
        id: prod.id,
        product: prod,
        price: prod.price
      });

      toast.update(toastId, {
        render: "Đã thêm vào giỏ!",
        type: "success",
        isLoading: false,
        autoClose: 1200
      });

    } catch (err) {
      console.error(err);

      toast.update(toastId, {
        render: "Lỗi khi thêm sản phẩm!",
        type: "error",
        isLoading: false,
        autoClose: 2000
      });
    }
  };

  return (
    <div className="az-pcard-outer">
      <div className="az-pcard">

        {/* HOT BADGE */}
        {isHot && <span className="az-pcard-hot">🔥 Hot</span>}

        {/* IMAGE */}
        <Link to={`/product/${prod.id}`} className="text-decoration-none">
          <div className="az-pcard-img-wrap">
            <img
              src={prod.imageUrl || "https://via.placeholder.com/200x200?text=No+Image"}
              alt={prod.name}
              className="az-pcard-img"
            />
          </div>
        </Link>

        {/* BODY */}
        <div className="az-pcard-body">

          <Link
            to={`/product/${prod.id}`}
            className="az-pcard-name"
            title={prod.name}
          >
            {prod.name}
          </Link>

          <div className="az-pcard-price">
            {prod.price
              ? prod.price.toLocaleString("vi-VN") + "₫"
              : "Liên hệ"}
          </div>

          <div className="az-pcard-rating">
            <span className="az-pcard-rating-num">
              {(prod.averageRating || 0).toFixed(1)}
            </span>

            <StarRating rating={prod.averageRating || 0} />

            <span className="az-pcard-rating-count">
              ({prod.reviewCount || 0})
            </span>
          </div>

        </div>

        {/* CTA */}
        <div className="az-pcard-footer">
          <button
            className="az-pcard-btn"
            onClick={handleAddToCart}
            disabled={!prod.stock}
          >
            <FaShoppingCart size={13} />

            {!prod.stock ? "Hết hàng" : "Thêm vào giỏ"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductCard;