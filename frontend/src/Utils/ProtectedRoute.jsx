import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import Loader from '../Components/Loader/Loder';

const ProtectedRoute = ({ isAdmin = false }) => {

    const { loading, isAuthenticate, user } = useSelector((state) => state.user);

    // ⏳ Wait until auth state is resolved
    if (loading) {
        return <Loader />;
    }

    // 🔒 Not logged in
    if (!isAuthenticate) {
        return <Navigate to="/auth" replace />;
    }

    // 🔐 Admin route protection
    if (isAdmin && (!user || user.role !== 'admin')) {
        return <Navigate to="/auth" replace />;
    }

    // ✅ Authorized
    return <Outlet />;
};

export default ProtectedRoute;
