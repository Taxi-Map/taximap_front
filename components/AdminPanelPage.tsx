import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    ArrowLeft, Shield, MapPin, Route, Check, X, Loader2,
    Clock, CreditCard, AlertTriangle, RefreshCw, Ban,
    Users, Search, ChevronUp, ChevronDown, Crown, UserCheck, Coins
} from 'lucide-react';
import { routeService, PendingStopResponse, PendingLineResponse } from '../services/routeService';
import { authService, AuthUser, Pagamento } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Tabs } from './ui/Tabs';
import { Card } from './ui/Card';
import { Skeleton, SkeletonCardItem, SkeletonStatCard } from './ui/Skeleton';

type Tab = 'pendentes' | 'historico' | 'pagamentos' | 'utilizadores';

interface ApprovalHistoryItem {
    id: number;
    type: 'paragem' | 'linha';
    name: string;
    action: 'aprovada' | 'rejeitada';
    date: string;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    admin: { label: 'Admin', color: 'text-amber-dark', bg: 'bg-amber-light', icon: <Crown className="w-3 h-3" /> },
    staff: { label: 'Staff', color: 'text-blue-atlantic', bg: 'bg-blue-horizon/20', icon: <UserCheck className="w-3 h-3" /> },
    user: { label: 'Utilizador', color: 'text-slate-mid', bg: 'bg-slate-100', icon: null },
};

