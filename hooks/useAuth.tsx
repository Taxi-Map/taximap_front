import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, AuthUser } from '../services/authService';

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (provider: 'google' | 'facebook') => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        if (authService.isAuthenticated()) {
            try {
                const profile = await authService.getProfile();
                setUser(profile);
            } catch (err) {
                setUser(null);
            }
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

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={ value }> { children } </AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        // Fallback for components used outside AuthProvider (e.g. some root level tests or edge cases)
        // Ideally we should throw an error, but to maintain backwards compatibility during refactor:
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default useAuth;
