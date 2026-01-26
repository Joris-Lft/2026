import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  getDailyHabits,
  getMonthlyHabits,
  getWeeklyHabits,
} from "@/services/habits";
import {
  createHabitLog,
  deleteHabitLog,
  formatDailyPeriod,
  formatMonthlyPeriod,
  getDailyHabitLogs,
  getMonthlyHabitLogs,
  getWeeklyHabitLogs,
  getWeekNumber,
} from "@/services/habits-logs";
import { Habit, HabitFrequency, HabitLog } from "@/types/habits";
import { PeriodData } from "@/types/tracking";
import { getWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import H2 from "../H2";
import { HabitFormModal } from "./HabitFormModal";

// Props pour le composant
interface PeriodHabitProps {
  period: PeriodData["period"];
  isEditMode?: boolean;
  refreshTrigger: boolean;
}

export const PeriodHabit = ({
  period,
  isEditMode = false,
  refreshTrigger,
}: PeriodHabitProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user } = useAuth();

  const [trackings, setTrackings] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTracking, setEditingTracking] = useState<Habit | undefined>(
    undefined,
  );

  // Charger les habits et leurs logs depuis Airtable selon la période
  useEffect(() => {
    const loadHabitsAndLogs = async () => {
      if (!user?.email) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const today = new Date();
        let habits: Habit[] = [];
        let logs: HabitLog[] = [];

        // Charger les habits et les logs selon la période
        switch (period) {
          case "day":
            [habits, logs] = await Promise.all([
              getDailyHabits(user.email),
              getDailyHabitLogs(user.email, today),
            ]);
            break;
          case "week":
            [habits, logs] = await Promise.all([
              getWeeklyHabits(user.email),
              getWeeklyHabitLogs(user.email, today),
            ]);
            break;
          case "month":
            [habits, logs] = await Promise.all([
              getMonthlyHabits(user.email),
              getMonthlyHabitLogs(user.email, today),
            ]);
            break;
        }

        // Créer un Map des logs par habit_id pour un accès rapide
        const logsByHabitId = new Map<string, HabitLog>();

        logs.forEach((log) => {
          logsByHabitId.set(log.habit_id, log);
        });

        // Convertir les habits en trackings en vérifiant s'ils sont complétés
        const initialTrackings: Habit[] = habits.map((habit: Habit) => {
          const log = logsByHabitId.get(habit.id);

          return {
            ...habit,
            id: habit.id,
            title: habit.name,
            completed: !!log,
            logId: log?.id,
          };
        });
        setTrackings(initialTrackings);
      } catch (error) {
        console.error(`Error loading ${period} habits and logs:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHabitsAndLogs();
  }, [user?.email, period, refreshTrigger]);

  // Fonction pour cocher/décocher un tracking
  const toggleTracking = async (tracking: Habit) => {
    if (!user?.email) return;

    const isCurrentlyCompleted = tracking.completed;
    const today = new Date();

    // Déterminer la fréquence et la période selon le type de période
    let frequency: HabitFrequency = "daily";
    let periodValue: string = formatDailyPeriod(today);

    switch (period) {
      case "day":
        frequency = "daily";
        periodValue = formatDailyPeriod(today);
        break;
      case "week":
        frequency = "weekly";
        periodValue = getWeekNumber(today);
        break;
      case "month":
        frequency = "monthly";
        periodValue = formatMonthlyPeriod(today);
        break;
    }

    try {
      if (isCurrentlyCompleted && tracking.logId) {
        // Supprimer le log si l'habit est déjà complété
        const result = await deleteHabitLog(tracking.logId);
        if (result.success) {
          setTrackings((prev) =>
            prev.map((t) =>
              t.id === tracking.id
                ? { ...t, completed: false, logId: undefined }
                : t,
            ),
          );
        } else {
          console.error("Error deleting habit log:", result.error);
        }
      } else {
        // Créer un nouveau log si l'habit n'est pas complété
        const result = await createHabitLog({
          habit_id: tracking.id,
          user_id: user.id,
          frequency: frequency,
          period: periodValue,
        });
        if (result.log) {
          setTrackings((prev) =>
            prev.map((t) =>
              t.id === tracking.id
                ? { ...t, completed: true, logId: result.log!.id }
                : t,
            ),
          );
        } else {
          console.error("Error creating habit log:", result.error);
        }
      }
    } catch (error) {
      console.error("Error toggling tracking:", error);
    }
  };

  // Trier les trackings : non complétés en haut, complétés en bas
  const sortedTrackings = [...trackings].sort(
    (a, b) => Number(a.completed) - Number(b.completed),
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

  const editHabit = (id: string) => {
    // todo: appeler service updateHabit
    // const tracking = trackings.find((t) => t.id === id);
    // if (tracking) {
    //   setEditingTracking(tracking);
    //   setIsModalVisible(true);
    // }
  };

  const deleteHabit = (id: string) => {
    // todo: appeler service deleteHabit
    console.log("Supprimer le tracking:", id);
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
            renderItem={({ item }: { item: Habit }) => (
              <TouchableOpacity
                style={[
                  styles.trackingItem,
                  {
                    backgroundColor: colors.background,
                  },
                ]}
                onPress={() => !isEditMode && toggleTracking(item)}
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

                {isEditMode && (
                  <View style={styles.editActions}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => {
                        setIsModalVisible(true);
                        setEditingTracking(item);
                      }}
                      activeOpacity={0.7}
                    >
                      <IconSymbol name="pencil" size={20} color={colors.icon} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => deleteHabit(item.id)}
                      activeOpacity={0.7}
                    >
                      <IconSymbol name="trash" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      <HabitFormModal
        isVisible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
        }}
        onSubmit={editHabit}
        editingTracking={editingTracking}
      />
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
  editActions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: "auto",
  },
  iconButton: {
    padding: 4,
  },
});
