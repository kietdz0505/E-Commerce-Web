import React, { useEffect, useState } from 'react';
import adminCategoryService from '../../services/admin/adminCategoryService';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  const loadCategories = async () => {
    try {
      const data = await adminCategoryService.getCategories(page, size);
      setCategories(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Lỗi tải danh mục:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa danh mục này?')) {
      try {
        await adminCategoryService.deleteCategory(id);
        loadCategories();
      } catch (error) {
        alert('Lỗi khi xóa danh mục');
      }
    }
  };

  useEffect(() => {
    loadCategories();
  }, [page]);

  return (
    <div className="container mt-4" style={{ maxWidth: 900 }}>
      <h2 className="mb-4 text-center">Quản lý danh mục</h2>

      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Tên danh mục</th>
            <th style={{ width: '180px' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {categories.length > 0 ? (
            categories.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => alert('Chức năng sửa chưa làm')}
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(c.id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center text-muted py-3">
                Không có dữ liệu danh mục
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <nav aria-label="Page navigation example" className="d-flex justify-content-center">
        <ul className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <li
              key={i}
              className={`page-item ${i === page ? 'active' : ''}`}
              onClick={() => i !== page && setPage(i)}
              style={{ cursor: i === page ? 'default' : 'pointer' }}
            >
              <span className="page-link">{i + 1}</span>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
