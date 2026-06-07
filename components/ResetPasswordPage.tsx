import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Validate password
    const validatePassword = (pw: string): string[] => {
        const errors: string[] = [];
        if (pw.length < 8) errors.push('Mínimo 8 caracteres');
        if (!/[A-Z]/.test(pw)) errors.push('1 letra maiúscula');
        if (!/[a-z]/.test(pw)) errors.push('1 letra minúscula');
        if (!/[0-9]/.test(pw)) errors.push('1 número');
        if (!/[@$!%*?&#^()_\-+=]/.test(pw)) errors.push('1 caractere especial');
        return errors;
    };

    const passwordErrors = newPassword ? validatePassword(newPassword) : [];
    const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
    const canSubmit = newPassword && confirmPassword && passwordErrors.length === 0 && passwordsMatch;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!token) {
            setError('Token inválido');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('As passwords não coincidem');
            return;
        }

        if (passwordErrors.length > 0) {
            setError('A password não cumpre os requisitos');
            return;
        }

        setLoading(true);
        try {
            const result = await authService.resetPassword(token, newPassword);
            if (result.sucesso) {
                setSuccess(true);
            } else {
                setError(result.mensagem || 'Token inválido ou expirado');
            }
        } catch {
            setError('Erro de conexão. Tenta novamente.');
        } finally {
            setLoading(false);
        }
    };

    // No token
    if (!token) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
                    <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Link inválido</h1>
                    <p className="text-slate-500 mb-6">O link de recuperação está incompleto ou inválido.</p>
                    <Link
                        to="/forgot-password"
                        className="block w-full bg-yellow-400 text-slate-900 py-4 rounded-2xl font-bold text-lg hover:bg-yellow-500 transition-all text-center"
                    >
                        Pedir novo link
                    </Link>
                </div>
            </div>
        );
    }

    // Success
    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
                    <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Password alterada!</h1>
                    <p className="text-slate-500 mb-6">Já podes fazer login com a nova password.</p>
                    <button
                        onClick={() => navigate('/map?login=true')}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all"
                    >
                        Ir para Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Lock className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Nova Password</h1>
                    <p className="text-slate-500">Introduz a tua nova password</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* New Password */}
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Nova password"
                            required
                            minLength={8}
                            className="w-full pl-12 pr-12 py-4 bg-slate-100 rounded-xl border-2 border-transparent focus:border-yellow-400 focus:bg-white outline-none transition-all font-medium"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Password requirements */}
                    {newPassword && passwordErrors.length > 0 && (
                        <div className="text-xs text-slate-500 px-2">
                            <span className="text-red-500">Falta: </span>
                            {passwordErrors.join(', ')}
                        </div>
                    )}
                    {newPassword && passwordErrors.length === 0 && (
                        <div className="text-xs text-green-600 px-2 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Password válida
                        </div>
                    )}

                    {/* Confirm Password */}
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type={showConfirm ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirmar nova password"
                            required
                            className={`w-full pl-12 pr-12 py-4 bg-slate-100 rounded-xl border-2 border-transparent focus:border-yellow-400 focus:bg-white outline-none transition-all font-medium ${confirmPassword && !passwordsMatch ? 'border-red-300' : ''
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    {confirmPassword && !passwordsMatch && (
                        <div className="text-xs text-red-500 px-2">As passwords não coincidem</div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !canSubmit}
                        className="w-full bg-yellow-400 text-slate-900 py-4 rounded-2xl font-bold text-lg hover:bg-yellow-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                                A guardar...
                            </>
                        ) : (
                            'Alterar Password'
                        )}
                    </button>
                </form>

                {/* Back link */}
                <Link
                    to="/map?login=true"
                    className="mt-6 block text-center text-slate-500 hover:text-slate-700 font-medium transition-colors"
                >
                    Voltar ao Login
                </Link>
            </div>
        </div>
    );
}
