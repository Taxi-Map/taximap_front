import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { authStore } from '../stores/authStore';
import { extractApiError } from '../services/api';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

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

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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

            // Success - close modal and notify parent
            onClose();
            if (onSuccess) {
                onSuccess();
            } else {
                window.location.href = '/map';
            }
        } catch (err) {
            toast.error(extractApiError(err, 'Erro ao processar.'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const switchMode = () => {
        setIsLoginMode(!isLoginMode);
        setFormData({ firstName: '', lastName: '', email: '', password: '' });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal - Scrollable on small screens */}
            <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl sm:rounded-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                {/* Close button - Fixed position for visibility */}
                <button
                    onClick={onClose}
                    className="fixed sm:absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 bg-slate-800/80 sm:bg-transparent text-white hover:bg-white/20 rounded-full transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header with gradient - Compact on mobile */}
                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-4 sm:px-6 sm:py-6 text-center">
                    <div className="flex justify-center mb-2 sm:mb-3">
                        <img src="/icon/logo.png" alt="Taxi Map" className="h-10 sm:h-14 w-auto" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-white mb-0.5">
                        {isLoginMode ? 'Bem-vindo de volta!' : 'Criar conta'}
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-sm">
                        {isLoginMode
                            ? 'Entra na tua conta para continuar'
                            : 'Junta-te ao Taxi Map hoje'}
                    </p>
                </div>

                {/* Form - Smaller padding on mobile */}
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    {!isLoginMode && (
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="Nome"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required={!isLoginMode}
                                    className="w-full pl-10 sm:pl-12 pr-3 py-3 sm:py-4 bg-slate-100 rounded-xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-sm sm:text-base"
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
                                    className="w-full px-4 py-3 sm:py-4 bg-slate-100 rounded-xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-sm sm:text-base"
                                />
                            </div>
                        </div>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-slate-100 rounded-xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-sm sm:text-base"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Palavra-passe"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 bg-slate-100 rounded-xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-sm sm:text-base"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                    </div>

                    {isLoginMode && (
                        <div className="text-right">
                            <Link
                                to="/forgot-password"
                                onClick={onClose}
                                className="text-xs sm:text-sm text-slate-500 hover:text-slate-700 font-medium hover:underline"
                            >
                                Esqueceste a palavra-passe?
                            </Link>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-black text-base sm:text-lg hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                                A processar...
                            </>
                        ) : (
                            isLoginMode ? 'Entrar' : 'Criar conta'
                        )}
                    </button>

                    <div className="relative my-4 sm:my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs sm:text-sm">
                            <span className="px-3 sm:px-4 bg-white text-slate-500 font-medium">ou continua com</span>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <GoogleLogin
                            theme="outline"
                            size="large"
                            shape="rectangular"
                            text="signin_with"
                            width="350"
                            onSuccess={async (credentialResponse) => {
                                try {
                                    await authService.loginWithGoogleCredential(credentialResponse.credential!);
                                    await authStore.getState().initialize();
                                    toast.success('Login efetuado com sucesso!');
                                    onClose();
                                    onSuccess?.();
                                } catch (err) {
                                    toast.error(extractApiError(err, 'Autenticação com Google falhou.'));
                                }
                            }}
                            onError={() => toast.error('Autenticação com Google falhou.')}
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-center">
                    <p className="text-slate-600 text-sm sm:text-base">
                        {isLoginMode ? 'Não tens conta?' : 'Já tens uma conta?'}
                        <button
                            type="button"
                            onClick={switchMode}
                            className="ml-2 text-blue-600 hover:text-blue-700 font-bold"
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
