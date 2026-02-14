import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  Measurement,
  MeasurementKey,
  MeasurementType,
} from "@/types/measurements";
import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

interface MeasurementTableProps {
  measurements: Measurement[];
}

const MEASUREMENT_TYPES: MeasurementType[] = [
  { key: "thigh", label: "Cuisse" },
  { key: "arm", label: "Bras" },
  { key: "chest", label: "Poitrine" },
  { key: "waist", label: "Taille" },
  { key: "hip", label: "Hanche" },
  { key: "weight", label: "Poids" },
];

const formatValue = (value: number, key: MeasurementKey) =>
  `${value} ${key === "weight" ? "kg" : "cm"}`;

const STICKY_COLUMN_WIDTH = 80;

export const MeasureTable = ({ measurements }: MeasurementTableProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const measurementByDate = useMemo(
    () => Object.fromEntries(measurements.map((m) => [m.date, m])),
    [measurements],
  );

  const dates = useMemo(
    () => [...new Set(measurements.map((m) => m.date))].sort(),
    [measurements],
  );

  return (
    <View style={styles.outerContainer}>
      <View
        style={[
          styles.stickyColumn,
          { width: STICKY_COLUMN_WIDTH, backgroundColor: colors.background },
        ]}
      >
        <View style={styles.header}>
          <ThemedText style={[styles.headerCell, styles.stickyCell]}>
            Mesure
          </ThemedText>
        </View>
        {MEASUREMENT_TYPES.map((type) => (
          <View key={type.key} style={styles.row}>
            <ThemedText style={[styles.cell, styles.stickyCell]}>
              {type.label}
            </ThemedText>
          </View>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ marginLeft: STICKY_COLUMN_WIDTH }}>
          <View style={styles.header}>
            {dates.map((date) => (
              <ThemedText key={date} style={styles.headerCell}>
                {new Date(date).toLocaleDateString()}
              </ThemedText>
            ))}
          </View>
          {MEASUREMENT_TYPES.map((type) => (
            <View key={type.key} style={styles.row}>
              {dates.map((date) => {
                const measurement = measurementByDate[date];
                return (
                  <ThemedText key={date} style={styles.cell}>
                    {measurement
                      ? formatValue(measurement[type.key], type.key)
                      : "-"}
                  </ThemedText>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flexDirection: "row",
    width: "90%",
    marginTop: 16,
    marginHorizontal: "auto",
  },
  stickyColumn: {
    position: "absolute",
    left: 0,
    zIndex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  headerCell: {
    fontWeight: "bold",
    fontSize: 12,
    width: 100,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cell: {
    fontSize: 12,
    width: 100,
    textAlign: "center",
  },
  stickyCell: {
    textAlign: "center",
    // paddingLeft: 20,
  },
});
