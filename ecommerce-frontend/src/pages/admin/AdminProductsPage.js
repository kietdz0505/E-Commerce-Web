import React, { useEffect, useState } from 'react';
import { adminProductService } from '../../services/admin/adminProductService';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form state, thêm imageUrl
  const [form, setForm] = useState({ name: '', price: '', description: '', imageUrl: '' });
  const [formErrors, setFormErrors] = useState({});

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await adminProductService.getAllProducts(page, size);
      setProducts(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      alert('Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page]);

  const openModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
      setForm({
        name: product.name || '',
        price: product.price || '',
        description: product.description || '',
        imageUrl: product.imageUrl || ''
      });
    } else {
      setForm({ name: '', price: '', description: '', imageUrl: '' });
    }
    setFormErrors({});
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const validateForm = () => {
    let errors = {};
    if (!form.name.trim()) errors.name = 'Tên sản phẩm không được để trống';
    if (form.price === '' || isNaN(form.price) || form.price < 0) errors.price = 'Giá phải là số >= 0';
    // Có thể validate URL ảnh nếu muốn
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      if (editingProduct) {
        await adminProductService.updateProduct(editingProduct.id, form);
        alert('Cập nhật sản phẩm thành công');
      } else {
        await adminProductService.createProduct(form);
        alert('Thêm sản phẩm thành công');
      }
      closeModal();
      loadProducts();
    } catch {
      alert('Lỗi khi lưu sản phẩm');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await adminProductService.deleteProduct(id);
      alert('Xóa sản phẩm thành công');
      loadProducts();
    } catch {
      alert('Không thể xóa sản phẩm');
    }
  };

  const onChangePage = (pageIndex) => {
    if (pageIndex !== page) setPage(pageIndex);
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 900 }}>
      <h2 className="mb-4 text-center">Quản lý sản phẩm</h2>

      <button className="btn btn-primary mb-3" onClick={() => openModal()}>
        Thêm sản phẩm
      </button>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 200 }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Giá</th>
              <th>Mô tả</th>
              <th style={{ width: '160px' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
                      />
                    ) : (
                      <span className="text-muted">Chưa có ảnh</span>
                    )}
                  </td>
                  <td>{p.name}</td>
                  <td>{p.price.toLocaleString()} đ</td>
                  <td>{p.description}</td>
                  <td>
                    <button className="btn btn-sm btn-primary me-2" onClick={() => openModal(p)}>
                      Sửa
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-muted py-3">
                  Không có dữ liệu sản phẩm
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}


      {/* Pagination */}
      <nav aria-label="Page navigation" className="d-flex justify-content-center">
        <ul className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <li
              key={i}
              className={`page-item ${i === page ? 'active' : ''}`}
              onClick={() => onChangePage(i)}
              style={{ cursor: i === page ? 'default' : 'pointer' }}
            >
              <span className="page-link">{i + 1}</span>
            </li>
          ))}
        </ul>
      </nav>

      {/* Modal */}
      {modalVisible && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                  }}
                >
                  <div className="mb-3">
                    <label className="form-label">Tên sản phẩm</label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Giá</label>
                    <input
                      type="number"
                      min="0"
                      className={`form-control ${formErrors.price ? 'is-invalid' : ''}`}
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                    />
                    {formErrors.price && <div className="invalid-feedback">{formErrors.price}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mô tả</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">URL ảnh sản phẩm</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      placeholder="Nhập URL ảnh"
                    />
                  </div>
                  <div className="d-flex justify-content-end">
                    <button type="button" className="btn btn-secondary me-2" onClick={closeModal}>
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Lưu
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
