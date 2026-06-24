import { useMemo } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Measure, MeasureKey } from "@/types/measures";
import styles from "./MeasureGraph.module.css";

interface MeasureGraphProps {
  measurements: Measure[];
}

const CM_METRICS: { key: MeasureKey; color: string; label: string }[] = [
  { key: "thigh", color: "#e74c3c", label: "Cuisse" },
  { key: "arm", color: "#3498db", label: "Bras" },
  { key: "bust", color: "#2ecc71", label: "Poitrine" },
  { key: "waist", color: "#f39c12", label: "Taille" },
  { key: "hip", color: "#9b59b6", label: "Hanche" },
];

function formatDateLabel(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export function MeasureGraph({ measurements }: MeasureGraphProps) {
  const chartData = useMemo(() => {
    return [...measurements]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((m) => ({
        label: formatDateLabel(m.date),
        thigh: m.thigh,
        arm: m.arm,
        bust: m.bust,
        waist: m.waist,
        hip: m.hip,
        weight: m.weight,
      }));
  }, [measurements]);

  if (chartData.length === 0) return null;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Mensurations (cm)</h2>

      <div className={styles.legendRow}>
        {CM_METRICS.map(({ key, color, label }) => (
          <span key={key} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData} margin={{ bottom: 20 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#888" }}
              angle={-30}
              textAnchor="end"
              height={50}
            />
            <YAxis tick={{ fontSize: 11, fill: "#888" }} tickCount={6} />
            <Tooltip />
            {CM_METRICS.map(({ key, color, label }) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={label}
                stroke={color}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h2 className={styles.title}>Poids (kg)</h2>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData} margin={{ bottom: 20 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#888" }}
              angle={-30}
              textAnchor="end"
              height={50}
            />
            <YAxis tick={{ fontSize: 11, fill: "#888" }} tickCount={5} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="weight"
              name="Poids"
              stroke="#1abc9c"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
