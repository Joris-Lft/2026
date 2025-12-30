import { useState } from "react";
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
import { createUser } from "@/services/airtable";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuth } from "@/contexts/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
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

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = async () => {
    // Validation des champs
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    // Validation de l'email
    if (!validateEmail(email.trim())) {
      Alert.alert("Erreur", "Veuillez entrer une adresse email valide");
      return;
    }

    // Validation de la longueur du mot de passe
    if (password.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    // Vérification de la correspondance des mots de passe
    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createUser(email.trim(), password, {
        Name: name.trim(),
      });
      setIsLoading(false);

      if (result.user) {
        Alert.alert(
          "Inscription réussie",
          "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
          [
            {
              text: "OK",
              onPress: () => {
                // Rediriger vers la page de connexion
                router.replace("/login");
              },
            },
          ]
        );
        // Réinitialiser les champs
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        Alert.alert(
          "Erreur",
          result.error || "Impossible de créer le compte. L'email est peut-être déjà utilisé."
        );
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Erreur", "Une erreur est survenue lors de la création du compte");
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <ThemedView style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            Inscription
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Créez un compte pour accéder à l'application
          </ThemedText>

          <ThemedView style={styles.form}>
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>Nom</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { color: textColor, borderColor: borderColor },
                ]}
                placeholder="Votre nom"
                placeholderTextColor={borderColor}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
                editable={!isLoading}
              />
            </ThemedView>

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
                autoComplete="password-new"
                editable={!isLoading}
              />
              <ThemedText style={styles.hint}>
                Au moins 6 caractères
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>Confirmer le mot de passe</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { color: textColor, borderColor: borderColor },
                ]}
                placeholder="••••••••"
                placeholderTextColor={borderColor}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
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
              onPress={handleSignup}
              disabled={isLoading}>
              <ThemedText style={[styles.buttonText, { color: buttonTextColor }]}>
                {isLoading ? "Inscription..." : "S'inscrire"}
              </ThemedText>
            </Pressable>

            <ThemedView style={styles.linkContainer}>
              <ThemedText style={styles.linkText}>
                Déjà un compte ?{" "}
              </ThemedText>
              <Link href="/login" asChild>
                <Pressable>
                  <ThemedText style={[styles.link, { color: tintColor }]}>
                    Se connecter
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
  hint: {
    fontSize: 12,
    opacity: 0.6,
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

