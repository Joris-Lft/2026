import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { parseLatLng, type BudgetLine } from "@/types/travel-budget";
import styles from "./ActivitiesMap.module.css";

type MapPoint = {
  line: BudgetLine;
  lat: number;
  lng: number;
};

const pinIcon = L.divIcon({
  className: styles.pinWrapper,
  html: `<svg viewBox="0 0 24 24" width="30" height="30" fill="#c45d3e" stroke="#fff" stroke-width="1.5">
    <path d="M12 2C7.6 2 4 5.6 4 10c0 5.4 8 12 8 12s8-6.6 8-12c0-4.4-3.6-8-8-8z"/>
    <circle cx="12" cy="10" r="3" fill="#fff" stroke="none"/>
  </svg>`,
  iconSize: [30, 30],
  iconAnchor: [15, 28],
  popupAnchor: [0, -26],
});

function buildMapsUrl(location: string): string {
  const value = location.trim();
  if (/^https?:\/\//i.test(value)) return value;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
}

function FitBounds({ points }: { points: MapPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 13);
      return;
    }
    map.fitBounds(
      points.map((p) => [p.lat, p.lng] as [number, number]),
      { padding: [40, 40], maxZoom: 14 },
    );
  }, [map, points]);

  return null;
}

function FocusPoint({
  points,
  focusId,
}: {
  points: MapPoint[];
  focusId?: string;
}) {
  const map = useMap();

  useEffect(() => {
    if (!focusId) return;
    const point = points.find((p) => p.line.id === focusId);
    if (point) {
      map.setView([point.lat, point.lng], 15, { animate: true });
    }
  }, [map, points, focusId]);

  return null;
}

export function ActivitiesMap({
  lines,
  focusId,
}: {
  lines: BudgetLine[];
  focusId?: string;
}) {
  const points = useMemo<MapPoint[]>(() => {
    return lines
      .map((line) => {
        const coords = parseLatLng(line.location);
        return coords ? { line, lat: coords.lat, lng: coords.lng } : null;
      })
      .filter((p): p is MapPoint => p !== null);
  }, [lines]);

  if (points.length === 0) {
    return (
      <div className={styles.empty}>
        Aucun lieu géolocalisé pour l'instant. Ajoute un point GPS (lien Google
        Maps ou coordonnées « lat,lng ») à une activité pour la voir sur la
        carte.
      </div>
    );
  }

  return (
    <div className={styles.mapWrapper}>
      <MapContainer
        center={[points[0].lat, points[0].lng]}
        zoom={12}
        scrollWheelZoom={false}
        className={styles.map}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        <FocusPoint points={points} focusId={focusId} />
        {points.map(({ line, lat, lng }) => (
          <Marker key={line.id} position={[lat, lng]} icon={pinIcon}>
            <Popup>
              <strong>{line.label}</strong>
              <br />
              <span>{line.category}</span>
              <br />
              <a
                href={buildMapsUrl(line.location)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ouvrir dans Google Maps
              </a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
