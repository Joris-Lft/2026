import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { PeriodTracking } from "@/components/tracking/period-tracking";
import { FlatList, StyleSheet } from "react-native";
import { PeriodData } from "../../types/tracking";

export default function TrackingScreen() {

  const periods: PeriodData[] = [
    {
      key: "day",
      trackings: [],
      period: "day",
    },
    {
      key: "week",
      trackings: [],
      period: "week",
    },
    {
      key: "month",
      trackings: [],
      period: "month",
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Tracking</ThemedText>
      <FlatList
        data={periods}
        renderItem={({ item }) => (
          <PeriodTracking period={item.period} />
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
