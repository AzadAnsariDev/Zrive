import React from 'react'
import { useSelector } from 'react-redux'
import Login from '../pages/Login'
import { Navigate } from 'react-router';

const Protected = ({children , role="buyer"}) => {

const { user, loading } = useSelector((state) => state.auth);

if (loading) {
  return <div>Loading...</div>;
}

if (!user) {
  return <Navigate to="/login" replace />;
}

if(user.role !== role ){
   return <Navigate to="/" replace />;
}

return children;
}

export default Protected