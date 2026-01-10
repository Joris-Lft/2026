import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ReactNode } from "react";
import { StyleSheet, TextStyle } from "react-native";

type H2Props = {
  children: ReactNode;
  color?: string;
  style?: TextStyle;
};

export default function H2({ children, color, style }: H2Props) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <ThemedText
      type="subtitle"
      style={[styles.h2, { color: color ?? colors.text }, style]}
    >
      {children}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  h2: {
    fontSize: 24,
    fontWeight: "600",
  },
});
