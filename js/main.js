/* ManosVivas · Armazón
 * Pestañas, pantalla de pitch y la demo guiada para el jurado.
 * Los tres canales viven en nodos únicos que se mueven entre vistas, así nunca
 * se pierde el estado del chat ni el scroll al cambiar de pestaña.
 */
window.MV = window.MV || {};

(function (MV) {
  'use strict';

  const A = () => MV.almacen;
  const S = () => MV.almacen.estado;
  const U = () => MV.ui;

  let vista = 'pitch';
  let cajas = {};
  let pasoGuia = -1;

  const VISTAS = [
    { id: 'pitch', ic: '', t: 'Inicio' },
    { id: 'whatsapp', ic: '', t: 'WhatsApp', canal: 'whatsapp' },
    { id: 'app', ic: '', t: 'App', canal: 'app' },
    { id: 'mercado', ic: '', t: 'Mercado', canal: 'mercado' },
    { id: 'sincronia', ic: '', t: 'Los tres a la vez' },
  ];

  /* ===================== pitch ===================== */
  function htmlPitch() {
    const r = A().resumenAsociacion();
    return `<div class="pitch">
      <section class="heroe">
        <div>
          <span class="rotulo">Demo funcional · ManosVivas</span>
          <h1>Tres canales, <span>un solo sistema.</span></h1>
          <p class="heroe__lema">Recorre la demo guiada o explora cada canal por tu cuenta. Todo lo que pasa en WhatsApp aparece al instante en la app y en el Mercado.</p>
          <div class="heroe__acciones">
            <button class="boton" id="btn-demo">Iniciar demo guiada</button>
            <a class="boton boton--plano" href="index.html" style="text-decoration:none;text-align:center">Volver a la landing</a>
          </div>
        </div>
        <div class="bloque" style="position:relative;z-index:1">
          <div class="bloque__cabeza"><h4>Estado actual de los datos</h4></div>
          <div class="kpis">
            <div class="kpi"><div class="kpi__et">Artesanas en la demo</div><div class="kpi__v">${r.artesanasTotal}</div></div>
            <div class="kpi"><div class="kpi__et">Comunidades</div><div class="kpi__v">${r.comunidades}</div></div>
            <div class="kpi"><div class="kpi__et">Piezas publicadas</div><div class="kpi__v">${r.fichasPublicadas}</div></div>
            <div class="kpi"><div class="kpi__et">Pedidos abiertos</div><div class="kpi__v">${r.pedidosAbiertos}</div></div>
          </div>
          <p style="font-size:12px;color:var(--tinta-3);margin-top:12px">Datos ficticios que viven en tu navegador. Usa Reiniciar para volver al punto de partida.</p>
        </div>
      </section>
    </div>`;
  }

  /* ===================== demo guiada ===================== */
  const PASOS = [
    {
      v: 'pitch', t: 'Tres pilares, un solo sistema',
      d: 'Agente Negocio, Agente Marca y Mercado. Empezamos por donde empiezan ellas: WhatsApp.',
    },
    {
      v: 'whatsapp', t: 'Rosa cuenta su venta como la contaría a una vecina',
      d: 'Texto libre, sin formularios. Pulsa “Hacerlo por mí” o escríbelo tú.',
      auto: () => MV.whatsapp.enviarComo('a2', { tipo: 'texto', texto: 'vendí dos collares por 80 soles' }, 'vendí dos collares por 80 soles'),
      escribir: 'vendí dos collares por 80 soles',
    },
    {
      v: 'whatsapp', t: 'El gasto que no es costo de hoy',
      d: 'Rosa compró material para la semana que viene. El agente pregunta antes de mezclarlo con las cuentas del día.',
      auto: () => MV.whatsapp.enviarComo('a2', { tipo: 'texto', texto: 'compré mostacilla por 60 soles' }, 'compré mostacilla por 60 soles'),
      escribir: 'compré mostacilla por 60 soles',
    },
    {
      v: 'whatsapp', t: 'Elige “Es para después”',
      d: 'Toca el chip. Verás que sale de la caja pero no se descuenta de la ganancia de lo vendido hoy.',
    },
    {
      v: 'whatsapp', t: 'Agente Marca: una foto se vuelve ficha',
      d: 'Manda una foto, pon el precio y revisa el texto. Nada se publica sin que ella lo apruebe.',
      auto: () => MV.whatsapp.enviarComo('a2', { tipo: 'boton', idBoton: 'foto' }, ' Enviar una foto'),
    },
    {
      v: 'mercado', t: 'La pieza ya está en el Mercado',
      d: 'Ábrela: historia de la artesana, trazabilidad del material y cómo se compone el precio.',
    },
    {
      v: 'mercado', t: 'Un comprador hace su pedido',
      d: 'Entra a una pieza, elige cantidad y envía el pedido. Mira el aviso: ya salió hacia WhatsApp.',
    },
    {
      v: 'app', t: 'La coordinadora entra con un código',
      d: 'Pide el código: llega al chat de WhatsApp, como le llegaría a ella. Sin contraseñas.',
    },
    {
      v: 'app', t: 'Confirmar el pedido y resolver el audio',
      d: 'Confirma el pedido nuevo y escucha el audio en awajún que el agente no entendió. Decide una persona, no el modelo.',
    },
    {
      v: 'sincronia', t: 'Los tres canales a la vez',
      d: 'Escribe cualquier cosa en el chat y mira cómo se mueven la app y el Mercado sin recargar.',
    },
    {
      v: 'pitch', t: 'Qué está simulado y qué sigue',
      d: 'Vuelve a la landing con el botón “Volver a la landing” y cierra con qué es real, qué es simulado y qué sigue.',
    },
  ];

  function pintarGuia() {
    const caja = document.getElementById('guia');
    if (pasoGuia < 0 || pasoGuia >= PASOS.length) { caja.hidden = true; caja.innerHTML = ''; return; }
    const p = PASOS[pasoGuia];
    caja.hidden = false;
    caja.innerHTML = `
      <span class="guia__n">${pasoGuia + 1}/${PASOS.length}</span>
      <div class="guia__t"><b>${U().escapar(p.t)}</b>${U().escapar(p.d)}</div>
      <div class="guia__btns">
        ${p.auto ? '<button id="g-auto">Hacerlo por mí</button>' : ''}
        ${pasoGuia > 0 ? '<button id="g-atras">Atrás</button>' : ''}
        <button class="pri" id="g-sig">${pasoGuia === PASOS.length - 1 ? 'Terminar' : 'Siguiente'}</button>
        <button id="g-salir" aria-label="Salir de la demo guiada">✕</button>
      </div>`;

    const q = (s) => caja.querySelector(s);
    q('#g-sig').addEventListener('click', () => irPaso(pasoGuia + 1));
    if (q('#g-atras')) q('#g-atras').addEventListener('click', () => irPaso(pasoGuia - 1));
    q('#g-salir').addEventListener('click', () => { pasoGuia = -1; pintarGuia(); });
    if (q('#g-auto')) {
      q('#g-auto').addEventListener('click', async (e) => {
        e.target.disabled = true;
        await p.auto();
        e.target.disabled = false;
      });
    }
    if (p.escribir) MV.whatsapp.escribirEnCaja(p.escribir);
  }

  function irPaso(n) {
    if (n >= PASOS.length) { pasoGuia = -1; cambiar('pitch'); pintarGuia(); return; }
    pasoGuia = Math.max(0, n);
    cambiar(PASOS[pasoGuia].v);
    pintarGuia();
  }

  /* ===================== armazón ===================== */
  function montar() {
    document.getElementById('app-raiz').innerHTML = `
      <header class="barra">
        <div class="barra__interior">
          <div class="marca">
            <img class="marca__hoja" src="img/Logo_vector.svg" alt="" width="34" height="34">
            <div>
              <div class="marca__nombre">Manos<span>Vivas</span></div>
              <div class="marca__sub">Condorcanqui · Amazonas</div>
            </div>
          </div>
          <nav class="pestanas" role="tablist" aria-label="Canales de ManosVivas" id="nav"></nav>
          <div class="acciones-barra" id="acciones-barra">
            <button class="boton-icono" id="btn-guion" title="Cargar una conversación de ejemplo">Conversación de ejemplo</button>
            <button class="boton-icono" id="btn-reiniciar" title="Volver a los datos iniciales">↻ Reiniciar</button>
          </div>
        </div>
      </header>
      <main class="lienzo">
        <section class="vista" id="v-pitch" role="tabpanel" aria-label="Pitch"></section>
        <section class="vista" id="v-whatsapp" role="tabpanel" aria-label="WhatsApp" hidden></section>
        <section class="vista" id="v-app" role="tabpanel" aria-label="App de la coordinadora" hidden></section>
        <section class="vista" id="v-mercado" role="tabpanel" aria-label="Mercado" hidden></section>
        <section class="vista sincronia" id="v-sincronia" role="tabpanel" aria-label="Los tres canales a la vez" hidden></section>
      </main>
      <div class="avisos" id="avisos" aria-live="polite"></div>
      <div class="guia" id="guia" role="region" aria-label="Demo guiada" hidden></div>`;

    // nodos únicos de cada canal
    cajas.whatsapp = Object.assign(document.createElement('div'), { className: 'telefono' });
    cajas.app = Object.assign(document.createElement('div'), { className: 'telefono' });
    cajas.mercado = Object.assign(document.createElement('div'), { id: 'caja-mercado' });

    MV.whatsapp.montar(cajas.whatsapp);
    MV.appCoordinadora.montar(cajas.app);
    MV.mercado.montar(cajas.mercado);

    pintarNav();
    document.getElementById('nav').addEventListener('click', (e) => {
      const b = e.target.closest('[data-vista]');
      if (b) cambiar(b.dataset.vista);
    });
    document.getElementById('btn-reiniciar').addEventListener('click', () => {
      A().reiniciar();
      U().avisar('app', 'Datos de demostración restaurados');
    });
    document.getElementById('btn-guion').addEventListener('click', cargarGuion);
    if (MV.tema) MV.tema.montarBoton(document.getElementById('acciones-barra'), 'boton-icono boton-tema');

    cambiar('pitch');
  }

  /** Los botones se crean una sola vez. Luego solo cambian el globo y la selección:
   *  rehacer el HTML en cada notificación reemplazaba el botón bajo el dedo. */
  function pintarNav() {
    const nav = document.getElementById('nav');
    if (!nav.children.length) {
      nav.innerHTML = VISTAS.map((v) => `<button class="pestana" role="tab" data-vista="${v.id}">
        <span aria-hidden="true">${v.ic}</span>${v.t}
        <span class="pestana__punto" hidden></span>
      </button>`).join('');
    }
    VISTAS.forEach((v) => {
      const b = nav.querySelector(`[data-vista="${v.id}"]`);
      if (!b) return;
      b.setAttribute('aria-selected', String(v.id === vista));
      const globo = b.querySelector('.pestana__punto');
      const n = v.canal ? (S().noLeidos[v.canal] || 0) : 0;
      globo.hidden = !n;
      if (n) globo.textContent = n;
    });
  }

  function cambiar(v) {
    vista = v;
    VISTAS.forEach((x) => { document.getElementById('v-' + x.id).hidden = x.id !== v; });

    const vp = document.getElementById('v-pitch');
    const vw = document.getElementById('v-whatsapp');
    const va = document.getElementById('v-app');
    const vm = document.getElementById('v-mercado');
    const vs = document.getElementById('v-sincronia');

    if (v === 'pitch') { vp.innerHTML = htmlPitch(); cablearPitch(); }

    cajas.mercado.className = '';
    if (v === 'whatsapp') vw.appendChild(cajas.whatsapp);
    else if (v === 'app') va.appendChild(cajas.app);
    else if (v === 'mercado') vm.appendChild(cajas.mercado);
    else if (v === 'sincronia') {
      cajas.mercado.className = 'mercado-mini';
      vs.innerHTML = '';
      [['', 'WhatsApp de la artesana', 'whatsapp'],
       ['', 'App de la coordinadora', 'app'],
       ['', 'Mercado del comprador', 'mercado']].forEach(([ic, t, k]) => {
        const col = document.createElement('div');
        col.className = 'sincronia__col';
        const et = document.createElement('div');
        et.className = 'sincronia__et';
        et.innerHTML = `<span aria-hidden="true">${ic}</span><span class="rotulo">${t}</span>`;
        col.appendChild(et);
        col.appendChild(cajas[k]);
        vs.appendChild(col);
      });
    }

    if (v !== 'sincronia' && S().noLeidos) {
      const c = (VISTAS.find((x) => x.id === v) || {}).canal;
      if (c) S().noLeidos[c] = 0;
    }
    pintarNav();
    if (v === 'whatsapp' || v === 'sincronia') requestAnimationFrame(() => MV.whatsapp.alFondo());
    window.scrollTo({ top: 0 });
  }

  function cablearPitch() {
    const ir = () => { pasoGuia = 0; irPaso(0); };
    const b1 = document.getElementById('btn-demo');
    const b2 = document.getElementById('btn-demo-2');
    const b3 = document.getElementById('btn-wa');
    if (b1) b1.addEventListener('click', ir);
    if (b2) b2.addEventListener('click', ir);
    if (b3) b3.addEventListener('click', () => cambiar('whatsapp'));
  }

  /** Conversación de ejemplo: para narrar sin escribir nada. */
  function cargarGuion() {
    const aid = 'a2';
    S().personaActiva = aid;
    const chat = S().chats[aid];
    chat.sesion = null;
    const ahora = Date.now();
    const m = (min, de, tipo, extra) => Object.assign(
      { id: A().nuevoId('g'), ts: new Date(ahora - (9 - min) * 60000).toISOString(), de, tipo }, extra);

    const r = A().resumenDia(aid);
    chat.mensajes.push(
      m(0, 'yo', 'texto', { texto: 'Buenas tardes', estado: 'leido' }),
      m(1, 'bot', 'texto', { texto: '¡Hola, Rosa! Soy ManosVivas.\n\n¿Qué quieres hacer hoy?' }),
      m(2, 'yo', 'texto', { texto: 'vendí dos collares por 80 soles', estado: 'leido' }),
      m(3, 'bot', 'venta', { titulo: '¡Registré tu venta!', producto: 'Collar de huayruro y achira', cantidad: 2, monto: 80, acumulado: { ventas: r.ventas + 80, piezas: r.piezas + 2 } }),
      m(4, 'yo', 'texto', { texto: 'compré mostacilla por 60 soles', estado: 'leido' }),
      m(5, 'bot', 'chips', {
        texto: 'Anotado: S/60 en *mostacilla*.\n\nUna cosa más, para no confundir tus cuentas: ¿ese material lo usaste en lo que vendiste hoy, o lo guardas para próximos trabajos?',
        botones: [{ id: 'gasto-hoy', titulo: 'Lo usé en lo de hoy' }, { id: 'gasto-despues', titulo: 'Es para después' }],
      }),
      m(6, 'yo', 'texto', { texto: 'Es para después', estado: 'leido' }),
      m(7, 'bot', 'texto', { texto: 'Listo. Lo guardé como *compra de material para después*.\n\nSalió de tu caja hoy, pero no lo descuento de la ganancia de lo que vendiste hoy: ese material todavía no se ha convertido en una pieza vendida. Así tus cuentas no se mezclan. ' }),
      m(8, 'yo', 'texto', { texto: 'resumen', estado: 'leido' }),
      m(9, 'bot', 'resumen', { resumen: A().resumenDia(aid), artesanaId: aid })
    );
    A().notificar('guion');
    cambiar('whatsapp');
    U().avisar('whatsapp', 'Conversación de ejemplo cargada en el chat de Rosa');
  }

  /* ===================== arranque ===================== */
  function arrancar() {
    A().iniciar();
    montar();

    let anterior = A().eventosRecientes(1)[0];
    A().suscribir((est, motivo) => {
      if (MV.whatsapp.actualizar) MV.whatsapp.actualizar(motivo);
      MV.appCoordinadora.actualizar();
      MV.mercado.actualizar();
      if (vista === 'pitch') { document.getElementById('v-pitch').innerHTML = htmlPitch(); cablearPitch(); }
      pintarNav();

      // aviso cruzado: solo cuando el evento no nació en la vista que estás mirando
      const ev = A().eventosRecientes(1)[0];
      if (motivo === 'inicio') { anterior = ev; return; }
      if (ev && (!anterior || ev.id !== anterior.id)) {
        anterior = ev;
        const mirando = vista === 'sincronia' ? null : vista;
        if (ev.canal !== mirando) U().avisar(ev.canal, ev.texto);
      }
    });

    // El estado inicial ya trae eventos; no los anunciamos.
    anterior = A().eventosRecientes(1)[0];
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();

  MV.app = { irA: cambiar, get vista() { return vista; } };
}(window.MV));
