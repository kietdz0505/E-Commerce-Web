import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Select,
  Pagination,
  Spin,
  message,
  Tag,
} from 'antd';
import adminOrderService from '../../services/admin/adminOrderService';

const { Option } = Select;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Delete Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteOrderId, setDeleteOrderId] = useState(null);


  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Quản lý đơn hàng";

    return () => {
      document.title = previousTitle;
    };
  }, []);

  const getTagColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'orange';
      case 'PAID':
        return 'blue';
      case 'SHIPPED':
        return 'processing';
      case 'COMPLETED':
        return 'green';
      case 'CANCELLED':
        return 'red';
      case 'FAILED':
        return 'default';
      default:
        return 'gray';
    }
  };

  const fetchOrders = async (currentPage = page) => {
    setLoading(true);
    try {
      const data = await adminOrderService.getAllOrders(currentPage - 1, pageSize);
      setOrders(data.content || []);
      setTotal(data.totalElements || 0);
      setPageSize(data.size || 10);
    } catch {
      message.error('Lỗi khi tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const handleDelete = async () => {
    try {
      await adminOrderService.deleteOrder(deleteOrderId);
      message.success('Xóa đơn hàng thành công');
      setShowDeleteModal(false);
      // Nếu xóa đơn cuối trang, có thể cần lùi page
      if (orders.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchOrders();
      }
    } catch {
      message.error('Lỗi khi xóa đơn hàng');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await adminOrderService.updateOrderStatus(id, newStatus);
      message.success('Cập nhật trạng thái đơn hàng thành công');
      fetchOrders();
    } catch {
      message.error('Lỗi khi cập nhật trạng thái đơn hàng');
    }
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Người đặt',
      dataIndex: 'receiverName',
      key: 'receiverName',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (value) => `${Number(value).toLocaleString('vi-VN')} VND`,
      width: 200,
    },

    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => (
        <Tag color={getTagColor(status)} style={{ fontWeight: 'bold' }}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date) => new Date(date).toLocaleString(),
      width: 180,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 220,
      render: (_, record) => {
        const disabled =
          record.status === 'COMPLETED' ||
          record.status === 'FAILED' ||
          record.status === 'CANCELLED';

        return (
          <div style={{ display: 'flex', gap: 8 }}>
            <Select
              size="small"
              style={{ width: 160 }}
              value={record.status}
              onChange={(value) => handleUpdateStatus(record.id, value)}
              disabled={disabled || loading}
            >
              <Option value="PENDING">PENDING</Option>
              <Option value="PAID">PAID</Option>
              <Option value="SHIPPED">SHIPPED</Option>
              <Option value="COMPLETED">COMPLETED</Option>
              <Option value="FAILED">FAILED</Option>
              <Option value="CANCELLED">CANCELLED</Option>
            </Select>
            <Button
              size="small"
              danger
              onClick={() => {
                setDeleteOrderId(record.id);
                setShowDeleteModal(true);
              }}
              disabled={loading}
            >
              Xóa
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="container" style={{ marginTop: 40 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Quản lý đơn hàng</h2>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: 'Không có đơn hàng' }}
          scroll={{ x: 'max-content' }}
        />

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={(p) => setPage(p)}
            showSizeChanger={false}
            className='d-flex justify-content-center mb-4'
          />
        </div>
      </Spin>

      <Modal
        title="Xác nhận xóa đơn hàng"
        visible={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onOk={handleDelete}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true, loading: loading }}
        cancelButtonProps={{ disabled: loading }}
        centered
      >
        <p>Bạn có chắc muốn xóa đơn hàng này?</p>
      </Modal>
    </div>
  );
}
