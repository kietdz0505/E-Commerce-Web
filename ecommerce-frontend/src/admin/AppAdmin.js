import React from 'react';
import { Admin, Resource } from 'react-admin';
import dataProvider from './dataProvider';
import Dashboard from './Dashboard';
import CategoryList from './resources/categories/CategoryList';
import CategoryIcon from '@mui/icons-material/Category';
import ProductList from './resources/products/ProductList';
import UsersList from './resources/users/UsersList';

const AppAdmin = () => {
  return (
    <Admin dashboard={Dashboard} dataProvider={dataProvider}>
          <Resource name="categories" list={CategoryList} icon={CategoryIcon} />
          <Resource name="products" list={ProductList} />
          <Resource name="users" list={UsersList} />
    </Admin>
  );
};

export default AppAdmin;
