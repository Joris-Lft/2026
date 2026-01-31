import { StyleSheet, Pressable, Alert } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/contexts/auth-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function ProfilScreen() {
  const { user, logout } = useAuth();
  const tintColor = useThemeColor({}, "tint");
  const colorScheme = useColorScheme();

  // Couleur du bouton adaptée au thème
  const buttonBackgroundColor = colorScheme === "dark" ? "#0a7ea4" : tintColor;
  const buttonTextColor = colorScheme === "dark" ? "#fff" : "#fff";

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            Alert.alert("Erreur", "Impossible de se déconnecter");
          }
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Profil
        </ThemedText>
        {user && (
          <ThemedView style={styles.userInfo}>
            {user.Name && (
              <>
                <ThemedText style={styles.label}>Nom:</ThemedText>
                <ThemedText style={styles.value}>{user.Name}</ThemedText>
              </>
            )}
            <ThemedText style={styles.label}>Email:</ThemedText>
            <ThemedText style={styles.value}>{user.email}</ThemedText>
          </ThemedView>
        )}
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            {
              backgroundColor: buttonBackgroundColor,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          onPress={handleLogout}
        >
          <ThemedText
            style={[styles.logoutButtonText, { color: buttonTextColor }]}
          >
            Se déconnecter
          </ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    gap: 24,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  userInfo: {
    gap: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(128, 128, 128, 0.3)",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.7,
  },
  value: {
    fontSize: 16,
  },
  logoutButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
