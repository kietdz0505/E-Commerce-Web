// src/pages/admin/AdminUsersPage.js
import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Popconfirm, message, Modal, Form, Select } from 'antd';
import adminUserService from '../../services/admin/adminUserService';

const { Option } = Select;

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // từ backend
  const [total, setTotal] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [form] = Form.useForm();

  const fetchUsers = async (currentPage = page) => {
    try {
      setLoading(true);
      const data = await adminUserService.getAllUsers(currentPage - 1, pageSize);
      setUsers(data.content || []);
      setTotal(data.totalElements || 0);
      setPageSize(data.size || 10);
    } catch (error) {
      message.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleDelete = async (id) => {
    try {
      await adminUserService.deleteUser(id);
      message.success('Xóa người dùng thành công');
      fetchUsers();
    } catch (error) {
      message.error('Lỗi khi xóa người dùng');
    }
  };

  const handleOpenModal = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      role: user.role,
    });
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await adminUserService.updateUserRole(editingUser.id, values.role);
      message.success('Cập nhật quyền thành công');
      setIsModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error('Lỗi khi cập nhật quyền');
    }
  };

  const handleToggleLock = async (id, isLocked) => {
    try {
      if (isLocked) {
        await adminUserService.unlockUser(id);
        message.success('Mở khóa người dùng thành công');
      } else {
        await adminUserService.lockUser(id);
        message.success('Khóa người dùng thành công');
      }
      fetchUsers();
    } catch (error) {
      message.error('Lỗi khi thay đổi trạng thái khóa');
    }
  };

  const columns = [
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
      title: 'Quyền',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => (record.locked ? 'Bị khóa' : 'Hoạt động'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button onClick={() => handleOpenModal(record)}>Đổi quyền</Button>
          <Button
            danger={record.locked === false}
            onClick={() => handleToggleLock(record.id, record.locked)}
          >
            {record.locked ? 'Mở khóa' : 'Khóa'}
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa người dùng này?"
            onConfirm={() => handleDelete(record.id)}
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
      <h2>Quản lý người dùng</h2>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={users}
        loading={loading}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          onChange: (p) => setPage(p),
        }}
      />

      <Modal
        title="Cập nhật quyền"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSave}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="role"
            label="Quyền"
            rules={[{ required: true, message: 'Vui lòng chọn quyền' }]}
          >
            <Select>
              <Option value="USER">USER</Option>
              <Option value="ADMIN">ADMIN</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
