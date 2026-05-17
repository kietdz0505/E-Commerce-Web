import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Collapse } from 'react-bootstrap';
import {
  FaBox, FaTags, FaShoppingCart, FaGift, FaStar, FaUsers, FaTag, FaChevronDown, FaChartBar
} from 'react-icons/fa';
import adminService from '../../services/admin/adminService';
import CountUpLib from 'react-countup';
import { MdMail } from 'react-icons/md';
import { FaMessage } from 'react-icons/fa6';
import '../../styles/adminDashboardPage.css';

const AdminDashboardPage = () => {
  const [open, setOpen] = useState(false);
  const CountUp = CountUpLib.default;

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCategories: 0,
    totalBrands: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalReviews: 0
  });

  useEffect(() => {
      const previousTitle = document.title; 
      document.title = "Bảng điều khiển"; 
  
      return () => {
          document.title = previousTitle; 
      };
  }, []);

  useEffect(() => {
    adminService.getDashboardStats().then(data => {
      setStats(data);
    });
  }, []);

  const statCards = [
    { label: 'Người dùng', value: stats.totalUsers, icon: <FaUsers size={24} />, color: 'bg-primary' },
    { label: 'Danh mục', value: stats.totalCategories, icon: <FaTags size={24} />, color: 'bg-success' },
    { label: 'Thương hiệu', value: stats.totalBrands, icon: <FaTag size={24} />, color: 'bg-warning' },
    { label: 'Đơn hàng', value: stats.totalOrders, icon: <FaShoppingCart size={24} />, color: 'bg-danger' },
    { label: 'Sản phẩm', value: stats.totalProducts, icon: <FaBox size={24} />, color: 'bg-info' },
    { label: 'Lượt đánh giá', value: stats.totalReviews, icon: <FaStar size={24} />, color: 'bg-secondary' },
    
  ];

  const adminLinks = [
    { to: '/admin/products', label: 'Quản lý sản phẩm', icon: <FaBox size={28} /> },
    { to: '/admin/categories', label: 'Quản lý danh mục', icon: <FaTags size={28} /> },
    { to: '/admin/orders', label: 'Quản lý đơn hàng', icon: <FaShoppingCart size={28} /> },
    { to: '/admin/promotions', label: 'Quản lý khuyến mãi', icon: <FaGift size={28} /> },
    { to: '/admin/reviews', label: 'Quản lý đánh giá', icon: <FaStar size={28} /> },
    { to: '/admin/users', label: 'Quản lý người dùng', icon: <FaUsers size={28} /> },
    { to: '/admin/brands', label: 'Quản lý thương hiệu', icon: <FaTag size={28} /> },
    { to: '/admin/report', label: 'Thống kê báo cáo', icon: <FaChartBar size={28} /> },
    { to: '/admin/send-promotion-email', label: 'Gửi thông báo khuyến mãi qua Email', icon: <MdMail size={28}/>},
    { to: '/admin/chatbot', label: 'Quản lý Chatbot' , icon: <FaMessage size={28}/>}
  ];

  return (
    <div className="container mt-5">
      <h1 className="mb-4 fw-bold">Admin Dashboard </h1>
      <p className="lead mb-4">Chào mừng bạn đến trang quản trị, hãy chọn mục cần quản lý bên dưới.</p>

      {/* Thống kê */}
      <div className="row g-4 mb-5">
        {statCards.map((item, idx) => (
          <div className="col-md-4 col-lg-2" key={idx}>
            <div className={`card shadow-sm text-white text-center ${item.color}`}>
              <div className="card-body">
                {item.icon}
                <h4 className="fw-bold mt-2">
                  <CountUp
                    key={item.value} // key giúp CountUp reset animation khi value đổi
                    start={0}
                    end={item.value}
                    duration={2}
                    separator=","
                  />
                </h4>
                <p className="mb-0">{item.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Nút xổ danh mục */}
      <div className="mb-3 d-flex justify-content-center">
        <button
          className="btn btn-outline-primary d-flex align-items-center"
          onClick={() => setOpen(!open)}
          aria-controls="admin-links"
          aria-expanded={open}
        >
          Danh mục quản lý
          <FaChevronDown
            className="ms-2"
            style={{
              transform: open ? 'rotate(180deg)' : 'none',
              transition: '0.3s'
            }}
          />
        </button>
      </div>

      <Collapse in={open}>
        <div id="admin-links" className="row g-4 mb-5">
          {adminLinks.map(({ to, label, icon }) => (
            <div key={to} className="col-md-4">
              <Link
                to={to}
                className="card shadow-sm text-center text-decoration-none text-dark h-100 admin-card"
              >
                <div className="card-body d-flex flex-column align-items-center justify-content-center">
                  {icon}
                  <h5 className="card-title mt-2">{label}</h5>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </Collapse>

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
