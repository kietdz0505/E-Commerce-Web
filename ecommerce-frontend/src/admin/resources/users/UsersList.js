import { List, Datagrid, TextField } from 'react-admin';

export const UsersList = (props) => (
    <List {...props}>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="username" label="Tên đăng nhập" />
            <TextField source="email" label="Email" />
            <TextField source="role" label="Vai trò" />
        </Datagrid>
    </List>
);

export default UsersList;