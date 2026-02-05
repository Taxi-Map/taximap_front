import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapComponent } from './MapComponent';
import { Header } from './Header';
import { ArrowLeft, Navigation, Share2, Users, User } from 'lucide-react';
import { routeService, RouteData } from '../services/routeService';
import { orsService } from '../services/orsService';

export default function MapPage() {
    const [searchParams] = useSearchParams();
    const [destination, setDestination] = useState(searchParams.get('destination') || '');
    const [origin, setOrigin] = useState('Obtendo localização...');

    const [userLocation, setUserLocation] = useState<[number, number] | undefined>(undefined);
    const [locationError, setLocationError] = useState(false);

    // New state for route
    const [route, setRoute] = useState<RouteData | null>(null);
    const [orsPath, setOrsPath] = useState<[number, number][] | null>(null);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);

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
    }, []);

    const handleStartRoute = async () => {
        setIsLoadingRoute(true);
        setOrsPath(null);
        setRoute(null);

        try {
            // New logic requested by user:
            // 1. Call Backend to get stops (Hardcoded for testing: 1 -> 2)
            console.log("Fetching route from backend...");
            const backendData = await routeService.getShortestPath(1, 2);

            if (backendData && backendData.sucesso) {
                setRoute(backendData.dados);

                // 2. Extract coordinates from the stops (paragens)
                // user requested: "ver os dados de retorno pegar a localizacao"
                const stops = backendData.dados.paragens;
                if (stops && stops.length > 0) {
                    const waypoints: [number, number][] = stops.map(stop => [stop.latitude, stop.longitude]);

                    // 3. Call ORS with these points to draw the path
                    // "fazer outra requisicao no openrouteservice-js para desenhar a rotas desses pontos"
                    console.log("Fetching visual route from ORS with stops:", waypoints);
                    const visualPath = await orsService.getRoute(waypoints);

                    if (visualPath) {
                        setOrsPath(visualPath);
                    } else {
                        console.warn("ORS could not calculate path between these stops.");
                    }
                } else {
                    alert("A rota retornada pelo backend não tem paragens.");
                }

            } else {
                console.warn("Rota falhou ou dados vazios do backend");
                alert("Erro ao buscar rota no backend.");
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
                    zoom={routePoints ? 12 : undefined}
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

                        {/* Destination Input */}
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-400 rounded-full ring-4 ring-yellow-100"></div>
                            <input
                                type="text"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-slate-400 shadow-inner"
                                placeholder="Para onde vais?"
                            />
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

                {/* Route Details Card */}
                {route && (
                    <div className="mt-6 bg-white rounded-3xl p-6 shadow-xl border border-slate-100 animate-in slide-in-from-bottom-4">
                        <h3 className="font-bold text-slate-900 mb-4 text-lg">Melhor Rota Encontrada</h3>
                        <div className="p-4 rounded-2xl border border-yellow-400 bg-yellow-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    <img src="/img/taxi.png" className="w-8 h-8 object-contain" alt="Taxi" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{route.linhas.join(', ')}</p>
                                    <p className="text-xs text-slate-500 font-medium">
                                        {route.distanciaTotal.toFixed(1)} km • {route.numeroParagens} paragens
                                    </p>
                                </div>
                            </div>
                            <div className="w-4 h-4 bg-yellow-400 rounded-full ring-4 ring-yellow-200"></div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
