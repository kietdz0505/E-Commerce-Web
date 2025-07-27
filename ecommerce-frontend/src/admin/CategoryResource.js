// src/admin/CategoryResource.js
import React from 'react';
import { List, Datagrid, TextField, EditButton } from 'react-admin';

export const CategoryList = (props) => (
  <List {...props}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />
      <EditButton />
    </Datagrid>
  </List>
);
