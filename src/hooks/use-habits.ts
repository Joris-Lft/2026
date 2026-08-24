import { useMemo, useSyncExternalStore } from "react";
import {
  useQuery,
  useMutation,
  useMutationState,
  useQueryClient,
} from "@tanstack/react-query";
import { format } from "date-fns";
import {
  createHabit,
  deleteHabit,
  getActiveHabits,
  updateHabit,
} from "@/services/habits";
import {
  createHabitLog,
  deleteHabitLog,
  getHabitLogsForPeriods,
  getPeriodKey,
} from "@/services/habits-logs";
import type {
  CreateHabitInput,
  Habit,
  HabitFrequency,
  HabitLog,
  UpdateHabitInput,
} from "@/types/habits";
import type { PeriodType } from "@/types/tracking";

export interface HabitWithStatus extends Habit {
  title: string;
  completed: boolean;
  logId?: string;
}

/** Les habits de chaque période, prêts à l'affichage. */
type HabitsOverview = Record<PeriodType, HabitWithStatus[]>;

/** Clé de période courante, par fréquence. */
type PeriodKeys = Record<HabitFrequency, string>;

const FREQUENCY_BY_PERIOD: Record<PeriodType, HabitFrequency> = {
  day: "daily",
  week: "weekly",
  month: "monthly",
};

const PERIOD_BY_FREQUENCY: Record<HabitFrequency, PeriodType> = {
  daily: "day",
  weekly: "week",
  monthly: "month",
};

function createEmptyOverview(): HabitsOverview {
  return { day: [], week: [], month: [] };
}

/*
 * Jour courant partagé par toute la page.
 *
 * Un `useState` par hook laissait les consommateurs se désynchroniser au
 * passage de minuit : la liste pouvait déjà être sur le nouveau jour pendant
 * que la mutation visait encore la veille. Un seul minuteur, une seule lecture.
 */
const dayListeners = new Set<() => void>();
let dayTimer: ReturnType<typeof setTimeout> | undefined;

/*
 * Valeur figée, et non une relecture de l'horloge : `getSnapshot` doit rester
 * stable entre deux notifications. Sinon, entre minuit et le réveil du
 * minuteur, seuls les composants qui re-rendent pour une autre raison
 * basculeraient sur le nouveau jour — exactement la désynchronisation à éviter.
 */
let currentDay = format(new Date(), "yyyy-MM-dd");

const readToday = () => currentDay;

/** Réaligne le jour courant et prévient les abonnés s'il a changé. */
function refreshToday() {
  const day = format(new Date(), "yyyy-MM-dd");
  if (day === currentDay) return;

  currentDay = day;
  dayListeners.forEach((listener) => listener());
}

function scheduleNextDay() {
  const now = new Date();
  // Quelques secondes après minuit, pour ne pas retomber sur la veille.
  const nextDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    5,
  );

  dayTimer = setTimeout(() => {
    refreshToday();
    // Sans cette garde, un minuteur déclenché après le dernier désabonnement
    // se relancerait indéfiniment, et un second s'ajouterait au réabonnement.
    if (dayListeners.size > 0) scheduleNextDay();
  }, nextDay.getTime() - now.getTime());
}

function subscribeToToday(listener: () => void) {
  dayListeners.add(listener);

  if (dayListeners.size === 1) {
    // Un onglet en arrière-plan ou une machine en veille peut retarder le
    // minuteur : on rattrape le retard au retour sur l'app.
    document.addEventListener("visibilitychange", refreshToday);
    window.addEventListener("focus", refreshToday);
    refreshToday();
    scheduleNextDay();
  }

  return () => {
    dayListeners.delete(listener);
    if (dayListeners.size === 0) {
      document.removeEventListener("visibilitychange", refreshToday);
      window.removeEventListener("focus", refreshToday);
      clearTimeout(dayTimer);
      dayTimer = undefined;
    }
  };
}

function useToday(): string {
  return useSyncExternalStore(subscribeToToday, readToday, readToday);
}

export function useCurrentPeriodKeys(): PeriodKeys {
  const today = useToday();

  return useMemo(() => {
    const date = new Date(`${today}T00:00:00`);
    return {
      daily: getPeriodKey("daily", date),
      weekly: getPeriodKey("weekly", date),
      monthly: getPeriodKey("monthly", date),
    };
  }, [today]);
}

function buildOverview(
  habits: Habit[],
  logs: HabitLog[],
  periodKeys: PeriodKeys,
): HabitsOverview {
  const logsByHabitAndPeriod = new Map<string, HabitLog>();
  logs.forEach((log) =>
    logsByHabitAndPeriod.set(`${log.habit_id}|${log.period}`, log),
  );

  const overview = createEmptyOverview();

  habits.forEach((habit) => {
    const period = PERIOD_BY_FREQUENCY[habit.frequency];
    if (!period) {
      console.warn(`Fréquence inconnue pour l'habit ${habit.id}:`, habit.frequency);
      return;
    }

    const log = logsByHabitAndPeriod.get(
      `${habit.id}|${periodKeys[habit.frequency]}`,
    );

    overview[period].push({
      ...habit,
      title: habit.name,
      completed: !!log,
      logId: log?.id,
    });
  });

  return overview;
}

