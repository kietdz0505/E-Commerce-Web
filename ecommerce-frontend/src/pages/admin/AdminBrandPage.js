import React, { useEffect, useState } from 'react';
import adminBrandService from '../../services/admin/adminBrandService';

export default function AdminBrandPage() {
  const [brands, setBrands] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form state
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandName, setBrandName] = useState('');
  const [brandLogoUrl, setBrandLogoUrl] = useState('');
  const [showForm, setShowForm] = useState(false);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const data = await adminBrandService.getAllBrands(page, size);
      setBrands(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Lỗi tải brand:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa thương hiệu này?')) {
      try {
        await adminBrandService.deleteBrand(id);
        loadBrands();
      } catch (error) {
        alert('Lỗi khi xóa thương hiệu');
      }
    }
  };

  const openCreateForm = () => {
    setEditingBrand(null);
    setBrandName('');
    setBrandLogoUrl('');
    setShowForm(true);
  };

  const openEditForm = (brand) => {
    setEditingBrand(brand);
    setBrandName(brand.name);
    setBrandLogoUrl(brand.logoUrl || '');
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const brandData = {
      name: brandName,
      logoUrl: brandLogoUrl,
    };

    try {
      if (editingBrand) {
        await adminBrandService.updateBrand(editingBrand.id, brandData);
      } else {
        await adminBrandService.createBrand(brandData);
      }
      setShowForm(false);
      loadBrands();
    } catch (error) {
      alert('Lỗi khi lưu thương hiệu');
    }
  };

  useEffect(() => {
    loadBrands();
  }, [page]);

  return (
    <div className="container mt-4" style={{ maxWidth: 900 }}>
      <h2 className="mb-4 text-center">Quản lý thương hiệu (Brand)</h2>

      <button className="btn btn-success mb-3" onClick={openCreateForm}>
        Thêm thương hiệu mới
      </button>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 200 }}>
          <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
          <span className="ms-2">Đang tải...</span>
        </div>
      ) : (
        <>
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Tên thương hiệu</th>
                <th>Logo</th>
                <th style={{ width: '180px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {brands.length > 0 ? (
                brands.map((b) => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.name}</td>
                    <td style={{ width: 100 }}>
                      {b.logoUrl ? (
                        <img
                          src={b.logoUrl}
                          alt={b.name}
                          style={{ maxHeight: 50, maxWidth: 100, objectFit: 'contain' }}
                          onError={(e) => (e.target.src = '/placeholder-image.png')}
                        />
                      ) : (
                        <span className="text-muted">Không có</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => openEditForm(b)}
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(b.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-3">
                    Không có dữ liệu thương hiệu
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
        </>
      )}

      {/* Form thêm/sửa */}
      {showForm && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => e.target.classList.contains('modal') && setShowForm(false)}
        >
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleFormSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">{editingBrand ? 'Sửa thương hiệu' : 'Thêm thương hiệu mới'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Tên thương hiệu</label>
                  <input
                    type="text"
                    className="form-control"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Logo URL</label>
                  <input
                    type="url"
                    className="form-control"
                    value={brandLogoUrl}
                    onChange={(e) => setBrandLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                  {brandLogoUrl && (
                    <img
                      src={brandLogoUrl}
                      alt="Preview logo"
                      style={{ maxHeight: 80, marginTop: 10, objectFit: 'contain' }}
                      onError={(e) => (e.target.style.display = 'none')}
                    />
                  )}
                  <small className="form-text text-muted">Không bắt buộc</small>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
