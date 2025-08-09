// src/services/admin/adminUserService.js
import axios from 'axios';
import { API_CONFIG } from '../../config/apiConfig';

const AdminUserService = {
  getAll: async (page = 0, size = 10) => {
    const token = localStorage.getItem('token'); 
    const res = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.API.ADMIN_USERS.GET_ALL(page, size)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },


  getById: async (id) => {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.API.ADMIN_USERS.GET_BY_ID(id)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  delete: async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_CONFIG.BASE_URL}${API_CONFIG.API.ADMIN_USERS.DELETE(id)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  count: async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.API.ADMIN_USERS.COUNT}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  updateRole: async (id, roleName) => {
    const token = localStorage.getItem('token');
    await axios.put(`${API_CONFIG.BASE_URL}${API_CONFIG.API.ADMIN_USERS.UPDATE_ROLE(id)}`, { roleName }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  lockUser: async (id, lock) => {
    const token = localStorage.getItem('token');
    await axios.put(`${API_CONFIG.BASE_URL}${API_CONFIG.API.ADMIN_USERS.LOCK_USER(id, lock)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

export default AdminUserService;
