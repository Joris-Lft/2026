import { MeasureFormModal } from "@/components/Measure/MeasureFormModal";
import { MeasureGraph } from "@/components/Measure/MeasureGraph";
import { MeasureTable } from "@/components/Measure/MeasureTable";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/contexts/auth-context";
import { createMeasure, getMeasuresByUser } from "@/services/measures";
import { CreateMeasureInput, Measure } from "@/types/measures";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

const todayDate = new Date().toISOString().split("T")[0];

export default function MeasureScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Charger les mensurations depuis Airtable
  const loadMeasures = async () => {
    if (!user?.email) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const today = new Date();
      let measures: Measure[] = [];

      // Charger les mensuraations
      measures = await getMeasuresByUser(user.email);
      setMeasures(measures);
    } catch (error) {
      console.error(`Error loading measures:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMeasures();
  }, [user?.email]);

  const addMeasure = async (value: CreateMeasureInput) => {
    if (!user?.id) {
      return;
    }
    try {
      await createMeasure(user?.id, { ...value, date: todayDate });
      loadMeasures();
    } catch (error) {
      console.error("Erreur lors de la création de la mensuration:", error);
    }
    setIsModalVisible(false);
  };

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

        <MeasureTable measures={measures} />

        <MeasureGraph measurements={measures} />
      </ScrollView>

      {isModalVisible && (
        <MeasureFormModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onCreate={addMeasure}
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
