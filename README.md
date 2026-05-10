# 🃏 Fototerapia — Cartas digitales

Herramienta web para el uso de cartas de fototerapia en sesiones terapéuticas.
Funciona completamente en el navegador, sin servidor, y puede desplegarse en **GitHub Pages**.

---

## Características

- **3 mazos** con dorsos independientes
- **Modo Voltear**: las cartas muestran el dorso y se revelan al hacer clic
- **Modo Seleccionar**: elige manualmente qué carta colocar en cada posición
- **Presets de grilla**: 3×3 y 9×9 incluidos
- **Tableros personalizados**: crea y guarda tus propias dimensiones
- **Reset** del tablero con confirmación
- **Pantalla completa** (Fullscreen API)
- Responsive para tablet y móvil

---

## Estructura de carpetas

```
/
├── index.html
├── css/
│   └── main.css
├── js/
│   ├── decks.js       ← Define los mazos y presets
│   ├── state.js       ← Estado global
│   ├── board.js       ← Renderizado del tablero
│   ├── controls.js    ← Controles UI
│   └── main.js        ← Entrada
└── assets/
    ├── backs/
    │   ├── back1.jpg  ← Dorso del Mazo 1
    │   ├── back2.jpg  ← Dorso del Mazo 2
    │   └── back3.jpg  ← Dorso del Mazo 3
    └── cards/
        ├── mazo1/
        │   ├── card1.jpg
        │   ├── card2.jpg
        │   └── ...
        ├── mazo2/
        │   └── ...
        └── mazo3/
            └── ...
```

---

## Agregar tus imágenes

1. Coloca las imágenes de dorso en `assets/backs/` con nombres `back1.jpg`, `back2.jpg`, `back3.jpg`.
2. Coloca las cartas de cada mazo en su carpeta: `assets/cards/mazo1/card1.jpg`, etc.
3. Si tienes más o menos de 60 cartas por mazo, edita el número en `js/decks.js`:

```js
// En decks.js, cambia el 60 por el número real de cartas:
cards: Array.from({ length: 60 }, (_, i) => ({ ... }))
```

---

## Deploy en GitHub Pages

### Primera vez

```bash
# 1. Crea el repositorio en GitHub (público)

# 2. Clona e inicializa
git clone https://github.com/TU_USUARIO/fototerapia.git
cd fototerapia

# 3. Copia todos los archivos del proyecto aquí

# 4. Commit y push
git add .
git commit -m "Initial commit"
git push origin main
```

### Activar GitHub Pages

1. Ve a tu repositorio en GitHub
2. **Settings** → **Pages**
3. En "Source" elige **Deploy from a branch**
4. Selecciona la rama `main` y carpeta `/ (root)`
5. Guarda — en 1-2 minutos estará en `https://TU_USUARIO.github.io/fototerapia`

### Actualizar el sitio

```bash
git add .
git commit -m "Actualización"
git push origin main
```

---

## Personalizar mazos y nombres

Edita `js/decks.js` para cambiar nombres, colores de acento o agregar más cartas:

```js
{
  id: "mazo1",
  name: "Mi Mazo",        // ← Cambia el nombre
  back: "assets/backs/back1.jpg",
  color: "#7C6A8E",       // ← Color de acento en la UI
  cards: [...]
}
```
