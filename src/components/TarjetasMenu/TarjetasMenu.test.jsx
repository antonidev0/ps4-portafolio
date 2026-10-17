import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TarjetasMenu from "./TarjetasMenu";

const items = [
  { id: "a", titulo: "Uno" },
  { id: "b", titulo: "Dos" },
  { id: "c", titulo: "Tres" },
];

const seleccionada = () => screen.getByRole("option", { selected: true });

describe("TarjetasMenu", () => {
  it("se mueve con las flechas y no pasa de los bordes", () => {
    const onCambio = vi.fn();
    render(<TarjetasMenu items={items} onCambio={onCambio} />);
    expect(seleccionada()).toHaveAccessibleName("Uno");

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(onCambio).not.toHaveBeenCalled();

    fireEvent.keyDown(window, { key: "ArrowRight" });
    fireEvent.keyDown(window, { key: "d" });
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(seleccionada()).toHaveAccessibleName("Tres");
    expect(onCambio).toHaveBeenCalledTimes(2);
    expect(onCambio).toHaveBeenLastCalledWith(items[2], 2);
  });

  it("abre con Enter y con clic en la seleccionada, y vuelve con Escape", () => {
    const onAbrir = vi.fn();
    const onAtras = vi.fn();
    render(<TarjetasMenu items={items} inicial={1} onAbrir={onAbrir} onAtras={onAtras} />);

    fireEvent.keyDown(window, { key: "Enter" });
    expect(onAbrir).toHaveBeenLastCalledWith(items[1]);

    fireEvent.click(screen.getByRole("option", { name: "Tres" }));
    expect(onAbrir).toHaveBeenCalledTimes(1); // el primer clic solo selecciona
    fireEvent.click(screen.getByRole("option", { name: "Tres" }));
    expect(onAbrir).toHaveBeenLastCalledWith(items[2]);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onAtras).toHaveBeenCalledTimes(1);
  });

  it("acepta un índice inicial fuera de rango", () => {
    render(<TarjetasMenu items={items} inicial={10} />);
    expect(seleccionada()).toHaveAccessibleName("Tres");
  });
});
