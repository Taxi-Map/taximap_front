import React, { useEffect, useRef, useState } from 'react';
import { ensureGoogleMapsLoaded } from '../lib/gmaps-init';

const LUANDA_CENTER = { lat: -8.8383, lng: 13.2344 };

interface MapComponentProps {
    center?: [number, number];
    zoom?: number;
    interactive?: boolean;
    routePoints?: [number, number][];
    userRoutePoints?: [number, number][];
    alternativeRoutePoints?: [number, number][];
    alternativeUserRoutePoints?: [number, number][];
    stops?: { nome: string; latitude: number; longitude: number }[];
    alternativeStops?: { nome: string; latitude: number; longitude: number }[];
    selectedRouteType?: 'primary' | 'alternative' | 'both';
    isTripStarted?: boolean;
    onStartTrip?: () => void;
}

export const MapComponent: React.FC<MapComponentProps> = ({
    center,
    zoom,
    interactive = false,
    routePoints,
    userRoutePoints,
    alternativeRoutePoints,
    alternativeUserRoutePoints,
    stops = [],
    alternativeStops = [],
    selectedRouteType = 'both',
    isTripStarted = false,
    onStartTrip
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<google.maps.Map | null>(null);
    const polylinesRef = useRef<google.maps.Polyline[]>([]);
    const markersRef = useRef<google.maps.Marker[]>([]);
    const taxiMarkerRef = useRef<google.maps.Marker | null>(null);
    const [mapReady, setMapReady] = useState(false);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        ensureGoogleMapsLoaded().then(() => {
            if (!containerRef.current || mapRef.current) return;

            const viewCenter = center
                ? { lat: center[0], lng: center[1] }
                : LUANDA_CENTER;
            const viewZoom = center ? 16 : 13;
            const finalZoom = zoom || viewZoom;

            const map = new google.maps.Map(containerRef.current, {
                center: viewCenter,
                zoom: finalZoom,
                zoomControl: interactive,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                draggable: interactive,
                scrollwheel: interactive,
                disableDoubleClickZoom: !interactive,
                clickableIcons: false,
                styles: [
                    {
                        featureType: 'poi',
                        elementType: 'labels',
                        stylers: [{ visibility: 'off' }],
                    },
                ],
            });

            mapRef.current = map;

            const listener = map.addListener('idle', () => {
                setMapReady(true);
                google.maps.event.removeListener(listener);
            });
        });

        return () => {
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!mapRef.current || !mapReady) return;

        polylinesRef.current.forEach(p => p.setMap(null));
        markersRef.current.forEach(m => m.setMap(null));
        if (taxiMarkerRef.current) {
            taxiMarkerRef.current.setMap(null);
            taxiMarkerRef.current = null;
        }
        polylinesRef.current = [];
        markersRef.current = [];

        const map = mapRef.current;

        const addPolyline = (coords: [number, number][], opts: google.maps.PolylineOptions) => {
            if (coords.length < 2) return;
            const poly = new google.maps.Polyline({
                path: coords.map(c => ({ lat: c[0], lng: c[1] })),
                ...opts,
            });
            poly.setMap(map);
            polylinesRef.current.push(poly);
        };

        const addMarker = (pos: [number, number], icon: google.maps.Icon | google.maps.Symbol, title?: string) => {
            const marker = new google.maps.Marker({
                position: { lat: pos[0], lng: pos[1] },
                map,
                icon,
                title,
                clickable: false,
            });
            markersRef.current.push(marker);
            return marker;
        };

        if (alternativeRoutePoints && (selectedRouteType === 'both' || selectedRouteType === 'alternative')) {
            addPolyline(alternativeRoutePoints, {
                strokeColor: '#3B82F6',
                strokeWeight: selectedRouteType === 'alternative' ? 5 : 4,
                strokeOpacity: selectedRouteType === 'alternative' ? 0.9 : 0.6,
            });
        }

        if (alternativeUserRoutePoints && (selectedRouteType === 'both' || selectedRouteType === 'alternative')) {
            addPolyline(alternativeUserRoutePoints, {
                strokeColor: '#3B82F6',
                strokeWeight: 3,
                strokeOpacity: 0.5,
                icons: [{ icon: { path: 'M 0 -1 0 1', scale: 2 }, offset: '0', repeat: '16px' }],
            });
        }

        if (userRoutePoints && (selectedRouteType === 'both' || selectedRouteType === 'primary')) {
            addPolyline(userRoutePoints, {
                strokeColor: '#6B7280',
                strokeWeight: 4,
                strokeOpacity: 0.7,
                icons: [{ icon: { path: 'M 0 -1 0 1', scale: 3 }, offset: '0', repeat: '20px' }],
            });
        }

        if (routePoints && (selectedRouteType === 'both' || selectedRouteType === 'primary')) {
            addPolyline(routePoints, {
                strokeColor: '#22C55E',
                strokeWeight: 5,
                strokeOpacity: 0.9,
            });

            const taxiStart = routePoints[0];
            const taxiIcon: google.maps.Icon = {
                url: '/icon/taxi_icon.ico',
                scaledSize: new google.maps.Size(35, 35),
                anchor: new google.maps.Point(17, 17),
            };

            const taxi = addMarker(taxiStart, taxiIcon, 'Clique para iniciar viagem');

            if (!isTripStarted && onStartTrip) {
                taxi.addListener('click', onStartTrip);
            }

            if (isTripStarted && routePoints.length > 1) {
                taxiMarkerRef.current = taxi;
            }

            if (stops.length > 2) {
                stops.slice(1, -1).forEach((stop) => {
                    addMarker([stop.latitude, stop.longitude], {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: '#EAB308',
                        fillOpacity: 1,
                        strokeColor: '#FFFFFF',
                        strokeWeight: 3,
                        scale: 8,
                        anchor: new google.maps.Point(0, 0),
                    });
                });
            }

            const dest = routePoints[routePoints.length - 1];
            addMarker(dest, {
                url: '/icon/destino.ico',
                scaledSize: new google.maps.Size(35, 35),
                anchor: new google.maps.Point(17, 17),
            });
        }

        if (alternativeRoutePoints && alternativeRoutePoints.length > 0 && (selectedRouteType === 'both' || selectedRouteType === 'alternative')) {
            addMarker(alternativeRoutePoints[0], {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#3B82F6',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 3,
                scale: 10,
                anchor: new google.maps.Point(0, 0),
            });

            if (alternativeStops.length > 2) {
                alternativeStops.slice(1, -1).forEach((stop) => {
                    addMarker([stop.latitude, stop.longitude], {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: '#3B82F6',
                        fillOpacity: 1,
                        strokeColor: '#FFFFFF',
                        strokeWeight: 2,
                        scale: 7,
                        anchor: new google.maps.Point(0, 0),
                    });
                });
            }

            addMarker(alternativeRoutePoints[alternativeRoutePoints.length - 1], {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#3B82F6',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 3,
                scale: 12,
                anchor: new google.maps.Point(0, 0),
            });
        }

        return () => {
            polylinesRef.current.forEach(p => p.setMap(null));
            markersRef.current.forEach(m => m.setMap(null));
            if (taxiMarkerRef.current) taxiMarkerRef.current.setMap(null);
            polylinesRef.current = [];
            markersRef.current = [];
            taxiMarkerRef.current = null;
        };
    }, [mapReady, routePoints, userRoutePoints, alternativeRoutePoints, alternativeUserRoutePoints, stops, alternativeStops, selectedRouteType, isTripStarted, onStartTrip]);

    return (
        <div className={`w-full h-full ${interactive ? '' : 'pointer-events-none select-none'}`}>
            <div ref={containerRef} className="w-full h-full" />
        </div>
    );
};
