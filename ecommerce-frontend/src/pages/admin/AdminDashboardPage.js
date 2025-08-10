import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboardPage = () => {
  const adminLinks = [
    { to: '/admin/products', label: 'Quản lý sản phẩm', icon: 'box' },
    { to: '/admin/categories', label: 'Quản lý danh mục', icon: 'tags' },
    { to: '/admin/orders', label: 'Quản lý đơn hàng', icon: 'shopping-cart' },
    { to: '/admin/promotions', label: 'Quản lý khuyến mãi', icon: 'gift' },
    { to: '/admin/reviews', label: 'Quản lý đánh giá', icon: 'star' },
    { to: '/admin/users', label: 'Quản lý người dùng', icon: 'users' },
    { to: '/admin/brands', label: 'Quản lý thương hiệu', icon: 'tag' },
  ];

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-primary">🌟 Admin Dashboard 🌟</h1>
      <p className="lead mb-5">Chào mừng bạn đến trang quản trị, hãy chọn mục cần quản lý bên dưới.</p>

      <div className="row">
        {adminLinks.map(({ to, label, icon }) => (
          <div key={to} className="col-md-4 mb-4">
            <Link to={to} className="card shadow-sm text-center text-decoration-none text-dark h-100 admin-card">
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <i className={`fas fa-${icon} fa-3x mb-3 text-primary`}></i>
                <h5 className="card-title">{label}</h5>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <style>{`
        .admin-card:hover {
          background-color: #e9f5ff;
          box-shadow: 0 8px 16px rgba(0,0,0,0.15);
          transform: translateY(-5px);
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboardPage;
