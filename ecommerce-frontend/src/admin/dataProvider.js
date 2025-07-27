// src/admin/dataProvider.js
import simpleRestProvider from 'ra-data-simple-rest';

const dataProvider = simpleRestProvider('http://localhost:8080/api'); // backend Spring Boot

export default dataProvider;
