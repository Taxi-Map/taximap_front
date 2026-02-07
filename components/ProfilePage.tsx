'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Check, Phone, User, Shield, Edit2, Mail, LogOut, Loader2, X, AlertTriangle } from 'lucide-react';
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

                {/* Profile Info Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
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
        </div>
    );
}
