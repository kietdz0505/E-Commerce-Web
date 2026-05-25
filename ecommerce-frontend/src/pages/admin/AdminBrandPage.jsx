import React, { useEffect, useState } from 'react';
import { Table, Button, Pagination, Spin, Popconfirm, message } from 'antd'; 
import adminBrandService from '../../services/admin/adminBrandService';
import '../../styles/adminBrandPage.css'; 

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

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Quản lý thương hiệu"; 

    return () => {
      document.title = previousTitle; 
    };
  }, []);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const data = await adminBrandService.getAllBrands(page, size);
      setBrands(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Lỗi tải brand:', error);
      message.error('Lỗi khi tải danh sách thương hiệu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminBrandService.deleteBrand(id);
      message.success('Xóa thương hiệu thành công');
      loadBrands();
    } catch (error) {
      message.error('Lỗi khi xóa thương hiệu');
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
        message.success('Cập nhật thương hiệu thành công');
      } else {
        await adminBrandService.createBrand(brandData);
        message.success('Thêm thương hiệu mới thành công');
      }
      setShowForm(false);
      loadBrands();
    } catch (error) {
      message.error('Lỗi khi lưu thương hiệu');
    }
  };

  useEffect(() => {
    loadBrands();
  }, [page]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      className: 'az-col-brand-id',
      onCell: () => ({ 'data-label': 'ID:' }),
    },
    {
      title: 'Tên thương hiệu',
      dataIndex: 'name',
      key: 'name',
      className: 'az-col-brand-name',
      onCell: () => ({ 'data-label': 'Tên thương hiệu:' }),
      render: (text) => <span className="az-brand-name-text">{text}</span>
    },
    {
      title: 'Logo',
      dataIndex: 'logoUrl',
      key: 'logoUrl',
      width: 120,
      className: 'az-col-brand-logo',
      onCell: () => ({ 'data-label': 'Logo:' }),
      render: (url, record) =>
        url ? (
          <div className="az-brand-img-container">
            <img
              src={url}
              alt={record.name}
              onError={(e) => (e.target.src = '/placeholder-image.png')}
            />
          </div>
        ) : (
          <span className="text-muted text-sm">Không có</span>
        ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      className: 'az-col-brand-actions',
      onCell: () => ({ 'data-label': 'Hành động:' }),
      render: (_, record) => (
        <div className="az-brand-action-btns">
          <Button
            type="primary"
            size="small"
            onClick={() => openEditForm(record)}
            className="az-btn-edit"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa thương hiệu này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger size="small" className="az-btn-delete">
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="container admin-brand-container">
      <h2 className="text-center d-flex justify-content-center mb-4 mt-4 fw-bold admin-page-title">
        Quản lý thương hiệu (Brand)
      </h2>

      <div className="d-flex mb-3">
        <Button type="primary" onClick={openCreateForm} className="az-btn-add-brand">
          Thêm thương hiệu mới
        </Button>
      </div>

      <Spin spinning={loading} size="large" tip="Đang tải...">
        <div className="az-table-wrapper">
          <Table
            columns={columns}
            dataSource={brands}
            rowKey="id"
            pagination={false}
            bordered
            className="az-custom-table"
          />
        </div>

        {/* Pagination */}
        <div className="az-pagination-wrapper">
          <Pagination
            current={page + 1}
            pageSize={size}
            total={totalPages * size}
            onChange={(p) => setPage(p - 1)}
            showSizeChanger={false}
            className="d-flex justify-content-center"
          />
        </div>
      </Spin>

      {/* Form thêm/sửa */}
      {showForm && (
        <div
          className="modal show d-block az-custom-modal"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) =>
            e.target.classList.contains('modal') && setShowForm(false)
          }
        >
          <div className="modal-dialog modal-dialog-centered">
            <form className="modal-content az-modal-content" onSubmit={handleFormSubmit}>
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editingBrand ? 'Sửa thương hiệu' : 'Thêm thương hiệu mới'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowForm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Tên thương hiệu</label>
                  <input
                    type="text"
                    className="form-control"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    required
                    placeholder="Nhập tên thương hiệu..."
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Logo URL</label>
                  <input
                    type="url"
                    className="form-control"
                    value={brandLogoUrl}
                    onChange={(e) => setBrandLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                  {brandLogoUrl && (
                    <div className="az-modal-img-preview mt-2">
                      <img
                        src={brandLogoUrl}
                        alt="Preview logo"
                        onError={(e) => (e.target.style.display = 'none')}
                      />
                    </div>
                  )}
                  <small className="form-text text-muted d-block mt-1">Không bắt buộc</small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary px-4"
                  onClick={() => setShowForm(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary px-4">
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