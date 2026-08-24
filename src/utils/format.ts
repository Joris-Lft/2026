const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const currencyRoundedFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Formate un montant en euros (fr-FR). `decimals: 0` pour arrondir à l'euro. */
export function formatCurrency(
  value: number,
  options?: { decimals?: 0 | 2 },
): string {
  const formatter =
    options?.decimals === 0 ? currencyRoundedFormatter : currencyFormatter;
  return formatter.format(value);
}

/** Parse un montant saisi (virgule ou point décimal). Renvoie null si vide/invalide. */
export function parseAmount(value: string): number | null {
  const normalized = value.replace(",", ".").trim();
  if (normalized === "") return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Formate une date ISO en fr-FR (jour long). Renvoie "" si la valeur est vide. */
export function formatDate(value: string): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
