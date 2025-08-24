import { API_CONFIG } from '../config/apiConfig';
import apiClient from '../api/axiosInstance';

const chatbotService = {
  // ===== CRUD cho Admin =====

  // Thêm câu hỏi mới
  createQuestion: async (question, answer) => {
    const res = await apiClient.post(API_CONFIG.API.CHAT_BOT.CREATE_QUESTION, {
      question,
      answer,
    });
    return res.data;
  },

  // Lấy tất cả câu hỏi
  getAllQuestions: async () => {
    const res = await apiClient.get(API_CONFIG.API.CHAT_BOT.GET_ALL_QUESTIONS);
    return res.data;
  },

  // Cập nhật câu hỏi
  updateQuestion: async (id, question, answer) => {
    const res = await apiClient.put(
      API_CONFIG.API.CHAT_BOT.UPDATE_QUESTION(id), // truyền id
      { question, answer }
    );
    return res.data;
  },

  // Xoá câu hỏi
  deleteQuestion: async (id) => {
    await apiClient.delete(API_CONFIG.API.CHAT_BOT.DELETE_QUESTION(id)); // truyền id
    return true;
  },

  // ===== User hỏi chatbot =====
  askQuestion: async (ask) => {
    const res = await apiClient.post(
      API_CONFIG.API.CHAT_BOT.ANSWER_QUESTION(ask) // truyền câu hỏi
    );
    return res.data;
  },
};

export default chatbotService;
