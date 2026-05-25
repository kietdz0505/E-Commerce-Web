import React, { useEffect, useState } from "react";
import { Table, Button, Pagination, Spin, Modal, Form, Input, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import chatbotService from "../../services/user/chatbotService";
import "../../styles/adminChatbotPage.css";

export default function AdminChatbotPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // form modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  // pagination
  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    document.title = "Quản lý Chatbot";
    loadQuestions();
  }, [page]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await chatbotService.getAllQuestions();
      setQuestions(Array.isArray(data) ? data : []);
      setTotal(Array.isArray(data) ? data.length : 0);
    } catch (err) {
      message.error("Lỗi tải dữ liệu chatbot");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Bạn có chắc muốn xóa câu hỏi này?",
      content: "Dữ liệu sau khi xóa sẽ không thể khôi phục.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      className: "az-chatbot-delete-modal",
      onOk: async () => {
        try {
          await chatbotService.deleteQuestion(id);
          message.success("Đã xóa câu hỏi");
          loadQuestions();
        } catch (err) {
          message.error("Lỗi khi xóa");
        }
      },
    });
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      question: record.question,
      answer: record.answer,
    });
    setIsModalVisible(true);
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await chatbotService.updateQuestion(editing.id, values.question, values.answer);
        message.success("Cập nhật thành công");
      } else {
        await chatbotService.createQuestion(values.question, values.answer);
        message.success("Thêm mới thành công");
      }
      setIsModalVisible(false);
      loadQuestions();
    } catch (err) {
      console.error(err);
      message.error("Có lỗi xảy ra");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      className: "az-col-bot-id",
      onCell: () => ({ 'data-label': 'ID:' }),
    },
    {
      title: "Câu hỏi",
      dataIndex: "question",
      className: "az-col-bot-question",
      onCell: () => ({ 'data-label': 'Câu hỏi:' }),
      render: (text) => <span className="az-bot-text-highlight">{text}</span>
    },
    {
      title: "Trả lời",
      dataIndex: "answer",
      className: "az-col-bot-answer",
      onCell: () => ({ 'data-label': 'Trả lời:' }),
      render: (text) => <span className="az-bot-text-muted">{text}</span>
    },
    {
      title: "Hành động",
      key: "action",
      width: 160,
      className: "az-col-bot-actions",
      onCell: () => ({ 'data-label': 'Hành động:' }),
      render: (_, record) => (
        <div className="az-bot-action-group">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
            className="az-btn-bot-edit"
          >
            Sửa
          </Button>
          <Button 
            danger 
            size="small" 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            className="az-btn-bot-delete"
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container admin-chatbot-container">
      <h2 className="text-center d-flex justify-content-center mb-4 mt-4 fw-bold admin-page-title">
        Quản lý Chatbot
      </h2>

      <div className="d-flex mb-3">
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={openCreate}
          className="az-btn-add-question"
        >
          Thêm câu hỏi mới
        </Button>
      </div>

      <Spin spinning={loading} size="large" tip="Đang tải dữ liệu...">
        <div className="az-table-wrapper">
          <Table
            columns={columns}
            dataSource={questions.slice(page * size, page * size + size)}
            rowKey="id"
            pagination={false}
            bordered
            className="az-custom-table"
          />
        </div>

        {/* Pagination */}
        <div className="az-pagination-wrapper">
          <Pagination
            current={page + 1}
            pageSize={size}
            total={total}
            onChange={(p) => setPage(p - 1)}
            showSizeChanger={false}
            className="d-flex justify-content-center"
          />
        </div>
      </Spin>

      {/* Modal Form */}
      <Modal
        title={<span className="fw-bold fs-5">{editing ? "Cập nhật câu hỏi dữ liệu" : "Thêm dữ liệu câu hỏi"}</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleFormSubmit}
        okText="Lưu lại"
        cancelText="Hủy bỏ"
        destroyOnClose
        className="az-chatbot-form-modal"
      >
        <Form form={form} layout="vertical" className="mt-3">
          <Form.Item
            name="question"
            label={<span className="fw-semibold">Nội dung câu hỏi</span>}
            rules={[{ required: true, message: "Vui lòng nhập câu hỏi" }]}
          >
            <Input placeholder="Ví dụ: Shop có chính sách đổi trả như thế nào?" className="az-modal-input" />
          </Form.Item>
          <Form.Item
            name="answer"
            label={<span className="fw-semibold">Nội dung câu trả lời tự động</span>}
            rules={[{ required: true, message: "Vui lòng nhập câu trả lời" }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập câu trả lời chi tiết cho khách hàng..." className="az-modal-input" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}