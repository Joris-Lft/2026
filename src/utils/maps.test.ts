import { describe, expect, it } from "vitest";
import { buildMapsUrl } from "./maps";

describe("buildMapsUrl", () => {
  it("renvoie l'URL telle quelle si l'entrée en est déjà une", () => {
    const url = "https://maps.app.goo.gl/abc";
    expect(buildMapsUrl(url)).toBe(url);
  });

  it("reconnaît une URL http et la casse du protocole", () => {
    expect(buildMapsUrl("HTTP://example.test/x")).toBe("HTTP://example.test/x");
  });

  it("construit une recherche à partir d'un texte libre", () => {
    expect(buildMapsUrl("Tour Eiffel, Paris")).toBe(
      "https://www.google.com/maps/search/?api=1&query=Tour%20Eiffel%2C%20Paris",
    );
  });

  it("ignore les espaces de bord", () => {
    expect(buildMapsUrl("  Lyon  ")).toBe(
      "https://www.google.com/maps/search/?api=1&query=Lyon",
    );
  });
});
