import { describe, expect, it } from "vitest";
import {
  findExistingOption,
  mergeOptions,
  normalizeOptionLabel,
  resolveOptionLabel,
} from "./options";

describe("normalizeOptionLabel", () => {
  it("retire les espaces de bord et réduit les espaces internes", () => {
    expect(normalizeOptionLabel("  Trop   d'espaces  ")).toBe("Trop d'espaces");
  });

  it("réduit sauts de ligne et tabulations à une espace", () => {
    expect(normalizeOptionLabel("a\n\tb")).toBe("a b");
  });

  it("renvoie une chaîne vide pour une saisie blanche", () => {
    expect(normalizeOptionLabel("   ")).toBe("");
  });
});

describe("mergeOptions", () => {
  it("fusionne plusieurs listes en conservant l'ordre d'apparition", () => {
    expect(mergeOptions(["b", "a"], ["c"])).toEqual(["b", "a", "c"]);
  });

  it("dédoublonne sans tenir compte de la casse, en gardant la première forme", () => {
    expect(mergeOptions(["Maison"], ["maison", "MAISON"])).toEqual(["Maison"]);
  });

  it("normalise les libellés au passage", () => {
    expect(mergeOptions(["  Deux   mots  "])).toEqual(["Deux mots"]);
  });

  it("écarte les libellés vides", () => {
    expect(mergeOptions(["", "   ", "a"])).toEqual(["a"]);
  });

  it("accepte d'être appelée sans argument", () => {
    expect(mergeOptions()).toEqual([]);
  });
});

describe("findExistingOption", () => {
  it("retrouve une option à la casse près", () => {
    expect(findExistingOption(["Maison", "Voyage"], "maison")).toBe("Maison");
  });

  it("ignore les espaces superflus de la saisie", () => {
    expect(findExistingOption(["Maison"], "  MAISON ")).toBe("Maison");
  });

  it("renvoie undefined quand rien ne correspond", () => {
    expect(findExistingOption(["Maison"], "Jardin")).toBeUndefined();
  });
});

describe("resolveOptionLabel", () => {
  it("réutilise l'option existante plutôt que de créer un quasi-doublon", () => {
    expect(resolveOptionLabel(["Maison"], "maison")).toBe("Maison");
  });

  it("renvoie le libellé normalisé quand l'option est nouvelle", () => {
    expect(resolveOptionLabel(["Maison"], "  Nouveau  tag ")).toBe("Nouveau tag");
  });

  it("renvoie une chaîne vide pour une saisie blanche", () => {
    expect(resolveOptionLabel(["Maison"], "   ")).toBe("");
  });
});
