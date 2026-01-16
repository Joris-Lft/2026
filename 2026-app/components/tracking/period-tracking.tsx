import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { PeriodData, Tracking } from "../../types/tracking";
import H2 from "../H2";

// Props pour le composant
interface PeriodTrackingProps {
  trackings: Tracking[];
  onToggle: (id: string) => void;
  period: PeriodData["period"];
}

export const PeriodTracking = ({
  trackings,
  onToggle,
}: PeriodTrackingProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const sortedTrackings = [...trackings].sort(
    (a, b) => Number(a.completed) - Number(b.completed)
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.listContainer, { borderColor: colors.icon + "40" }]}>
        <H2 style={styles.title}>
          Aujourd'hui -{" "}
          {new Date().toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
          })}
        </H2>

        <FlatList
          data={sortedTrackings}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.trackingItem,
                { backgroundColor: colors.background },
              ]}
              onPress={() => onToggle(item.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  { borderColor: item.completed ? colors.tint : colors.icon },
                  item.completed && { backgroundColor: colors.tint },
                ]}
              >
                {item.completed && (
                  <IconSymbol name="checkmark" size={16} color="#fff" />
                )}
              </View>
              <ThemedText
                style={[
                  styles.trackingTitle,
                  item.completed && styles.completedText,
                ]}
              >
                {item.title}
              </ThemedText>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.list}
        />
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: "100%",
  },
  title: {
    marginTop: 12,
    marginLeft: 12,
  },
  listContainer: {
    borderRadius: 12,
    borderWidth: 2,
    overflow: "hidden",
  },
  list: {
    gap: 0,
  },
  trackingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    gap: 12,
  },
  trackingTitle: {
    flex: 1,
    fontSize: 16,
  },
  completedText: {
    opacity: 0.5,
    textDecorationLine: "line-through",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
});
