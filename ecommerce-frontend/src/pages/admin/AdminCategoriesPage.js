import React, { useEffect, useState } from 'react';
import adminCategoryService from '../../services/admin/adminCategoryService';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');

  // Loading state
  const [loading, setLoading] = useState(false);

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
        setLoading(true);
        await adminCategoryService.deleteCategory(id);
        await loadCategories();
      } catch (error) {
        alert('Lỗi khi xóa danh mục');
      } finally {
        setLoading(false);
      }
    }
  };

  const openCreateForm = () => {
    setEditingCategory(null);
    setCategoryName('');
    setShowForm(true);
  };

  const openEditForm = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      alert('Tên danh mục không được để trống');
      return;
    }

    try {
      setLoading(true);
      if (editingCategory) {
        await adminCategoryService.updateCategory(editingCategory.id, { name: categoryName });
      } else {
        await adminCategoryService.createCategory({ name: categoryName });
      }
      setShowForm(false);
      await loadCategories();
    } catch (error) {
      alert('Lỗi khi lưu danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [page]);

  return (
    <div className="container mt-4" style={{ maxWidth: 900 }}>
      <h2 className="mb-4 text-center">Quản lý danh mục</h2>

      <button
        className="btn btn-success mb-3"
        onClick={openCreateForm}
        disabled={loading}
      >
        Thêm danh mục mới
      </button>

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
            categories.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => openEditForm(c)}
                    disabled={loading}
                  >
                    {loading && editingCategory?.id === c.id ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Đang lưu...
                      </>
                    ) : (
                      'Sửa'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(c.id)}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Đang xóa...
                      </>
                    ) : (
                      'Xóa'
                    )}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center text-muted py-3">
                Không có dữ liệu danh mục
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Phân trang */}
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

      {/* Modal form thêm/sửa */}
      {showForm && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleFormSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowForm(false)}
                  disabled={loading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Tên danh mục</label>
                  <input
                    type="text"
                    className="form-control"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                  disabled={loading}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-1"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
