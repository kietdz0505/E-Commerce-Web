import React, { useEffect, useState } from 'react';
import adminProductService from '../../services/admin/adminProductService';
import adminBrandService from '../../services/admin/adminBrandService';
import adminCategoryService from '../../services/admin/adminCategoryService';
import Select from 'react-select';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    imageUrl: '',
    stock: '',
    available: true,
    brandId: '',
    categoryId: '',
  });

  const [formErrors, setFormErrors] = useState({});

  // State chứa danh sách brands và categories
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

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

  const loadBrands = async () => {
    setLoading(true);
    try {
      let allBrands = [];
      let currentPage = 0;
      let totalPages = 1;

      while (currentPage < totalPages) {
        const data = await adminBrandService.getAllBrands(currentPage, size);
        allBrands = allBrands.concat(data.content || []);
        totalPages = data.totalPages || 1;
        currentPage++;
      }

      setBrands(allBrands);
      setTotalPages(totalPages);
    } catch (error) {
      console.error('Lỗi tải brand:', error);
    } finally {
      setLoading(false);
    }
  };


  const loadCategories = async () => {
    try {
      const data = await adminCategoryService.getCategories(page, size);
      setCategories(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Lỗi tải danh mục:', error);
    }
  };


  useEffect(() => {
    loadProducts();
  }, [page]);

  useEffect(() => {
    loadBrands();
    loadCategories();
  }, []);

  const openModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
      setForm({
        name: product.name || '',
        price: product.price !== undefined ? product.price : '',
        description: product.description || '',
        imageUrl: product.imageUrl || '',
        stock: product.stock !== undefined ? product.stock : '',
        available: product.available !== undefined ? product.available : true,
        brandId: product.brandId !== undefined ? product.brandId : '',
        categoryId: product.categoryId !== undefined ? product.categoryId : '',
      });
    } else {
      setForm({
        name: '',
        price: '',
        description: '',
        imageUrl: '',
        stock: '',
        available: true,
        brandId: '',
        categoryId: '',
      });
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
    if (form.price === '' || isNaN(form.price) || Number(form.price) < 0) errors.price = 'Giá phải là số >= 0';
    if (form.stock === '' || isNaN(form.stock) || Number(form.stock) < 0) errors.stock = 'Số lượng phải là số >= 0';
    if (form.brandId === '' || isNaN(form.brandId) || Number(form.brandId) <= 0) errors.brandId = 'Brand ID phải là số nguyên dương';
    if (form.categoryId === '' || isNaN(form.categoryId) || Number(form.categoryId) <= 0) errors.categoryId = 'Category ID phải là số nguyên dương';
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload = {
      name: form.name,
      description: form.description,
      imageUrl: form.imageUrl,
      price: Number(form.price),
      stock: Number(form.stock),
      available: form.available,
      brandId: Number(form.brandId),
      categoryId: Number(form.categoryId),
    };

    try {
      if (editingProduct) {
        await adminProductService.updateProduct(editingProduct.id, payload);
        alert('Cập nhật sản phẩm thành công');
      } else {
        await adminProductService.createProduct(payload);
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
    <div className="container mt-4" >
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
        <table className="table table-bordered table-hover align-middle ">
          <thead className="table-light">
            <tr className="justify-content" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
              <th>ID</th>
              <th>Ảnh</th>
              <th style={{ minWidth: 200 }}>Tên sản phẩm</th>
              <th>Giá</th>
              <th style={{ minWidth: 100 }}>Số lượng</th>
              <th style={{ minWidth: 200 }}>Mô tả</th>
              <th>Available</th>
              <th>Brand</th>
              <th>Category</th>
              <th style={{ minWidth: 200 }}>Hành động</th>
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
                  <td style={{ whiteSpace: 'nowrap' }}>{p.price.toLocaleString()} đ</td>
                  <td>{p.stock}</td>
                  <td>{p.description}</td>
                  <td>{p.available ? '✅' : '❌'}</td>
                  <td>
                    {brands.find((b) => b.id === p.brandId)?.logoUrl ? (
                      <img
                        src={brands.find((b) => b.id === p.brandId)?.logoUrl}
                        alt={brands.find((b) => b.id === p.brandId)?.name || "Logo"}
                        style={{ width: 50, height: 50, objectFit: "contain" }}
                      />
                    ) : (
                      <span className="text-muted">Chưa có</span>
                    )}
                  </td>
                  <td>{categories.find((c) => c.id === p.categoryId)?.name || `#${p.categoryId} (Chưa có)`}</td>
                  <td>
                    <div className="d-flex justify-content-center">
                      <button
                        style={{ width: 100 }}
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => openModal(p)}
                      >
                        Sửa
                      </button>
                      <button
                        style={{ width: 100 }}
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(p.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center text-muted py-3">
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
                    <label className="form-label">Số lượng</label>
                    <input
                      type="number"
                      min="0"
                      className={`form-control ${formErrors.stock ? 'is-invalid' : ''}`}
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    />
                    {formErrors.stock && <div className="invalid-feedback">{formErrors.stock}</div>}
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
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={form.available}
                      onChange={(e) => setForm({ ...form, available: e.target.checked })}
                      id="availableCheck"
                    />
                    <label className="form-check-label" htmlFor="availableCheck">
                      Có hàng
                    </label>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Brand</label>
                    <Select
                      options={brands.map((b) => ({ value: b.id, label: b.name }))}
                      value={brands.find((b) => b.id === form.brandId) ? { value: form.brandId, label: brands.find((b) => b.id === form.brandId)?.name } : null}
                      onChange={(option) => setForm({ ...form, brandId: option?.value || '' })}
                      placeholder="-- Chọn Brand --"
                      isClearable
                    />
                    {formErrors.brandId && (
                      <div className="text-danger small mt-1">{formErrors.brandId}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select
                      className={`form-select ${formErrors.categoryId ? 'is-invalid' : ''}`}
                      value={form.categoryId}
                      onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    >
                      <option value="">-- Chọn Category --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.categoryId && <div className="invalid-feedback">{formErrors.categoryId}</div>}
                  </div>
                  <button type="submit" className="btn btn-primary">
                    {editingProduct ? 'Cập nhật' : 'Thêm'}
                  </button>
                  <button type="button" className="btn btn-secondary ms-2" onClick={closeModal}>
                    Hủy
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
