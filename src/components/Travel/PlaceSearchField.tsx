import { useEffect, useRef, useState } from "react";
import { Check, MapPin, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { searchPlaces, type PlaceResult } from "@/services/geocoding";
import { parseLatLng } from "@/types/travel-budget";
import styles from "./PlaceSearchField.module.css";

interface PlaceSearchFieldProps {
  value: string;
  onChange: (location: string) => void;
}

export function PlaceSearchField({ value, onChange }: PlaceSearchFieldProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickedLabel, setPickedLabel] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (controllerRef.current) controllerRef.current.abort();
    },
    [],
  );

  const coords = parseLatLng(value);
  const hasUnresolved = value.trim() !== "" && !coords;

  const handleQueryChange = (raw: string) => {
    setQuery(raw);
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (controllerRef.current) controllerRef.current.abort();

    const q = raw.trim();

    // Collage direct de coordonnées ou d'une URL Google Maps exploitable
    const direct = parseLatLng(q);
    if (direct) {
      onChange(q);
      setPickedLabel(null);
      setResults([]);
      return;
    }

    if (q.length < 3) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    debounceRef.current = setTimeout(() => {
      setIsSearching(true);
      searchPlaces(q, controller.signal)
        .then((places) => setResults(places))
        .catch((err) => {
          if (err instanceof Error && err.name === "AbortError") return;
          setError("Recherche indisponible, réessaie");
        })
        .finally(() => setIsSearching(false));
    }, 450);
  };

  const pick = (place: PlaceResult) => {
    onChange(`${place.lat},${place.lng}`);
    setPickedLabel(place.label);
    setQuery("");
    setResults([]);
  };

  const clear = () => {
    onChange("");
    setPickedLabel(null);
    setQuery("");
    setResults([]);
  };

  return (
    <div className={styles.field}>
      {coords && (
        <div className={styles.selected}>
          <Check size={16} className={styles.selectedIcon} />
          <span className={styles.selectedText}>
            {pickedLabel ??
              `Position enregistrée (${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)})`}
          </span>
          <button
            type="button"
            className={styles.clearButton}
            onClick={clear}
            aria-label="Retirer le lieu"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {hasUnresolved && (
        <p className={styles.warning}>
          Lieu non géolocalisé — cherche-le ci-dessous pour l'afficher sur la
          carte.
        </p>
      )}

      <div className={styles.searchRow}>
        <MapPin size={16} className={styles.searchIcon} aria-hidden />
        <Input
          className={styles.searchInput}
          type="search"
          placeholder="Rechercher un lieu (ex. Temple Kiyomizu-dera Kyoto)"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          aria-label="Rechercher un lieu"
        />
      </div>

      {isSearching && <p className={styles.status}>Recherche…</p>}
      {error && <p className={styles.status}>{error}</p>}

      {results.length > 0 && (
        <ul className={styles.results}>
          {results.map((place) => (
            <li key={place.id}>
              <button
                type="button"
                className={styles.result}
                onClick={() => pick(place)}
              >
                {place.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
