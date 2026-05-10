/**
 * STATE — Gestión del estado global de la aplicación
 */

const State = {
  activeDeck: null,        // mazo activo (modos flip/select)
  activePreset: null,      // preset activo { rows, cols }
  activeMode: "flip",      // "flip" | "select" | "build"

  // Modo flip/select
  boardCards: [],          // cartas shuffled del mazo activo
  flippedCards: new Set(), // IDs de cartas volteadas
  placedCards: {},         // { position: cardObject }

  // Modo build (drag & drop de mazos)
  buildLayout: {},         // { position: { deckId, cellMode } }
                           // cellMode: "flip" | "random"
  buildPlayed: {},         // { position: { card, flipped } } — estado de juego del build
  buildPhase: "design",    // "design" | "play"

  isFullscreen: false,

  init() {
    this.activeDeck   = window.DECKS[0];
    this.activePreset = window.PRESETS[0];
    this.shuffleBoard();
  },

  shuffleBoard() {
    const total = this.activePreset.rows * this.activePreset.cols;
    const pool  = [...this.activeDeck.cards];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    this.boardCards   = pool.slice(0, total);
    this.flippedCards = new Set();
    this.placedCards  = {};
  },

  reset() {
    this.flippedCards = new Set();
    this.placedCards  = {};
    this.buildLayout  = {};
    this.buildPlayed  = {};
    this.buildPhase   = "design";
    if (this.activeMode === "flip") this.shuffleBoard();
  },

  setDeck(deckId) {
    this.activeDeck = window.DECKS.find(d => d.id === deckId);
    this.shuffleBoard();
  },

  setPreset(preset) {
    this.activePreset = preset;
    this.shuffleBoard();
    this.buildLayout = {};
    this.buildPlayed = {};
    this.buildPhase  = "design";
  },

  setMode(mode) {
    this.activeMode = mode;
    this.reset();
  },

  toggleFlip(cardId) {
    if (this.flippedCards.has(cardId)) this.flippedCards.delete(cardId);
    else this.flippedCards.add(cardId);
  },

  placeCard(position, card)  { this.placedCards[position] = card; },
  removeCard(position)       { delete this.placedCards[position]; },

  /* ── Build mode helpers ── */
  setBuildCell(position, deckId, cellMode = "flip") {
    this.buildLayout[position] = { deckId, cellMode };
    delete this.buildPlayed[position]; // clear played state if reassigned
  },

  removeBuildCell(position) {
    delete this.buildLayout[position];
    delete this.buildPlayed[position];
  },

  setCellMode(position, cellMode) {
    if (this.buildLayout[position]) {
      this.buildLayout[position].cellMode = cellMode;
    }
  },

  // Called when entering play phase: assign a random card per cell
  prepareBuildPlay() {
    this.buildPlayed = {};
    // Track used cards per deck to avoid repeats
    const usedPerDeck = {};

    const total = this.activePreset.rows * this.activePreset.cols;
    for (let i = 0; i < total; i++) {
      const cell = this.buildLayout[i];
      if (!cell) continue;

      const deck = window.DECKS.find(d => d.id === cell.deckId);
      if (!deck) continue;

      if (!usedPerDeck[deck.id]) {
        // Shuffle deck cards once
        const pool = [...deck.cards];
        for (let k = pool.length - 1; k > 0; k--) {
          const j = Math.floor(Math.random() * (k + 1));
          [pool[k], pool[j]] = [pool[j], pool[k]];
        }
        usedPerDeck[deck.id] = pool;
      }

      const card = usedPerDeck[deck.id].pop() || deck.cards[0];

      this.buildPlayed[i] = {
        card,
        flipped: false, // siempre empieza oculta, sin importar el modo
      };
    }
    this.buildPhase = "play";
  },

  toggleBuildFlip(position) {
    if (this.buildPlayed[position]) {
      this.buildPlayed[position].flipped = !this.buildPlayed[position].flipped;
    }
  },
};

window.State = State;