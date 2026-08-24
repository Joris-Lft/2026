import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ProjectScope } from "@/constants/project-scope";
import { useAuth } from "@/contexts/auth-context";
import {
  createDeposit,
  deleteDeposit,
  getDeposits,
  updateDeposit,
} from "@/services/travel-savings";
import type {
  CreateDepositInput,
  Deposit,
  UpdateDepositInput,
} from "@/types/travel-savings";
import { useTravelBudgetTotals } from "./use-travel-budget";
import { useTravels } from "./use-travels";

export function travelSavingsQueryKey(
  scope: ProjectScope,
  userEmail: string | undefined,
) {
  return ["travel-savings", scope, userEmail ?? null] as const;
}

export function useDeposits(scope: ProjectScope) {
  const { user } = useAuth();
  const userEmail = user?.email;

  return useQuery({
    queryKey: travelSavingsQueryKey(scope, userEmail),
    queryFn: () => getDeposits(scope, userEmail),
  });
}

/**
 * Solde d'une cagnotte : total versé, déjà dépensé et disponible (versé −
 * dépensé, borné à 0). Seuls les achats des projets du même périmètre débitent
 * la cagnotte, pour que le perso et le commun restent cloisonnés.
 */
export function useAvailableSavings(scope: ProjectScope) {
  const { data: deposits = [] } = useDeposits(scope);
  const { data: travels = [] } = useTravels(scope);
  const { data: budgetSummary } = useTravelBudgetTotals();

  const total = deposits.reduce((sum, d) => sum + d.amount, 0);
  const spent = travels.reduce(
    (sum, travel) =>
      sum + (budgetSummary?.purchasedSpendByTravel[travel.id] ?? 0),
    0,
  );

  return { total, spent, available: Math.max(0, total - spent) };
}

export function useCreateDeposit(scope: ProjectScope) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: CreateDepositInput): Promise<Deposit> => {
      const result = await createDeposit(input);
      if (!result.deposit) throw new Error(result.error ?? "Enregistrement impossible");
      return result.deposit;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: travelSavingsQueryKey(scope, user?.email),
      });
    },
  });
}

export function useUpdateDeposit(scope: ProjectScope) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: UpdateDepositInput): Promise<Deposit> => {
      const result = await updateDeposit(input);
      if (!result.deposit) throw new Error(result.error ?? "Mise à jour impossible");
      return result.deposit;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: travelSavingsQueryKey(scope, user?.email),
      });
    },
  });
}

export function useDeleteDeposit(scope: ProjectScope) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (depositId: string) => {
      const result = await deleteDeposit(depositId);
      if (!result.success) throw new Error(result.error ?? "Suppression impossible");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: travelSavingsQueryKey(scope, user?.email),
      });
    },
  });
}
