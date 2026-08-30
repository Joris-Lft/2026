import { describe, expect, it } from "vitest";
import {
  formatPeriodKey,
  getPeriodKey,
  getRecentPeriodKeys,
} from "./habit-periods";

describe("getPeriodKey", () => {
  it("formate les trois fréquences", () => {
    const date = new Date(2026, 7, 24);

    expect(getPeriodKey("daily", date)).toBe("2026-08-24");
    expect(getPeriodKey("weekly", date)).toBe("2026-W35");
    expect(getPeriodKey("monthly", date)).toBe("2026-08");
  });

  it("rattache une semaine à cheval sur le 1er janvier à son année ISO", () => {
    // Le 31/12/2025 tombe dans la semaine 1 de 2026 (norme ISO).
    expect(getPeriodKey("weekly", new Date(2025, 11, 31))).toBe("2026-W01");
  });
});

describe("getRecentPeriodKeys", () => {
  it("renvoie les clés de la plus ancienne à la plus récente, date incluse", () => {
    expect(getRecentPeriodKeys("daily", new Date(2026, 7, 24), 3)).toEqual([
      "2026-08-22",
      "2026-08-23",
      "2026-08-24",
    ]);
  });

  it("recule d'une semaine ISO à la fois", () => {
    expect(getRecentPeriodKeys("weekly", new Date(2026, 7, 24), 3)).toEqual([
      "2026-W33",
      "2026-W34",
      "2026-W35",
    ]);
  });

  it("n'oublie aucun mois en partant d'un 31", () => {
    expect(getRecentPeriodKeys("monthly", new Date(2026, 7, 31), 4)).toEqual([
      "2026-05",
      "2026-06",
      "2026-07",
      "2026-08",
    ]);
  });

  it("produit des clés triables, donc affichables dans l'ordre", () => {
    const keys = getRecentPeriodKeys("daily", new Date(2026, 0, 2), 4);
    expect([...keys].sort()).toEqual(keys);
  });
});

describe("formatPeriodKey", () => {
  it("abrège chaque fréquence", () => {
    expect(formatPeriodKey("daily", "2026-08-24")).toBe("lun. 24/08");
    expect(formatPeriodKey("weekly", "2026-W35")).toBe("S35");
    expect(formatPeriodKey("monthly", "2026-08")).toBe("août 2026");
  });
});
