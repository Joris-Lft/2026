/**
 * Les projets existent en deux périmètres : « communs » (partagés entre tous les
 * utilisateurs) et « perso » (privés à leur créateur). Chaque périmètre a ses
 * propres projets et sa propre cagnotte ; les pages sont les mêmes, seule cette
 * configuration change.
 */
export type ProjectScope = "shared" | "personal";

export type ProjectScopeConfig = {
  basePath: string;
  listTitle: string;
  savingsLabel: string;
};

export const PROJECT_SCOPES: Record<ProjectScope, ProjectScopeConfig> = {
  shared: {
    basePath: "/projets-communs",
    listTitle: "Projets communs",
    savingsLabel: "Cagnotte commune",
  },
  personal: {
    basePath: "/projets-perso",
    listTitle: "Projets perso",
    savingsLabel: "Ma cagnotte",
  },
};

export function isPersonalScope(scope: ProjectScope): boolean {
  return scope === "personal";
}
