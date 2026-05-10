/**
 * STATE — Gestión del estado global de la aplicación
 */

const State = {
  activeDeck: null,       // objeto del mazo activo
  activePreset: null,     // objeto del preset activo { rows, cols } 
  activeMode: "flip",     // "flip" | "select"
  boardCards: [],         // array de cartas en el tablero (shuffled)
  flippedCards: new Set(),// IDs de cartas volteadas (modo flip)
  placedCards: {},        // { position: cardObject } (modo select)
  isFullscreen: false,

  init() {
    this.activeDeck = window.DECKS[0];
    this.activePreset = window.PRESETS[0];
    this.shuffleBoard();
  },

  shuffleBoard() {
    const total = this.activePreset.rows * this.activePreset.cols;
    const pool = [...this.activeDeck.cards];
    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    this.boardCards = pool.slice(0, total);
    this.flippedCards = new Set();
    this.placedCards = {};
  },

  reset() {
    this.flippedCards = new Set();
    this.placedCards = {};
    // re-shuffle in flip mode; keep positions in select mode
    if (this.activeMode === "flip") {
      this.shuffleBoard();
    }
  },

  setDeck(deckId) {
    this.activeDeck = window.DECKS.find(d => d.id === deckId);
    this.shuffleBoard();
  },

  setPreset(preset) {
    this.activePreset = preset;
    this.shuffleBoard();
  },

  setMode(mode) {
    this.activeMode = mode;
    this.reset();
  },

  toggleFlip(cardId) {
    if (this.flippedCards.has(cardId)) {
      this.flippedCards.delete(cardId);
    } else {
      this.flippedCards.add(cardId);
    }
  },

  placeCard(position, card) {
    this.placedCards[position] = card;
  },

  removeCard(position) {
    delete this.placedCards[position];
  },
};

window.State = State;
