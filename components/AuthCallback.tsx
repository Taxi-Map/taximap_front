import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('A autenticar...');

    useEffect(() => {
        const handleCallback = async () => {
            const token = searchParams.get('token');
            const provider = searchParams.get('provider');
            const error = searchParams.get('error');

            if (error) {
                setStatus('error');
                setMessage(getErrorMessage(error));
                setTimeout(() => navigate('/'), 3000);
                return;
            }

            if (token && provider) {
                // Save token
                authService.setToken(token, provider);

                // Verify token is valid
                const isValid = await authService.verifyToken();

                if (isValid) {
                    setStatus('success');
                    setMessage('Login realizado com sucesso!');
                    setTimeout(() => navigate('/map'), 1500);
                } else {
                    setStatus('error');
                    setMessage('Token inválido. Tenta novamente.');
                    authService.logout();
                    setTimeout(() => navigate('/'), 3000);
                }
            } else {
                setStatus('error');
                setMessage('Erro ao processar autenticação.');
                setTimeout(() => navigate('/'), 3000);
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
                {status === 'loading' && (
                    <>
                        <div className="w-16 h-16 mx-auto mb-6">
                            <div className="w-full h-full border-4 border-slate-200 border-t-yellow-400 rounded-full animate-spin" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">{message}</h2>
                        <p className="text-slate-500">Por favor aguarda...</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">{message}</h2>
                        <p className="text-slate-500">A redirecionar...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Erro</h2>
                        <p className="text-slate-500">{message}</p>
                    </>
                )}
            </div>
        </div>
    );
}

function getErrorMessage(error: string): string {
    const messages: Record<string, string> = {
        'access_denied': 'Acesso negado. Tenta novamente.',
        'no_token': 'Não foi possível obter o token.',
        'invalid_token': 'Token inválido.',
        'server_error': 'Erro no servidor. Tenta mais tarde.',
    };
    return messages[error] || 'Erro desconhecido. Tenta novamente.';
}
