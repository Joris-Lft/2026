import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { PeriodData, Tracking } from "../../types/tracking";
import H2 from "../H2";
import { useAuth } from "@/contexts/auth-context";
import {
  getDailyHabits,
  getWeeklyHabits,
  getMonthlyHabits,
  Habit,
} from "@/services/habits";

// Props pour le composant
interface PeriodTrackingProps {
  period: PeriodData["period"];
}

export const PeriodTracking = ({ period }: PeriodTrackingProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user } = useAuth();
  const [trackings, setTrackings] = useState<Tracking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les habits depuis Airtable selon la période
  useEffect(() => {
    const loadHabits = async () => {
      if (!user?.Name) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        let habits: Habit[] = [];
        
        // Charger les habits selon la période
        switch (period) {
          case "day":
            habits = await getDailyHabits(user.Name);
            break;
          case "week":
            habits = await getWeeklyHabits(user.Name);
            break;
          case "month":
            habits = await getMonthlyHabits(user.Name);
            break;
        }

        // Convertir les habits en trackings avec completed: false par défaut
        const initialTrackings: Tracking[] = habits.map((habit: Habit) => ({
          id: habit.id,
          title: habit.name,
          completed: false,
          type: period,
        }));
        setTrackings(initialTrackings);
      } catch (error) {
        console.error(`Error loading ${period} habits:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHabits();
  }, [user?.Name, period]);

  // Fonction pour cocher/décocher un tracking
  const toggleTracking = (id: string) => {
    setTrackings((prev) =>
      prev.map((tracking) =>
        tracking.id === id
          ? { ...tracking, completed: !tracking.completed }
          : tracking
      )
    );
  };

  // Trier les trackings : non complétés en haut, complétés en bas
  const sortedTrackings = [...trackings].sort(
    (a, b) => Number(a.completed) - Number(b.completed)
  );

  const getTitle = () => {
    const today = new Date();
    switch (period) {
      case "day":
        return `Aujourd'hui - ${today.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
        })}`;
      case "week":
        return `Semaine - ${getWeek(today, { weekStartsOn: 1, locale: fr })}`;

      case "month":
        return `Mois - ${today.getMonth() + 1}`;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.listContainer, { borderColor: colors.icon + "40" }]}>
        <H2 style={styles.title}>{getTitle()}</H2>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.tint} />
            <ThemedText style={styles.loadingText}>
              Chargement des habits...
            </ThemedText>
          </View>
        ) : trackings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              Aucun habit pour le moment
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={sortedTrackings}
            renderItem={({ item }: { item: Tracking }) => (
              <TouchableOpacity
                style={[
                  styles.trackingItem,
                  {
                    backgroundColor: colors.background,
                  },
                ]}
                onPress={() => toggleTracking(item.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    { borderColor: item.completed ? colors.tint : colors.icon },
                    item.completed && { backgroundColor: colors.tint },
                  ]}
                >
                  {item.completed && (
                    <IconSymbol name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <ThemedText
                  style={[
                    styles.trackingTitle,
                    item.completed && styles.completedText,
                  ]}
                >
                  {item.title}
                </ThemedText>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: "100%",
  },
  title: {
    marginTop: 12,
    marginLeft: 12,
  },
  listContainer: {
    borderRadius: 12,
    borderWidth: 2,
    overflow: "hidden",
  },
  list: {
    gap: 0,
  },
  trackingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    gap: 12,
  },
  trackingTitle: {
    flex: 1,
    fontSize: 16,
  },
  completedText: {
    opacity: 0.5,
    textDecorationLine: "line-through",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
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
