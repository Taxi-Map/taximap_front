'use client';

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { TaxiPhysics } from '../utils/TaxiPhysics';
import { ensureGoogleMapsLoaded, getControlPosition } from '../lib/gmaps-init';

const DARK_STYLES: google.maps.MapOptions['styles'] = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
    { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
    { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
];

interface MapContextType {
    map: google.maps.Map | null;
    isLoaded: boolean;
}

const MapContext = createContext<MapContextType>({ map: null, isLoaded: false });

export const useMap = () => useContext(MapContext);

function toLatLng(lngLat: number[]): google.maps.LatLngLiteral {
    return { lat: lngLat[1], lng: lngLat[0] };
}

function toLatLngArray(coords: number[][]): google.maps.LatLngLiteral[] {
    return coords.map(c => ({ lat: c[1], lng: c[0] }));
}

function createColorIcon(color: string, scale: number = 10): google.maps.Symbol {
    return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 3,
        scale: scale,
        anchor: new google.maps.Point(0, 0),
    };
}

function createRotatedIcon(rotation: number): google.maps.Icon {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="-20 -20 40 40">
        <g transform="rotate(${rotation.toFixed(1)})">
            <image href="/icon/taxi_icon.ico" width="36" height="36" x="-18" y="-18" />
        </g>
    </svg>`;
    return {
        url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg),
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 20),
    };
}

interface MapcnProps {
    children?: ReactNode;
    center?: [number, number];
    zoom?: number;
    className?: string;
    theme?: 'light' | 'dark';
}

export const Mapcn: React.FC<MapcnProps> = ({
    children,
    center = [13.2345, -8.839],
    zoom = 13,
    className = '',
    theme = 'light'
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<google.maps.Map | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        ensureGoogleMapsLoaded().then(() => {
            if (!containerRef.current || mapRef.current) return;

            const map = new google.maps.Map(containerRef.current, {
                center: toLatLng(center),
                zoom: zoom,
                zoomControl: true,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_BOTTOM,
                },
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                styles: theme === 'dark' ? DARK_STYLES : undefined,
                clickableIcons: false,
            });

            mapRef.current = map;

            const listener = map.addListener('idle', () => {
                setIsLoaded(true);
                google.maps.event.removeListener(listener);
            });
        });

        return () => {
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (mapRef.current && isLoaded) {
            mapRef.current.panTo(toLatLng(center));
        }
    }, [center, isLoaded]);

    useEffect(() => {
        if (mapRef.current && isLoaded) {
            mapRef.current.setZoom(zoom);
        }
    }, [zoom, isLoaded]);

    return (
        <MapContext.Provider value={{ map: mapRef.current, isLoaded }}>
            <div ref={containerRef} className={`w-full h-full ${className}`} />
            {isLoaded && children}
        </MapContext.Provider>
    );
};

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
    const locateControlAdded = useRef(false);

    useEffect(() => {
        if (!map || !isLoaded) return;

        if (showLocate && navigator.geolocation && !locateControlAdded.current) {
            locateControlAdded.current = true;

            const locateDiv = document.createElement('div');
            locateDiv.className = 'mapcn-geolocate-control';
            locateDiv.innerHTML = `<div style="width: 40px; height: 40px; background: white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3); cursor: pointer; display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M22 12h-2"/><path d="M4 12H2"/>
                </svg>
            </div>`;

            locateDiv.addEventListener('click', () => {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const lat = pos.coords.latitude;
                        const lng = pos.coords.longitude;
                        map.panTo({ lat, lng });
                        map.setZoom(16);
                        if (onLocate) {
                            onLocate({ longitude: lng, latitude: lat });
                        }
                    },
                    (err) => console.error('Geolocation error:', err),
                    { enableHighAccuracy: true }
                );
            });

            map.controls[getControlPosition(position)].push(locateDiv);
        }

        return () => {
            locateControlAdded.current = false;
        };
    }, [map, isLoaded, showLocate, position, onLocate]);

    return null;
};

interface MapcnRouteProps {
    id?: string;
    coordinates: [number, number][];
    color?: string;
    width?: number;
    opacity?: number;
    dashArray?: [number, number];
    onClick?: () => void;
}

export const MapcnRoute: React.FC<MapcnRouteProps> = ({
    coordinates,
    color = '#22C55E',
    width = 5,
    opacity = 0.8,
    dashArray,
    onClick
}) => {
    const { map, isLoaded } = useMap();
    const polylineRef = useRef<google.maps.Polyline | null>(null);

    useEffect(() => {
        if (!map || !isLoaded || coordinates.length < 2) return;

        if (polylineRef.current) {
            polylineRef.current.setMap(null);
        }

        const path = toLatLngArray(coordinates);

        const polyline = new google.maps.Polyline({
            path,
            strokeColor: color,
            strokeWeight: width,
            strokeOpacity: dashArray ? 0 : opacity,
            clickable: !!onClick,
        });

        if (dashArray) {
            const totalRepeat = dashArray[0] + dashArray[1];
            polyline.setOptions({
                strokeOpacity: 0,
                icons: [{
                    icon: {
                        path: 'M 0 -1 0 1',
                        strokeOpacity: opacity,
                        strokeColor: color,
                        scale: width * 0.4,
                    },
                    offset: '0',
                    repeat: `${totalRepeat}px`,
                }],
            });
        }

        polyline.setMap(map);

        if (onClick) {
            polyline.addListener('click', onClick);
        }

        polylineRef.current = polyline;

        return () => {
            if (polylineRef.current) {
                polylineRef.current.setMap(null);
                polylineRef.current = null;
            }
        };
    }, [map, isLoaded, coordinates, color, width, opacity, dashArray, onClick]);

    return null;
};

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
    className = ''
}) => {
    const { map, isLoaded } = useMap();
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const rootRef = useRef<ReturnType<typeof createRoot> | null>(null);
    const isUnmounting = useRef(false);
    const childrenRef = useRef(children);

    childrenRef.current = children;

    useEffect(() => {
        isUnmounting.current = false;

        if (!map || !isLoaded) return;

        const container = document.createElement('div');
        container.className = 'mapcn-popup-container ' + className;
        containerRef.current = container;

        const root = createRoot(container);
        rootRef.current = root;
        root.render(<>{childrenRef.current}</>);

        const infoWindow = new google.maps.InfoWindow({
            content: container,
            position: { lat: latitude, lng: longitude },
            disableAutoPan: false,
        });

        infoWindow.addListener('closeclick', () => {
            if (!isUnmounting.current && onClose) {
                onClose();
            }
        });

        infoWindow.open(map);
        infoWindowRef.current = infoWindow;

        return () => {
            isUnmounting.current = true;
            if (rootRef.current) {
                setTimeout(() => {
                    if (rootRef.current) {
                        rootRef.current.unmount();
                        rootRef.current = null;
                    }
                }, 0);
            }
            if (infoWindowRef.current) {
                infoWindowRef.current.close();
                infoWindowRef.current = null;
            }
        };
    }, [map, isLoaded]);

    useEffect(() => {
        if (rootRef.current && !isUnmounting.current && infoWindowRef.current) {
            rootRef.current.render(<>{children}</>);
        }
    }, [children]);

    useEffect(() => {
        if (infoWindowRef.current) {
            infoWindowRef.current.setPosition({ lat: latitude, lng: longitude });
        }
    }, [longitude, latitude]);

    return null;
};

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
    color = '#3B82F6',
    onClick,
    draggable = false,
    onDragEnd
}) => {
    const { map, isLoaded } = useMap();
    const markerRef = useRef<google.maps.Marker | null>(null);

    useEffect(() => {
        if (!map || !isLoaded) return;

        if (markerRef.current) {
            markerRef.current.setMap(null);
        }

        const marker = new google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map,
            draggable,
            icon: createColorIcon(color),
            clickable: !!onClick,
        });

        if (onClick) {
            marker.addListener('click', onClick);
        }

        if (draggable && onDragEnd) {
            marker.addListener('dragend', () => {
                const pos = marker.getPosition();
                if (pos) {
                    onDragEnd({ lng: pos.lng(), lat: pos.lat() });
                }
            });
        }

        markerRef.current = marker;

        return () => {
            if (markerRef.current) {
                markerRef.current.setMap(null);
                markerRef.current = null;
            }
        };
    }, [map, isLoaded, longitude, latitude, color, onClick, draggable, onDragEnd]);

    return null;
};

interface MapcnTaxiAnimatorProps {
    startPos: [number, number];
    path: [number, number][];
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
    const markerRef = useRef<google.maps.Marker | null>(null);
    const taxiRef = useRef(new TaxiPhysics(0.000025));
    const requestRef = useRef<number>();
    const currentTargetIndex = useRef(0);
    const hasArrived = useRef(false);
    const onArrivalRef = useRef(onArrival);

    useEffect(() => {
        onArrivalRef.current = onArrival;
    }, [onArrival]);

    useEffect(() => {
        if (!map || !isLoaded) return;

        let initialRotation = 0;
        if (path && path.length > 1) {
            const dx = path[1][0] - path[0][0];
            const dy = path[1][1] - path[0][1];
            const angle = Math.atan2(dy, dx);
            initialRotation = (-angle * 180 / Math.PI) + 90;
        }

        const marker = new google.maps.Marker({
            position: { lat: startPos[1], lng: startPos[0] },
            map,
            icon: createRotatedIcon(initialRotation),
            title: !isStarted && onStart ? 'Clique para iniciar viagem' : undefined,
            zIndex: 1000,
        });

        if (!isStarted && onStart) {
            marker.addListener('click', onStart);
        }

        markerRef.current = marker;

        return () => {
            if (markerRef.current) {
                markerRef.current.setMap(null);
                markerRef.current = null;
            }
        };
    }, [map, isLoaded, startPos, onStart, path]);

    useEffect(() => {
        if (!isStarted || !markerRef.current || path.length < 2) return;

        const taxi = taxiRef.current;
        taxi.setPosition(startPos[1], startPos[0]);
        currentTargetIndex.current = 0;
        hasArrived.current = false;

        const animate = () => {
            const targetIdx = currentTargetIndex.current;
            if (targetIdx >= path.length) {
                if (!hasArrived.current) {
                    hasArrived.current = true;
                    if (onArrivalRef.current) {
                        onArrivalRef.current();
                    }
                }
                return;
            }

            const target = path[targetIdx];
            const targetLat = target[1];
            const targetLng = target[0];

            const distToTarget = Math.sqrt(
                Math.pow(taxi.x - targetLng, 2) + Math.pow(taxi.y - targetLat, 2)
            );

            if (distToTarget < 0.0001) {
                currentTargetIndex.current++;
                if (currentTargetIndex.current >= path.length) {
                    if (!hasArrived.current) {
                        hasArrived.current = true;
                        if (onArrivalRef.current) {
                            onArrivalRef.current();
                        }
                    }
                    return;
                }
            }

            taxi.driveTowards(targetLat, targetLng);
            taxi.update();

            if (markerRef.current) {
                markerRef.current.setPosition({ lat: taxi.y, lng: taxi.x });
                const bearing = (-taxi.angle * 180 / Math.PI) + 90;
                markerRef.current.setIcon(createRotatedIcon(bearing));
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
