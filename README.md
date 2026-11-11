# ManosVivas

Propuesta y prototipo para Impact Startup Competition 2027 · Amazonía Viva.

- `index.html`: landing de presentación. Imágenes en `img/` (ver `IMAGENES.md`).
- `demo.html`: demo funcional con los tres canales sincronizados (WhatsApp, app de la coordinadora, Mercado).

## Cómo abrirlo

```bash
python -m http.server 8731
```

Luego abre http://127.0.0.1:8731 (landing) o http://127.0.0.1:8731/demo.html (demo).
Antes de cada presentación, usa **Reiniciar** en la demo.

## Estructura

```
index.html          landing
demo.html           demo funcional
css/landing.css     estilos y animaciones de la landing
js/landing.js       teléfono animado, revelado al hacer scroll, progreso
css/estilos.css     estilos de la demo
img/                imágenes de la landing (generadas o reales)
IMAGENES.md         prompts para generar cada imagen
js/semilla.js       datos de demostración (ficticios)
js/almacen.js       estado único + API simulada
js/agente.js        bot de WhatsApp: Agente Negocio y Agente Marca
js/ui.js            piezas compartidas de interfaz
js/canal-*.js       WhatsApp, app de la coordinadora, Mercado
js/main.js          pestañas, inicio y demo guiada
```

## Honestidad

Todo el backend es simulado y corre en el navegador. Asociación, artesanas, compradores y pedidos
son ficticios. Las comunidades y distritos son reales y se usan solo como contexto geográfico;
ninguna ha sido consultada. No hay convenios ni pilotos firmados.

## Pruebas

La lógica del núcleo (análisis de texto, aritmética del resumen, Agente Marca, audios, pedidos y
acceso por código) se verifica fuera del navegador con 48 comprobaciones.
