import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, message, DatePicker, Select } from 'antd';
import adminPromotionService from '../../services/admin/adminPromotionService';
import adminProductService from '../../services/admin/adminProductService';
import dayjs from 'dayjs';
import PaginationConfig from '../../config/paginationConfig';
import '../../styles/adminPromotionsPage.css';

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);

  const [form] = Form.useForm();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Quản lý khuyến mãi";

    return () => {
      document.title = previousTitle;
    };
  }, []);

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

  const fetchProducts = async () => {
    try {
      const data = await adminProductService.getAllProducts(0, PaginationConfig.DEFAULT_PAGE_SIZE);
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
    {
      title: 'Mã KM',
      dataIndex: 'code',
      key: 'code',
      className: 'az-col-code',
      onCell: () => ({ 'data-label': 'Mã KM:' })
    },
    {
      title: 'Tên khuyến mãi',
      dataIndex: 'description',
      key: 'description',
      className: 'az-col-desc',
      onCell: () => ({ 'data-label': 'Tên khuyến mãi:' })
    },
    {
      title: 'Phần trăm giảm',
      dataIndex: 'discountPercent',
      key: 'discountPercent',
      className: 'az-col-percent',
      onCell: () => ({ 'data-label': 'Phần trăm giảm:' }),
      render: (v) => <span className="az-promo-percent">-{v}%</span>
    },
    {
      title: 'Giới hạn',
      dataIndex: 'usageLimit',
      key: 'usageLimit',
      className: 'az-col-limit',
      onCell: () => ({ 'data-label': 'Giới hạn:' })
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'validFrom',
      key: 'validFrom',
      className: 'az-col-start',
      onCell: () => ({ 'data-label': 'Ngày bắt đầu:' }),
      render: (v) => new Date(v).toLocaleDateString('vi-VN')
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'validTo',
      key: 'validTo',
      className: 'az-col-end',
      onCell: () => ({ 'data-label': 'Ngày kết thúc:' }),
      render: (v) => new Date(v).toLocaleDateString('vi-VN')
    },
    {
      title: 'Hành động',
      key: 'actions',
      className: 'az-col-actions',
      onCell: () => ({ 'data-label': 'Hành động:' }),
      render: (_, record) => (
        <Space className="az-promo-actions">
          <Button type="primary" onClick={() => handleOpenModal(record)}>Sửa</Button>
          <Popconfirm title="Xóa khuyến mãi này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="container admin-promotions-container">
      <h2 className='text-center d-flex justify-content-center mb-4 mt-4 fw-bold admin-page-title'>
        Quản lý khuyến mãi
      </h2>      
      <div className="d-flex mb-3">
        <Button type="primary" onClick={() => handleOpenModal()} className="az-btn-add">
          Thêm khuyến mãi
        </Button>
      </div>

      <div className="az-table-wrapper">
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
            className: 'd-flex justify-content-center m-0 py-3 az-custom-pagination',
          }}
          className="az-custom-table"
        />
      </div>

      <Modal
        title={editingPromotion ? 'Sửa khuyến mãi' : 'Thêm khuyến mãi'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
        centered
        className="az-admin-modal"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            validFrom: dayjs(),
            validTo: dayjs(),
            products: []
          }}
          className="mt-3"
        >
          <div className="row">
            <div className="col-12 col-md-6">
              <Form.Item name="code" label="Mã khuyến mãi" rules={[{ required: true, message: 'Vui lòng nhập mã' }]}>
                <Input placeholder="Ví dụ: SUMMER50" />
              </Form.Item>
            </div>
            <div className="col-12 col-md-6">
              <Form.Item name="description" label="Tên khuyến mãi" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                <Input placeholder="Ví dụ: Giảm giá mùa hè" />
              </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col-12 col-md-6">
              <Form.Item name="discountPercent" label="Phần trăm giảm (%)" rules={[{ required: true, message: 'Nhập % giảm' }]}>
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </div>
            <div className="col-12 col-md-6">
              <Form.Item name="usageLimit" label="Giới hạn số lần sử dụng" rules={[{ required: true, message: 'Nhập số lần' }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col-12 col-md-6">
              <Form.Item name="validFrom" label="Ngày bắt đầu" rules={[{ required: true }]}>
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: '100%' }}
                  getPopupContainer={(trigger) => document.body}
                />
              </Form.Item>
            </div>
            <div className="col-12 col-md-6">
              <Form.Item name="validTo" label="Ngày kết thúc" rules={[{ required: true }]}>
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: '100%' }}
                  getPopupContainer={(trigger) => document.body}
                />
              </Form.Item>
            </div>
          </div>

          <Form.Item name="products" label="Sản phẩm áp dụng" rules={[{ required: true, message: 'Chọn ít nhất 1 sản phẩm' }]}>
            <Select
              mode="multiple"
              placeholder="Chọn sản phẩm"
              showSearch
              filterOption={false}
              style={{ width: '100%' }}
              onSearch={async (value) => {
                if (value.trim().toLowerCase() === "all" || value.trim().toLowerCase() === "@all") {
                  try {
                    const data = await adminProductService.getAllProducts(0, 9999);
                    setProducts(data.content || data);
                  } catch {
                    message.error("Không thể tải tất cả sản phẩm");
                  }
                } else if (value.trim()) {
                  try {
                    const data = await adminProductService.searchProducts(value);
                    setProducts(data.content || data);
                  } catch {
                    message.error("Lỗi khi tìm kiếm sản phẩm");
                  }
                } else {
                  fetchProducts();
                }
              }}
              onSelect={(value) => {
                if (value === "@select_all") {
                  const allIds = products.filter(p => p.id).map(p => p.id);
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