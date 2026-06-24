import { useState, useEffect } from "react";
import {
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Link, Redirect, useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/contexts/auth-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Rediriger vers les tabs si déjà authentifié
  if (!authLoading && isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "icon");
  const colorScheme = useColorScheme();

  // Couleur du bouton adaptée au thème
  const buttonBackgroundColor = colorScheme === "dark" ? "#0a7ea4" : tintColor;
  const buttonTextColor = colorScheme === "dark" ? "#fff" : "#fff";

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    const result = await login(email.trim(), password);
    setIsLoading(false);

    if (result.success) {
      // Redirection automatique vers les tabs après connexion réussie
      router.replace("/(tabs)");
    } else {
      Alert.alert(
        "Erreur de connexion",
        result.error || "Une erreur est survenue"
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            Connexion
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Connectez-vous pour accéder à l'application
          </ThemedText>

          <ThemedView style={styles.form}>
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { color: textColor, borderColor: borderColor },
                ]}
                placeholder="votre@email.com"
                placeholderTextColor={borderColor}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!isLoading}
              />
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>Mot de passe</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { color: textColor, borderColor: borderColor },
                ]}
                placeholder="••••••••"
                placeholderTextColor={borderColor}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                editable={!isLoading}
              />
            </ThemedView>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: buttonBackgroundColor,
                  opacity: pressed || isLoading ? 0.7 : 1,
                },
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <ThemedText
                style={[styles.buttonText, { color: buttonTextColor }]}
              >
                {isLoading ? "Connexion..." : "Se connecter"}
              </ThemedText>
            </Pressable>

            <ThemedView style={styles.linkContainer}>
              <ThemedText style={styles.linkText}>
                Pas encore de compte ?{" "}
              </ThemedText>
              <Link href="/signup" asChild>
                <Pressable>
                  <ThemedText style={[styles.link, { color: tintColor }]}>
                    S'inscrire
                  </ThemedText>
                </Pressable>
              </Link>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
    opacity: 0.7,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  linkText: {
    fontSize: 14,
  },
  link: {
    fontSize: 14,
    fontWeight: "600",
  },
});
