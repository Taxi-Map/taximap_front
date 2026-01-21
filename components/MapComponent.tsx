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
  icon: L.Icon
}> = ({ startPos, path, icon }) => {
  const [position, setPosition] = useState(startPos);
  const [rotation, setRotation] = useState(0);
  const taxiRef = React.useRef(new TaxiPhysics(0.00002)); // Tune scale here
  const requestRef = React.useRef<number>();
  const currentTargetIndex = React.useRef(0);

  useEffect(() => {
    const taxi = taxiRef.current;
    taxi.setPosition(startPos[0], startPos[1]);

    const animate = () => {
      if (!path || path.length === 0) return;

      // Determine Target
      let target = path[currentTargetIndex.current];
      const targetLat = target[0];
      const targetLng = target[1];

      // Calculate distance to target (taxi.x = Lng, taxi.y = Lat)
      const dist = Math.sqrt(
        Math.pow(targetLng - taxi.x, 2) +
        Math.pow(targetLat - taxi.y, 2)
      );

      // If close enough, switch to next waypoint (larger threshold to prevent orbiting)
      if (dist < 0.0005) {
        if (currentTargetIndex.current < path.length - 1) {
          currentTargetIndex.current++;
        } else {
          // Arrived at destination - STOP animation
          taxi.controls.forward = false;
          taxi.speed = 0;
          setPosition([taxi.y, taxi.x]); // Final position
          return; // Stop the animation loop
        }
      } else {
        taxi.driveTowards(targetLat, targetLng);
      }

      taxi.update();

      // Position output: [Lat, Lng] for Leaflet (taxi.y = Lat, taxi.x = Lng)
      setPosition([taxi.y, taxi.x]);

      // Rotation: Physics angle 0 = East, PI/2 = North
      // CSS rotate: 0 = Up. So North (PI/2) -> 0deg, East (0) -> 90deg
      // Formula: 90 - angleDeg
      const angleDeg = taxi.angle * 180 / Math.PI;
      setRotation(90 - angleDeg);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [path]);

  // Create a custom DivIcon to handle rotation easily or use Marker with rotation plugin?
  // React-Leaflet Marker doesn't support rotationAngle prop natively without plugin.
  // We can use a DivIcon with a rotated image inside.
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
  userRoutePoints
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

        {/* Draw user to origin route line (Blue) */}
        {userRoutePoints && (
          <Polyline
            positions={userRoutePoints}
            pathOptions={{ color: '#3B82F6', weight: 4, opacity: 0.7, dashArray: '10, 10' }}
          />
        )}

        {/* Draw main route line (Amber) */}
        {routePoints && (
          <Polyline
            positions={routePoints}
            pathOptions={{ color: '#EAB308', weight: 5, opacity: 0.8 }}
          />
        )}

        {/* Route Markers: Destination (Destino) only? 
            Original logic: Origin (Taxi) and Destination. 
            New logic: If we have routePoints, the Taxi IS the origin moving. 
            So we should hide the static Origin marker and show TaxiAnimator. 
        */}
        {routePoints && routePoints.length > 0 && (
          <>
            <TaxiAnimator
              startPos={routePoints[0]}
              path={routePoints}
              icon={taxiIcon}
            />
            <Marker position={routePoints[routePoints.length - 1]} icon={destinationIcon}><Popup>Destino</Popup></Marker>
          </>
        )}
      </MapContainer>
    </div>
  );
};
