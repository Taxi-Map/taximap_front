import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Shield, MapPin, Route, Check, X, Loader2,
    Clock, CreditCard, AlertTriangle, RefreshCw, Ban,
    Users, Search, ChevronUp, ChevronDown, Crown, UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { routeService, PendingStopResponse, PendingLineResponse } from '../services/routeService';
import { authService, AuthUser, Pagamento } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

type Tab = 'pendentes' | 'historico' | 'pagamentos' | 'utilizadores';

interface ApprovalHistoryItem {
    id: number;
    type: 'paragem' | 'linha';
    name: string;
    action: 'aprovada' | 'rejeitada';
    date: string;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    admin: { label: 'Admin', color: 'text-amber-700', bg: 'bg-amber-100', icon: <Crown className="w-3 h-3" /> },
    staff: { label: 'Staff', color: 'text-indigo-700', bg: 'bg-indigo-100', icon: <UserCheck className="w-3 h-3" /> },
    user: { label: 'Utilizador', color: 'text-slate-600', bg: 'bg-slate-100', icon: null },
};

export default function AdminPanelPage() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('pendentes');

    // Pending state
    const [pendingStops, setPendingStops] = useState<PendingStopResponse[]>([]);
    const [pendingLines, setPendingLines] = useState<PendingLineResponse[]>([]);
    const [loadingPending, setLoadingPending] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // History state
    const [approvalHistory, setApprovalHistory] = useState<ApprovalHistoryItem[]>([]);

    // Payments state
    const [payments, setPayments] = useState<Pagamento[]>([]);
    const [loadingPayments, setLoadingPayments] = useState(true);

    // Users state
    const [allUsers, setAllUsers] = useState<AuthUser[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [totalUsers, setTotalUsers] = useState(0);
    const [userSearch, setUserSearch] = useState('');
    const [roleMenuOpen, setRoleMenuOpen] = useState<string | null>(null);

    // Check admin/staff access
    useEffect(() => {
        if (!authLoading && (!user || (user.role !== 'admin' && user.role !== 'staff'))) {
            navigate('/map');
        }
    }, [user, authLoading, navigate]);

    // Fetch pending items
    const fetchPending = useCallback(async () => {
        setLoadingPending(true);
        try {
            const [stops, lines] = await Promise.all([
                routeService.getPendingStops(),
                routeService.getPendingLines()
            ]);
            setPendingStops(stops || []);
            setPendingLines(lines || []);
        } catch (error) {
            console.error('Error fetching pending items:', error);
        } finally {
            setLoadingPending(false);
        }
    }, []);

    // Fetch payments
    const fetchPayments = useCallback(async () => {
        setLoadingPayments(true);
        try {
            const result = await authService.getAllPaymentRequests(1, 50);
            setPayments(result?.dados || []);
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoadingPayments(false);
        }
    }, []);

    // Fetch users
    const fetchUsers = useCallback(async (search = '') => {
        setLoadingUsers(true);
        try {
            const result = await authService.getAllUsers(1, 100, search);
            setAllUsers(result?.dados || []);
            setTotalUsers(result?.total || 0);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoadingUsers(false);
        }
    }, []);

    useEffect(() => {
        fetchPending();
        fetchPayments();
        fetchUsers();
    }, [fetchPending, fetchPayments, fetchUsers]);

    // Debounced user search
    useEffect(() => {
        const timer = setTimeout(() => fetchUsers(userSearch), 400);
        return () => clearTimeout(timer);
    }, [userSearch, fetchUsers]);

    // ===== ACTIONS =====

    const handleApproveStop = async (id: number, name: string) => {
        setActionLoading(`stop-approve-${id}`);
        const success = await routeService.approveStop(id);
        if (success) {
            toast.success(`Paragem "${name}" aprovada`);
            setApprovalHistory(prev => [{ id, type: 'paragem', name, action: 'aprovada', date: new Date().toISOString() }, ...prev]);
            setPendingStops(prev => prev.filter(s => s.paragem.id !== id));
        } else {
            toast.error(`Erro ao aprovar paragem "${name}"`);
        }
        setActionLoading(null);
    };

    const handleRejectStop = async (id: number, name: string) => {
        setActionLoading(`stop-reject-${id}`);
        const success = await routeService.rejectStop(id);
        if (success) {
            toast.success(`Paragem "${name}" rejeitada`);
            setApprovalHistory(prev => [{ id, type: 'paragem', name, action: 'rejeitada', date: new Date().toISOString() }, ...prev]);
            setPendingStops(prev => prev.filter(s => s.paragem.id !== id));
        } else {
            toast.error(`Erro ao rejeitar paragem "${name}"`);
        }
        setActionLoading(null);
    };

    const handleApproveLine = async (id: number, name: string) => {
        setActionLoading(`line-approve-${id}`);
        const success = await routeService.approveLine(id);
        if (success) {
            toast.success(`Linha "${name}" aprovada`);
            setApprovalHistory(prev => [{ id, type: 'linha', name, action: 'aprovada', date: new Date().toISOString() }, ...prev]);
            setPendingLines(prev => prev.filter(l => l.linha.id !== id));
        } else {
            toast.error(`Erro ao aprovar linha "${name}"`);
        }
        setActionLoading(null);
    };

    const handleRejectLine = async (id: number, name: string) => {
        setActionLoading(`line-reject-${id}`);
        const success = await routeService.rejectLine(id);
        if (success) {
            toast.success(`Linha "${name}" rejeitada`);
            setApprovalHistory(prev => [{ id, type: 'linha', name, action: 'rejeitada', date: new Date().toISOString() }, ...prev]);
            setPendingLines(prev => prev.filter(l => l.linha.id !== id));
        } else {
            toast.error(`Erro ao rejeitar linha "${name}"`);
        }
        setActionLoading(null);
    };

    const handleProcessPayment = async (payment: Pagamento) => {
        setActionLoading(`pay-process-${payment._id}`);
        const success = await authService.processPayment(payment._id);
        if (success) {
            toast.success(`Pagamento de ${payment.valorKz} Kz via ${payment.metodo.toUpperCase()} processado!`);
            setPayments(prev => prev.map(p => p._id === payment._id ? { ...p, status: 'processado' as const } : p));
        } else {
            toast.error('Erro ao processar pagamento');
        }
        setActionLoading(null);
    };

    const handleCancelPayment = async (payment: Pagamento) => {
        setActionLoading(`pay-cancel-${payment._id}`);
        const success = await authService.cancelPayment(payment._id);
        if (success) {
            toast.success('Pagamento cancelado. TM Coins devolvidos ao utilizador.');
            setPayments(prev => prev.map(p => p._id === payment._id ? { ...p, status: 'cancelado' as const } : p));
        } else {
            toast.error('Erro ao cancelar pagamento');
        }
        setActionLoading(null);
    };

    const handleChangeRole = async (targetUser: AuthUser, novoRole: 'user' | 'staff' | 'admin') => {
        if (targetUser._id === user?._id) {
            toast.error('Não podes alterar o teu próprio papel');
            return;
        }
        setActionLoading(`role-${targetUser._id}`);
        const success = await authService.changeUserRole(targetUser._id, novoRole);
        if (success) {
            toast.success(`${targetUser.firstName} agora é ${ROLE_CONFIG[novoRole].label}`);
            setAllUsers(prev => prev.map(u => u._id === targetUser._id ? { ...u, role: novoRole } : u));
        } else {
            toast.error('Erro ao alterar papel do utilizador');
        }
        setActionLoading(null);
        setRoleMenuOpen(null);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-yellow-500" />
            </div>
        );
    }

    const isAdmin = user?.role === 'admin';

    const tabs: { key: Tab; label: string; icon: React.ReactNode; badge?: number; adminOnly?: boolean }[] = [
        {
            key: 'pendentes', label: 'Pendentes', icon: <Clock className="w-4 h-4" />,
            badge: pendingStops.length + pendingLines.length
        },
        { key: 'historico', label: 'Histórico', icon: <Check className="w-4 h-4" />, badge: approvalHistory.length },
        {
            key: 'pagamentos', label: 'Pagamentos', icon: <CreditCard className="w-4 h-4" />,
            badge: payments.filter(p => p.status === 'pendente').length, adminOnly: true
        },
        {
            key: 'utilizadores', label: 'Utilizadores', icon: <Users className="w-4 h-4" />,
            badge: totalUsers, adminOnly: true
        },
    ];

    const visibleTabs = isAdmin ? tabs : tabs.filter(t => !t.adminOnly);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button onClick={() => navigate('/map')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                            <Shield className="w-4 h-4 text-amber-700" />
                        </div>
                        <h1 className="text-lg font-bold text-slate-900">Painel Admin</h1>
                    </div>
                    <button
                        onClick={() => { fetchPending(); fetchPayments(); fetchUsers(); }}
                        className="ml-auto p-2 hover:bg-slate-100 rounded-full transition-colors"
                        title="Actualizar"
                    >
                        <RefreshCw className="w-4 h-4 text-slate-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="max-w-4xl mx-auto px-4 flex gap-1 overflow-x-auto no-scrollbar">
                    {visibleTabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-1.5 px-3 md:px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === tab.key
                                ? 'border-amber-500 text-amber-700 bg-amber-50/50'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            {tab.icon}
                            <span className="hidden sm:inline">{tab.label}</span>
                            {tab.badge !== undefined && tab.badge > 0 && (
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.key ? 'bg-amber-200 text-amber-800' : 'bg-slate-200 text-slate-600'
                                    }`}>{tab.badge}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-6">

                {/* ===== TAB: PENDENTES ===== */}
                {activeTab === 'pendentes' && (
                    <div className="space-y-6">
                        {/* Pending Stops */}
                        <div>
                            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> Paragens Pendentes
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{pendingStops.length}</span>
                            </h2>
                            {loadingPending ? (
                                <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
                                    <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
                                </div>
                            ) : pendingStops.length === 0 ? (
                                <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 text-slate-400">
                                    Nenhuma paragem pendente 🎉
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {pendingStops.map(item => (
                                        <div key={item.paragem.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                        <MapPin className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-900 truncate">{item.paragem.nome}</p>
                                                        <p className="text-xs text-slate-400">
                                                            {item.paragem.latitude?.toFixed(4)}, {item.paragem.longitude?.toFixed(4)}
                                                            {item.metadata?.criadoEm && ` • ${new Date(item.metadata.criadoEm).toLocaleDateString('pt-AO')}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <button onClick={() => handleApproveStop(item.paragem.id, item.paragem.nome)} disabled={!!actionLoading} className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1">
                                                        {actionLoading === `stop-approve-${item.paragem.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                                        Aprovar
                                                    </button>
                                                    <button onClick={() => handleRejectStop(item.paragem.id, item.paragem.nome)} disabled={!!actionLoading} className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1">
                                                        {actionLoading === `stop-reject-${item.paragem.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                                                        Rejeitar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pending Lines */}
                        <div>
                            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Route className="w-4 h-4" /> Linhas Pendentes
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{pendingLines.length}</span>
                            </h2>
                            {loadingPending ? (
                                <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
                                    <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
                                </div>
                            ) : pendingLines.length === 0 ? (
                                <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 text-slate-400">
                                    Nenhuma linha pendente 🎉
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {pendingLines.map(item => (
                                        <div key={item.linha.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                        <Route className="w-5 h-5 text-purple-600" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-900 truncate">{item.linha.nome}</p>
                                                        <p className="text-xs text-slate-400">
                                                            {item.linha.descricao}
                                                            {item.percurso && ` • ${item.percurso.length} paragens`}
                                                            {item.metadata?.criadoEm && ` • ${new Date(item.metadata.criadoEm).toLocaleDateString('pt-AO')}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <button onClick={() => handleApproveLine(item.linha.id, item.linha.nome)} disabled={!!actionLoading} className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1">
                                                        {actionLoading === `line-approve-${item.linha.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                                        Aprovar
                                                    </button>
                                                    <button onClick={() => handleRejectLine(item.linha.id, item.linha.nome)} disabled={!!actionLoading} className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1">
                                                        {actionLoading === `line-reject-${item.linha.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                                                        Rejeitar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ===== TAB: HISTÓRICO ===== */}
                {activeTab === 'historico' && (
                    <div>
                        {approvalHistory.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-400 font-semibold">Sem histórico de aprovações nesta sessão</p>
                                <p className="text-xs text-slate-300 mt-1">O histórico aparece aqui conforme aprovas ou rejeitas itens</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {approvalHistory.map((item, idx) => (
                                    <div key={`${item.id}-${idx}`} className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.action === 'aprovada' ? 'bg-green-100' : 'bg-red-100'}`}>
                                            {item.action === 'aprovada' ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-600" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-900 text-sm truncate">{item.name}</p>
                                            <p className="text-xs text-slate-400">
                                                {item.type === 'paragem' ? '📍 Paragem' : '🛤️ Linha'} •{' '}
                                                <span className={item.action === 'aprovada' ? 'text-green-600' : 'text-red-600'}>{item.action}</span>
                                                {' '}• {new Date(item.date).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ===== TAB: PAGAMENTOS ===== */}
                {activeTab === 'pagamentos' && isAdmin && (
                    <div>
                        {loadingPayments ? (
                            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
                                <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
                            </div>
                        ) : payments.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                                <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-400 font-semibold">Sem solicitações de pagamento</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {payments.map(payment => (
                                    <div key={payment._id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${payment.status === 'pendente' ? 'bg-amber-100' : payment.status === 'processado' ? 'bg-green-100' : 'bg-red-100'}`}>
                                                    <CreditCard className={`w-5 h-5 ${payment.status === 'pendente' ? 'text-amber-600' : payment.status === 'processado' ? 'text-green-600' : 'text-red-600'}`} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-900">{payment.valorKz} Kz via {payment.metodo.toUpperCase()}</p>
                                                    <p className="text-xs text-slate-400">📱 {payment.telefone} • {payment.tmCoinsDebitados} TM Coins</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${payment.status === 'pendente' ? 'bg-amber-100 text-amber-700' : payment.status === 'processado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {payment.status}
                                                        </span>
                                                        <span className="text-xs text-slate-300">{new Date(payment.createdAt).toLocaleDateString('pt-AO')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {payment.status === 'pendente' && (
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <button onClick={() => handleProcessPayment(payment)} disabled={!!actionLoading} className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1">
                                                        {actionLoading === `pay-process-${payment._id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                                        Processar
                                                    </button>
                                                    <button onClick={() => handleCancelPayment(payment)} disabled={!!actionLoading} className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1">
                                                        {actionLoading === `pay-cancel-${payment._id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
                                                        Cancelar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ===== TAB: UTILIZADORES ===== */}
                {activeTab === 'utilizadores' && isAdmin && (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                                <p className="text-3xl font-black text-slate-900">{totalUsers}</p>
                                <p className="text-xs font-semibold text-slate-400 mt-1">Total Utilizadores</p>
                            </div>
                            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                                <p className="text-3xl font-black text-amber-600">{allUsers.filter(u => u.role === 'admin').length}</p>
                                <p className="text-xs font-semibold text-slate-400 mt-1">Admins</p>
                            </div>
                            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                                <p className="text-3xl font-black text-indigo-600">{allUsers.filter(u => u.role === 'staff').length}</p>
                                <p className="text-xs font-semibold text-slate-400 mt-1">Staff</p>
                            </div>
                            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                                <p className="text-3xl font-black text-slate-500">{allUsers.filter(u => u.role === 'user').length}</p>
                                <p className="text-xs font-semibold text-slate-400 mt-1">Utilizadores</p>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={userSearch}
                                onChange={e => setUserSearch(e.target.value)}
                                placeholder="Pesquisar por nome ou email..."
                                className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
                            />
                        </div>

                        {/* User List */}
                        {loadingUsers ? (
                            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
                                <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
                            </div>
                        ) : allUsers.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                                <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-400 font-semibold">Nenhum utilizador encontrado</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {allUsers.map(u => {
                                    const roleConfig = ROLE_CONFIG[u.role] || ROLE_CONFIG.user;
                                    const isSelf = u._id === user?._id;
                                    return (
                                        <div key={u._id} className={`bg-white rounded-xl p-4 border transition-shadow ${isSelf ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100'} hover:shadow-sm`}>
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    {u.picture ? (
                                                        <img src={u.picture} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <span className="text-sm font-bold text-slate-500">
                                                                {u.firstName?.[0]}{u.lastName?.[0]}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-bold text-slate-900 text-sm truncate">
                                                                {u.firstName} {u.lastName}
                                                            </p>
                                                            {isSelf && <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full font-bold">TU</span>}
                                                        </div>
                                                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-1 ${roleConfig.bg} ${roleConfig.color}`}>
                                                                {roleConfig.icon}
                                                                {roleConfig.label}
                                                            </span>
                                                            <span className="text-[10px] text-slate-300">
                                                                🪙 {u.tmCoins || 0} TM • {u.totalContribuicoes || 0} contrib.
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Role Change Dropdown — Admin only, not for self */}
                                                {!isSelf && (
                                                    <div className="relative flex-shrink-0">
                                                        <button
                                                            onClick={() => setRoleMenuOpen(roleMenuOpen === u._id ? null : u._id)}
                                                            disabled={!!actionLoading}
                                                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1"
                                                        >
                                                            {actionLoading === `role-${u._id}` ? (
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                <>Alterar Papel {roleMenuOpen === u._id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}</>
                                                            )}
                                                        </button>
                                                        {roleMenuOpen === u._id && (
                                                            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-20">
                                                                {(['admin', 'staff', 'user'] as const).map(role => {
                                                                    const rc = ROLE_CONFIG[role];
                                                                    const isCurrent = u.role === role;
                                                                    return (
                                                                        <button
                                                                            key={role}
                                                                            onClick={() => !isCurrent && handleChangeRole(u, role)}
                                                                            className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center gap-2 ${isCurrent ? 'bg-slate-50 text-slate-400 cursor-default' : 'hover:bg-slate-50 text-slate-700'}`}
                                                                        >
                                                                            <span className={`w-5 h-5 rounded flex items-center justify-center ${rc.bg}`}>
                                                                                {rc.icon || <span className="text-[10px]">U</span>}
                                                                            </span>
                                                                            {rc.label}
                                                                            {isCurrent && <Check className="w-3 h-3 ml-auto text-green-500" />}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
