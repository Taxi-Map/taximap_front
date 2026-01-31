'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { routeService, Stop } from '../services/routeService';
import { ArrowLeft, RefreshCw, Plus, Route, Eye, X, Check, MapPin, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LineData {
    id: number;
    nome: string;
    percurso: Stop[];
}

type EditMode = 'view' | 'add-stop' | 'create-route';

export default function MapRouteBuilder() {
    const navigate = useNavigate();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const markersRef = useRef<maplibregl.Marker[]>([]);
    const tempMarkerRef = useRef<maplibregl.Marker | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [stops, setStops] = useState<Stop[]>([]);
    const [lines, setLines] = useState<LineData[]>([]);
    const [selectedStop, setSelectedStop] = useState<Stop | null>(null);

    // Edit mode state
    const [editMode, setEditMode] = useState<EditMode>('view');
    const [newStopPosition, setNewStopPosition] = useState<{ lng: number; lat: number } | null>(null);
    const [newStopName, setNewStopName] = useState('');
    const [showStopModal, setShowStopModal] = useState(false);

    // Route creation state
    const [routeStops, setRouteStops] = useState<Stop[]>([]);
    const [newRouteName, setNewRouteName] = useState('');
    const [newRouteDesc, setNewRouteDesc] = useState('');
    const [showRouteModal, setShowRouteModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Initialize map
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const map = new maplibregl.Map({
            container: mapContainerRef.current,
            style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
            center: [13.2345, -8.839],
            zoom: 12,
        });

        map.on('load', () => {
            mapRef.current = map;
            fetchData();
        });

        map.addControl(new maplibregl.NavigationControl(), 'bottom-right');

        return () => {
            map.remove();
        };
    }, []);

    // Handle map clicks for adding stops
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const handleClick = (e: maplibregl.MapMouseEvent) => {
            if (editMode === 'add-stop') {
                const { lng, lat } = e.lngLat;
                setNewStopPosition({ lng, lat });
                setShowStopModal(true);

                // Show temporary marker
                if (tempMarkerRef.current) {
                    tempMarkerRef.current.remove();
                }
                const el = document.createElement('div');
                el.style.cssText = `
                    width: 24px; height: 24px;
                    background: #22c55e;
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                `;
                tempMarkerRef.current = new maplibregl.Marker({ element: el })
                    .setLngLat([lng, lat])
                    .addTo(map);
            }
        };

        map.on('click', handleClick);
        return () => { map.off('click', handleClick); };
    }, [editMode]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const allStops = await routeService.getAllStops();
            if (allStops) setStops(allStops);

            const allLines = await routeService.getAllLines();
            if (allLines) {
                const lineDetails: LineData[] = [];
                for (const line of allLines) {
                    const details = await routeService.getLineDetails(line.id);
                    if (details && details.percurso) {
                        lineDetails.push({
                            id: line.id,
                            nome: line.nome,
                            percurso: details.percurso,
                        });
                    }
                }
                setLines(lineDetails);
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Render markers when stops change
    useEffect(() => {
        const map = mapRef.current;
        if (!map || stops.length === 0) return;

        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        stops.forEach((stop) => {
            const el = document.createElement('div');
            const isInRoute = routeStops.some(s => s.id === stop.id);
            el.style.cssText = `
                width: 18px; height: 18px;
                background: ${isInRoute ? '#22c55e' : '#EAB308'};
                border: 3px solid ${isInRoute ? '#166534' : '#1e293b'};
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                transition: box-shadow 0.2s, border-color 0.2s;
            `;
            el.title = stop.nome;

            el.addEventListener('mouseenter', () => {
                el.style.boxShadow = '0 0 0 4px rgba(234, 179, 8, 0.4), 0 2px 8px rgba(0,0,0,0.4)';
            });
            el.addEventListener('mouseleave', () => {
                el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
            });
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                if (editMode === 'create-route') {
                    // Toggle stop in route
                    if (routeStops.some(s => s.id === stop.id)) {
                        setRouteStops(prev => prev.filter(s => s.id !== stop.id));
                    } else {
                        setRouteStops(prev => [...prev, stop]);
                    }
                } else {
                    setSelectedStop(stop);
                }
            });

            const marker = new maplibregl.Marker({ element: el })
                .setLngLat([stop.longitude, stop.latitude])
                .addTo(map);
            markersRef.current.push(marker);
        });

        // Add line connections
        lines.forEach((line, lineIndex) => {
            if (line.percurso.length < 2) return;

            const coordinates = line.percurso.map(stop => [stop.longitude, stop.latitude]);
            const sourceId = `line-${line.id}`;
            const layerId = `line-layer-${line.id}`;
            const arrowLayerId = `arrow-layer-${line.id}`;

            const colors = ['#22c55e', '#3b82f6', '#ef4444', '#a855f7', '#f97316', '#06b6d4'];
            const color = colors[lineIndex % colors.length];

            if (map.getLayer(arrowLayerId)) map.removeLayer(arrowLayerId);
            if (map.getLayer(layerId)) map.removeLayer(layerId);
            if (map.getSource(sourceId)) map.removeSource(sourceId);

            map.addSource(sourceId, {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: { name: line.nome },
                    geometry: { type: 'LineString', coordinates },
                },
            });

            map.addLayer({
                id: layerId,
                type: 'line',
                source: sourceId,
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': color, 'line-width': 4, 'line-opacity': 0.8 },
            });

            map.addLayer({
                id: arrowLayerId,
                type: 'symbol',
                source: sourceId,
                layout: {
                    'symbol-placement': 'line',
                    'symbol-spacing': 100,
                    'text-field': '▶',
                    'text-size': 14,
                    'text-keep-upright': false,
                    'text-allow-overlap': true,
                },
                paint: { 'text-color': color, 'text-halo-color': '#ffffff', 'text-halo-width': 2 },
            });
        });
    }, [stops, lines, editMode, routeStops]);

    const handleSaveStop = async () => {
        if (!newStopPosition || !newStopName.trim()) return;
        setIsSaving(true);

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
                tempMarkerRef.current.remove();
                tempMarkerRef.current = null;
            }
        } else {
            alert('Erro ao criar paragem. Verifique se o backend está configurado.');
        }
        setIsSaving(false);
    };

    const handleSaveRoute = async () => {
        if (routeStops.length < 2 || !newRouteName.trim()) return;
        setIsSaving(true);

        const newLine = await routeService.createLine(
            newRouteName.trim(),
            newRouteDesc.trim(),
            routeStops.map(s => s.id)
        );

        if (newLine) {
            await fetchData();
            setShowRouteModal(false);
            setRouteStops([]);
            setNewRouteName('');
            setNewRouteDesc('');
            setEditMode('view');
        } else {
            alert('Erro ao criar linha. Verifique se o backend está configurado.');
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
            tempMarkerRef.current.remove();
            tempMarkerRef.current = null;
        }
    };

    return (
        <div className="w-full h-screen bg-slate-50 flex flex-col relative">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b p-4 flex items-center justify-between z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 rounded-full">
                        <ArrowLeft className="w-6 h-6 text-slate-700" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900">Route Builder</h1>
                    {editMode !== 'view' && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                            {editMode === 'add-stop' ? '📍 Adicionar Paragem' : '🛤️ Criar Linha'}
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    {editMode === 'view' ? (
                        <>
                            <button
                                onClick={() => setEditMode('add-stop')}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Paragem
                            </button>
                            <button
                                onClick={() => setEditMode('create-route')}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium flex items-center gap-2"
                            >
                                <Route className="w-4 h-4" /> Nova Linha
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={cancelEdit}
                            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium flex items-center gap-2"
                        >
                            <X className="w-4 h-4" /> Cancelar
                        </button>
                    )}
                    <button
                        onClick={fetchData}
                        disabled={isLoading}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Map Container */}
            <div ref={mapContainerRef} className="flex-1 w-full h-full" />

            {/* Edit Mode Instructions */}
            {editMode === 'add-stop' && !showStopModal && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg z-20 animate-pulse">
                    Clique no mapa para adicionar uma paragem
                </div>
            )}

            {/* Route Builder Panel */}
            {editMode === 'create-route' && (
                <div className="absolute top-20 left-4 w-80 bg-white rounded-2xl shadow-xl p-4 z-20 max-h-[70vh] overflow-auto">
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

            {/* Add Stop Modal */}
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

            {/* Save Route Modal */}
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

            {/* Stop Info Panel */}
            {selectedStop && editMode === 'view' && (
                <div className="absolute bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-2xl shadow-xl p-4 z-20">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">{selectedStop.nome}</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                📍 {selectedStop.latitude.toFixed(5)}, {selectedStop.longitude.toFixed(5)}
                            </p>
                            <p className="text-sm text-slate-500">ID: {selectedStop.id}</p>
                        </div>
                        <button onClick={() => setSelectedStop(null)} className="p-1 hover:bg-slate-100 rounded-full">
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3 z-20">
                <p className="text-xs font-bold text-slate-700 mb-2">Legenda</p>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-4 h-4 bg-yellow-400 border-2 border-slate-900 rounded-full"></div>
                    <span>Paragem</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                    <div className="w-4 h-4 bg-green-500 border-2 border-green-800 rounded-full"></div>
                    <span>Selecionada</span>
                </div>
            </div>

            {/* Stats */}
            <div className="absolute top-20 right-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3 z-20">
                <p className="text-xs font-bold text-slate-700">Estatísticas</p>
                <p className="text-sm text-slate-600">{stops.length} paragens</p>
                <p className="text-sm text-slate-600">{lines.length} linhas</p>
            </div>

            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-6 shadow-xl flex flex-col items-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900 mb-3"></div>
                        <p className="text-slate-700 font-medium">A carregar dados...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
