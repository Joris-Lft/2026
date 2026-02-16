import { MeasureFormModal } from "@/components/Measure/MeasureFormModal";
import { MeasureGraph } from "@/components/Measure/MeasureGraph";
import { MeasureTable } from "@/components/Measure/MeasureTable";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { CreateMeasurementInput, Measurement } from "@/types/measurements";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

const INITIAL_MEASUREMENTS: Measurement[] = [
  {
    id: "1",
    date: "2024-01-01",
    thigh: 40,
    arm: 10,
    chest: 70,
    waist: 50,
    hip: 75,
    weight: 40,
  },
  {
    id: "2",
    date: "2024-02-01",
    thigh: 51,
    arm: 31,
    chest: 91,
    waist: 71,
    hip: 96,
    weight: 61,
  },
  {
    id: "3",
    date: "2024-03-01",
    thigh: 51,
    arm: 31,
    chest: 91,
    waist: 71,
    hip: 96,
    weight: 61,
  },
  {
    id: "4",
    date: "2024-04-01",
    thigh: 51,
    arm: 31,
    chest: 91,
    waist: 71,
    hip: 96,
    weight: 61,
  },
  {
    id: "5",
    date: "2024-05-01",
    thigh: 51,
    arm: 31,
    chest: 91,
    waist: 71,
    hip: 96,
    weight: 61,
  },
  {
    id: "6",
    date: "2024-06-01",
    thigh: 51,
    arm: 31,
    chest: 91,
    waist: 71,
    hip: 96,
    weight: 61,
  },
];

const generateId = () => Date.now().toString();
const getTodayDate = () => new Date().toISOString().split("T")[0];

export default function MeasureScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [measurements, setMeasurements] =
    useState<Measurement[]>(INITIAL_MEASUREMENTS);

  const addMeasurement = useCallback((value: CreateMeasurementInput) => {
    const newMeasurement: Measurement = {
      ...value,
      id: generateId(),
      date: getTodayDate(),
    };
    setMeasurements((prev) => [...prev, newMeasurement]);
    setIsModalVisible(false);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <ThemedText type="title">Mensurations</ThemedText>

        <View style={styles.headerButtons}>
          <Pressable
            onPress={() => setIsModalVisible(true)}
            style={({ pressed }) => pressed && styles.pressed}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Ajouter une mensuration"
          >
            <ThemedText style={styles.linkText}>
              + Ajouter une mensuration
            </ThemedText>
          </Pressable>
        </View>

        <MeasureTable measurements={measurements} />

        <MeasureGraph measurements={measurements} />
      </ScrollView>

      {isModalVisible && (
        <MeasureFormModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onCreate={addMeasurement}
        />
      )}
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
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 16,
  },
  linkText: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
  pressed: {
    opacity: 0.6,
  },
});
