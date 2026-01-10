import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import DailyTracking from "@/components/tracking/daily-tracking";
import { StyleSheet } from "react-native";

export default function TrackingScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Tracking</ThemedText>
      <DailyTracking />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingTop: 100,
  },
});
