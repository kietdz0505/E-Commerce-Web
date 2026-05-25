import React, { useState, useEffect } from 'react';
import { Button, Input, Form, message, Table, Space, Pagination, Spin, Row, Col, Card } from 'antd';
import { MailOutlined, GiftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import adminUserPromotionService from '../../services/admin/adminUserPromotion';
import adminPromotionService from '../../services/admin/adminPromotionService';
import '../../styles/adminUserPromotionPage.css';

export default function AdminUserPromotionPage() {
    const [promotionId, setPromotionId] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const [promotions, setPromotions] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(5);
    const [totalPages, setTotalPages] = useState(0);
    const [tableLoading, setTableLoading] = useState(false);

    useEffect(() => {
        const previousTitle = document.title; 
        document.title = "Gửi khuyến mãi - AZStore"; 

        return () => {
            document.title = previousTitle; 
        };
    }, []);

    useEffect(() => {
        loadPromotions();
    }, [page]);

    const loadPromotions = async () => {
        try {
            setTableLoading(true);
            const data = await adminPromotionService.getPromotions(page, size);
            setPromotions(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (error) {
            message.error('Không tải được danh sách khuyến mãi');
        } finally {
            setTableLoading(false);
        }
    };

    const handleSendAll = async () => {
        if (!promotionId) {
            message.warning('Vui lòng nhập hoặc chọn một Promotion ID từ danh sách');
            return;
        }
        try {
            setLoading(true);
            const result = await adminUserPromotionService.sendPromotionForAllUsers(promotionId);
            message.success(result || 'Đã gửi khuyến mãi thành công cho tất cả người dùng!');
        } catch (error) {
            message.error('Gửi khuyến mãi thất bại: ' + (error.response?.data || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleSendByEmail = async () => {
        if (!promotionId || !email) {
            message.warning('Vui lòng nhập Promotion ID và Email người nhận');
            return;
        }
        try {
            setLoading(true);
            const result = await adminUserPromotionService.sendPromotionByEmail(promotionId, email);
            message.success(result || 'Đã gửi khuyến mãi đến email thành công!');
        } catch (error) {
            message.error('Gửi khuyến mãi thất bại: ' + (error.response?.data || error.message));
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { 
            title: 'ID', 
            dataIndex: 'id', 
            key: 'id', 
            width: 80,
            className: 'az-col-promo-id',
            onCell: () => ({ 'data-label': 'ID:' })
        },
        { 
            title: 'Tên khuyến mãi', 
            dataIndex: 'description', 
            key: 'description',
            className: 'az-col-promo-desc',
            onCell: () => ({ 'data-label': 'Tên khuyến mãi:' }),
            render: (text) => <span className="az-promo-desc-text">{text}</span>
        },
        { 
            title: 'Mã giảm giá', 
            dataIndex: 'code', 
            key: 'code',
            className: 'az-col-promo-code',
            onCell: () => ({ 'data-label': 'Mã giảm giá:' }),
            render: (text) => <code className="az-promo-code-badge">{text}</code>
        },
        { 
            title: 'Giảm %', 
            dataIndex: 'discountPercent', 
            key: 'discountPercent',
            width: 100,
            className: 'az-col-promo-discount',
            onCell: () => ({ 'data-label': 'Giảm %:' }),
            render: (text) => <span className="az-promo-discount-text">{text}%</span>
        },
        {
            title: 'Thời gian áp dụng',
            key: 'validity',
            className: 'az-col-promo-validity',
            onCell: () => ({ 'data-label': 'Thời gian áp dụng:' }),
            render: (_, record) => (
                <span className="az-promo-date-text">
                    {record.validFrom} <span className="az-date-arrow">→</span> {record.validTo}
                </span>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 100,
            className: 'az-col-promo-action',
            onCell: () => ({ 'data-label': 'Hành động:' }),
            render: (_, record) => (
                <Button 
                    type={promotionId === record.id ? "primary" : "default"} 
                    size="small" 
                    icon={promotionId === record.id ? <CheckCircleOutlined /> : undefined}
                    onClick={() => setPromotionId(record.id)}
                    className="az-btn-select-promo"
                >
                    {promotionId === record.id ? 'Đang chọn' : 'Chọn'}
                </Button>
            ),
        },
    ];

    return (
        <div className="container admin-user-promotion-container">
            <h2 className="text-center d-flex justify-content-center mb-4 mt-4 fw-bold admin-page-title">
                Gửi khuyến mãi cho người dùng
            </h2>

            {/* Khối Form Gửi Khuyến Mãi */}
            <Card bordered={false} className="az-promo-form-card mb-4">
                <Spin spinning={loading} tip="Đang tiến hành gửi email...">
                    <Form layout="vertical" className="az-promo-form">
                        <Row gutter={[24, 0]}>
                            <Col xs={24} md={12}>
                                <Form.Item 
                                    label={<span className="fw-semibold">Promotion ID (Mã chương trình)</span>}
                                    tooltip="Chọn từ danh sách phía dưới hoặc nhập thủ công"
                                >
                                    <Input
                                        prefix={<GiftOutlined className="text-muted" />}
                                        value={promotionId}
                                        onChange={(e) => setPromotionId(e.target.value)}
                                        placeholder="Nhập hoặc chọn ID khuyến mãi"
                                        disabled={loading}
                                        size="large"
                                        className="az-form-input"
                                    />
                                </Form.Item>
                                <Form.Item className="mt-4">
                                    <Button 
                                        type="primary" 
                                        danger
                                        onClick={handleSendAll} 
                                        loading={loading} 
                                        block
                                        size="large"
                                        className="az-btn-send-all"
                                    >
                                        Gửi cho tất cả người dùng
                                    </Button>
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={12} className="az-form-divider-left">
                                <Form.Item label={<span className="fw-semibold">Email người nhận cá nhân</span>}>
                                    <Input
                                        prefix={<MailOutlined className="text-muted" />}
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="nhanvien@example.com"
                                        disabled={loading}
                                        size="large"
                                        className="az-form-input"
                                    />
                                </Form.Item>
                                <Form.Item className="mt-4">
                                    <Button 
                                        type="primary" 
                                        onClick={handleSendByEmail} 
                                        loading={loading} 
                                        block
                                        size="large"
                                        className="az-btn-send-single"
                                    >
                                        Gửi cho người dùng này
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Spin>
            </Card>

            {/* Khối Danh Sách Khuyến Mãi */}
            <h3 className="az-section-subtitle mb-3 fw-bold">Danh sách chương trình khuyến mãi</h3>
            
            <Spin spinning={tableLoading} size="large">
                <div className="az-table-wrapper">
                    <Table
                        columns={columns}
                        dataSource={promotions}
                        rowKey="id"
                        pagination={false}
                        className="az-custom-table"
                        locale={{ emptyText: 'Không tìm thấy chương trình khuyến mãi nào' }}
                    />
                </div>

                <div className="az-pagination-wrapper">
                    <Pagination
                        current={page + 1}
                        pageSize={size}
                        total={totalPages * size}
                        onChange={(p) => setPage(p - 1)}
                        showSizeChanger={false}
                        className="d-flex justify-content-center"
                    />
                </div>
            </Spin>
        </div>
    );
}