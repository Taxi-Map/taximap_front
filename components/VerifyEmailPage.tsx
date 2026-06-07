import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { authService } from '../services/authService';

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('Token não encontrado no link');
            return;
        }

        authService.verifyEmail(token)
            .then(data => {
                if (data.sucesso) {
                    setStatus('success');
                    setMessage('Email verificado com sucesso!');
                } else {
                    setStatus('error');
                    setMessage(data.mensagem || 'Token inválido ou expirado');
                }
            })
            .catch(() => {
                setStatus('error');
                setMessage('Erro ao verificar email. Tenta novamente.');
            });
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
                {status === 'loading' && (
                    <>
                        <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
                            <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">A verificar email...</h1>
                        <p className="text-slate-500">Por favor aguarda</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">{message}</h1>
                        <p className="text-slate-500 mb-6">A tua conta está agora verificada. Já podes usar todas as funcionalidades.</p>
                        <button
                            onClick={() => navigate('/map')}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all"
                        >
                            Ir para o Mapa
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                            <XCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Verificação falhou</h1>
                        <p className="text-slate-500 mb-6">{message}</p>
                        <div className="space-y-3">
                            <Link
                                to="/map?login=true"
                                className="block w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all text-center"
                            >
                                Ir para Login
                            </Link>
                            <p className="text-sm text-slate-400">
                                Se o link expirou, faz login e pede um novo email de verificação no teu perfil.
                            </p>
                        </div>
                    </>
                )}

                {/* Email icon decoration */}
                <div className="mt-8 flex justify-center">
                    <Mail className="w-6 h-6 text-slate-300" />
                </div>
            </div>
        </div>
    );
}
