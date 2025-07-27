import React from 'react';
import { List, Datagrid, TextField, EditButton } from 'react-admin';

const CategoryList = (props) => (
  <List {...props}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />
      <EditButton />
    </Datagrid>
  </List>
);

export default CategoryList; //
