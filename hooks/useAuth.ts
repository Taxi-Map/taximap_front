import { useState, useEffect, useCallback } from 'react';
import { authService, AuthUser } from '../services/authService';

interface UseAuthReturn {
    user: AuthUser | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (provider: 'google' | 'facebook') => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        if (authService.isAuthenticated()) {
            const profile = await authService.getProfile();
            setUser(profile);
        } else {
            setUser(null);
        }
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            setLoading(true);
            await refreshUser();
            setLoading(false);
        };

        checkAuth();
    }, [refreshUser]);

    const login = (provider: 'google' | 'facebook') => {
        if (provider === 'google') {
            authService.loginWithGoogle();
        } else {
            authService.loginWithFacebook();
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
    };
};

export default useAuth;
