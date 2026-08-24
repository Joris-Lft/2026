/** Nettoie un libellé d'option saisi par l'utilisateur : espaces superflus supprimés. */
export function normalizeOptionLabel(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

/**
 * Fusionne plusieurs listes d'options en une seule : libellés normalisés,
 * dédoublonnés sans tenir compte de la casse, dans l'ordre de première apparition.
 */
export function mergeOptions(...lists: readonly (readonly string[])[]): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const list of lists) {
    for (const raw of list) {
      const label = normalizeOptionLabel(raw);
      if (!label) continue;

      const key = label.toLowerCase();
      if (seen.has(key)) continue;

      seen.add(key);
      merged.push(label);
    }
  }

  return merged;
}

/** Retrouve une option existante correspondant au libellé, à la casse près. */
export function findExistingOption(
  options: string[],
  label: string,
): string | undefined {
  const key = normalizeOptionLabel(label).toLowerCase();
  return options.find((option) => option.toLowerCase() === key);
}

/**
 * Libellé à retenir pour une saisie : l'option existante si elle correspond
 * (évite de créer un doublon à la casse près), sinon le libellé normalisé.
 * Retourne une chaîne vide si la saisie est vide.
 */
export function resolveOptionLabel(options: string[], label: string): string {
  return findExistingOption(options, label) ?? normalizeOptionLabel(label);
}

/** Longueur maximale d'un libellé d'option créé depuis l'app. */
export const MAX_OPTION_LENGTH = 40;
