import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createHabit,
  deleteHabit,
  getDailyHabits,
  getMonthlyHabits,
  getWeeklyHabits,
  updateHabit,
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
import type {
  CreateHabitInput,
  Habit,
  HabitFrequency,
  HabitLog,
  UpdateHabitInput,
} from "@/types/habits";
import type { PeriodData } from "@/types/tracking";

export interface HabitWithStatus extends Habit {
  title: string;
  completed: boolean;
  logId?: string;
}

function getHabitsFetcher(period: PeriodData["period"]) {
  switch (period) {
    case "day":
      return getDailyHabits;
    case "week":
      return getWeeklyHabits;
    case "month":
      return getMonthlyHabits;
  }
}

function getLogsFetcher(period: PeriodData["period"]) {
  switch (period) {
    case "day":
      return getDailyHabitLogs;
    case "week":
      return getWeeklyHabitLogs;
    case "month":
      return getMonthlyHabitLogs;
  }
}

function mergeHabitsWithLogs(
  habits: Habit[],
  logs: HabitLog[],
): HabitWithStatus[] {
  const logsByHabitId = new Map<string, HabitLog>();
  logs.forEach((log) => logsByHabitId.set(log.habit_id, log));

  return habits.map((habit) => {
    const log = logsByHabitId.get(habit.id);
    return {
      ...habit,
      title: habit.name,
      completed: !!log,
      logId: log?.id,
    };
  });
}

export function habitQueryKey(
  period: PeriodData["period"],
  userEmail: string | undefined,
) {
  return ["habits", period, userEmail] as const;
}

export function usePeriodHabits(
  period: PeriodData["period"],
  userEmail: string | undefined,
) {
  return useQuery({
    queryKey: habitQueryKey(period, userEmail),
    queryFn: async () => {
      if (!userEmail) return [];
      const today = new Date();
      const [habits, logs] = await Promise.all([
        getHabitsFetcher(period)(userEmail),
        getLogsFetcher(period)(userEmail, today),
      ]);
      return mergeHabitsWithLogs(habits, logs);
    },
    enabled: !!userEmail,
  });
}

export function useCreateHabit(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateHabitInput) => {
      if (!userId) throw new Error("Utilisateur non connecté");
      return createHabit(userId, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateHabitInput) => updateHabit(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (habitId: string) => deleteHabit(habitId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

function getFrequencyAndPeriod(period: PeriodData["period"], date: Date) {
  switch (period) {
    case "day":
      return { frequency: "daily" as HabitFrequency, periodValue: formatDailyPeriod(date) };
    case "week":
      return { frequency: "weekly" as HabitFrequency, periodValue: getWeekNumber(date) };
    case "month":
      return {
        frequency: "monthly" as HabitFrequency,
        periodValue: formatMonthlyPeriod(date),
      };
  }
}

export function useToggleHabitLog(
  period: PeriodData["period"],
  userId: string | undefined,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habit: HabitWithStatus) => {
      if (!userId) throw new Error("Utilisateur non connecté");

      const today = new Date();
      const { frequency, periodValue } = getFrequencyAndPeriod(period, today);

      if (habit.completed && habit.logId) {
        const result = await deleteHabitLog(habit.logId);
        if (!result.success) throw new Error(result.error);
        return { action: "delete" as const, habitId: habit.id };
      }

      const result = await createHabitLog({
        habit_id: habit.id,
        user_id: userId,
        frequency,
        period: periodValue,
      });
      if (!result.log) throw new Error(result.error);
      return {
        action: "create" as const,
        habitId: habit.id,
        logId: result.log.id,
      };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}
