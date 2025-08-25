import React, { useEffect, useState } from "react";
import { Table, Button, Pagination, Spin, Modal, Form, Input, message } from "antd";
import chatbotService from "../../services/chatbotService";

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
      // nếu backend chưa có phân trang, ta giả lập total = length
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
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
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
    },
    {
      title: "Câu hỏi",
      dataIndex: "question",
    },
    {
      title: "Trả lời",
      dataIndex: "answer",
    },
    {
      title: "Hành động",
      key: "action",
      width: 180,
      render: (_, record) => (
        <>
          <Button
            type="primary"
            size="small"
            className="me-2"
            onClick={() => openEdit(record)}
          >
            Sửa
          </Button>
          <Button danger size="small" onClick={() => handleDelete(record.id)}>
            Xóa
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="container mt-4" style={{ maxWidth: 1000 }}>
      <h2 className="mb-4 text-center">Quản lý Chatbot</h2>

      <Button type="primary" className="mb-3" onClick={openCreate}>
        Thêm câu hỏi
      </Button>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 200 }}>
          <Spin size="large" tip="Đang tải..." />
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={questions.slice(page * size, page * size + size)}
            rowKey="id"
            pagination={false}
            bordered
          />

          {/* Pagination */}
          <div className="d-flex justify-content-center mt-3" style={{ marginBottom: 20 }}>
            <Pagination
              current={page + 1}
              pageSize={size}
              total={total}
              onChange={(p) => setPage(p - 1)}
              showSizeChanger={false}
            />
          </div>
        </>
      )}

      {/* Modal Form */}
      <Modal
        title={editing ? "Sửa câu hỏi" : "Thêm câu hỏi"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleFormSubmit}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="question"
            label="Câu hỏi"
            rules={[{ required: true, message: "Vui lòng nhập câu hỏi" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="answer"
            label="Trả lời"
            rules={[{ required: true, message: "Vui lòng nhập câu trả lời" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
