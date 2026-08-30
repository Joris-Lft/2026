import { describe, expect, it } from "vitest";
import type { Habit } from "@/types/habits";
import { buildHeatmapSection, completionKey } from "./habit-heatmap";

const KEYS = ["2026-08-22", "2026-08-23", "2026-08-24"];

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: "rec1",
    user_id: "user@test.fr",
    name: "Sport",
    frequency: "daily",
    ...overrides,
  };
}

function completions(...keys: string[]) {
  return new Set(keys);
}

describe("buildHeatmapSection", () => {
  it("marque chaque période comme faite ou non faite", () => {
    const habit = makeHabit();

    const section = buildHeatmapSection(
      "daily",
      [habit],
      completions(completionKey("rec1", "2026-08-23")),
      KEYS,
    );

    expect(section.rows[0].cells.map((cell) => cell.state)).toEqual([
      "missed",
      "done",
      "missed",
    ]);
    expect(section.rows[0].score).toBe(33);
  });

  it("ignore les périodes antérieures à la création de l'habitude", () => {
    const habit = makeHabit({ created_at: "2026-08-23" });

    const section = buildHeatmapSection(
      "daily",
      [habit],
      completions(completionKey("rec1", "2026-08-23")),
      KEYS,
    );

    // Sans cette exclusion, une habitude créée hier afficherait 33 % au lieu de 50 %.
    expect(section.rows[0].cells[0].state).toBe("inactive");
    expect(section.rows[0].score).toBe(50);
  });

  it("ne retient que les habitudes de la fréquence demandée", () => {
    const section = buildHeatmapSection(
      "daily",
      [makeHabit(), makeHabit({ id: "rec2", frequency: "weekly" })],
      completions(),
      KEYS,
    );

    expect(section.rows).toHaveLength(1);
    expect(section.rows[0].habitId).toBe("rec1");
  });

  it("calcule la part d'habitudes cochées pour chaque colonne", () => {
    const section = buildHeatmapSection(
      "daily",
      [makeHabit(), makeHabit({ id: "rec2", name: "Lecture" })],
      completions(
        completionKey("rec1", "2026-08-22"),
        completionKey("rec2", "2026-08-22"),
        completionKey("rec1", "2026-08-23"),
      ),
      KEYS,
    );

    expect(section.totals).toEqual([1, 0.5, 0]);
    expect(section.score).toBe(50);
  });

  it("laisse la colonne à null quand aucune habitude n'existait encore", () => {
    const section = buildHeatmapSection(
      "daily",
      [makeHabit({ created_at: "2026-08-24" })],
      completions(),
      KEYS,
    );

    expect(section.totals).toEqual([null, null, 0]);
  });

  it("renvoie un score nul plutôt qu'une division par zéro", () => {
    const section = buildHeatmapSection("daily", [], completions(), KEYS);

    expect(section.rows).toEqual([]);
    expect(section.score).toBeNull();
  });
});
