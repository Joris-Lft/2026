import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CM_METRICS } from "@/constants/charts";
import { useChartColors } from "@/hooks/use-chart-colors";
import type { Measure } from "@/types/measures";
import styles from "./MeasureGraph.module.css";

interface MeasureGraphProps {
  measurements: Measure[];
}

function formatDateLabel(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export function MeasureGraph({ measurements }: MeasureGraphProps) {
  const colors = useChartColors();

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

  const tooltipStyle = useMemo(
    () => ({
      backgroundColor: colors.tooltipBackground,
      border: `1px solid ${colors.tooltipBorder}`,
      borderRadius: 8,
      color: colors.tooltipText,
      fontSize: 12,
    }),
    [colors],
  );

  if (chartData.length === 0) return null;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Mensurations (cm)</h2>

      <div className={styles.legendRow}>
        {CM_METRICS.map(({ key, label }) => (
          <span key={key} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ backgroundColor: colors.metrics[key] }}
            />
            {label}
          </span>
        ))}
      </div>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData} margin={{ bottom: 20 }}>
            <CartesianGrid stroke={colors.grid} strokeDasharray="4 4" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: colors.axis }}
              axisLine={{ stroke: colors.grid }}
              tickLine={{ stroke: colors.grid }}
              angle={-30}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fontSize: 11, fill: colors.axis }}
              axisLine={{ stroke: colors.grid }}
              tickLine={{ stroke: colors.grid }}
              tickCount={6}
            />
            <Tooltip contentStyle={tooltipStyle} />
            {CM_METRICS.map(({ key, label }) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={label}
                stroke={colors.metrics[key]}
                strokeWidth={2}
                dot={{ r: 3, fill: colors.metrics[key] }}
                activeDot={{ r: 5 }}
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
            <CartesianGrid stroke={colors.grid} strokeDasharray="4 4" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: colors.axis }}
              axisLine={{ stroke: colors.grid }}
              tickLine={{ stroke: colors.grid }}
              angle={-30}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fontSize: 11, fill: colors.axis }}
              axisLine={{ stroke: colors.grid }}
              tickLine={{ stroke: colors.grid }}
              tickCount={5}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="weight"
              name="Poids"
              stroke={colors.metrics.weight}
              strokeWidth={2}
              dot={{ r: 3, fill: colors.metrics.weight }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
