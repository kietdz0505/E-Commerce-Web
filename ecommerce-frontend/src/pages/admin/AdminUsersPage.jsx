import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Select, Pagination, Spin, Popconfirm, message } from 'antd';
import AdminUserService from '../../services/admin/adminUserService';
import '../../styles/adminUsersPage.css';

const { Option } = Select;

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1); 
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const previousTitle = document.title; 
    document.title = "Quản lý người dùng"; 

    return () => {
      document.title = previousTitle; 
    };
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await AdminUserService.getAll(page - 1, size);
      const normalizedUsers = (data.content || []).map(u => ({
        ...u,
        locked: u.locked === true || u.locked === 1 || u.locked === "1"
      }));
      setUsers(normalizedUsers);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      message.error('Lỗi tải danh sách người dùng');
      console.error('Lỗi tải danh sách người dùng:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async (id, lock) => {
    try {
      await AdminUserService.lockUser(id, lock);
      setUsers(prev =>
        prev.map(u => (u.id === id ? { ...u, locked: lock } : u))
      );
      message.success(lock ? 'Người dùng đã bị khóa' : 'Người dùng đã được mở khóa');
    } catch (error) {
      message.error('Lỗi khi khóa/mở khóa người dùng');
      console.error('Lỗi khi khóa/mở khóa người dùng:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await AdminUserService.delete(id);
      message.success('Người dùng đã được xóa');
      loadUsers();
    } catch (error) {
      message.error('Lỗi khi xóa người dùng');
      console.error('Lỗi khi xóa người dùng:', error);
    }
  };

  const handleChangeRole = async (id, role) => {
    try {
      await AdminUserService.updateRole(id, role);
      message.success('Cập nhật role thành công');
      loadUsers();
    } catch (error) {
      message.error('Lỗi khi cập nhật role');
      console.error('Lỗi khi cập nhật role:', error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      className: 'az-col-user-id',
      onCell: () => ({ 'data-label': 'ID:' }),
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      className: 'az-col-user-name',
      onCell: () => ({ 'data-label': 'Tên:' }),
      render: (text) => <span className="az-user-name-text">{text}</span>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      className: 'az-col-user-email',
      onCell: () => ({ 'data-label': 'Email:' }),
      render: (text) => <span className="az-user-email-text">{text}</span>
    },
    {
      title: 'Role',
      dataIndex: 'roles',
      key: 'roles',
      width: 150,
      className: 'az-col-user-role',
      onCell: () => ({ 'data-label': 'Role:' }),
      render: (roles, record) => (
        <Select
          size="middle"
          value={roles?.[0]}
          onChange={(value) => handleChangeRole(record.id, value)}
          className="az-role-select"
        >
          <Option value="ROLE_CUSTOMER">USER</Option>
          <Option value="ROLE_ADMIN">ADMIN</Option>
        </Select>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'locked',
      key: 'locked',
      width: 120,
      className: 'az-col-user-status',
      onCell: () => ({ 'data-label': 'Trạng thái:' }),
      render: locked =>
        locked ? (
          <Tag color="red" style={{ margin: 0, fontWeight: '500' }}>Bị khóa</Tag>
        ) : (
          <Tag color="green" style={{ margin: 0, fontWeight: '500' }}>Hoạt động</Tag>
        ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 180,
      className: 'az-col-user-actions',
      onCell: () => ({ 'data-label': 'Hành động:' }),
      render: (_, record) => (
        <div className="az-user-action-btns">
          <Button
            type={record.locked ? 'primary' : 'default'}
            danger={!record.locked}
            onClick={() => handleLock(record.id, !record.locked)}
            className="az-btn-lock"
          >
            {record.locked ? 'Mở khóa' : 'Khóa'}
          </Button>

          <Popconfirm
            title="Bạn có chắc muốn xóa người dùng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger className="az-btn-delete">
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="container admin-users-container">
      <h2 className="text-center d-flex justify-content-center mb-4 mt-4 fw-bold admin-page-title">
        Quản lý người dùng
      </h2>

      <Spin spinning={loading} size="large">
        <div className="az-table-wrapper">
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: 'Không có dữ liệu người dùng' }}
            className="az-custom-table"
          />
        </div>

        <div className="az-pagination-wrapper">
          <Pagination
            current={page}
            total={totalPages * size}
            pageSize={size}
            onChange={setPage}
            className="d-flex justify-content-center"
            showSizeChanger={false}
          />
        </div>
      </Spin>
    </div>
  );
}