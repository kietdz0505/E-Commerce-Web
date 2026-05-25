// src/pages/admin/AdminReportPage.js
import React, { useEffect, useState } from 'react';
import { Spin, message, DatePicker, Button, Row, Col, Card } from 'antd';
import AdminReportService from '../../services/admin/adminReportService';
import dayjs from 'dayjs';
import {
    BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import {
    ShoppingCartOutlined,
    DollarCircleOutlined,
    DatabaseOutlined,
    FilterOutlined
} from '@ant-design/icons';
import '../../styles/adminReportPage.css';

const { RangePicker } = DatePicker;

// Component custom nhãn trục X tránh đè chữ trên Mobile
const CustomizedAxisTick = ({ x, y, payload }) => {
    return (
        <g transform={`translate(${x},${y})`}>
            <text
                x={0}
                y={0}
                dy={10}
                textAnchor="end"
                fill="#6b7280"
                fontSize={11}
                transform="rotate(-25)"
                className="az-chart-tick-text"
            >
                {payload.value.length > 15 ? `${payload.value.substring(0, 13)}...` : payload.value}
            </text>
        </g>
    );
};

export default function AdminReportPage() {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [dateRange, setDateRange] = useState([
        dayjs().startOf('month'),
        dayjs().endOf('month')
    ]);

    useEffect(() => {
        const previousTitle = document.title;
        document.title = "Thống kê - báo cáo";

        return () => {
            document.title = previousTitle;
        };
    }, []);

    const loadReports = async () => {
        try {
            setLoading(true);
            const start = dateRange[0].format('YYYY-MM-DDTHH:mm:ss');
            const end = dateRange[1].format('YYYY-MM-DDTHH:mm:ss');
            const limit = 5;

            const data = await AdminReportService.getReports(start, end, limit);
            setReportData(data);
        } catch (error) {
            console.error(error);
            message.error('Lỗi tải báo cáo');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    // Cấu hình định dạng Tooltip biểu đồ sang trọng hơn
    const customTooltipStyle = {
        background: 'rgba(255, 255, 255, 0.96)',
        border: 'none',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        padding: '10px 14px'
    };

    return (
        <div className="container admin-report-container">
            <h2 className="text-center d-flex justify-content-center mb-4 mt-4 fw-bold admin-page-title">
                Thống kê bán hàng
            </h2>

            {/* Thanh bộ lọc dữ liệu lọc */}
            <div className="az-filter-wrapper mb-4">
                <Row gutter={[16, 16]} align="middle" justify="start" className="w-100 m-0">
                    <Col xs={24} sm={16} md={12} lg={8} className="p-0">
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates)}
                            format="YYYY-MM-DD"
                            className="az-range-picker w-100"
                            allowClear={false}
                        />
                    </Col>
                    <Col xs={24} sm={8} md={6} lg={4} className="p-0 ps-sm-2">
                        <Button
                            type="primary"
                            icon={<FilterOutlined />}
                            onClick={loadReports}
                            disabled={loading}
                            className="az-btn-filter w-100"
                        >
                            Lọc báo cáo
                        </Button>
                    </Col>
                </Row>
            </div>

            <Spin spinning={loading} size="large" tip="Đang tổng hợp số liệu...">
                {reportData && (
                    <div className="az-report-content">
                        {/* Khối Thống kê các Chỉ số Tổng quan */}
                        <Row gutter={[20, 20]} className="mb-4">
                            <Col xs={24} md={8}>
                                <Card bordered={false} className="az-stat-card az-card-orders">
                                    <div className="az-stat-icon"><ShoppingCartOutlined /></div>
                                    <div className="az-stat-info">
                                        <div className="az-stat-label">Tổng đơn hàng</div>
                                        <div className="az-stat-value">{reportData.totalOrders}</div>
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} md={8}>
                                <Card bordered={false} className="az-stat-card az-card-revenue">
                                    <div className="az-stat-icon"><DollarCircleOutlined /></div>
                                    <div className="az-stat-info">
                                        <div className="az-stat-label">Tổng doanh thu</div>
                                        <div className="az-stat-value">{reportData.totalRevenue?.toLocaleString()} ₫</div>
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} md={8}>
                                <Card bordered={false} className="az-stat-card az-card-stock">
                                    <div className="az-stat-icon"><DatabaseOutlined /></div>
                                    <div className="az-stat-info">
                                        <div className="az-stat-label">Hàng trong kho</div>
                                        <div className="az-stat-value">{reportData.totalStockQuantity?.toLocaleString()}</div>
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        {/* Khối Biểu đồ Top sản phẩm bán chạy */}
                        <Row gutter={[20, 20]} className="mb-4">
                            <Col xs={24}>
                                <Card title="Top sản phẩm bán chạy" className="az-chart-card">
                                    <div className="az-chart-wrapper">
                                        <ResponsiveContainer width="100%" height={340}>
                                            <BarChart data={reportData.topProducts} margin={{ top: 10, right: 10, left: -20, bottom: 45 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                <XAxis dataKey="name" interval={0} tick={<CustomizedAxisTick />} stroke="#9ca3af" />
                                                <YAxis tickLine={false} axisLine={false} stroke="#9ca3af" />
                                                <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                                                <Legend verticalAlign="top" height={36} iconType="circle" />
                                                <Bar dataKey="totalSold" name="Số lượng bán" barSize={35} radius={[6, 6, 0, 0]}>
                                                    {reportData.topProducts.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ec4899'][index % 5]}
                                                        />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        {/* Khối Biểu đồ Sản phẩm sắp hết hàng */}
                        <Row gutter={[20, 20]}>
                            <Col xs={24}>
                                <Card title="Sản phẩm sắp hết hàng" className="az-chart-card mb-4">
                                    {reportData.lowStock?.length > 0 ? (
                                        <div className="az-chart-wrapper">
                                            <ResponsiveContainer width="100%" height={340}>
                                                <BarChart data={reportData.lowStock} margin={{ top: 10, right: 10, left: -20, bottom: 45 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                    <XAxis dataKey="name" interval={0} tick={<CustomizedAxisTick />} stroke="#9ca3af" />
                                                    <YAxis tickLine={false} axisLine={false} stroke="#9ca3af" />
                                                    <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                                                    <Legend verticalAlign="top" height={36} iconType="circle" />
                                                    <Bar dataKey="stock" name="Số lượng tồn" barSize={35} radius={[6, 6, 0, 0]}>
                                                        {reportData.lowStock.map((entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e'][index % 5]}
                                                            />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className="text-center py-5 text-muted bg-light rounded-3">
                                            <DatabaseOutlined style={{ fontSize: 32, color: '#d1d5db', marginBottom: 8 }} />
                                            <p className="m-0">Tuyệt vời! Không có sản phẩm nào sắp hết hàng</p>
                                        </div>
                                    )}
                                </Card>
                            </Col>
                        </Row>
                    </div>
                )}
            </Spin>
        </div>
    );
}