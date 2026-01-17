import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useEffect, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import { Tracking, TrackingType } from "../../types/tracking";

interface TrackingFormModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (title: string, type: TrackingType, startDate: Date) => void;
  editingTracking?: Tracking;
}

export const TrackingFormModal = ({
  isVisible,
  onClose,
  onSubmit,
  editingTracking,
}: TrackingFormModalProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [title, setTitle] = useState("");
  const [selectedType, setSelectedType] = useState<TrackingType>("day");
  const [startDate] = useState(new Date());

  useEffect(() => {
    if (editingTracking) {
      setTitle(editingTracking.title);
      setSelectedType(editingTracking.type);
    } else {
      setTitle("");
      setSelectedType("day");
    }
  }, [editingTracking, isVisible]);

  const handleSubmit = () => {
    if (!title.trim()) {
      alert("Veuillez entrer un nom de tracking");
      return;
    }

    console.log(editingTracking ? "Édition" : "Ajout", "du tracking:");
    console.log("- Titre:", title);
    console.log("- Type:", selectedType);
    console.log("- Date de début:", startDate);

    onSubmit(title, selectedType, startDate);

    setTitle("");
    setSelectedType("day");
    onClose();
  };

  const getDateLabel = () => {
    switch (selectedType) {
      case "day":
        return startDate.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      case "week":
        return `Semaine en cours`;
      case "month":
        return startDate.toLocaleDateString("fr-FR", {
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
            {editingTracking ? "Modifier le tracking" : "Ajouter un tracking"}{" "}
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
                  selectedType === "day" && {
                    backgroundColor: colors.tint,
                  },
                ]}
                onPress={() => setSelectedType("day")}
              >
                <ThemedText>Jour</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  selectedType === "week" && {
                    backgroundColor: colors.tint,
                  },
                ]}
                onPress={() => setSelectedType("week")}
              >
                <ThemedText>Semaine</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  selectedType === "month" && {
                    backgroundColor: colors.tint,
                  },
                ]}
                onPress={() => setSelectedType("month")}
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
              {editingTracking ? "Modifier" : "Ajouter"}{" "}
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
    alignItems: "center", // Vertically center items in the row
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
    textAlign: "center", // Horizontally center the text within its 50% width
  },
  submitButton: {},
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
