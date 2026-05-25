import React, { useEffect, useState } from 'react';
import adminProductService from '../../services/admin/adminProductService';
import adminBrandService from '../../services/admin/adminBrandService';
import adminCategoryService from '../../services/admin/adminCategoryService';
import { Modal, Button, Input, Checkbox, Select, Form, message, Spin } from 'antd';
import '../../styles/adminProductsPage.css';


export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form] = Form.useForm();

  useEffect(() => {
    const prev = document.title;
    document.title = "Quản lý sản phẩm";
    return () => (document.title = prev);
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await adminProductService.getAllProducts(page, size);
      setProducts(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch {
      message.error('Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const loadBrands = async () => {
    try {
      let all = [];
      let p = 0;
      let total = 1;

      while (p < total) {
        const data = await adminBrandService.getAllBrands(p, size);
        all = all.concat(data.content || []);
        total = data.totalPages || 1;
        p++;
      }

      setBrands(all);
    } catch {
      message.error('Lỗi tải thương hiệu');
    }
  };

  const loadCategories = async () => {
    try {
      const data = await adminCategoryService.getCategories(0, 1000);
      setCategories(data.content || []);
    } catch {
      message.error('Lỗi tải danh mục');
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page]);

  useEffect(() => {
    loadBrands();
    loadCategories();
  }, []);

  useEffect(() => {
    if (!modalVisible) return;

    if (editingProduct) {
      form.setFieldsValue({
        name: editingProduct.name || '',
        price: editingProduct.price ?? '',
        description: editingProduct.description || '',
        imageUrl: editingProduct.imageUrl || '',
        stock: editingProduct.stock ?? '',
        available: editingProduct.available ?? true,
        brandId: editingProduct.brandId || null,
        categoryId: editingProduct.categoryId || null,
      });
    } else {
      form.resetFields();
    }
  }, [modalVisible, editingProduct, form]);

  const openModal = (product = null) => {
    setEditingProduct(product);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        name: values.name,
        description: values.description,
        imageUrl: values.imageUrl,
        price: Number(values.price),
        stock: Number(values.stock),
        available: values.available,
        brandId: Number(values.brandId),
        categoryId: Number(values.categoryId),
      };

      setSubmitLoading(true);

      if (editingProduct) {
        await adminProductService.updateProduct(editingProduct.id, payload);
        message.success('Cập nhật sản phẩm thành công');
      } else {
        await adminProductService.createProduct(payload);
        message.success('Thêm sản phẩm thành công');
      }

      closeModal();
      loadProducts();

    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;

        if (typeof data === 'object') {
          const fieldErrors = Object.entries(data).map(([field, msg]) => ({
            name: field,
            errors: [msg],
          }));

          form.setFields(fieldErrors);
          Object.values(data).forEach(msg => message.error(msg));
        } else {
          message.error('Lỗi hệ thống');
        }
      } else if (err.errorFields) {
        // Lỗi validate client
      } else {
        message.error('Không thể lưu sản phẩm');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Bạn có chắc muốn xóa?',
      content: 'Không thể hoàn tác!',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      centered: true,
      onOk: async () => {
        try {
          await adminProductService.deleteProduct(id);
          message.success('Xóa thành công');
          loadProducts();
        } catch {
          message.error('Không thể xóa');
        }
      },
    });
  };

  const onChangePage = (i) => {
    if (i !== page) setPage(i);
  };

  return (
    <div className="container admin-products-container mt-4">
      <h2 style={{ marginTop: '2rem' }} className="text-center mb-4 fw-bold">Quản lý sản phẩm</h2>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button type="primary" onClick={() => openModal()} className="az-btn-add">
          Thêm sản phẩm
        </Button>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 200 }}>
          <Spin size="large" />
        </div>
      ) : (
        <div className="az-table-wrapper">
          <table className="table table-bordered az-responsive-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ảnh</th>
                <th>Tên</th>
                <th>Giá</th>
                <th>SL</th>
                <th>Brand</th>
                <th>Category</th>
                <th className="text-center">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td data-label="ID:">{p.id}</td>
                  <td data-label="Ảnh:" className="az-td-img">
                    {p.imageUrl ? (
                      <div className="az-img-container">
                        <img src={p.imageUrl} alt={p.name} />
                      </div>
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </td>
                  <td data-label="Tên:" className="az-td-name">{p.name}</td>
                  <td data-label="Giá:" className="az-td-price">{p.price.toLocaleString()} đ</td>
                  <td data-label="Số lượng:">{p.stock}</td>
                  <td data-label="Thương hiệu:">{brands.find(b => b.id === p.brandId)?.name || 'N/A'}</td>
                  <td data-label="Danh mục:">{categories.find(c => c.id === p.categoryId)?.name || 'N/A'}</td>
                  <td data-label="Hành động:" className="az-td-actions">
                    <Button onClick={() => openModal(p)} type="default" className="me-2">Sửa</Button>
                    <Button danger onClick={() => handleDelete(p.id)}>Xóa</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      <div className="d-flex justify-content-center flex-wrap gap-2 mt-4 mb-5">
        {Array.from({ length: totalPages }, (_, i) => (
          <Button
            key={i}
            type={i === page ? 'primary' : 'default'}
            onClick={() => onChangePage(i)}
            className="az-page-btn"
          >
            {i + 1}
          </Button>
        ))}
      </div>

      {/* MODAL */}
      <Modal
        title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={closeModal}
        confirmLoading={submitLoading}
        destroyOnClose
        centered
        style={{ top: 30 }}
        className="az-admin-modal"
        width={600}
      >
        <Form form={form} layout="vertical" initialValues={{ available: true }} className="mt-3">
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
            <Input />
          </Form.Item>

          <div className="row">
            <div className="col-12 col-md-6">
              <Form.Item name="price" label="Giá bán (đ)" rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}>
                <Input type="number" min={0} style={{ width: '100%' }} />
              </Form.Item>
            </div>
            <div className="col-12 col-md-6">
              <Form.Item name="stock" label="Số lượng kho" rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}>
                <Input type="number" min={0} style={{ width: '100%' }} />
              </Form.Item>
            </div>
          </div>

          <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item name="imageUrl" label="Đường dẫn ảnh sản phẩm">
            <Input />
          </Form.Item>

          <div className="row">
            <div className="col-12 col-md-6">
              <Form.Item name="brandId" label="Thương hiệu" rules={[{ required: true, message: 'Chọn thương hiệu!' }]}>
                <Select
                  options={brands.map(b => ({ label: b.name, value: b.id }))}
                  placeholder="Chọn thương hiệu"
                />
              </Form.Item>
            </div>
            <div className="col-12 col-md-6">
              <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true, message: 'Chọn danh mục!' }]}>
                <Select
                  options={categories.map(c => ({ label: c.name, value: c.id }))}
                  placeholder="Chọn danh mục"
                />
              </Form.Item>
            </div>
          </div>

          <Form.Item name="available" valuePropName="checked" className="mb-0">
            <Checkbox>Kích hoạt hiển thị (Còn hàng)</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}