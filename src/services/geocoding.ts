export type PlaceResult = {
  id: string;
  label: string;
  lat: number;
  lng: number;
};

/**
 * Recherche un lieu par son nom via Nominatim (OpenStreetMap).
 * Gratuit, sans clé, autorisé côté navigateur.
 */
export async function searchPlaces(
  query: string,
  signal?: AbortSignal,
): Promise<PlaceResult[]> {
  const url =
    "https://nominatim.openstreetmap.org/search" +
    `?format=json&limit=5&accept-language=fr&q=${encodeURIComponent(query)}`;

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error("Recherche de lieu indisponible");
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) return [];

  return data
    .map((item) => {
      const record = item as Record<string, unknown>;
      return {
        id: String(record.place_id ?? `${record.lat},${record.lon}`),
        label: String(record.display_name ?? ""),
        lat: Number(record.lat),
        lng: Number(record.lon),
      };
    })
    .filter(
      (place) =>
        Number.isFinite(place.lat) &&
        Number.isFinite(place.lng) &&
        place.label !== "",
    );
}
