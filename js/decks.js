/**
 * DECK-001 — Estructura de datos de los mazos
 * Fuente de verdad para los tres mazos de fototerapia.
 *
 * INSTRUCCIONES PARA PERSONALIZAR:
 * - Reemplaza las rutas en `cards[]` con las rutas reales de tus imágenes.
 * - Cada mazo tiene su propio dorso en `back`.
 * - Puedes agregar o quitar cartas del array `cards`.
 */

const DECKS = [
  {
    id: "alma",
    name: "Alma",
    back: "assets/backs/alma_00_f.jpg",
    color: "#7C6A8E",
    cards: Array.from({ length: 120 }, (_, i) => {
      const num = String(i + 1).padStart(2, "0");
      return {
        id: `alma-${num}`,
        src: `assets/cards/alma/fotos/alma_${num}.jpg`,
        alt: `Alma ${num}`,
      };
    }),
  },
  {
    id: "dreams",
    name: "Dreams",
    back: "assets/backs/dreams_0.png",
    color: "#6A8E7C",
    cards: Array.from({ length: 101 }, (_, i) => {
      const num = String(i + 1).padStart(2, "0");
      return {
        id: `dreams-${num}`,
        src: `assets/cards/dreams/dreams_${num}.png`,
        alt: `Dreams ${num}`,
      };
    }),
  },
  {
    id: "pixel",
    name: "Pixel",
    back: "assets/backs/pixel_0.jpg",
    color: "#8E7C6A",
    cards: Array.from({ length: 113 }, (_, i) => ({
      id: `pixel-${i + 1}`,
      src: `assets/cards/pixel/fotos/pixel_${i + 1}.jpg`,
      alt: `Pixel ${i + 1}`,
    })),
  },
];

// Presets predefinidos (filas x columnas)
const PRESETS = [
  { id: "3x1", label: "3×1", rows: 1, cols: 3 },
  { id: "3x2", label: "3×2", rows: 2, cols: 3 },
  { id: "3x3", label: "3×3", rows: 3, cols: 3 },
];

// Exportar para uso global
window.DECKS = DECKS;
window.PRESETS = PRESETS;
