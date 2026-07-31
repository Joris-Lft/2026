import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTravel,
  getTravelById,
  getTravels,
  updateTravel,
} from "@/services/travels";
import type {
  CreateTravelInput,
  Travel,
  UpdateTravelInput,
} from "@/types/travels";

// Clé stable (pas de userEmail) : les projets sont partagés entre tous.
export function travelsQueryKey() {
  return ["travels"] as const;
}

export function travelQueryKey(travelId: string | undefined) {
  return ["travel", travelId] as const;
}

export function useTravels() {
  return useQuery({
    queryKey: travelsQueryKey(),
    queryFn: getTravels,
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
        queryKey: travelsQueryKey(),
      });
    },
  });
}

export function useUpdateTravel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateTravelInput): Promise<Travel> => {
      const result = await updateTravel(input);
      if (!result.travel) throw new Error(result.error ?? "Mise à jour impossible");
      return result.travel;
    },
    onSuccess: (travel) => {
      void queryClient.invalidateQueries({
        queryKey: travelsQueryKey(),
      });
      void queryClient.invalidateQueries({
        queryKey: travelQueryKey(travel.id),
      });
    },
  });
}
