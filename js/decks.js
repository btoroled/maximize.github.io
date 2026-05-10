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
    id: "mazo1",
    name: "Pixel",
    back: "assets/backs/back1.jpg",
    color: "#7C6A8E",
    cards: Array.from({ length: 60 }, (_, i) => ({
      id: `m1-${i + 1}`,
      src: `assets/cards/mazo1/card${i + 1}.jpg`,
      alt: `Carta ${i + 1} de Pixel`,
    })),
  },
  {
    id: "mazo2",
    name: "Alma",
    back: "assets/backs/back2.jpg",
    color: "#6A8E7C",
    cards: Array.from({ length: 60 }, (_, i) => ({
      id: `m2-${i + 1}`,
      src: `assets/cards/mazo2/card${i + 1}.jpg`,
      alt: `Carta ${i + 1} del Alma`,
    })),
  },
  {
    id: "mazo3",
    name: "Dreams",
    back: "assets/backs/back3.jpg",
    color: "#8E7C6A",
    cards: Array.from({ length: 60 }, (_, i) => ({
      id: `m3-${i + 1}`,
      src: `assets/cards/mazo3/card${i + 1}.jpg`,
      alt: `Carta ${i + 1} del Dreams`,
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