export default function AdminPanelPage() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('pendentes');

    const [pendingStops, setPendingStops] = useState<PendingStopResponse[]>([]);
    const [pendingLines, setPendingLines] = useState<PendingLineResponse[]>([]);
    const [loadingPending, setLoadingPending] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const [approvalHistory, setApprovalHistory] = useState<ApprovalHistoryItem[]>([]);

    const [payments, setPayments] = useState<Pagamento[]>([]);
    const [loadingPayments, setLoadingPayments] = useState(true);

    const [allUsers, setAllUsers] = useState<AuthUser[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [totalUsers, setTotalUsers] = useState(0);
    const [userSearch, setUserSearch] = useState('');
    const [roleMenuOpen, setRoleMenuOpen] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && (!user || (user.role !== 'admin' && user.role !== 'staff'))) {
            navigate('/map');
        }
    }, [user, authLoading, navigate]);

    const fetchPending = useCallback(async () => {
        setLoadingPending(true);
        try {
            const [stops, lines] = await Promise.all([routeService.getPendingStops(), routeService.getPendingLines()]);
            setPendingStops(stops || []);
            setPendingLines(lines || []);
        } catch (error) { console.error('Error fetching pending items:', error); }
        finally { setLoadingPending(false); }
    }, []);

    const fetchPayments = useCallback(async () => {
        setLoadingPayments(true);
        try { const result = await authService.getAllPaymentRequests(1, 50); setPayments(result?.dados || []); }
        catch (error) { console.error('Error fetching payments:', error); }
        finally { setLoadingPayments(false); }
    }, []);

    const fetchUsers = useCallback(async (search = '') => {
        setLoadingUsers(true);
        try { const result = await authService.getAllUsers(1, 100, search); setAllUsers(result?.dados || []); setTotalUsers(result?.total || 0); }
        catch (error) { console.error('Error fetching users:', error); }
        finally { setLoadingUsers(false); }
    }, []);

    useEffect(() => { fetchPending(); fetchPayments(); fetchUsers(); }, [fetchPending, fetchPayments, fetchUsers]);

    useEffect(() => { const timer = setTimeout(() => fetchUsers(userSearch), 400); return () => clearTimeout(timer); }, [userSearch, fetchUsers]);

    const handleApproveStop = async (id: number, name: string) => {
        setActionLoading(`stop-approve-${id}`);
        const success = await routeService.approveStop(id);
        if (success) { toast.success(`Paragem "${name}" aprovada`); setApprovalHistory(prev => [{ id, type: 'paragem', name, action: 'aprovada', date: new Date().toISOString() }, ...prev]); setPendingStops(prev => prev.filter(s => s.paragem.id !== id)); }
        else { toast.error(`Erro ao aprovar paragem "${name}"`); }
        setActionLoading(null);
    };

    const handleRejectStop = async (id: number, name: string) => {
        setActionLoading(`stop-reject-${id}`);
        const success = await routeService.rejectStop(id);
        if (success) { toast.success(`Paragem "${name}" rejeitada`); setApprovalHistory(prev => [{ id, type: 'paragem', name, action: 'rejeitada', date: new Date().toISOString() }, ...prev]); setPendingStops(prev => prev.filter(s => s.paragem.id !== id)); }
        else { toast.error(`Erro ao rejeitar paragem "${name}"`); }
        setActionLoading(null);
    };

    const handleApproveLine = async (id: number, name: string) => {
        setActionLoading(`line-approve-${id}`);
        const success = await routeService.approveLine(id);
        if (success) { toast.success(`Linha "${name}" aprovada`); setApprovalHistory(prev => [{ id, type: 'linha', name, action: 'aprovada', date: new Date().toISOString() }, ...prev]); setPendingLines(prev => prev.filter(l => l.linha.id !== id)); }
        else { toast.error(`Erro ao aprovar linha "${name}"`); }
        setActionLoading(null);
    };

    const handleRejectLine = async (id: number, name: string) => {
        setActionLoading(`line-reject-${id}`);
        const success = await routeService.rejectLine(id);
        if (success) { toast.success(`Linha "${name}" rejeitada`); setApprovalHistory(prev => [{ id, type: 'linha', name, action: 'rejeitada', date: new Date().toISOString() }, ...prev]); setPendingLines(prev => prev.filter(l => l.linha.id !== id)); }
        else { toast.error(`Erro ao rejeitar linha "${name}"`); }
        setActionLoading(null);
    };

    const handleProcessPayment = async (payment: Pagamento) => {
        setActionLoading(`pay-process-${payment._id}`);
        const success = await authService.processPayment(payment._id);
        if (success) { toast.success(`Pagamento de ${payment.valorKz} Kz via ${payment.metodo.toUpperCase()} processado!`); setPayments(prev => prev.map(p => p._id === payment._id ? { ...p, status: 'processado' as const } : p)); }
        else { toast.error('Erro ao processar pagamento'); }
        setActionLoading(null);
    };

    const handleCancelPayment = async (payment: Pagamento) => {
        setActionLoading(`pay-cancel-${payment._id}`);
        const success = await authService.cancelPayment(payment._id);
        if (success) { toast.success('Pagamento cancelado. TM Coins devolvidos.'); setPayments(prev => prev.map(p => p._id === payment._id ? { ...p, status: 'cancelado' as const } : p)); }
        else { toast.error('Erro ao cancelar pagamento'); }
        setActionLoading(null);
    };

    const handleChangeRole = async (targetUser: AuthUser, novoRole: 'user' | 'staff' | 'admin') => {
        if (targetUser._id === user?._id) { toast.error('Não podes alterar o teu próprio papel'); return; }
        setActionLoading(`role-${targetUser._id}`);
        const success = await authService.changeUserRole(targetUser._id, novoRole);
        if (success) { toast.success(`${targetUser.firstName} agora é ${ROLE_CONFIG[novoRole].label}`); setAllUsers(prev => prev.map(u => u._id === targetUser._id ? { ...u, role: novoRole } : u)); }
        else { toast.error('Erro ao alterar papel do utilizador'); }
        setActionLoading(null);
        setRoleMenuOpen(null);
    };

    if (authLoading) {
        return <div className="min-h-screen bg-sand flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-atlantic" /></div>;
    }

    const isAdmin = user?.role === 'admin';

    return (
        <div className="min-h-screen bg-sand">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button onClick={() => navigate('/map')} className="p-2 hover:bg-sand rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-storm" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-horizon/20 rounded-xl flex items-center justify-center">
                            <Shield className="w-4 h-4 text-blue-atlantic" />
                        </div>
                        <h1 className="text-lg font-bold text-storm">Painel Admin</h1>
                    </div>
                    <button onClick={() => { fetchPending(); fetchPayments(); fetchUsers(); }}
                        className="ml-auto p-2 hover:bg-sand rounded-full transition-colors" title="Actualizar">
                        <RefreshCw className="w-4 h-4 text-slate-mid" />
                    </button>
                </div>

                <div className="max-w-4xl mx-auto px-4">
                    <Tabs
                        tabs={[
                            { key: 'pendentes', label: 'Pendentes', icon: <Clock className="w-4 h-4" />, badge: pendingStops.length + pendingLines.length },
                            { key: 'historico', label: 'Histórico', icon: <Check className="w-4 h-4" />, badge: approvalHistory.length },
                            { key: 'pagamentos', label: 'Pagamentos', icon: <CreditCard className="w-4 h-4" />, badge: payments.filter(p => p.status === 'pendente').length },
                            { key: 'utilizadores', label: 'Utilizadores', icon: <Users className="w-4 h-4" />, badge: totalUsers },
                        ].filter(t => isAdmin || t.key !== 'pagamentos' && t.key !== 'utilizadores')}
                        activeTab={activeTab}
                        onChange={(key) => setActiveTab(key as Tab)}
                    />
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                {activeTab === 'pendentes' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-sm font-bold text-slate-mid uppercase tracking-wider mb-3 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> Paragens Pendentes
                                <span className="text-xs bg-blue-horizon/20 text-blue-atlantic px-2 py-0.5 rounded-full">{pendingStops.length}</span>
                            </h2>
                            {loadingPending ? (
                                <SkeletonCardItem count={3} />
                            ) : pendingStops.length === 0 ? (
                                <Card className="text-center text-slate-mid py-12">Nenhuma paragem pendente</Card>
                            ) : (
                                <div className="space-y-3">
                                    {pendingStops.map(item => (
                                        <Card key={item.paragem.id} hover>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-10 h-10 bg-blue-horizon/20 rounded-xl flex items-center justify-center shrink-0">
                                                        <MapPin className="w-5 h-5 text-blue-atlantic" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-storm truncate">{item.paragem.nome}</p>
                                                        <p className="text-xs text-slate-light">
                                                            {item.paragem.latitude?.toFixed(4)}, {item.paragem.longitude?.toFixed(4)}
                                                            {item.metadata?.criadoEm && ` • ${new Date(item.metadata.criadoEm).toLocaleDateString('pt-AO')}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 shrink-0">
                                                    <Button size="sm" variant="primary" icon={actionLoading === `stop-approve-${item.paragem.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                                        onClick={() => handleApproveStop(item.paragem.id, item.paragem.nome)} disabled={!!actionLoading}>Aprovar</Button>
                                                    <Button size="sm" variant="danger" icon={actionLoading === `stop-reject-${item.paragem.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                                                        onClick={() => handleRejectStop(item.paragem.id, item.paragem.nome)} disabled={!!actionLoading}>Rejeitar</Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <h2 className="text-sm font-bold text-slate-mid uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Route className="w-4 h-4" /> Linhas Pendentes
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{pendingLines.length}</span>
                            </h2>
                            {loadingPending ? (
                                <SkeletonCardItem count={3} />
                            ) : pendingLines.length === 0 ? (
                                <Card className="text-center text-slate-mid py-12">Nenhuma linha pendente</Card>
                            ) : (
                                <div className="space-y-3">
                                    {pendingLines.map(item => (
                                        <Card key={item.linha.id} hover>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                                                        <Route className="w-5 h-5 text-purple-700" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-storm truncate">{item.linha.nome}</p>
                                                        <p className="text-xs text-slate-light">
                                                            {item.linha.descricao}
                                                            {item.percurso && ` • ${item.percurso.length} paragens`}
                                                            {item.metadata?.criadoEm && ` • ${new Date(item.metadata.criadoEm).toLocaleDateString('pt-AO')}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 shrink-0">
                                                    <Button size="sm" variant="primary" icon={actionLoading === `line-approve-${item.linha.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                                        onClick={() => handleApproveLine(item.linha.id, item.linha.nome)} disabled={!!actionLoading}>Aprovar</Button>
                                                    <Button size="sm" variant="danger" icon={actionLoading === `line-reject-${item.linha.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                                                        onClick={() => handleRejectLine(item.linha.id, item.linha.nome)} disabled={!!actionLoading}>Rejeitar</Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'historico' && (
                    <div>
                        {approvalHistory.length === 0 ? (
                            <Card className="text-center py-12">
                                <Clock className="w-10 h-10 text-slate-light mx-auto mb-3" />
                                <p className="text-slate-mid font-bold">Sem histórico de aprovações nesta sessão</p>
                                <p className="text-xs text-slate-light mt-1">O histórico aparece aqui conforme aprovas ou rejeitas itens</p>
                            </Card>
                        ) : (
                            <div className="space-y-2">
                                {approvalHistory.map((item, idx) => (
                                    <Card key={`${item.id}-${idx}`} padding="sm">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.action === 'aprovada' ? 'bg-success-bg' : 'bg-error-bg'}`}>
                                                {item.action === 'aprovada' ? <Check className="w-4 h-4 text-success" /> : <X className="w-4 h-4 text-error" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-storm text-sm truncate">{item.name}</p>
                                                <p className="text-xs text-slate-light">
                                                    {item.type === 'paragem' ? '📍 Paragem' : '🛤️ Linha'} • <span className={item.action === 'aprovada' ? 'text-success' : 'text-error'}>{item.action}</span>
                                                    {' • '}{new Date(item.date).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'pagamentos' && isAdmin && (
                    <div>
                        {loadingPayments ? (
                            <SkeletonCardItem count={3} />
                        ) : payments.length === 0 ? (
                            <Card className="text-center py-12">
                                <CreditCard className="w-10 h-10 text-slate-light mx-auto mb-3" />
                                <p className="text-slate-mid font-bold">Sem solicitações de pagamento</p>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {payments.map(payment => (
                                    <Card key={payment._id} hover>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                    payment.status === 'pendente' ? 'bg-amber-light' : payment.status === 'processado' ? 'bg-success-bg' : 'bg-error-bg'
                                                }`}>
                                                    <CreditCard className={`w-5 h-5 ${
                                                        payment.status === 'pendente' ? 'text-amber-dark' : payment.status === 'processado' ? 'text-success' : 'text-error'
                                                    }`} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-storm">{payment.valorKz} Kz via {payment.metodo.toUpperCase()}</p>
                                                    <p className="text-xs text-slate-light">📱 {payment.telefone} • {payment.tmCoinsDebitados} TM Coins</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge color={payment.status === 'pendente' ? 'amber' : payment.status === 'processado' ? 'green' : 'red'} size="sm">{payment.status}</Badge>
                                                        <span className="text-xs text-slate-light">{new Date(payment.createdAt).toLocaleDateString('pt-AO')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {payment.status === 'pendente' && (
                                                <div className="flex gap-2 shrink-0">
                                                    <Button size="sm" variant="primary" icon={actionLoading === `pay-process-${payment._id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                                        onClick={() => handleProcessPayment(payment)} disabled={!!actionLoading}>Processar</Button>
                                                    <Button size="sm" variant="secondary" icon={actionLoading === `pay-cancel-${payment._id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
                                                        onClick={() => handleCancelPayment(payment)} disabled={!!actionLoading}>Cancelar</Button>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'utilizadores' && isAdmin && (
                    <div className="space-y-6">
                        {loadingUsers ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <SkeletonStatCard />
                                <SkeletonStatCard />
                                <SkeletonStatCard />
                                <SkeletonStatCard />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <Card className="text-center">
                                    <p className="text-3xl font-bold text-storm">{totalUsers}</p>
                                    <p className="text-xs font-bold text-slate-mid mt-1">Total Utilizadores</p>
                                </Card>
                                <Card className="text-center">
                                    <p className="text-3xl font-bold text-amber-dark">{allUsers.filter(u => u.role === 'admin').length}</p>
                                    <p className="text-xs font-bold text-slate-mid mt-1">Admins</p>
                                </Card>
                                <Card className="text-center">
                                    <p className="text-3xl font-bold text-blue-atlantic">{allUsers.filter(u => u.role === 'staff').length}</p>
                                    <p className="text-xs font-bold text-slate-mid mt-1">Staff</p>
                                </Card>
                                <Card className="text-center">
                                    <p className="text-3xl font-bold text-slate-mid">{allUsers.filter(u => u.role === 'user').length}</p>
                                    <p className="text-xs font-bold text-slate-mid mt-1">Utilizadores</p>
                                </Card>
                            </div>
                        )}

                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-light absolute left-4 top-1/2 -translate-y-1/2" />
                            <input type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)}
                                placeholder="Pesquisar por nome ou email..."
                                className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-slate-200 text-sm font-medium text-storm placeholder:text-slate-light outline-none focus:ring-2 focus:ring-blue-sky focus:border-blue-sky transition-all" />
                        </div>

                        {loadingUsers ? (
                            <SkeletonCardItem count={5} />
                        ) : allUsers.length === 0 ? (
                            <Card className="text-center py-12">
                                <Users className="w-10 h-10 text-slate-light mx-auto mb-3" />
                                <p className="text-slate-mid font-bold">Nenhum utilizador encontrado</p>
                            </Card>
                        ) : (
                            <div className="space-y-2">
                                {allUsers.map(u => {
                                    const roleConfig = ROLE_CONFIG[u.role] || ROLE_CONFIG.user;
                                    const isSelf = u._id === user?._id;
                                    return (
                                        <div key={u._id} className={`bg-white rounded-2xl p-4 border transition-all ${isSelf ? 'border-blue-sky/40 bg-blue-horizon/10' : 'border-slate-100'} hover:shadow-card`}>
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    {u.picture ? (
                                                        <img src={u.picture} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
                                                            <span className="text-sm font-bold text-slate-mid">{u.firstName?.[0]}{u.lastName?.[0]}</span>
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-bold text-storm text-sm truncate">{u.firstName} {u.lastName}</p>
                                                            {isSelf && <Badge color="blue" size="sm">TU</Badge>}
                                                        </div>
                                                        <p className="text-xs text-slate-light truncate">{u.email}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${roleConfig.bg} ${roleConfig.color}`}>
                                                                {roleConfig.icon}{roleConfig.label}
                                                            </span>
                                                            <span className="text-[10px] text-slate-light flex items-center gap-1">
                                                                <Coins className="w-3 h-3" /> {u.tmCoins || 0} TM • {u.totalContribuicoes || 0} contrib.
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {!isSelf && (
                                                    <div className="relative shrink-0">
                                                        <button onClick={() => setRoleMenuOpen(roleMenuOpen === u._id ? null : u._id)} disabled={!!actionLoading}
                                                            className="px-3 py-2 bg-sand hover:bg-slate-200 text-slate-mid rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1">
                                                            {actionLoading === `role-${u._id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <>Alterar Papel {roleMenuOpen === u._id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}</>}
                                                        </button>
                                                        {roleMenuOpen === u._id && (
                                                            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-modal border border-slate-200 py-1 z-20">
                                                                {(['admin', 'staff', 'user'] as const).map(role => {
                                                                    const rc = ROLE_CONFIG[role];
                                                                    const isCurrent = u.role === role;
                                                                    return (
                                                                        <button key={role} onClick={() => !isCurrent && handleChangeRole(u, role)}
                                                                            className={`w-full text-left px-3 py-2.5 text-xs font-bold flex items-center gap-2 ${isCurrent ? 'bg-sand text-slate-light cursor-default' : 'hover:bg-sand text-slate-mid'}`}>
                                                                            <span className={`w-5 h-5 rounded flex items-center justify-center ${rc.bg}`}>{rc.icon || <span className="text-[10px]">U</span>}</span>
                                                                            {rc.label}
                                                                            {isCurrent && <Check className="w-3 h-3 ml-auto text-success" />}
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
