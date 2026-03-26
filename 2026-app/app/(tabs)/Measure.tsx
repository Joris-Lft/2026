import { MeasureFormModal } from "@/components/Measure/MeasureFormModal";
import { MeasureGraph } from "@/components/Measure/MeasureGraph";
import { MeasureTable } from "@/components/Measure/MeasureTable";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import {
  createMeasure,
  deleteMeasure,
  getMeasuresByUser,
  updateMeasure,
} from "@/services/measures";
import {
  CreateMeasureInput,
  Measure,
  UpdateMeasureInput,
} from "@/types/measures";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const todayDate = new Date().toISOString().split("T")[0];

export default function MeasureScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [isEditMode, setIsEditMode] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMeasure, setSelectedMeasure] = useState<Measure | undefined>();
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
  }, []);

  const addMeasure = async (value: CreateMeasureInput) => {
    if (!user?.id) {
      return;
    }
    try {
      await createMeasure(user?.id, value, todayDate);
      loadMeasures();
    } catch (error) {
      console.error("Erreur lors de la création de la mensuration:", error);
    }
    setIsModalVisible(false);
  };

  const handleEdit = (measure: Measure) => {
    setSelectedMeasure(measure);
    setIsModalVisible(true);
  };

  const handleUpdate = async (value: UpdateMeasureInput) => {
    try {
      await updateMeasure(value);
      loadMeasures();
    } catch (error) {
      console.error("Erreur lors de la modification de la mensuration:", error);
    }
    setSelectedMeasure(undefined);
    setIsModalVisible(false);
  };

  const handleDelete = async (measure: Measure) => {
    try {
      await deleteMeasure(measure.id);
      loadMeasures();
    } catch (error) {
      console.error("Erreur lors de la suppression de la mensuration:", error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedText type="title" style={styles.title}>
          Mensurations
        </ThemedText>

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
              accessibilityRole="button"
              accessibilityLabel="Ajouter une mensuration"
            >
              <ThemedText style={styles.linkText}>
                + Ajouter une mensuration
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.tint} />
            <ThemedText style={styles.loadingText}>
              Chargement des habitudes...
            </ThemedText>
          </View>
        ) : measures.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              Aucune mensuration pour le moment
            </ThemedText>
          </View>
        ) : (
          <View>
            <MeasureTable
              measures={measures}
              isEditMode={isEditMode}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            <MeasureGraph measurements={measures} />
          </View>
        )}
      </ScrollView>

      {isModalVisible && (
        <MeasureFormModal
          isVisible={isModalVisible}
          onClose={() => {
            setIsModalVisible(false);
            setSelectedMeasure(undefined);
          }}
          onCreate={addMeasure}
          initialMeasure={selectedMeasure}
          onUpdate={handleUpdate}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    width: "100%",
  },
  title: {
    paddingHorizontal: 20,
    textAlign: "center",
  },
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
  pressed: {
    opacity: 0.6,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.7,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
});
