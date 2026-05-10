/**
 * CONTROLS — Selectores, fullscreen, dark mode, presets personalizados
 * Tarea 4: modo claro/oscuro (sistema + toggle manual)
 */

const Controls = {
  init() {
    this.initTheme();
    this.buildDeckSelector();
    this.buildModeSelector();
    this.buildPresetSelector();
    this.initReset();
    this.initFullscreen();
    this.initCustomPreset();
    this.initModal();
    this.updateDeckAccent();
    Board.bindSliderNav();
    Board.bindDeckPalette();
  },

  /* ── TEMA CLARO / OSCURO ── */
  initTheme() {
    const btn = document.getElementById("btn-theme");

    // Detectar preferencia guardada o del sistema
    const saved = localStorage.getItem("fototerapia-theme");
    if (saved) {
      document.documentElement.setAttribute("data-theme", saved);
    }

    this.updateThemeIcon();

    btn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

      let next;
      if (!current) {
        // Sin preferencia manual → activar el opuesto al sistema
        next = systemDark ? "light" : "dark";
      } else if (current === "dark") {
        next = "light";
      } else {
        next = "dark";
      }

      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("fototerapia-theme", next);
      this.updateThemeIcon();
    });

    // Escuchar cambios del sistema operativo
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (!localStorage.getItem("fototerapia-theme")) {
        this.updateThemeIcon();
      }
    });
  },

  updateThemeIcon() {
    const btn = document.getElementById("btn-theme");
    const theme = document.documentElement.getAttribute("data-theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = theme === "dark" || (!theme && systemDark);
    btn.textContent = isDark ? "☀️" : "🌙";
    btn.title = isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
  },

  /* ── DECK SELECTOR — dorsos grandes ── */
  buildDeckSelector() {
    const wrap = document.getElementById("deck-selector");
    wrap.innerHTML = "";
    window.DECKS.forEach(deck => {
      const btn = document.createElement("button");
      btn.className = `deck-btn ${deck.id === State.activeDeck.id ? "active" : ""}`;
      btn.dataset.deckId = deck.id;
      btn.innerHTML = `
        <span class="deck-back-preview">
          <img src="${deck.back}" alt="${deck.name}" onerror="this.parentElement.style.background='var(--bg2)'">
        </span>
        <span class="deck-label">${deck.name}</span>
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
        if (btn.dataset.mode === "build") Board.bindDeckPalette();
      });
    });
  },

  /* ── PRESET SELECTOR ── */
  buildPresetSelector() {
    const wrap = document.getElementById("preset-selector");
    wrap.querySelectorAll(".preset-btn").forEach(b => b.remove());

    const allPresets = [...window.PRESETS, ...this.getSavedPresets()];

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
          this.showToast(`⚠️ El mazo solo tiene ${deckSize} cartas. Necesitas ${total}.`);
        }
        State.setPreset(preset);
        wrap.querySelectorAll(".preset-btn").forEach(b =>
          b.classList.toggle("active", b.dataset.presetId === preset.id)
        );
        Board.render();
      });

      wrap.insertBefore(btn, wrap.querySelector(".custom-preset-row"));
    });
  },

  /* ── RESET ── */
  initReset() {
    document.getElementById("btn-reset").addEventListener("click", () => {
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
    });
  },

  /* ── CUSTOM PRESET ── */
  initCustomPreset() {
    document.getElementById("custom-apply").addEventListener("click", () => {
      const rows = parseInt(document.getElementById("custom-rows").value, 10);
      const cols = parseInt(document.getElementById("custom-cols").value, 10);
      if (!rows || !cols || rows < 1 || cols < 1 || rows > 9 || cols > 9) {
        this.showToast("⚠️ Filas y columnas deben ser entre 1 y 9.");
        return;
      }
      const total = rows * cols;
      if (total > State.activeDeck.cards.length) {
        this.showToast(`⚠️ El mazo solo tiene ${State.activeDeck.cards.length} cartas.`);
      }
      State.setPreset({ id: `custom-${rows}x${cols}`, label: `${rows}×${cols}`, rows, cols });
      this.buildPresetSelector();
      Board.render();
    });

    document.getElementById("custom-save").addEventListener("click", () => {
      const rows = parseInt(document.getElementById("custom-rows").value, 10);
      const cols = parseInt(document.getElementById("custom-cols").value, 10);
      const name = document.getElementById("custom-name").value.trim();
      if (!rows || !cols || rows < 1 || cols < 1 || rows > 9 || cols > 9) {
        this.showToast("⚠️ Ingresa valores válidos antes de guardar.");
        return;
      }
      const label = name || `${rows}×${cols}`;
      this.savePreset({ id: `saved-${Date.now()}`, label, rows, cols, saved: true });
      this.buildPresetSelector();
      this.showToast(`✅ "${label}" guardado.`);
    });
  },

  /* ── MODAL ── */
  initModal() {
    document.getElementById("modal-close").addEventListener("click", () => Board.closeSelector());
    document.getElementById("card-selector-modal").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) Board.closeSelector();
    });
  },

  /* ── LOCALSTORAGE ── */
  getSavedPresets() {
    try { return JSON.parse(localStorage.getItem("fototerapia-presets") || "[]"); }
    catch { return []; }
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

  /* ── TOAST ── */
  showToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
  },
};

window.Controls = Controls;