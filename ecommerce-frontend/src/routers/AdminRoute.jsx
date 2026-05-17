import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ currentUser, loading, children }) => {
  if (loading) return <div>Loading...</div>;

  if (!currentUser) return <Navigate to="/" replace />;

  const roles = currentUser.roles || currentUser.authorities || [];

  const isAdmin = roles.some((r) =>
    typeof r === "string"
      ? r === "ROLE_ADMIN" || r === "ADMIN"
      : r.name === "ROLE_ADMIN" || r.name === "ADMIN"
  );

  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
};

export default AdminRoute;