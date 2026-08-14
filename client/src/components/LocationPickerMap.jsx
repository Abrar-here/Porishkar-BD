import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icons (same fix as MapView)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Moves map view when center prop changes
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

// Handles map click events — drops a pin where admin clicks
function ClickHandler({ onLocationPick }) {
  useMapEvents({
    click(e) {
      onLocationPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Props:
// onLocationPick(lat, lng, address) — called when admin clicks the map
// initialPosition — [lat, lng] to show existing pin (for edit page)
function LocationPickerMap({ onLocationPick, initialPosition = null }) {
  const defaultCenter = [23.8103, 90.4125]; // Dhaka
  const [markerPos, setMarkerPos] = useState(initialPosition);
  const [resolving, setResolving] = useState(false);

  // Reverse geocode using Nominatim (free, no key needed)
  const reverseGeocode = async (lat, lng) => {
    setResolving(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "Accept-Language": "en" } },
      );
      const data = await res.json();
      const address =
        data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      return address;
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } finally {
      setResolving(false);
    }
  };

  const handleMapClick = async (lat, lng) => {
    setMarkerPos([lat, lng]);
    const address = await reverseGeocode(lat, lng);
    onLocationPick(lat, lng, address);
  };

  return (
    <div className="space-y-2">
      <div className="rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          center={initialPosition || defaultCenter}
          zoom={13}
          style={{ height: "300px", width: "100%" }}
          scrollWheelZoom={true}
        >
          <ChangeView center={initialPosition || defaultCenter} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onLocationPick={handleMapClick} />
          {markerPos && <Marker position={markerPos} />}
        </MapContainer>
      </div>

      {resolving && (
        <p className="text-xs text-gray-500">Resolving address...</p>
      )}

      {!resolving && markerPos && (
        <p className="text-xs text-green-600">
          📍 Pin dropped at {markerPos[0].toFixed(5)}, {markerPos[1].toFixed(5)}
        </p>
      )}

      {!markerPos && (
        <p className="text-xs text-gray-400">
          Click anywhere on the map to drop a pin and set the location.
        </p>
      )}
    </div>
  );
}

export default LocationPickerMap;
