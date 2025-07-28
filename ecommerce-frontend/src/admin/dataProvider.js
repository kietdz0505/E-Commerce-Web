// src/admin/dataProvider.js
import simpleRestProvider from 'ra-data-simple-rest';
import { API_CONFIG } from '../config/apiConfig';

const dataProvider = simpleRestProvider(`${API_CONFIG.BASE_URL}/api`); // backend Spring Boot

export default dataProvider;
