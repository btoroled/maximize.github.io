/**
 * CONTROLS — Selectores de mazo, modo, preset, reset, fullscreen y tableros personalizados
 * Cubre: DECK-002, MODE-003, PRESET-002, CTRL-001, FULL-001, FULL-002, CUSTOM-001, CUSTOM-002
 */

const Controls = {
  init() {
    this.buildDeckSelector();
    this.buildModeSelector();
    this.buildPresetSelector();
    this.initReset();
    this.initFullscreen();
    this.initCustomPreset();
    this.initModal();
    this.loadSavedPresets();
    this.updateDeckAccent();
  },

  /* ── DECK SELECTOR ── */
  buildDeckSelector() {
    const wrap = document.getElementById("deck-selector");
    wrap.innerHTML = "";
    window.DECKS.forEach(deck => {
      const btn = document.createElement("button");
      btn.className = `deck-btn ${deck.id === State.activeDeck.id ? "active" : ""}`;
      btn.dataset.deckId = deck.id;
      btn.style.setProperty("--deck-color", deck.color);
      btn.innerHTML = `
        <span class="deck-back-preview">
          <img src="${deck.back}" alt="${deck.name}" onerror="this.style.display='none'">
        </span>
        <span>${deck.name}</span>
      `;
      btn.addEventListener("click", () => {
        State.setDeck(deck.id);
        this.buildDeckSelector();
        this.updateDeckAccent();
        Board.render();
      });
      wrap.appendChild(btn);
    });
  },

  updateDeckAccent() {
    document.documentElement.style.setProperty("--accent", State.activeDeck.color);
  },

  /* ── MODE SELECTOR ── */
  buildModeSelector() {
    const btns = document.querySelectorAll("[data-mode]");
    btns.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.mode === State.activeMode);
      btn.addEventListener("click", () => {
        State.setMode(btn.dataset.mode);
        btns.forEach(b => b.classList.toggle("active", b.dataset.mode === State.activeMode));
        Board.render();
      });
    });
  },

  /* ── PRESET SELECTOR ── */
  buildPresetSelector() {
    const wrap = document.getElementById("preset-selector");
    // Clear only preset buttons (not the custom input row)
    wrap.querySelectorAll(".preset-btn").forEach(b => b.remove());

    const allPresets = [
      ...window.PRESETS,
      ...this.getSavedPresets(),
    ];

    allPresets.forEach(preset => {
      const btn = document.createElement("button");
      btn.className = `preset-btn ${preset.id === State.activePreset?.id ? "active" : ""}`;
      btn.dataset.presetId = preset.id;
      btn.textContent = preset.label;

      if (preset.saved) {
        const del = document.createElement("span");
        del.className = "preset-delete";
        del.title = "Eliminar";
        del.textContent = "×";
        del.addEventListener("click", (e) => {
          e.stopPropagation();
          this.deleteSavedPreset(preset.id);
          this.buildPresetSelector();
        });
        btn.appendChild(del);
      }

      btn.addEventListener("click", () => {
        const total = preset.rows * preset.cols;
        const deckSize = State.activeDeck.cards.length;
        if (total > deckSize) {
          this.showToast(`⚠️ El mazo solo tiene ${deckSize} cartas. El tablero necesita ${total}.`);
        }
        State.setPreset(preset);
        wrap.querySelectorAll(".preset-btn").forEach(b =>
          b.classList.toggle("active", b.dataset.presetId === preset.id)
        );
        Board.render();
      });

      // Insert before custom row
      const customRow = wrap.querySelector(".custom-preset-row");
      wrap.insertBefore(btn, customRow);
    });
  },

  /* ── RESET ── */
  initReset() {
    const btn = document.getElementById("btn-reset");
    btn.addEventListener("click", () => {
      const dialog = document.getElementById("confirm-dialog");
      dialog.classList.add("is-open");

      document.getElementById("confirm-yes").onclick = () => {
        State.reset();
        Board.render();
        dialog.classList.remove("is-open");
      };
      document.getElementById("confirm-no").onclick = () => {
        dialog.classList.remove("is-open");
      };
    });
  },

  /* ── FULLSCREEN ── */
  initFullscreen() {
    const btn = document.getElementById("btn-fullscreen");
    const app = document.getElementById("app");

    btn.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        app.requestFullscreen().catch(err => console.warn(err));
      } else {
        document.exitFullscreen();
      }
    });

    document.addEventListener("fullscreenchange", () => {
      const isFs = !!document.fullscreenElement;
      State.isFullscreen = isFs;
      document.body.classList.toggle("is-fullscreen", isFs);
      btn.title = isFs ? "Salir de pantalla completa" : "Pantalla completa";
      btn.querySelector(".fs-icon").textContent = isFs ? "⛶" : "⛶";
    });
  },

  /* ── CUSTOM PRESET ── */
  initCustomPreset() {
    const applyBtn = document.getElementById("custom-apply");
    applyBtn.addEventListener("click", () => {
      const rows = parseInt(document.getElementById("custom-rows").value, 10);
      const cols = parseInt(document.getElementById("custom-cols").value, 10);

      if (!rows || !cols || rows < 1 || cols < 1 || rows > 9 || cols > 9) {
        this.showToast("⚠️ Filas y columnas deben ser entre 1 y 9.");
        return;
      }

      const preset = {
        id: `custom-${rows}x${cols}-${Date.now()}`,
        label: `${rows}×${cols}`,
        rows,
        cols,
      };

      const total = rows * cols;
      const deckSize = State.activeDeck.cards.length;
      if (total > deckSize) {
        this.showToast(`⚠️ El mazo solo tiene ${deckSize} cartas. Se necesitan ${total}.`);
      }

      State.setPreset(preset);
      this.buildPresetSelector();
      Board.render();
    });

    const saveBtn = document.getElementById("custom-save");
    saveBtn.addEventListener("click", () => {
      const rows = parseInt(document.getElementById("custom-rows").value, 10);
      const cols = parseInt(document.getElementById("custom-cols").value, 10);
      const name = document.getElementById("custom-name").value.trim();

      if (!rows || !cols || rows < 1 || cols < 1 || rows > 9 || cols > 9) {
        this.showToast("⚠️ Ingresa valores válidos antes de guardar.");
        return;
      }

      const label = name || `${rows}×${cols}`;
      const preset = {
        id: `saved-${Date.now()}`,
        label,
        rows,
        cols,
        saved: true,
      };

      this.savePreset(preset);
      this.buildPresetSelector();
      this.showToast(`✅ Tablero "${label}" guardado.`);
    });
  },

  /* ── MODAL CLOSE ── */
  initModal() {
    document.getElementById("modal-close").addEventListener("click", () => {
      Board.closeSelector();
    });
    document.getElementById("card-selector-modal").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) Board.closeSelector();
    });
  },

  /* ── LOCALSTORAGE PRESETS ── */
  getSavedPresets() {
    try {
      return JSON.parse(localStorage.getItem("fototerapia-presets") || "[]");
    } catch { return []; }
  },

  savePreset(preset) {
    const saved = this.getSavedPresets();
    saved.push(preset);
    localStorage.setItem("fototerapia-presets", JSON.stringify(saved));
  },

  deleteSavedPreset(id) {
    const saved = this.getSavedPresets().filter(p => p.id !== id);
    localStorage.setItem("fototerapia-presets", JSON.stringify(saved));
  },

  loadSavedPresets() {
    // Already loaded via buildPresetSelector
  },

  /* ── TOAST ── */
  showToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
  },
};

window.Controls = Controls;
