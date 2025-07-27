import React from 'react';
import { List, Datagrid, TextField, NumberField } from 'react-admin';

const ProductList = (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="name" />
      <NumberField source="price" />
    </Datagrid>
  </List>
);

export default ProductList;
