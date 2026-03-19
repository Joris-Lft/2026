import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { CreateMeasureInput, Measure, UpdateMeasureInput } from "@/types/measures";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import Modal from "react-native-modal";

type MeasureFormModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onCreate: (value: CreateMeasureInput) => void;
  initialMeasure?: Measure;
  onUpdate?: (value: UpdateMeasureInput) => void;
};

type FormState = {
  thigh: string;
  arm: string;
  chest: string;
  waist: string;
  hip: string;
  weight: string;
};

const INITIAL_FORM_STATE: FormState = {
  thigh: "",
  arm: "",
  chest: "",
  waist: "",
  hip: "",
  weight: "",
};

const FORM_FIELDS: { key: keyof FormState; placeholder: string }[] = [
  { key: "thigh", placeholder: "Cuisse (cm)" },
  { key: "arm", placeholder: "Bras (cm)" },
  { key: "chest", placeholder: "Poitrine (cm)" },
  { key: "waist", placeholder: "Taille (cm)" },
  { key: "hip", placeholder: "Hanche (cm)" },
  { key: "weight", placeholder: "Poids (kg)" },
];

export const MeasureFormModal = ({
  isVisible,
  onClose,
  onCreate,
  initialMeasure,
  onUpdate,
}: MeasureFormModalProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isEditing = !!initialMeasure;

  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);

  useEffect(() => {
    if (initialMeasure) {
      setForm({
        thigh: String(initialMeasure.thigh),
        arm: String(initialMeasure.arm),
        chest: String(initialMeasure.bust),
        waist: String(initialMeasure.waist),
        hip: String(initialMeasure.hip),
        weight: String(initialMeasure.weight),
      });
    } else {
      setForm(INITIAL_FORM_STATE);
    }
  }, [initialMeasure]);

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (isEditing && onUpdate && initialMeasure) {
      onUpdate({
        id: initialMeasure.id,
        date: initialMeasure.date,
        thigh: parseFloat(form.thigh) || 0,
        arm: parseFloat(form.arm) || 0,
        bust: parseFloat(form.chest) || 0,
        waist: parseFloat(form.waist) || 0,
        hip: parseFloat(form.hip) || 0,
        weight: parseFloat(form.weight) || 0,
      });
    } else {
      const measurement: CreateMeasureInput = {
        thigh: parseFloat(form.thigh) || 0,
        arm: parseFloat(form.arm) || 0,
        bust: parseFloat(form.chest) || 0,
        waist: parseFloat(form.waist) || 0,
        hip: parseFloat(form.hip) || 0,
        weight: parseFloat(form.weight) || 0,
      };
      onCreate(measurement);
    }
    setForm(INITIAL_FORM_STATE);
    onClose();
  };

  const handleClose = () => {
    setForm(INITIAL_FORM_STATE);
    onClose();
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      style={styles.modal}
    >
      <ThemedView style={styles.modalContent}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>
            {isEditing ? "Modifier les mensurations" : "Ajouter des mensurations"}
          </ThemedText>
          <Pressable
            onPress={handleClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Fermer"
          >
            <ThemedText style={styles.closeButton}>✕</ThemedText>
          </Pressable>
        </View>

        <View style={styles.form}>
          {FORM_FIELDS.map(({ key, placeholder }) => (
            <TextInput
              key={key}
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.icon,
                },
              ]}
              placeholderTextColor={colors.text}
              placeholder={placeholder}
              value={form[key]}
              onChangeText={(value) => handleChange(key, value)}
              keyboardType="numeric"
            />
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={handleClose}
            style={styles.cancelButton}
            accessibilityRole="button"
          >
            <ThemedText style={styles.linkText}>Annuler</ThemedText>
          </Pressable>
          <Pressable
            style={[styles.submitButton, { backgroundColor: colors.tint }]}
            onPress={handleSubmit}
            accessibilityRole="button"
          >
            <ThemedText style={styles.submitButtonText}>
              {isEditing ? "Modifier" : "Ajouter"}
            </ThemedText>
          </Pressable>
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
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    alignItems: "center",
  },
  cancelButton: {
    width: "50%",
    alignItems: "center",
  },
  linkText: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
