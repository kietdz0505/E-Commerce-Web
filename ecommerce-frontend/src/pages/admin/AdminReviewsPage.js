// src/pages/admin/AdminReviewsPage.js
import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Popconfirm, message, Rate } from 'antd';
import adminReviewService from '../../services/admin/adminReviewService';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // backend trả về
  const [total, setTotal] = useState(0);

  const fetchReviews = async (currentPage = page) => {
    try {
      setLoading(true);
      const data = await adminReviewService.getAllReviews(currentPage - 1, pageSize);
      setReviews(data.content || []);
      setTotal(data.totalElements || 0);
      setPageSize(data.size || 10);
    } catch (error) {
      message.error('Lỗi khi tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page]);

  const handleDelete = async (productId, reviewId) => {
    try {
      await adminReviewService.deleteReview(productId, reviewId);
      message.success('Xóa đánh giá thành công');
      fetchReviews();
    } catch (error) {
      message.error('Lỗi khi xóa đánh giá');
    }
  };

  const columns = [
    {
      title: 'Người dùng',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => <Rate disabled defaultValue={rating} />,
    },
    {
      title: 'Nội dung',
      dataIndex: 'comment',
      key: 'comment',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Bạn có chắc muốn xóa đánh giá này?"
            onConfirm={() => handleDelete(record.productId, record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>Quản lý đánh giá</h2>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={reviews}
        loading={loading}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          onChange: (p) => setPage(p),
        }}
      />
    </div>
  );
};

export default AdminReviewsPage;
