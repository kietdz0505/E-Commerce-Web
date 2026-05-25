import React, { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, message, Rate, Spin } from 'antd';
import adminProductService from '../../services/admin/adminProductService';
import adminReviewService from '../../services/admin/adminReviewService';
import '../../styles/adminReviewsPage.css';

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

  const handleProductsPageChange = (page) => {
    fetchProducts(page);
    setSelectedProduct(null); 
    setReviews([]);
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    fetchReviews(product.id, 1);
  };

  const handleReviewsPageChange = (page) => {
    if (selectedProduct) fetchReviews(selectedProduct.id, page);
  };

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
    { 
      title: 'ID', 
      dataIndex: 'id', 
      key: 'id',
      className: 'az-col-prod-id',
      onCell: () => ({ 'data-label': 'ID:' })
    },
    { 
      title: 'Tên sản phẩm', 
      dataIndex: 'name', 
      key: 'name',
      className: 'az-col-prod-name',
      onCell: () => ({ 'data-label': 'Tên sản phẩm:' }),
      render: (text) => <span className="az-product-title-text">{text}</span>
    },
    { 
      title: 'Số lượng đánh giá', 
      dataIndex: 'reviewCount', 
      key: 'reviewCount',
      className: 'az-col-prod-count',
      onCell: () => ({ 'data-label': 'Số lượng đánh giá:' })
    },
    {
      title: 'Hành động',
      key: 'action',
      className: 'az-col-prod-action',
      onCell: () => ({ 'data-label': 'Hành động:' }),
      render: (_, record) => (
        <Button type="primary" onClick={() => handleSelectProduct(record)} className="az-btn-view-review">
          Xem đánh giá
        </Button>
      ),
    },
  ];

  const reviewsColumns = [
    { 
      title: 'Người dùng', 
      dataIndex: 'userName', 
      key: 'userName',
      className: 'az-col-rev-user',
      onCell: () => ({ 'data-label': 'Người dùng:' })
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      className: 'az-col-rev-rate',
      onCell: () => ({ 'data-label': 'Đánh giá:' }),
      render: (rating) => <Rate disabled defaultValue={rating} className="az-custom-rate" />,
    },
    { 
      title: 'Nội dung', 
      dataIndex: 'comment', 
      key: 'comment',
      className: 'az-col-rev-comment',
      onCell: () => ({ 'data-label': 'Nội dung:' })
    },
    {
      title: 'Ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      className: 'az-col-rev-img',
      onCell: () => ({ 'data-label': 'Ảnh:' }),
      render: (url) =>
        url ? (
          <div className="az-review-img-container">
            <img src={url} alt="Review" />
          </div>
        ) : (
          <span className="text-muted text-sm">Không có ảnh</span>
        ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      className: 'az-col-rev-date',
      onCell: () => ({ 'data-label': 'Ngày tạo:' }),
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
      className: 'az-col-rev-action',
      onCell: () => ({ 'data-label': 'Hành động:' }),
      render: (_, record) => (
        <Popconfirm
          title="Bạn có chắc muốn xóa đánh giá này?"
          onConfirm={() => handleDeleteReview(record.id)}
          okText="Có"
          cancelText="Không"
        >
          <Button danger className="az-btn-delete-review">Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="container admin-reviews-container">
      <h2 className="text-center d-flex justify-content-center mb-4 mt-4 fw-bold admin-page-title">
        Quản lý đánh giá
      </h2>

      <Spin spinning={loadingProducts}>
        <div className="az-table-wrapper mb-5">
          <Table
            rowKey="id"
            columns={productsColumns}
            dataSource={products}
            pagination={{
              current: productsPage,
              pageSize: productsPageSize,
              total: productsTotal,
              onChange: handleProductsPageChange,
              className: 'd-flex justify-content-center py-3 m-0 az-custom-pagination',
            }}
            className="az-custom-table"
          />
        </div>
      </Spin>

      {selectedProduct && (
        <div className="az-review-section-wrapper mt-4">
          <h4 className="az-review-section-title mb-3">
            Đánh giá cho sản phẩm: <span className="text-primary">{selectedProduct.name}</span>
          </h4>
          <Spin spinning={loadingReviews}>
            <div className="az-table-wrapper">
              <Table
                rowKey="id"
                columns={reviewsColumns}
                dataSource={reviews}
                pagination={{
                  current: reviewsPage,
                  pageSize: reviewsPageSize,
                  total: reviewsTotal,
                  onChange: handleReviewsPageChange,
                  className: 'd-flex justify-content-center py-3 m-0 az-custom-pagination',
                }}
                className="az-custom-table"
              />
            </div>
          </Spin>
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;