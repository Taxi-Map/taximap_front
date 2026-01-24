'use client';

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import maplibregl, { Map as MapLibreMap, MapOptions } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Context for Map instance
interface MapContextType {
    map: MapLibreMap | null;
    isLoaded: boolean;
}

const MapContext = createContext<MapContextType>({ map: null, isLoaded: false });

export const useMap = () => useContext(MapContext);

// Map Component
interface MapcnProps {
    children?: ReactNode;
    center?: [number, number]; // [lng, lat]
    zoom?: number;
    className?: string;
    theme?: 'light' | 'dark';
}

export const Mapcn: React.FC<MapcnProps> = ({
    children,
    center = [13.2345, -8.839],  // Luanda default
    zoom = 13,
    className = '',
    theme = 'light'
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapLibreMap | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const styleUrl = theme === 'dark'
        ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
        : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = new maplibregl.Map({
            container: containerRef.current,
            style: styleUrl,
            center: center as [number, number],
            zoom: zoom,
        });

        map.on('load', () => {
            setIsLoaded(true);
        });

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Update center when props change
    useEffect(() => {
        if (mapRef.current && isLoaded) {
            mapRef.current.flyTo({ center, zoom, duration: 2000 });
        }
    }, [center, zoom, isLoaded]);

    return (
        <MapContext.Provider value={{ map: mapRef.current, isLoaded }}>
            <div ref={containerRef} className={`w-full h-full ${className}`} />
            {isLoaded && children}
        </MapContext.Provider>
    );
};

// MapControls Component
interface MapcnControlsProps {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    showZoom?: boolean;
    showCompass?: boolean;
    showLocate?: boolean;
    onLocate?: (coords: { longitude: number; latitude: number }) => void;
}

export const MapcnControls: React.FC<MapcnControlsProps> = ({
    position = 'bottom-right',
    showZoom = true,
    showCompass = false,
    showLocate = false,
    onLocate
}) => {
    const { map, isLoaded } = useMap();

    useEffect(() => {
        if (!map || !isLoaded) return;

        if (showZoom) {
            map.addControl(new maplibregl.NavigationControl({ showCompass }), position);
        }

        if (showLocate && navigator.geolocation) {
            const geolocateControl = new maplibregl.GeolocateControl({
                positionOptions: { enableHighAccuracy: true },
                trackUserLocation: true
            });
            map.addControl(geolocateControl, position);
        }
    }, [map, isLoaded, showZoom, showCompass, showLocate, position]);

    return null;
};

// MapRoute Component
interface MapcnRouteProps {
    id?: string;
    coordinates: [number, number][]; // [lng, lat][]
    color?: string;
    width?: number;
    opacity?: number;
    dashArray?: [number, number];
    onClick?: () => void;
}

export const MapcnRoute: React.FC<MapcnRouteProps> = ({
    id = `route-${Math.random().toString(36).substr(2, 9)}`,
    coordinates,
    color = '#22C55E',
    width = 5,
    opacity = 0.8,
    dashArray,
    onClick
}) => {
    const { map, isLoaded } = useMap();

    useEffect(() => {
        if (!map || !isLoaded || coordinates.length < 2) return;

        const sourceId = `${id}-source`;
        const layerId = `${id}-layer`;

        // Add source
        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: coordinates
                    }
                }
            });
        } else {
            (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData({
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: coordinates
                }
            });
        }

        // Add layer
        if (!map.getLayer(layerId)) {
            map.addLayer({
                id: layerId,
                type: 'line',
                source: sourceId,
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': color,
                    'line-width': width,
                    'line-opacity': opacity,
                    ...(dashArray ? { 'line-dasharray': dashArray } : {})
                }
            });

            if (onClick) {
                map.on('click', layerId, onClick);
            }
        }

        return () => {
            if (map.getLayer(layerId)) map.removeLayer(layerId);
            if (map.getSource(sourceId)) map.removeSource(sourceId);
        };
    }, [map, isLoaded, coordinates, color, width, opacity, dashArray, id, onClick]);

    return null;
};

// MapMarker Component
interface MapcnMarkerProps {
    longitude: number;
    latitude: number;
    children?: ReactNode;
    color?: string;
    onClick?: () => void;
    draggable?: boolean;
    onDragEnd?: (lngLat: { lng: number; lat: number }) => void;
}

