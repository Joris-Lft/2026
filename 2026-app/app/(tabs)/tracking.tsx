import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { PeriodTracking } from "@/components/tracking/period-tracking";
import { TrackingFormModal } from "@/components/tracking/tracking-form-modal";
import { useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { PeriodData } from "@/types/tracking";

export default function TrackingScreen() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
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

  const addTracking = () => {
    // todo: appeler service createHabit
    setIsModalVisible(true);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Tracking</ThemedText>
      <View style={styles.headerButtons}>
        <TouchableOpacity
          onPress={() => setIsEditMode(!isEditMode)}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.linkText}>
            {isEditMode ? "Sortir du mode édition" : "Mode édition"}
          </ThemedText>
        </TouchableOpacity>

        {isEditMode && (
          <TouchableOpacity onPress={addTracking} activeOpacity={0.7}>
            <ThemedText style={styles.linkText}>
              + Ajouter un tracking
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={periods}
        renderItem={({ item }) => (
          <PeriodTracking period={item.period} isEditMode={isEditMode} />
        )}
        keyExtractor={(item) => item.key}
        style={{ width: "100%" }}
        showsVerticalScrollIndicator={false}
      />
      <TrackingFormModal
        isVisible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
        }}
        onSubmit={addTracking}
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
  headerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 16,
  },
  linkText: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
