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
    const navControlRef = useRef<maplibregl.NavigationControl | null>(null);
    const geoControlRef = useRef<maplibregl.GeolocateControl | null>(null);

    useEffect(() => {
        if (!map || !isLoaded) return;

        // Add NavigationControl (zoom) only if not already added
        if (showZoom && !navControlRef.current) {
            navControlRef.current = new maplibregl.NavigationControl({ showCompass });
            map.addControl(navControlRef.current, position);
        }

        // Add GeolocateControl only if not already added
        if (showLocate && navigator.geolocation && !geoControlRef.current) {
            geoControlRef.current = new maplibregl.GeolocateControl({
                positionOptions: { enableHighAccuracy: true },
                trackUserLocation: true
            });
            map.addControl(geoControlRef.current, position);
        }

        // Cleanup on unmount
        return () => {
            if (navControlRef.current && map) {
                try { map.removeControl(navControlRef.current); } catch (e) { }
                navControlRef.current = null;
            }
            if (geoControlRef.current && map) {
                try { map.removeControl(geoControlRef.current); } catch (e) { }
                geoControlRef.current = null;
            }
        };
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

// MapPopup Component - Standalone popup on the map
import { createRoot } from 'react-dom/client';

interface MapcnPopupProps {
    longitude: number;
    latitude: number;
    children: ReactNode;
    onClose?: () => void;
    closeButton?: boolean;
    closeOnClick?: boolean;
    focusAfterOpen?: boolean;
    className?: string;
}

export const MapcnPopup: React.FC<MapcnPopupProps> = ({
    longitude,
    latitude,
    children,
    onClose,
    closeButton = true,
    closeOnClick = false,
    focusAfterOpen = false,
    className = ''
}) => {
    const { map, isLoaded } = useMap();
    const popupRef = useRef<maplibregl.Popup | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const rootRef = useRef<ReturnType<typeof createRoot> | null>(null);
    const isUnmounting = useRef(false);
    const childrenRef = useRef(children); // Keep children in ref

    // Always update childrenRef when children change
    childrenRef.current = children;

    console.log('[MapcnPopup] Render - isLoaded:', isLoaded, 'map:', !!map, 'children:', children);

    useEffect(() => {
        console.log('[MapcnPopup] Mount effect running - map:', !!map, 'isLoaded:', isLoaded);
        isUnmounting.current = false;

        if (!map || !isLoaded) {
            console.log('[MapcnPopup] Map not ready, skipping');
            return;
        }

        // Create container for React content
        const container = document.createElement('div');
        container.className = 'mapcn-popup-container ' + className;
        containerRef.current = container;

        // Create React root and render using the ref (current children)
        const root = createRoot(container);
        rootRef.current = root;

        // Use childrenRef.current to get the most up-to-date children
        console.log('[MapcnPopup] Rendering children:', childrenRef.current);
        root.render(<>{childrenRef.current}</>);

        console.log('[MapcnPopup] Creating popup at:', longitude, latitude);

        const popup = new maplibregl.Popup({
            closeButton: closeButton,
            closeOnClick: closeOnClick,
            focusAfterOpen: focusAfterOpen,
            className: 'mapcn-popup',
            maxWidth: '320px'
        })
            .setLngLat([longitude, latitude])
            .setDOMContent(container)
            .addTo(map);

        popup.on('close', () => {
            console.log('[MapcnPopup] Popup close event fired! isUnmounting:', isUnmounting.current);
            if (!isUnmounting.current && onClose) {
                console.log('[MapcnPopup] User closed popup - calling onClose callback');
                onClose();
            } else {
                console.log('[MapcnPopup] Ignoring close event (React unmounting)');
            }
        });

        popupRef.current = popup;
        console.log('[MapcnPopup] Popup added to map successfully');

        return () => {
            console.log('[MapcnPopup] Cleanup - setting isUnmounting=true and removing popup');
            isUnmounting.current = true;
            if (rootRef.current) {
                setTimeout(() => {
                    if (rootRef.current) {
                        rootRef.current.unmount();
                        rootRef.current = null;
                    }
                }, 0);
            }
            popup.remove();
        };
    }, [map, isLoaded]);

    // Update children when they change (after mount)
    useEffect(() => {
        if (rootRef.current && !isUnmounting.current && popupRef.current) {
            console.log('[MapcnPopup] Updating children in existing popup');
            rootRef.current.render(<>{children}</>);
        }
    }, [children]);

    // Update position if it changes
    useEffect(() => {
        if (popupRef.current) {
            console.log('[MapcnPopup] Updating position to:', longitude, latitude);
            popupRef.current.setLngLat([longitude, latitude]);
        }
    }, [longitude, latitude]);

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
    onArrival?: () => void;
}

export const MapcnTaxiAnimator: React.FC<MapcnTaxiAnimatorProps> = ({
    startPos,
    path,
    isStarted,
    onStart,
    onArrival
}) => {
    const { map, isLoaded } = useMap();
    const markerRef = useRef<maplibregl.Marker | null>(null);
    const taxiRef = useRef(new TaxiPhysics(0.000025)); // 5x faster
    const requestRef = useRef<number>();
    const currentTargetIndex = useRef(0);
    const [rotation, setRotation] = useState(0);
    const hasArrived = useRef(false);
    const onArrivalRef = useRef(onArrival);

    // Keep onArrival ref updated
    useEffect(() => {
        onArrivalRef.current = onArrival;
    }, [onArrival]);

    useEffect(() => {
        if (!map || !isLoaded) return;

        // Calculate initial rotation based on first path segment
        let initialRotation = 0;
        if (path && path.length > 1) {
            const dx = path[1][0] - path[0][0]; // lng
            const dy = path[1][1] - path[0][1]; // lat
            const angle = Math.atan2(dy, dx);
            initialRotation = (-angle * 180 / Math.PI) + 90;
        }

        // Create taxi element
        const el = document.createElement('div');
        el.className = 'mapcn-taxi-marker';
        el.style.cssText = 'cursor: pointer; transition: transform 0.1s linear;';
        el.innerHTML = `
            <div style="width: 40px; height: 40px; transform: rotate(${initialRotation}deg); transition: transform 0.1s linear;">
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
    }, [map, isLoaded, startPos, onStart, path]); // Added path dependency

    // Animation loop
    useEffect(() => {
        if (!isStarted || !markerRef.current || path.length < 2) return;

        const taxi = taxiRef.current;
        taxi.setPosition(startPos[1], startPos[0]); // lat, lng
        currentTargetIndex.current = 0;
        hasArrived.current = false;

        const animate = () => {
            const targetIdx = currentTargetIndex.current;
            if (targetIdx >= path.length) {
                // Arrived at destination!
                if (!hasArrived.current) {
                    hasArrived.current = true;
                    console.log("Taxi arrived at destination!");
                    if (onArrivalRef.current) {
                        onArrivalRef.current();
                    }
                }
                return;
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
                    // Arrived at destination!
                    if (!hasArrived.current) {
                        hasArrived.current = true;
                        console.log("Taxi arrived at destination!");
                        if (onArrivalRef.current) {
                            onArrivalRef.current();
                        }
                    }
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
    }, [isStarted, path, startPos]); // REMOVED onArrival from dependencies

    return null;
};

export default Mapcn;
