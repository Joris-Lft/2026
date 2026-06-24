import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createNote, getNotesForUser, updateNote } from "@/services/notes";
import type { CreateNoteInput, UpdateNoteInput } from "@/types/notes";

export function notesQueryKey(userEmail: string | undefined) {
  return ["notes", userEmail] as const;
}

export function useNotes(userEmail: string | undefined) {
  return useQuery({
    queryKey: notesQueryKey(userEmail),
    queryFn: () => getNotesForUser(userEmail!),
    enabled: !!userEmail,
  });
}

export function useCreateNote(
  userId: string | undefined,
  userEmail: string | undefined,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateNoteInput) => {
      if (!userId) throw new Error("Utilisateur non connecté");
      const result = await createNote(userId, input);
      if (!result.note) throw new Error(result.error ?? "Création impossible");
      return result.note;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notesQueryKey(userEmail) });
    },
  });
}

export function useUpdateNote(
  userId: string | undefined,
  userEmail: string | undefined,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateNoteInput) => {
      if (!userId) throw new Error("Utilisateur non connecté");
      const result = await updateNote(userId, input);
      if (!result.note) throw new Error(result.error ?? "Mise à jour impossible");
      return result.note;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notesQueryKey(userEmail) });
    },
  });
}
