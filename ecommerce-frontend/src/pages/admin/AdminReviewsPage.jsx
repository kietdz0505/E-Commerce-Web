import React, { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, message, Rate, Spin } from 'antd';
import adminProductService from '../../services/admin/adminProductService';
import adminReviewService from '../../services/admin/adminReviewService';

const AdminReviewsPage = () => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsPage, setProductsPage] = useState(1);
  const [productsPageSize, setProductsPageSize] = useState(10);
  const [productsTotal, setProductsTotal] = useState(0);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsPageSize, setReviewsPageSize] = useState(5);
  const [reviewsTotal, setReviewsTotal] = useState(0);


  useEffect(() => {
    const previousTitle = document.title; 
    document.title = "Quản lý đánh giá sản phẩm"; 

    return () => {
        document.title = previousTitle; 
    };
}, []);

  // Lấy danh sách sản phẩm kèm số lượng review (bạn backend phải trả về hoặc gọi API riêng)
  const fetchProducts = async (page = productsPage) => {
    try {
      setLoadingProducts(true);
      const data = await adminProductService.getAllProducts(page - 1, productsPageSize);
      setProducts(data.content || []);
      setProductsTotal(data.totalElements || 0);
      setProductsPageSize(data.size || 10);
      setProductsPage(page);
    } catch {
      message.error('Lỗi tải danh sách sản phẩm');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Lấy danh sách review cho sản phẩm được chọn
  const fetchReviews = async (productId, page = reviewsPage) => {
    try {
      setLoadingReviews(true);
      const data = await adminReviewService.getAllReviews(productId, page - 1, reviewsPageSize);
      setReviews(data.content || []);
      setReviewsTotal(data.totalElements || 0);
      setReviewsPageSize(data.size || 5);
      setReviewsPage(page);
    } catch {
      message.error('Lỗi tải đánh giá');
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Khi đổi trang sản phẩm
  const handleProductsPageChange = (page) => {
    fetchProducts(page);
    setSelectedProduct(null); // reset review khi đổi trang sản phẩm
    setReviews([]);
  };

  // Khi admin chọn xem review sản phẩm
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    fetchReviews(product.id, 1);
  };

  const handleReviewsPageChange = (page) => {
    if (selectedProduct) fetchReviews(selectedProduct.id, page);
  };

  // Xóa review
  const handleDeleteReview = async (reviewId) => {
    try {
      await adminReviewService.deleteReview(selectedProduct.id, reviewId);
      message.success('Xóa đánh giá thành công');
      fetchReviews(selectedProduct.id, reviewsPage);
    } catch {
      message.error('Xóa đánh giá thất bại');
    }
  };

  const productsColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
    { title: 'Số lượng đánh giá', dataIndex: 'reviewCount', key: 'reviewCount' }, // backend cần trả về trường này
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" onClick={() => handleSelectProduct(record)}>
          Xem đánh giá
        </Button>
      ),
    },
  ];

  const reviewsColumns = [
    { title: 'Người dùng', dataIndex: 'userName', key: 'userName' },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => <Rate disabled defaultValue={rating} />,
    },
    { title: 'Nội dung', dataIndex: 'comment', key: 'comment' },
    {
      title: 'Ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (url) =>
        url ? (
          <img
            src={url}
            alt="Review"
            style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
          />
        ) : (
          <span>Không có ảnh</span>
        ),
    },

    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value) => {
        if (!value) return '';
        const date = new Date(value);
        return date.toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }

    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Bạn có chắc muốn xóa đánh giá này?"
          onConfirm={() => handleDeleteReview(record.id)}
          okText="Có"
          cancelText="Không"
        >
          <Button danger>Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4 mt-4">Quản lý đánh giá</h2>
      <Spin spinning={loadingProducts}>
        <Table
          rowKey="id"
          columns={productsColumns}
          dataSource={products}
          pagination={{
            current: productsPage,
            pageSize: productsPageSize,
            total: productsTotal,
            onChange: handleProductsPageChange,
            className: 'd-flex justify-content-center',
          }}
        />
      </Spin>

      {selectedProduct && (
        <>
          <h4>Đánh giá cho sản phẩm: {selectedProduct.name}</h4>
          <Spin spinning={loadingReviews}>
            <Table
              rowKey="id"
              columns={reviewsColumns}
              dataSource={reviews}
              pagination={{
                current: reviewsPage,
                pageSize: reviewsPageSize,
                total: reviewsTotal,
                onChange: handleReviewsPageChange,
                className: 'd-flex justify-content-center',
              }}
            />
          </Spin>
        </>
      )}
    </div>
  );
};

export default AdminReviewsPage;
