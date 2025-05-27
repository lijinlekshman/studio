
'use client';

import { useEffect, useState } from 'react'; // Added useState
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression, LatLngBoundsExpression } from 'leaflet';

// Fix for default Leaflet marker icon issue with bundlers like Webpack
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Coordinate {
  lat: number;
  lng: number;
}

interface RideMapLeafletProps {
  source: Coordinate | null;
  destination: Coordinate | null;
}

// Helper component to adjust map view
const ChangeView = ({ bounds }: { bounds: LatLngBoundsExpression | null }) => {
  const map = useMap();
  useEffect(() => {
    if (map && bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (map) {
      // Default view if no bounds (e.g., center of Kerala or India)
      map.setView([10.8505, 76.2711], 7); // Default to Kerala
    }
  }, [map, bounds]);
  return null;
};


const RideMapLeaflet: React.FC<RideMapLeafletProps> = ({ source, destination }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const tileLayerUrl = "https://maptiles.p.rapidapi.com/en/map/v1/{z}/{x}/{y}.png?rapidapi-key=YOUR-X-RapidAPI-KEY";
  // IMPORTANT: Replace YOUR-X-RapidAPI-KEY with your actual RapidAPI key for maptiles.p.rapidapi.com
  // Using a placeholder key will result in map tiles not loading.

  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & Maptiles API';

  let bounds: LatLngBoundsExpression | null = null;
  const markers: LatLngExpression[] = [];

  if (source) {
    markers.push([source.lat, source.lng]);
  }
  if (destination) {
    markers.push([destination.lat, destination.lng]);
  }

  if (markers.length > 0) {
    bounds = L.latLngBounds(markers);
  }

  if (!isClient) {
    // This message might be briefly visible or superseded by the dynamic import's loading prop.
    return <p>Initializing map...</p>;
  }

  return (
    <MapContainer
      center={source ? [source.lat, source.lng] : (destination ? [destination.lat, destination.lng] : [10.8505, 76.2711])} // Default to Kerala, India
      zoom={source || destination ? 13 : 7}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%', borderRadius: '0.375rem' }} //  rounded-md
    >
      <TileLayer
        attribution={attribution}
        url={tileLayerUrl}
      />
      {source && (
        <Marker position={[source.lat, source.lng]}>
          <Popup>Pickup Location</Popup>
        </Marker>
      )}
      {destination && (
        <Marker position={[destination.lat, destination.lng]}>
          <Popup>Drop-off Location</Popup>
        </Marker>
      )}
      <ChangeView bounds={bounds} />
       {/* Display a warning if the API key placeholder is still present */}
      {tileLayerUrl.includes("YOUR-X-RapidAPI-KEY") && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'yellow',
          padding: '5px 10px',
          zIndex: 1000,
          border: '1px solid orange',
          borderRadius: '4px',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          <strong>Warning:</strong> Please replace "YOUR-X-RapidAPI-KEY" in the map component with your actual RapidAPI key for maptiles.
        </div>
      )}
    </MapContainer>
  );
};

export default RideMapLeaflet;
