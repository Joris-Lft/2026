import { findAndReplace } from "mdast-util-find-and-replace";
import type { Root } from "mdast";
import { createWikiLinkRegex } from "./wikilinks";

declare module "mdast" {
  interface PhrasingContentMap {
    wikiLink: {
      type: "wikiLink";
      data: {
        hName: "wikilink";
        hProperties: { wikitarget: string; wikialias: string };
        hChildren: Array<{ type: "text"; value: string }>;
      };
    };
  }
}

/**
 * Transforme `[[Titre]]` / `[[Titre|libellé]]` en un nœud rendu par le composant
 * `WikiLink`. findAndReplace ne visite que les nœuds texte : le code inline et
 * les blocs de code sont donc ignorés sans effort.
 *
 * Le plugin reste pur — la résolution du lien se fait côté React, où l'index
 * des notes est disponible.
 */
export function remarkWikiLink() {
  return (tree: Root) => {
    findAndReplace(
      tree,
      [
        [
          createWikiLinkRegex(),
          (_match: string, target: string, alias?: string) => {
            const wikitarget = target.trim();
            const wikialias = (alias ?? "").trim();

            return {
              type: "wikiLink" as const,
              data: {
                hName: "wikilink" as const,
                hProperties: { wikitarget, wikialias },
                hChildren: [
                  { type: "text" as const, value: wikialias || wikitarget },
                ],
              },
            };
          },
        ],
      ],
      { ignore: ["link", "linkReference"] },
    );
  };
}
