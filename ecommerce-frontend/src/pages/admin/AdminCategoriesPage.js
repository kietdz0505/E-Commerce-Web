import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Input,
  Form,
  Space,
  Popconfirm,
  message,
  Pagination,
  Spin,
} from 'antd';
import adminCategoryService from '../../services/admin/adminCategoryService';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await adminCategoryService.getCategories(page, size);
      setCategories(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      message.error('Lỗi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await adminCategoryService.deleteCategory(id);
      message.success('Xóa danh mục thành công');
      // Nếu xóa xong mà trang hiện tại ko còn dữ liệu thì lùi trang
      if (categories.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        loadCategories();
      }
    } catch (error) {
      message.error('Lỗi khi xóa danh mục');
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setEditingCategory(null);
    form.resetFields();
    setShowForm(true);
  };

  const openEditForm = (category) => {
    setEditingCategory(category);
    form.setFieldsValue({ name: category.name });
    setShowForm(true);
  };

  const handleFormSubmit = async (values) => {
    try {
      setLoading(true);
      if (editingCategory) {
        await adminCategoryService.updateCategory(editingCategory.id, {
          name: values.name,
        });
        message.success('Cập nhật danh mục thành công');
      } else {
        await adminCategoryService.createCategory({ name: values.name });
        message.success('Tạo danh mục thành công');
      }
      setShowForm(false);
      loadCategories();
    } catch (error) {
      message.error('Lỗi khi lưu danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [page]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => openEditForm(record)}
            disabled={loading}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa danh mục này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
            disabled={loading}
          >
            <Button danger size="small" disabled={loading}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '40px auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Quản lý danh mục</h2>

      <Button
        type="primary"
        onClick={openCreateForm}
        disabled={loading}
        style={{ marginBottom: 16 }}
      >
        Thêm danh mục mới
      </Button>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          pagination={false}
          locale={{
            emptyText: 'Không có dữ liệu danh mục',
          }}
        />
      </Spin>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Pagination
          current={page + 1}
          pageSize={size}
          total={totalPages * size}
          onChange={(p) => setPage(p - 1)}
          showSizeChanger={false}
          className='d-flex justify-content-center'
        />
      </div>

      <Modal
        title={editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
        visible={showForm}
        onCancel={() => setShowForm(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{ name: '' }}
        >
          <Form.Item
            label="Tên danh mục"
            name="name"
            rules={[{ required: true, message: 'Tên danh mục không được để trống' }]}
          >
            <Input disabled={loading} />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right' }}>
            <Button
              style={{ marginRight: 8 }}
              onClick={() => setShowForm(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Lưu
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
