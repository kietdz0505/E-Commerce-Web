// src/routes/AdminRoutes.jsx
import { Route } from 'react-router-dom';
import AdminLayout from '../admin/AdminLayout';
import DashboardPage from '../admin/pages/DashboardPage';
import UsersPage from '../admin/pages/UsersPage';
import OrdersPage from '../admin/pages/OrdersPage';
import ProductsPage from '../admin/pages/ProductsPage';

const AdminRoutes = () => (
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<DashboardPage />} />
    <Route path="users" element={<UsersPage />} />
    <Route path="orders" element={<OrdersPage />} />
    <Route path="products" element={<ProductsPage />} />
  </Route>
);

export default AdminRoutes;
