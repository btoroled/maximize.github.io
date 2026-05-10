/**
 * BOARD — Renderizado del tablero y lógica de interacción
 * Tarea 1: ratio correcto 1980×1535 (horizontal)
 * Tarea 2 & 3: modal como slider con orden random
 */

const Board = {
  container: null,
  modal: null,
  selectedPosition: null,

  // Slider state
  slider: {
    cards: [],         // cartas shuffled del mazo activo
    index: 0,         // índice de la carta central visible
    visibleCount: 3,  // cuántas cartas mostrar a la vez
  },

  init() {
    this.container = document.getElementById("board");
    this.modal = document.getElementById("card-selector-modal");
    this.render();
  },

  /* ════════════════════════════════
     TABLERO
  ════════════════════════════════ */
  render() {
    const { activePreset, activeMode, activeDeck, boardCards, flippedCards, placedCards } = State;
    const { rows, cols } = activePreset;
    const total = rows * cols;

    this.container.style.setProperty("--cols", cols);
    this.container.style.setProperty("--rows", rows);
    this.container.innerHTML = "";

    for (let i = 0; i < total; i++) {
      const cell = document.createElement("div");
      cell.className = "card-cell";
      cell.dataset.position = i;

      if (activeMode === "flip") {
        const card = boardCards[i];
        if (!card) continue;
        const isFlipped = flippedCards.has(card.id);

        cell.innerHTML = `
          <div class="card-inner ${isFlipped ? "is-flipped" : ""}">
            <div class="card-face card-back">
              <img src="${activeDeck.back}" alt="Dorso"
                   onerror="this.parentElement.classList.add('placeholder-back')">
            </div>
            <div class="card-face card-front">
              <img src="${card.src}" alt="${card.alt}"
                   onerror="this.parentElement.classList.add('placeholder-front')">
            </div>
          </div>
        `;
        cell.addEventListener("click", () => this.handleFlip(card.id, cell));

      } else {
        // Modo selección
        const placed = placedCards[i];
        if (placed) {
          cell.classList.add("has-card");
          cell.innerHTML = `
            <div class="card-inner is-flipped">
              <div class="card-face card-back">
                <img src="${activeDeck.back}" alt="Dorso"
                     onerror="this.parentElement.classList.add('placeholder-back')">
              </div>
              <div class="card-face card-front">
                <img src="${placed.src}" alt="${placed.alt}"
                     onerror="this.parentElement.classList.add('placeholder-front')">
              </div>
            </div>
            <button class="remove-card-btn" title="Quitar carta">✕</button>
          `;
          cell.querySelector(".remove-card-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            State.removeCard(i);
            this.render();
          });
          cell.addEventListener("click", () => this.openSelector(i));
        } else {
          cell.classList.add("empty-cell");
          cell.innerHTML = `
            <div class="empty-placeholder">
              <span class="plus-icon">+</span>
              <span class="empty-label">Elegir carta</span>
            </div>
          `;
          cell.addEventListener("click", () => this.openSelector(i));
        }
      }

      this.container.appendChild(cell);
    }

    // Animate cells in staggered
    requestAnimationFrame(() => {
      this.container.querySelectorAll(".card-cell").forEach((cell, i) => {
        cell.style.animationDelay = `${i * 12}ms`;
        cell.classList.add("cell-enter");
      });
    });
  },

  handleFlip(cardId, cellEl) {
    State.toggleFlip(cardId);
    const inner = cellEl.querySelector(".card-inner");
    inner.classList.toggle("is-flipped");
  },

  /* ════════════════════════════════
     SLIDER (Modo Selección)
  ════════════════════════════════ */
  openSelector(position) {
    this.selectedPosition = position;

    // Shuffle las cartas del mazo activo (Tarea 3: orden random)
    const pool = [...State.activeDeck.cards];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    this.slider.cards = pool;
    this.slider.index = 0;

    this.renderSlider();
    this.modal.classList.add("is-open");
    document.body.classList.add("modal-open");
  },

  renderSlider() {
    const { cards, index } = this.slider;
    const usedIds = new Set(Object.values(State.placedCards).map(c => c.id));

    const track = this.modal.querySelector(".slider-track");
    const counter = this.modal.querySelector(".modal-counter");
    const btnPrev = this.modal.querySelector(".slider-nav.prev");
    const btnNext = this.modal.querySelector(".slider-nav.next");
    const btnSelect = this.modal.querySelector(".slider-select-btn");
    const dotsEl = this.modal.querySelector(".slider-dots");

    // Build cards
    track.innerHTML = "";
    cards.forEach((card, i) => {
      const el = document.createElement("div");
      el.className = `slider-card ${usedIds.has(card.id) ? "in-use" : ""} ${i === index ? "center-card" : ""}`;
      el.dataset.cardIdx = i;
      el.innerHTML = `
        <img src="${card.src}" alt="${card.alt}"
             onerror="this.style.display='none'; this.parentElement.classList.add('img-error')">
        ${usedIds.has(card.id) ? '<span class="in-use-badge">En uso</span>' : ""}
      `;

      if (!usedIds.has(card.id)) {
        el.addEventListener("click", () => {
          if (i === index) {
            this.selectCurrent();
          } else {
            this.slider.index = i;
            this.renderSlider();
          }
        });
      }
      track.appendChild(el);
    });

    // Slide to center the active card
    this._slideTo(index);

    // Counter
    counter.textContent = `${index + 1} / ${cards.length}`;

    // Nav buttons
    btnPrev.disabled = index === 0;
    btnNext.disabled = index === cards.length - 1;

    // Select button
    const currentCard = cards[index];
    const isInUse = usedIds.has(currentCard.id);
    btnSelect.disabled = isInUse;
    btnSelect.textContent = isInUse ? "En uso" : "Colocar carta";

    // Dots (max 9 visible)
    dotsEl.innerHTML = "";
    const maxDots = 9;
    const total = cards.length;
    if (total <= maxDots) {
      cards.forEach((_, i) => {
        const dot = document.createElement("div");
        dot.className = `slider-dot ${i === index ? "active" : ""}`;
        dotsEl.appendChild(dot);
      });
    } else {
      // Show relative dots around active
      const half = Math.floor(maxDots / 2);
      const start = Math.max(0, Math.min(index - half, total - maxDots));
      for (let i = start; i < start + maxDots; i++) {
        const dot = document.createElement("div");
        dot.className = `slider-dot ${i === index ? "active" : ""}`;
        dotsEl.appendChild(dot);
      }
    }
  },

  _slideTo(index) {
    const track = this.modal.querySelector(".slider-track");
    const cards = track.querySelectorAll(".slider-card");
    if (!cards.length) return;

    const trackWrap = this.modal.querySelector(".slider-track-wrap");
    const wrapWidth = trackWrap.offsetWidth;
    const cardWidth = cards[0].offsetWidth;
    const gap = 12;

    // Center the active card
    const offset = (wrapWidth / 2) - (cardWidth / 2) - (index * (cardWidth + gap));
    track.style.transform = `translateX(${offset}px)`;
  },

  selectCurrent() {
    const card = this.slider.cards[this.slider.index];
    const usedIds = new Set(Object.values(State.placedCards).map(c => c.id));
    if (usedIds.has(card.id)) return;

    State.placeCard(this.selectedPosition, card);
    this.closeSelector();
    this.render();
  },

  closeSelector() {
    this.modal.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    this.selectedPosition = null;
  },

  // Called by Controls to bind nav buttons
  bindSliderNav() {
    const btnPrev = this.modal.querySelector(".slider-nav.prev");
    const btnNext = this.modal.querySelector(".slider-nav.next");
    const btnSelect = this.modal.querySelector(".slider-select-btn");

    btnPrev.addEventListener("click", () => {
      if (this.slider.index > 0) {
        this.slider.index--;
        this.renderSlider();
      }
    });

    btnNext.addEventListener("click", () => {
      if (this.slider.index < this.slider.cards.length - 1) {
        this.slider.index++;
        this.renderSlider();
      }
    });

    btnSelect.addEventListener("click", () => this.selectCurrent());

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (!this.modal.classList.contains("is-open")) return;
      if (e.key === "ArrowLeft") { btnPrev.click(); }
      if (e.key === "ArrowRight") { btnNext.click(); }
      if (e.key === "Enter") { btnSelect.click(); }
      if (e.key === "Escape") { this.closeSelector(); }
    });
  },
};

window.Board = Board;
