const API_URL = import.meta.env.VITE_API_URL || '';

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
    role: 'user' | 'staff' | 'admin';
    tmCoins: number;
    totalContribuicoes: number;
    createdAt: string;
    updatedAt: string;
}

export interface Contribuicao {
    _id: string;
    userId?: string;
    tipo: 'paragem' | 'linha';
    nome: string;
    referenciaId: number;
    tmCoinsGanhos: number;
    status: 'pendente' | 'aprovada' | 'rejeitada';
    createdAt: string;
    aprovadoEm?: string;
    aprovadoPor?: string;
}

export interface Pagamento {
    _id: string;
    userId?: string;
    metodo: 'africell' | 'unitel' | 'express';
    valorKz: number;
    tmCoinsDebitados: number;
    telefone: string;
    status: 'pendente' | 'processado' | 'cancelado';
    createdAt: string;
    processadoEm?: string;
    processadoPor?: string;
}

export interface SaldoResponse {
    tmCoins: number;
    totalContribuicoes: number;
    valorKz: number;
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

    // ==================== TM COINS & CONTRIBUIÇÕES ====================

    async getMeuSaldo(): Promise<SaldoResponse | null> {
        try {
            const response = await fetch(`${API_URL}/auth/meu-saldo`, {
                headers: this.authHeaders(),
            });
            if (!response.ok) return null;
            const data = await response.json();
            return data.sucesso ? data.dados : null;
        } catch (error) {
            console.error('Error fetching saldo:', error);
            return null;
        }
    },

    async getMinhasContribuicoes(pagina = 1, porPagina = 20): Promise<{ dados: Contribuicao[]; paginacao: any } | null> {
        try {
            const response = await fetch(
                `${API_URL}/rotas/minhas-contribuicoes?pagina=${pagina}&porPagina=${porPagina}`,
                { headers: this.authHeaders() }
            );
            if (!response.ok) return null;
            const data = await response.json();
            return data.sucesso ? { dados: data.dados, paginacao: data.paginacao } : null;
        } catch (error) {
            console.error('Error fetching contribuicoes:', error);
            return null;
        }
    },

    async solicitarPagamento(metodo: string, valorKz: number, telefone: string): Promise<{ dados: Pagamento; mensagem: string }> {
        const response = await fetch(`${API_URL}/auth/solicitar-pagamento`, {
            method: 'POST',
            headers: this.authHeaders(),
            body: JSON.stringify({ metodo, valorKz, telefone }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw { statusCode: response.status, message: result.message || 'Erro ao solicitar pagamento' } as AuthError;
        }

        return { dados: result.dados, mensagem: result.mensagem };
    },

    async getMeusPagamentos(pagina = 1, porPagina = 20): Promise<{ dados: Pagamento[]; paginacao: any } | null> {
        try {
            const response = await fetch(
                `${API_URL}/auth/meus-pagamentos?pagina=${pagina}&porPagina=${porPagina}`,
                { headers: this.authHeaders() }
            );
            if (!response.ok) return null;
            const data = await response.json();
            return data.sucesso ? { dados: data.dados, paginacao: data.paginacao } : null;
        } catch (error) {
            console.error('Error fetching pagamentos:', error);
            return null;
        }
    },

    // ==================== ADMIN — GESTÃO DE PAGAMENTOS ====================

    async getAllPaymentRequests(pagina = 1, porPagina = 20): Promise<{ dados: Pagamento[]; paginacao: any } | null> {
        try {
            const response = await fetch(
                `${API_URL}/auth/pagamentos-pendentes?pagina=${pagina}&porPagina=${porPagina}`,
                { headers: this.authHeaders(), cache: 'no-store' }
            );
            if (!response.ok) return null;
            const data = await response.json();
            return data.sucesso ? { dados: data.dados, paginacao: data.paginacao } : null;
        } catch (error) {
            console.error('Error fetching all payment requests:', error);
            return null;
        }
    },

    async processPayment(id: string): Promise<boolean> {
        try {
            const response = await fetch(`${API_URL}/auth/processar-pagamento?id=${id}`, {
                method: 'POST',
                headers: this.authHeaders(),
            });
            if (!response.ok) return false;
            const data = await response.json();
            return data.sucesso;
        } catch (error) {
            console.error('Error processing payment:', error);
            return false;
        }
    },

    async cancelPayment(id: string): Promise<boolean> {
        try {
            const response = await fetch(`${API_URL}/auth/cancelar-pagamento?id=${id}`, {
                method: 'POST',
                headers: this.authHeaders(),
            });
            if (!response.ok) return false;
            const data = await response.json();
            return data.sucesso;
        } catch (error) {
            console.error('Error cancelling payment:', error);
            return false;
        }
    },

    // ==================== ADMIN — GESTÃO DE UTILIZADORES ====================

    async getAllUsers(pagina = 1, porPagina = 50, search = ''): Promise<{ dados: AuthUser[]; total: number; paginacao: any } | null> {
        try {
            const params = new URLSearchParams({ pagina: String(pagina), porPagina: String(porPagina) });
            if (search) params.set('search', search);
            const response = await fetch(
                `${API_URL}/auth/utilizadores?${params.toString()}`,
                { headers: this.authHeaders(), cache: 'no-store' }
            );
            if (!response.ok) return null;
            const data = await response.json();
            return data.sucesso ? { dados: data.dados, total: data.total, paginacao: data.paginacao } : null;
        } catch (error) {
            console.error('Error fetching users:', error);
            return null;
        }
    },

    async changeUserRole(userId: string, novoRole: 'user' | 'staff' | 'admin'): Promise<boolean> {
        try {
            const response = await fetch(`${API_URL}/auth/alterar-role`, {
                method: 'POST',
                headers: this.authHeaders(),
                body: JSON.stringify({ userId, novoRole }),
            });
            if (!response.ok) return false;
            const data = await response.json();
            return data.sucesso;
        } catch (error) {
            console.error('Error changing user role:', error);
            return false;
        }
    },

    // ==================== LOGOUT ====================

    logout(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_provider');
    },

    logoutAndRedirect(): void {
        this.logout();
        window.location.href = '/login';
    },

    getUser(): { id: string, name: string, role: string } | null {
        const stored = localStorage.getItem('user');
        if (!stored) return null;
        try {
            return JSON.parse(stored);
        } catch (e) {
            return null;
        }
    }
};

export default authService;
