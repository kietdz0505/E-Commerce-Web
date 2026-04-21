import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Select, Pagination, Spin, Popconfirm, message } from 'antd';
import AdminUserService from '../../services/admin/adminUserService';

const { Option } = Select;

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1); // antd pagination page bắt đầu từ 1
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
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'roles',
      key: 'roles',
      width: 150,
      render: (roles, record) => (
        <Select
          size="small"
          value={roles[0]}
          onChange={(value) => handleChangeRole(record.id, value)}
          style={{ width: '100%' }}
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
      render: locked =>
        locked ? (
          <Tag color="red">Bị khóa</Tag>
        ) : (
          <Tag color="green">Hoạt động</Tag>
        ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <>
          <Button
            size="small"
            type={record.locked ? 'primary' : 'default'}
            danger={!record.locked}
            onClick={() => handleLock(record.id, !record.locked)}
            style={{ marginRight: 8 }}
          >
            {record.locked ? 'Mở khóa' : 'Khóa'}
          </Button>

          <Popconfirm
            title="Bạn có chắc muốn xóa người dùng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button size="small" danger>
              Xóa
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Quản lý người dùng</h2>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: 'Không có dữ liệu người dùng' }}
          />

          <Pagination
            current={page}
            total={totalPages * size}
            pageSize={size}
            onChange={setPage}
            style={{ marginTop: 16, textAlign: 'center' }}
            className="d-flex justify-content-center"
          />
        </>
      )}
    </div>
  );
}
