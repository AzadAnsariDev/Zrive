import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router';

const Protected = ({ children, role = "buyer" }) => {

  const { user, loading } = useSelector((state) => state.auth);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // role can be a single string ("seller") or an array (["basic_seller", "seller"])
  const allowedRoles = Array.isArray(role) ? role : [role];

  // "buyer" (the default) means no restriction — any logged-in user passes
  const isRestricted = !allowedRoles.includes("buyer");

  if (isRestricted && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default Protected