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
    { label: 'Người dùng', value: stats.totalUsers, icon: <FaUsers size={22} />, color: 'bg-primary' },
    { label: 'Danh mục', value: stats.totalCategories, icon: <FaTags size={22} />, color: 'bg-success' },
    { label: 'Thương hiệu', value: stats.totalBrands, icon: <FaTag size={22} />, color: 'bg-warning' },
    { label: 'Đơn hàng', value: stats.totalOrders, icon: <FaShoppingCart size={22} />, color: 'bg-danger' },
    { label: 'Sản phẩm', value: stats.totalProducts, icon: <FaBox size={22} />, color: 'bg-info' },
    { label: 'Đánh giá', value: stats.totalReviews, icon: <FaStar size={22} />, color: 'bg-secondary' },
  ];

  const adminLinks = [
    { to: '/admin/products', label: 'Quản lý sản phẩm', icon: <FaBox size={24} /> },
    { to: '/admin/categories', label: 'Quản lý danh mục', icon: <FaTags size={24} /> },
    { to: '/admin/orders', label: 'Quản lý đơn hàng', icon: <FaShoppingCart size={24} /> },
    { to: '/admin/promotions', label: 'Quản lý khuyến mãi', icon: <FaGift size={24} /> },
    { to: '/admin/reviews', label: 'Quản lý đánh giá', icon: <FaStar size={24} /> },
    { to: '/admin/users', label: 'Quản lý người dùng', icon: <FaUsers size={24} /> },
    { to: '/admin/brands', label: 'Quản lý thương hiệu', icon: <FaTag size={24} /> },
    { to: '/admin/report', label: 'Thống kê báo cáo', icon: <FaChartBar size={24} /> },
    { to: '/admin/send-promotion-email', label: 'Gửi Email khuyến mãi', icon: <MdMail size={24}/>},
    { to: '/admin/chatbot', label: 'Quản lý Chatbot' , icon: <FaMessage size={24}/>}
  ];

  return (
    <div className="container admin-dashboard-container mt-4 mt-md-5">
      <h1 className="mb-3 fw-bold admin-main-title">Admin Dashboard</h1>
      <p className="lead mb-4 admin-sub-title">Chào mừng bạn đến trang quản trị, hãy chọn mục cần quản lý bên dưới.</p>

      <div className="az-stats-grid mb-4 mb-md-5">
        {statCards.map((item, idx) => (
          <div className={`az-stat-card text-white ${item.color}`} key={idx}>
            <div className="az-stat-icon">{item.icon}</div>
            <div className="az-stat-info">
              <h4 className="fw-bold m-0">
                <CountUp
                  key={item.value}
                  start={0}
                  end={item.value}
                  duration={2}
                  separator=","
                />
              </h4>
              <p className="mb-0 text-nowrap">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4 d-flex justify-content-center">
        <button
          className="btn btn-primary px-4 py-2 d-flex align-items-center fw-semibold shadow-sm"
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
        <div id="admin-links">
          <div className="az-admin-links-grid mb-5">
            {adminLinks.map(({ to, label, icon }) => (
              <Link key={to} to={to} className="az-admin-link-card">
                <div className="az-link-icon-box">{icon}</div>
                <h5 className="az-link-label">{label}</h5>
              </Link>
            ))}
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default AdminDashboardPage;