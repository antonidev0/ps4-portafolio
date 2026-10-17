import { act, fireEvent, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { routes } from "./routes";
import { useAppStore } from "./store/useAppStore";

// jsdom no tiene WebGL: en los tests el juego se sustituye por un botón de salida
vi.mock("./apps/dachshund-3d/components/DachshundGame", () => ({
  default: ({ onExit, exitLabel }) => <button onClick={onExit}>{exitLabel}</button>,
}));

const abrir = (ruta) => {
  const router = createMemoryRouter(routes, { initialEntries: [ruta] });
  render(<RouterProvider router={router} />);
  return router;
};

describe("navegación", () => {
  afterEach(() => {
    vi.useRealTimers();
    useAppStore.setState({ indiceMenu: 0 });
  });

  it("la bienvenida lleva al menú al pulsar una tecla", () => {
    vi.useFakeTimers();
    const router = abrir("/");
    expect(screen.getByRole("dialog", { name: "Bienvenido a mi portafolio" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Shift" }); // las teclas modificadoras no cuentan
    act(() => vi.advanceTimersByTime(2000));
    expect(router.state.location.pathname).toBe("/");

    fireEvent.keyDown(window, { key: "x" });
    act(() => vi.advanceTimersByTime(1000));
    expect(router.state.location.pathname).toBe("/menu");
  });

  it("abre una sección desde el menú y vuelve a la misma tarjeta con Escape", async () => {
    const router = abrir("/menu");
    fireEvent.keyDown(window, { key: "ArrowRight" });
    fireEvent.keyDown(window, { key: "Enter" });

    expect(await screen.findByRole("heading", { name: "Proyectos" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/proyectos");

    fireEvent.keyDown(window, { key: "Escape" });
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("option", { selected: true })).toHaveAccessibleName("Proyectos");
  });

  it("abre Dachshund 3D desde su tarjeta y vuelve al menú al salir", async () => {
    const router = abrir("/menu");
    fireEvent.keyDown(window, { key: "ArrowRight" });
    fireEvent.keyDown(window, { key: "ArrowRight" });
    fireEvent.keyDown(window, { key: "Enter" });

    fireEvent.click(await screen.findByRole("button", { name: "Volver al portafolio" }));
    expect(router.state.location.pathname).toBe("/menu");
    expect(await screen.findByRole("option", { selected: true })).toHaveAccessibleName(
      "Dachshund 3D",
    );
  });

  it("cambia de idioma desde el selector sin salir de la bienvenida", () => {
    vi.useFakeTimers();
    const router = abrir("/");
    fireEvent.pointerDown(screen.getByRole("button", { name: "English" }));
    fireEvent.click(screen.getByRole("button", { name: "English" }));
    act(() => vi.advanceTimersByTime(2000));

    expect(router.state.location.pathname).toBe("/");
    expect(screen.getByRole("dialog", { name: "Welcome to my portfolio" })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");
    expect(document.title).toBe("ToniDev Portfolio | React Frontend Developer");
  });

  it("muestra las secciones en el idioma elegido en Ajustes", async () => {
    abrir("/ajustes");
    fireEvent.click(await screen.findByLabelText("Italiano"));
    expect(await screen.findByRole("heading", { name: "Impostazioni" })).toBeInTheDocument();
    expect(screen.getByText("Colore dello sfondo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Torna al menu/ })).toBeInTheDocument();
  });

  it("cambia el tema desde Ajustes", async () => {
    abrir("/ajustes");
    fireEvent.click(await screen.findByLabelText("Violeta"));
    expect(useAppStore.getState().tema).toBe("violeta");
  });

  it("muestra la página de no encontrada en rutas desconocidas", async () => {
    abrir("/no-existe");
    expect(
      await screen.findByRole("heading", { name: "Página no encontrada" }),
    ).toBeInTheDocument();
    abrir("/a/b/c");
    expect(await screen.findAllByRole("heading", { name: "Página no encontrada" })).toHaveLength(2);
  });
});
