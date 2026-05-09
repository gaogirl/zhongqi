import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        // 在加载认证状态时显示加载指示
        return <div>加载中...</div>;
    }

    if (!isAuthenticated) {
        // 如果未认证，重定向到登录页面
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        // 如果角色不匹配，重定向回他们能访问的首页
        const homePath = user.role === 'teacher' ? '/teacher' : '/student';
        return <Navigate to={homePath} replace />;
    }

    // 如果已认证且角色匹配，则渲染子路由
    return <Outlet />;
};

export default ProtectedRoute;




