'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mapcn, MapcnRoute, MapcnMarker, MapcnControls, MapcnTaxiAnimator } from './Mapcn';
import { ArrowLeft, Navigation, User, Play } from 'lucide-react';
import { routeService, RouteData, Stop } from '../services/routeService';
import { orsService } from '../services/orsService';
import { findTwoNearestStops } from '../utils/geoUtils';

export default function MapcnTestPage() {
    const [searchParams] = useSearchParams();
    const [destination, setDestination] = useState(searchParams.get('destination') || '');
    const [origin, setOrigin] = useState('Obtendo localização...');

    const [userLocation, setUserLocation] = useState<[number, number] | undefined>(undefined);
    const [locationError, setLocationError] = useState(false);

    // Route state
    const [route, setRoute] = useState<RouteData | null>(null);
    const [alternativeRoute, setAlternativeRoute] = useState<RouteData | null>(null);
    const [primaryPath, setPrimaryPath] = useState<[number, number][] | null>(null);
    const [alternativePath, setAlternativePath] = useState<[number, number][] | null>(null);
    const [userToOriginPath, setUserToOriginPath] = useState<[number, number][] | null>(null);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);

    // Stops
    const [allStops, setAllStops] = useState<Stop[]>([]);
    const [filteredStops, setFilteredStops] = useState<Stop[]>([]);
    const [selectedDestination, setSelectedDestination] = useState<Stop | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedRouteType, setSelectedRouteType] = useState<'primary' | 'alternative' | 'both'>('both');
    const [isTripStarted, setIsTripStarted] = useState(false);
    const [isAltTripStarted, setIsAltTripStarted] = useState(false);

    const handleStartTrip = () => {
        setIsTripStarted(true);
        setSelectedRouteType('primary');
    };

    const handleStartAltTrip = () => {
        setIsAltTripStarted(true);
        setSelectedRouteType('alternative');
    };

    // Request location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setOrigin('Minha localização actual');
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                    setLocationError(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setOrigin('Activar localização');
                    setLocationError(true);
                }
            );
        }
    }, []);

    // Fetch stops
    useEffect(() => {
        const fetchStops = async () => {
            const stops = await routeService.getAllStops();
            if (stops) {
                setAllStops(stops);
                setFilteredStops(stops);
            }
        };
        fetchStops();
    }, []);

    // Filter stops
    const handleDestinationChange = (value: string) => {
        setDestination(value);
        setSelectedDestination(null);
        if (value.trim() === '') {
            setFilteredStops(allStops);
            setShowDropdown(false);
        } else {
            const filtered = allStops.filter(stop =>
                stop.nome.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredStops(filtered);
            setShowDropdown(true);
        }
    };

    const handleSelectDestination = (stop: Stop) => {
        setDestination(stop.nome);
        setSelectedDestination(stop);
        setShowDropdown(false);
    };

    // Calculate routes
    const handleStartRoute = async () => {
        if (!selectedDestination || !userLocation) return;

        setIsLoadingRoute(true);
        setPrimaryPath(null);
        setAlternativePath(null);

        try {
            const twoNearest = findTwoNearestStops(userLocation[0], userLocation[1], allStops);
            if (!twoNearest) return;

            const [stop1, stop2] = twoNearest;

            const route1Data = await routeService.getShortestPath(stop1.id, selectedDestination.id);
            const route2Data = await routeService.getShortestPath(stop2.id, selectedDestination.id);

            let bestRoute = route1Data?.dados;
            let altRoute = route2Data?.dados;

            if (route1Data?.sucesso && route2Data?.sucesso) {
                if (route2Data.dados.distanciaTotal < route1Data.dados.distanciaTotal) {
                    bestRoute = route2Data.dados;
                    altRoute = route1Data.dados;
                }
            }

            if (bestRoute) {
                setRoute(bestRoute);
                setOrigin(bestRoute.paragens[0]?.nome || 'Origem');

                const waypoints: [number, number][] = bestRoute.paragens.map(s => [s.latitude, s.longitude]);
                const path = await orsService.getRoute(waypoints);
                if (path) {
                    // Convert [lat, lng] to [lng, lat] for MapLibre
                    setPrimaryPath(path.map(([lat, lng]) => [lng, lat]));
                }

                // Walking route
                const walkPath = await orsService.getWalkingRoute([userLocation, waypoints[0]]);
                if (walkPath) {
                    setUserToOriginPath(walkPath.map(([lat, lng]) => [lng, lat]));
                }
            }

            if (altRoute) {
                setAlternativeRoute(altRoute);
                const waypoints: [number, number][] = altRoute.paragens.map(s => [s.latitude, s.longitude]);
                const path = await orsService.getRoute(waypoints);
                if (path) {
                    setAlternativePath(path.map(([lat, lng]) => [lng, lat]));
                }
            }
        } catch (e) {
            console.error("Error:", e);
        }
        setIsLoadingRoute(false);
    };

    // Map center
    const mapCenter: [number, number] = userLocation
        ? [userLocation[1], userLocation[0]]  // [lng, lat]
        : [13.2345, -8.839];

    return (
        <div className="min-h-screen bg-slate-50 overflow-hidden relative">
            {/* Map Background */}
            <div className="absolute inset-0 z-0">
                <Mapcn center={mapCenter} zoom={14}>
                    <MapcnControls showZoom showLocate />

                    {/* Walking route (dashed gray) */}
                    {userToOriginPath && (selectedRouteType === 'both' || selectedRouteType === 'primary') && (
                        <MapcnRoute
                            id="walking-route"
                            coordinates={userToOriginPath}
                            color="#6B7280"
                            width={4}
                            opacity={0.7}
                            dashArray={[10, 10]}
                        />
                    )}

                    {/* Alternative Route (BLUE) */}
                    {alternativePath && (selectedRouteType === 'both' || selectedRouteType === 'alternative') && (
                        <MapcnRoute
                            id="alt-route"
                            coordinates={alternativePath}
                            color="#3B82F6"
                            width={4}
                            opacity={selectedRouteType === 'alternative' ? 0.9 : 0.6}
                            onClick={() => setSelectedRouteType('alternative')}
                        />
                    )}

                    {/* Primary Route (GREEN) */}
                    {primaryPath && (selectedRouteType === 'both' || selectedRouteType === 'primary') && (
                        <MapcnRoute
                            id="primary-route"
                            coordinates={primaryPath}
                            color="#22C55E"
                            width={5}
                            opacity={0.9}
                            onClick={() => setSelectedRouteType('primary')}
                        />
                    )}

                    {/* User Location Marker */}
                    {userLocation && (
                        <MapcnMarker
                            longitude={userLocation[1]}
                            latitude={userLocation[0]}
                            color="#EF4444"
                        />
                    )}

                    {/* Animated Taxi for Primary Route */}
                    {primaryPath && primaryPath.length > 0 && (selectedRouteType === 'both' || selectedRouteType === 'primary') && (
                        <MapcnTaxiAnimator
                            startPos={primaryPath[0]}
                            path={primaryPath}
                            isStarted={isTripStarted}
                            onStart={handleStartTrip}
                        />
                    )}

                    {/* Animated Taxi for Alternative Route */}
                    {alternativePath && alternativePath.length > 0 && (selectedRouteType === 'alternative') && (
                        <MapcnTaxiAnimator
                            startPos={alternativePath[0]}
                            path={alternativePath}
                            isStarted={isAltTripStarted}
                            onStart={handleStartAltTrip}
                        />
                    )}

                    {/* Primary route stops */}
                    {route?.paragens && (selectedRouteType === 'both' || selectedRouteType === 'primary') && (
                        <>
                            {route.paragens.map((stop, i) => (
                                <MapcnMarker
                                    key={`p-${i}`}
                                    longitude={stop.longitude}
                                    latitude={stop.latitude}
                                    color="#22C55E"
                                />
                            ))}
                        </>
                    )}

                    {/* Alternative route stops */}
                    {alternativeRoute?.paragens && (selectedRouteType === 'both' || selectedRouteType === 'alternative') && (
                        <>
                            {alternativeRoute.paragens.map((stop, i) => (
                                <MapcnMarker
                                    key={`a-${i}`}
                                    longitude={stop.longitude}
                                    latitude={stop.latitude}
                                    color="#3B82F6"
                                />
                            ))}
                        </>
                    )}
                </Mapcn>
            </div>

            {/* UI Panel */}
            <div className={`absolute top-0 left-0 w-full z-10 p-4 md:p-6 lg:max-w-[400px] lg:h-full lg:bg-white/90 lg:backdrop-blur-md lg:shadow-2xl ${locationError ? 'opacity-20 pointer-events-none' : ''}`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <a href="/" className="p-2 bg-white rounded-full shadow-md hover:bg-slate-50">
                            <ArrowLeft className="w-6 h-6 text-slate-900" />
                        </a>
                    </div>
                    <button className="p-2 bg-white rounded-full shadow-md">
                        <User className="w-6 h-6 text-slate-900" />
                    </button>
                </div>

                {/* Search Inputs */}
                <div className="bg-white p-4 rounded-3xl shadow-xl space-y-4 border border-slate-100">
                    <div className="space-y-4">
                        {/* Origin */}
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-900 rounded-full ring-4 ring-slate-100"></div>
                            <input
                                type="text"
                                value={origin}
                                readOnly
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-2xl text-slate-900 font-semibold"
                                placeholder="Sua localização"
                            />
                        </div>

                        {/* Destination */}
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-400 rounded-full ring-4 ring-yellow-100"></div>
                            <input
                                type="text"
                                value={destination}
                                onChange={(e) => handleDestinationChange(e.target.value)}
                                onFocus={() => destination.trim() !== '' && setShowDropdown(true)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-2xl text-slate-900 font-semibold"
                                placeholder="Para onde vais?"
                            />
                            {showDropdown && filteredStops.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border max-h-48 overflow-y-auto z-50">
                                    {filteredStops.map((stop) => (
                                        <button
                                            key={stop.id}
                                            onClick={() => handleSelectDestination(stop)}
                                            className="w-full text-left px-4 py-3 hover:bg-yellow-50 border-b last:border-b-0"
                                        >
                                            <span className="font-semibold text-slate-900">{stop.nome}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleStartRoute}
                        disabled={isLoadingRoute || !selectedDestination}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoadingRoute ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Navigation className="w-5 h-5" />
                        )}
                        {isLoadingRoute ? 'Calculando...' : 'Iniciar Rota'}
                    </button>
                </div>

                {/* Route List */}
                {(route || alternativeRoute) && (
                    <div className="mt-6 bg-white rounded-3xl p-6 shadow-xl border">
                        <h3 className="font-bold text-slate-900 mb-4">Melhores Rotas</h3>
                        <div className="space-y-3">
                            {route && (
                                <div
                                    onClick={() => setSelectedRouteType(selectedRouteType === 'primary' ? 'both' : 'primary')}
                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedRouteType === 'primary' || selectedRouteType === 'both' ? 'border-green-400 bg-green-50' : 'border-gray-200 opacity-50'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">MELHOR</span>
                                            <p className="font-bold text-slate-900 mt-1">{route.linhas.join(', ')}</p>
                                            <p className="text-xs text-slate-500">{route.distanciaTotal.toFixed(1)} km • {route.numeroParagens} paragens</p>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleStartTrip(); }}
                                            disabled={isTripStarted}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isTripStarted ? 'bg-green-200 text-green-600' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                                        >
                                            <Play className="w-4 h-4" fill={isTripStarted ? 'currentColor' : 'white'} />
                                        </button>
                                    </div>
                                </div>
                            )}
                            {alternativeRoute && (
                                <div
                                    onClick={() => setSelectedRouteType(selectedRouteType === 'alternative' ? 'both' : 'alternative')}
                                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedRouteType === 'alternative' || selectedRouteType === 'both' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 opacity-50'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">ALTERNATIVA</span>
                                            <p className="font-bold text-slate-900 mt-1">{alternativeRoute.linhas.join(', ')}</p>
                                            <p className="text-xs text-slate-500">{alternativeRoute.distanciaTotal.toFixed(1)} km • {alternativeRoute.numeroParagens} paragens</p>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleStartAltTrip(); }}
                                            disabled={isAltTripStarted}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isAltTripStarted ? 'bg-blue-200 text-blue-600' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                                        >
                                            <Play className="w-4 h-4" fill={isAltTripStarted ? 'currentColor' : 'white'} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
