import { useEffect, useState } from 'react';
import { getDashboardStats } from '../api/dashboardApi';
import { FaBox, FaTags, FaUsers } from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState({ categories: 0, products: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi khi load thống kê:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 fw-bold">Tổng quan hệ thống</h2>

      {loading ? (
        <div className="text-center text-secondary">Đang tải dữ liệu...</div>
      ) : (
        <div className="row justify-content-center g-4">
          <div className="col-md-4">
            <div className="card text-white bg-primary h-100 shadow">
              <div className="card-body d-flex align-items-center">
                <FaBox size={40} className="me-3" />
                <div>
                  <h5 className="card-title fw-bold">Tổng sản phẩm</h5>
                  <h2 className="card-text fw-bold">{stats.products}</h2>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card text-white bg-danger h-100 shadow">
              <div className="card-body d-flex align-items-center">
                <FaTags size={40} className="me-3" />
                <div>
                  <h5 className="card-title fw-bold">Tổng danh mục</h5>
                  <h2 className="card-text fw-bold">{stats.categories}</h2>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card text-white bg-success h-100 shadow">
              <div className="card-body d-flex align-items-center">
                <FaUsers size={40} className="me-3" />
                <div>
                  <h5 className="card-title fw-bold">Tổng người dùng</h5>
                  <h2 className="card-text fw-bold">{stats.users}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
