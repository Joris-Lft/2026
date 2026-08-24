import type { ReactNode } from "react";

// La balise émise par le plugin remark-wikilink, pour que react-markdown puisse
// la mapper sur le composant WikiLink avec des props typées.
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      wikilink: {
        wikitarget?: string;
        wikialias?: string;
        children?: ReactNode;
      };
    }
  }
}
