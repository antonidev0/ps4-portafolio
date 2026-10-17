import { useAppStore } from "../store/useAppStore";

// Música de la pantalla de bienvenida y efectos del menú.
// Los archivos están en public/sonidos/. Todo respeta el ajuste "Sonido" del store.
//
//   iniciarMusica()      empieza (o sigue) la música en bucle
//   detenerMusica(ms)    la baja con un fundido y la para
//   efecto("mover")      sonido corto: "mover" al cambiar de tarjeta, "seleccionar" al abrir
//   precargarEfectos()   descarga los efectos para que el primero suene sin retraso

const MUSICA = "/sonidos/fondo.mp3";
const EFECTOS = { mover: "/sonidos/mover.mp3", seleccionar: "/sonidos/seleccionar.mp3" };
const VOLUMEN_MUSICA = 0.35;
const VOLUMEN_EFECTOS = 0.5;

const sonidoActivo = () => useAppStore.getState().sonido;

let musica = null;
let fundido = null;

export function iniciarMusica() {
  if (!sonidoActivo() || typeof Audio === "undefined") return;
  // Si se estaba apagando (por ejemplo, al cambiar de idioma en la bienvenida), sigue sin cortes
  clearInterval(fundido);
  fundido = null;
  musica ??= Object.assign(new Audio(MUSICA), { loop: true, preload: "none" });
  musica.volume = VOLUMEN_MUSICA;
  // Los navegadores bloquean el audio hasta que el usuario interactúa: entonces se reintenta
  Promise.resolve(musica.play?.()).catch(() => {});
}

export function detenerMusica(ms = 900) {
  // Si ya se está apagando, no vuelve a empezar el fundido
  if (!musica || musica.paused || fundido) return;
  const pasos = Math.max(1, Math.round(ms / 50));
  const bajada = musica.volume / pasos;
  fundido = setInterval(() => {
    musica.volume = Math.max(0, musica.volume - bajada);
    if (musica.volume > 0) return;
    clearInterval(fundido);
    fundido = null;
    musica.pause();
    musica.currentTime = 0;
  }, 50);
}

// Los efectos usan Web Audio: suenan al instante y se pueden solapar
let contexto = null;
const datos = {}; // nombre → promesa del archivo descargado
const buffers = {}; // nombre → promesa del audio decodificado

const descargar = (nombre) =>
  (datos[nombre] ??= fetch(EFECTOS[nombre]).then((r) => r.arrayBuffer()));

export function precargarEfectos() {
  if (typeof AudioContext === "undefined") return;
  for (const nombre of Object.keys(EFECTOS)) descargar(nombre).catch(() => {});
}

export async function efecto(nombre) {
  if (!sonidoActivo() || !EFECTOS[nombre] || typeof AudioContext === "undefined") return;
  try {
    // El contexto se crea con el primer gesto del usuario, que es cuando el navegador lo permite
    contexto ??= new AudioContext();
    if (contexto.state === "suspended") await contexto.resume();
    buffers[nombre] ??= descargar(nombre).then((d) => contexto.decodeAudioData(d.slice(0)));
    const fuente = contexto.createBufferSource();
    const volumen = contexto.createGain();
    fuente.buffer = await buffers[nombre];
    volumen.gain.value = VOLUMEN_EFECTOS;
    fuente.connect(volumen).connect(contexto.destination);
    fuente.start();
  } catch {
    // Sin audio disponible: la interfaz funciona igual
  }
}
