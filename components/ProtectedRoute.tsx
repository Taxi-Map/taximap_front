import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-yellow-500" />
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login page, but save the intended location
        return <Navigate to={`/map?login=true&redirect=${encodeURIComponent(location.pathname)}`} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
