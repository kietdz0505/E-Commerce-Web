import React, { useEffect, useState } from 'react';
import AdminUserService from '../../services/admin/adminUserService';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await AdminUserService.getAll(page, size);
      const normalizedUsers = (data.content || []).map(u => ({
        ...u,
        locked: u.locked === true || u.locked === 1 || u.locked === "1"
      }));
      setUsers(normalizedUsers);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Lỗi tải danh sách người dùng:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async (id, lock) => {
    try {
      await AdminUserService.lockUser(id, lock);
      setUsers(prev =>
        prev.map(u => (u.id === id ? { ...u, locked: lock } : u))
      );
    } catch (error) {
      console.error('Lỗi khi khóa/mở khóa người dùng:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
      await AdminUserService.delete(id);
      loadUsers();
    }
  };

  const handleChangeRole = async (id, role) => {
    await AdminUserService.updateRole(id, role);
    loadUsers();
  };

  useEffect(() => {
    loadUsers();
  }, [page]);

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Quản lý người dùng</h2>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 200 }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-primary">
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Email</th>
                <th>Role</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={u.roles[0]}
                        onChange={(e) => handleChangeRole(u.id, e.target.value)}
                      >
                        <option value="ROLE_CUSTOMER">USER</option>
                        <option value="ROLE_ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td>
                      {u.locked ? (
                        <span className="badge bg-danger">Bị khóa</span>
                      ) : (
                        <span className="badge bg-success">Hoạt động</span>
                      )}
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm me-2 ${u.locked ? 'btn-success' : 'btn-warning'}`}
                        onClick={() => handleLock(u.id, !u.locked)}
                      >
                        {u.locked ? 'Mở khóa' : 'Khóa'}
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(u.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    Không có dữ liệu người dùng
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <nav>
        <ul className="pagination justify-content-center">
          {Array.from({ length: totalPages }, (_, i) => (
            <li key={i} className={`page-item ${i === page ? 'active' : ''}`}>
              <button
                className="page-link"
                onClick={() => setPage(i)}
                disabled={i === page}
              >
                {i + 1}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
