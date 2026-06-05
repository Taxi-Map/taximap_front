import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, AlertCircle, Navigation } from 'lucide-react';

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
        if (!token) { setError('Token inválido'); return; }
        if (newPassword !== confirmPassword) { setError('As passwords não coincidem'); return; }
        if (passwordErrors.length > 0) { setError('A password não cumpre os requisitos'); return; }
        setLoading(true);
        const { authService } = await import('../services/authService');
        try {
            const result = await authService.resetPassword(token, newPassword);
            if (result.sucesso) setSuccess(true);
            else setError(result.mensagem || 'Token inválido ou expirado');
        } catch { setError('Erro de conexão. Tenta novamente.'); }
        finally { setLoading(false); }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-deep via-blue-ocean to-blue-deep flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-modal">
                    <div className="w-20 h-20 mx-auto mb-6 bg-error-bg rounded-full flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-error" />
                    </div>
                    <h1 className="text-2xl font-bold text-storm mb-2">Link inválido</h1>
                    <p className="text-slate-mid mb-6">O link de recuperação está incompleto ou inválido.</p>
                    <Link to="/forgot-password"
                        className="block w-full bg-blue-atlantic text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-atlantic/90 transition-all text-center shadow-lg shadow-blue-atlantic/30">
                        Pedir novo link
                    </Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-deep via-blue-ocean to-blue-deep flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-modal">
                    <div className="w-20 h-20 mx-auto mb-6 bg-success-bg rounded-full flex items-center justify-center">
                        <CheckCircle className="w-10 h-10 text-success" />
                    </div>
                    <h1 className="text-2xl font-bold text-storm mb-2">Password alterada!</h1>
                    <p className="text-slate-mid mb-6">Já podes fazer login com a nova password.</p>
                    <button onClick={() => navigate('/map?login=true')}
                        className="w-full bg-blue-atlantic text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-atlantic/90 transition-all shadow-lg shadow-blue-atlantic/30">
                        Ir para Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-deep via-blue-ocean to-blue-deep flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-modal">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-horizon/20 rounded-2xl flex items-center justify-center">
                        <Navigation className="w-8 h-8 text-blue-atlantic" />
                    </div>
                    <h1 className="text-2xl font-bold text-storm mb-2">Nova Password</h1>
                    <p className="text-slate-mid">Introduz a tua nova password</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-error-bg border border-error/20 rounded-xl text-error text-sm flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-mid" />
                        <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Nova password" required minLength={8}
                            className="w-full pl-12 pr-12 py-4 bg-sand rounded-xl border-2 border-transparent focus:border-blue-sky focus:bg-white outline-none transition-all font-medium" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-mid hover:text-storm">
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    {newPassword && passwordErrors.length > 0 && (
                        <div className="text-xs text-slate-mid px-2">
                            <span className="text-error">Falta: </span>{passwordErrors.join(', ')}
                        </div>
                    )}
                    {newPassword && passwordErrors.length === 0 && (
                        <div className="text-xs text-success px-2 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Password válida
                        </div>
                    )}

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-mid" />
                        <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirmar nova password" required
                            className={`w-full pl-12 pr-12 py-4 bg-sand rounded-xl border-2 border-transparent focus:border-blue-sky focus:bg-white outline-none transition-all font-medium ${confirmPassword && !passwordsMatch ? 'border-error' : ''}`} />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-mid hover:text-storm">
                            {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    {confirmPassword && !passwordsMatch && (
                        <div className="text-xs text-error px-2">As passwords não coincidem</div>
                    )}

                    <button type="submit" disabled={loading || !canSubmit}
                        className="w-full bg-blue-atlantic text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-atlantic/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-atlantic/30">
                        {loading ? (
                            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> A guardar...</>
                        ) : 'Alterar Password'}
                    </button>
                </form>

                <Link to="/map?login=true"
                    className="mt-6 block text-center text-slate-mid hover:text-storm font-medium transition-colors">
                    Voltar ao Login
                </Link>
            </div>
        </div>
    );
}
