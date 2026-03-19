import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Measure, MeasureKey, MeasureType } from "@/types/measures";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

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

const STICKY_COLUMN_WIDTH = 80;

export const MeasureTable = ({
  measures,
  isEditMode,
  onDelete,
  onEdit,
}: MeasureTableProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [scrollableHeaderHeight, setScrollableHeaderHeight] = useState<number | undefined>();

  const measureByDate = useMemo(
    () => Object.fromEntries(measures.map((m) => [m.date, m])),
    [measures],
  );

  const dates = useMemo(
    () => [...new Set(measures.map((m) => m.date))].sort(),
    [measures],
  );

  return (
    <View style={styles.outerContainer}>
      <View
        style={[
          styles.stickyColumn,
          { width: STICKY_COLUMN_WIDTH, backgroundColor: colors.background },
        ]}
      >
        <View style={[styles.header, scrollableHeaderHeight ? { height: scrollableHeaderHeight } : undefined]}>
          <ThemedText style={[styles.headerCell, styles.stickyCell]}>
            Mesure
          </ThemedText>
        </View>
        {MEASURE_TYPES.map((type) => (
          <View key={type.key} style={styles.row}>
            <ThemedText style={[styles.cell, styles.stickyCell]}>
              {type.label}
            </ThemedText>
          </View>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ marginLeft: STICKY_COLUMN_WIDTH }}>
          <View
            style={[styles.header, isEditMode && styles.headerWithActions]}
            onLayout={(e) => setScrollableHeaderHeight(e.nativeEvent.layout.height)}
          >
            {dates.map((date) => (
              <View key={date} style={styles.headerCellContainer}>
                <ThemedText style={styles.headerCell}>
                  {new Date(date).toLocaleDateString()}
                </ThemedText>
                {isEditMode && measureByDate[date] && (
                  <View style={styles.headerActions}>
                    <TouchableOpacity
                      onPress={() => onEdit?.(measureByDate[date])}
                      hitSlop={6}
                    >
                      <IconSymbol name="pencil" size={14} color={colors.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => onDelete?.(measureByDate[date])}
                      hitSlop={6}
                    >
                      <IconSymbol name="trash" size={14} color="#e53935" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
          {MEASURE_TYPES.map((type) => (
            <View key={type.key} style={styles.row}>
              {dates.map((date) => {
                const measure = measureByDate[date];
                return (
                  <ThemedText key={date} style={styles.cell}>
                    {measure ? formatValue(measure[type.key], type.key) : "-"}
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
  headerWithActions: {
    paddingBottom: 6,
    alignItems: "center",
  },
  headerCellContainer: {
    width: 100,
    alignItems: "center",
    gap: 6,
  },
  headerCell: {
    fontWeight: "bold",
    fontSize: 12,
    width: 100,
    textAlign: "center",
  },
  headerActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    paddingBottom: 4,
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
  },
});
