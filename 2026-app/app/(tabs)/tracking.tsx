import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { PeriodTracking } from "@/components/tracking/period-tracking";
import { useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import { PeriodData, Tracking } from "../../types/tracking";

export default function TrackingScreen() {
  const [trackings, setTrackings] = useState<Tracking[]>([
    { id: "1", title: "Boire 2L d'eau", completed: false, type: "day" },
    { id: "2", title: "Faire du sport", completed: false, type: "day" },
    { id: "3", title: "Méditer 10min", completed: false, type: "week" },
    { id: "4", title: "Lire 30min", completed: false, type: "week" },
    { id: "5", title: "Dormir 8h", completed: false, type: "month" },
    { id: "6", title: "Dormir 8h", completed: false, type: "month" },
    { id: "7", title: "Dormir 8h", completed: false, type: "day" },
    { id: "8", title: "Dormir 8h", completed: false, type: "day" },
    { id: "9", title: "Dormir 8h", completed: false, type: "week" },
    { id: "10", title: "Boire 212L d'eau", completed: false, type: "day" },
  ]);

  const periods: PeriodData[] = [
    {
      key: "day",
      trackings: trackings.filter((t) => t.type === "day"),
      period: "day",
    },
    {
      key: "week",
      trackings: trackings.filter((t) => t.type === "week"),
      period: "week",
    },
    {
      key: "month",
      trackings: trackings.filter((t) => t.type === "month"),
      period: "month",
    },
  ];

  const toggleTracking = (id: string) => {
    setTrackings((prev) =>
      prev.map((tracking) =>
        tracking.id === id
          ? { ...tracking, completed: !tracking.completed }
          : tracking
      )
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Tracking</ThemedText>
      <FlatList
        data={periods}
        renderItem={({ item }) => (
          <PeriodTracking
            trackings={item.trackings}
            onToggle={toggleTracking}
            period={item.period}
          />
        )}
        keyExtractor={(item) => item.key}
        style={{ width: "100%" }}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    width: "100%",
    paddingTop: 100,
    paddingBottom: 20,
  },
});
