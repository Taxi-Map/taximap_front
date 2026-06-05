import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X, Mail, Lock, User, Eye, EyeOff, AlertCircle, Navigation } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { authService, AuthError } from '../services/authService';
import { authStore } from '../stores/authStore';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [googleLoading, setGoogleLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isLoginMode) {
                await authService.login({
                    email: formData.email,
                    password: formData.password,
                });
            } else {
                await authService.register({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password,
                });
            }

            await authStore.getState().initialize();

            toast.success(isLoginMode ? 'Login efetuado com sucesso!' : 'Conta criada com sucesso!');
            onClose();
            if (onSuccess) {
                onSuccess();
            } else {
                window.location.href = '/map';
            }
        } catch (err) {
            const authError = err as AuthError;
            if (Array.isArray(authError.message)) {
                setError(authError.message.join('. '));
            } else {
                setError(authError.message || 'Erro ao processar. Tenta novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setError(null);
        setGoogleLoading(true);

        try {
            await authService.loginWithGoogleCredential(credentialResponse.credential);
            await authStore.getState().initialize();

            onClose();
            if (onSuccess) {
                onSuccess();
            } else {
                window.location.href = '/map';
            }
        } catch (err) {
            const authError = err as AuthError;
            setError(authError.message || 'Erro ao autenticar com Google. Tenta novamente.');
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Autenticação com Google falhou. Tenta novamente.');
        toast.error('Autenticação com Google falhou. Tenta novamente.');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const switchMode = () => {
        setIsLoginMode(!isLoginMode);
        setError(null);
        setFormData({ firstName: '', lastName: '', email: '', password: '' });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <div
                className="absolute inset-0 bg-blue-deep/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-modal animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-blue-deep/80 text-white hover:bg-blue-deep rounded-full transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="relative bg-gradient-to-br from-blue-deep via-blue-ocean to-blue-deep px-6 py-8 text-center">
                    <div className="flex justify-center mb-3">
                        <div className="w-14 h-14 bg-blue-atlantic rounded-2xl flex items-center justify-center shadow-lg shadow-blue-atlantic/30">
                            <Navigation className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">
                        {isLoginMode ? 'Bem-vindo de volta!' : 'Criar conta'}
                    </h2>
                    <p className="text-blue-horizon text-sm">
                        {isLoginMode ? 'Entra na tua conta para continuar' : 'Junta-te ao Taxi Map hoje'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="flex items-start gap-2 p-3 bg-error-bg border border-error/20 rounded-xl text-error text-sm">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    {!isLoginMode && (
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-mid" />
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="Nome"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required={!isLoginMode}
                                    className="w-full pl-12 pr-4 py-3.5 bg-sand rounded-xl border-2 border-transparent focus:border-blue-sky focus:bg-white outline-none transition-all font-medium text-sm"
                                />
                            </div>
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Apelido"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required={!isLoginMode}
                                    className="w-full px-4 py-3.5 bg-sand rounded-xl border-2 border-transparent focus:border-blue-sky focus:bg-white outline-none transition-all font-medium text-sm"
                                />
                            </div>
                        </div>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-mid" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full pl-12 pr-4 py-3.5 bg-sand rounded-xl border-2 border-transparent focus:border-blue-sky focus:bg-white outline-none transition-all font-medium text-sm"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-mid" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Palavra-passe"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full pl-12 pr-12 py-3.5 bg-sand rounded-xl border-2 border-transparent focus:border-blue-sky focus:bg-white outline-none transition-all font-medium text-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-mid hover:text-storm transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    {isLoginMode && (
                        <div className="text-right">
                            <a
                                href="/forgot-password"
                                onClick={onClose}
                                className="text-sm text-slate-mid hover:text-blue-atlantic font-medium transition-colors"
                            >
                                Esqueceste a palavra-passe?
                            </a>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-blue-atlantic text-white rounded-xl font-bold text-base hover:bg-blue-atlantic/90 active:scale-[0.98] transition-all shadow-lg shadow-blue-atlantic/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                A processar...
                            </>
                        ) : (
                            isLoginMode ? 'Entrar' : 'Criar conta'
                        )}
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-slate-mid font-medium">ou continua com</span>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        {googleLoading ? (
                            <div className="flex items-center gap-2 py-3 px-6 border-2 border-slate-200 rounded-xl bg-sand">
                                <div className="w-5 h-5 border-2 border-blue-atlantic/30 border-t-blue-atlantic rounded-full animate-spin" />
                                <span className="text-sm text-slate-mid font-medium">A autenticar...</span>
                            </div>
                        ) : (
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                size="large"
                                shape="pill"
                                text="signin_with"
                            />
                        )}
                    </div>
                </form>

                <div className="px-6 pb-6 text-center">
                    <p className="text-slate-mid text-sm">
                        {isLoginMode ? 'Não tens conta?' : 'Já tens uma conta?'}
                        <button
                            type="button"
                            onClick={switchMode}
                            className="ml-2 text-blue-atlantic hover:text-blue-atlantic/80 font-bold transition-colors"
                        >
                            {isLoginMode ? 'Criar conta' : 'Entrar'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
