import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Luanda coordinates focused on city routes
const LUANDA_CENTER: [number, number] = [-8.8383, 13.2344];
const INITIAL_ZOOM = 16;

// Fix for default marker icon in Leaflet + React
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component to fix map size after load
const MapResizer = () => {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
};

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

// Component to handle map view updates
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 2 // Slower animation for better effect
    });
  }, [center, zoom, map]);

  return null;
};

// --- New Taxi Animator Component ---
import { TaxiPhysics } from '../utils/TaxiPhysics';

const TaxiAnimator: React.FC<{
  startPos: [number, number];
  path: [number, number][];
  icon: L.Icon;
  isStarted: boolean;
  onStart?: () => void;
}> = ({ startPos, path, icon, isStarted, onStart }) => {
  const [position, setPosition] = useState(startPos);
  const [rotation, setRotation] = useState(0);
  const taxiRef = React.useRef(new TaxiPhysics(0.000005));
  const requestRef = React.useRef<number>();
  const currentTargetIndex = React.useRef(0);

  useEffect(() => {
    const taxi = taxiRef.current;
    taxi.setPosition(startPos[0], startPos[1]);

    if (!isStarted) {
      setPosition(startPos);
      return;
    }

    const animate = () => {
      if (!path || path.length === 0) return;

      let target = path[currentTargetIndex.current];
      const targetLat = target[0];
      const targetLng = target[1];

      const dist = Math.sqrt(
        Math.pow(targetLng - taxi.x, 2) +
        Math.pow(targetLat - taxi.y, 2)
      );

      if (dist < 0.0005) {
        if (currentTargetIndex.current < path.length - 1) {
          currentTargetIndex.current++;
        } else {
          taxi.controls.forward = false;
          taxi.speed = 0;
          setPosition([taxi.y, taxi.x]);
          return;
        }
      } else {
        taxi.driveTowards(targetLat, targetLng);
      }

      taxi.update();
      setPosition([taxi.y, taxi.x]);
      const angleDeg = taxi.angle * 180 / Math.PI;
      setRotation(90 - angleDeg);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [path, isStarted, startPos]);

  if (!isStarted) {
    const startButtonIcon = L.divIcon({
      className: 'taxi-start-button',
      html: `<div style="position: relative; cursor: pointer;">
                <img src="${icon.options.iconUrl}" style="width:35px; height:35px; object-fit: contain;" />
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                            background: #EAB308; border-radius: 50%; width: 24px; height: 24px; 
                            display: flex; align-items: center; justify-content: center;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 2px solid white;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                </div>
             </div>`,
      iconSize: [35, 35],
      iconAnchor: [17, 17]
    });

    return (
      <Marker
        position={startPos}
        icon={startButtonIcon}
        eventHandlers={{ click: () => onStart && onStart() }}
      >
        <Popup>Clique para iniciar viagem</Popup>
      </Marker>
    );
  }

  const rotatedIcon = L.divIcon({
    className: 'taxi-marker-icon',
    html: `<div style="transform: rotate(${rotation}deg); transition: transform 0.05s linear; transform-origin: center;">
              <img src="${icon.options.iconUrl}" style="width:100%; height:100%; object-fit: contain;" />
           </div>`,
    iconSize: icon.options.iconSize as [number, number],
    iconAnchor: icon.options.iconAnchor as [number, number]
  });

  return <Marker position={position} icon={rotatedIcon}><Popup>Táxi em movimento</Popup></Marker>;
};


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
  // Logic: If center is provided (user location found), use it and zoom in (16).
  // If not provided (loading/landing), use Luanda center and zoom out (13).
  const viewCenter = center || LUANDA_CENTER;
  const viewZoom = center ? 16 : 13;
  // Allow overriding zoom via prop if specifically set, otherwise use dynamic logic
  const finalZoom = zoom || viewZoom;

  // Icons
  const userIcon = L.icon({
    iconUrl: '/icon/user_location.svg',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });

  const taxiIcon = L.icon({
    iconUrl: '/icon/taxi_icon.ico',
    iconSize: [35, 35],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  const destinationIcon = L.icon({
    iconUrl: '/icon/destino.ico',
    iconSize: [35, 35],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  // Icon for intermediate stops (paragens)
  const stopIcon = L.divIcon({
    className: 'stop-marker-icon',
    html: `<div style="width: 16px; height: 16px; background: #EAB308; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });

  return (
    <div className={`w-full h-full ${interactive ? '' : 'pointer-events-none select-none'}`}>
      <MapContainer
        center={viewCenter}
        zoom={finalZoom}
        dragging={interactive}
        scrollWheelZoom={interactive}
        doubleClickZoom={interactive}
        touchZoom={interactive}
        zoomControl={interactive}
        attributionControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <MapResizer />
        <MapController center={viewCenter} zoom={finalZoom} />
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
        />

        {/* User Location Marker */}
        {center && (
          <Marker position={center} icon={userIcon}>
            <Popup>
              Sua localização actual
            </Popup>
          </Marker>
        )}

        {/* Draw ALTERNATIVE route line (BLUE) - only if 'both' or 'alternative' selected */}
        {alternativeRoutePoints && (selectedRouteType === 'both' || selectedRouteType === 'alternative') && (
          <Polyline
            positions={alternativeRoutePoints}
            pathOptions={{ color: '#3B82F6', weight: selectedRouteType === 'alternative' ? 5 : 4, opacity: selectedRouteType === 'alternative' ? 0.9 : 0.6 }}
          />
        )}

        {/* Draw ALTERNATIVE walking route (dashed blue) */}
        {alternativeUserRoutePoints && (selectedRouteType === 'both' || selectedRouteType === 'alternative') && (
          <Polyline
            positions={alternativeUserRoutePoints}
            pathOptions={{ color: '#3B82F6', weight: 3, opacity: 0.5, dashArray: '8, 8' }}
          />
        )}

        {/* Draw PRIMARY walking route (dashed gray) */}
        {userRoutePoints && (selectedRouteType === 'both' || selectedRouteType === 'primary') && (
          <Polyline
            positions={userRoutePoints}
            pathOptions={{ color: '#6B7280', weight: 4, opacity: 0.7, dashArray: '10, 10' }}
          />
        )}

        {/* Draw PRIMARY route line (GREEN - best option) */}
        {routePoints && (selectedRouteType === 'both' || selectedRouteType === 'primary') && (
          <Polyline
            positions={routePoints}
            pathOptions={{ color: '#22C55E', weight: 5, opacity: 0.9 }}
          />
        )}

        {/* PRIMARY Route Markers - only if primary or both selected */}
        {routePoints && routePoints.length > 0 && (selectedRouteType === 'both' || selectedRouteType === 'primary') && (
          <>
            <TaxiAnimator
              startPos={routePoints[0]}
              path={routePoints}
              icon={taxiIcon}
              isStarted={isTripStarted}
              onStart={onStartTrip}
            />
            {/* Intermediate stop markers for primary route */}
            {stops.length > 2 && stops.slice(1, -1).map((stop, index) => (
              <Marker
                key={`stop-${index}`}
                position={[stop.latitude, stop.longitude]}
                icon={stopIcon}
              >
                <Popup>{stop.nome}</Popup>
              </Marker>
            ))}
            <Marker position={routePoints[routePoints.length - 1]} icon={destinationIcon}>
              <Popup>{stops.length > 0 ? stops[stops.length - 1].nome : 'Destino'}</Popup>
            </Marker>
          </>
        )}

        {/* ALTERNATIVE Route Markers - only if alternative or both selected */}
        {alternativeRoutePoints && alternativeRoutePoints.length > 0 && (selectedRouteType === 'both' || selectedRouteType === 'alternative') && (
          <>
            {/* Alternative origin marker (blue circle) */}
            <Marker position={alternativeRoutePoints[0]} icon={L.divIcon({
              className: 'alt-origin-marker',
              html: `<div style="width: 20px; height: 20px; background: #3B82F6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}>
              <Popup>{alternativeStops.length > 0 ? alternativeStops[0].nome : 'Origem Alternativa'}</Popup>
            </Marker>
            {/* Intermediate stop markers for alternative route */}
            {alternativeStops.length > 2 && alternativeStops.slice(1, -1).map((stop, index) => (
              <Marker
                key={`alt-stop-${index}`}
                position={[stop.latitude, stop.longitude]}
                icon={L.divIcon({
                  className: 'alt-stop-marker',
                  html: `<div style="width: 14px; height: 14px; background: #3B82F6; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
                  iconSize: [14, 14],
                  iconAnchor: [7, 7]
                })}
              >
                <Popup>{stop.nome}</Popup>
              </Marker>
            ))}
            {/* Alternative destination marker */}
            <Marker position={alternativeRoutePoints[alternativeRoutePoints.length - 1]} icon={L.divIcon({
              className: 'alt-dest-marker',
              html: `<div style="width: 24px; height: 24px; background: #3B82F6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            })}>
              <Popup>{alternativeStops.length > 0 ? alternativeStops[alternativeStops.length - 1].nome : 'Destino Alternativo'}</Popup>
            </Marker>
          </>
        )}
      </MapContainer>
    </div>
  );
};
