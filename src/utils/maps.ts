/**
 * Construit une URL Google Maps : renvoie le lien tel quel si `location` est
 * déjà une URL, sinon une recherche sur le texte fourni.
 */
export function buildMapsUrl(location: string): string {
  const value = location.trim();
  if (/^https?:\/\//i.test(value)) return value;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
}
