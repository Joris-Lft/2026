/**
 * Échappe une valeur avant de l'interpoler dans un `filterByFormula` Airtable.
 *
 * Sans échappement, un guillemet dans la valeur (email, période…) casse la
 * formule et permet d'en altérer la logique.
 */
export function formulaValue(value: string): string {
  return `"${value.replace(/["\\]/g, "\\$&")}"`;
}
