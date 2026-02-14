'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { ArrowLeft, Camera, Check, Phone, User, Shield, Edit2, Mail, LogOut, Loader2, X, AlertTriangle, TrendingUp, MapPin, CreditCard, ChevronRight } from 'lucide-react';
import { authService, AuthUser } from '../services/authService';
import { cloudinaryService } from '../services/cloudinaryService';


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

    const [activeTab, setActiveTab] = useState<'profile' | 'wallet'>('profile');
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

    // Mock data for wallet and contributions
    const [tmCoins, setTmCoins] = useState(2500);
    const [contributions, setContributions] = useState([
        { id: 1, type: 'stop', name: 'Paragem Mutamba', points: 1500, date: '2024-02-14' },
        { id: 2, type: 'line', name: 'Viana - Zango', points: 1000, date: '2024-02-10' }
    ]);

    // 1000 TM Coin = 100 Kz -> 1 TM Coin = 0.1 Kz
    const balanceKz = tmCoins * 0.1;

    // Fetch user profile on mount
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
                // Token invalid, redirect to login
                navigate('/map?login=true');
            }
            setLoading(false);
        };

        fetchProfile();
    }, [navigate]);

    // Clear message after 4 seconds
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
            const errorMsg = Array.isArray(error.message)
                ? error.message.join('. ')
                : error.message || 'Erro ao actualizar perfil';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        const validation = cloudinaryService.validateImage(file);
        if (!validation.valid) {
            setMessage({ type: 'error', text: validation.error! });
            return;
        }

        setUploading(true);
        setMessage(null);

        try {
            // Upload to Cloudinary
            const imageUrl = await cloudinaryService.uploadImage(file);

            // Update profile with new picture URL
            const updatedUser = await authService.updateProfile({ picture: imageUrl });
            setUser(updatedUser);
            setMessage({ type: 'success', text: 'Foto actualizada com sucesso!' });
        } catch (error: any) {
            console.error('Photo upload error:', error);
            setMessage({ type: 'error', text: error.message || 'Erro ao carregar foto' });
        } finally {
            setUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handlePaymentRequest = () => {
        if (!selectedPaymentMethod) {
            setMessage({ type: 'error', text: 'Por favor, selecione uma forma de pagamento.' });
            return;
        }

        // Mock payment request API call
        setIsPaymentModalOpen(false);
        setMessage({ type: 'success', text: `Solicitação de pagamento via ${selectedPaymentMethod.toUpperCase()} enviada com sucesso!` });
        setSelectedPaymentMethod(null);
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    const handleCancelEdit = () => {
        if (user) {
            setEditedFirstName(user.firstName);
            setEditedLastName(user.lastName);
            setEditedPhone(user.phoneNumber || '');
        }
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-yellow-500 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">A carregar perfil...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const fullName = `${user.firstName} ${user.lastName}`;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handlePhotoChange}
                className="hidden"
            />

            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
                    <a href="/map" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-900" />
                    </a>
                    <h1 className="text-lg font-bold text-slate-900">Meu Perfil</h1>
                    {isEditing ? (
                        <div className="flex gap-1">
                            <button
                                onClick={handleCancelEdit}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                disabled={saving}
                            >
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                            <button
                                onClick={handleSave}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                disabled={saving}
                            >
                                {saving ? (
                                    <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
                                ) : (
                                    <Check className="w-6 h-6 text-green-600" />
                                )}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <Edit2 className="w-6 h-6 text-slate-600" />
                        </button>
                    )}
                </div>
            </div>

            {/* Message Toast */}
            {message && (
                <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-lg font-medium text-sm max-w-sm text-center ${message.type === 'success'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Email verification banner */}
            {!user.verified && (
                <div className="bg-amber-50 border-b border-amber-200">
                    <div className="max-w-lg mx-auto px-4 py-3 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-amber-800 font-medium">O teu email ainda não foi verificado.</p>
                            <p className="text-xs text-amber-600 mt-0.5">Verifica a tua caixa de entrada ou pasta de spam.</p>
                        </div>
                        <button
                            onClick={async () => {
                                setResendingVerification(true);
                                try {
                                    await authService.resendVerification();
                                    setMessage({ type: 'success', text: 'Email de verificação enviado!' });
                                } catch {
                                    setMessage({ type: 'error', text: 'Erro ao enviar email' });
                                } finally {
                                    setResendingVerification(false);
                                }
                            }}
                            disabled={resendingVerification}
                            className="text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-200 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {resendingVerification ? 'A enviar...' : 'Reenviar'}
                        </button>
                    </div>
                </div>
            )}

            {/* Profile Content */}
            <div className="max-w-lg mx-auto px-4 py-8">
                {/* Profile Photo Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                            {uploading ? (
                                <Loader2 className="w-10 h-10 animate-spin text-yellow-500" />
                            ) : user.picture ? (
                                <img
                                    src={user.picture}
                                    alt={fullName}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                    crossOrigin="anonymous"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            ) : (
                                <User className="w-16 h-16 text-slate-400" />
                            )}
                        </div>
                        {/* Camera button for photo change */}
                        <button
                            onClick={handlePhotoClick}
                            disabled={uploading}
                            className="absolute bottom-0 right-0 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
                        >
                            <Camera className="w-5 h-5 text-slate-900" />
                        </button>
                    </div>

                    {/* Provider Badges */}
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                        {user.providers?.map((provider) => (
                            <div key={provider} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-sm">
                                {provider === 'google' && (
                                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                                )}
                                {provider === 'facebook' && (
                                    <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                )}
                                {provider === 'local' && <Mail className="w-4 h-4" />}
                                <span className="font-medium capitalize">
                                    {provider === 'local' ? 'Email' : provider}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Verified Badge */}
                    {user.verified && (
                        <div className="mt-2 flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full">
                            <Shield className="w-4 h-4" />
                            <span className="text-sm font-semibold">Utilizador Verificado</span>
                        </div>
                    )}
                </div>

                {/* View Toggle */}
                <div className="flex bg-slate-200 p-1 rounded-xl mb-8">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'profile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Dados Pessoais
                    </button>
                    <button
                        onClick={() => setActiveTab('wallet')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'wallet' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Carteira & Taxas
                    </button>
                </div>

                {activeTab === 'wallet' && (
                    <>
                        {/* Wallet Section */}
                        <div className="mb-8 w-full max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col items-center">

                                <div className="w-full grid grid-cols-2 gap-4">
                                    <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-lg">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Saldo TM Coin</span>
                                        <span className="text-2xl font-bold flex items-center gap-1">
                                            {tmCoins.toLocaleString()} <span className="text-yellow-500 text-sm">TM</span>
                                        </span>
                                    </div>
                                    <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col items-center justify-center shadow-sm">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Valor em Kz</span>
                                        <span className="text-2xl font-bold text-slate-900">
                                            {balanceKz.toLocaleString()} <span className="text-xs text-slate-500">Kz</span>
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsPaymentModalOpen(true)}
                                    className="mt-6 w-full py-4 bg-yellow-400 text-slate-900 font-bold rounded-2xl shadow-lg hover:bg-yellow-500 transition-all flex items-center justify-center gap-2"
                                >
                                    <CreditCard className="w-5 h-5" />
                                    Solicitar Pagamento
                                </button>
                            </div>
                        </div>

                        {/* Recent Contributions */}
                        <div className="mt-6 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Contribuições Recentes
                                </label>
                                <TrendingUp className="w-4 h-4 text-slate-400" />
                            </div>
                            <div>
                                {contributions.length > 0 ? (
                                    contributions.map((contribution, index) => (
                                        <div key={contribution.id} className={`p-4 flex items-center justify-between ${index !== contributions.length - 1 ? 'border-b border-slate-50' : ''}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${contribution.type === 'stop' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                                    {contribution.type === 'stop' ? <MapPin className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{contribution.name}</p>
                                                    <p className="text-xs text-slate-500">{contribution.type === 'stop' ? 'Nova Paragem' : 'Nova Rota'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-green-600">+{contribution.points}</p>
                                                <p className="text-xs text-slate-400">{contribution.date}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-500">
                                        Sem contribuições ainda.
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'profile' && (
                    /* Profile Info Card */
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Full Name */}
                        <div className="p-5 border-b border-slate-100">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Nome Completo
                            </label>
                            {isEditing ? (
                                <div className="grid grid-cols-2 gap-2 mt-2 w-full">
                                    <input
                                        type="text"
                                        value={editedFirstName}
                                        onChange={(e) => setEditedFirstName(e.target.value)}
                                        placeholder="Nome"
                                        className="w-full min-w-0 px-4 py-3 bg-slate-50 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    />
                                    <input
                                        type="text"
                                        value={editedLastName}
                                        onChange={(e) => setEditedLastName(e.target.value)}
                                        placeholder="Apelido"
                                        className="w-full min-w-0 px-4 py-3 bg-slate-50 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    />
                                </div>
                            ) : (
                                <p className="mt-2 text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <User className="w-5 h-5 text-slate-400" />
                                    {fullName}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="p-5 border-b border-slate-100">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Email
                            </label>
                            <p className="mt-2 text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Mail className="w-5 h-5 text-slate-400" />
                                {user.email}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">O email não pode ser alterado</p>
                        </div>

                        {/* Phone Number */}
                        <div className="p-5 border-b border-slate-100">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Número de Telefone
                            </label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={editedPhone}
                                    onChange={(e) => setEditedPhone(e.target.value)}
                                    placeholder="+244923456789"
                                    className="w-full mt-2 px-4 py-3 bg-slate-50 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            ) : (
                                <p className="mt-2 text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-slate-400" />
                                    {user.phoneNumber || 'Não definido'}
                                </p>
                            )}
                        </div>

                        {/* Verification Status */}
                        <div className="p-5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Estado de Verificação
                            </label>
                            <div className="mt-2 flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.verified ? 'bg-green-100' : 'bg-slate-100'}`}>
                                    <Shield className={`w-5 h-5 ${user.verified ? 'text-green-600' : 'text-slate-400'}`} />
                                </div>
                                <div>
                                    <p className={`font-bold ${user.verified ? 'text-green-600' : 'text-slate-500'}`}>
                                        {user.verified ? 'Verificado' : 'Não Verificado'}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {user.verified
                                            ? 'A sua conta foi verificada'
                                            : 'Complete a verificação para desbloquear recursos'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>


                )}

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-5 h-5" />
                        Terminar Sessão
                    </button>
                </div>
            </div>


            {/* Payment Modal */}
            {
                isPaymentModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2">
                                    {selectedPaymentMethod && (
                                        <button
                                            onClick={() => {
                                                setSelectedPaymentMethod(null);
                                                setSelectedAmount(null);
                                            }}
                                            className="p-1 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                    )}
                                    <h3 className="text-lg font-bold text-slate-900">
                                        {selectedPaymentMethod ? 'Escolha o Valor' : 'Solicitar Pagamento'}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsPaymentModalOpen(false);
                                        setSelectedPaymentMethod(null);
                                        setSelectedAmount(null);
                                    }}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                {!selectedPaymentMethod ? (
                                    <>
                                        <p className="text-sm text-slate-500 mb-4 font-medium">Escolha a forma de pagamento:</p>

                                        <div className="space-y-3">
                                            <label className={`flex items-center gap-4 p-3 rounded-xl border-2 cursor-pointer transition-all border-slate-100 hover:border-slate-200 hover:bg-slate-50`}>
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    className="hidden"
                                                    onChange={() => setSelectedPaymentMethod('africell')}
                                                />
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-slate-100 flex-shrink-0">
                                                    <img src="/africell.jpg" alt="Africell" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <span className="font-bold text-slate-900 block">Africell</span>
                                                    <span className="text-xs text-slate-500">Dinheiro Mobile</span>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <ChevronRight className="w-5 h-5 text-slate-400" />
                                                </div>
                                            </label>

                                            <label className={`flex items-center gap-4 p-3 rounded-xl border-2 cursor-pointer transition-all border-slate-100 hover:border-slate-200 hover:bg-slate-50`}>
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    className="hidden"
                                                    onChange={() => setSelectedPaymentMethod('unitel')}
                                                />
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-slate-100 flex-shrink-0">
                                                    <img src="/unitel.jpeg" alt="Unitel" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <span className="font-bold text-slate-900 block">Unitel</span>
                                                    <span className="text-xs text-slate-500">Unitel Money</span>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <ChevronRight className="w-5 h-5 text-slate-400" />
                                                </div>
                                            </label>

                                            <label className={`flex items-center gap-4 p-3 rounded-xl border-2 cursor-pointer transition-all border-slate-100 hover:border-slate-200 hover:bg-slate-50`}>
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    className="hidden"
                                                    onChange={() => setSelectedPaymentMethod('express')}
                                                />
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-slate-100 flex-shrink-0">
                                                    <img src="/express.png" alt="Express" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <span className="font-bold text-slate-900 block">Express</span>
                                                    <span className="text-xs text-slate-500">Pagamento Rápido</span>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <ChevronRight className="w-5 h-5 text-slate-400" />
                                                </div>
                                            </label>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3 mb-6 p-4 bg-slate-50 rounded-2xl">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-slate-200 flex-shrink-0">
                                                <img
                                                    src={selectedPaymentMethod === 'africell' ? '/africell.jpg' : selectedPaymentMethod === 'unitel' ? '/unitel.jpeg' : '/express.png'}
                                                    alt={selectedPaymentMethod}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Operadora</p>
                                                <p className="font-bold text-slate-900 capitalize">{selectedPaymentMethod}</p>
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-500 mb-4 font-medium">Selecione o plano ou valor:</p>

                                        <div className="space-y-2">
                                            {rechargeOptions[selectedPaymentMethod].map((option) => (
                                                <label
                                                    key={option.value}
                                                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAmount === option.value
                                                            ? 'border-yellow-400 bg-yellow-50 shadow-sm'
                                                            : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="amount"
                                                        className="hidden"
                                                        checked={selectedAmount === option.value}
                                                        onChange={() => setSelectedAmount(option.value)}
                                                    />
                                                    <div>
                                                        <span className="font-bold text-slate-900 block">{option.label}</span>
                                                        {option.description && (
                                                            <span className="text-xs text-slate-500 mt-0.5 block">{option.description}</span>
                                                        )}
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAmount === option.value ? 'border-yellow-500' : 'border-slate-300'}`}>
                                                        {selectedAmount === option.value && <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="p-6 pt-0 flex gap-3 shrink-0">
                                <button
                                    onClick={() => {
                                        if (selectedPaymentMethod) {
                                            setSelectedPaymentMethod(null);
                                            setSelectedAmount(null);
                                        } else {
                                            setIsPaymentModalOpen(false);
                                        }
                                    }}
                                    className="flex-1 py-3 text-slate-600 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    {selectedPaymentMethod ? 'Voltar' : 'Cancelar'}
                                </button>
                                <button
                                    onClick={handlePaymentRequest}
                                    disabled={!selectedPaymentMethod || !selectedAmount}
                                    className="flex-1 py-3 text-slate-900 font-bold bg-yellow-400 rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-200"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
