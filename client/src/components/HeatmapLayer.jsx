import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

// Renders a heat layer on top of the map using leaflet.heat, which
// isn't a react-leaflet component itself — this hooks into the raw
// Leaflet map instance directly, the same way ChangeView does.
//
// Props:
// points — array of { lat, lng, intensity } objects
function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    // leaflet.heat expects [lat, lng, intensity] tuples
    const heatPoints = points.map((p) => [p.lat, p.lng, p.intensity ?? 1]);

    const heatLayer = L.heatLayer(heatPoints, {
      radius: 30,
      blur: 20,
      maxZoom: 15,
      // Green → yellow → red, matching the doc's "green in low-density
      // areas to red in high-density zones."
      gradient: {
        0.2: "#22c55e",
        0.5: "#eab308",
        0.8: "#f97316",
        1.0: "#ef4444",
      },
    });

    heatLayer.addTo(map);

    // Clean up the layer when points change or the component unmounts,
    // so heat layers don't stack on top of each other across re-renders.
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}

export default HeatmapLayer;
