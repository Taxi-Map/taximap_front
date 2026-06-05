import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mapcn, MapcnRoute, MapcnMarker, MapcnControls, MapcnTaxiAnimator } from './Mapcn';
import { ArrowLeft, Navigation, User, Play, Share2, Users, Menu, X, Bookmark, Clock, MapPin, Footprints, Route, CarTaxiFront, UserPlus, Shield, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { routeService, RouteData, Stop } from '../services/routeService';
import { orsService } from '../services/orsService';
import { findTwoNearestStops } from '../utils/geoUtils';
import { fuzzySearch } from '../utils/fuzzySearch';
import { LoginModal } from '../components/LoginModal';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { Badge } from '../components/ui/Badge';
import { SkeletonRouteCard } from '../components/ui/Skeleton';

export default function MapcnPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [destination, setDestination] = useState(searchParams.get('destination') || '');
    const [origin, setOrigin] = useState('Obtendo localização...');

    const [userLocation, setUserLocation] = useState<[number, number] | undefined>(undefined);
    const [locationError, setLocationError] = useState(false);

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(() => authService.isAuthenticated());
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin' || user?.role === 'staff';

    useEffect(() => {
        if (searchParams.get('login') === 'true' && !isLoggedIn) {
            setShowLoginModal(true);
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('login');
            setSearchParams(newParams, { replace: true });
        }
    }, [searchParams, isLoggedIn, setSearchParams]);

    const handleAuthSuccess = () => { setIsLoggedIn(true); setShowLoginModal(false); };

    // Route state
    const [route, setRoute] = useState<RouteData | null>(null);
    const [alternativeRoute, setAlternativeRoute] = useState<RouteData | null>(null);
    const [primarySegmentPaths, setPrimarySegmentPaths] = useState<[number, number][][]>([]);
    const [alternativeSegmentPaths, setAlternativeSegmentPaths] = useState<[number, number][][]>([]);
    const [userToOriginPath, setUserToOriginPath] = useState<[number, number][] | null>(null);
    const [altUserToOriginPath, setAltUserToOriginPath] = useState<[number, number][] | null>(null);
    const [transferWalkPaths, setTransferWalkPaths] = useState<[number, number][][]>([]);
    const [altTransferWalkPaths, setAltTransferWalkPaths] = useState<[number, number][][]>([]);
    const [initialWalkPath, setInitialWalkPath] = useState<[number, number][] | null>(null);
    const [intermediateWalkPath, setIntermediateWalkPath] = useState<[number, number][] | null>(null);
    const [altIntermediateWalkPath, setAltIntermediateWalkPath] = useState<[number, number][] | null>(null);
    const [incluiCaminhada, setIncluiCaminhada] = useState(false);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);

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
    const [showNoRouteModal, setShowNoRouteModal] = useState(false);
    const [noRouteMessage, setNoRouteMessage] = useState('');

    const handleStartTrip = () => { setIsTripStarted(true); setSelectedRouteType('primary'); };
    const handleStartAltTrip = () => { setIsAltTripStarted(true); setSelectedRouteType('alternative'); };

    const handlePrimaryArrival = () => { setShowArrivalPopup(true); setArrivalDestination(route?.paragens[route.paragens.length - 1]?.nome || 'Destino'); };
    const handleAltArrival = () => { setShowArrivalPopup(true); setArrivalDestination(alternativeRoute?.paragens[alternativeRoute.paragens.length - 1]?.nome || 'Destino'); };

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => { setOrigin('Minha localização actual'); setUserLocation([position.coords.latitude, position.coords.longitude]); setLocationError(false); },
                (error) => { console.error("Error getting location:", error); setOrigin('Activar localização'); setLocationError(true); }
            );
        }
    }, []);

    useEffect(() => {
        const fetchStops = async () => { const stops = await routeService.getAllStops(); if (stops) { setAllStops(stops); setFilteredStops(stops); } };
        fetchStops();
    }, []);

    useEffect(() => {
        if (allStops.length > 0 && destination.trim() !== '' && !selectedDestination) {
            const fuzzyResults = fuzzySearch<Stop>(destination, allStops, (stop) => stop.nome, 0.3);
            setFilteredStops(fuzzyResults.map(r => r.item));
            setShowDropdown(true);
        }
    }, [allStops, destination, selectedDestination]);

    const handleDestinationChange = (value: string) => {
        setDestination(value);
        setSelectedDestination(null);
        if (value.trim() === '') { setFilteredStops(allStops); setShowDropdown(false); }
        else {
            const fuzzyResults = fuzzySearch<Stop>(value, allStops, (stop) => stop.nome, 0.3);
            setFilteredStops(fuzzyResults.map(r => r.item));
            setShowDropdown(true);
        }
    };

    const handleSelectDestination = (stop: Stop) => { setDestination(stop.nome); setSelectedDestination(stop); setShowDropdown(false); };

    const handleStartRoute = async () => {
        if (!selectedDestination || !userLocation) return;
        setIsLoadingRoute(true);
        setPrimarySegmentPaths([]); setAlternativeSegmentPaths([]); setRoute(null); setAlternativeRoute(null);
        setInitialWalkPath(null); setUserToOriginPath(null); setAltUserToOriginPath(null);
        setTransferWalkPaths([]); setAltTransferWalkPaths([]); setIntermediateWalkPath(null); setAltIntermediateWalkPath(null); setIncluiCaminhada(false);

        try {
            const routeData = await routeService.getRouteFromCoords(userLocation[0], userLocation[1], selectedDestination.id);
            if (!routeData?.sucesso) { toast.error('Erro ao obter rota do servidor.'); setIsLoadingRoute(false); return; }

            const { analise, principal, alternativas, paragemOrigemSugerida, distanciaAteParagem } = routeData.dados;

            if (analise?.podeIrAPe) {
                setWalkingMessage(analise.avisos?.[0] || 'Esta rota é curta o suficiente para ir a pé!');
                setShowWalkingPopup(true);
                const directWalk = await orsService.getWalkingRoute([userLocation, [selectedDestination.latitude, selectedDestination.longitude]]);
                if (directWalk) setUserToOriginPath(directWalk.map(([lat, lng]) => [lng, lat]));
                setIsLoadingRoute(false); return;
            }

            if (!principal) {
                const errorMsg = analise?.avisos?.join('\n') || 'Não foi encontrada nenhuma rota.';
                setNoRouteMessage(errorMsg); setShowNoRouteModal(true); setIsLoadingRoute(false); return;
            }

            setRoute(principal);
            setOrigin(paragemOrigemSugerida?.nome || principal.segmentos[0]?.paragensPercurso[0]?.nome || 'Origem');

            const segmentPaths: [number, number][][] = [];
            for (const segmento of principal.segmentos) {
                if (segmento.paragensPercurso && segmento.paragensPercurso.length > 0) {
                    const segPath = await orsService.getRoute(segmento.paragensPercurso.map(s => [s.latitude, s.longitude]));
                    if (segPath) segmentPaths.push(segPath.map(([lat, lng]) => [lng, lat]));
                }
            }
            setPrimarySegmentPaths(segmentPaths);

            const transfers: [number, number][][] = [];
            for (let i = 0; i < principal.segmentos.length - 1; i++) {
                const currentSeg = principal.segmentos[i], nextSeg = principal.segmentos[i + 1];
                if (currentSeg.paragensPercurso && nextSeg.paragensPercurso) {
                    const lastStop = currentSeg.paragensPercurso[currentSeg.paragensPercurso.length - 1];
                    const nextStartStop = nextSeg.paragensPercurso[0];
                    if (lastStop && nextStartStop && lastStop.id !== nextStartStop.id) transfers.push([[lastStop.longitude, lastStop.latitude], [nextStartStop.longitude, nextStartStop.latitude]]);
                }
            }
            setTransferWalkPaths(transfers);

            const firstTaxiStop = principal.segmentos[0]?.paragensPercurso[0];
            const originCoords: [number, number] = paragemOrigemSugerida ? [paragemOrigemSugerida.latitude, paragemOrigemSugerida.longitude] : firstTaxiStop ? [firstTaxiStop.latitude, firstTaxiStop.longitude] : userLocation;
            setUserToOriginPath([[userLocation[1], userLocation[0]], [originCoords[1], originCoords[0]]] as [number, number][]);

            if (principal.caminhadaInicial) {
                setIncluiCaminhada(true);
                setInitialWalkPath([[principal.caminhadaInicial.paragemOrigem.longitude, principal.caminhadaInicial.paragemOrigem.latitude], [principal.caminhadaInicial.paragemDestino.longitude, principal.caminhadaInicial.paragemDestino.latitude]] as [number, number][]);
            }
            if (principal.caminhadaFinal) {
                setIncluiCaminhada(true);
                setIntermediateWalkPath([[principal.caminhadaFinal.paragemOrigem.longitude, principal.caminhadaFinal.paragemOrigem.latitude], [principal.caminhadaFinal.paragemDestino.longitude, principal.caminhadaFinal.paragemDestino.latitude]] as [number, number][]);
            }

            if (alternativas && alternativas.length > 0) {
                const altRoute = alternativas[0];
                setAlternativeRoute(altRoute);
                const altSegmentPaths: [number, number][][] = [];
                for (const segmento of altRoute.segmentos || []) {
                    if (segmento.paragensPercurso && segmento.paragensPercurso.length > 0) {
                        const segPath = await orsService.getRoute(segmento.paragensPercurso.map(s => [s.latitude, s.longitude]));
                        if (segPath) altSegmentPaths.push(segPath.map(([lat, lng]) => [lng, lat]));
                    }
                }
                setAlternativeSegmentPaths(altSegmentPaths);

                const altTransfers: [number, number][][] = [];
                for (let i = 0; i < (altRoute.segmentos?.length || 0) - 1; i++) {
                    const currentSeg = altRoute.segmentos[i], nextSeg = altRoute.segmentos[i + 1];
                    if (currentSeg.paragensPercurso && nextSeg.paragensPercurso) {
                        const lastStop = currentSeg.paragensPercurso[currentSeg.paragensPercurso.length - 1];
                        const nextStartStop = nextSeg.paragensPercurso[0];
                        if (lastStop && nextStartStop && lastStop.id !== nextStartStop.id) altTransfers.push([[lastStop.longitude, lastStop.latitude], [nextStartStop.longitude, nextStartStop.latitude]]);
                    }
                }
                setAltTransferWalkPaths(altTransfers);

                if (altRoute.caminhadaFinal) {
                    setAltIntermediateWalkPath([[altRoute.caminhadaFinal.paragemOrigem.longitude, altRoute.caminhadaFinal.paragemOrigem.latitude], [altRoute.caminhadaFinal.paragemDestino.longitude, altRoute.caminhadaFinal.paragemDestino.latitude]] as [number, number][]);
                }
                const firstAltStop = altRoute.segmentos?.[0]?.paragensPercurso?.[0];
                if (firstAltStop) setAltUserToOriginPath([[userLocation[1], userLocation[0]], [firstAltStop.longitude, firstAltStop.latitude]] as [number, number][]);
            }
        } catch (e) { console.error("Error:", e); toast.error('Erro ao calcular rota.'); }
        setIsLoadingRoute(false);
    };

    const mapCenter: [number, number] = userLocation ? [userLocation[1], userLocation[0]] : [13.2345, -8.839];

    return (
        <div className="min-h-screen bg-sand overflow-hidden relative">
            {/* Map Background */}
            <div className="absolute inset-0 z-0">
                <Mapcn center={mapCenter} zoom={14}>
                    <MapcnControls showZoom showLocate />

                    {userToOriginPath && (selectedRouteType === 'both' || selectedRouteType === 'primary') && (
                        <MapcnRoute id="walking-route" coordinates={userToOriginPath} color="#64748B" width={4} opacity={0.7} dashArray={[10, 10]} />
                    )}
                    {altUserToOriginPath && (selectedRouteType === 'both' || selectedRouteType === 'alternative') && (
                        <MapcnRoute id="alt-walking-route" coordinates={altUserToOriginPath} color="#64748B" width={4} opacity={0.7} dashArray={[10, 10]} />
                    )}

                    {transferWalkPaths.map((path, idx) => (
                        (selectedRouteType === 'both' || selectedRouteType === 'primary') && (
                            <MapcnRoute key={`transfer-${idx}`} id={`transfer-route-${idx}`} coordinates={path} color="#F4A261" width={4} opacity={0.8} dashArray={[8, 8]} />
                        )
                    ))}
                    {altTransferWalkPaths.map((path, idx) => (
                        (selectedRouteType === 'both' || selectedRouteType === 'alternative') && (
                            <MapcnRoute key={`alt-transfer-${idx}`} id={`alt-transfer-route-${idx}`} coordinates={path} color="#F4A261" width={4} opacity={0.8} dashArray={[8, 8]} />
                        )
                    ))}
                    {intermediateWalkPath && (selectedRouteType === 'both' || selectedRouteType === 'primary') && (
                        <MapcnRoute id="intermediate-walking-route" coordinates={intermediateWalkPath} color="#F4A261" width={4} opacity={0.8} dashArray={[8, 8]} />
                    )}
                    {initialWalkPath && (selectedRouteType === 'both' || selectedRouteType === 'primary') && (
                        <MapcnRoute id="initial-walking-route" coordinates={initialWalkPath} color="#F4A261" width={4} opacity={0.8} dashArray={[8, 8]} />
                    )}

                    {alternativeSegmentPaths.length > 0 && (selectedRouteType === 'both' || selectedRouteType === 'alternative') && (
                        alternativeSegmentPaths.map((segPath, idx) => (
                            <MapcnRoute key={`alt-seg-${idx}`} id={`alt-route-${idx}`} coordinates={segPath} color="#2E6B9E" width={4}
                                opacity={selectedRouteType === 'alternative' ? 0.9 : 0.6} onClick={() => setSelectedRouteType('alternative')} />
                        ))
                    )}
                    {altIntermediateWalkPath && (selectedRouteType === 'both' || selectedRouteType === 'alternative') && (
                        <MapcnRoute id="alt-intermediate-walking-route" coordinates={altIntermediateWalkPath} color="#F4A261" width={4} opacity={0.8} dashArray={[8, 8]} />
                    )}

                    {primarySegmentPaths.length > 0 && (selectedRouteType === 'both' || selectedRouteType === 'primary') && (
                        primarySegmentPaths.map((segPath, idx) => (
                            <MapcnRoute key={`primary-seg-${idx}`} id={`primary-route-${idx}`} coordinates={segPath} color="#22C55E" width={5}
                                opacity={0.9} onClick={() => setSelectedRouteType('primary')} />
                        ))
                    )}

                    {selectedDestination && <MapcnMarker longitude={selectedDestination.longitude} latitude={selectedDestination.latitude} color="#F4A261" />}
                    {userLocation && <MapcnMarker longitude={userLocation[1]} latitude={userLocation[0]} color="#EF4444" />}

                    {primarySegmentPaths.length > 0 && (selectedRouteType === 'both' || selectedRouteType === 'primary') && (
                        <MapcnTaxiAnimator startPos={primarySegmentPaths[0][0]} path={primarySegmentPaths.flat()} isStarted={isTripStarted} onStart={handleStartTrip} onArrival={handlePrimaryArrival} />
                    )}
                    {alternativeSegmentPaths.length > 0 && selectedRouteType === 'alternative' && (
                        <MapcnTaxiAnimator startPos={alternativeSegmentPaths[0][0]} path={alternativeSegmentPaths.flat()} isStarted={isAltTripStarted} onStart={handleStartAltTrip} onArrival={handleAltArrival} />
                    )}

                    {route?.paragens && (selectedRouteType === 'both' || selectedRouteType === 'primary') && (
                        route.paragens.map((stop, i) => <MapcnMarker key={`p-${i}`} longitude={stop.longitude} latitude={stop.latitude} color="#22C55E" />)
                    )}
                    {alternativeRoute?.paragens && (selectedRouteType === 'both' || selectedRouteType === 'alternative') && (
                        alternativeRoute.paragens.map((stop, i) => <MapcnMarker key={`a-${i}`} longitude={stop.longitude} latitude={stop.latitude} color="#2E6B9E" />)
                    )}
                </Mapcn>
            </div>

            {/* Arrival Popup */}
            {showArrivalPopup && (
                <div className="absolute inset-0 z-50 bg-blue-deep/60 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-modal animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-success-bg rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-storm mb-2">Chegaste!</h2>
                        <p className="text-slate-mid mb-6">Você chegou ao seu destino: <strong className="text-storm">{arrivalDestination}</strong></p>
                        <button onClick={() => { setShowArrivalPopup(false); setSelectedRouteType('both'); setIsTripStarted(false); setIsAltTripStarted(false); }}
                            className="w-full bg-blue-atlantic hover:bg-blue-atlantic/90 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-atlantic/30">
                            Fechar
                        </button>
                    </div>
                </div>
            )}

            {/* Walking Suggestion Popup */}
            {showWalkingPopup && (
                <div className="absolute inset-0 z-50 bg-blue-deep/60 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-modal animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-blue-horizon/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Footprints className="w-10 h-10 text-blue-atlantic" />
                        </div>
                        <h2 className="text-2xl font-bold text-storm mb-2">Sugestão de Caminhada</h2>
                        <p className="text-slate-mid mb-6">{walkingMessage}</p>
                        <button onClick={() => setShowWalkingPopup(false)}
                            className="w-full bg-blue-atlantic hover:bg-blue-atlantic/90 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-atlantic/30">
                            Ver Caminho
                        </button>
                    </div>
                </div>
            )}

            {/* No Route Found Modal */}
            {showNoRouteModal && (
                <div className="absolute inset-0 z-50 bg-blue-deep/60 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-modal animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-sand rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <MapPin className="w-10 h-10 text-slate-light" />
                        </div>
                        <h2 className="text-2xl font-bold text-storm mb-2">Rota não encontrada</h2>
                        <p className="text-slate-mid mb-4 text-sm">{noRouteMessage}</p>
                        <div className="bg-blue-horizon/20 p-4 rounded-2xl mb-6">
                            <p className="text-blue-atlantic font-bold text-sm mb-2">Ajuda-nos a conectar Luanda!</p>
                            <p className="text-blue-atlantic/80 text-xs">Esta rota ainda não existe, mas tu podes criá-la e ajudar milhares de pessoas.</p>
                        </div>
                        <div className="space-y-3">
                            <Link to="/builder"
                                className="block w-full bg-blue-deep hover:bg-blue-ocean text-white py-3.5 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
                                <div className="p-1 bg-white/20 rounded-lg"><Route className="w-4 h-4" /></div>
                                Ir para o Construtor
                            </Link>
                            <button onClick={() => setShowNoRouteModal(false)}
                                className="w-full bg-sand hover:bg-slate-200 text-storm py-3.5 rounded-xl font-bold text-lg transition-all">
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Floating Buttons */}
            {isMenuOpen && (
                <>
                    <button onClick={() => setIsMenuOpen(false)}
                        className="fixed top-4 left-4 z-30 p-2 bg-error hover:bg-error/90 rounded-full shadow-lg lg:hidden">
                        <X className="w-6 h-6 text-white" />
                    </button>
                    <div className="fixed top-4 right-4 z-30 flex items-center gap-2 lg:hidden">
                        {isAdmin && (
                            <Link to="/admin" className="p-2 bg-amber-light rounded-full shadow-lg hover:bg-amber-warm/20 transition-all duration-200 active:scale-90" title="Painel Admin">
                                <Shield className="w-6 h-6 text-amber-dark" />
                            </Link>
                        )}
                        <Link to="/builder" className="p-2 bg-white rounded-full shadow-lg hover:bg-sand transition-all duration-200 active:scale-90" title="Route Builder">
                            <Route className="w-6 h-6 text-storm" />
                        </Link>
                        <Link to="/profile" className="p-2 bg-white rounded-full shadow-lg hover:bg-sand transition-all duration-200 active:scale-90">
                                    <User className="w-6 h-6 text-storm" />
                                </Link>
                    </div>
                </>
            )}

            {/* UI Panel */}
            <div className={`absolute top-0 left-0 w-full z-10 p-4 pt-16 md:p-6 lg:pt-6 lg:max-w-[400px] lg:h-full lg:bg-blue-deep/90 lg:backdrop-blur-md lg:shadow-2xl max-h-[100vh] overflow-y-auto pb-20 transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} ${locationError ? 'opacity-20 pointer-events-none' : ''}`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMenuOpen(false)} className="hidden lg:block p-2 bg-white/10 rounded-full shadow-md hover:bg-white/20 transition-colors">
                            <X className="w-6 h-6 text-white" />
                        </button>
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/icon/logo.png" alt="Taxi Map" className="h-9 w-auto hidden lg:block" />
                        </Link>
                    </div>
                    <div className="hidden lg:flex items-center gap-2">
                        {isAdmin && (
                            <Link to="/admin" className="p-2 bg-amber-warm/20 rounded-xl hover:bg-amber-warm/30 transition-all duration-200 active:scale-90" title="Painel Admin">
                                <Shield className="w-5 h-5 text-amber-warm" />
                            </Link>
                        )}
                        <Link to="/builder" className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-200 active:scale-90" title="Route Builder">
                            <Route className="w-5 h-5 text-white" />
                        </Link>
                        <Link to="/profile" className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-200 active:scale-90">
                                    <User className="w-5 h-5 text-white" />
                                </Link>
                    </div>
                </div>

                {/* Search Panel */}
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl shadow-xl space-y-4 border border-white/10">
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-sky rounded-full ring-4 ring-blue-sky/30"></div>
                            <input type="text" value={origin} readOnly
                                className="w-full pl-12 pr-4 py-3.5 bg-white/10 rounded-2xl text-white font-medium placeholder:text-white/50"
                                placeholder="Sua localização" />
                        </div>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-warm rounded-full ring-4 ring-amber-warm/30"></div>
                            <input type="text" value={destination} onChange={(e) => handleDestinationChange(e.target.value)}
                                onFocus={() => destination.trim() !== '' && setShowDropdown(true)}
                                className="w-full pl-12 pr-4 py-3.5 bg-white/10 rounded-2xl text-white font-medium placeholder:text-white/50"
                                placeholder="Para onde vais?" />
                            {showDropdown && filteredStops.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-blue-ocean rounded-2xl shadow-xl border border-white/10 max-h-48 overflow-y-auto z-50">
                                    {filteredStops.map((stop) => (
                                        <button key={stop.id} onClick={() => handleSelectDestination(stop)}
                                            className="w-full text-left px-4 py-3 hover:bg-white/10 border-b border-white/5 last:border-b-0 transition-colors">
                                            <span className="font-medium text-white">{stop.nome}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <button onClick={handleStartRoute} disabled={isLoadingRoute || !selectedDestination}
                        className="w-full bg-amber-warm text-blue-deep py-4 rounded-2xl font-bold text-lg hover:bg-amber-warm/90 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-amber-warm/20 transition-all duration-200">
                        {isLoadingRoute ? (
                            <div className="w-5 h-5 border-2 border-blue-deep/30 border-t-blue-deep rounded-full animate-spin" />
                        ) : <Navigation className="w-5 h-5" />}
                        {isLoadingRoute ? 'Calculando...' : 'Iniciar Rota'}
                    </button>
                </div>

                {/* Quick Actions */}
                <div className="flex overflow-x-auto gap-3 mt-4 pb-2 -mx-4 px-4 no-scrollbar snap-x">
                    <button className="flex-none w-[45%] flex items-center justify-center gap-2 px-3 py-3 bg-white/10 backdrop-blur-sm rounded-xl font-bold text-sm text-white border border-white/10 snap-center hover:bg-white/20 active:bg-white/30 transition-all duration-200 active:scale-[0.97]">
                        <Share2 className="w-4 h-4 shrink-0" />
                        <span className="truncate">Partilhar</span>
                    </button>
                    <button className="flex-none w-[45%] flex items-center justify-center gap-2 px-3 py-3 bg-white/10 backdrop-blur-sm rounded-xl font-bold text-sm text-white border border-white/10 snap-center hover:bg-white/20 active:bg-white/30 transition-all duration-200 active:scale-[0.97]">
                        <Users className="w-4 h-4 shrink-0" />
                        <span className="truncate">Ver pessoas</span>
                    </button>
                    <button className="flex-none w-[45%] flex items-center justify-center gap-2 px-3 py-3 bg-white/10 backdrop-blur-sm rounded-xl font-bold text-sm text-white border border-white/10 snap-center hover:bg-white/20 active:bg-white/30 transition-all duration-200 active:scale-[0.97]">
                        <CarTaxiFront className="w-4 h-4 shrink-0" />
                        <span className="truncate">Táxis Privados</span>
                    </button>
                    <button className="flex-none w-[45%] flex items-center justify-center gap-2 px-3 py-3 bg-white/10 backdrop-blur-sm rounded-xl font-bold text-sm text-white border border-white/10 snap-center hover:bg-white/20 active:bg-white/30 transition-all duration-200 active:scale-[0.97]">
                        <UserPlus className="w-4 h-4 shrink-0" />
                        <span className="truncate">Sócia de viagem</span>
                    </button>
                </div>

                {/* Route List */}
                {(route || alternativeRoute || isLoadingRoute) && (
                    <div className="mt-6 bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/10">
                        <h3 className="font-bold text-white mb-4">Melhores Rotas</h3>
                        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                            {isLoadingRoute ? (
                                <>
                                    <SkeletonRouteCard />
                                    <SkeletonRouteCard />
                                </>
                            ) : (
                                <>
                                    {route && (
                                        <div onClick={() => { setSelectedRouteType(selectedRouteType === 'primary' ? 'both' : 'primary'); if (window.innerWidth < 1024) setIsMenuOpen(false); }}
                                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedRouteType === 'primary' || selectedRouteType === 'both' ? 'border-green-400 bg-green-500/10' : 'border-white/10 bg-white/5 opacity-60'}`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full">MELHOR</span>
                                                        {route.numeroTaxis && (
                                                            <span className="text-xs font-bold text-amber-warm bg-amber-warm/20 px-2 py-0.5 rounded-full">
                                                                🚖 {route.numeroTaxis} {route.numeroTaxis === 1 ? 'táxi' : 'táxis'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="font-bold text-white mt-1">{route.linhas.join(' → ')}</p>
                                                    <p className="text-xs text-white/60">{route.distanciaTotal.toFixed(1)} km • {route.numeroParagens || route.paragensTotal} paragens</p>
                                                    {route.descricaoPercurso && route.descricaoPercurso.length > 0 && (
                                                        <p className="text-xs text-white/40 mt-1 truncate">{route.descricaoPercurso[0]}</p>
                                                    )}
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); handleStartTrip(); }} disabled={isTripStarted}
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ml-3 shrink-0 ${isTripStarted ? 'bg-green-500/20 text-green-400' : 'bg-green-500 hover:bg-green-600 text-white'}`}>
                                                    <Play className="w-4 h-4" fill={isTripStarted ? 'currentColor' : 'white'} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {alternativeRoute && (
                                        <div onClick={() => { setSelectedRouteType(selectedRouteType === 'alternative' ? 'both' : 'alternative'); if (window.innerWidth < 1024) setIsMenuOpen(false); }}
                                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedRouteType === 'alternative' || selectedRouteType === 'both' ? 'border-blue-sky bg-blue-sky/10' : 'border-white/10 bg-white/5 opacity-60'}`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-blue-sky bg-blue-sky/20 px-2 py-0.5 rounded-full">ALTERNATIVA</span>
                                                        {alternativeRoute.numeroTaxis && (
                                                            <span className="text-xs font-bold text-amber-warm bg-amber-warm/20 px-2 py-0.5 rounded-full">
                                                                🚖 {alternativeRoute.numeroTaxis} {alternativeRoute.numeroTaxis === 1 ? 'táxi' : 'táxis'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="font-bold text-white mt-1">{alternativeRoute.linhas.join(' → ')}</p>
                                                    <p className="text-xs text-white/60">{alternativeRoute.distanciaTotal.toFixed(1)} km • {alternativeRoute.numeroParagens || alternativeRoute.paragensTotal} paragens</p>
                                                    {alternativeRoute.descricaoPercurso && alternativeRoute.descricaoPercurso.length > 0 && (
                                                        <p className="text-xs text-white/40 mt-1 truncate">{alternativeRoute.descricaoPercurso[0]}</p>
                                                    )}
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); handleStartAltTrip(); }} disabled={isAltTripStarted}
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ml-3 shrink-0 ${isAltTripStarted ? 'bg-blue-sky/20 text-blue-sky' : 'bg-blue-atlantic hover:bg-blue-atlantic/90 text-white'}`}>
                                                    <Play className="w-4 h-4" fill={isAltTripStarted ? 'currentColor' : 'white'} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Menu Button - Mobile */}
            {!isMenuOpen && (
                <button onClick={() => setIsMenuOpen(true)}
                    className="fixed top-4 left-4 z-20 p-3 bg-white rounded-full shadow-lg hover:bg-sand transition-all lg:hidden">
                    <Menu className="w-6 h-6 text-storm" />
                </button>
            )}

            {/* Collapsed Sidebar - Desktop */}
            {!isMenuOpen && (
                <div className="hidden lg:flex fixed top-0 left-0 h-full w-16 bg-blue-deep/90 backdrop-blur-md shadow-xl flex-col items-center py-6 z-20 border-r border-white/10">
                    <button onClick={() => setIsMenuOpen(true)}
                        className="p-3 hover:bg-white/10 rounded-xl transition-all mb-6">
                        <Menu className="w-6 h-6 text-white" />
                    </button>

                    <div className="flex-1 flex flex-col items-center gap-3">
                        {isAdmin && (
                                <Link to="/admin" className="p-3 hover:bg-amber-warm/20 rounded-xl transition-all duration-200 active:scale-90" title="Painel Admin">
                                    <Shield className="w-5 h-5 text-amber-warm" />
                                </Link>
                            )}
                            <Link to="/builder" className="p-3 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-90" title="Route Builder">
                                <Route className="w-5 h-5 text-white" />
                            </Link>
                            <Link to="/profile" className="p-3 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-90" title="Perfil">
                                <User className="w-5 h-5 text-white" />
                            </Link>
                        <button className="p-3 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-90" title="Partilhar">
                            <Share2 className="w-5 h-5 text-white" />
                        </button>
                        <button className="p-3 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-90" title="Ver pessoas">
                            <Users className="w-5 h-5 text-white" />
                        </button>
                        <button className="p-3 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-90" title="Táxis Privados">
                            <CarTaxiFront className="w-5 h-5 text-white" />
                        </button>
                        <button className="p-3 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-90" title="Sócia de viagem">
                            <UserPlus className="w-5 h-5 text-white" />
                        </button>

                        <div className="w-8 h-px bg-white/10 my-2"></div>

                        {route && (
                            <button className="p-2 hover:bg-green-500/20 rounded-xl transition-all flex flex-col items-center gap-1">
                                <div className="w-8 h-8 bg-green-500/20 rounded-xl flex items-center justify-center">
                                    <MapPin className="w-4 h-4 text-green-400" />
                                </div>
                                <span className="text-[9px] text-white/60 font-medium truncate max-w-[50px]">
                                    {route.paragens[route.paragens.length - 1]?.nome.split(' ')[0] || 'Destino'}
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Login Modal */}
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={handleAuthSuccess} />
        </div>
    );
}
