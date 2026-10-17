import { beforeEach, describe, expect, it } from "vitest";
import { useAppStore } from "./useAppStore";

describe("useAppStore", () => {
  beforeEach(() => useAppStore.setState({ tema: "azul", indiceMenu: 0 }));

  it("cambia el tema y lo guarda en localStorage", () => {
    useAppStore.getState().setTema("violeta");
    expect(useAppStore.getState().tema).toBe("violeta");
    expect(JSON.parse(localStorage.getItem("portafolio-tonidev")).state).toMatchObject({
      tema: "violeta",
    });
  });

  it("cambia el idioma, lo guarda e ignora idiomas que no existen", () => {
    useAppStore.getState().setIdioma("it");
    expect(useAppStore.getState().idioma).toBe("it");
    expect(JSON.parse(localStorage.getItem("portafolio-tonidev")).state.idioma).toBe("it");
    useAppStore.getState().setIdioma("fr");
    expect(useAppStore.getState().idioma).toBe("it");
  });

  it("ignora temas que no existen", () => {
    useAppStore.getState().setTema("inventado");
    expect(useAppStore.getState().tema).toBe("azul");
  });

  it("recuerda la tarjeta seleccionada sin guardarla entre visitas", () => {
    useAppStore.getState().setIndiceMenu(3);
    expect(useAppStore.getState().indiceMenu).toBe(3);
    expect(localStorage.getItem("portafolio-tonidev") ?? "").not.toContain("indiceMenu");
  });
});
