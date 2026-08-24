export interface FrameScheduler {
  /** Programme `task` pour la prochaine frame. Sans effet si une est en attente. */
  schedule: (task: () => void) => void;
  /** Annule la frame en attente, s'il y en a une. */
  cancel: () => void;
}

/**
 * Regroupe plusieurs écritures successives en une seule frame — utile pour un
 * geste (pan, zoom) qui doit toucher le DOM sans passer par un rendu React.
 *
 * L'identifiant de frame est encapsulé : `cancel()` le remet toujours à zéro.
 * Une version où l'appelant gère lui-même le drapeau finit invariablement par
 * annuler sans réinitialiser, et l'ordonnanceur reste alors bloqué à vie.
 */
export function createFrameScheduler(
  request: (callback: () => void) => number = requestAnimationFrame,
  cancelRequest: (handle: number) => void = cancelAnimationFrame,
): FrameScheduler {
  let frame: number | null = null;

  return {
    schedule(task) {
      if (frame !== null) return;

      frame = request(() => {
        frame = null;
        task();
      });
    },

    cancel() {
      if (frame === null) return;

      cancelRequest(frame);
      frame = null;
    },
  };
}
