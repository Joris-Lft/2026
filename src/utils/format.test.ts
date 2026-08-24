import { describe, expect, it } from "vitest";
import { formatCurrency, parseAmount } from "./format";

/** Intl insère une espace insécable étroite avant le symbole : on la neutralise. */
const normalize = (value: string) => value.replace(/\s/g, " ");

describe("formatCurrency", () => {
  it("formate un montant en euros", () => {
    expect(normalize(formatCurrency(1234.5))).toBe("1 234,5 €");
  });

  it("arrondit à l'euro avec decimals: 0", () => {
    expect(normalize(formatCurrency(1234.56, { decimals: 0 }))).toBe("1 235 €");
  });

  it("n'affiche pas de décimales inutiles", () => {
    expect(normalize(formatCurrency(10))).toBe("10 €");
  });

  it("gère les montants négatifs", () => {
    expect(normalize(formatCurrency(-5))).toBe("-5 €");
  });
});

describe("parseAmount", () => {
  it("accepte le point décimal", () => {
    expect(parseAmount("12.5")).toBe(12.5);
  });

  it("accepte la virgule décimale", () => {
    expect(parseAmount("12,5")).toBe(12.5);
  });

  it("ignore les espaces de bord", () => {
    expect(parseAmount("  42  ")).toBe(42);
  });

  it("renvoie null sur une saisie vide", () => {
    expect(parseAmount("")).toBeNull();
    expect(parseAmount("   ")).toBeNull();
  });

  it("renvoie null sur une saisie non numérique", () => {
    expect(parseAmount("abc")).toBeNull();
  });

  it("renvoie null sur une valeur non finie", () => {
    expect(parseAmount("Infinity")).toBeNull();
  });
});
