import React, { useEffect, useState } from 'react';
import adminProductService from '../../services/admin/adminProductService';
import adminBrandService from '../../services/admin/adminBrandService';
import adminCategoryService from '../../services/admin/adminCategoryService';
import { Modal, Button, Input, Checkbox, Select, Form, message, Spin } from 'antd';

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

  // ===== TITLE =====
  useEffect(() => {
    const prev = document.title;
    document.title = "Quản lý sản phẩm";
    return () => (document.title = prev);
  }, []);

  // ===== LOAD PRODUCTS =====
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

  // ===== LOAD BRANDS =====
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

  // ===== LOAD CATEGORIES =====
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

  // ===== FIX FORM LIFECYCLE (QUAN TRỌNG) =====
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

  // ===== MODAL =====
  const openModal = (product = null) => {
    setEditingProduct(product);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  // ===== SUBMIT =====
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
      // ===== 🔥 MAP LỖI BACKEND =====
      if (err.response?.data) {
        const data = err.response.data;

        // case: { field: message }
        if (typeof data === 'object') {
          const fieldErrors = Object.entries(data).map(([field, msg]) => ({
            name: field,
            errors: [msg],
          }));

          form.setFields(fieldErrors);

          // fallback toast
          Object.values(data).forEach(msg => message.error(msg));
        } else {
          message.error('Lỗi hệ thống');
        }

      } else if (err.errorFields) {
        // lỗi validate phía client (antd)
      } else {
        message.error('Không thể lưu sản phẩm');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // ===== DELETE =====
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
    <div className="container mt-4">
      <h2 className="text-center mb-4">Quản lý sản phẩm</h2>

      <Button type="primary" onClick={() => openModal()}>
        Thêm sản phẩm
      </Button>

      {loading ? (
        <div className="d-flex justify-content-center" style={{ height: 200 }}>
          <Spin size="large" />
        </div>
      ) : (
        <table className="table table-bordered mt-3">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ảnh</th>
              <th>Tên</th>
              <th>Giá</th>
              <th>SL</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>
                  {p.imageUrl
                    ? <img src={p.imageUrl} width={50} />
                    : 'N/A'}
                </td>
                <td>{p.name}</td>
                <td>{p.price.toLocaleString()} đ</td>
                <td>{p.stock}</td>
                <td>{brands.find(b => b.id === p.brandId)?.name || 'N/A'}</td>
                <td>{categories.find(c => c.id === p.categoryId)?.name || 'N/A'}</td>
                <td>
                  <Button onClick={() => openModal(p)}>Sửa</Button>
                  <Button danger onClick={() => handleDelete(p.id)}>Xóa</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* PAGINATION */}
      <div className="text-center mt-3">
        {Array.from({ length: totalPages }, (_, i) => (
          <Button
            key={i}
            type={i === page ? 'primary' : 'default'}
            onClick={() => onChangePage(i)}
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
        destroyOnHidden
      >
        <Form form={form} layout="vertical" initialValues={{ available: true }}>

          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả" rules={[{ required: true }]}>
            <Input.TextArea />
          </Form.Item>

          <Form.Item name="imageUrl" label="Ảnh">
            <Input />
          </Form.Item>

          <Form.Item name="stock" label="Số lượng" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>

          <Form.Item name="available" valuePropName="checked">
            <Checkbox>Còn hàng</Checkbox>
          </Form.Item>

          <Form.Item name="brandId" label="Brand" rules={[{ required: true }]}>
            <Select
              options={brands.map(b => ({ label: b.name, value: b.id }))}
            />
          </Form.Item>

          <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}>
            <Select
              options={categories.map(c => ({ label: c.name, value: c.id }))}
            />
          </Form.Item>

        </Form>
      </Modal>
    </div>
  );
}