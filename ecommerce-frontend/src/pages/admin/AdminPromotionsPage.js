import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, message, DatePicker, Select } from 'antd';
import adminPromotionService from '../../services/admin/adminPromotionService';
import adminProductService from '../../services/admin/adminProductService';
import dayjs from 'dayjs';
import PaginationConfig from '../../config/paginationConfig';

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]); // lưu danh sách sản phẩm
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);

  const [form] = Form.useForm();

  // Lấy danh sách khuyến mãi
  const fetchPromotions = async (currentPage = page, currentSize = pageSize) => {
    setLoading(true);
    try {
      const data = await adminPromotionService.getPromotions(currentPage - 1, currentSize);
      setPromotions(data.content || []);
      setTotal(data.totalElements || 0);
    } catch {
      message.error('Lỗi khi tải danh sách khuyến mãi');
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      const data = await adminProductService.getAllProducts(0, PaginationConfig.DEFAULT_PAGE_SIZE); // load 20 sản phẩm đầu
      setProducts(data.content || []);
    } catch {
      message.error('Không thể tải sản phẩm');
    }
  };

  useEffect(() => {
    fetchPromotions();
    fetchProducts();
  }, [page, pageSize]);

  const handleOpenModal = (promotion = null) => {
    setEditingPromotion(promotion);
    if (promotion) {
      form.setFieldsValue({
        ...promotion,
        validFrom: dayjs(promotion.validFrom),
        validTo: dayjs(promotion.validTo),
        products: promotion.products?.map(p => p.id) || []
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        validFrom: values.validFrom.format('YYYY-MM-DDTHH:mm:ss'),
        validTo: values.validTo.format('YYYY-MM-DDTHH:mm:ss'),
        products: values.products.map(id => ({ id }))
      };

      if (editingPromotion) {
        await adminPromotionService.updatePromotion(editingPromotion.id, payload);
        message.success('Cập nhật khuyến mãi thành công');
      } else {
        await adminPromotionService.createPromotion(payload);
        message.success('Thêm khuyến mãi thành công');
      }
      setIsModalVisible(false);
      fetchPromotions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminPromotionService.deletePromotion(id);
      message.success('Xóa khuyến mãi thành công');
      fetchPromotions();
    } catch {
      message.error('Lỗi khi xóa khuyến mãi');
    }
  };

  const columns = [
    { title: 'Mã KM', dataIndex: 'code', key: 'code' },
    { title: 'Tên khuyến mãi', dataIndex: 'description', key: 'description' },
    { title: 'Phần trăm giảm', dataIndex: 'discountPercent', key: 'discountPercent', render: (v) => `${v}%` },
    { title: 'Giới hạn', dataIndex: 'usageLimit', key: 'usageLimit' },
    { title: 'Ngày bắt đầu', dataIndex: 'validFrom', key: 'validFrom', render: (v) => new Date(v).toLocaleDateString('vi-VN') },
    { title: 'Ngày kết thúc', dataIndex: 'validTo', key: 'validTo', render: (v) => new Date(v).toLocaleDateString('vi-VN') },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleOpenModal(record)}>Sửa</Button>
          <Popconfirm title="Xóa khuyến mãi này?" onConfirm={() => handleDelete(record.id)}>
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2 className='text-center mb-4 mt-4'>Quản lý khuyến mãi</h2>
      <Button type="primary" style={{ marginBottom: 16 }} onClick={() => handleOpenModal()}>Thêm khuyến mãi</Button>

      <Table
        bordered
        loading={loading}
        columns={columns}
        dataSource={promotions}
        rowKey="id"
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          className: 'd-flex justify-content-center',
        }}
      />

      <Modal
        title={editingPromotion ? 'Sửa khuyến mãi' : 'Thêm khuyến mãi'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            validFrom: dayjs(),
            validTo: dayjs(),
            products: []
          }}
        >
          <Form.Item name="code" label="Mã khuyến mãi" rules={[{ required: true, message: 'Vui lòng nhập mã' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Tên khuyến mãi" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="discountPercent" label="Phần trăm giảm (%)" rules={[{ required: true }]}>
            <InputNumber min={1} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="usageLimit" label="Giới hạn số lần sử dụng" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="validFrom" label="Ngày bắt đầu" rules={[{ required: true }]}>
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: '100%' }}
              getPopupContainer={(trigger) => document.body}
            />
          </Form.Item>

          <Form.Item name="validTo" label="Ngày kết thúc" rules={[{ required: true }]}>
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: '100%' }}
              getPopupContainer={(trigger) => document.body}
            />
          </Form.Item>

          <Form.Item name="products" label="Sản phẩm áp dụng" rules={[{ required: true }]}>
            <Select
              mode="multiple"
              placeholder="Chọn sản phẩm"
              showSearch
              filterOption={false}
              onSearch={async (value) => {
                if (value.trim().toLowerCase() === "all" || value.trim().toLowerCase() === "@all") {
                  try {
                    const data = await adminProductService.getAllProducts(0, 9999);
                    const allProducts = data.content || data; // thêm fallback
                    setProducts(allProducts);
                  } catch {
                    message.error("Không thể tải tất cả sản phẩm");
                  }
                } else if (value.trim()) {
                  try {
                    const data = await adminProductService.searchProducts(value);
                    setProducts(data.content || data); // fallback khi không phải Page
                  } catch {
                    message.error("Lỗi khi tìm kiếm sản phẩm");
                  }
                } else {
                  fetchProducts();
                }
              }}

              onSelect={(value) => {
                if (value === "@select_all") {
                  const allIds = products.map(p => p.id);
                  form.setFieldsValue({ products: allIds });
                }
              }}
              options={[
                { label: "✅ Chọn tất cả sản phẩm", value: "@select_all" },
                ...products.map(p => ({ label: p.name, value: p.id }))
              ]}
            />
          </Form.Item>


        </Form>
      </Modal>
    </div>
  );
}
