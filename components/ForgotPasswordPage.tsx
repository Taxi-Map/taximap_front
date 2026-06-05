import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle, Navigation } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { authService } = await import('../services/authService');
        try { await authService.forgotPassword(email); } catch {} finally { setSent(true); setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-deep via-blue-ocean to-blue-deep flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-modal">
                {sent ? (
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-6 bg-success-bg rounded-full flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-success" />
                        </div>
                        <h1 className="text-2xl font-bold text-storm mb-2">Email enviado!</h1>
                        <p className="text-slate-mid mb-2">
                            Se o email <strong className="text-storm">{email}</strong> estiver registado, receberás instruções para repor a password.
                        </p>
                        <p className="text-sm text-slate-light mb-6">Verifica a caixa de entrada e a pasta de spam.</p>
                        <Link to="/map?login=true"
                            className="block w-full bg-blue-atlantic text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-atlantic/90 transition-all text-center shadow-lg shadow-blue-atlantic/30">
                            Voltar ao Login
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 mx-auto mb-4 bg-blue-horizon/20 rounded-2xl flex items-center justify-center">
                                <Navigation className="w-8 h-8 text-blue-atlantic" />
                            </div>
                            <h1 className="text-2xl font-bold text-storm mb-2">Esqueceste a password?</h1>
                            <p className="text-slate-mid">Introduz o teu email e enviaremos um link para repores a password.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-mid" />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="O teu email" required
                                    className="w-full pl-12 pr-4 py-4 bg-sand rounded-xl border-2 border-transparent focus:border-blue-sky focus:bg-white outline-none transition-all font-medium" />
                            </div>
                            <button type="submit" disabled={loading || !email}
                                className="w-full bg-blue-atlantic text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-atlantic/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-atlantic/30">
                                {loading ? (
                                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> A enviar...</>
                                ) : (
                                    <><Send className="w-5 h-5" /> Enviar link de recuperação</>
                                )}
                            </button>
                        </form>

                        <Link to="/map?login=true"
                            className="mt-6 flex items-center justify-center gap-2 text-slate-mid hover:text-storm font-medium transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Voltar ao Login
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
