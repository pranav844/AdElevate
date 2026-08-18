import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  // Read logged in user from localStorage
  const stored = localStorage.getItem('adelevate_user');
  
  if (!stored) {
    //  Case 1: Not logged in -> Redirect to Login page
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(stored);

    //  Case 2: Role not authorized -> Redirect to Home page
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }

    //  Case 3: Authorized -> Render the protected page
    return children;
  } catch (e) {
    console.error('ProtectedRoute auth error:', e);
    return <Navigate to="/login" replace />;
  }
}