function habitsQueryKey(userEmail: string | undefined, periodKeys: PeriodKeys) {
  return [
    "habits",
    userEmail,
    periodKeys.daily,
    periodKeys.weekly,
    periodKeys.monthly,
  ] as const;
}

/** Préfixe commun à toutes les bascules, toutes périodes confondues. */
const TOGGLE_MUTATION_SCOPE = ["toggle-habit-log"] as const;

function toggleMutationKey(period: PeriodType, userEmail: string | undefined) {
  return [...TOGGLE_MUTATION_SCOPE, period, userEmail] as const;
}

/**
 * Habits d'une période, avec leur statut pour la période courante.
 *
 * Les trois périodes partagent la même requête : elle n'est donc exécutée
 * qu'une fois (2 appels Airtable au total, au lieu de 6).
 */
export function usePeriodHabits(
  period: PeriodType,
  userEmail: string | undefined,
) {
  const periodKeys = useCurrentPeriodKeys();

  return useQuery({
    queryKey: habitsQueryKey(userEmail, periodKeys),
    queryFn: async () => {
      if (!userEmail) return createEmptyOverview();

      const [habits, logs] = await Promise.all([
        getActiveHabits(userEmail),
        getHabitLogsForPeriods(userEmail, Object.values(periodKeys)),
      ]);

      return buildOverview(habits, logs, periodKeys);
    },
    enabled: !!userEmail,
    select: (overview: HabitsOverview) => overview[period],
  });
}

export function useCreateHabit(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    // Les services renvoient l'échec dans `error` : sans ce relais, la mutation
    // se croit réussie et les `catch` des écrans ne se déclenchent jamais.
    mutationFn: async (input: CreateHabitInput) => {
      if (!userId) throw new Error("Utilisateur non connecté");
      const result = await createHabit(userId, input);
      if (!result.habit) throw new Error(result.error);
      return result.habit;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateHabitInput) => {
      const result = await updateHabit(input);
      if (!result.habit) throw new Error(result.error);
      return result.habit;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habitId: string) => {
      const result = await deleteHabit(habitId);
      if (!result.success) throw new Error(result.error);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

/**
 * Identifiants des habits dont la bascule est encore en vol.
 *
 * `useMutation.variables` ne décrit que la dernière mutation ; ce suivi permet
 * de ne verrouiller que les lignes réellement concernées.
 */
export function useTogglingHabitIds(
  period: PeriodType,
  userEmail: string | undefined,
): Set<string> {
  const ids = useMutationState({
    filters: { mutationKey: toggleMutationKey(period, userEmail), status: "pending" },
    select: (mutation) => (mutation.state.variables as HabitWithStatus | undefined)?.id,
  });

  return new Set(ids.filter((id): id is string => !!id));
}

export function useToggleHabitLog(
  period: PeriodType,
  userId: string | undefined,
  userEmail: string | undefined,
) {
  const queryClient = useQueryClient();
  const periodKeys = useCurrentPeriodKeys();
  const queryKey = habitsQueryKey(userEmail, periodKeys);
  const mutationKey = toggleMutationKey(period, userEmail);

  const patchHabit = (
    habitId: string,
    patch: Partial<HabitWithStatus>,
  ) =>
    queryClient.setQueryData<HabitsOverview>(queryKey, (current) =>
      current
        ? {
            ...current,
            [period]: current[period].map((item) =>
              item.id === habitId ? { ...item, ...patch } : item,
            ),
          }
        : current,
    );

  return useMutation({
    mutationKey,
    mutationFn: async (habit: HabitWithStatus) => {
      if (!userId) throw new Error("Utilisateur non connecté");

      if (habit.completed && habit.logId) {
        const result = await deleteHabitLog(habit.logId);
        if (!result.success) throw new Error(result.error);
        return { logId: undefined };
      }

      // La période vient du rendu courant et non de l'heure du clic : passé
      // minuit, l'ancienne version écrivait sur un jour que l'écran n'affichait
      // pas encore.
      const frequency = FREQUENCY_BY_PERIOD[period];
      const result = await createHabitLog({
        habit_id: habit.id,
        user_id: userId,
        frequency,
        period: periodKeys[frequency],
      });
      if (!result.log) throw new Error(result.error);

      return { logId: result.log.id };
    },
    // Bascule immédiate de la case : Airtable répond en plusieurs centaines de
    // millisecondes, l'attendre donnait l'impression que le clic était perdu.
    onMutate: async (habit: HabitWithStatus) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<HabitsOverview>(queryKey);

      patchHabit(habit.id, {
        completed: !habit.completed,
        logId: undefined,
      });

      return { previous };
    },
    // Le vrai identifiant du log doit rejoindre le cache sans attendre le
    // refetch, sinon un second clic recrée un log au lieu de supprimer le premier.
    onSuccess: ({ logId }, habit) => {
      patchHabit(habit.id, { logId });
    },
    onError: (_error, _habit, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      // Uniquement quand plus aucune bascule n'est en vol : sinon chaque
      // invalidation annule le refetch de la précédente. La garde ignore
      // volontairement la période, car la requête couvre les trois.
      if (queryClient.isMutating({ mutationKey: TOGGLE_MUTATION_SCOPE }) === 1) {
        void queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}
