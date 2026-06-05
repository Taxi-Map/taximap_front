import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Camera, Check, Phone, User, Shield, Edit2, Mail, LogOut, Loader2, X, AlertTriangle,
    TrendingUp, MapPin, CreditCard, ChevronRight, Navigation, Coins
} from 'lucide-react';
import { authService, AuthUser } from '../services/authService';
import { cloudinaryService } from '../services/cloudinaryService';
import { useTmCoins, valorEmKz } from '../hooks/useTmCoins';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Tabs } from './ui/Tabs';
import { Skeleton, SkeletonContributionRow } from './ui/Skeleton';

export default function ProfilePage() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [resendingVerification, setResendingVerification] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editedFirstName, setEditedFirstName] = useState('');
    const [editedLastName, setEditedLastName] = useState('');
    const [editedPhone, setEditedPhone] = useState('');

    const [activeTab, setActiveTab] = useState<string>('profile');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'africell' | 'unitel' | 'express' | null>(null);
    const [selectedAmount, setSelectedAmount] = useState<string | null>(null);

    const rechargeOptions: Record<string, { label: string; value: string; description?: string }[]> = {
        africell: [
            { label: '200,00 Kz', value: '200' },
            { label: '500,00 Kz', value: '500' },
            { label: '1.000,00 Kz', value: '1000' }
        ],
        unitel: [
            { label: 'Plano + Voz 1 Dia (300 Kz)', value: '300', description: '300,00 Kz - 1 Dia' },
            { label: 'Plano + Voz 3 Dias (400 Kz)', value: '400', description: '400,00 Kz - 3 Dias' },
            { label: 'Plano + Voz 3 Dias (500 Kz)', value: '500', description: '500,00 Kz - 3 Dias' },
            { label: 'Plano + Voz 3 Dias (800 Kz)', value: '800', description: '800,00 Kz - 3 Dias' },
            { label: 'Plano + Voz 7 Dias (1.000 Kz)', value: '1000', description: '1.000,00 Kz - 7 Dias' }
        ],
        express: [
            { label: '1.000,00 Kz', value: '1000' },
            { label: '2.000,00 Kz', value: '2000' },
            { label: '5.000,00 Kz', value: '5000' }
        ]
    };

    const { saldo: tmCoins, valorKz: balanceKz, contribuicoes, loading: coinsLoading, solicitarPagamento, refreshSaldo } = useTmCoins();

    useEffect(() => {
        const fetchProfile = async () => {
            if (!authService.isAuthenticated()) {
                navigate('/map?login=true');
                return;
            }
            const profile = await authService.getProfile();
            if (profile) {
                setUser(profile);
                setEditedFirstName(profile.firstName);
                setEditedLastName(profile.lastName);
                setEditedPhone(profile.phoneNumber || '');
            } else {
                navigate('/map?login=true');
            }
            setLoading(false);
        };
        fetchProfile();
    }, [navigate]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        setMessage(null);
        try {
            const updatedUser = await authService.updateProfile({
                firstName: editedFirstName,
                lastName: editedLastName,
                phoneNumber: editedPhone || undefined,
            });
            setUser(updatedUser);
            setIsEditing(false);
            setMessage({ type: 'success', text: 'Perfil actualizado com sucesso!' });
        } catch (error: any) {
            const errorMsg = Array.isArray(error.message) ? error.message.join('. ') : error.message || 'Erro ao actualizar perfil';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoClick = () => fileInputRef.current?.click();

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const validation = cloudinaryService.validateImage(file);
        if (!validation.valid) { setMessage({ type: 'error', text: validation.error! }); return; }
        setUploading(true);
        setMessage(null);
        try {
            const imageUrl = await cloudinaryService.uploadImage(file);
            const updatedUser = await authService.updateProfile({ picture: imageUrl });
            setUser(updatedUser);
            setMessage({ type: 'success', text: 'Foto actualizada com sucesso!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Erro ao carregar foto' });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handlePaymentRequest = async () => {
        if (!selectedPaymentMethod || !selectedAmount) {
            setMessage({ type: 'error', text: 'Por favor, selecione uma forma de pagamento e um valor.' });
            return;
        }
        try {
            const telefone = user?.phoneNumber || '';
            if (!telefone) { setMessage({ type: 'error', text: 'Adicione um número de telefone ao seu perfil primeiro.' }); return; }
            const result = await solicitarPagamento(selectedPaymentMethod, parseInt(selectedAmount), telefone);
            setIsPaymentModalOpen(false);
            setSelectedPaymentMethod(null);
            setSelectedAmount(null);
            setMessage({ type: 'success', text: result.mensagem });
        } catch (error: any) {
            const errorMsg = Array.isArray(error.message) ? error.message.join('. ') : error.message || 'Erro ao solicitar pagamento';
            setMessage({ type: 'error', text: errorMsg });
        }
    };

    const handleLogout = () => { authService.logout(); navigate('/'); };

    const handleCancelEdit = () => {
        if (user) { setEditedFirstName(user.firstName); setEditedLastName(user.lastName); setEditedPhone(user.phoneNumber || ''); }
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-sand">
                <div className="bg-white border-b border-slate-100">
                    <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
                        <Skeleton variant="block" width={40} height={40} />
                        <Skeleton variant="text" width={120} height={20} />
                        <Skeleton variant="block" width={40} height={40} />
                    </div>
                </div>
                <div className="max-w-lg mx-auto px-4 py-8">
                    <div className="flex flex-col items-center mb-8">
                        <Skeleton variant="circle" width={128} height={128} className="mb-4" />
                        <div className="flex gap-2">
                            <Skeleton variant="block" width={80} height={28} />
                            <Skeleton variant="block" width={80} height={28} />
                        </div>
                    </div>
                    <div className="flex justify-center gap-2 mb-8">
                        <Skeleton variant="block" width={140} height={40} />
                        <Skeleton variant="block" width={140} height={40} />
                    </div>
                    <Skeleton variant="card" height={300} />
                </div>
            </div>
        );
    }

    if (!user) return null;

    const fullName = `${user.firstName} ${user.lastName}`;

    return (
        <div className="min-h-screen bg-sand">
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handlePhotoChange} className="hidden" />

            {/* Header */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
                <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
                    <a href="/map" className="p-2 hover:bg-sand rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-storm" />
                    </a>
                    <h1 className="text-lg font-bold text-storm">Meu Perfil</h1>
                    {isEditing ? (
                        <div className="flex gap-1">
                            <button onClick={handleCancelEdit} className="p-2 hover:bg-sand rounded-full transition-colors" disabled={saving}>
                                <X className="w-6 h-6 text-slate-mid" />
                            </button>
                            <button onClick={handleSave} className="p-2 hover:bg-sand rounded-full transition-colors" disabled={saving}>
                                {saving ? <Loader2 className="w-6 h-6 text-blue-atlantic animate-spin" /> : <Check className="w-6 h-6 text-blue-atlantic" />}
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-sand rounded-full transition-colors">
                            <Edit2 className="w-6 h-6 text-slate-mid" />
                        </button>
                    )}
                </div>
            </div>

            {/* Message Toast */}
            {message && (
                <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-lg font-medium text-sm max-w-sm text-center animate-in slide-in-from-top-5 fade-in duration-300 ${
                    message.type === 'success' ? 'bg-success text-white' : 'bg-error text-white'
                }`}>
                    {message.text}
                </div>
            )}

            {/* Email verification banner */}
            {!user.verified && (
                <div className="bg-amber-light border-b border-amber-warm/20">
                    <div className="max-w-lg mx-auto px-4 py-3 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-dark shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-amber-dark font-medium">O teu email ainda não foi verificado.</p>
                            <p className="text-xs text-amber-dark/70 mt-0.5">Verifica a tua caixa de entrada ou pasta de spam.</p>
                        </div>
                        <button
                            onClick={async () => {
                                setResendingVerification(true);
                                try { await authService.resendVerification(); setMessage({ type: 'success', text: 'Email de verificação enviado!' }); }
                                catch { setMessage({ type: 'error', text: 'Erro ao enviar email' }); }
                                finally { setResendingVerification(false); }
                            }}
                            disabled={resendingVerification}
                            className="text-xs font-bold text-amber-dark bg-amber-warm/20 hover:bg-amber-warm/30 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {resendingVerification ? 'A enviar...' : 'Reenviar'}
                        </button>
                    </div>
                </div>
            )}

            {/* Profile Content */}
            <div className="max-w-lg mx-auto px-4 py-8">
                {/* Profile Photo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                            {uploading ? (
                                <Loader2 className="w-10 h-10 animate-spin text-blue-atlantic" />
                            ) : user.picture ? (
                                <img src={user.picture} alt={fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" crossOrigin="anonymous"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            ) : (
                                <User className="w-16 h-16 text-slate-light" />
                            )}
                        </div>
                        <button onClick={handlePhotoClick} disabled={uploading} className="absolute bottom-0 right-0 w-10 h-10 bg-blue-atlantic rounded-full flex items-center justify-center shadow-lg hover:bg-blue-atlantic/90 transition-colors disabled:opacity-50">
                            <Camera className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                        {user.providers?.map((provider) => (
                            <Badge key={provider} color="slate" className="flex items-center gap-2">
                                {provider === 'google' && <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />}

                                {provider === 'local' && <Mail className="w-4 h-4" />}
                                <span className="font-medium capitalize">{provider === 'local' ? 'Email' : provider}</span>
                            </Badge>
                        ))}
                    </div>

                    {user.verified && (
                        <div className="mt-3 flex items-center gap-2 px-4 py-2 bg-success-bg rounded-full">
                            <Shield className="w-4 h-4 text-success" />
                            <span className="text-sm font-bold text-success">Utilizador Verificado</span>
                        </div>
                    )}
                </div>

                <Tabs
                    tabs={[
                        { key: 'profile', label: 'Dados Pessoais', icon: <User className="w-4 h-4" /> },
                        { key: 'wallet', label: 'Carteira', icon: <Coins className="w-4 h-4" /> },
                    ]}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                    variant="pills"
                    className="mb-8"
                />

                {activeTab === 'wallet' && (
                    <>
                        <div className="mb-8 w-full max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col items-center">
                                <div className="w-full grid grid-cols-2 gap-4">
                                    <div className="bg-blue-deep text-white p-5 rounded-2xl flex flex-col items-center justify-center shadow-lg">
                                        <Coins className="w-6 h-6 text-amber-warm mb-2" />
                                        <span className="text-xs font-bold text-blue-horizon uppercase tracking-wider mb-1">Saldo TM Coin</span>
                                        <span className="text-2xl font-bold flex items-center gap-1">
                                            {tmCoins.toLocaleString()} <span className="text-amber-warm text-sm">TM</span>
                                        </span>
                                    </div>
                                    <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col items-center justify-center shadow-sm">
                                        <CreditCard className="w-6 h-6 text-blue-atlantic mb-2" />
                                        <span className="text-xs font-bold text-slate-mid uppercase tracking-wider mb-1">Valor em Kz</span>
                                        <span className="text-2xl font-bold text-storm">
                                            {balanceKz.toLocaleString()} <span className="text-xs text-slate-mid">Kz</span>
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsPaymentModalOpen(true)}
                                    className="mt-6 w-full py-4 bg-amber-warm text-blue-deep font-bold rounded-2xl shadow-lg shadow-amber-warm/30 hover:bg-amber-warm/90 transition-all flex items-center justify-center gap-2"
                                >
                                    <CreditCard className="w-5 h-5" />
                                    Solicitar Pagamento
                                </button>
                            </div>
                        </div>

                        <Card className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 mt-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-slate-mid uppercase tracking-wider">Contribuições Recentes</span>
                                <TrendingUp className="w-4 h-4 text-slate-mid" />
                            </div>
                            <div>
                                {coinsLoading ? (
                                    <div className="divide-y divide-slate-50">
                                        <SkeletonContributionRow />
                                        <SkeletonContributionRow />
                                        <SkeletonContributionRow />
                                    </div>
                                ) : contribuicoes.length > 0 ? (
                                    contribuicoes.map((contribution, index) => (
                                        <div key={contribution._id} className={`flex items-center justify-between py-3 ${index !== contribuicoes.length - 1 ? 'border-b border-slate-50' : ''}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${contribution.tipo === 'paragem' ? 'bg-blue-horizon/20 text-blue-atlantic' : 'bg-purple-100 text-purple-700'}`}>
                                                    {contribution.tipo === 'paragem' ? <MapPin className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-storm text-sm">{contribution.nome}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <p className="text-xs text-slate-mid">{contribution.tipo === 'paragem' ? 'Nova Paragem' : 'Nova Rota'}</p>
                                                        <Badge color={contribution.status === 'aprovada' ? 'green' : contribution.status === 'rejeitada' ? 'red' : 'amber'} size="sm">
                                                            {contribution.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-bold text-sm ${contribution.status === 'aprovada' ? 'text-success' : 'text-slate-mid'}`}>+{contribution.tmCoinsGanhos}</p>
                                                <p className="text-xs text-slate-light">{new Date(contribution.createdAt).toLocaleDateString('pt-AO')}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-slate-mid">Sem contribuições ainda.</div>
                                )}
                            </div>
                        </Card>
                    </>
                )}

                {activeTab === 'profile' && (
                    <div className="bg-white rounded-3xl shadow-card border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-5 border-b border-slate-100">
                            <span className="text-xs font-bold text-slate-mid uppercase tracking-wider">Nome Completo</span>
                            {isEditing ? (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input type="text" value={editedFirstName} onChange={(e) => setEditedFirstName(e.target.value)} placeholder="Nome"
                                        className="w-full px-4 py-3 bg-sand rounded-xl text-storm font-semibold outline-none focus:ring-2 focus:ring-blue-sky" />
                                    <input type="text" value={editedLastName} onChange={(e) => setEditedLastName(e.target.value)} placeholder="Apelido"
                                        className="w-full px-4 py-3 bg-sand rounded-xl text-storm font-semibold outline-none focus:ring-2 focus:ring-blue-sky" />
                                </div>
                            ) : (
                                <p className="mt-2 text-lg font-bold text-storm flex items-center gap-2">
                                    <User className="w-5 h-5 text-slate-mid" />
                                    {fullName}
                                </p>
                            )}
                        </div>

                        <div className="p-5 border-b border-slate-100">
                            <span className="text-xs font-bold text-slate-mid uppercase tracking-wider">Email</span>
                            <p className="mt-2 text-lg font-bold text-storm flex items-center gap-2">
                                <Mail className="w-5 h-5 text-slate-mid" />
                                {user.email}
                            </p>
                            <p className="text-xs text-slate-light mt-1">O email não pode ser alterado</p>
                        </div>

                        <div className="p-5 border-b border-slate-100">
                            <span className="text-xs font-bold text-slate-mid uppercase tracking-wider">Número de Telefone</span>
                            {isEditing ? (
                                <input type="tel" value={editedPhone} onChange={(e) => setEditedPhone(e.target.value)} placeholder="+244923456789"
                                    className="w-full mt-2 px-4 py-3 bg-sand rounded-xl text-storm font-semibold outline-none focus:ring-2 focus:ring-blue-sky" />
                            ) : (
                                <p className="mt-2 text-lg font-bold text-storm flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-slate-mid" />
                                    {user.phoneNumber || 'Não definido'}
                                </p>
                            )}
                        </div>

                        <div className="p-5">
                            <span className="text-xs font-bold text-slate-mid uppercase tracking-wider">Estado de Verificação</span>
                            <div className="mt-2 flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user.verified ? 'bg-success-bg' : 'bg-slate-100'}`}>
                                    <Shield className={`w-5 h-5 ${user.verified ? 'text-success' : 'text-slate-mid'}`} />
                                </div>
                                <div>
                                    <p className={`font-bold ${user.verified ? 'text-success' : 'text-slate-mid'}`}>
                                        {user.verified ? 'Verificado' : 'Não Verificado'}
                                    </p>
                                    <p className="text-xs text-slate-light">
                                        {user.verified ? 'A sua conta foi verificada' : 'Complete a verificação para desbloquear recursos'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-6">
                    <Button variant="primary" size="lg" className="w-full" icon={<LogOut className="w-5 h-5" />} onClick={handleLogout}>
                        Terminar Sessão
                    </Button>
                </div>
            </div>

            {/* Payment Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-deep/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-modal animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                {selectedPaymentMethod && (
                                    <button onClick={() => { setSelectedPaymentMethod(null); setSelectedAmount(null); }}
                                        className="p-1 -ml-2 text-slate-mid hover:text-storm hover:bg-sand rounded-full transition-colors">
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                )}
                                <h3 className="text-lg font-bold text-storm">
                                    {selectedPaymentMethod ? 'Escolha o Valor' : 'Solicitar Pagamento'}
                                </h3>
                            </div>
                            <button onClick={() => { setIsPaymentModalOpen(false); setSelectedPaymentMethod(null); setSelectedAmount(null); }}
                                className="p-2 hover:bg-sand rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-mid" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            {!selectedPaymentMethod ? (
                                <>
                                    <p className="text-sm text-slate-mid mb-4 font-medium">Escolha a forma de pagamento:</p>
                                    <div className="space-y-3">
                                        {[
                                            { method: 'africell' as const, label: 'Africell', sub: 'Dinheiro Mobile', img: '/africell.jpg' },
                                            { method: 'unitel' as const, label: 'Unitel', sub: 'Unitel Money', img: '/unitel.jpeg' },
                                            { method: 'express' as const, label: 'Express', sub: 'Pagamento Rápido', img: '/express.png' },
                                        ].map(({ method, label, sub, img }) => (
                                            <label key={method} className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-blue-sky cursor-pointer transition-all hover:bg-sand">
                                                <input type="radio" name="payment" className="hidden" onChange={() => setSelectedPaymentMethod(method)} />
                                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-100 shrink-0">
                                                    <img src={img} alt={label} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <span className="font-bold text-storm block">{label}</span>
                                                    <span className="text-xs text-slate-mid">{sub}</span>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-slate-light" />
                                            </label>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 mb-6 p-4 bg-sand rounded-2xl">
                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                                            <img src={selectedPaymentMethod === 'africell' ? '/africell.jpg' : selectedPaymentMethod === 'unitel' ? '/unitel.jpeg' : '/express.png'}
                                                alt={selectedPaymentMethod} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-mid font-medium uppercase tracking-wide">Operadora</p>
                                            <p className="font-bold text-storm capitalize">{selectedPaymentMethod}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-mid mb-4 font-medium">Selecione o plano ou valor:</p>
                                    <div className="space-y-2">
                                        {rechargeOptions[selectedPaymentMethod].map((option) => (
                                            <label key={option.value}
                                                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                    selectedAmount === option.value
                                                        ? 'border-blue-atlantic bg-blue-horizon/10 shadow-sm'
                                                        : 'border-slate-100 hover:border-blue-sky hover:bg-sand'
                                                }`}
                                            >
                                                <input type="radio" name="amount" className="hidden"
                                                    checked={selectedAmount === option.value} onChange={() => setSelectedAmount(option.value)} />
                                                <div>
                                                    <span className="font-bold text-storm block">{option.label}</span>
                                                    {option.description && <span className="text-xs text-slate-mid mt-0.5 block">{option.description}</span>}
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAmount === option.value ? 'border-blue-atlantic' : 'border-slate-300'}`}>
                                                    {selectedAmount === option.value && <div className="w-2.5 h-2.5 rounded-full bg-blue-atlantic" />}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="p-6 pt-0 flex gap-3 shrink-0">
                            <button onClick={() => { if (selectedPaymentMethod) { setSelectedPaymentMethod(null); setSelectedAmount(null); } else { setIsPaymentModalOpen(false); } }}
                                className="flex-1 py-3 text-slate-mid font-bold bg-sand rounded-xl hover:bg-slate-200 transition-colors">
                                {selectedPaymentMethod ? 'Voltar' : 'Cancelar'}
                            </button>
                            <button onClick={handlePaymentRequest} disabled={!selectedPaymentMethod || !selectedAmount}
                                className="flex-1 py-3 text-white font-bold bg-blue-atlantic rounded-xl hover:bg-blue-atlantic/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-atlantic/30">
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
