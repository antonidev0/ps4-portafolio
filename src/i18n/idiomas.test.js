import { afterEach, describe, expect, it, vi } from "vitest";
import { detectarIdioma, traducir } from "./idiomas";

describe("idiomas", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("detecta el primer idioma del navegador que está disponible", () => {
    vi.stubGlobal("navigator", { languages: ["fr-FR", "it-IT", "en"] });
    expect(detectarIdioma()).toBe("it");
  });

  it("usa español si ningún idioma del navegador está disponible", () => {
    vi.stubGlobal("navigator", { languages: ["de-DE"] });
    expect(detectarIdioma()).toBe("es");
  });

  it("traduce textos simples y objetos, con el español como reserva", () => {
    expect(traducir("GitHub", "en")).toBe("GitHub");
    expect(traducir({ es: "Hola", en: "Hi" }, "en")).toBe("Hi");
    expect(traducir({ es: "Hola", en: "Hi" }, "it")).toBe("Hola");
  });
});
