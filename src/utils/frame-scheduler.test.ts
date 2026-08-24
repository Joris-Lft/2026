import { describe, expect, it, vi } from "vitest";
import { createFrameScheduler } from "./frame-scheduler";

/** requestAnimationFrame contrôlable : les frames ne partent que sur `flush()`. */
function fakeFrames() {
  const pending = new Map<number, () => void>();
  let nextHandle = 0;

  return {
    request: vi.fn((callback: () => void) => {
      nextHandle += 1;
      pending.set(nextHandle, callback);
      return nextHandle;
    }),
    cancel: vi.fn((handle: number) => {
      pending.delete(handle);
    }),
    flush() {
      const callbacks = [...pending.values()];
      pending.clear();
      callbacks.forEach((callback) => callback());
    },
    get pendingCount() {
      return pending.size;
    },
  };
}

describe("createFrameScheduler", () => {
  it("exécute la tâche à la frame suivante, pas immédiatement", () => {
    const frames = fakeFrames();
    const scheduler = createFrameScheduler(frames.request, frames.cancel);
    const task = vi.fn();

    scheduler.schedule(task);
    expect(task).not.toHaveBeenCalled();

    frames.flush();
    expect(task).toHaveBeenCalledTimes(1);
  });

  it("regroupe plusieurs demandes en une seule frame", () => {
    const frames = fakeFrames();
    const scheduler = createFrameScheduler(frames.request, frames.cancel);
    const task = vi.fn();

    scheduler.schedule(task);
    scheduler.schedule(task);
    scheduler.schedule(task);

    expect(frames.request).toHaveBeenCalledTimes(1);
    frames.flush();
    expect(task).toHaveBeenCalledTimes(1);
  });

  it("reprogramme après l'exécution", () => {
    const frames = fakeFrames();
    const scheduler = createFrameScheduler(frames.request, frames.cancel);
    const task = vi.fn();

    scheduler.schedule(task);
    frames.flush();
    scheduler.schedule(task);
    frames.flush();

    expect(task).toHaveBeenCalledTimes(2);
  });

  it("annule la frame en attente", () => {
    const frames = fakeFrames();
    const scheduler = createFrameScheduler(frames.request, frames.cancel);
    const task = vi.fn();

    scheduler.schedule(task);
    scheduler.cancel();
    frames.flush();

    expect(task).not.toHaveBeenCalled();
    expect(frames.pendingCount).toBe(0);
  });

  it("reste utilisable après une annulation", () => {
    // Le cas qui cassait le graphe : en StrictMode React démonte puis remonte,
    // donc `cancel()` est appelé sur une frame jamais exécutée. Si l'état
    // interne n'était pas réinitialisé, plus rien n'était jamais programmé —
    // ni pan ni zoom.
    const frames = fakeFrames();
    const scheduler = createFrameScheduler(frames.request, frames.cancel);
    const task = vi.fn();

    scheduler.schedule(task);
    scheduler.cancel();

    scheduler.schedule(task);
    frames.flush();

    expect(task).toHaveBeenCalledTimes(1);
  });

  it("tolère une annulation sans frame en attente", () => {
    const frames = fakeFrames();
    const scheduler = createFrameScheduler(frames.request, frames.cancel);

    expect(() => scheduler.cancel()).not.toThrow();
    expect(frames.cancel).not.toHaveBeenCalled();
  });

  it("isole deux ordonnanceurs", () => {
    const frames = fakeFrames();
    const first = createFrameScheduler(frames.request, frames.cancel);
    const second = createFrameScheduler(frames.request, frames.cancel);
    const task = vi.fn();

    first.schedule(task);
    second.schedule(task);
    frames.flush();

    expect(task).toHaveBeenCalledTimes(2);
  });
});
