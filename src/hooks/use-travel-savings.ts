import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export function travelSavingsQueryKey() {
  return ["travel-savings"] as const;
}

export function useDeposits() {
  return useQuery({
    queryKey: travelSavingsQueryKey(),
    queryFn: getDeposits,
  });
}

export function useCreateDeposit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateDepositInput): Promise<Deposit> => {
      const result = await createDeposit(input);
      if (!result.deposit) throw new Error(result.error ?? "Enregistrement impossible");
      return result.deposit;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: travelSavingsQueryKey() });
    },
  });
}

export function useUpdateDeposit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateDepositInput): Promise<Deposit> => {
      const result = await updateDeposit(input);
      if (!result.deposit) throw new Error(result.error ?? "Mise à jour impossible");
      return result.deposit;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: travelSavingsQueryKey() });
    },
  });
}

export function useDeleteDeposit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (depositId: string) => {
      const result = await deleteDeposit(depositId);
      if (!result.success) throw new Error(result.error ?? "Suppression impossible");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: travelSavingsQueryKey() });
    },
  });
}
