import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { htmlParaIdioma } from "./htmlPorIdioma";

const original = readFileSync(resolve(__dirname, "../index.html"), "utf8");

describe("htmlParaIdioma", () => {
  it("genera la página en inglés con sus metaetiquetas", () => {
    const html = htmlParaIdioma(original, "en");
    expect(html).toContain('<html lang="en"');
    expect(html).toContain("<title>ToniDev Portfolio | React Frontend Developer</title>");
    expect(html).toContain('<link rel="canonical" href="https://ps4-portafolio.vercel.app/en/"');
    expect(html).toContain('content="https://ps4-portafolio.vercel.app/og-image-en.png"');
    expect(html).toContain('<meta property="og:locale" content="en_US"');
    expect(html).toContain('<meta property="og:locale:alternate" content="es_ES"');
    expect(html).not.toContain('og:locale:alternate" content="en_US"');
    expect(html).toContain("Please enable JavaScript");
    // Los enlaces hreflang son los mismos en todas las versiones
    expect(html).toContain('hreflang="it" href="https://ps4-portafolio.vercel.app/it/"');
  });

  it("escapa los apóstrofos y comillas sin romper el HTML", () => {
    const html = htmlParaIdioma(original, "it");
    expect(html).toContain('<html lang="it"');
    expect(html).toContain("un'interfaccia ispirata alla PS4");
  });

  it("deja la versión en español con los mismos textos que index.html", () => {
    // Solo cambian los saltos de línea que Prettier mete dentro de <noscript>
    const sinEspacios = (html) => html.replace(/\s+/g, " ");
    expect(sinEspacios(htmlParaIdioma(original, "es"))).toBe(sinEspacios(original));
  });
});
