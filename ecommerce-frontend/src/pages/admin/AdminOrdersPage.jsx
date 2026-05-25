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
import '../../styles/adminOrdersPage.css';

const { Option } = Select;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

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
      className: 'az-col-id',
      onCell: () => ({ 'data-label': 'Mã đơn:' }),
    },
    {
      title: 'Người đặt',
      dataIndex: 'receiverName',
      key: 'receiverName',
      className: 'az-col-name',
      onCell: () => ({ 'data-label': 'Người đặt:' }),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      className: 'az-col-amount',
      onCell: () => ({ 'data-label': 'Tổng tiền:' }),
      render: (value) => <span className="az-order-amount">{Number(value).toLocaleString('vi-VN')} ₫</span>,
      width: 160,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      className: 'az-col-status',
      onCell: () => ({ 'data-label': 'Trạng thái:' }),
      render: (status) => (
        <Tag color={getTagColor(status)} style={{ fontWeight: 'bold', margin: 0 }}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'orderDate',
      key: 'orderDate',
      className: 'az-col-date',
      onCell: () => ({ 'data-label': 'Ngày tạo:' }),
      render: (date) => new Date(date).toLocaleString('vi-VN'),
      width: 180,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 220,
      className: 'az-col-action',
      onCell: () => ({ 'data-label': 'Hành động:' }),
      render: (_, record) => {
        const disabled =
          record.status === 'COMPLETED' ||
          record.status === 'FAILED' ||
          record.status === 'CANCELLED';

        return (
          <div className="az-action-buttons">
            <Select
              size="middle"
              className="az-status-select"
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
              danger
              onClick={() => {
                setDeleteOrderId(record.id);
                setShowDeleteModal(true);
              }}
              disabled={loading}
              className="az-delete-btn"
            >
              Xóa
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="container admin-orders-container">
      <h2 className="admin-page-title">Quản lý đơn hàng</h2>

      <Spin spinning={loading}>
        <div className="az-table-wrapper">
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: 'Không có đơn hàng' }}
            scroll={{ x: 'max-content' }}
            className="az-custom-table"
          />
        </div>

        <div className="az-pagination-wrapper">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={(p) => setPage(p)}
            showSizeChanger={false}
          />
        </div>
      </Spin>

      <Modal
        title="Xác nhận xóa đơn hàng"
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onOk={handleDelete}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true, loading: loading }}
        cancelButtonProps={{ disabled: loading }}
        centered
        className="az-admin-modal"
      >
        <p className="mb-0">Bạn có chắc muốn xóa đơn hàng này? Thao tác này không thể hoàn tác.</p>
      </Modal>
    </div>
  );
}