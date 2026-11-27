import { describe, expect, it } from "vitest";

import { formaterCredits, formaterDate, formaterDateHeure, formaterNote } from "./format";

describe("formaterNote (charte : virgule et deux décimales)", () => {
  it.each([
    [8.5, "8,50"],
    [10, "10,00"],
    ["12.25", "12,25"],
    [0, "0,00"],
  ])("%s -> %s", (note, attendu) => {
    expect(formaterNote(note)).toBe(attendu);
  });

  it.each([null, undefined, "", "abc"])("affiche un tiret pour %s", (note) => {
    expect(formaterNote(note as never)).toBe("—");
  });
});

describe("formaterCredits", () => {
  it("accorde le pluriel", () => {
    expect(formaterCredits(45)).toBe("45 crédits");
    expect(formaterCredits(1)).toBe("1 crédit");
    expect(formaterCredits(null)).toBe("—");
  });
});

describe("formaterDate (UTC stocké, fuseau de l'école à l'affichage)", () => {
  it("convertit dans le fuseau de l'école", () => {
    // 23 h 30 UTC le 31 décembre = 0 h 30 le 1er janvier à Douala (UTC+1)
    expect(formaterDate("2026-12-31T23:30:00Z", "Africa/Douala")).toBe("01/01/2027");
    expect(formaterDateHeure("2026-12-31T23:30:00Z", "Africa/Douala")).toBe("01/01/2027 00:30");
  });

  it("affiche un tiret pour une date absente ou illisible", () => {
    expect(formaterDate(null)).toBe("—");
    expect(formaterDate("pas une date")).toBe("—");
  });
});
