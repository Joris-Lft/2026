import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { PeriodTracking } from "@/components/tracking/period-tracking";
import { TrackingFormModal } from "@/components/tracking/tracking-form-modal";
import { useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { PeriodData, Tracking, TrackingType } from "../../types/tracking";
import { Habit } from "../../types/habits";

export default function TrackingScreen() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTracking, setEditingTracking] = useState<Habit | undefined>(
    undefined,
  );
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
    setEditingTracking(undefined);
    setIsModalVisible(true);
  };

  // todo: déplacer dans period-tracking.tsx
  const editTracking = (id: string) => {
    // todo: appeler service updateHabit
    // const tracking = trackings.find((t) => t.id === id);
    // if (tracking) {
    //   setEditingTracking(tracking);
    //   setIsModalVisible(true);
    // }
  };

  // todo: déplacer dans period-tracking.tsx
  const deleteTracking = (id: string) => {
    // todo: appeler service deleteHabit
    console.log("Supprimer le tracking:", id);
  };

  // todo: déplacer dans period-tracking.tsx
  const handleFormSubmit = (
    title: string,
    type: TrackingType,
    startDate: Date,
  ) => {
    if (editingTracking) {
      console.log("Édition du tracking:", editingTracking.id);
      console.log("- Nouveau titre:", title);
      console.log("- Nouveau type:", type);
      console.log("- Date:", startDate);
    } else {
      console.log("Ajout d'un nouveau tracking:");
      console.log("- Titre:", title);
      console.log("- Type:", type);
      console.log("- Date:", startDate);
    }
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
          <PeriodTracking
            period={item.period}
            isEditMode={isEditMode}
            onEdit={editTracking}
            onDelete={deleteTracking}
          />
        )}
        keyExtractor={(item) => item.key}
        style={{ width: "100%" }}
        showsVerticalScrollIndicator={false}
      />
      {/* // todo: déplacer dans period-tracking.tsx */}
      <TrackingFormModal
        isVisible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setEditingTracking(undefined);
        }}
        onSubmit={handleFormSubmit}
        editingTracking={editingTracking}
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
