import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { authService } from '../services/authService';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await authService.forgotPassword(email);
            setSent(true);
        } catch (error) {
            // Always show success to not reveal if email exists
            setSent(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                {sent ? (
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Email enviado!</h1>
                        <p className="text-slate-500 mb-2">
                            Se o email <strong className="text-slate-700">{email}</strong> estiver registado,
                            receberás instruções para repor a password.
                        </p>
                        <p className="text-sm text-slate-400 mb-6">
                            Verifica a caixa de entrada e a pasta de spam.
                        </p>
                        <Link
                            to="/map?login=true"
                            className="block w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all text-center"
                        >
                            Voltar ao Login
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Mail className="w-8 h-8 text-yellow-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-2">Esqueceste a password?</h1>
                            <p className="text-slate-500">
                                Introduz o teu email e enviaremos um link para repores a password.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="O teu email"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-slate-100 rounded-xl border-2 border-transparent focus:border-yellow-400 focus:bg-white outline-none transition-all font-medium"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full bg-yellow-400 text-slate-900 py-4 rounded-2xl font-bold text-lg hover:bg-yellow-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                                        A enviar...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Enviar link de recuperação
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Back link */}
                        <Link
                            to="/map?login=true"
                            className="mt-6 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 font-medium transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Voltar ao Login
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
