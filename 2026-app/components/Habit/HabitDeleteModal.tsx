import { Colors } from "@/constants/theme";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import Modal from "react-native-modal";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

interface HabitDeleteModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  habitName: string;
  loading?: boolean;
}

export function HabitDeleteModal({
  visible,
  onClose,
  onConfirm,
  habitName,
  loading = false,
}: HabitDeleteModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
    >
      <ThemedView style={styles.modalView}>
        <ThemedText style={styles.modalText}>
          Voulez-vous vraiment supprimer le tracking de "{habitName}" ?
        </ThemedText>
        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={onClose}
            disabled={loading}
          >
            <Text style={styles.textStyle}>Non</Text>
          </Pressable>
          <Pressable
            style={[
              styles.button,
              styles.buttonConfirm,
              { backgroundColor: colors.tint },
              loading && { opacity: 0.6 }, // ← Opacité réduite pendant loading
            ]}
            onPress={onConfirm}
            disabled={loading}
          >
            {loading ? ( // ← Affiche le loader si loading
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.textStyle}>Oui</Text>
            )}
          </Pressable>
        </View>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    // ← Ajoute ce style
    justifyContent: "center",
    margin: 0,
    paddingHorizontal: 20,
  },
  modalView: {
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  textStyle: {
    color: "white",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  buttonClose: {
    fontSize: 14,
    textDecorationLine: "underline",
    width: "50%",
    textAlign: "center",
  },
  buttonConfirm: {
    backgroundColor: "#f44336",
  },
});
