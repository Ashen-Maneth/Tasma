import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, isAuthenticated, requiredRole, userRole }) => {
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    if (requiredRole && requiredRole !== userRole) {
        return <Navigate to="/login" />; // Or a dedicated "access denied" page
    }
    return children;
};

export default PrivateRoute;
