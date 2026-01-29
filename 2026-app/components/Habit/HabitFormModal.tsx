import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  CreateHabitInput,
  Habit,
  HabitFrequency,
  UpdateHabitInput,
} from "@/types/habits";
import { useEffect, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";

interface HabitFormModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCreate?: (value: CreateHabitInput) => void;
  onUpdate?: (value: UpdateHabitInput) => void;
  editingHabbits?: Habit;
}

export const HabitFormModal = ({
  isVisible,
  onClose,
  onCreate,
  onUpdate,
  editingHabbits,
}: HabitFormModalProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [title, setTitle] = useState("");
  const [selectedType, setSelectedType] = useState<HabitFrequency>("daily");
  const [date, setDate] = useState(new Date());
  const [startDate] = useState(new Date());

  useEffect(() => {
    if (editingHabbits) {
      console.log(editingHabbits);
      setTitle(editingHabbits.title);
      setSelectedType(editingHabbits.frequency);
      setDate(new Date(editingHabbits.created_at));
    } else {
      setTitle("");
      setSelectedType("daily");
      setDate(new Date());
    }
  }, [editingHabbits, isVisible]);

  const handleSubmit = () => {
    if (!title.trim()) {
      alert("Veuillez entrer un nom de tracking");
      return;
    }

    if (editingHabbits) {
      const habitEdited: UpdateHabitInput = {
        id: editingHabbits.id,
        name: title,
        frequency: selectedType,
        createdAt: startDate.toISOString().split("T")[0],
      };

      onUpdate?.(habitEdited);
    } else {
      const habitAdded: CreateHabitInput = {
        name: title,
        frequency: selectedType,
        createdAt: startDate.toISOString().split("T")[0],
      };

      onCreate?.(habitAdded);
    }

    setTitle("");
    setSelectedType("daily");
    setDate(new Date());
    onClose();
  };

  const getDateLabel = () => {
    const displayDate = editingHabbits
      ? new Date(editingHabbits.created_at)
      : startDate;

    switch (selectedType) {
      case "daily":
        return displayDate.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      case "weekly":
        const firstDayOfYear = new Date(displayDate.getFullYear(), 0, 1);
        const pastDaysOfYear =
          (displayDate.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNumber = Math.ceil(
          (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7,
        );
        return `Semaine ${weekNumber}`;
      case "monthly":
        return displayDate.toLocaleDateString("fr-FR", {
          month: "long",
          year: "numeric",
        });
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
    >
      <ThemedView style={styles.modalContent}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>
            {editingHabbits
              ? "Modifier le tracking"
              : "Ajouter un tracking"}{" "}
          </ThemedText>
          <TouchableOpacity onPress={onClose}>
            <ThemedText style={styles.closeButton}>✕</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <ThemedText style={styles.label}>Nom du tracking</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.icon,
                },
              ]}
              placeholder="Ex: Boire 2L d'eau"
              placeholderTextColor={colors.icon}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.field}>
            <ThemedText style={styles.label}>Fréquence</ThemedText>
            <View style={styles.typeToggle}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  selectedType === "daily" && {
                    backgroundColor: colors.tint,
                  },
                ]}
                onPress={() => setSelectedType("daily")}
              >
                <ThemedText>Jour</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  selectedType === "weekly" && {
                    backgroundColor: colors.tint,
                  },
                ]}
                onPress={() => setSelectedType("weekly")}
              >
                <ThemedText>Semaine</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  selectedType === "monthly" && {
                    backgroundColor: colors.tint,
                  },
                ]}
                onPress={() => setSelectedType("monthly")}
              >
                <ThemedText>Mois</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <ThemedText style={styles.label}>Date de début</ThemedText>
            <ThemedText
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.icon,
                },
              ]}
            >
              {getDateLabel()}
            </ThemedText>
          </View>
        </View>

        <View style={styles.actions}>
          <ThemedText style={styles.linkText} onPress={onClose}>
            Annuler
          </ThemedText>

          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              { backgroundColor: colors.tint },
            ]}
            onPress={handleSubmit}
          >
            <ThemedText style={styles.submitButtonText}>
              {editingHabbits ? "Modifier" : "Ajouter"}{" "}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: "center",
    margin: 0,
    paddingHorizontal: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    fontSize: 24,
    fontWeight: "bold",
  },
  form: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  typeToggle: {
    flexDirection: "row",
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  dateDisplay: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    alignItems: "center",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  linkText: {
    fontSize: 14,
    textDecorationLine: "underline",
    width: "50%",
    textAlign: "center",
  },
  submitButton: {},
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
