import React, { useEffect, useState } from 'react';
import { Spinner, Table, Button, Modal } from 'react-bootstrap';
import adminOrderService from '../../services/admin/adminOrderService';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // For confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteOrderId, setDeleteOrderId] = useState(null);

  const getBadgeColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'PAID':
        return 'info';
      case 'SHIPPED':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      case 'FAILED':
        return 'dark';
      default:
        return 'secondary';
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
      alert('Lỗi khi tải đơn hàng');
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
      alert('Xóa đơn hàng thành công');
      setShowDeleteModal(false);
      fetchOrders();
    } catch {
      alert('Lỗi khi xóa đơn hàng');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await adminOrderService.updateOrderStatus(id, newStatus);
      alert('Cập nhật trạng thái đơn hàng thành công');
      fetchOrders();
    } catch {
      alert('Lỗi khi cập nhật trạng thái đơn hàng');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="container my-5" style={{ maxWidth: 900 }}>
      <h2 className="mb-4 text-center">Quản lý đơn hàng</h2>

      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          <Table bordered hover responsive>
            <thead className="table-light">
              <tr>
                <th>Mã đơn</th>
                <th>Người đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th style={{ minWidth: '220px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => {
                  return (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.receiverName}</td>
                      <td>{order.totalAmount} VND</td>
                      <td>
                        <span className={`badge bg-${getBadgeColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{new Date(order.orderDate).toLocaleString()}</td>
                      <td className='d-flex gap-2'>
                        <select
                          className="form-select form-select-sm"
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          disabled={order.status === 'COMPLETED' || order.status === 'FAILED' || order.status === 'CANCELLED'}
                          style={{ maxWidth: '160px' }}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PAID">PAID</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="FAILED">FAILED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                        {' '}
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            setDeleteOrderId(order.id);
                            setShowDeleteModal(true);
                          }}
                        >
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-3">
                    Không có đơn hàng
                  </td>
                </tr>
              )}
            </tbody>


          </Table>

          {/* Pagination */}
          <nav aria-label="Page navigation" className="d-flex justify-content-center">
            <ul className="pagination">
              <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 1}>
                  &laquo;
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => (
                <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setPage(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                  &raquo;
                </button>
              </li>
            </ul>
          </nav>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc muốn xóa đơn hàng này?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
