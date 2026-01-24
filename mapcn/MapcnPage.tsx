'use client';

import React, { useState, useEffect } from 'react';
import { Mapcn, MapcnRoute, MapcnMarker, MapcnControls } from './Mapcn';
import { routeService, RouteData, Stop } from '../services/routeService';
import { orsService } from '../services/orsService';
import { findTwoNearestStops } from '../utils/geoUtils';

interface MapcnPageProps {
    userLocation?: [number, number];
    selectedDestination?: Stop | null;
}

export const MapcnPage: React.FC<MapcnPageProps> = ({
    userLocation,
    selectedDestination
}) => {
    const [route, setRoute] = useState<RouteData | null>(null);
    const [alternativeRoute, setAlternativeRoute] = useState<RouteData | null>(null);
    const [primaryPath, setPrimaryPath] = useState<[number, number][] | null>(null);
    const [alternativePath, setAlternativePath] = useState<[number, number][] | null>(null);
    const [allStops, setAllStops] = useState<Stop[]>([]);
    const [selectedRouteType, setSelectedRouteType] = useState<'primary' | 'alternative' | 'both'>('both');

    useEffect(() => {
        const fetchStops = async () => {
            const stops = await routeService.getAllStops();
            if (stops) setAllStops(stops);
        };
        fetchStops();
    }, []);

    const calculateRoutes = async () => {
        if (!userLocation || !selectedDestination || allStops.length < 2) return;

        const twoNearest = findTwoNearestStops(userLocation[0], userLocation[1], allStops);
        if (!twoNearest) return;

        const [stop1, stop2] = twoNearest;

        // Fetch both routes
        const route1 = await routeService.getShortestPath(stop1.id, selectedDestination.id);
        const route2 = await routeService.getShortestPath(stop2.id, selectedDestination.id);

        // Sort by distance
        if (route1?.sucesso && route2?.sucesso) {
            if (route1.dados.distanciaTotal <= route2.dados.distanciaTotal) {
                setRoute(route1.dados);
                setAlternativeRoute(route2.dados);
            } else {
                setRoute(route2.dados);
                setAlternativeRoute(route1.dados);
            }
        } else if (route1?.sucesso) {
            setRoute(route1.dados);
        } else if (route2?.sucesso) {
            setRoute(route2.dados);
        }

        // Get ORS paths for visual routes
        if (route?.paragens) {
            const waypoints: [number, number][] = route.paragens.map(s => [s.latitude, s.longitude]);
            const path = await orsService.getRoute(waypoints);
            if (path) {
                // Convert to [lng, lat] for MapLibre
                setPrimaryPath(path.map(([lat, lng]) => [lng, lat]));
            }
        }

        if (alternativeRoute?.paragens) {
            const waypoints: [number, number][] = alternativeRoute.paragens.map(s => [s.latitude, s.longitude]);
            const path = await orsService.getRoute(waypoints);
            if (path) {
                setAlternativePath(path.map(([lat, lng]) => [lng, lat]));
            }
        }
    };

    // Center defaults to Luanda or user location
    const center: [number, number] = userLocation
        ? [userLocation[1], userLocation[0]]  // Convert [lat, lng] to [lng, lat]
        : [13.2345, -8.839];

    return (
        <div className="w-full h-full">
            <Mapcn center={center} zoom={14}>
                <MapcnControls showZoom showLocate />

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

                {/* Alternative Route (BLUE) */}
                {alternativePath && (selectedRouteType === 'both' || selectedRouteType === 'alternative') && (
                    <MapcnRoute
                        id="alternative-route"
                        coordinates={alternativePath}
                        color="#3B82F6"
                        width={4}
                        opacity={0.7}
                        onClick={() => setSelectedRouteType('alternative')}
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

                {/* Destination Marker */}
                {selectedDestination && (
                    <MapcnMarker
                        longitude={selectedDestination.longitude}
                        latitude={selectedDestination.latitude}
                        color="#F59E0B"
                    />
                )}

                {/* Stop markers for primary route */}
                {route?.paragens && (selectedRouteType === 'both' || selectedRouteType === 'primary') && (
                    <>
                        {route.paragens.map((stop, index) => (
                            <MapcnMarker
                                key={`primary-stop-${index}`}
                                longitude={stop.longitude}
                                latitude={stop.latitude}
                                color="#22C55E"
                            />
                        ))}
                    </>
                )}

                {/* Stop markers for alternative route */}
                {alternativeRoute?.paragens && (selectedRouteType === 'both' || selectedRouteType === 'alternative') && (
                    <>
                        {alternativeRoute.paragens.map((stop, index) => (
                            <MapcnMarker
                                key={`alt-stop-${index}`}
                                longitude={stop.longitude}
                                latitude={stop.latitude}
                                color="#3B82F6"
                            />
                        ))}
                    </>
                )}
            </Mapcn>
        </div>
    );
};

export default MapcnPage;
