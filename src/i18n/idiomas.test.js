import { afterEach, describe, expect, it, vi } from "vitest";
import { detectarIdioma, esRobot, quitarIdioma, rutaEnIdioma, traducir } from "./idiomas";

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

  it("pone y quita el prefijo de idioma de las rutas", () => {
    expect(rutaEnIdioma("/menu", "es")).toBe("/menu");
    expect(rutaEnIdioma("/menu", "en")).toBe("/en/menu");
    expect(rutaEnIdioma("/", "it")).toBe("/it/");
    expect(quitarIdioma("/en/proyectos")).toBe("/proyectos");
    expect(quitarIdioma("/it")).toBe("/");
    expect(quitarIdioma("/menu")).toBe("/menu");
    expect(quitarIdioma("/es/menu")).toBe("/es/menu");
  });

  it("reconoce a los buscadores y a las vistas previas de redes sociales", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1)" });
    expect(esRobot()).toBe(true);
    vi.stubGlobal("navigator", { userAgent: "WhatsApp/2.23" });
    expect(esRobot()).toBe(true);
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (Windows NT 10.0) Chrome/130" });
    expect(esRobot()).toBe(false);
  });
});
