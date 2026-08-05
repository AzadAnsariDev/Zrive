import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router';

const Protected = ({ children, role = "buyer" }) => {

  const { user, loading } = useSelector((state) => state.auth);
  
  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role check sirf seller routes ke liye
  if (role === "seller" && user.role !== "seller") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default Protected