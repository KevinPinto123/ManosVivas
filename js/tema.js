/* ManosVivas · Tema claro y oscuro
 * Por defecto sigue al sistema. El botón fija uno de los dos y lo recuerda,
 * que es lo que hace falta al proyectar desde una laptop ajena.
 * La preferencia se comparte entre la landing y la demo.
 */
window.MV = window.MV || {};

(function (MV) {
  'use strict';

  const CLAVE = 'manosvivas.tema';
  const oyentes = [];

  function leer() {
    try { return localStorage.getItem(CLAVE); } catch (e) { return null; }
  }

  function guardar(v) {
    try { if (v) localStorage.setItem(CLAVE, v); else localStorage.removeItem(CLAVE); } catch (e) { /* modo privado */ }
  }

  /** 'claro' | 'oscuro' | null (seguir al sistema) */
  function actual() {
    const v = leer();
    return v === 'claro' || v === 'oscuro' ? v : null;
  }

  function efectivo() {
    const v = actual();
    if (v) return v;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
  }

  function aplicar(v) {
    const raiz = document.documentElement;
    if (v === 'claro') raiz.setAttribute('data-theme', 'light');
    else if (v === 'oscuro') raiz.setAttribute('data-theme', 'dark');
    else raiz.removeAttribute('data-theme');
    oyentes.forEach((fn) => { try { fn(efectivo(), v); } catch (e) { /* nada */ } });
  }

  function poner(v) { guardar(v); aplicar(v); }

  /** Alterna entre claro y oscuro partiendo de lo que se ve ahora. */
  function alternar() { poner(efectivo() === 'oscuro' ? 'claro' : 'oscuro'); }

  const SOL = '<circle cx="11" cy="11" r="4.4" fill="currentColor"/><path d="M11 1.6v2.6M11 17.8v2.6M20.4 11h-2.6M4.2 11H1.6M17.6 4.4l-1.8 1.8M6.2 15.8l-1.8 1.8M17.6 17.6l-1.8-1.8M6.2 6.2L4.4 4.4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>';
  const LUNA = '<path d="M18 13.4A7.8 7.8 0 018.6 4a8.4 8.4 0 109.4 9.4z" fill="currentColor"/>';

  /** Crea el botón dentro de un contenedor. */
  function montarBoton(contenedor, clase) {
    if (!contenedor) return null;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = clase || 'boton-tema';
    b.addEventListener('click', alternar);
    function pintar() {
      const oscuro = efectivo() === 'oscuro';
      // El icono muestra a qué se cambia, no en qué se está.
      b.innerHTML = `<svg viewBox="0 0 22 22" width="18" height="18" aria-hidden="true">${oscuro ? SOL : LUNA}</svg>`;
      b.setAttribute('aria-label', oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
      b.setAttribute('title', oscuro ? 'Tema claro' : 'Tema oscuro');
    }
    pintar();
    oyentes.push(pintar);
    if (window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const alCambiar = () => { if (!actual()) pintar(); };
      if (mq.addEventListener) mq.addEventListener('change', alCambiar);
      else if (mq.addListener) mq.addListener(alCambiar);
    }
    contenedor.appendChild(b);
    return b;
  }

  aplicar(actual());

  MV.tema = { actual, efectivo, poner, alternar, montarBoton };
}(window.MV));
