import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Navigation } from 'lucide-react';
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

            if (error) { setStatus('error'); setMessage(getErrorMessage(error)); setTimeout(() => navigate('/'), 3000); return; }

            if (token && provider) {
                authService.setToken(token, provider);
                const isValid = await authService.verifyToken();
                if (isValid) { setStatus('success'); setMessage('Login realizado com sucesso!'); setTimeout(() => navigate('/map'), 1500); }
                else { setStatus('error'); setMessage('Token inválido. Tenta novamente.'); authService.logout(); setTimeout(() => navigate('/'), 3000); }
            } else { setStatus('error'); setMessage('Erro ao processar autenticação.'); setTimeout(() => navigate('/'), 3000); }
        };
        handleCallback();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-deep via-blue-ocean to-blue-deep flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-modal">
                {status === 'loading' && (
                    <>
                        <div className="w-20 h-20 mx-auto mb-6 bg-blue-horizon/20 rounded-2xl flex items-center justify-center">
                            <div className="w-10 h-10 border-4 border-blue-atlantic/30 border-t-blue-atlantic rounded-full animate-spin" />
                        </div>
                        <h2 className="text-xl font-bold text-storm mb-2">{message}</h2>
                        <p className="text-slate-mid">Por favor aguarda...</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-20 h-20 mx-auto mb-6 bg-success-bg rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-success" />
                        </div>
                        <h2 className="text-xl font-bold text-storm mb-2">{message}</h2>
                        <p className="text-slate-mid">A redirecionar...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-20 h-20 mx-auto mb-6 bg-error-bg rounded-full flex items-center justify-center">
                            <XCircle className="w-8 h-8 text-error" />
                        </div>
                        <h2 className="text-xl font-bold text-storm mb-2">Erro</h2>
                        <p className="text-slate-mid">{message}</p>
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
