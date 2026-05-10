/**
 * BOARD — Tres modos: Voltear, Seleccionar, Construir (drag & drop de mazos)
 */

const Board = {
  container: null,
  modal: null,
  selectedPosition: null,
  slider: { cards: [], index: 0 },

  init() {
    this.container = document.getElementById("board");
    this.modal     = document.getElementById("card-selector-modal");
    this.render();
  },

  /* ════════════════════════════════
     RENDER PRINCIPAL
  ════════════════════════════════ */
  render() {
    const { activePreset, activeMode } = State;
    const { rows, cols } = activePreset;
    const total = rows * cols;

    this.container.style.setProperty("--cols", cols);
    this.container.style.setProperty("--rows", rows);
    document.documentElement.style.setProperty("--cols", cols);
    document.documentElement.style.setProperty("--rows", rows);
    this.container.innerHTML = "";

    // Show/hide build toolbar
    const toolbar = document.getElementById("build-toolbar");
    if (toolbar) toolbar.classList.toggle("active", activeMode === "build");

    for (let i = 0; i < total; i++) {
      const cell = document.createElement("div");
      cell.className = "card-cell";
      cell.dataset.position = i;

      if (activeMode === "flip") {
        this._renderFlipCell(cell, i);
      } else if (activeMode === "select") {
        this._renderSelectCell(cell, i);
      } else if (activeMode === "build") {
        this._renderBuildCell(cell, i);
      }

      this.container.appendChild(cell);
    }

    requestAnimationFrame(() => {
      this.container.querySelectorAll(".card-cell").forEach((c, i) => {
        c.style.animationDelay = `${i * 10}ms`;
        c.classList.add("cell-enter");
      });
    });
  },

  /* ── MODO VOLTEAR ── */
  _renderFlipCell(cell, i) {
    const { activeDeck, boardCards, flippedCards } = State;
    const card = boardCards[i];
    if (!card) return;
    const isFlipped = flippedCards.has(card.id);
    cell.innerHTML = `
      <div class="card-inner ${isFlipped ? "is-flipped" : ""}">
        <div class="card-face card-back">
          <img src="${activeDeck.back}" alt="Dorso" onerror="this.parentElement.classList.add('placeholder-back')">
        </div>
        <div class="card-face card-front">
          <img src="${card.src}" alt="${card.alt}" onerror="this.parentElement.classList.add('placeholder-front')">
        </div>
      </div>`;
    cell.addEventListener("click", () => {
      State.toggleFlip(card.id);
      cell.querySelector(".card-inner").classList.toggle("is-flipped");
    });
  },

  /* ── MODO SELECCIONAR ── */
  _renderSelectCell(cell, i) {
    const { activeDeck, placedCards } = State;
    const placed = placedCards[i];
    if (placed) {
      cell.classList.add("has-card");
      cell.innerHTML = `
        <div class="card-inner is-flipped">
          <div class="card-face card-back">
            <img src="${activeDeck.back}" alt="Dorso" onerror="this.parentElement.classList.add('placeholder-back')">
          </div>
          <div class="card-face card-front">
            <img src="${placed.src}" alt="${placed.alt}" onerror="this.parentElement.classList.add('placeholder-front')">
          </div>
        </div>
        <button class="remove-card-btn" title="Quitar">✕</button>`;
      cell.querySelector(".remove-card-btn").addEventListener("click", (e) => {
        e.stopPropagation(); State.removeCard(i); this.render();
      });
      cell.addEventListener("click", () => this.openSelector(i));
    } else {
      cell.classList.add("empty-cell");
      cell.innerHTML = `<div class="empty-placeholder"><span class="plus-icon">+</span><span class="empty-label">Elegir carta</span></div>`;
      cell.addEventListener("click", () => this.openSelector(i));
    }
  },

  /* ════════════════════════════════
     MODO BUILD — DISEÑO + JUEGO
  ════════════════════════════════ */
  _renderBuildCell(cell, i) {
    const { buildLayout, buildPlayed, buildPhase } = State;
    const layout = buildLayout[i];

    if (buildPhase === "design") {
      /* ── FASE DISEÑO: muestra dorso del mazo asignado o celda vacía ── */
      if (layout) {
        const deck = window.DECKS.find(d => d.id === layout.deckId);
        cell.classList.add("build-assigned");
        cell.innerHTML = `
          <div class="build-cell-inner">
            <img src="${deck.back}" alt="${deck.name}" class="build-dorso"
                 onerror="this.parentElement.classList.add('placeholder-back')">
            <div class="build-cell-overlay">
              <span class="build-deck-name">${deck.name}</span>
              <div class="build-cell-controls">
                <button class="cell-mode-btn ${layout.cellMode === 'flip' ? 'active' : ''}"
                        data-mode="flip" title="Voltear al click">🂠</button>
                <button class="cell-mode-btn ${layout.cellMode === 'random' ? 'active' : ''}"
                        data-mode="random" title="Carta random">🎲</button>
                <button class="cell-remove-btn" title="Quitar mazo">✕</button>
              </div>
            </div>
          </div>`;

        cell.querySelectorAll(".cell-mode-btn").forEach(btn => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            State.setCellMode(i, btn.dataset.mode);
            this.render();
          });
        });
        cell.querySelector(".cell-remove-btn").addEventListener("click", (e) => {
          e.stopPropagation();
          State.removeBuildCell(i);
          this.render();
        });

        // Also allow re-drop to reassign
        this._bindBuildDrop(cell, i);

      } else {
        /* celda vacía — drop target */
        cell.classList.add("empty-cell", "build-empty");
        cell.innerHTML = `
          <div class="empty-placeholder">
            <span class="build-drop-icon">↓</span>
            <span class="empty-label">Arrastra un mazo</span>
          </div>`;
        this._bindBuildDrop(cell, i);
      }

    } else {
      /* ── FASE JUEGO: muestra dorso o carta según estado ── */
      const played = buildPlayed[i];
      if (!layout || !played) {
        // Empty cell with no assigned deck
        cell.classList.add("empty-cell");
        cell.innerHTML = `<div class="empty-placeholder"><span style="font-size:1.2rem">—</span></div>`;
        return;
      }

      const deck = window.DECKS.find(d => d.id === layout.deckId);
      const isFlipped = played.flipped;

      cell.innerHTML = `
        <div class="card-inner ${isFlipped ? "is-flipped" : ""}">
          <div class="card-face card-back">
            <img src="${deck.back}" alt="${deck.name}" onerror="this.parentElement.classList.add('placeholder-back')">
          </div>
          <div class="card-face card-front">
            <img src="${played.card.src}" alt="${played.card.alt}" onerror="this.parentElement.classList.add('placeholder-front')">
          </div>
        </div>`;

      // Both modes respond to click — random just reveals a pre-assigned random card
      cell.style.cursor = "pointer";
      cell.addEventListener("click", () => {
        State.toggleBuildFlip(i);
        cell.querySelector(".card-inner").classList.toggle("is-flipped");
      });
    }
  },

  /* ── Drag source: deck palette buttons ── */
  bindDeckPalette() {
    const palette = document.getElementById("deck-palette");
    if (!palette) return;

    palette.innerHTML = "";
    window.DECKS.forEach(deck => {
      const el = document.createElement("div");
      el.className = "palette-deck";
      el.dataset.deckId = deck.id;
      el.innerHTML = `
        <img src="${deck.back}" alt="${deck.name}" onerror="this.parentElement.classList.add('palette-error')">
        <span class="palette-label">${deck.name}</span>`;
      this._bindPaletteDrag(el, deck);
      palette.appendChild(el);
    });
  },

  _bindPaletteDrag(el, deck) {
    let ghostEl = null;

    const createGhost = (x, y) => {
      ghostEl = document.createElement("div");
      ghostEl.className = "build-drag-ghost";
      ghostEl.innerHTML = `<img src="${deck.back}" alt="${deck.name}">`;
      ghostEl.style.left = `${x - 40}px`;
      ghostEl.style.top  = `${y - 30}px`;
      document.body.appendChild(ghostEl);
    };

    const moveGhost = (x, y) => {
      if (!ghostEl) return;
      ghostEl.style.left = `${x - 40}px`;
      ghostEl.style.top  = `${y - 30}px`;
    };

    const removeGhost = () => { ghostEl?.remove(); ghostEl = null; };

    const highlight = (x, y) => {
      this.container.querySelectorAll(".build-drop-target").forEach(c => c.classList.remove("build-drop-target"));
      const target = document.elementFromPoint(x, y)?.closest(".card-cell");
      if (target) target.classList.add("build-drop-target");
    };

    const dropAt = (x, y) => {
      this.container.querySelectorAll(".build-drop-target").forEach(c => c.classList.remove("build-drop-target"));
      const target = document.elementFromPoint(x, y)?.closest(".card-cell");
      if (!target) return;
      const pos = parseInt(target.dataset.position);
      if (isNaN(pos)) return;
      const existingMode = State.buildLayout[pos]?.cellMode || "flip";
      State.setBuildCell(pos, deck.id, existingMode);
      this.render();
    };

    // Mouse
    el.addEventListener("mousedown", (e) => {
      e.preventDefault();
      el.classList.add("dragging");
      createGhost(e.clientX, e.clientY);
      const onMove = (ev) => { moveGhost(ev.clientX, ev.clientY); highlight(ev.clientX, ev.clientY); };
      const onUp   = (ev) => {
        dropAt(ev.clientX, ev.clientY);
        el.classList.remove("dragging");
        removeGhost();
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });

    // Touch
    el.addEventListener("touchstart", (e) => {
      e.preventDefault();
      el.classList.add("dragging");
      createGhost(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });

    el.addEventListener("touchmove", (e) => {
      e.preventDefault();
      moveGhost(e.touches[0].clientX, e.touches[0].clientY);
      highlight(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });

    el.addEventListener("touchend", (e) => {
      e.preventDefault();
      dropAt(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      el.classList.remove("dragging");
      removeGhost();
    });
  },

  _bindBuildDrop(cell, position) {
    // Handled by palette drag drop — nothing extra needed
    // (drop logic is in _bindPaletteDrag → dropAt)
  },

  /* ── Play / Design toggle ── */
  startBuildPlay() {
    const total = State.activePreset.rows * State.activePreset.cols;
    const assigned = Object.keys(State.buildLayout).length;
    if (assigned === 0) {
      Controls.showToast("⚠️ Asigna al menos un mazo al tablero primero.");
      return;
    }
    State.prepareBuildPlay();
    this.render();
    this._updateBuildPhaseUI();
  },

  returnToDesign() {
    State.buildPhase = "design";
    State.buildPlayed = {};
    this.render();
    this._updateBuildPhaseUI();
  },

  _updateBuildPhaseUI() {
    const btnPlay   = document.getElementById("btn-build-play");
    const btnDesign = document.getElementById("btn-build-design");
    const palette   = document.getElementById("deck-palette");
    const isPlay    = State.buildPhase === "play";

    if (btnPlay)   btnPlay.classList.toggle("hidden", isPlay);
    if (btnDesign) btnDesign.classList.toggle("hidden", !isPlay);
    if (palette)   palette.classList.toggle("hidden", isPlay);
  },

  /* ════════════════════════════════
     SLIDER (Modo Seleccionar)
  ════════════════════════════════ */
  openSelector(position) {
    this.selectedPosition = position;
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
    const track   = this.modal.querySelector(".slider-track");
    const counter = this.modal.querySelector(".modal-counter");
    const btnPrev = this.modal.querySelector(".slider-nav.prev");
    const btnNext = this.modal.querySelector(".slider-nav.next");
    const btnSel  = this.modal.querySelector(".slider-select-btn");
    const dotsEl  = this.modal.querySelector(".slider-dots");

    track.innerHTML = "";
    cards.forEach((card, i) => {
      const el = document.createElement("div");
      el.className = `slider-card ${usedIds.has(card.id) ? "in-use" : ""} ${i === index ? "center-card" : ""}`;
      el.innerHTML = `
        <img src="${card.src}" alt="${card.alt}" onerror="this.style.display='none'">
        ${usedIds.has(card.id) ? '<span class="in-use-badge">En uso</span>' : ""}`;
      if (!usedIds.has(card.id)) {
        el.addEventListener("click", () => {
          if (i === index) this.selectCurrent();
          else { this.slider.index = i; this.renderSlider(); }
        });
      }
      track.appendChild(el);
    });

    this._slideTo(index);
    counter.textContent = `${index + 1} / ${cards.length}`;
    btnPrev.disabled = index === 0;
    btnNext.disabled = index === cards.length - 1;

    const cur = cards[index];
    const inUse = usedIds.has(cur?.id);
    btnSel.disabled = inUse;
    btnSel.textContent = inUse ? "En uso" : "Colocar carta";

    // Dots
    dotsEl.innerHTML = "";
    const maxDots = 9, total = cards.length;
    const half  = Math.floor(maxDots / 2);
    const start = total <= maxDots ? 0 : Math.max(0, Math.min(index - half, total - maxDots));
    const end   = Math.min(start + maxDots, total);
    for (let i = start; i < end; i++) {
      const dot = document.createElement("div");
      dot.className = `slider-dot ${i === index ? "active" : ""}`;
      dotsEl.appendChild(dot);
    }
  },

  _slideTo(index) {
    const track = this.modal.querySelector(".slider-track");
    const cards = track.querySelectorAll(".slider-card");
    if (!cards.length) return;
    const wrapWidth = this.modal.querySelector(".slider-track-wrap").offsetWidth;
    const cardWidth = cards[index]?.offsetWidth || cards[0].offsetWidth;
    const gap = 12;
    track.style.transform = `translateX(${(wrapWidth / 2) - (cardWidth / 2) - (index * (cardWidth + gap))}px)`;
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

  bindSliderNav() {
    const btnPrev = this.modal.querySelector(".slider-nav.prev");
    const btnNext = this.modal.querySelector(".slider-nav.next");
    const btnSel  = this.modal.querySelector(".slider-select-btn");

    btnPrev.addEventListener("click", () => {
      if (this.slider.index > 0) { this.slider.index--; this.renderSlider(); }
    });
    btnNext.addEventListener("click", () => {
      if (this.slider.index < this.slider.cards.length - 1) { this.slider.index++; this.renderSlider(); }
    });
    btnSel.addEventListener("click", () => this.selectCurrent());

    document.addEventListener("keydown", (e) => {
      if (!this.modal.classList.contains("is-open")) return;
      if (e.key === "ArrowLeft")  btnPrev.click();
      if (e.key === "ArrowRight") btnNext.click();
      if (e.key === "Enter")      btnSel.click();
      if (e.key === "Escape")     this.closeSelector();
    });
  },
};



window.Board = Board;