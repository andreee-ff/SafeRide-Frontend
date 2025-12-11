import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import type { Participant } from "../api/types";

interface ParticipantsMapProps {
  participants: Participant[];
  height?: string;
  center?: { lat: number; lng: number };
  organizerId?: number;
}

const defaultCenter = { lat: 48.1351, lng: 11.5820 }; // Example: Munich
const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = [];

export default function ParticipantsMap({ participants, height = "400px", center, organizerId }: ParticipantsMapProps) {
  // ... (existing hooks)

  // ... (inside return)
      {participants.map((p, index) => {
        // Skip if no location
        if (!p.latitude || !p.longitude) return null;

        const isOrganizer = Number(p.user_id) === Number(organizerId);
        
        // Debug first time to check IDs
        if (index === 0) console.log("Map Debug:", { pID: p.user_id, orgID: organizerId, isOrg: isOrganizer });

        return (
          <MarkerF
            key={p.id}
            position={{ lat: Number(p.latitude), lng: Number(p.longitude) }}
            title={p.username + (isOrganizer ? " (Organizer)" : "")}
            zIndex={isOrganizer ? 100 : 1} // Organizer on top
            options={{
                icon: isOrganizer ? {
                    url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                } : undefined
            }}
            label={{
              text: String(index + 1),
              color: "white",
              fontWeight: "bold",
              className: "map-marker-label" 
            }}
          />
        );
      })}
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "", 
    libraries
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
    // border: "2px solid red", // DEBUG: Visibility check - Removed
  };

  const filtered = participants.filter(
    (p) => p.latitude != null && p.longitude != null
  );

  console.log("ParticipantsMap Render:", { 
      total: participants.length, 
      filtered: filtered.length, 
      isLoading: !isLoaded 
  });
  
  filtered.forEach(p => console.log(`Marker: ${p.username} at ${p.latitude}, ${p.longitude}`));

  const defaultMapCenter = center ||
    (filtered.length > 0
      ? { lat: filtered[0].latitude!, lng: filtered[0].longitude! }
      : defaultCenter);

  const onLoad = useCallback((map: any) => {
    console.log("Google Map Loaded");
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    if (map && filtered.length > 0 && isLoaded) {
      console.log("Fitting bounds for", filtered.length, "markers");
      const bounds = new window.google.maps.LatLngBounds();
      filtered.forEach((p) => {
        bounds.extend({ lat: p.latitude!, lng: p.longitude! });
      });
      
      if (filtered.length === 1) {
          map.setCenter({ lat: filtered[0].latitude!, lng: filtered[0].longitude! });
          map.setZoom(15);
      } else {
          map.fitBounds(bounds);
      }
    }
  }, [map, filtered, isLoaded]);

  if (!isLoaded) return <div style={{ height }} className="animate-pulse bg-gray-200 rounded-xl w-full" />;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={12}
      center={defaultMapCenter}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {participants.map((p, index) => {
        // Skip if no location
        if (!p.latitude || !p.longitude) return null;

        const isOrganizer = Number(p.user_id) === Number(organizerId);

        return (
          <MarkerF
            key={p.id}
            position={{ lat: Number(p.latitude), lng: Number(p.longitude) }}
            title={p.username + (isOrganizer ? " (Organizer)" : "")}
            zIndex={isOrganizer ? 100 : 1}
            icon={isOrganizer ? {
                // Vector path similar to default Google marker
                path: "M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z",
                fillColor: "#2563EB", // Blue-600
                fillOpacity: 1,
                strokeColor: "#FFFFFF",
                strokeWeight: 2,
                scale: 1.2, // Slightly larger than default (1.0)
                labelOrigin: new google.maps.Point(0, -30) // Position label in the head
            } : undefined}
            label={{
              text: isOrganizer ? "★" : String(index),
              color: "white",
              fontWeight: "bold",
              className: "map-marker-label" 
            }}
          />
        );
      })}
    </GoogleMap>
  );
}
