import React, { useEffect, useState } from 'react';
import adminProductService from '../../services/admin/adminProductService';
import adminBrandService from '../../services/admin/adminBrandService';
import adminCategoryService from '../../services/admin/adminCategoryService';
import { Modal, Button, Input, Checkbox, Select, Form, message, Spin } from 'antd';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form] = Form.useForm();

  useEffect(() => {
    const previousTitle = document.title; 
    document.title = "Quản lý sản phẩm"; 

    return () => {
        document.title = previousTitle; 
    };
}, []);

  // Load danh sách sản phẩm
  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await adminProductService.getAllProducts(page, size);
      setProducts(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      message.error('Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Load brands (đệ quy để lấy đủ trang)
  const loadBrands = async () => {
    setLoading(true);
    try {
      let allBrands = [];
      let currentPage = 0;
      let totalPagesLocal = 1;

      while (currentPage < totalPagesLocal) {
        const data = await adminBrandService.getAllBrands(currentPage, size);
        allBrands = allBrands.concat(data.content || []);
        totalPagesLocal = data.totalPages || 1;
        currentPage++;
      }

      setBrands(allBrands);
    } catch (error) {
      message.error('Lỗi tải thương hiệu');
    } finally {
      setLoading(false);
    }
  };

  // Load categories
  const loadCategories = async () => {
    try {
      const data = await adminCategoryService.getCategories(0, 1000); // giả định lấy hết
      setCategories(data.content || []);
    } catch (error) {
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

  // Mở modal và set giá trị form
  const openModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
      form.setFieldsValue({
        name: product.name || '',
        price: product.price !== undefined ? product.price : '',
        description: product.description || '',
        imageUrl: product.imageUrl || '',
        stock: product.stock !== undefined ? product.stock : '',
        available: product.available !== undefined ? product.available : true,
        brandId: product.brandId || null,
        categoryId: product.categoryId || null,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  // Đóng modal
  const closeModal = () => {
    setModalVisible(false);
  };

  // Submit form
  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
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

        try {
          if (editingProduct) {
            await adminProductService.updateProduct(editingProduct.id, payload);
            message.success('Cập nhật sản phẩm thành công');
          } else {
            await adminProductService.createProduct(payload);
            message.success('Thêm sản phẩm thành công');
          }
          closeModal();
          loadProducts();
        } catch (error) {
          message.error('Lỗi khi lưu sản phẩm');
        }
      })
      .catch(() => {
        // validation lỗi, AntD tự hiện message
      });
  };

  // Xóa sản phẩm
  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Bạn có chắc muốn xóa sản phẩm này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await adminProductService.deleteProduct(id);
          message.success('Xóa sản phẩm thành công');
          loadProducts();
        } catch {
          message.error('Không thể xóa sản phẩm');
        }
      },
    });
  };

  // Thay đổi trang
  const onChangePage = (pageIndex) => {
    if (pageIndex !== page) setPage(pageIndex);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Quản lý sản phẩm</h2>

      <Button type="primary" className="mb-3" onClick={() => openModal()}>
        Thêm sản phẩm
      </Button>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 200 }}>
          <Spin size="large" />
        </div>
      ) : (
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr style={{ textAlign: 'center', verticalAlign: 'middle' }}>
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
                        alt={brands.find((b) => b.id === p.brandId)?.name || 'Logo'}
                        style={{ width: 50, height: 50, objectFit: 'contain' }}
                      />
                    ) : (
                      <span className="text-muted">Chưa có</span>
                    )}
                  </td>
                  <td>{categories.find((c) => c.id === p.categoryId)?.name || `#${p.categoryId} (Chưa có)`}</td>
                  <td>
                    <div className="d-flex justify-content-center">
                      <Button
                        style={{ width: 100 }}
                        type="primary"
                        className="me-2"
                        onClick={() => openModal(p)}
                      >
                        Sửa
                      </Button>
                      <Button
                        style={{ width: 100 }}
                        danger
                        onClick={() => handleDelete(p.id)}
                      >
                        Xóa
                      </Button>
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

      {/* Modal Ant Design */}
      <Modal
        title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        visible={modalVisible}
        onOk={handleSubmit}
        onCancel={closeModal}
        okText={editingProduct ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ available: true }}
        >
          <Form.Item
            label="Tên sản phẩm"
            name="name"
            rules={[{ required: true, message: 'Tên sản phẩm không được để trống' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Giá"
            name="price"
            rules={[
              { required: true, message: 'Giá là bắt buộc' },
              {
                validator: (_, value) => {
                  if (value === undefined || value === '') return Promise.reject('Giá không được để trống');
                  if (isNaN(Number(value))) return Promise.reject('Giá phải là số');
                  if (Number(value) <= 0) return Promise.reject('Giá phải lớn hơn 0');
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input type="number" min={0} />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: 'Mô tả không được để trống' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="URL ảnh"
            name="imageUrl"
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Số lượng"
            name="stock"
            rules={[
              { required: true, message: 'Số lượng không được để trống' },
              {
                validator: (_, value) => {
                  if (value === undefined || value === '') return Promise.reject('Số lượng không được để trống');
                  if (!Number.isInteger(Number(value))) return Promise.reject('Số lượng phải là số nguyên');
                  if (Number(value) < 0) return Promise.reject('Số lượng phải lớn hơn hoặc bằng 0');
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input type="number" min={0} />
          </Form.Item>

          <Form.Item
            name="available"
            valuePropName="checked"
            style={{ marginBottom: 10 }}
          >
            <Checkbox>Còn hàng</Checkbox>
          </Form.Item>

          <Form.Item
            label="Thương hiệu"
            name="brandId"
            rules={[{ required: true, message: 'Chọn thương hiệu' }]}
          >
            <Select
              placeholder="Chọn thương hiệu"
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {brands.map((brand) => (
                <Select.Option key={brand.id} value={brand.id}>
                  {brand.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>


          <Form.Item
            label="Danh mục"
            name="categoryId"
            rules={[{ required: true, message: 'Chọn danh mục' }]}
          >
            <Select placeholder="Chọn danh mục" allowClear>
              {categories.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
