const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ==================== TIPOS ====================

export interface AuthUser {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    picture?: string;
    verified: boolean;
    phoneNumber?: string;
    providers: ('google' | 'facebook' | 'local')[];
    googleId?: string;
    facebookId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface UpdateProfileData {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    picture?: string;
}

export interface AuthResponse {
    sucesso: boolean;
    mensagem: string;
    dados: {
        accessToken: string;
        user: AuthUser;
    };
}

export interface AuthError {
    statusCode: number;
    message: string | string[];
    error?: string;
}

export interface CloudinarySignature {
    timestamp: number;
    signature: string;
    cloudName: string;
    apiKey: string;
    folder: string;
}

// ==================== SERVIÇO ====================

export const authService = {
    getToken(): string | null {
        return localStorage.getItem('auth_token');
    },

    getProvider(): string | null {
        return localStorage.getItem('auth_provider');
    },

    setToken(token: string, provider?: string): void {
        localStorage.setItem('auth_token', token);
        if (provider) {
            localStorage.setItem('auth_provider', provider);
        }
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    },

    authHeaders(): HeadersInit {
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.getToken()}`,
        };
    },

    // ==================== CADASTRO LOCAL ====================

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw result as AuthError;
        }

        // Guardar token automaticamente
        this.setToken(result.dados.accessToken, 'local');
        return result;
    },

    // ==================== LOGIN LOCAL ====================

    async login(data: LoginData): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw result as AuthError;
        }

        // Guardar token automaticamente
        this.setToken(result.dados.accessToken, 'local');
        return result;
    },

    // ==================== OAUTH ====================

    loginWithGoogle(): void {
        window.location.href = `${API_URL}/auth/google`;
    },

    loginWithFacebook(): void {
        window.location.href = `${API_URL}/auth/facebook`;
    },

    // ==================== PERFIL ====================

    async getProfile(): Promise<AuthUser | null> {
        const token = this.getToken();
        if (!token) return null;

        try {
            const response = await fetch(`${API_URL}/auth/profile`, {
                headers: this.authHeaders(),
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

    // ==================== ACTUALIZAR PERFIL ====================

    async updateProfile(data: UpdateProfileData): Promise<AuthUser> {
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: this.authHeaders(),
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw result as AuthError;
        }

        return result.dados as AuthUser;
    },

    // ==================== CLOUDINARY SIGNATURE ====================

    async getCloudinarySignature(): Promise<CloudinarySignature> {
        const response = await fetch(`${API_URL}/auth/cloudinary-signature`, {
            headers: this.authHeaders(),
        });

        const result = await response.json();

        if (!response.ok) {
            throw result as AuthError;
        }

        return result.dados as CloudinarySignature;
    },

    // ==================== VERIFICAR TOKEN ====================

    async verifyToken(): Promise<boolean> {
        const token = this.getToken();
        if (!token) return false;

        try {
            const response = await fetch(`${API_URL}/auth/verify`, {
                headers: this.authHeaders(),
            });
            return response.ok;
        } catch {
            return false;
        }
    },

    // ==================== VERIFICAÇÃO DE EMAIL ====================

    async verifyEmail(token: string): Promise<{ sucesso: boolean; mensagem: string }> {
        const response = await fetch(`${API_URL}/auth/verify-email?token=${token}`);
        return response.json();
    },

    async resendVerification(): Promise<{ sucesso: boolean; mensagem: string }> {
        const response = await fetch(`${API_URL}/auth/resend-verification`, {
            method: 'POST',
            headers: this.authHeaders(),
        });
        return response.json();
    },

    // ==================== RECUPERAÇÃO DE PASSWORD ====================

    async forgotPassword(email: string): Promise<{ sucesso: boolean; mensagem: string }> {
        const response = await fetch(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        return response.json();
    },

    async resetPassword(token: string, newPassword: string): Promise<{ sucesso: boolean; mensagem: string }> {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword }),
        });
        return response.json();
    },

    // ==================== LOGOUT ====================

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

