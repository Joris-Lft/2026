import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTravel,
  getTravelById,
  getTravelsForUser,
  updateTravel,
} from "@/services/travels";
import type {
  CreateTravelInput,
  Travel,
  UpdateTravelInput,
} from "@/types/travels";

export function travelsQueryKey(userEmail: string | undefined) {
  return ["travels", userEmail] as const;
}

export function travelQueryKey(travelId: string | undefined) {
  return ["travel", travelId] as const;
}

export function useTravels(userEmail: string | undefined) {
  return useQuery({
    queryKey: travelsQueryKey(userEmail),
    queryFn: () => getTravelsForUser(userEmail!),
    enabled: !!userEmail,
  });
}

export function useTravel(travelId: string | undefined) {
  return useQuery({
    queryKey: travelQueryKey(travelId),
    queryFn: () => getTravelById(travelId!),
    enabled: !!travelId,
  });
}

export function useCreateTravel(userEmail: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTravelInput): Promise<Travel> => {
      if (!userEmail) throw new Error("Utilisateur non connecté");
      const result = await createTravel(userEmail, input);
      if (!result.travel) throw new Error(result.error ?? "Création impossible");
      return result.travel;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: travelsQueryKey(userEmail),
      });
    },
  });
}

export function useUpdateTravel(userEmail: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateTravelInput): Promise<Travel> => {
      const result = await updateTravel(input);
      if (!result.travel) throw new Error(result.error ?? "Mise à jour impossible");
      return result.travel;
    },
    onSuccess: (travel) => {
      void queryClient.invalidateQueries({
        queryKey: travelsQueryKey(userEmail),
      });
      void queryClient.invalidateQueries({
        queryKey: travelQueryKey(travel.id),
      });
    },
  });
}
