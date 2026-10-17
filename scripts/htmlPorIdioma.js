// Plugin de Vite: al compilar, crea dist/en/index.html y dist/it/index.html a partir
// de dist/index.html, con el idioma, el título, la descripción, la URL canónica y las
// etiquetas Open Graph de cada idioma (src/i18n/seo.js). Así los buscadores y las
// vistas previas de WhatsApp o LinkedIn ven cada versión sin ejecutar JavaScript.
// También rehace el de español con los mismos textos, para que todo salga de seo.js.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { IDIOMA_POR_DEFECTO, rutaEnIdioma } from "../src/i18n/idiomas.js";
import { SEO, URL_SITIO } from "../src/i18n/seo.js";

const escapar = (texto) =>
  texto.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// Sustituye y avisa si index.html ya no tiene la etiqueta esperada
function reemplazar(html, patron, nuevo) {
  if (!patron.test(html)) throw new Error(`htmlPorIdioma: no encuentro ${patron} en index.html`);
  return html.replace(patron, nuevo);
}

const meta = (atributo, nombre) =>
  new RegExp(`(<meta\\s+${atributo}="${nombre}"\\s+content=")[^"]*(")`);

export function htmlParaIdioma(html, idioma) {
  const seo = SEO[idioma];
  const url = URL_SITIO + rutaEnIdioma("/", idioma);
  const imagen = URL_SITIO + seo.imagen;
  const alternativos = Object.entries(SEO)
    .filter(([codigo]) => codigo !== idioma)
    .map(([, otro]) => `<meta property="og:locale:alternate" content="${otro.locale}" />`)
    .join("\n    ");

  const cambios = [
    [/<html lang="[^"]*"/, `<html lang="${idioma}"`],
    [/<title>[^<]*<\/title>/, `<title>${escapar(seo.titulo)}</title>`],
    [meta("name", "description"), `$1${escapar(seo.descripcion)}$2`],
    [/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`],
    [/\s*<meta property="og:locale:alternate"[^>]*>/g, ""],
    [
      /(<meta property="og:locale" content=")[^"]*(" \/>)/,
      `$1${seo.locale}$2\n    ${alternativos}`,
    ],
    [meta("property", "og:site_name"), `$1${escapar(seo.nombreSitio)}$2`],
    [meta("property", "og:title"), `$1${escapar(seo.titulo)}$2`],
    [meta("property", "og:description"), `$1${escapar(seo.descripcionCorta)}$2`],
    [meta("property", "og:url"), `$1${url}$2`],
    [meta("property", "og:image"), `$1${imagen}$2`],
    [meta("name", "twitter:title"), `$1${escapar(seo.titulo)}$2`],
    [meta("name", "twitter:description"), `$1${escapar(seo.descripcionCorta)}$2`],
    [meta("name", "twitter:image"), `$1${imagen}$2`],
    [/(<noscript\s*>)[\s\S]*?(<\/noscript)/, `$1${escapar(seo.noscript)}$2`],
  ];
  return cambios.reduce((h, [patron, nuevo]) => reemplazar(h, patron, nuevo), html);
}

export default function htmlPorIdioma() {
  return {
    name: "html-por-idioma",
    apply: "build",
    async writeBundle({ dir }) {
      const original = await readFile(join(dir, "index.html"), "utf8");
      for (const idioma of Object.keys(SEO)) {
        const carpeta = idioma === IDIOMA_POR_DEFECTO ? dir : join(dir, idioma);
        await mkdir(carpeta, { recursive: true });
        await writeFile(join(carpeta, "index.html"), htmlParaIdioma(original, idioma));
      }
    },
  };
}
