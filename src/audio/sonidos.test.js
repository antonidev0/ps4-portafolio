import { afterEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "../store/useAppStore";
import { escucharClics } from "./sonidos";

// Web Audio falso: apunta qué archivo suena
const suenan = [];
class ContextoFalso {
  state = "running";
  destination = {};
  decodeAudioData = async (datos) => datos.nombre;
  createGain = () => ({ gain: {}, connect: (destino) => destino });
  createBufferSource() {
    const fuente = { connect: (nodo) => nodo, start: () => suenan.push(fuente.buffer) };
    return fuente;
  }
}

const esperar = () => new Promise((r) => setTimeout(r, 0));

describe("sonidos", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    suenan.length = 0;
    document.body.innerHTML = "";
  });

  it("los elementos con data-sonido suenan al pulsarlos, salvo con el sonido desactivado", async () => {
    vi.stubGlobal("AudioContext", ContextoFalso);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url) => ({
        arrayBuffer: async () => ({ nombre: url, slice: () => ({ nombre: url }) }),
      })),
    );
    document.body.innerHTML =
      '<button data-sonido="click"><span>Abrir</span></button><a data-sonido="retroceder">Volver</a><button>Nada</button>';
    const dejar = escucharClics();
    const [abrir, volver, nada] = [
      document.querySelector("span"),
      document.querySelector("a"),
      document.querySelectorAll("button")[1],
    ];

    abrir.click();
    volver.click();
    nada.click();
    await esperar();
    expect(suenan).toEqual(["/sonidos/click.mp3", "/sonidos/retroceder.mp3"]);

    useAppStore.setState({ sonido: false });
    abrir.click();
    await esperar();
    expect(suenan).toHaveLength(2);
    dejar();
  });
});
