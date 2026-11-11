# Imágenes de la landing

La landing (`index.html`) busca seis imágenes en la carpeta `img/`. Si falta alguna, se muestra un
recuadro rayado con el nombre del archivo esperado, así que la página nunca se ve rota.

Pega cada prompt en ChatGPT (o en otro generador). Guarda el resultado con el **nombre exacto** y
en la **proporción** indicada. Después copia el archivo a `img/`.

## Reglas antes de generar

- **No generes rostros de mujeres indígenas.** Un retrato inventado de una persona real de la
  Amazonía puede representar mal a una comunidad y no corresponde a nadie de la asociación.
  Los prompts de abajo muestran manos, piezas y materiales, sin rostros.
- **Las piezas deben parecer piezas, no símbolos.** No pidas kené, cerámica shipibo ni motivos
  de ningún pueblo: la ilustración de la demo es geométrica y genérica a propósito.
- **Cuando tengas fotos reales de la asociación, reemplaza estas.** Con permiso de las artesanas,
  una foto real vale más que cualquier imagen generada. Usa el mismo nombre de archivo.
- Antes de publicar, anota en el pie de la imagen que es **referencial** si no es una foto real.

---

## 1. `img/portada.jpg` — portada a pantalla completa

- **Proporción:** 16:9 (mínimo 2400 px de ancho)
- **Uso:** fondo de la portada, con texto blanco encima. Debe quedar oscuro abajo.

**Prompt:**

> Editorial photograph, close-up of two hands weaving natural plant fiber on a backstrap loom,
> warm late-afternoon light coming through a wooden window, lush Amazon rainforest blurred in the
> background, palette strictly limited to deep forest green #123F1B, mint #BDD3A7, cream #E8EDD6 and matcha green #90AD2E, shallow depth of field, no faces visible, cinematic,
> film grain, high detail, 16:9 composition with the lower third kept dark and simple for text overlay.

---

## 2. `img/pilar-negocio.jpg` — Agente Negocio

- **Proporción:** 4:5 (vertical, 1600 × 2000 px)
- **Uso:** tarjeta del primer pilar.

**Prompt:**

> Overhead photograph of a wooden table at the edge of a river village, a smartphone showing a
> simple chat screen, a small notebook with handwritten numbers, a handful of loose seeds and
> a cloth purse of coins, soft natural daylight, palette strictly limited to deep forest green #123F1B, mint #BDD3A7 and cream #E8EDD6, no people, no visible faces,
> documentary style, clean composition with generous empty space at the top.

---

## 3. `img/pilar-marca.jpg` — Agente Marca

- **Proporción:** 4:5 (vertical, 1600 × 2000 px)
- **Uso:** tarjeta del segundo pilar.

**Prompt:**

> Studio-style product photograph of a handmade necklace of red and black seeds with a fine
> natural-fiber cord, laid on a warm wooden surface beside a few loose seeds, soft diffused light
> from one side, shallow depth of field, palette strictly limited to deep forest green #123F1B, mint #BDD3A7, cream #E8EDD6 with matcha green #90AD2E accents,
> no text, no logos, no people, editorial quality.

---

## 4. `img/pilar-mercado.jpg` — Mercado ManosVivas

- **Proporción:** 4:5 (vertical, 1600 × 2000 px)
- **Uso:** tarjeta del tercer pilar.

**Prompt:**

> Top-down photograph of a tablet lying on a linen cloth, its screen showing a clean catalog of
> handmade crafts in a grid, surrounded by a woven basket, a clay bowl and a small wooden tray,
> natural light, palette strictly limited to deep forest green #123F1B, mint #BDD3A7 and cream #E8EDD6, no readable text on the screen, no people,
> minimal and calm, product-catalog style.

---

## 5. `img/rosa-dia.jpg` — ilustración de "Un día" (referencial)

- **Proporción:** 3:4 (vertical, 1500 × 2000 px)
- **Uso:** columna izquierda de la sección "Así se ve un día".
- **Pie:** la landing ya dice que es referencial.

**Prompt:**

> Warm illustrated scene in a soft painterly style, an artisan seen from behind at a wooden table
> at dusk, sorting seeds into small bowls, a smartphone resting beside her with a glowing chat
> window, a riverside village with stilt houses in the background, palette strictly limited to deep forest green #123F1B, mint #BDD3A7, cream #E8EDD6 and matcha green #90AD2E,
> no facial features visible, gentle and dignified, no text.

---

## 6. `img/pieza-trazabilidad.jpg` — detalle de pieza

- **Proporción:** 5:4 (horizontal, 2000 × 1600 px)
- **Uso:** imagen de la sección "Trazabilidad".

**Prompt:**

> Macro photograph of a handwoven natural-fiber textile, showing the fine texture of the weave in
> cream #E8EDD6 and mint #BDD3A7 tones with deep forest green #123F1B shadows, a single thread end resting across the fabric, soft side light,
> shallow depth of field, neutral background, no pattern that imitates any specific culture,
> editorial product detail shot.

---

## Cómo revisar

1. Guarda los seis archivos en `img/`.
2. Abre `index.html` (o `python -m http.server 8731`) y recarga.
3. Si una imagen no aparece, revisa que el nombre sea exacto, en minúsculas y con extensión `.jpg`.
