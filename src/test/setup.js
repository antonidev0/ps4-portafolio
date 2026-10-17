import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { useAppStore } from "../store/useAppStore";

// jsdom no implementa canvas ni ResizeObserver: el fondo animado no se dibuja en los tests
HTMLCanvasElement.prototype.getContext = vi.fn(() => null);

// jsdom tampoco reproduce audio
HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve());
HTMLMediaElement.prototype.pause = vi.fn();

// Los tests se escriben en español, sea cual sea el idioma del navegador de jsdom
beforeEach(() => useAppStore.setState({ idioma: "es", sonido: true }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
});
