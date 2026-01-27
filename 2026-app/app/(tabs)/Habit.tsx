import { HabitFormModal } from "@/components/Habit/HabitFormModal";
import { PeriodHabit } from "@/components/Habit/PeriodHabit";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/contexts/auth-context";
import { createHabit } from "@/services/habits";
import { CreateHabitInput } from "@/types/habits";
import { PeriodData } from "@/types/tracking";
import { useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";

export default function HabitScreen() {
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshPeriodHabits, setRefreshPeriodHabits] = useState(false);
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

  const addHabit = async (value: CreateHabitInput) => {
    if (!user?.id) {
      // setIsLoading(false);
      return;
    }
    try {
      await createHabit(user?.id, value); // Await createHabit
      console.log("Habit créé avec succès:", value);
      setRefreshPeriodHabits((prev) => !prev);
    } catch (error) {
      console.error("Erreur lors de la création de l'habit:", error);
    }
    setIsModalVisible(false);
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
          <TouchableOpacity
            onPress={() => setIsModalVisible(true)}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.linkText}>
              + Ajouter un tracking
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={periods}
        renderItem={({ item }) => (
          <PeriodHabit
            period={item.period}
            isEditMode={isEditMode}
            refreshTrigger={refreshPeriodHabits}
          />
        )}
        keyExtractor={(item) => item.key}
        extraData={refreshPeriodHabits}
        style={{ width: "100%" }}
        showsVerticalScrollIndicator={false}
      />
      <HabitFormModal
        isVisible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
        }}
        onCreate={addHabit}
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
