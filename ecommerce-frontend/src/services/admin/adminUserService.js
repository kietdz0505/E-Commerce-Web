// src/services/admin/adminUserService.js
import { API_CONFIG } from '../../config/apiConfig';
import apiClient from '../../api/axiosInstance';

const AdminUserService = {
  getAll: (page = 0, size = 10) =>
    apiClient.get(API_CONFIG.API.ADMIN_USERS.GET_ALL(page, size)).then(res => res.data),

  getById: (id) =>
    apiClient.get(API_CONFIG.API.ADMIN_USERS.GET_BY_ID(id)).then(res => res.data),

  delete: (id) =>
    apiClient.delete(API_CONFIG.API.ADMIN_USERS.DELETE(id)),

  count: () =>
    apiClient.get(API_CONFIG.API.ADMIN_USERS.COUNT).then(res => res.data),

  updateRole: (id, roleName) =>
    apiClient.put(API_CONFIG.API.ADMIN_USERS.UPDATE_ROLE(id), { roleName }),

  lockUser: (id, lock) =>
  apiClient.put(API_CONFIG.API.ADMIN_USERS.LOCK_USER(id, lock)),


};


export default AdminUserService;
