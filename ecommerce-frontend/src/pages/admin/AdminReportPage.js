// src/pages/admin/AdminReportPage.js
import React, { useEffect, useState } from 'react';
import { Spin, message, DatePicker, Button, Row, Col, Card } from 'antd';
import AdminReportService from '../../services/admin/adminReportService';
import dayjs from 'dayjs';
import {
    BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
    LineChart, Line
} from 'recharts';

const { RangePicker } = DatePicker;

export default function AdminReportPage() {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [dateRange, setDateRange] = useState([
        dayjs().startOf('month'),
        dayjs().endOf('month')
    ]);

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

    return (
        <div style={{ margin: 40 }}>
            <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Báo cáo bán hàng</h2>

            <Row gutter={40} style={{ marginBottom: 20 }}>
                <Col >
                    <RangePicker
                        value={dateRange}
                        onChange={(dates) => setDateRange(dates)}
                        format="YYYY-MM-DD"
                    />
                </Col>
                <Col>
                    <Button type="primary" onClick={loadReports} disabled={loading}>
                        Lọc báo cáo
                    </Button>
                </Col>
            </Row>

            <Spin spinning={loading}>
                {reportData && (
                    <>
                        <Row gutter={40} style={{ marginBottom: 20 }}>
                            {/* Cột bên trái */}
                            <Col span={8}>
                                <Card title="Tổng đơn hàng" bordered={false} style={{ marginBottom: 20 }}>
                                    <h3>{reportData.totalOrders}</h3>
                                </Card>
                                <Card title="Tổng doanh thu" bordered={false}>
                                    <h3>{reportData.totalRevenue.toLocaleString()} ₫</h3>
                                </Card>
                                <Card title="Tổng số lượng hàng tồn kho" bordered={false}>
                                    <h3>{reportData.totalStockQuantity.toLocaleString()}</h3>
                                </Card>
                            </Col>

                            {/* Cột bên phải */}
                            <Col span={16}>
                                <Card title="Top sản phẩm bán chạy" style={{ marginBottom: 20, height: '100%' }}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={reportData.topProducts}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="totalSold" name="Số lượng bán">
                                                {reportData.topProducts.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={['#1890ff', '#13c2c2', '#52c41a', '#faad14', '#eb2f96'][index % 5]}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>

                                    </ResponsiveContainer>
                                </Card>
                            </Col>
                        </Row>

                        {/* Sản phẩm sắp hết hàng */}
                        <Card title="Sản phẩm sắp hết hàng" style={{ marginBottom: 20 }}>
                            {reportData.lowStock.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={reportData.lowStock}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="stock" name="Tồn kho">
                                            {reportData.lowStock.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={['#ff4d4f', '#ff7a45', '#ffc53d', '#bae637', '#73d13d'][index % 5]}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>

                                </ResponsiveContainer>
                            ) : (
                                <p>Không có sản phẩm sắp hết hàng</p>
                            )}
                        </Card>
                    </>
                )}
            </Spin>

        </div>
    );
}
