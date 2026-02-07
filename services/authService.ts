const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    picture?: string;
    provider: 'google' | 'facebook';
    providerId: string;
}

export const authService = {
    getToken(): string | null {
        return localStorage.getItem('auth_token');
    },

    getProvider(): string | null {
        return localStorage.getItem('auth_provider');
    },

    setToken(token: string, provider: string): void {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_provider', provider);
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    },

    async getProfile(): Promise<AuthUser | null> {
        const token = this.getToken();
        if (!token) return null;

        try {
            const response = await fetch(`${API_URL}/auth/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                this.logout();
                return null;
            }

            const data = await response.json();
            return data.dados as AuthUser;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    },

    async verifyToken(): Promise<boolean> {
        const token = this.getToken();
        if (!token) return false;

        try {
            const response = await fetch(`${API_URL}/auth/verify`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.ok;
        } catch {
            return false;
        }
    },

    loginWithGoogle(): void {
        window.location.href = `${API_URL}/auth/google`;
    },

    loginWithFacebook(): void {
        window.location.href = `${API_URL}/auth/facebook`;
    },

    logout(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_provider');
    },

    logoutAndRedirect(): void {
        this.logout();
        window.location.href = '/';
    },
};

export default authService;
