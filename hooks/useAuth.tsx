import React, { useEffect, useRef } from 'react';
import { authStore } from '../stores/authStore';
import { authService } from '../services/authService';
import type { AuthUser } from '../services/authService';

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (provider: 'google') => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            authStore.getState().initialize();
        }
    }, []);

    return <>{children}</>;
};

export const useAuth = (): AuthContextType => {
    const user = authStore((s) => s.user);
    const loading = authStore((s) => s.loading);

    return {
        user,
        loading,
        isAuthenticated: !!user,
        login: (provider: 'google') => {
            if (provider === 'google') {
                // Google login is handled via @react-oauth/google in LoginModal
                // This is kept for interface compatibility
            }
        },
        logout: () => authStore.getState().logout(),
        refreshUser: async () => {
            await authStore.getState().initialize();
        },
    };
};

export default useAuth;
