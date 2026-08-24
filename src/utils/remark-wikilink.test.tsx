import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { remarkWikiLink } from "./remark-wikilink";

/**
 * Rend du markdown en balisant chaque wikilink `«cible|libellé|texte»`, pour
 * vérifier d'un coup ce qui est transformé et ce qui reste littéral.
 */
function render(markdown: string): string {
  return renderToStaticMarkup(
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkWikiLink]}
      components={{
        wikilink: ({ wikitarget, wikialias, children }) => (
          <>{`«${wikitarget}|${wikialias}|${children}»`}</>
        ),
      }}
    >
      {markdown}
    </ReactMarkdown>,
  );
}

describe("remarkWikiLink", () => {
  it("transforme un lien simple, la cible servant de texte affiché", () => {
    expect(render("Voir [[Recettes]].")).toContain("«Recettes||Recettes»");
  });

  it("transforme un lien à libellé, le libellé servant de texte affiché", () => {
    expect(render("Voir [[Recettes|mes recettes]].")).toContain(
      "«Recettes|mes recettes|mes recettes»",
    );
  });

  it("transforme une cible numérique", () => {
    expect(render("Voir [[#42]].")).toContain("«#42||#42»");
  });

  it("nettoie les espaces autour de la cible et du libellé", () => {
    expect(render("[[  A  |  B  ]]")).toContain("«A|B|B»");
  });

  it("laisse le code inline intact", () => {
    const html = render("`[[Recettes]]`");
    expect(html).toContain("<code>[[Recettes]]</code>");
    expect(html).not.toContain("«");
  });

  it("laisse un bloc de code délimité intact", () => {
    const html = render("```js\nconst x = [[Recettes]];\n```");
    expect(html).toContain("[[Recettes]]");
    expect(html).not.toContain("«");
  });

  it("laisse un bloc de code indenté intact", () => {
    const html = render("texte\n\n    [[Recettes]]\n");
    expect(html).toContain("<pre>");
    expect(html).not.toContain("«");
  });

  it("ne transforme pas un wikilink dans le libellé d'un lien markdown", () => {
    const html = render("[voir [[Cible]]](https://example.test)");
    expect(html).toContain("<a href=");
    expect(html).not.toContain("«");
  });

  it("transforme les wikilinks à l'intérieur d'un tableau", () => {
    const html = render("| a |\n|---|\n| [[Recettes]] |");
    expect(html).toContain("«Recettes||Recettes»");
  });

  it("transforme plusieurs liens dans un même paragraphe", () => {
    const html = render("[[A]] puis [[B]]");
    expect(html).toContain("«A||A»");
    expect(html).toContain("«B||B»");
  });

  it("laisse le markdown sans wikilink inchangé", () => {
    expect(render("**gras** et *italique*")).toBe(
      "<p><strong>gras</strong> et <em>italique</em></p>",
    );
  });
});
