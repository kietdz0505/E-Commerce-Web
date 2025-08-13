import React, { useState, useEffect } from 'react';
import { Button, Input, Form, message, Table, Space, Pagination } from 'antd';
import adminUserPromotionService from '../../services/admin/adminUserPromotion';
import adminPromotionService from '../../services/admin/adminPromotionService';

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
    document.title = "Gửi khuyến mãi - AZStore"; // Đặt title mới

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
            message.warning('Vui lòng nhập Promotion ID');
            return;
        }
        try {
            setLoading(true);
            const result = await adminUserPromotionService.sendPromotionForAllUsers(promotionId);
            message.success(result);
        } catch (error) {
            message.error('Gửi khuyến mãi thất bại: ' + (error.response?.data || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleSendByEmail = async () => {
        if (!promotionId || !email) {
            message.warning('Vui lòng nhập Promotion ID và Email');
            return;
        }
        try {
            setLoading(true);
            const result = await adminUserPromotionService.sendPromotionByEmail(promotionId, email);
            message.success(result);
        } catch (error) {
            message.error('Gửi khuyến mãi thất bại: ' + (error.response?.data || error.message));
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: 'Tên khuyến mãi', dataIndex: 'description', key: 'description' },
        { title: 'Mã giảm giá', dataIndex: 'code', key: 'code' },
        { title: 'Giảm %', dataIndex: 'discountPercent', key: 'discountPercent' },
        {
            title: 'Thời gian áp dụng',
            key: 'validity',
            render: (_, record) => `${record.validFrom} → ${record.validTo}`,
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button type="primary" size="small" onClick={() => setPromotionId(record.id)}>
                        Chọn
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ maxWidth: 900, margin: '40px auto' }}>
            <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Gửi khuyến mãi cho người dùng</h2>

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Form layout="vertical" style={{ width: 300 }}>
                    <Form.Item label="Promotion ID">
                        <Input
                            value={promotionId}
                            onChange={(e) => setPromotionId(e.target.value)}
                            placeholder="Nhập Promotion ID"
                            disabled={loading}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" onClick={handleSendAll} loading={loading} block>
                            Gửi cho tất cả người dùng
                        </Button>
                    </Form.Item>

                    <Form.Item label="Email người nhận">
                        <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Nhập email người nhận"
                            disabled={loading}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" onClick={handleSendByEmail} loading={loading} block>
                            Gửi cho người dùng này
                        </Button>
                    </Form.Item>
                </Form>
            </div>


            <h3 style={{ marginTop: 40, marginBottom: 16 }}>Danh sách khuyến mãi</h3>
            <Table
                columns={columns}
                dataSource={promotions}
                rowKey="id"
                loading={tableLoading}
                pagination={false}
            />
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                    current={page + 1}
                    pageSize={size}
                    total={totalPages * size}
                    onChange={(p) => setPage(p - 1)}
                    showSizeChanger={false}
                />
            </div>

        </div>
    );
}
