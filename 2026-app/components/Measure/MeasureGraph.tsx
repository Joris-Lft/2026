import { ThemedText } from "@/components/themed-text";
import { Measure, MeasureKey } from "@/types/measures";
import { Inter_400Regular, useFonts } from "@expo-google-fonts/inter";
import { useFont } from "@shopify/react-native-skia";
import { StyleSheet, View } from "react-native";
import { CartesianChart, Line } from "victory-native";

type MeasureGraphProps = {
  measurements: Measure[];
};

const CM_METRICS: { key: MeasureKey; color: string; label: string }[] = [
  { key: "thigh", color: "#e74c3c", label: "Cuisse" },
  { key: "arm", color: "#3498db", label: "Bras" },
  { key: "bust", color: "#2ecc71", label: "Poitrine" },
  { key: "waist", color: "#f39c12", label: "Taille" },
  { key: "hip", color: "#9b59b6", label: "Hanche" },
];

export const MeasureGraph = ({ measurements }: MeasureGraphProps) => {
  const [fontsLoaded] = useFonts({ Inter_400Regular });
  const font = useFont(
    require("@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf"),
    11,
  );

  const sorted = [...measurements].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const chartData = sorted.map((m) => ({
    date: new Date(m.date).getTime(),
    thigh: m.thigh,
    arm: m.arm,
    bust: m.bust,
    waist: m.waist,
    hip: m.hip,
    weight: m.weight,
  }));

  const tickDates = sorted.map((m) => new Date(m.date).getTime());

  const formatDate = (val: number) =>
    new Date(val).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    });

  if (!fontsLoaded || !font) return null;

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Mensurations (cm)</ThemedText>

      <View style={styles.legendRow}>
        {CM_METRICS.map(({ key, color, label }) => (
          <View key={key} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <ThemedText style={styles.legendLabel}>{label}</ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.chartContainer}>
        <CartesianChart
          data={chartData}
          xKey="date"
          yKeys={CM_METRICS.map((m) => m.key)}
          domainPadding={{ top: 10, bottom: 10 }}
          xAxis={{
            font,
            tickValues: tickDates,
            formatXLabel: formatDate,
            labelColor: "#888",
            labelRotate: -30,
          }}
          yAxis={[
            {
              font,
              tickCount: 6,
              labelColor: "#888",
              formatYLabel: (val) => `${val}`,
            },
          ]}
        >
          {({ points }) =>
            CM_METRICS.map(({ key, color }) => (
              <Line
                key={key}
                points={points[key]}
                color={color}
                strokeWidth={2}
                animate={{ type: "timing", duration: 500 }}
              />
            ))
          }
        </CartesianChart>
      </View>

      <ThemedText style={styles.title}>Poids (kg)</ThemedText>

      <View style={styles.chartContainer}>
        <CartesianChart
          data={chartData}
          xKey="date"
          yKeys={["weight"]}
          domainPadding={{ top: 10, bottom: 10 }}
          xAxis={{
            font,
            tickValues: tickDates,
            formatXLabel: formatDate,
            labelColor: "#888",
            labelRotate: -30,
          }}
          yAxis={[
            {
              font,
              tickCount: 5,
              labelColor: "#888",
              formatYLabel: (val) => `${val}`,
            },
          ]}
        >
          {({ points }) => (
            <Line
              points={points.weight}
              color="#1abc9c"
              strokeWidth={2}
              animate={{ type: "timing", duration: 500 }}
            />
          )}
        </CartesianChart>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    marginTop: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  chartContainer: {
    width: "100%",
    height: 250,
    marginBottom: 32,
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
  },
});
