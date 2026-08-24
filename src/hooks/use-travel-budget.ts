import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBudgetLine,
  deleteBudgetLine,
  getBudgetForTravel,
  getBudgetSummary,
  updateBudgetLine,
} from "@/services/travel-budget";
import type {
  BudgetLine,
  CreateBudgetLineInput,
  UpdateBudgetLineInput,
} from "@/types/travel-budget";

export function travelBudgetQueryKey(travelId: string | undefined) {
  return ["travel-budget", travelId] as const;
}

export function useTravelBudget(travelId: string | undefined) {
  return useQuery({
    queryKey: travelBudgetQueryKey(travelId),
    queryFn: () => getBudgetForTravel(travelId!),
    enabled: !!travelId,
  });
}

export function travelBudgetTotalsQueryKey() {
  return ["travel-budget-totals"] as const;
}

/** Synthèse budgétaire : reste à payer par projet + dépensé global sur la cagnotte. */
export function useTravelBudgetTotals() {
  return useQuery({
    queryKey: travelBudgetTotalsQueryKey(),
    queryFn: getBudgetSummary,
  });
}

export function useCreateBudgetLine(travelId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBudgetLineInput): Promise<BudgetLine> => {
      if (!travelId) throw new Error("Projet introuvable");
      const result = await createBudgetLine(travelId, input);
      if (!result.line) throw new Error(result.error ?? "Création impossible");
      return result.line;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: travelBudgetQueryKey(travelId),
      });
      void queryClient.invalidateQueries({
        queryKey: travelBudgetTotalsQueryKey(),
      });
    },
  });
}

export function useUpdateBudgetLine(travelId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateBudgetLineInput): Promise<BudgetLine> => {
      if (!travelId) throw new Error("Projet introuvable");
      const result = await updateBudgetLine(travelId, input);
      if (!result.line) throw new Error(result.error ?? "Mise à jour impossible");
      return result.line;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: travelBudgetQueryKey(travelId),
      });
      void queryClient.invalidateQueries({
        queryKey: travelBudgetTotalsQueryKey(),
      });
    },
  });
}

export function useDeleteBudgetLine(travelId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lineId: string) => {
      const result = await deleteBudgetLine(lineId);
      if (!result.success) throw new Error(result.error ?? "Suppression impossible");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: travelBudgetQueryKey(travelId),
      });
      void queryClient.invalidateQueries({
        queryKey: travelBudgetTotalsQueryKey(),
      });
    },
  });
}
