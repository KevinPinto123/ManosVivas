/* ManosVivas · Landing
 * Revelado al hacer scroll, pasos que se iluminan, barra de progreso y un
 * teléfono que reproduce la conversación real del Agente Negocio:
 * 80 − 22 − 13 − 20 = 25, la misma aritmética que corre en la demo.
 * Con prefers-reduced-motion todo se muestra en su estado final, sin animar.
 */
(function () {
  'use strict';

  var reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raiz = document.documentElement;

  if (window.MV && MV.tema) MV.tema.montarBoton(document.getElementById('menu-tema'), 'boton-tema');

  /* --- cabecera y progreso ------------------------------------------------ */
  var cab = document.getElementById('cabecera');
  var barra = document.getElementById('progreso');
  var fondo = document.querySelector('.portada__fondo');
  var portada = document.querySelector('.portada');
  var pendiente = false;

  function alScroll() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(function () {
      pendiente = false;
      var y = window.scrollY || 0;
      var alto = raiz.scrollHeight - window.innerHeight;
      if (cab) cab.classList.toggle('con-linea', y > 40);
      if (barra) barra.style.transform = 'scaleX(' + (alto > 0 ? Math.min(1, y / alto) : 0) + ')';
      if (!reducido && fondo && portada && y < portada.offsetHeight) {
        fondo.style.transform = 'translate3d(0,' + (y * 0.28).toFixed(1) + 'px,0)';
      }
    });
  }
  window.addEventListener('scroll', alScroll, { passive: true });
  window.addEventListener('resize', alScroll);
  alScroll();

  /* --- revelado ------------------------------------------------------------ */
  var items = Array.prototype.slice.call(document.querySelectorAll('.rev, .revela'));
  function mostrar(el) { el.classList.add('visto'); }
  function mostrarTodo() { items.forEach(mostrar); }

  // Sin observador, al imprimir, con movimiento reducido o en una captura de
  // página completa (viewport muy alto), todo queda visible desde el inicio.
  if (reducido || !('IntersectionObserver' in window) || window.innerHeight > 1600) {
    mostrarTodo();
  } else {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { mostrar(e.target); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    items.forEach(function (el) { obs.observe(el); });
  }
  window.addEventListener('beforeprint', mostrarTodo);
  window.addEventListener('resize', function () { if (window.innerHeight > 1600) mostrarTodo(); });

  /* --- pasos del día: el que está al centro se ilumina ----------------------- */
  var pasos = document.querySelectorAll('.paso');
  if ('IntersectionObserver' in window && pasos.length) {
    var obsPasos = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) {
          pasos.forEach(function (p) { p.classList.remove('activo'); });
          e.target.classList.add('activo');
        }
      });
    }, { rootMargin: '-42% 0px -48% 0px', threshold: 0 });
    pasos.forEach(function (p) { obsPasos.observe(p); });
  } else if (pasos.length) {
    pasos[0].classList.add('activo');
  }

  /* --- teléfono animado ---------------------------------------------------- */
  var tel = document.getElementById('telefono');
  var hilo = document.getElementById('tm-hilo');
  var texto = document.getElementById('tm-texto');
  var estado = document.getElementById('tm-estado');
  var enviar = document.querySelector('.telefono-m__enviar');
  var fases = document.querySelectorAll('.fase');
  if (!tel || !hilo) return;

  var visible = false;
  var esperandoVisible = [];

  function hora() {
    var d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  function espera(ms) {
    return new Promise(function (ok) { setTimeout(ok, ms); }).then(cuandoVisible);
  }
  function cuandoVisible() {
    if (visible) return Promise.resolve();
    return new Promise(function (ok) { esperandoVisible.push(ok); });
  }

  function fase(n) {
    fases.forEach(function (f) { f.classList.toggle('activa', Number(f.getAttribute('data-fase')) === n); });
  }

  function agregar(html) {
    var div = document.createElement('div');
    div.innerHTML = html.trim();
    var nodo = div.firstChild;
    hilo.appendChild(nodo);
    while (hilo.children.length > 6) hilo.removeChild(hilo.firstChild);
    return nodo;
  }

  function burbujaYo(t) {
    return agregar('<div class="tm-b tm-b--yo">' + t + '<small>' + hora() + '</small></div>');
  }

  function contar(raizNodo) {
    var nums = raizNodo.querySelectorAll('[data-hasta]');
    nums.forEach(function (el) {
      var hasta = Number(el.getAttribute('data-hasta'));
      var pre = el.getAttribute('data-pre') || '';
      if (reducido) { el.textContent = pre + hasta; return; }
      var inicio = null, dur = 900;
      function paso(t) {
        if (!inicio) inicio = t;
        var p = Math.min(1, (t - inicio) / dur);
        var suave = 1 - Math.pow(1 - p, 3);
        el.textContent = pre + Math.round(hasta * suave);
        if (p < 1) requestAnimationFrame(paso);
      }
      requestAnimationFrame(paso);
    });
  }

  var TARJETA_VENTA =
    '<div class="tm-t">' +
      '<div class="tm-t__cab"><i></i>Registré tu venta</div>' +
      '<div class="tm-t__cuerpo"><div class="tm-cifras">' +
        '<div class="tm-cifra"><small>Ingreso</small><b data-hasta="80" data-pre="S/">S/0</b></div>' +
        '<div class="tm-cifra"><small>Piezas</small><b data-hasta="2">0</b></div>' +
      '</div></div>' +
    '</div>';

  var TARJETA_RESUMEN =
    '<div class="tm-t">' +
      '<div class="tm-t__cab"><i></i>Resumen de hoy</div>' +
      '<div class="tm-t__cuerpo">' +
        '<div class="tm-fila"><span>Ventas del día</span><span data-hasta="80" data-pre="S/">S/0</span></div>' +
        '<div class="tm-fila"><span>Materiales usados</span><span data-hasta="22" data-pre="− S/">− S/0</span></div>' +
        '<div class="tm-fila"><span>Empaque y transporte</span><span data-hasta="13" data-pre="− S/">− S/0</span></div>' +
        '<div class="tm-fila"><span>Valor de tu trabajo</span><span data-hasta="20" data-pre="− S/">− S/0</span></div>' +
        '<div class="tm-fila tm-fila--total"><span>Ganancia estimada</span><span data-hasta="25" data-pre="S/">S/0</span></div>' +
      '</div>' +
    '</div>';

  async function escribir(t) {
    texto.textContent = '';
    for (var i = 0; i < t.length; i++) {
      texto.textContent += t.charAt(i);
      await espera(38 + Math.random() * 46);
    }
    await espera(350);
    if (enviar) { enviar.classList.add('pulsa'); setTimeout(function () { enviar.classList.remove('pulsa'); }, 180); }
    texto.textContent = '';
    burbujaYo(t);
  }

  async function responde(html, ms) {
    estado.textContent = 'escribiendo…';
    var puntos = agregar('<div class="tm-puntos"><i></i><i></i><i></i></div>');
    await espera(ms || 1000);
    puntos.remove();
    estado.textContent = 'en línea';
    var t = agregar(html);
    contar(t);
    return t;
  }

  async function ciclo() {
    hilo.innerHTML = '';
    fase(0);
    await espera(700);
    await escribir('vendí dos collares por 80 soles');
    await espera(300);
    fase(1);
    await responde(TARJETA_VENTA, 1100);
    await espera(2400);
    fase(2);
    await escribir('resumen');
    await responde(TARJETA_RESUMEN, 1000);
    await espera(6000);
  }

  function estadoFinal() {
    hilo.innerHTML = '';
    burbujaYo('vendí dos collares por 80 soles');
    contar(agregar(TARJETA_VENTA));
    burbujaYo('resumen');
    contar(agregar(TARJETA_RESUMEN));
    fases.forEach(function (f) { f.classList.add('activa'); });
  }

  if (reducido || !('IntersectionObserver' in window)) {
    estadoFinal();
    return;
  }

  // Estado inicial completo: si nadie llega a verlo animar, igual se lee.
  estadoFinal();
  fases.forEach(function (f) { f.classList.remove('activa'); });
  fase(2);

  var arrancado = false;
  new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      visible = e.isIntersecting;
      if (visible) {
        var cola = esperandoVisible; esperandoVisible = [];
        cola.forEach(function (ok) { ok(); });
        if (!arrancado) {
          arrancado = true;
          (async function bucle() {
            for (;;) {
              try { await ciclo(); } catch (err) { console.error('[ManosVivas] animación', err); estadoFinal(); return; }
            }
          })();
        }
      }
    });
  }, { threshold: 0.35 }).observe(tel);
})();
