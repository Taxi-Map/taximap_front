'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mapcn, MapcnRoute, MapcnMarker, MapcnControls, MapcnTaxiAnimator } from './Mapcn';
import { ArrowLeft, Navigation, User, Play, Share2, Users, Menu, X, Bookmark, Clock, MapPin, Footprints, Route } from 'lucide-react';
import { Link } from 'react-router-dom';
import { routeService, RouteData, Stop } from '../services/routeService';
import { orsService } from '../services/orsService';
import { findTwoNearestStops } from '../utils/geoUtils';
import { fuzzySearch } from '../utils/fuzzySearch';

export default function MapcnPage() {
    const [searchParams] = useSearchParams();
    const [destination, setDestination] = useState(searchParams.get('destination') || '');
    const [origin, setOrigin] = useState('Obtendo localização...');

    const [userLocation, setUserLocation] = useState<[number, number] | undefined>(undefined);
    const [locationError, setLocationError] = useState(false);

    // Route state
    const [route, setRoute] = useState<RouteData | null>(null);
    const [alternativeRoute, setAlternativeRoute] = useState<RouteData | null>(null);
    const [primarySegmentPaths, setPrimarySegmentPaths] = useState<[number, number][][]>([]);
    const [alternativeSegmentPaths, setAlternativeSegmentPaths] = useState<[number, number][][]>([]);
    const [userToOriginPath, setUserToOriginPath] = useState<[number, number][] | null>(null);
    const [initialWalkPath, setInitialWalkPath] = useState<[number, number][] | null>(null);
    const [intermediateWalkPath, setIntermediateWalkPath] = useState<[number, number][] | null>(null);
    const [altIntermediateWalkPath, setAltIntermediateWalkPath] = useState<[number, number][] | null>(null); // For alternative route
    const [incluiCaminhada, setIncluiCaminhada] = useState(false);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);

    // Stops
    const [allStops, setAllStops] = useState<Stop[]>([]);
    const [filteredStops, setFilteredStops] = useState<Stop[]>([]);
    const [selectedDestination, setSelectedDestination] = useState<Stop | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedRouteType, setSelectedRouteType] = useState<'primary' | 'alternative' | 'both'>('both');
    const [isTripStarted, setIsTripStarted] = useState(false);
    const [isAltTripStarted, setIsAltTripStarted] = useState(false);
    const [showArrivalPopup, setShowArrivalPopup] = useState(false);
    const [arrivalDestination, setArrivalDestination] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(true);
    const [showWalkingPopup, setShowWalkingPopup] = useState(false);
    const [walkingMessage, setWalkingMessage] = useState('');

    const handleStartTrip = () => {
        setIsTripStarted(true);
        setSelectedRouteType('primary');
    };

    const handleStartAltTrip = () => {
        setIsAltTripStarted(true);
        setSelectedRouteType('alternative');
    };

    const handlePrimaryArrival = () => {
        console.log('[TestPage] handlePrimaryArrival called!');
        console.log('[TestPage] Setting showArrivalPopup to true');
        setShowArrivalPopup(true);
        setArrivalDestination(route?.paragens[route.paragens.length - 1]?.nome || 'Destino');
        // Don't reset trip yet - wait for popup close
    };

    const handleAltArrival = () => {
        console.log('[TestPage] handleAltArrival called!');
        console.log('[TestPage] Setting showArrivalPopup to true');
        setShowArrivalPopup(true);
        setArrivalDestination(alternativeRoute?.paragens[alternativeRoute.paragens.length - 1]?.nome || 'Destino');
        // Don't reset trip yet - wait for popup close
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

    // Auto-filter stops when destination comes from URL params and stops are loaded
    useEffect(() => {
        if (allStops.length > 0 && destination.trim() !== '' && !selectedDestination) {
            // Trigger fuzzy search for the pre-filled destination
            const fuzzyResults = fuzzySearch<Stop>(
                destination,
                allStops,
                (stop) => stop.nome,
                0.3
            );
            const filtered = fuzzyResults.map(result => result.item);
            setFilteredStops(filtered);
            setShowDropdown(true);
        }
    }, [allStops, destination, selectedDestination]);

    // Filter stops with fuzzy search
    const handleDestinationChange = (value: string) => {
        setDestination(value);
        setSelectedDestination(null);
        if (value.trim() === '') {
            setFilteredStops(allStops);
            setShowDropdown(false);
        } else {
            // Use fuzzy search to find matches even with typos
            const fuzzyResults = fuzzySearch<Stop>(
                value,
                allStops,
                (stop) => stop.nome,
                0.3 // minimum similarity score
            );
            // Extract just the items, already sorted by score
            const filtered = fuzzyResults.map(result => result.item);
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
        setPrimarySegmentPaths([]);
        setAlternativeSegmentPaths([]);
        setRoute(null);
        setAlternativeRoute(null);
        setInitialWalkPath(null);
        setIntermediateWalkPath(null);
        setAltIntermediateWalkPath(null);
        setIncluiCaminhada(false);

        try {
            console.log(`[MapcnPage] 📍 User location: [${userLocation[0]}, ${userLocation[1]}]`);
            console.log(`[MapcnPage] 🎯 Destination: ${selectedDestination.nome} (id=${selectedDestination.id})`);

            // Call backend with user coordinates - backend decides best origin
            const routeData = await routeService.getRouteFromCoords(
                userLocation[0],  // latitude
                userLocation[1],  // longitude
                selectedDestination.id
            );

            if (!routeData?.sucesso) {
                alert('Erro ao obter rota do servidor.');
                setIsLoadingRoute(false);
                return;
            }

            const { analise, principal, alternativas, paragemOrigemSugerida, distanciaAteParagem } = routeData.dados;

            // Log suggested origin from backend
            if (paragemOrigemSugerida) {
                console.log(`[MapcnPage] ✅ Backend suggested origin: ${paragemOrigemSugerida.nome}`);
                console.log(`[MapcnPage] 📏 Distance to origin: ${distanciaAteParagem}m`);
            }

            // Handle "can walk" case
            if (analise?.podeIrAPe) {
                setWalkingMessage(analise.avisos?.[0] || 'Esta rota é curta o suficiente para ir a pé!');
                setShowWalkingPopup(true);

                const directWalk = await orsService.getWalkingRoute([
                    userLocation,
                    [selectedDestination.latitude, selectedDestination.longitude]
                ]);
                if (directWalk) {
                    setUserToOriginPath(directWalk.map(([lat, lng]) => [lng, lat]));
                }
                setIsLoadingRoute(false);
                return;
            }

            // Handle no route found
            if (!principal) {
                const errorMsg = analise?.avisos?.join('\n') || 'Não foi encontrada nenhuma rota.';
                alert(errorMsg);
                setIsLoadingRoute(false);
                return;
            }

            // ===== PRIMARY ROUTE =====
            setRoute(principal);
            setOrigin(paragemOrigemSugerida?.nome || principal.segmentos[0]?.paragensPercurso[0]?.nome || 'Origem');

            // Process each taxi segment individually
            const segmentPaths: [number, number][][] = [];
            for (const segmento of principal.segmentos) {
                if (segmento.paragensPercurso && segmento.paragensPercurso.length > 0) {
                    const segmentWaypoints: [number, number][] = segmento.paragensPercurso.map(
                        s => [s.latitude, s.longitude]
                    );
                    const segPath = await orsService.getRoute(segmentWaypoints);
                    if (segPath) {
                        segmentPaths.push(segPath.map(([lat, lng]) => [lng, lat]));
                    }
                }
            }
            setPrimarySegmentPaths(segmentPaths);

            // Walking route from user to suggested origin (or first taxi stop)
            const firstTaxiStop = principal.segmentos[0]?.paragensPercurso[0];
            const originCoords: [number, number] = paragemOrigemSugerida
                ? [paragemOrigemSugerida.latitude, paragemOrigemSugerida.longitude]
                : firstTaxiStop ? [firstTaxiStop.latitude, firstTaxiStop.longitude] : userLocation;
            const walkPath = await orsService.getWalkingRoute([userLocation, originCoords]);
            if (walkPath) {
                setUserToOriginPath(walkPath.map(([lat, lng]) => [lng, lat]));
            }

            // Process caminhadaInicial if present (walk from suggested origin to first taxi stop)
            if (principal.caminhadaInicial) {
                setIncluiCaminhada(true);
                const { paragemOrigem, paragemDestino } = principal.caminhadaInicial;
                const initWalk = await orsService.getWalkingRoute([
                    [paragemOrigem.latitude, paragemOrigem.longitude],
                    [paragemDestino.latitude, paragemDestino.longitude]
                ]);
                if (initWalk) {
                    setInitialWalkPath(initWalk.map(([lat, lng]) => [lng, lat]));
                }
                console.log(`[MapcnPage] 🚶 Initial walk: ${principal.caminhadaInicial.distanciaMetros}m`);
            }

            // Process intermediate walking segment (caminhadaFinal) if present
            if (principal.caminhadaFinal) {
                setIncluiCaminhada(true);
                const { paragemOrigem, paragemDestino } = principal.caminhadaFinal;
                const intermediateWalk = await orsService.getWalkingRoute([
                    [paragemOrigem.latitude, paragemOrigem.longitude],
                    [paragemDestino.latitude, paragemDestino.longitude]
                ]);
                if (intermediateWalk) {
                    setIntermediateWalkPath(intermediateWalk.map(([lat, lng]) => [lng, lat]));
                }
                console.log(`[MapcnPage] 🚶 Intermediate walk: ${principal.caminhadaFinal.distanciaMetros}m`);
            }

            // ===== ALTERNATIVE ROUTE (from backend only) =====
            if (alternativas && alternativas.length > 0) {
                const altRoute = alternativas[0];
                setAlternativeRoute(altRoute);

                // Process each alternative segment individually
                const altSegmentPaths: [number, number][][] = [];
                for (const segmento of altRoute.segmentos || []) {
                    if (segmento.paragensPercurso && segmento.paragensPercurso.length > 0) {
                        const segmentWaypoints: [number, number][] = segmento.paragensPercurso.map(
                            s => [s.latitude, s.longitude]
                        );
                        const segPath = await orsService.getRoute(segmentWaypoints);
                        if (segPath) {
                            altSegmentPaths.push(segPath.map(([lat, lng]) => [lng, lat]));
                        }
                    }
                }
                setAlternativeSegmentPaths(altSegmentPaths);

                // Process caminhadaFinal for alternative route (orange walking line)
                if (altRoute.caminhadaFinal) {
                    const { paragemOrigem, paragemDestino } = altRoute.caminhadaFinal;
                    const altWalk = await orsService.getWalkingRoute([
                        [paragemOrigem.latitude, paragemOrigem.longitude],
                        [paragemDestino.latitude, paragemDestino.longitude]
                    ]);
                    if (altWalk) {
                        setAltIntermediateWalkPath(altWalk.map(([lat, lng]) => [lng, lat]));
                    }
                }
            }

        } catch (e) {
            console.error("Error:", e);
            alert('Erro ao calcular rota.');
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

                    {/* Walking route from user to first stop (dashed gray) */}
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

                    {/* ⭐ NEW: Intermediate walking route between taxi segments (dashed orange) */}
                    {intermediateWalkPath && (selectedRouteType === 'both' || selectedRouteType === 'primary') && (
                        <MapcnRoute
                            id="intermediate-walking-route"
                            coordinates={intermediateWalkPath}
                            color="#F97316"
                            width={4}
                            opacity={0.8}
                            dashArray={[8, 8]}
                        />
                    )}

                    {/* Initial walk from origin stop to first taxi stop (dashed orange) */}
                    {initialWalkPath && (selectedRouteType === 'both' || selectedRouteType === 'primary') && (
                        <MapcnRoute
                            id="initial-walking-route"
                            coordinates={initialWalkPath}
                            color="#F97316"
                            width={4}
                            opacity={0.8}
                            dashArray={[8, 8]}
                        />
                    )}

                    {/* Alternative Route Segments (BLUE) */}
                    {alternativeSegmentPaths.length > 0 && (selectedRouteType === 'both' || selectedRouteType === 'alternative') && (
                        alternativeSegmentPaths.map((segPath, idx) => (
                            <MapcnRoute
                                key={`alt-seg-${idx}`}
                                id={`alt-route-${idx}`}
                                coordinates={segPath}
                                color="#3B82F6"
                                width={4}
                                opacity={selectedRouteType === 'alternative' ? 0.9 : 0.6}
                                onClick={() => setSelectedRouteType('alternative')}
                            />
                        ))
                    )}

                    {/* Alternative route intermediate walking (dashed orange) */}
                    {altIntermediateWalkPath && (selectedRouteType === 'both' || selectedRouteType === 'alternative') && (
                        <MapcnRoute
                            id="alt-intermediate-walking-route"
                            coordinates={altIntermediateWalkPath}
                            color="#F97316"
                            width={4}
                            opacity={0.8}
                            dashArray={[8, 8]}
                        />
                    )}

                    {/* Primary Route Segments (GREEN) */}
                    {primarySegmentPaths.length > 0 && (selectedRouteType === 'both' || selectedRouteType === 'primary') && (
                        primarySegmentPaths.map((segPath, idx) => (
                            <MapcnRoute
                                key={`primary-seg-${idx}`}
                                id={`primary-route-${idx}`}
                                coordinates={segPath}
                                color="#22C55E"
                                width={5}
                                opacity={0.9}
                                onClick={() => setSelectedRouteType('primary')}
                            />
                        ))
                    )}

                    {/* Destination Marker */}
                    {selectedDestination && (
                        <MapcnMarker
                            longitude={selectedDestination.longitude}
                            latitude={selectedDestination.latitude}
                            color="#EAB308"
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

                    {/* Animated Taxi for Primary Route (uses combined path for animation) */}
                    {primarySegmentPaths.length > 0 && (selectedRouteType === 'both' || selectedRouteType === 'primary') && (
                        <MapcnTaxiAnimator
                            startPos={primarySegmentPaths[0][0]}
                            path={primarySegmentPaths.flat()}
                            isStarted={isTripStarted}
                            onStart={handleStartTrip}
                            onArrival={handlePrimaryArrival}
                        />
                    )}

                    {/* Animated Taxi for Alternative Route */}
                    {alternativeSegmentPaths.length > 0 && (selectedRouteType === 'alternative') && (
                        <MapcnTaxiAnimator
                            startPos={alternativeSegmentPaths[0][0]}
                            path={alternativeSegmentPaths.flat()}
                            isStarted={isAltTripStarted}
                            onStart={handleStartAltTrip}
                            onArrival={handleAltArrival}
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

            {/* Arrival Popup - Modal Overlay */}
            {showArrivalPopup && (
                <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">🎉 Chegou!</h2>
                        <p className="text-slate-600 mb-6">
                            Você chegou ao seu destino: <strong className="text-slate-900">{arrivalDestination}</strong>
                        </p>
                        <button
                            onClick={() => {
                                setShowArrivalPopup(false);
                                setSelectedRouteType('both');
                                setIsTripStarted(false);
                                setIsAltTripStarted(false);
                            }}
                            className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-bold text-lg transition-all"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}

            {/* Walking Suggestion Popup */}
            {showWalkingPopup && (
                <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Footprints className="w-10 h-10 text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Sugestão de Caminhada</h2>
                        <p className="text-slate-600 mb-6">
                            {walkingMessage}
                        </p>
                        <button
                            onClick={() => setShowWalkingPopup(false)}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg transition-all"
                        >
                            Ver Caminho
                        </button>
                    </div>
                </div>
            )}

            {/* Fixed Buttons - Mobile Only */}
            {isMenuOpen && (
                <>
                    {/* Close Button */}
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="fixed top-4 left-4 z-30 p-2 bg-red-500 hover:bg-red-600 rounded-full shadow-lg lg:hidden"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>

                    {/* Profile & Builder Buttons */}
                    <div className="fixed top-4 right-4 z-30 flex items-center gap-2 lg:hidden">
                        <Link
                            to="/builder"
                            className="p-2 bg-white rounded-full shadow-lg hover:bg-slate-50 transition-colors"
                            title="Route Builder"
                        >
                            <Route className="w-6 h-6 text-slate-900" />
                        </Link>
                        <a href="/profile" className="p-2 bg-white rounded-full shadow-lg hover:bg-slate-50 transition-colors">
                            <User className="w-6 h-6 text-slate-900" />
                        </a>
                    </div>
                </>
            )}

            {/* UI Panel */}
            <div className={`absolute top-0 left-0 w-full z-10 p-4 pt-16 md:p-6 lg:pt-6 lg:max-w-[400px] lg:h-full lg:bg-white/90 lg:backdrop-blur-md lg:shadow-2xl max-h-[100vh] overflow-y-auto pb-20 transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} ${locationError ? 'opacity-20 pointer-events-none' : ''}`}>
                {/* Header - Desktop only buttons */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        {/* Close button for desktop only */}
                        <button onClick={() => setIsMenuOpen(false)} className="hidden lg:block p-2 bg-white rounded-full shadow-md hover:bg-slate-50">
                            <X className="w-6 h-6 text-slate-900" />
                        </button>
                    </div>
                    {/* Profile & Builder for desktop only */}
                    <div className="hidden lg:flex items-center gap-2">
                        <Link
                            to="/builder"
                            className="p-2 bg-white rounded-full shadow-md hover:bg-slate-50 transition-colors"
                            title="Route Builder"
                        >
                            <Route className="w-6 h-6 text-slate-900" />
                        </Link>
                        <a href="/profile" className="p-2 bg-white rounded-full shadow-md hover:bg-slate-50 transition-colors">
                            <User className="w-6 h-6 text-slate-900" />
                        </a>
                    </div>
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

                {/* Action Buttons (Share, etc) */}
                <div className="flex flex-wrap gap-2 mt-4">
                    <button className="flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2.5 bg-white rounded-xl shadow-md font-bold text-sm text-slate-700 border border-slate-100">
                        <Share2 className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">Partilhar</span>
                    </button>
                    <button className="flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2.5 bg-white rounded-xl shadow-md font-bold text-sm text-slate-700 border border-slate-100">
                        <Users className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">Ver pessoas</span>
                    </button>
                </div>

                {/* Route List */}
                {(route || alternativeRoute) && (
                    <div className="mt-6 bg-white rounded-3xl p-6 shadow-xl border">
                        <h3 className="font-bold text-slate-900 mb-4">Melhores Rotas</h3>
                        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                            {route && (
                                <div
                                    onClick={() => setSelectedRouteType(selectedRouteType === 'primary' ? 'both' : 'primary')}
                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedRouteType === 'primary' || selectedRouteType === 'both' ? 'border-green-400 bg-green-50' : 'border-gray-200 opacity-50'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">MELHOR</span>
                                                {route.numeroTaxis && (
                                                    <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                                                        🚖 {route.numeroTaxis} {route.numeroTaxis === 1 ? 'táxi' : 'táxis'}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="font-bold text-slate-900 mt-1">{route.linhas.join(' → ')}</p>
                                            <p className="text-xs text-slate-500">{route.distanciaTotal.toFixed(1)} km • {route.numeroParagens || route.paragensTotal} paragens</p>
                                            {route.descricaoPercurso && route.descricaoPercurso.length > 0 && (
                                                <p className="text-xs text-slate-400 mt-1 truncate">{route.descricaoPercurso[0]}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleStartTrip(); }}
                                            disabled={isTripStarted}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ml-3 ${isTripStarted ? 'bg-green-200 text-green-600' : 'bg-green-500 hover:bg-green-600 text-white'}`}
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
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">ALTERNATIVA</span>
                                                {alternativeRoute.numeroTaxis && (
                                                    <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                                                        🚖 {alternativeRoute.numeroTaxis} {alternativeRoute.numeroTaxis === 1 ? 'táxi' : 'táxis'}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="font-bold text-slate-900 mt-1">{alternativeRoute.linhas.join(' → ')}</p>
                                            <p className="text-xs text-slate-500">{alternativeRoute.distanciaTotal.toFixed(1)} km • {alternativeRoute.numeroParagens || alternativeRoute.paragensTotal} paragens</p>
                                            {alternativeRoute.descricaoPercurso && alternativeRoute.descricaoPercurso.length > 0 && (
                                                <p className="text-xs text-slate-400 mt-1 truncate">{alternativeRoute.descricaoPercurso[0]}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleStartAltTrip(); }}
                                            disabled={isAltTripStarted}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ml-3 ${isAltTripStarted ? 'bg-blue-200 text-blue-600' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
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

            {/* Floating Open Menu Button - Mobile only */}
            {!isMenuOpen && (
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className="fixed top-4 left-4 z-20 p-3 bg-white rounded-full shadow-lg hover:bg-slate-50 transition-all lg:hidden"
                >
                    <Menu className="w-6 h-6 text-slate-900" />
                </button>
            )}

            {/* Collapsed Sidebar - Desktop only */}
            {!isMenuOpen && (
                <div className="hidden lg:flex fixed top-0 left-0 h-full w-16 bg-white/95 backdrop-blur-md shadow-xl flex-col items-center py-6 z-20 border-r border-slate-200">
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="p-3 hover:bg-slate-100 rounded-xl transition-all mb-6"
                    >
                        <Menu className="w-6 h-6 text-slate-700" />
                    </button>

                    <div className="flex-1 flex flex-col items-center gap-2">
                        <Link to="/builder" className="p-3 hover:bg-slate-100 rounded-xl transition-all" title="Route Builder">
                            <Route className="w-5 h-5 text-slate-600" />
                        </Link>
                        <a href="/profile" className="p-3 hover:bg-slate-100 rounded-xl transition-all" title="Perfil">
                            <User className="w-5 h-5 text-slate-600" />
                        </a>
                        <button className="p-3 hover:bg-slate-100 rounded-xl transition-all" title="Partilhar">
                            <Share2 className="w-5 h-5 text-slate-600" />
                        </button>
                        <button className="p-3 hover:bg-slate-100 rounded-xl transition-all" title="Ver pessoas">
                            <Users className="w-5 h-5 text-slate-600" />
                        </button>

                        <div className="w-8 h-px bg-slate-200 my-2"></div>

                        {/* Quick destination shortcuts */}
                        {route && (
                            <button className="p-2 hover:bg-green-50 rounded-xl transition-all flex flex-col items-center gap-1">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <MapPin className="w-4 h-4 text-green-600" />
                                </div>
                                <span className="text-[9px] text-slate-500 font-medium truncate max-w-[50px]">
                                    {route.paragens[route.paragens.length - 1]?.nome.split(' ')[0] || 'Destino'}
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
