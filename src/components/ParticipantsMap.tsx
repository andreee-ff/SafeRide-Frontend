import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GoogleMap, MarkerF, useJsApiLoader, PolylineF } from "@react-google-maps/api";
import type { Participant } from "../api/types";
import { parseGPX, RoutePoint } from '../utils/gpxUtils';
import { GOOGLE_MAPS_LIBRARIES } from '../constants/mapConstants';

interface ParticipantsMapProps {
  participants: Participant[];
  height?: string;
  center?: { lat: number; lng: number };
  organizerId?: number;
  currentUserId?: number;
  gpxData?: string; // Optional GPX string to display route
}

const defaultCenter = { lat: 48.1351, lng: 11.5820 }; // Example: Munich

export default function ParticipantsMap({ participants, height = "400px", center, organizerId, currentUserId, gpxData }: ParticipantsMapProps) {
  const [route, setRoute] = useState<RoutePoint[]>([]);

  useEffect(() => {
    if (gpxData) {
        // console.log("ParticipantsMap: Received gpxData");
        const points = parseGPX(gpxData);
        // console.log(`ParticipantsMap: Parsed ${points.length} points`);
        setRoute(points);
    }
  }, [gpxData]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "", 
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <div style={{ height }} className="bg-red-50 rounded-xl w-full flex items-center justify-center p-4 border border-red-200">
        <p className="text-red-600 text-center">
            <strong>Configuration Error:</strong><br/>
            Google Maps API Key is missing in .env file.<br/>
            (VITE_GOOGLE_MAPS_API_KEY)
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ height }} className="bg-red-50 rounded-xl w-full flex items-center justify-center p-4 border border-red-200">
        <p className="text-red-600 text-center">
            <strong>Error Loading Map:</strong><br/>
            {loadError.message}
        </p>
      </div>
    );
  }

  const [map, setMap] = useState<any | null>(null);

  const mapContainerStyle = {
    width: "100%",
    height: height,
  };

  const filtered = useMemo(() => participants.filter(
    (p) => p.latitude != null && p.longitude != null
  ), [participants]);


  // Centering Priority:
  // 1. Current User (follow me)
  // 2. Organizer (follow leader if I am not on map?) - User said "Center on current user NOT organizer"
  // 3. Fit Bounds (default)
  
  // Actually, standard behavior for nav apps: Center on ME if I exist. If not, fit bounds.

  const defaultMapCenter = center || defaultCenter;

  const onLoad = useCallback((map: any) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);
  
  // Track if we have initially centered
  const isCentered = useRef(false);

  // Track previous participant count to handle "joining" events
  const prevParticipantCount = useRef(0);

  useEffect(() => {
    if (map && isLoaded) {
      
      const me = currentUserId ? filtered.find(p => Number(p.user_id) === Number(currentUserId)) : null;

      // Logic:
      // 1. If "Me" exists, we want to center on "Me".
      // 2. However, we also want to ensure everyone else (and route) is visible.
      
      if (me) {
          const myLoc = new window.google.maps.LatLng(Number(me.latitude), Number(me.longitude));
          map.panTo(myLoc);

          // We check bounds mainly on initial load or if someone is outside
          const bounds = map.getBounds();
          if (bounds) {
              let anyoneOutside = false;
              const newBounds = new window.google.maps.LatLngBounds();
              
              filtered.forEach((p) => {
                  const loc = new window.google.maps.LatLng(Number(p.latitude), Number(p.longitude));
                  newBounds.extend(loc);
                  if (!bounds.contains(loc)) anyoneOutside = true;
              });

              // Also extend bounds to route if it exists
              route.forEach(pt => newBounds.extend(pt));

              if (anyoneOutside || !isCentered.current) {
                   map.fitBounds(newBounds, { top: 50, right: 50, bottom: 50, left: 50 });
              }
          }
          isCentered.current = true;

      } else {
          // Fallback if I am not on map: Just fit everyone + route
          const shouldFit = !isCentered.current || filtered.length > prevParticipantCount.current || route.length > 0;
          
          if (shouldFit && (filtered.length > 0 || route.length > 0)) {
             const bounds = new window.google.maps.LatLngBounds();
             filtered.forEach(p => bounds.extend({ lat: Number(p.latitude), lng: Number(p.longitude) }));
             route.forEach(pt => bounds.extend(pt));
             map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
             isCentered.current = true;
          }
      }
      prevParticipantCount.current = filtered.length;
    }
  }, [map, filtered, isLoaded, currentUserId, route]);

  if (!isLoaded) return <div style={{ height }} className="animate-pulse bg-gray-200 rounded-xl w-full" />;

  return (
    <div className="relative">
      {/* Debug Badge for GPX */}
      <div className="absolute top-2 left-2 z-[10] flex gap-2">
        <div className={`px-2 py-1 rounded text-[10px] font-bold shadow-sm ${route.length > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          GPX: {route.length > 0 ? `${route.length} pts` : 'NONE'}
        </div>
      </div>
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={12}
      center={defaultMapCenter}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {/* Route Line */}
      {route.length > 0 && isLoaded && (
        <PolylineF
          path={route}
          options={{
            strokeColor: "#2563EB", // Primary Blue
            strokeOpacity: 1,
            strokeWeight: 8,
            geodesic: true,
            zIndex: 10, // Ensure it's above the map tiles but below markers
          }}
        />
      )}

      {participants.map((p, index) => {
        // Skip if no location
        if (!p.latitude || !p.longitude) return null;

        const isOrganizer = Number(p.user_id) === Number(organizerId);
        const isMe = Number(p.user_id) === Number(currentUserId);

        // Common shape for all (Drop)
        const markerPath = "M20,0 C12,0 5.5,6.5 5.5,14.5 C5.5,25.4 20,40 20,40 C20,40 34.5,25.4 34.5,14.5 C34.5,6.5 28,0 20,0 Z";

        return (
          <MarkerF
            key={p.id}
            position={{ lat: Number(p.latitude), lng: Number(p.longitude) }}
            title={p.username + (isOrganizer ? " (Organizer)" : isMe ? " (You)" : "")}
            zIndex={isOrganizer ? 100 : isMe ? 90 : 1}
            icon={{
                path: markerPath,
                fillColor: isOrganizer ? "#F59E0B" : isMe ? "#2563EB" : "#EA4335", // Gold, Blue, Red
                fillOpacity: 1,
                strokeColor: isOrganizer ? "#B45309" : isMe ? "#1E40AF" : "#B91C1C",
                strokeWeight: 1,
                scale: 1.25,
                anchor: new google.maps.Point(20, 40), // Bottom tip
                labelOrigin: new google.maps.Point(20, 15) // Center of the "Head"
            }}
            label={{
              text: isOrganizer ? "ORG" : isMe ? "ME" : String(index + 1),
              color: "white",
              fontWeight: "bold",
              fontSize: isOrganizer ? "14px" : "17px",
              className: "map-marker-label" 
            }}
          />
        );
      })}
      </GoogleMap>
    </div>
  );
}
