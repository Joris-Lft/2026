import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMeasure,
  deleteMeasure,
  getMeasuresByUser,
  updateMeasure,
} from "@/services/measures";
import type { CreateMeasureInput, UpdateMeasureInput } from "@/types/measures";

export function measuresQueryKey(userEmail: string | undefined) {
  return ["measures", userEmail] as const;
}

export function useMeasures(userEmail: string | undefined) {
  return useQuery({
    queryKey: measuresQueryKey(userEmail),
    queryFn: () => getMeasuresByUser(userEmail!),
    enabled: !!userEmail,
  });
}

export function useCreateMeasure(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      date,
    }: {
      data: CreateMeasureInput;
      date: string;
    }) => {
      if (!userId) throw new Error("Utilisateur non connecté");
      const result = await createMeasure(userId, data, date);
      if (!result.measure) throw new Error(result.error);
      return result.measure;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["measures"] });
    },
  });
}

export function useUpdateMeasure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateMeasureInput) => {
      const result = await updateMeasure(input);
      if (!result.measure) throw new Error(result.error);
      return result.measure;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["measures"] });
    },
  });
}

export function useDeleteMeasure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (measureId: string) => {
      const result = await deleteMeasure(measureId);
      if (!result.success) throw new Error(result.error);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["measures"] });
    },
  });
}
