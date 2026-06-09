'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ensureGoogleMapsLoaded } from '../lib/gmaps-init';
import { routeService, Stop } from '../services/routeService';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, RefreshCw, Plus, Route, Eye, X, Check, MapPin, Trash2, Edit2, List, ChevronUp, ChevronDown } from 'lucide-react';

interface LineData {
    id: number;
    nome: string;
    percurso: Stop[];
    status?: string | 'pendente' | 'aprovada' | 'rejeitada';
    pendente?: boolean;
}

type EditMode = 'view' | 'add-stop' | 'create-route' | 'edit-line';

import { NotificationModal, NotificationType } from './NotificationModal';

export default function MapRouteBuilder() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff';
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.Marker[]>([]);
    const polylinesRef = useRef<google.maps.Polyline[]>([]);
    const tempMarkerRef = useRef<google.maps.Marker | null>(null);
    const mapReadyRef = useRef(false);

    const [isLoading, setIsLoading] = useState(true);
    const [stops, setStops] = useState<Stop[]>([]);
    const [lines, setLines] = useState<LineData[]>([]);
    const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
    const [selectedLine, setSelectedLine] = useState<LineData | null>(null);

    const [notification, setNotification] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: NotificationType;
        onConfirm?: () => void;
        confirmText?: string;
        cancelText?: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    const showNotification = (
        title: string,
        message: string,
        type: NotificationType = 'info',
        onConfirm?: () => void,
        confirmText?: string,
        cancelText?: string
    ) => {
        setNotification({
            isOpen: true,
            title,
            message,
            type,
            onConfirm,
            confirmText,
            cancelText
        });
    };

    const closeNotification = () => {
        setNotification(prev => ({ ...prev, isOpen: false }));
    };

    const [editMode, setEditMode] = useState<EditMode>('view');
    const [newStopPosition, setNewStopPosition] = useState<{ lng: number; lat: number } | null>(null);
    const [newStopName, setNewStopName] = useState('');
    const [showStopModal, setShowStopModal] = useState(false);

    const [routeStops, setRouteStops] = useState<Stop[]>([]);
    const [newRouteName, setNewRouteName] = useState('');
    const [newRouteDesc, setNewRouteDesc] = useState('');
    const [showRouteModal, setShowRouteModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [showEditStopModal, setShowEditStopModal] = useState(false);
    const [editStopName, setEditStopName] = useState('');
    const [editStopLat, setEditStopLat] = useState('');
    const [editStopLng, setEditStopLng] = useState('');
    const [showEditLineModal, setShowEditLineModal] = useState(false);
    const [editLineName, setEditLineName] = useState('');
    const [editLineDesc, setEditLineDesc] = useState('');
    const [showLinesList, setShowLinesList] = useState(false);
    const [editLineStops, setEditLineStops] = useState<Stop[]>([]);

    if (authLoading) {
        return (
            <div className="w-full h-screen bg-slate-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl p-6 shadow-xl flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900 mb-3"></div>
                    <p className="text-slate-700 font-medium">A verificar autenticação...</p>
                </div>
            </div>
        );
    }

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            let mergedStops: Stop[];
            if (isAdminOrStaff) {
                const all = await routeService.getAllStopsIncludingPending();
                mergedStops = (all || []).map(s => {
                    const isNested = (s as any).paragem !== undefined;
                    const stopData = isNested ? (s as any).paragem : s;
                    const metaStatus = isNested ? (s as any).metadata?.status : undefined;
                    const isPending = stopData.pendente === true ||
                        metaStatus === 'pendente' ||
                        stopData.status === 'pendente' ||
                        (s as any).pendente === true ||
                        (s as any).status === 'pendente';
                    const finalStatus = metaStatus || stopData.status || (s as any).status || (isPending ? 'pendente' : 'aprovada');
                    return {
                        ...stopData,
                        status: finalStatus === 'pendente' ? 'pendente' : finalStatus,
                        pendente: isPending || finalStatus === 'pendente'
                    };
                });
            } else {
                const approved = await routeService.getAllStops();
                mergedStops = approved || [];
                if (authService.isAuthenticated()) {
                    const myStops = await routeService.getMyStops();
                    if (myStops) {
                        const myPendingMap = new Map(myStops.filter(s => s.status === 'pendente').map(s => [s.id, s]));
                        mergedStops = mergedStops.map(s => {
                            const p = myPendingMap.get(s.id);
                            return p ? { ...s, status: p.status, criadoPor: p.criadoPor, criadoEm: p.criadoEm } : s;
                        });
                        const ids = new Set(mergedStops.map(s => s.id));
                        const newPending = myStops.filter(s => s.status === 'pendente' && !ids.has(s.id));
                        mergedStops = [...mergedStops, ...newPending];
                    }
                }
            }
            setStops(mergedStops);

            if (isAdminOrStaff) {
                const [allLinesData, pendingSpecificData] = await Promise.all([
                    routeService.getAllLinesIncludingPending(),
                    routeService.getPendingLines()
                ]);
                if (allLinesData) {
                    const lineDetails: LineData[] = [];
                    const pendingPathsMap = new Map<number, Stop[]>();
                    if (pendingSpecificData) {
                        pendingSpecificData.forEach(pLine => {
                            const pLineId = pLine.linha?.id || (pLine as any).id;
                            if (pLineId && pLine.percurso && Array.isArray(pLine.percurso)) {
                                pendingPathsMap.set(pLineId, pLine.percurso);
                            }
                        });
                    }
                    for (const rawLine of allLinesData) {
                        const isNested = (rawLine as any).linha !== undefined;
                        const lineData = isNested ? (rawLine as any).linha : (rawLine as any);
                        const metaStatus = isNested ? (rawLine as any).metadata?.status : undefined;
                        let isPending = lineData.pendente === true ||
                            metaStatus === 'pendente' ||
                            lineData.status === 'pendente' ||
                            (rawLine as any).pendente === true ||
                            (rawLine as any).status === 'pendente';
                        const statusFinal = metaStatus || lineData.status || (rawLine as any).status || (isPending ? 'pendente' : 'aprovada');
                        if (statusFinal === 'pendente') isPending = true;
                        let percursoFinal: Stop[] = [];
                        if ((rawLine as any).percurso && (rawLine as any).percurso.length > 0) {
                            percursoFinal = (rawLine as any).percurso;
                        } else if (isPending && pendingPathsMap.has(lineData.id)) {
                            percursoFinal = pendingPathsMap.get(lineData.id) || [];
                        } else if (!isPending) {
                            try {
                                const details = await routeService.getLineDetails(lineData.id);
                                if (details && details.percurso) {
                                    percursoFinal = details.percurso;
                                }
                            } catch (err) {
                                console.warn(`Silent skip: Details not found for line ${lineData.id}`);
                            }
                        }
                        lineDetails.push({
                            id: lineData.id,
                            nome: lineData.nome,
                            percurso: percursoFinal,
                            status: statusFinal,
                            pendente: isPending
                        });
                    }
                    setLines(lineDetails);
                }
            } else {
                const lineDetails: LineData[] = [];
                const allLines = await routeService.getAllLines();
                if (allLines) {
                    for (const line of allLines) {
                        const details = await routeService.getLineDetails(line.id);
                        if (details && details.percurso) {
                            lineDetails.push({
                                id: line.id,
                                nome: line.nome,
                                percurso: details.percurso,
                                status: 'aprovada',
                                pendente: false
                            });
                        }
                    }
                }
                if (authService.isAuthenticated()) {
                    const myLines = await routeService.getMyLines();
                    if (myLines) {
                        const pendingLines = myLines.filter(l => (l as any).metadata?.status === 'pendente' || l.linha?.status === 'pendente' || l.status === 'pendente');
                        for (const lr of pendingLines) {
                            if (!lineDetails.some(ml => ml.id === lr.linha.id)) {
                                lineDetails.push({
                                    id: lr.linha.id,
                                    nome: lr.linha.nome,
                                    percurso: lr.percurso || [],
                                    status: 'pendente',
                                    pendente: true
                                });
                            }
                        }
                    }
                }
                setLines(lineDetails);
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
            showNotification('Erro', 'Falha ao carregar dados do servidor.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [isAdminOrStaff]);

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        ensureGoogleMapsLoaded().then(() => {
            if (!mapContainerRef.current || mapRef.current) return;

            const map = new google.maps.Map(mapContainerRef.current, {
                center: { lat: -8.839, lng: 13.2345 },
                zoom: 12,
                zoomControl: true,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.BOTTOM_RIGHT,
                },
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                clickableIcons: false,
            });

            mapRef.current = map;

            const listener = map.addListener('idle', () => {
                mapReadyRef.current = true;
                if (!authLoading) {
                    fetchData();
                }
                google.maps.event.removeListener(listener);
            });
        });

        return () => {
            mapRef.current = null;
            mapReadyRef.current = false;
        };
    }, [authLoading, fetchData]);

    useEffect(() => {
        if (mapRef.current && !authLoading) {
            fetchData();
        }
    }, [authLoading, isAdminOrStaff, fetchData]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const handleClick = (e: google.maps.MapMouseEvent) => {
            if (editMode === 'add-stop') {
                const lat = e.latLng ? e.latLng.lat() : 0;
                const lng = e.latLng ? e.latLng.lng() : 0;
                setNewStopPosition({ lng, lat });
                setShowStopModal(true);

                if (tempMarkerRef.current) {
                    tempMarkerRef.current.setMap(null);
                }
                const marker = new google.maps.Marker({
                    position: { lat, lng },
                    map,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: '#22c55e',
                        fillOpacity: 1,
                        strokeColor: '#FFFFFF',
                        strokeWeight: 3,
                        scale: 12,
                        anchor: new google.maps.Point(0, 0),
                    },
                });
                tempMarkerRef.current = marker;
            }
        };

        map.addListener('click', handleClick);
        return () => { };
    }, [editMode]);

    const clearMapOverlays = useCallback(() => {
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
        polylinesRef.current.forEach(p => p.setMap(null));
        polylinesRef.current = [];
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (!map || stops.length === 0 || !mapReadyRef.current) return;

        clearMapOverlays();

        stops.forEach((stop) => {
            const isInRoute = routeStops.some(s => s.id === stop.id);
            const isInEditLine = editLineStops.some(s => s.id === stop.id);
            const isPending = stop.status === 'pendente';

            let fillColor = '#EAB308';
            let strokeColor = '#1e293b';
            let scale = 10;
            if (isInEditLine) { fillColor = '#a855f7'; strokeColor = '#6b21a8'; }
            else if (isInRoute) { fillColor = '#22c55e'; strokeColor = '#166534'; }
            else if (isPending) { fillColor = '#f97316'; strokeColor = '#c2410c'; }

            const marker = new google.maps.Marker({
                position: { lat: stop.latitude, lng: stop.longitude },
                map,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor,
                    fillOpacity: 1,
                    strokeColor,
                    strokeWeight: 3,
                    scale,
                    anchor: new google.maps.Point(0, 0),
                },
                title: stop.nome,
            });

            marker.addListener('click', () => {
                if (editMode === 'create-route') {
                    if (routeStops.some(s => s.id === stop.id)) {
                        setRouteStops(prev => prev.filter(s => s.id !== stop.id));
                    } else {
                        setRouteStops(prev => [...prev, stop]);
                    }
                } else if (editMode === 'edit-line') {
                    addStopToLine(stop);
                } else {
                    setSelectedStop(stop);
                }
            });

            markersRef.current.push(marker);
        });

        const colors = ['#22c55e', '#3b82f6', '#ef4444', '#a855f7', '#f97316', '#06b6d4'];
        lines.forEach((line, lineIndex) => {
            if (line.percurso.length < 2) return;

            let color = colors[lineIndex % colors.length];
            if (line.pendente || line.status === 'pendente') {
                color = '#f97316';
            }

            const path = line.percurso.map(s => ({ lat: s.latitude, lng: s.longitude } as google.maps.LatLngLiteral));

            const polyline = new google.maps.Polyline({
                path,
                strokeColor: color,
                strokeWeight: 4,
                strokeOpacity: 0.8,
                map,
            });

            const arrowPolyline = new google.maps.Polyline({
                path,
                strokeColor: color,
                strokeWeight: 4,
                strokeOpacity: 0,
                icons: [{
                    icon: {
                        path: 'M 0 -1 0 1',
                        strokeColor: color,
                        strokeOpacity: 0.8,
                        scale: 2,
                    },
                    offset: '0',
                    repeat: '100px',
                }],
                map,
            });

            polyline.addListener('click', () => {
                setSelectedLine(line);
            });

            polylinesRef.current.push(polyline, arrowPolyline);
        });
    }, [stops, lines, editMode, routeStops, editLineStops, clearMapOverlays]);

    const handleSaveStop = async () => {
        if (!newStopPosition || !newStopName.trim()) return;
        setIsSaving(true);

        try {
            const newStop = await routeService.createStop(
                newStopName.trim(),
                newStopPosition.lat,
                newStopPosition.lng
            );

            if (newStop) {
                setStops(prev => [...prev, newStop]);
                setShowStopModal(false);
                setNewStopName('');
                setNewStopPosition(null);
                if (tempMarkerRef.current) {
                    tempMarkerRef.current.setMap(null);
                    tempMarkerRef.current = null;
                }

                if (newStop.status === 'pendente') {
                    showNotification('Sucesso', 'Paragem criada! Ela ficará pendente até aprovação.', 'success');
                } else {
                    showNotification('Sucesso', 'Paragem criada com sucesso!', 'success');
                }
            } else {
                showNotification('Erro', 'Erro ao criar paragem.', 'error');
            }
        } catch (err: any) {
            showNotification('Erro', err.message || 'Erro ao criar paragem.', 'error');
        }
        setIsSaving(false);
    };

    const handleSaveRoute = async () => {
        if (routeStops.length < 2 || !newRouteName.trim()) return;
        setIsSaving(true);

        try {
            const newLineResponse = await routeService.createLine(
                newRouteName.trim(),
                newRouteDesc.trim(),
                routeStops.map(s => s.id)
            );

            if (newLineResponse) {
                await fetchData();
                setShowRouteModal(false);
                setRouteStops([]);
                setNewRouteName('');
                setNewRouteDesc('');
                setEditMode('view');

                if (newLineResponse.pendente) {
                    showNotification('Sucesso', 'Linha criada! Ela ficará pendente até aprovação.', 'success');
                } else {
                    showNotification('Sucesso', 'Linha criada e aprovada com sucesso!', 'success');
                }
            } else {
                showNotification('Erro', 'Erro ao criar linha.', 'error');
            }
        } catch (err: any) {
            showNotification('Erro', err.message || 'Erro ao criar linha.', 'error');
        }
        setIsSaving(false);
    };

    const cancelEdit = () => {
        setEditMode('view');
        setShowStopModal(false);
        setShowRouteModal(false);
        setRouteStops([]);
        setNewStopName('');
        setNewStopPosition(null);
        if (tempMarkerRef.current) {
            tempMarkerRef.current.setMap(null);
            tempMarkerRef.current = null;
        }
    };

    const handleEditStop = () => {
        if (!selectedStop) return;
        setEditStopName(selectedStop.nome);
        setEditStopLat(selectedStop.latitude.toString());
        setEditStopLng(selectedStop.longitude.toString());
        setShowEditStopModal(true);
    };

    const handleSaveEditStop = async () => {
        if (!selectedStop || !editStopName.trim()) return;

        const sanitizedName = editStopName.trim().replace(/[<>"'&;]/g, '');
        if (sanitizedName.length === 0 || sanitizedName.length > 100) {
            showNotification('Aviso', 'Nome da paragem inválido (máximo 100 caracteres).', 'warning');
            return;
        }

        const lat = parseFloat(editStopLat);
        const lng = parseFloat(editStopLng);

        if (isNaN(lat) || isNaN(lng)) {
            showNotification('Aviso', 'Latitude e longitude devem ser números válidos.', 'warning');
            return;
        }

        if (lat < -90 || lat > 90) {
            showNotification('Aviso', 'Latitude deve estar entre -90 e 90.', 'warning');
            return;
        }
        if (lng < -180 || lng > 180) {
            showNotification('Aviso', 'Longitude deve estar entre -180 e 180.', 'warning');
            return;
        }

        setIsSaving(true);
        try {
            const updated = await routeService.updateStop(selectedStop.id, {
                nome: sanitizedName,
                latitude: lat,
                longitude: lng
            });
            if (updated) {
                await fetchData();
                setSelectedStop(updated);
                setShowEditStopModal(false);
                showNotification('Sucesso', 'Paragem atualizada com sucesso!', 'success');
            } else {
                showNotification('Erro', 'Erro ao atualizar paragem.', 'error');
            }
        } catch (err: any) {
            showNotification('Erro', err.message || 'Erro ao atualizar paragem.', 'error');
        }
        setIsSaving(false);
    };

    const handleDeleteStop = async () => {
        if (!selectedStop) return;

        showNotification(
            'Apagar Paragem',
            `Tens a certeza que queres apagar a paragem "${selectedStop.nome}"?`,
            'warning',
            async () => {
                setIsSaving(true);
                try {
                    const success = await routeService.deleteStop(selectedStop.id);
                    if (success) {
                        await fetchData();
                        setSelectedStop(null);
                        showNotification('Sucesso', 'Paragem apagada com sucesso!', 'success');
                    } else {
                        showNotification('Erro', 'Erro ao apagar paragem.', 'error');
                    }
                } catch (err: any) {
                    showNotification('Erro', err.message || 'Erro ao apagar paragem.', 'error');
                }
                setIsSaving(false);
            },
            'Sim, apagar',
            'Cancelar'
        );
    };

    const handleEditLine = (line: LineData) => {
        setSelectedLine(line);
        setEditLineName(line.nome);
        setEditLineDesc('');
        setEditLineStops([...line.percurso]);
        setEditMode('edit-line');
        setShowLinesList(false);
    };

    const moveStopUp = (index: number) => {
        if (index === 0) return;
        const newStops = [...editLineStops];
        [newStops[index - 1], newStops[index]] = [newStops[index], newStops[index - 1]];
        setEditLineStops(newStops);
    };

    const moveStopDown = (index: number) => {
        if (index === editLineStops.length - 1) return;
        const newStops = [...editLineStops];
        [newStops[index], newStops[index + 1]] = [newStops[index + 1], newStops[index]];
        setEditLineStops(newStops);
    };

    const removeStopFromLine = (stopId: number) => {
        setEditLineStops(prev => prev.filter(s => s.id !== stopId));
    };

    const addStopToLine = (stop: Stop) => {
        if (!editLineStops.some(s => s.id === stop.id)) {
            setEditLineStops(prev => [...prev, stop]);
        }
    };

    const handleSaveEditLine = async () => {
        if (!selectedLine || !editLineName.trim()) return;
        if (editLineStops.length < 2) {
            showNotification('Aviso', 'Uma linha deve ter pelo menos 2 paragens.', 'warning');
            return;
        }
        setIsSaving(true);
        try {
            const updated = await routeService.updateLine(selectedLine.id, {
                nome: editLineName.trim(),
                descricao: editLineDesc.trim() || undefined,
                paragemIds: editLineStops.map(s => s.id)
            });
            if (updated) {
                await fetchData();
                setEditMode('view');
                setSelectedLine(null);
                setEditLineStops([]);
                showNotification('Sucesso', 'Linha atualizada com sucesso!', 'success');
            } else {
                showNotification('Erro', 'Erro ao atualizar linha.', 'error');
            }
        } catch (err: any) {
            showNotification('Erro', err.message || 'Erro ao atualizar linha.', 'error');
        }
        setIsSaving(false);
    };

    const cancelEditLine = () => {
        setEditMode('view');
        setSelectedLine(null);
        setEditLineStops([]);
    };

    const handleDeleteLine = async (line: LineData) => {
        showNotification(
            'Apagar Linha',
            `Tens a certeza que queres apagar a linha "${line.nome}"?`,
            'warning',
            async () => {
                setIsSaving(true);
                try {
                    const success = await routeService.deleteLine(line.id);
                    if (success) {
                        await fetchData();
                        if (selectedLine?.id === line.id) setSelectedLine(null);
                        showNotification('Sucesso', 'Linha apagada com sucesso!', 'success');
                    } else {
                        showNotification('Erro', 'Erro ao apagar linha.', 'error');
                    }
                } catch (err: any) {
                    showNotification('Erro', err.message || 'Erro ao apagar linha.', 'error');
                }
                setIsSaving(false);
            },
            'Sim, apagar',
            'Cancelar'
        );
    };

    return (
        <div className="w-full h-screen bg-slate-50 flex flex-col relative">
            <NotificationModal
                isOpen={notification.isOpen}
                onClose={closeNotification}
                title={notification.title}
                message={notification.message}
                type={notification.type}
                onConfirm={notification.onConfirm}
                confirmText={notification.confirmText}
                cancelText={notification.cancelText}
            />
            <div className="absolute top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b px-2 py-2 md:px-4 md:py-3 flex items-center justify-between z-20 shadow-sm gap-2">
                <div className="flex items-center gap-1 md:gap-3 min-w-0 flex-shrink-0">
                    <button onClick={() => navigate('/map')} className="p-1.5 md:p-2 hover:bg-slate-100 rounded-full flex-shrink-0">
                        <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-slate-700" />
                    </button>
                    <h1 className="text-sm md:text-xl font-bold text-slate-900 whitespace-nowrap">Route Builder</h1>
                    {editMode !== 'view' && (
                        <span className="hidden sm:inline px-2 py-0.5 md:px-3 md:py-1 bg-green-100 text-green-700 text-xs md:text-sm font-medium rounded-full whitespace-nowrap">
                            {editMode === 'add-stop' ? '📍 Paragem' : editMode === 'edit-line' ? '✏️ Editar' : '🛤️ Linha'}
                        </span>
                    )}
                </div>
                <div className="flex gap-1 md:gap-2 flex-shrink-0">
                    {editMode === 'view' ? (
                        <>
                            <button
                                onClick={() => setEditMode('add-stop')}
                                className="p-2 md:px-3 md:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium flex items-center gap-1 md:gap-2"
                                title="Adicionar Paragem"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden md:inline text-sm">Paragem</span>
                            </button>
                            <button
                                onClick={() => setEditMode('create-route')}
                                className="p-2 md:px-3 md:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium flex items-center gap-1 md:gap-2"
                                title="Nova Linha"
                            >
                                <Route className="w-4 h-4" />
                                <span className="hidden md:inline text-sm">Nova Linha</span>
                            </button>
                            <button
                                onClick={() => setShowLinesList(!showLinesList)}
                                className={`p-2 md:px-3 md:py-2 rounded-lg font-medium flex items-center gap-1 md:gap-2 ${showLinesList ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
                                title="Lista de Linhas"
                            >
                                <List className="w-4 h-4" />
                                <span className="hidden md:inline text-sm">Linhas</span>
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={cancelEdit}
                            className="p-2 md:px-3 md:py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium flex items-center gap-1 md:gap-2"
                            title="Cancelar"
                        >
                            <X className="w-4 h-4" />
                            <span className="hidden md:inline text-sm">Cancelar</span>
                        </button>
                    )}
                    <button
                        onClick={fetchData}
                        disabled={isLoading}
                        className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium flex items-center"
                        title="Atualizar"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div ref={mapContainerRef} className="flex-1 w-full h-full" />

            {editMode === 'add-stop' && !showStopModal && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg z-20 animate-pulse">
                    Clique no mapa para adicionar uma paragem
                </div>
            )}

            {editMode === 'create-route' && (
                <div className="absolute top-14 md:top-20 left-2 right-2 md:left-4 md:right-auto md:w-80 bg-white rounded-2xl shadow-xl p-3 md:p-4 z-20 max-h-[50vh] md:max-h-[70vh] overflow-auto">
                    <h3 className="font-bold text-slate-900 text-lg mb-3 flex items-center gap-2">
                        <Route className="w-5 h-5 text-blue-500" /> Criar Nova Linha
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">Clique nas paragens na ordem do percurso</p>

                    {routeStops.length > 0 && (
                        <div className="space-y-2 mb-4">
                            {routeStops.map((stop, idx) => (
                                <div key={stop.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        {idx + 1}
                                    </span>
                                    <span className="flex-1 text-sm text-slate-700 truncate">{stop.nome}</span>
                                    <button
                                        onClick={() => setRouteStops(prev => prev.filter(s => s.id !== stop.id))}
                                        className="p-1 hover:bg-red-100 rounded"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {routeStops.length >= 2 && (
                        <button
                            onClick={() => setShowRouteModal(true)}
                            className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 flex items-center justify-center gap-2"
                        >
                            <Check className="w-5 h-5" /> Guardar Linha ({routeStops.length} paragens)
                        </button>
                    )}
                </div>
            )}

            {editMode === 'edit-line' && selectedLine && (
                <div className="absolute top-14 md:top-20 left-2 right-2 md:left-4 md:right-auto md:w-96 bg-white rounded-2xl shadow-xl p-3 md:p-4 z-20 max-h-[60vh] md:max-h-[80vh] overflow-auto">
                    <h3 className="font-bold text-slate-900 text-lg mb-3 flex items-center gap-2">
                        <Edit2 className="w-5 h-5 text-purple-500" /> Editar Linha
                    </h3>

                    <input
                        type="text"
                        value={editLineName}
                        onChange={(e) => setEditLineName(e.target.value)}
                        placeholder="Nome da linha"
                        className="w-full p-3 border border-slate-300 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />

                    <p className="text-sm text-slate-500 mb-2">
                        Clique nas paragens no mapa para adicionar à linha
                    </p>

                    <div className="space-y-2 mb-4 max-h-[40vh] overflow-auto">
                        {editLineStops.map((stop, idx) => (
                            <div key={stop.id} className="flex items-center gap-2 bg-purple-50 p-2 rounded-lg border border-purple-200">
                                <span className="w-7 h-7 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                    {idx + 1}
                                </span>
                                <span className="flex-1 text-sm text-slate-700 truncate">{stop.nome}</span>

                                <div className="flex flex-col gap-0.5">
                                    <button
                                        onClick={() => moveStopUp(idx)}
                                        disabled={idx === 0}
                                        className="p-0.5 hover:bg-purple-200 rounded disabled:opacity-30"
                                        title="Mover para cima"
                                    >
                                        <ChevronUp className="w-4 h-4 text-purple-600" />
                                    </button>
                                    <button
                                        onClick={() => moveStopDown(idx)}
                                        disabled={idx === editLineStops.length - 1}
                                        className="p-0.5 hover:bg-purple-200 rounded disabled:opacity-30"
                                        title="Mover para baixo"
                                    >
                                        <ChevronDown className="w-4 h-4 text-purple-600" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => removeStopFromLine(stop.id)}
                                    className="p-1 hover:bg-red-100 rounded"
                                    title="Remover da linha"
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {editLineStops.length < 2 && (
                        <p className="text-sm text-amber-600 mb-3">⚠️ Mínimo 2 paragens necessárias</p>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={cancelEditLine}
                            className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSaveEditLine}
                            disabled={editLineStops.length < 2 || !editLineName.trim() || isSaving}
                            className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Check className="w-5 h-5" />
                            {isSaving ? 'A guardar...' : 'Guardar'}
                        </button>
                    </div>
                </div>
            )}

            {showStopModal && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <MapPin className="w-6 h-6 text-green-500" /> Nova Paragem
                        </h3>
                        <input
                            type="text"
                            value={newStopName}
                            onChange={(e) => setNewStopName(e.target.value)}
                            placeholder="Nome da paragem (ex: Mutamba)"
                            className="w-full p-3 border border-slate-300 rounded-xl mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            autoFocus
                        />
                        {newStopPosition && (
                            <p className="text-xs text-slate-400 mb-4">
                                📍 {newStopPosition.lat.toFixed(5)}, {newStopPosition.lng.toFixed(5)}
                            </p>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={cancelEdit}
                                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveStop}
                                disabled={!newStopName.trim() || isSaving}
                                className="flex-1 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 disabled:opacity-50"
                            >
                                {isSaving ? 'A guardar...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showRouteModal && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Route className="w-6 h-6 text-blue-500" /> Guardar Linha
                        </h3>
                        <input
                            type="text"
                            value={newRouteName}
                            onChange={(e) => setNewRouteName(e.target.value)}
                            placeholder="Nome da linha (ex: Linha 15)"
                            className="w-full p-3 border border-slate-300 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                        <input
                            type="text"
                            value={newRouteDesc}
                            onChange={(e) => setNewRouteDesc(e.target.value)}
                            placeholder="Descrição (ex: Mutamba - Viana)"
                            className="w-full p-3 border border-slate-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-sm text-slate-500 mb-4">
                            {routeStops.length} paragens: {routeStops.map(s => s.nome).join(' → ')}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRouteModal(false)}
                                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={handleSaveRoute}
                                disabled={!newRouteName.trim() || isSaving}
                                className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50"
                            >
                                {isSaving ? 'A guardar...' : 'Criar Linha'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedStop && editMode === 'view' && (
                <div className="absolute bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-2xl shadow-xl p-4 z-20">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-900 text-lg">{selectedStop.nome}</h3>
                                {selectedStop.status === 'pendente' && (
                                    <span className="text-[10px] px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-bold">⏳ Pendente</span>
                                )}
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                                📍 {selectedStop.latitude.toFixed(5)}, {selectedStop.longitude.toFixed(5)}
                            </p>
                            <p className="text-sm text-slate-500">ID: {selectedStop.id}</p>
                            {selectedStop.status === 'pendente' && (
                                <p className="text-xs text-orange-500 mt-1">Esta paragem aguarda aprovação de um admin</p>
                            )}
                        </div>
                        <button onClick={() => setSelectedStop(null)} className="p-1 hover:bg-slate-100 rounded-full">
                            ✕
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleEditStop}
                            className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 flex items-center justify-center gap-2"
                        >
                            <Edit2 className="w-4 h-4" /> Editar
                        </button>
                        <button
                            onClick={handleDeleteStop}
                            disabled={isSaving}
                            className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" /> Apagar
                        </button>
                    </div>
                </div>
            )}

            <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-2 md:p-3 z-10">
                <p className="text-[10px] md:text-xs font-bold text-slate-700 mb-1 md:mb-2">Legenda</p>
                <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs text-slate-600">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-yellow-400 border-2 border-slate-900 rounded-full"></div>
                    <span>Paragem</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs text-slate-600 mt-0.5 md:mt-1">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-orange-500 border-2 border-orange-800 rounded-full"></div>
                    <span>Pendente</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs text-slate-600 mt-0.5 md:mt-1">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-green-500 border-2 border-green-800 rounded-full"></div>
                    <span>Nova Linha</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs text-slate-600 mt-0.5 md:mt-1">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-purple-500 border-2 border-purple-800 rounded-full"></div>
                    <span>A Editar</span>
                </div>
            </div>

            <div className="absolute top-16 md:top-20 right-2 md:right-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-2 md:p-3 z-10">
                <p className="text-[10px] md:text-xs font-bold text-slate-700">Estatísticas</p>
                <p className="text-xs md:text-sm text-slate-600">{stops.length} paragens</p>
                {stops.filter(s => s.status === 'pendente').length > 0 && (
                    <p className="text-xs md:text-sm text-orange-500">⏳ {stops.filter(s => s.status === 'pendente').length} pendente(s)</p>
                )}
                <p className="text-xs md:text-sm text-slate-600">{lines.length} linhas</p>
            </div>

            {isLoading && (
                <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-6 shadow-xl flex flex-col items-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900 mb-3"></div>
                        <p className="text-slate-700 font-medium">A carregar dados...</p>
                    </div>
                </div>
            )}

            {showLinesList && editMode === 'view' && (
                <div className="absolute top-14 md:top-20 left-2 right-2 md:left-4 md:right-auto md:w-80 bg-white rounded-2xl shadow-xl p-3 md:p-4 z-20 max-h-[60vh] md:max-h-[70vh] overflow-auto">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                            <Route className="w-5 h-5 text-purple-500" /> Linhas ({lines.length})
                        </h3>
                        <button onClick={() => setShowLinesList(false)} className="p-1 hover:bg-slate-100 rounded-full">
                            ✕
                        </button>
                    </div>
                    {lines.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">Nenhuma linha criada</p>
                    ) : (
                        <div className="space-y-2">
                            {lines.map(line => (
                                <div key={line.id} className="bg-slate-50 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-slate-900">{line.nome}</span>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleEditLine(line)}
                                                className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteLine(line)}
                                                className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        {line.percurso.length} paragens: {line.percurso.map(s => s.nome).join(' → ')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {showEditStopModal && selectedStop && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Edit2 className="w-6 h-6 text-blue-500" /> Editar Paragem
                        </h3>
                        <input
                            type="text"
                            value={editStopName}
                            onChange={(e) => setEditStopName(e.target.value)}
                            placeholder="Nome da paragem"
                            className="w-full p-3 border border-slate-300 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />

                        <div className="mb-3">
                            <label className="text-xs text-slate-500 mb-1 block">Coordenadas (cola aqui)</label>
                            <input
                                type="text"
                                placeholder="-8.932228, 13.205819"
                                className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const sanitized = value.replace(/[^0-9.\-,\s]/g, '');
                                    const parts = sanitized.split(/[,\s]+/).filter(p => p.length > 0);
                                    if (parts.length >= 2) {
                                        const lat = parseFloat(parts[0]);
                                        const lng = parseFloat(parts[1]);
                                        if (!isNaN(lat) && !isNaN(lng) &&
                                            lat >= -90 && lat <= 90 &&
                                            lng >= -180 && lng <= 180) {
                                            setEditStopLat(lat.toString());
                                            setEditStopLng(lng.toString());
                                        }
                                    }
                                }}
                            />
                            <p className="text-xs text-slate-400 mt-1">Formato: -8.932228, 13.205819</p>
                        </div>

                        <div className="flex gap-3 mb-4">
                            <div className="flex-1">
                                <label className="text-xs text-slate-500 mb-1 block">Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={editStopLat}
                                    onChange={(e) => setEditStopLat(e.target.value)}
                                    placeholder="-8.839"
                                    className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-slate-500 mb-1 block">Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={editStopLng}
                                    onChange={(e) => setEditStopLng(e.target.value)}
                                    placeholder="13.234"
                                    className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowEditStopModal(false)}
                                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveEditStop}
                                disabled={!editStopName.trim() || isSaving}
                                className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50"
                            >
                                {isSaving ? 'A guardar...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEditLineModal && selectedLine && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Edit2 className="w-6 h-6 text-purple-500" /> Editar Linha
                        </h3>
                        <input
                            type="text"
                            value={editLineName}
                            onChange={(e) => setEditLineName(e.target.value)}
                            placeholder="Nome da linha"
                            className="w-full p-3 border border-slate-300 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            autoFocus
                        />
                        <input
                            type="text"
                            value={editLineDesc}
                            onChange={(e) => setEditLineDesc(e.target.value)}
                            placeholder="Descrição (opcional)"
                            className="w-full p-3 border border-slate-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <p className="text-sm text-slate-500 mb-4">
                            {selectedLine.percurso.length} paragens: {selectedLine.percurso.map(s => s.nome).join(' → ')}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowEditLineModal(false); setSelectedLine(null); }}
                                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveEditLine}
                                disabled={!editLineName.trim() || isSaving}
                                className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 disabled:opacity-50"
                            >
                                {isSaving ? 'A guardar...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
