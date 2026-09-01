import { describe, expect, it } from "vitest";
import type { Habit } from "@/types/habits";
import {
  buildArcTable,
  completionKey,
  getArcDays,
  getArcPeriodKeys,
} from "./arc-table";

const START = "2026-09-01";
const END = "2026-09-30";

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: "rec1",
    user_id: "user@test.fr",
    name: "Course",
    frequency: "daily",
    ...overrides,
  };
}

const rowOf = (table: ReturnType<typeof buildArcTable>, index = 0) =>
  table.sections[0].rows[index];

describe("getArcDays", () => {
  it("couvre les deux bornes", () => {
    const days = getArcDays(START, END);

    expect(days).toHaveLength(30);
    expect(days[0]).toBe(START);
    expect(days.at(-1)).toBe(END);
  });

  it("renvoie une liste vide si l'arc est à l'envers", () => {
    expect(getArcDays(END, START)).toEqual([]);
  });
});

describe("getArcPeriodKeys", () => {
  it("dédoublonne les clés hebdomadaires et mensuelles", () => {
    const keys = getArcPeriodKeys(START, END);

    expect(keys.daily).toHaveLength(30);
    // Le 1er sept. 2026 tombe un mardi : la semaine 36 est entamée.
    expect(keys.weekly[0]).toBe("2026-W36");
    expect(keys.monthly).toEqual(["2026-09"]);
  });
});

describe("buildArcTable", () => {
  it("marque chaque jour comme fait ou non fait jusqu'à aujourd'hui", () => {
    const table = buildArcTable(
      [makeHabit()],
      new Set([completionKey("rec1", "2026-09-02")]),
      "2026-09-03",
      START,
      END,
    );

    const states = rowOf(table).cells.map((cell) => cell.state);
    expect(states.slice(0, 4)).toEqual(["missed", "done", "missed", "future"]);
  });

  it("exclut la période en cours du score", () => {
    const table = buildArcTable(
      [makeHabit()],
      new Set([completionKey("rec1", "2026-09-01")]),
      "2026-09-03",
      START,
      END,
    );

    // 1er fait, 2 manqué, 3 en cours : 1 sur 2 périodes closes.
    expect(rowOf(table).score).toBe(50);
  });

  it("ne donne pas de score tant qu'aucune période n'est close", () => {
    const table = buildArcTable([makeHabit()], new Set(), START, START, END);

    expect(rowOf(table).score).toBeNull();
  });

  it("neutralise les périodes antérieures à la création de l'habitude", () => {
    const table = buildArcTable(
      [makeHabit({ created_at: "2026-09-03" })],
      new Set([completionKey("rec1", "2026-09-03")]),
      "2026-09-05",
      START,
      END,
    );

    const cells = rowOf(table).cells;
    expect(cells.slice(0, 2).map((cell) => cell.state)).toEqual([
      "inactive",
      "inactive",
    ]);
    // 3 fait, 4 manqué : 50 %, et non 25 % si les deux jours d'avant comptaient.
    expect(rowOf(table).score).toBe(50);
  });

  it("étale une case hebdomadaire sur les jours qu'elle couvre", () => {
    const table = buildArcTable(
      [makeHabit({ frequency: "weekly" })],
      new Set(),
      "2026-09-15",
      START,
      END,
    );

    const cells = table.sections[0].rows[0].cells;
    // La semaine 36 est tronquée par le début de l'arc (mardi → dimanche).
    expect(cells[0]).toMatchObject({ periodKey: "2026-W36", span: 6 });
    expect(cells[1]).toMatchObject({ periodKey: "2026-W37", span: 7 });
  });

  it("découpe les mois de l'en-tête selon les jours réellement dans l'arc", () => {
    const table = buildArcTable([], new Set(), "2026-09-15", "2026-09-20", "2026-10-05");

    expect(table.months).toEqual([
      { key: "2026-09", label: "septembre", span: 11 },
      { key: "2026-10", label: "octobre", span: 5 },
    ]);
  });

  it("situe aujourd'hui, et le signale hors de l'arc", () => {
    expect(buildArcTable([], new Set(), "2026-09-03", START, END).todayIndex).toBe(2);
    expect(buildArcTable([], new Set(), "2026-10-03", START, END).todayIndex).toBe(-1);
  });

  it("écarte les sections sans habitude", () => {
    const table = buildArcTable([makeHabit()], new Set(), "2026-09-03", START, END);

    expect(table.sections.map((section) => section.frequency)).toEqual(["daily"]);
  });
});
