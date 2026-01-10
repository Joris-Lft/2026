import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import H2 from "../H2";

// Type pour un tracking
type Tracking = {
  id: string;
  title: string;
  completed: boolean;
};

export default () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Données en dur pour commencer
  const [trackings, setTrackings] = useState<Tracking[]>([
    { id: "1", title: "Boire 2L d'eau", completed: false },
    { id: "2", title: "Faire du sport", completed: false },
    { id: "3", title: "Méditer 10min", completed: false },
    { id: "4", title: "Lire 30min", completed: false },
    { id: "5", title: "Dormir 8h", completed: false },
  ]);

  // Fonction pour cocher/décocher un tracking
  const toggleTracking = (id: string) => {
    setTrackings((prev) =>
      prev.map((tracking) =>
        tracking.id === id
          ? { ...tracking, completed: !tracking.completed }
          : tracking
      )
    );
  };

  // Trier les trackings : non complétés en haut, complétés en bas
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
          renderItem={({ item }: { item: Tracking }) => (
            <TouchableOpacity
              style={[
                styles.trackingItem,
                {
                  backgroundColor: colors.background,
                },
              ]}
              onPress={() => toggleTracking(item.id)}
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
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
