/**
 * BOARD — Renderizado del tablero y lógica de interacción
 * Cubre: PRESET-001, MODE-001, MODE-002, CTRL-001
 */

const Board = {
  container: null,
  modal: null,
  selectedPosition: null,

  init() {
    this.container = document.getElementById("board");
    this.modal = document.getElementById("card-selector-modal");
    this.render();
  },

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
              <img src="${activeDeck.back}" alt="Dorso" onerror="this.parentElement.classList.add('placeholder-back')">
            </div>
            <div class="card-face card-front">
              <img src="${card.src}" alt="${card.alt}" onerror="this.parentElement.classList.add('placeholder-front')">
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
                <img src="${activeDeck.back}" alt="Dorso" onerror="this.parentElement.classList.add('placeholder-back')">
              </div>
              <div class="card-face card-front">
                <img src="${placed.src}" alt="${placed.alt}" onerror="this.parentElement.classList.add('placeholder-front')">
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

    // Animate cells in
    requestAnimationFrame(() => {
      this.container.querySelectorAll(".card-cell").forEach((cell, i) => {
        cell.style.animationDelay = `${i * 15}ms`;
        cell.classList.add("cell-enter");
      });
    });
  },

  handleFlip(cardId, cellEl) {
    State.toggleFlip(cardId);
    const inner = cellEl.querySelector(".card-inner");
    inner.classList.toggle("is-flipped");
  },

  openSelector(position) {
    this.selectedPosition = position;
    const { activeDeck, placedCards } = State;
    const usedIds = new Set(Object.values(placedCards).map(c => c.id));

    const grid = this.modal.querySelector(".modal-cards-grid");
    grid.innerHTML = "";

    activeDeck.cards.forEach(card => {
      const item = document.createElement("div");
      item.className = `modal-card-item ${usedIds.has(card.id) ? "in-use" : ""}`;
      item.innerHTML = `
        <img src="${card.src}" alt="${card.alt}" onerror="this.src=''; this.parentElement.classList.add('img-error')">
        ${usedIds.has(card.id) ? '<span class="in-use-badge">En uso</span>' : ""}
      `;
      item.addEventListener("click", () => {
        if (!usedIds.has(card.id)) {
          State.placeCard(position, card);
          this.closeSelector();
          this.render();
        }
      });
      grid.appendChild(item);
    });

    this.modal.classList.add("is-open");
    document.body.classList.add("modal-open");
  },

  closeSelector() {
    this.modal.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    this.selectedPosition = null;
  },
};

window.Board = Board;
