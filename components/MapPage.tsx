import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapComponent } from './MapComponent';
import { Header } from './Header';
import { ArrowLeft, Navigation, Share2, Users, User, Eye, EyeOff, Search } from 'lucide-react';
import { routeService, RouteData, Stop } from '../services/routeService';
import { orsService } from '../services/orsService';
import { findNearestStop, findTwoNearestStops } from '../utils/geoUtils';

export default function MapPage() {
    const [searchParams] = useSearchParams();
    const [destination, setDestination] = useState(searchParams.get('destination') || '');
    const [origin, setOrigin] = useState('Obtendo localização...');

    const [userLocation, setUserLocation] = useState<[number, number] | undefined>(undefined);
    const [locationError, setLocationError] = useState(false);

    // New state for route
    const [route, setRoute] = useState<RouteData | null>(null);
    const [alternativeRoute, setAlternativeRoute] = useState<RouteData | null>(null);
    const [orsPath, setOrsPath] = useState<[number, number][] | null>(null);
    const [alternativeOrsPath, setAlternativeOrsPath] = useState<[number, number][] | null>(null);
    const [userToOriginPath, setUserToOriginPath] = useState<[number, number][] | null>(null);
    const [userToAltOriginPath, setUserToAltOriginPath] = useState<[number, number][] | null>(null);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);

    // UI State
    const [isPanelVisible, setIsPanelVisible] = useState(true);
    const [isTripStarted, setIsTripStarted] = useState(false);
    const [selectedRouteType, setSelectedRouteType] = useState<'primary' | 'alternative' | 'both'>('both');

    // Stops and destination selection
    const [allStops, setAllStops] = useState<Stop[]>([]);
    const [filteredStops, setFilteredStops] = useState<Stop[]>([]);
    const [selectedDestination, setSelectedDestination] = useState<Stop | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleStartTrip = () => {
        setIsTripStarted(true);
    };

    const requestLocation = () => {
        setLocationError(false);
        setOrigin('Obtendo localização...');

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Success callback
                    setOrigin('Minha localização actual');
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                    setLocationError(false);
                },
                (error) => {
                    // Error callback
                    console.error("Error getting location:", error);
                    setOrigin('Activar localização');
                    setLocationError(true);
                }
            );
        } else {
            setOrigin('Geolocalização não suportada');
            setLocationError(true);
        }
    };

    useEffect(() => {
        requestLocation();
        // Fetch all stops on mount
        const fetchStops = async () => {
            const stops = await routeService.getAllStops();
            if (stops) {
                setAllStops(stops);
                setFilteredStops(stops);
            }
        };
        fetchStops();
    }, []);

    // Filter stops when destination input changes
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

    const handleStartRoute = async () => {
        if (!selectedDestination) {
            alert('Por favor, selecione um destino.');
            return;
        }
        if (!userLocation) {
            alert('A localização não foi obtida. Por favor, ative a localização.');
            return;
        }

        setIsLoadingRoute(true);
        setOrsPath(null);
        setAlternativeOrsPath(null);
        setRoute(null);
        setAlternativeRoute(null);
        setUserToOriginPath(null);
        setUserToAltOriginPath(null);

        try {
            // Find TWO nearest stops to user location
            const twoNearestStops = findTwoNearestStops(userLocation[0], userLocation[1], allStops);
            if (!twoNearestStops) {
                alert('Não foi possível encontrar paragens próximas.');
                setIsLoadingRoute(false);
                return;
            }

            const [primaryStop, alternativeStop] = twoNearestStops;
            setOrigin(primaryStop.nome);
            console.log(`Stop 1: ${primaryStop.nome}, Stop 2: ${alternativeStop.nome}, Destination: ${selectedDestination.nome}`);

            // Fetch both routes first
            const route1Data = await routeService.getShortestPath(primaryStop.id, selectedDestination.id);
            const route2Data = await routeService.getShortestPath(alternativeStop.id, selectedDestination.id);

            // Determine which route is shorter (better)
            let bestRoute = route1Data?.dados;
            let altRoute = route2Data?.dados;
            let bestStop = primaryStop;
            let altStop = alternativeStop;

            // Swap if route2 is shorter
            if (route1Data?.sucesso && route2Data?.sucesso) {
                if (route2Data.dados.distanciaTotal < route1Data.dados.distanciaTotal) {
                    bestRoute = route2Data.dados;
                    altRoute = route1Data.dados;
                    bestStop = alternativeStop;
                    altStop = primaryStop;
                    console.log("Swapped: Route 2 is shorter");
                }
            } else if (route2Data?.sucesso && !route1Data?.sucesso) {
                bestRoute = route2Data.dados;
                altRoute = null;
                bestStop = alternativeStop;
            }

            setIsPanelVisible(false);

            // Set PRIMARY route (GREEN - shortest)
            if (bestRoute) {
                setRoute(bestRoute);
                setOrigin(bestStop.nome);

                const stops = bestRoute.paragens;
                if (stops && stops.length > 0) {
                    const waypoints: [number, number][] = stops.map(stop => [stop.latitude, stop.longitude]);
                    const visualPath = await orsService.getRoute(waypoints);
                    if (visualPath) {
                        setOrsPath(visualPath);
                    }

                    const userOriginPath = await orsService.getWalkingRoute([userLocation, waypoints[0]]);
                    if (userOriginPath) {
                        setUserToOriginPath(userOriginPath);
                    }
                }
            }

            // Set ALTERNATIVE route (BLUE - second shortest)
            if (altRoute) {
                setAlternativeRoute(altRoute);

                const stops = altRoute.paragens;
                if (stops && stops.length > 0) {
                    const waypoints: [number, number][] = stops.map(stop => [stop.latitude, stop.longitude]);
                    const visualPath = await orsService.getRoute(waypoints);
                    if (visualPath) {
                        setAlternativeOrsPath(visualPath);
                    }

                    const userAltOriginPath = await orsService.getWalkingRoute([userLocation, waypoints[0]]);
                    if (userAltOriginPath) {
                        setUserToAltOriginPath(userAltOriginPath);
                    }
                }
            }

        } catch (e) {
            console.error("Exception in handleStartRoute:", e);
            alert("Erro ao buscar rota. Verifique o console.");
        }
        setIsLoadingRoute(false);
    };

    // Use ORS path if available, fallback to old service if needed (though we only use ORS now)
    const routePoints: [number, number][] | undefined = orsPath || route?.paragens.map(p => [p.latitude, p.longitude]);

    return (
        <div className="min-h-screen bg-slate-50 overflow-hidden relative">

            {/* Map Background */}
            <div className="absolute inset-0 z-0">
                <MapComponent
                    center={userLocation}
                    interactive={!locationError}
                    routePoints={routePoints}
                    userRoutePoints={userToOriginPath || undefined}
                    alternativeRoutePoints={alternativeOrsPath || undefined}
                    alternativeUserRoutePoints={userToAltOriginPath || undefined}
                    stops={route?.paragens || []}
                    alternativeStops={alternativeRoute?.paragens || []}
                    selectedRouteType={selectedRouteType}
                    zoom={routePoints ? 12 : undefined}
                    isTripStarted={isTripStarted}
                    onStartTrip={handleStartTrip}
                />
            </div>

            {/* Location Error Modal Overlay */}
            {locationError && (
                <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Navigation className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-4">Localização Desativada</h2>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                            Precisamos da sua localização para mostrar os táxis próximos e traçar a melhor rota para si.
                        </p>
                        <button
                            onClick={requestLocation}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                        >
                            Ativar Localização
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Panel (Mobile & Desktop) */}
            <div className={`absolute top-0 left-0 w-full z-10 p-4 md:p-6 lg:max-w-[400px] lg:h-full lg:bg-white/90 lg:backdrop-blur-md lg:shadow-2xl lg:border-r border-slate-200 transition-opacity duration-300 ${locationError ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>

                {/* Header: Back Button & Profile Button */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <a href="/" className="p-2 bg-white rounded-full shadow-md hover:bg-slate-50 transition-colors">
                            <ArrowLeft className="w-6 h-6 text-slate-900" />
                        </a>
                        <h1 className="text-xl font-bold text-slate-900 lg:hidden">Rota</h1>
                    </div>

                    {/* New Profile Button */}
                    <button className="p-2 bg-white rounded-full shadow-md hover:bg-slate-50 transition-colors">
                        <User className="w-6 h-6 text-slate-900" />
                    </button>
                </div>

                {/* Search Inputs */}
                <div className="bg-white p-4 rounded-3xl shadow-xl space-y-4 border border-slate-100">
                    <div className="space-y-4">
                        {/* Origin Input */}
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-900 rounded-full ring-4 ring-slate-100"></div>
                            <input
                                type="text"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-slate-400"
                                placeholder="Sua localização actual"
                            />
                        </div>

                        {/* Connector Line */}
                        <div className="absolute left-[29px] top-[90px] w-0.5 h-8 bg-slate-200 -z-10 hidden"></div>

                        {/* Destination Input with Autocomplete */}
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-400 rounded-full ring-4 ring-yellow-100"></div>
                            <input
                                type="text"
                                value={destination}
                                onChange={(e) => handleDestinationChange(e.target.value)}
                                onFocus={() => destination.trim() !== '' && setShowDropdown(true)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-slate-400 shadow-inner"
                                placeholder="Para onde vais?"
                            />
                            {/* Autocomplete Dropdown */}
                            {showDropdown && filteredStops.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 max-h-48 overflow-y-auto z-50">
                                    {filteredStops.map((stop) => (
                                        <button
                                            key={stop.id}
                                            onClick={() => handleSelectDestination(stop)}
                                            className="w-full text-left px-4 py-3 hover:bg-yellow-50 transition-colors border-b border-slate-50 last:border-b-0"
                                        >
                                            <span className="font-semibold text-slate-900">{stop.nome}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {showDropdown && filteredStops.length === 0 && destination.trim() !== '' && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50">
                                    <span className="text-slate-500">Nenhuma paragem encontrada</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleStartRoute}
                        disabled={isLoadingRoute}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoadingRoute ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Navigation className="w-5 h-5" />
                        )}
                        {isLoadingRoute ? 'Calculando...' : 'Iniciar Rota'}
                    </button>
                </div>

                {/* Action Buttons (Share, etc) as seen in Sketch */}
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-md font-bold text-sm text-slate-700 border border-slate-100 whitespace-nowrap">
                        <Share2 className="w-4 h-4" />
                        Partilhar localização
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-md font-bold text-sm text-slate-700 border border-slate-100 whitespace-nowrap">
                        <Users className="w-4 h-4" />
                        Ver outras pessoas
                    </button>
                </div>

                {/* Route Options List */}
                {(route || alternativeRoute) && (
                    <div className="mt-6 bg-white rounded-3xl p-6 shadow-xl border border-slate-100 animate-in slide-in-from-bottom-4">
                        <h3 className="font-bold text-slate-900 mb-4 text-lg">Melhores Rotas Encontradas</h3>
                        <div className="space-y-3">
                            {/* Primary Route (GREEN - Best) */}
                            {route && (
                                <div
                                    onClick={() => setSelectedRouteType(selectedRouteType === 'primary' ? 'both' : 'primary')}
                                    className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${selectedRouteType === 'primary' || selectedRouteType === 'both'
                                            ? 'border-green-400 bg-green-50'
                                            : 'border-gray-200 bg-gray-50 opacity-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">MELHOR</span>
                                            </div>
                                            <p className="font-bold text-slate-900 mt-1">{route.linhas.join(', ')}</p>
                                            <p className="text-xs text-slate-500 font-medium">
                                                {route.distanciaTotal.toFixed(1)} km • {route.numeroParagens} paragens
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-4 h-4 bg-green-500 rounded-full ring-4 ring-green-200"></div>
                                </div>
                            )}

                            {/* Alternative Route (BLUE) */}
                            {alternativeRoute && (
                                <div
                                    onClick={() => setSelectedRouteType(selectedRouteType === 'alternative' ? 'both' : 'alternative')}
                                    className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${selectedRouteType === 'alternative' || selectedRouteType === 'both'
                                            ? 'border-blue-300 bg-blue-50'
                                            : 'border-gray-200 bg-gray-50 opacity-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">ALTERNATIVA</span>
                                            </div>
                                            <p className="font-bold text-slate-900 mt-1">{alternativeRoute.linhas.join(', ')}</p>
                                            <p className="text-xs text-slate-500 font-medium">
                                                {alternativeRoute.distanciaTotal.toFixed(1)} km • {alternativeRoute.numeroParagens} paragens
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-4 h-4 bg-blue-500 rounded-full ring-4 ring-blue-200"></div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
