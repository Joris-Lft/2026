import { describe, expect, it } from "vitest";
import { makeAttachment } from "@/test/factories";
import { isImageAttachment } from "./attachments";

describe("isImageAttachment", () => {
  it("reconnaît un type MIME image", () => {
    expect(
      isImageAttachment(
        makeAttachment({ type: "image/png", filename: "sans-extension" }),
      ),
    ).toBe(true);
  });

  it("reconnaît une extension d'image dans le nom de fichier", () => {
    expect(isImageAttachment(makeAttachment({ filename: "photo.JPEG" }))).toBe(
      true,
    );
  });

  it("reconnaît une extension d'image dans l'URL, même suivie d'une query", () => {
    expect(
      isImageAttachment(
        makeAttachment({
          filename: "sans-extension",
          url: "https://example.test/a.webp?v=2",
        }),
      ),
    ).toBe(true);
  });

  it("rejette un PDF", () => {
    expect(
      isImageAttachment(
        makeAttachment({
          filename: "doc.pdf",
          url: "https://example.test/doc.pdf",
          type: "application/pdf",
        }),
      ),
    ).toBe(false);
  });

  it("rejette une pièce jointe sans extension ni type", () => {
    expect(
      isImageAttachment(
        makeAttachment({ filename: "fichier", url: "https://example.test/x" }),
      ),
    ).toBe(false);
  });
});