export const MapcnMarker: React.FC<MapcnMarkerProps> = ({
    longitude,
    latitude,
    children,
    color = '#3B82F6',
    onClick,
    draggable = false,
    onDragEnd
}) => {
    const { map, isLoaded } = useMap();
    const markerRef = useRef<maplibregl.Marker | null>(null);

    useEffect(() => {
        if (!map || !isLoaded) return;

        // Create marker element
        const el = document.createElement('div');
        el.className = 'mapcn-marker';

        if (children) {
            // Render children as marker content would need ReactDOM
            // For simplicity, use color circle
            el.innerHTML = `<div style="width: 24px; height: 24px; background: ${color}; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer;"></div>`;
        } else {
            el.innerHTML = `<div style="width: 24px; height: 24px; background: ${color}; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer;"></div>`;
        }

        if (onClick) {
            el.addEventListener('click', onClick);
        }

        const marker = new maplibregl.Marker({ element: el, draggable })
            .setLngLat([longitude, latitude])
            .addTo(map);

        if (draggable && onDragEnd) {
            marker.on('dragend', () => {
                const lngLat = marker.getLngLat();
                onDragEnd({ lng: lngLat.lng, lat: lngLat.lat });
            });
        }

        markerRef.current = marker;

        return () => {
            marker.remove();
        };
    }, [map, isLoaded, longitude, latitude, color, onClick, draggable, onDragEnd]);

    return null;
};

// TaxiAnimator Component for MapLibre with physics-based movement
import { TaxiPhysics } from '../utils/TaxiPhysics';

interface MapcnTaxiAnimatorProps {
    startPos: [number, number]; // [lng, lat]
    path: [number, number][];   // [lng, lat][]
    isStarted: boolean;
    onStart?: () => void;
}

export const MapcnTaxiAnimator: React.FC<MapcnTaxiAnimatorProps> = ({
    startPos,
    path,
    isStarted,
    onStart
}) => {
    const { map, isLoaded } = useMap();
    const markerRef = useRef<maplibregl.Marker | null>(null);
    const taxiRef = useRef(new TaxiPhysics(0.000005));
    const requestRef = useRef<number>();
    const currentTargetIndex = useRef(0);
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        if (!map || !isLoaded) return;

        // Create taxi element
        const el = document.createElement('div');
        el.className = 'mapcn-taxi-marker';
        el.style.cssText = 'cursor: pointer; transition: transform 0.1s linear;';
        el.innerHTML = `
            <div style="width: 40px; height: 40px; transform: rotate(${rotation}deg); transition: transform 0.1s linear;">
                <img src="/icon/taxi_icon.ico" style="width: 100%; height: 100%; object-fit: contain;" />
            </div>
        `;

        if (!isStarted && onStart) {
            el.addEventListener('click', onStart);
            // Show "click to start" hint
            el.title = 'Clique para iniciar viagem';
        }

        const marker = new maplibregl.Marker({ element: el })
            .setLngLat(startPos)
            .addTo(map);

        markerRef.current = marker;

        return () => {
            marker.remove();
        };
    }, [map, isLoaded, startPos, onStart]);

    // Animation loop
    useEffect(() => {
        if (!isStarted || !markerRef.current || path.length < 2) return;

        const taxi = taxiRef.current;
        taxi.setPosition(startPos[1], startPos[0]); // lat, lng
        currentTargetIndex.current = 0;

        const animate = () => {
            const targetIdx = currentTargetIndex.current;
            if (targetIdx >= path.length) {
                return; // Arrived at destination
            }

            const target = path[targetIdx];
            const targetLat = target[1]; // path is [lng, lat]
            const targetLng = target[0];

            // Check if close enough to target
            const distToTarget = Math.sqrt(
                Math.pow(taxi.x - targetLng, 2) + Math.pow(taxi.y - targetLat, 2)
            );

            if (distToTarget < 0.0001) {
                currentTargetIndex.current++;
                if (currentTargetIndex.current >= path.length) {
                    console.log("Taxi arrived at destination!");
                    return;
                }
            }

            // Drive towards target
            taxi.driveTowards(targetLat, targetLng);
            taxi.update();

            // Update marker position
            if (markerRef.current) {
                markerRef.current.setLngLat([taxi.x, taxi.y]);

                // Update rotation (convert from math angle to map bearing)
                const bearing = (-taxi.angle * 180 / Math.PI) + 90;
                setRotation(bearing);

                const el = markerRef.current.getElement();
                const innerDiv = el.querySelector('div');
                if (innerDiv) {
                    innerDiv.style.transform = `rotate(${bearing}deg)`;
                }
            }

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [isStarted, path, startPos]);

    return null;
};

export default Mapcn;
