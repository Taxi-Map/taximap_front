'use client';

import React, { useState } from 'react';
import { ArrowLeft, Camera, Check, Phone, User, Shield, Edit2 } from 'lucide-react';

interface UserProfile {
    photoUrl: string;
    fullName: string;
    phoneNumber: string;
    isVerified: boolean;
}

export default function ProfilePage() {
    // Mock user data - replace with actual data from your auth/backend
    const [profile, setProfile] = useState<UserProfile>({
        photoUrl: '',
        fullName: 'João Silva',
        phoneNumber: '+244 923 456 789',
        isVerified: true
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(profile.fullName);
    const [editedPhone, setEditedPhone] = useState(profile.phoneNumber);

    const handleSave = () => {
        setProfile({
            ...profile,
            fullName: editedName,
            phoneNumber: editedPhone
        });
        setIsEditing(false);
    };

    const handlePhotoChange = () => {
        // TODO: Implement photo upload
        console.log('Photo upload clicked');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
                    <a href="/map" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-900" />
                    </a>
                    <h1 className="text-lg font-bold text-slate-900">Meu Perfil</h1>
                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        {isEditing ? (
                            <Check className="w-6 h-6 text-green-600" />
                        ) : (
                            <Edit2 className="w-6 h-6 text-slate-600" />
                        )}
                    </button>
                </div>
            </div>

            {/* Profile Content */}
            <div className="max-w-lg mx-auto px-4 py-8">
                {/* Profile Photo Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                            {profile.photoUrl ? (
                                <img
                                    src={profile.photoUrl}
                                    alt={profile.fullName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-16 h-16 text-slate-400" />
                            )}
                        </div>
                        {/* Camera button for photo change */}
                        <button
                            onClick={handlePhotoChange}
                            className="absolute bottom-0 right-0 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-500 transition-colors"
                        >
                            <Camera className="w-5 h-5 text-slate-900" />
                        </button>
                    </div>

                    {/* Verified Badge */}
                    {profile.isVerified && (
                        <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full">
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
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="w-full mt-2 px-4 py-3 bg-slate-50 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        ) : (
                            <p className="mt-2 text-lg font-bold text-slate-900 flex items-center gap-2">
                                <User className="w-5 h-5 text-slate-400" />
                                {profile.fullName}
                            </p>
                        )}
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
                                className="w-full mt-2 px-4 py-3 bg-slate-50 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        ) : (
                            <p className="mt-2 text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Phone className="w-5 h-5 text-slate-400" />
                                {profile.phoneNumber}
                            </p>
                        )}
                    </div>

                    {/* Verification Status */}
                    <div className="p-5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Estado de Verificação
                        </label>
                        <div className="mt-2 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${profile.isVerified ? 'bg-green-100' : 'bg-slate-100'}`}>
                                <Shield className={`w-5 h-5 ${profile.isVerified ? 'text-green-600' : 'text-slate-400'}`} />
                            </div>
                            <div>
                                <p className={`font-bold ${profile.isVerified ? 'text-green-600' : 'text-slate-500'}`}>
                                    {profile.isVerified ? 'Verificado' : 'Não Verificado'}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {profile.isVerified
                                        ? 'A sua conta foi verificada'
                                        : 'Complete a verificação para desbloquear recursos'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                    {!profile.isVerified && (
                        <button className="w-full bg-yellow-400 text-slate-900 py-4 rounded-2xl font-bold text-lg hover:bg-yellow-500 transition-all shadow-lg">
                            Verificar Conta
                        </button>
                    )}
                    <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg">
                        Terminar Sessão
                    </button>
                </div>
            </div>
        </div>
    );
}
