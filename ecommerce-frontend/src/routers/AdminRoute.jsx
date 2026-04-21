import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ currentUser, loading, children }) => {

    if (loading) {
        return <div className="text-center mt-5">Đang tải...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/" replace />;
    }

    if (!currentUser.roles.includes('ROLE_ADMIN')) {
        return <Navigate to="/" replace />;
    }
    console.log(currentUser.roles);
    return children;
};

export default AdminRoute;
