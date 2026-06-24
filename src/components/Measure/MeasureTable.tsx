import { useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Measure, MeasureKey, MeasureType } from "@/types/measures";
import styles from "./MeasureTable.module.css";

interface MeasureTableProps {
  measures: Measure[];
  isEditMode?: boolean;
  onDelete?: (measure: Measure) => void;
  onEdit?: (measure: Measure) => void;
}

const MEASURE_TYPES: MeasureType[] = [
  { key: "thigh", label: "Cuisse" },
  { key: "arm", label: "Bras" },
  { key: "bust", label: "Poitrine" },
  { key: "waist", label: "Taille" },
  { key: "hip", label: "Hanche" },
  { key: "weight", label: "Poids" },
];

const formatValue = (value: number, key: MeasureKey) =>
  `${value} ${key === "weight" ? "kg" : "cm"}`;

export function MeasureTable({
  measures,
  isEditMode = false,
  onDelete,
  onEdit,
}: MeasureTableProps) {
  const measureByDate = useMemo(
    () => Object.fromEntries(measures.map((m) => [m.date, m])),
    [measures],
  );

  const dates = useMemo(
    () => [...new Set(measures.map((m) => m.date))].sort(),
    [measures],
  );

  return (
    <div className={styles.outerContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.stickyHeader}>Mesure</th>
            {dates.map((date) => (
              <th key={date} className={styles.dateHeader}>
                <span>{new Date(date).toLocaleDateString()}</span>
                {isEditMode && measureByDate[date] && (
                  <span className={styles.headerActions}>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() => onEdit?.(measureByDate[date])}
                      aria-label="Modifier"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() => onDelete?.(measureByDate[date])}
                      aria-label="Supprimer"
                    >
                      <Trash2 size={14} color="var(--color-danger)" />
                    </button>
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MEASURE_TYPES.map((type) => (
            <tr key={type.key}>
              <th className={styles.stickyCell}>{type.label}</th>
              {dates.map((date) => {
                const measure = measureByDate[date];
                return (
                  <td key={date} className={styles.cell}>
                    {measure ? formatValue(measure[type.key], type.key) : "-"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
