import { Link } from 'react-router-dom';
import { FaShoppingCart } from "react-icons/fa";

const ProductCard = ({ prod, isHot }) => (
  <div className="col-12 col-sm-6 col-md-4 col-lg-3">
    <div
      className="card h-100 border-0 shadow-sm rounded-4 position-relative"
      style={{
        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.03)';
        e.currentTarget.classList.add('shadow');
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.classList.remove('shadow');
      }}
    >
      {isHot && (
        <span className="badge bg-danger position-absolute top-0 end-0 m-2 px-3 py-2 fs-6 rounded-pill">
          Hot
        </span>
      )}

      <Link to={`/product/${prod.id}`} className="stretched-link text-decoration-none text-dark">
        <div className="p-3 d-flex flex-column align-items-center">
          <img
            src={prod.imageUrl || "https://via.placeholder.com/200x200?text=No+Image"}
            alt={prod.name}
            className="img-fluid rounded-3"
            style={{ height: '180px', objectFit: 'contain', background: '#f8f9fa' }}
          />

          <div className="w-100 mt-3">
            <h5 className="card-title text-center">{prod.name}</h5>
            {prod.description && (
              <p className="card-text small text-secondary text-center mb-2">
                {prod.description.slice(0, 40)}
                {prod.description.length > 40 ? '...' : ''}
              </p>
            )}
            <p className="card-text text-danger fw-bold text-center fs-5">
              {prod.price ? prod.price.toLocaleString("vi-VN") + "₫" : "Liên hệ"}
            </p>
          </div>
        </div>
      </Link>

      <div className="card-body pt-0">
        <button className="btn btn-primary w-100">
          <FaShoppingCart className="me-2 mb-1" />Mua ngay
        </button>
      </div>
    </div>
  </div>
);

export default ProductCard;
