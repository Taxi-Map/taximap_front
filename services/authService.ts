import api from './api';
import { authStore } from '../stores/authStore';

// ==================== TIPOS ====================

export interface AuthUser {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    picture?: string;
    verified: boolean;
    phoneNumber?: string;
    providers: ('google' | 'local')[];
    googleId?: string;
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

    // ==================== CADASTRO LOCAL ====================

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await api.post('/auth/register', data);
        this.setToken(response.data.dados.accessToken, 'local');
        return response.data;
    },

    // ==================== LOGIN LOCAL ====================

    async login(data: LoginData): Promise<AuthResponse> {
        const response = await api.post('/auth/login', data);
        this.setToken(response.data.dados.accessToken, 'local');
        return response.data;
    },

    // ==================== OAUTH GOOGLE ====================

    async loginWithGoogleCredential(credential: string): Promise<AuthResponse> {
        const response = await api.post('/auth/google', { credential });
        this.setToken(response.data.dados.accessToken, 'google');
        return response.data;
    },

    // ==================== PERFIL ====================

    async getProfile(): Promise<AuthUser | null> {
        const token = this.getToken();
        if (!token) return null;

        try {
            const response = await api.get('/auth/profile');
            return response.data.dados as AuthUser;
        } catch {
            this.logout();
            return null;
        }
    },

    // ==================== ACTUALIZAR PERFIL ====================

    async updateProfile(data: UpdateProfileData): Promise<AuthUser> {
        const response = await api.put('/auth/profile', data);
        return response.data.dados as AuthUser;
    },

    // ==================== CLOUDINARY SIGNATURE ====================

    async getCloudinarySignature(): Promise<CloudinarySignature> {
        const response = await api.get('/auth/cloudinary-signature');
        return response.data.dados as CloudinarySignature;
    },

    // ==================== VERIFICAR TOKEN ====================

    async verifyToken(): Promise<boolean> {
        const token = this.getToken();
        if (!token) return false;

        try {
            const response = await api.get('/auth/verify');
            return response.status === 200;
        } catch {
            return false;
        }
    },

    // ==================== VERIFICAÇÃO DE EMAIL ====================

    async verifyEmail(token: string): Promise<{ sucesso: boolean; mensagem: string }> {
        const response = await api.get(`/auth/verify-email?token=${token}`);
        return response.data;
    },

    async resendVerification(): Promise<{ sucesso: boolean; mensagem: string }> {
        const response = await api.post('/auth/resend-verification');
        return response.data;
    },

    // ==================== RECUPERAÇÃO DE PASSWORD ====================

    async forgotPassword(email: string): Promise<{ sucesso: boolean; mensagem: string }> {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    async resetPassword(token: string, newPassword: string): Promise<{ sucesso: boolean; mensagem: string }> {
        const response = await api.post('/auth/reset-password', { token, newPassword });
        return response.data;
    },

    // ==================== TM COINS & CONTRIBUIÇÕES ====================

    async getMeuSaldo(): Promise<SaldoResponse | null> {
        try {
            const response = await api.get('/auth/meu-saldo');
            return response.data.sucesso ? response.data.dados : null;
        } catch {
            return null;
        }
    },

    async getMinhasContribuicoes(pagina = 1, porPagina = 20): Promise<{ dados: Contribuicao[]; paginacao: any } | null> {
        try {
            const response = await api.get(`/rotas/minhas-contribuicoes?pagina=${pagina}&porPagina=${porPagina}`);
            const data = response.data;
            return data.sucesso ? { dados: data.dados, paginacao: data.paginacao } : null;
        } catch {
            return null;
        }
    },

    async solicitarPagamento(metodo: string, valorKz: number, telefone: string): Promise<{ dados: Pagamento; mensagem: string }> {
        const response = await api.post('/auth/solicitar-pagamento', { metodo, valorKz, telefone });

        if (!response.data.sucesso) {
            throw { statusCode: response.status, message: response.data.message || 'Erro ao solicitar pagamento' } as AuthError;
        }

        return { dados: response.data.dados, mensagem: response.data.mensagem };
    },

    async getMeusPagamentos(pagina = 1, porPagina = 20): Promise<{ dados: Pagamento[]; paginacao: any } | null> {
        try {
            const response = await api.get(`/auth/meus-pagamentos?pagina=${pagina}&porPagina=${porPagina}`);
            const data = response.data;
            return data.sucesso ? { dados: data.dados, paginacao: data.paginacao } : null;
        } catch {
            return null;
        }
    },

    // ==================== ADMIN — GESTÃO DE PAGAMENTOS ====================

    async getAllPaymentRequests(pagina = 1, porPagina = 20): Promise<{ dados: Pagamento[]; paginacao: any } | null> {
        try {
            const response = await api.get(`/auth/pagamentos-pendentes?pagina=${pagina}&porPagina=${porPagina}`, {
                headers: { 'Cache-Control': 'no-store' },
            });
            const data = response.data;
            return data.sucesso ? { dados: data.dados, paginacao: data.paginacao } : null;
        } catch {
            return null;
        }
    },

    async processPayment(id: string): Promise<boolean> {
        try {
            const response = await api.post(`/auth/processar-pagamento?id=${id}`);
            return response.data.sucesso;
        } catch {
            return false;
        }
    },

    async cancelPayment(id: string): Promise<boolean> {
        try {
            const response = await api.post(`/auth/cancelar-pagamento?id=${id}`);
            return response.data.sucesso;
        } catch {
            return false;
        }
    },

    // ==================== ADMIN — GESTÃO DE UTILIZADORES ====================

    async getAllUsers(pagina = 1, porPagina = 50, search = ''): Promise<{ dados: AuthUser[]; total: number; paginacao: any } | null> {
        try {
            const params = new URLSearchParams({ pagina: String(pagina), porPagina: String(porPagina) });
            if (search) params.set('search', search);
            const response = await api.get(`/auth/utilizadores?${params.toString()}`, {
                headers: { 'Cache-Control': 'no-store' },
            });
            const data = response.data;
            return data.sucesso ? { dados: data.dados, total: data.total, paginacao: data.paginacao } : null;
        } catch {
            return null;
        }
    },

    async changeUserRole(userId: string, novoRole: 'user' | 'staff' | 'admin'): Promise<boolean> {
        try {
            const response = await api.post('/auth/alterar-role', { userId, novoRole });
            return response.data.sucesso;
        } catch {
            return false;
        }
    },

    // ==================== LOGOUT ====================

    logout(): void {
        authStore.getState().logout();
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
        } catch {
            return null;
        }
    }
};

export default authService;
