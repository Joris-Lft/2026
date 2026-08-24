/**
 * Identifiant du premier enregistrement d'un champ lié Airtable.
 *
 * Airtable renvoie ces champs sous forme de tableau d'identifiants, mais le
 * SDK les type largement : cette normalisation évite de dupliquer le test à
 * chaque mapping.
 */
export function firstLinkedId(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const [first] = value as unknown[];
    return typeof first === "string" ? first : undefined;
  }
  return typeof value === "string" ? value : undefined;
}
