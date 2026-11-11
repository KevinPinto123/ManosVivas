/* ManosVivas · Canal 2 — la app de la coordinadora
 * Entra con un código de un solo uso que llega por WhatsApp. Desde aquí se
 * confirman pedidos, se reparte la producción y se resuelve lo que el agente
 * no pudo entender solo.
 */
window.MV = window.MV || {};

(function (MV) {
  'use strict';

  const A = () => MV.almacen;
  const S = () => MV.almacen.estado;
  const U = () => MV.ui;

  let raiz = null;
  let pestana = 'inicio';
  let pasoAcceso = 'telefono';
  let candidata = null;

  function montar(contenedor) {
    raiz = contenedor;
    candidata = S().asociacion.coordinadoraId;
    pintar();
  }

  /* --- acceso -------------------------------------------------------------- */
  function vistaAcceso() {
    const a = A().artesana(candidata);
    if (pasoAcceso === 'telefono') {
      return `<div class="app">
        <div class="app__barra"><div><h3>ManosVivas</h3><small>Asociación Manos Vivas · Condorcanqui</small></div></div>
        <div class="acceso">
          <div style="font-size:42px" aria-hidden="true"></div>
          <h3>Entra con tu número</h3>
          <p>Te mandamos un código por WhatsApp. No hay contraseñas que recordar.</p>
          <div class="campo">
            <label for="ac-quien">¿Quién eres?</label>
            <select id="ac-quien">
              ${S().artesanas.map((x) => `<option value="${x.id}" ${x.id === candidata ? 'selected' : ''}>${x.nombre} · ${x.comunidad}</option>`).join('')}
            </select>
          </div>
          <div class="campo">
            <label for="ac-tel">Tu número de WhatsApp</label>
            <input id="ac-tel" type="tel" value="${a.telefono}" readonly aria-readonly="true">
          </div>
          <button class="boton" id="ac-pedir">Enviarme el código</button>
          <p style="font-size:11.5px;color:var(--tinta-3)">En la demo el código aparece en la pestaña WhatsApp, igual que le llegaría a ella.</p>
        </div>
      </div>`;
    }
    return `<div class="app">
      <div class="app__barra"><div><h3>ManosVivas</h3><small>Verificando tu número</small></div></div>
      <div class="acceso">
        <div style="font-size:42px" aria-hidden="true"></div>
        <h3>Revisa tu WhatsApp</h3>
        <p>Le mandamos un código de 6 dígitos a <b>${a.corto}</b> (${a.telefono}). Vence en 5 minutos.</p>
        <div class="campo">
          <label for="ac-codigo">Código</label>
          <input id="ac-codigo" class="otp-entrada" type="text" inputmode="numeric" maxlength="6"
            autocomplete="one-time-code" placeholder="••••••">
        </div>
        <div id="ac-error" style="color:var(--alerta);font-size:13px" role="alert"></div>
        <button class="boton" id="ac-entrar">Entrar</button>
        <button class="boton boton--plano" id="ac-ver-chat">Ver el código en el chat</button>
        <button class="boton boton--plano" id="ac-volver">Usar otro número</button>
      </div>
    </div>`;
  }

  function cablearAcceso() {
    const q = (s) => raiz.querySelector(s);
    if (pasoAcceso === 'telefono') {
      q('#ac-quien').addEventListener('change', (e) => { candidata = e.target.value; pintar(); });
      q('#ac-pedir').addEventListener('click', async (e) => {
        e.target.disabled = true; e.target.textContent = 'Enviando…';
        await A().api.pedirCodigo(candidata);
        pasoAcceso = 'codigo';
        pintar();
        U().avisar('whatsapp', 'Código de acceso enviado al chat');
      });
    } else {
      q('#ac-entrar').addEventListener('click', async () => {
        const v = q('#ac-codigo').value.trim();
        const ok = await A().api.validarCodigo(candidata, v);
        if (!ok) {
          const err = q('#ac-error');
          if (err) err.textContent = 'Ese código no coincide. Míralo otra vez en el chat de WhatsApp.';
        }
      });
      q('#ac-codigo').addEventListener('keydown', (e) => { if (e.key === 'Enter') q('#ac-entrar').click(); });
      q('#ac-ver-chat').addEventListener('click', () => MV.app.irA('whatsapp'));
      q('#ac-volver').addEventListener('click', () => { pasoAcceso = 'telefono'; pintar(); });
      setTimeout(() => { const c = q('#ac-codigo'); if (c) c.focus(); }, 80);
    }
  }

  /* --- pestañas ------------------------------------------------------------- */
  function vistaInicio() {
    const r = A().resumenAsociacion();
    const pendientes = S().tareas.filter((t) => t.estado === 'pendiente');
    const nuevos = S().pedidos.filter((p) => p.estado === 'solicitado');

    let html = '';

    if (nuevos.length) {
      html += nuevos.map((p) => {
        const c = A().comprador(p.compradorId);
        const total = p.items.reduce((s, it) => s + it.precio * it.cantidad, 0);
        return `<div class="tarea" style="border-color:var(--arcilla);background:var(--arcilla-clara)">
          <div class="bloque__cabeza" style="margin:0"><h4>Pedido nuevo · ${p.id}</h4>${U().insignia(p.estado)}</div>
          <p><b>${U().escapar(c.nombre)}</b> (${U().escapar(c.ciudad)}) pidió
             ${p.items.map((it) => `${it.cantidad} × ${U().escapar(A().producto(it.productoId).nombre)}`).join(', ')}
             por <b class="num">${U().moneda(total)}</b>. Entrega ${U().faltan(p.entrega)}.</p>
          <div class="botonera">
            <button class="boton" data-aceptar="${p.id}">Confirmar y repartir</button>
            <button class="boton boton--plano" data-ver="${p.id}">Ver detalle</button>
          </div>
        </div>`;
      }).join('');
    }

    if (pendientes.length) {
      html += pendientes.map((t) => {
        const a = A().artesana(t.artesanaId);
        return `<div class="tarea">
          <div class="bloque__cabeza" style="margin:0"><h4> ${U().escapar(t.titulo)}</h4>
            <span class="insignia insignia--produccion"><i class="insignia__pt"></i>Necesita una persona</span></div>
          <p>${U().escapar(t.detalle)}</p>
          <div class="audio-falso">
            <button class="audio-falso__play" aria-label="Reproducir el audio de ${U().escapar(a.corto)}">▶</button>
            <span class="onda" aria-hidden="true">${Array.from({ length: 26 }, (_, i) => `<i style="height:${5 + ((i * 5) % 15)}px"></i>`).join('')}</span>
            <span class="num" style="font-size:11px">${t.duracion}</span>
          </div>
          <div class="campo">
            <label for="tr-${t.id}">Lo que dijo ${U().escapar(a.corto)}, según la coordinadora</label>
            <select id="tr-${t.id}">
              ${S().productos.filter((p) => p.artesanaId === t.artesanaId || true).slice(0, 7)
                .map((p) => `<option value="${p.id}">Vendió 1 ${U().escapar(p.singular)} · ${U().moneda(p.precio)}</option>`).join('')}
            </select>
          </div>
          <div class="botonera">
            <button class="boton" data-resolver="${t.id}">Registrar en su cuenta</button>
          </div>
          <p style="font-size:11.5px;color:var(--tinta-3)">El agente no registra lo que no entiende bien. Prefiere preguntar antes que equivocarse en las cuentas de alguien.</p>
        </div>`;
      }).join('');
    }

    html += `<div class="bloque">
      <div class="bloque__cabeza"><h4>La asociación este mes</h4></div>
      <div class="kpis">
        <div class="kpi"><div class="kpi__et">Ventas registradas</div><div class="kpi__v">${U().moneda(r.ventasMes)}</div></div>
        <div class="kpi"><div class="kpi__et">Ganancia estimada</div><div class="kpi__v">${U().moneda(r.gananciaMes)}</div></div>
        <div class="kpi"><div class="kpi__et">Socias que registraron</div><div class="kpi__v">${r.artesanasActivas}<small>/${r.artesanasTotal}</small></div></div>
        <div class="kpi"><div class="kpi__et">Pedidos abiertos</div><div class="kpi__v">${r.pedidosAbiertos}</div></div>
      </div>
    </div>`;

    html += `<div class="bloque">
      <div class="bloque__cabeza"><h4>Ventas registradas por día</h4><span class="rotulo">14 días</span></div>
      ${U().graficoIngresos(A().serieIngresos(14), 140)}
      <p style="font-size:11.5px;color:var(--tinta-3);margin-top:7px">La barra de color arcilla es hoy.</p>
    </div>`;

    const ev = A().eventosRecientes(6);
    html += `<div class="bloque">
      <div class="bloque__cabeza"><h4>Lo último</h4></div>
      <ul class="lista-limpia">
        ${ev.map((e) => `<li style="display:flex;gap:9px;align-items:flex-start">
          <span aria-hidden="true">${({ whatsapp: '', app: '', mercado: '' })[e.canal] || ''}</span>
          <div><div style="font-size:13px">${U().escapar(e.texto)}</div>
          <div style="font-size:11px;color:var(--tinta-3)" class="num">${U().horaDe(e.ts)}</div></div></li>`).join('')
          || '<li style="font-size:13px;color:var(--tinta-3)">Todavía no pasa nada hoy.</li>'}
      </ul>
    </div>`;

    return html;
  }

  function vistaPedidos() {
    return `<div class="bloque">
      <div class="bloque__cabeza"><h4>Pedidos</h4><span class="rotulo">${S().pedidos.length} en total</span></div>
      <ul class="lista-limpia">
        ${S().pedidos.map((p) => {
          const c = A().comprador(p.compradorId);
          const total = p.items.reduce((s, it) => s + it.precio * it.cantidad, 0);
          return `<li class="bloque bloque--plano" style="padding:12px">
            <div class="bloque__cabeza" style="margin-bottom:7px">
              <div><b style="font-family:var(--mono);font-size:13px">${p.id}</b>
                <div style="font-size:13px">${U().escapar(c.nombre)} · ${U().escapar(c.ciudad)}</div></div>
              ${U().insignia(p.estado)}
            </div>
            <div style="font-size:12.5px;color:var(--tinta-2)">
              ${p.items.map((it) => `${it.cantidad} × ${U().escapar(A().producto(it.productoId).nombre)}`).join('<br>')}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:9px;gap:10px;flex-wrap:wrap">
              <span class="num" style="font-weight:700">${U().moneda(total)}</span>
              <span style="font-size:11.5px;color:var(--tinta-3)">Entrega ${U().faltan(p.entrega)}</span>
            </div>
            ${p.estado !== 'enviado' ? `<div class="botonera" style="margin-top:9px">
              ${siguienteAccion(p)}
            </div>` : ''}
          </li>`;
        }).join('')}
      </ul>
    </div>`;
  }

  function siguienteAccion(p) {
    const orden = ['solicitado', 'en produccion', 'listo', 'enviado'];
    const i = orden.indexOf(p.estado === 'confirmado' ? 'en produccion' : p.estado);
    const sig = orden[i + 1];
    if (!sig) return '';
    const et = { 'en produccion': 'Confirmar y repartir', listo: 'Marcar como listo', enviado: 'Marcar como enviado' }[sig];
    return `<button class="boton" data-avanzar="${p.id}" data-estado="${sig}">${et}</button>`;
  }

  function vistaProduccion() {
    const abiertos = S().pedidos.filter((p) => p.estado !== 'enviado');
    const tarjetas = { pendiente: [], proceso: [], terminado: [] };
    abiertos.forEach((p) => {
      p.items.forEach((it) => {
        const prod = A().producto(it.productoId);
        const hechas = (p.avance && p.avance[it.productoId]) || (p.estado === 'listo' ? it.cantidad : 0);
        const col = hechas >= it.cantidad ? 'terminado' : (hechas > 0 || p.estado === 'en produccion' ? 'proceso' : 'pendiente');
        tarjetas[col].push(`<div class="kanban__card">
          <b>${U().escapar(prod.nombre)}</b>
          <span class="num">${hechas}/${it.cantidad}</span> · ${U().escapar(A().artesana(prod.artesanaId).corto)}
          <div class="barra-avance" style="margin-top:6px"><i style="width:${Math.round((hechas / it.cantidad) * 100)}%"></i></div>
          <div style="font-size:10.5px;color:var(--tinta-3);margin-top:4px;font-family:var(--mono)">${p.id}</div>
        </div>`);
      });
    });
    const col = (t, k) => `<div class="kanban__col"><div class="kanban__t">${t} (${tarjetas[k].length})</div>${tarjetas[k].join('') || '<div style="font-size:11.5px;color:var(--tinta-3)">Nada aquí</div>'}</div>`;
    return `<div class="bloque">
      <div class="bloque__cabeza"><h4>Producción</h4><span class="rotulo">pedidos abiertos</span></div>
      <div class="kanban">${col('Por empezar', 'pendiente')}${col('En proceso', 'proceso')}${col('Terminado', 'terminado')}</div>
      <p style="font-size:11.5px;color:var(--tinta-3);margin-top:10px">Cuando una socia escribe “terminé 3” por WhatsApp, su tarjeta se mueve sola.</p>
    </div>`;
  }

  function vistaSocias() {
    const mes = Date.now() - 30 * 86400000;
    return `<div class="bloque">
      <div class="bloque__cabeza"><h4>Socias</h4><span class="rotulo">${S().artesanas.length} mujeres · ${new Set(S().artesanas.map((a) => a.comunidad)).size} comunidades</span></div>
      <ul class="lista-limpia">
        ${S().artesanas.map((a) => {
          let v = 0;
          S().movimientos.forEach((m) => {
            if (m.tipo === 'venta' && m.artesanaId === a.id && new Date(m.ts).getTime() > mes) v += m.monto;
          });
          const t = S().tecnicas[a.tecnica];
          return `<li class="fila-persona">
            ${U().avatar(a, 40)}
            <div class="fila-persona__t">
              <div class="fila-persona__n">${U().escapar(a.nombre)}</div>
              <div class="fila-persona__s">${U().escapar(a.comunidad)} · ${U().escapar(t.nombre)}</div>
              <div class="fila-persona__s">Habla ${U().escapar(a.idioma)}</div>
            </div>
            <div style="text-align:right">
              <div class="num" style="font-weight:700;font-size:14px">${U().moneda(v)}</div>
              <div style="font-size:10.5px;color:var(--tinta-3)">30 días</div>
            </div>
          </li>`;
        }).join('')}
      </ul>
      <p style="font-size:11.5px;color:var(--tinta-3);margin-top:12px">
        Ninguna socia necesita instalar esta app. Les basta su WhatsApp de siempre.</p>
    </div>`;
  }

  /* --- armazón -------------------------------------------------------------- */
  const TABS = [
    { id: 'inicio', ic: '', t: 'Inicio' },
    { id: 'pedidos', ic: '', t: 'Pedidos' },
    { id: 'produccion', ic: '', t: 'Producción' },
    { id: 'socias', ic: '', t: 'Socias' },
  ];

  function pintar() {
    if (!raiz) return;
    if (!S().acceso.autenticada) {
      raiz.innerHTML = vistaAcceso();
      cablearAcceso();
      return;
    }
    const yo = A().artesana(S().acceso.artesanaId);
    const cuerpo = ({ inicio: vistaInicio, pedidos: vistaPedidos, produccion: vistaProduccion, socias: vistaSocias })[pestana]();
    const alertas = S().tareas.filter((t) => t.estado === 'pendiente').length +
      S().pedidos.filter((p) => p.estado === 'solicitado').length;

    raiz.innerHTML = `<div class="app">
      <div class="app__barra">
        ${U().avatar(yo, 38)}
        <div><h3>${U().escapar(yo.corto)}</h3><small>${yo.rol === 'coordinadora' ? 'Coordinadora' : 'Socia'} · ${U().escapar(yo.comunidad)}</small></div>
        <button class="app__salir" id="app-salir">Salir</button>
      </div>
      <div class="app__cuerpo" id="app-cuerpo">${cuerpo}</div>
      <div class="app__tabs" role="tablist" aria-label="Secciones de la app">
        ${TABS.map((t) => `<button class="app__tab" role="tab" data-tab="${t.id}"
          aria-selected="${t.id === pestana}">
          <em aria-hidden="true">${t.ic}</em>${t.t}
          ${t.id === 'inicio' && alertas ? `<span class="globo">${alertas}</span>` : ''}
        </button>`).join('')}
      </div>
    </div>`;
    cablear();
  }

  function cablear() {
    raiz.querySelectorAll('[data-tab]').forEach((b) => {
      b.addEventListener('click', () => { pestana = b.dataset.tab; pintar(); });
    });
    const salir = raiz.querySelector('#app-salir');
    if (salir) salir.addEventListener('click', () => { pasoAcceso = 'telefono'; A().api.salir(); });

    raiz.querySelectorAll('[data-aceptar]').forEach((b) => {
      b.addEventListener('click', async () => {
        b.disabled = true; b.textContent = 'Confirmando…';
        const id = b.dataset.aceptar;
        await A().api.cambiarEstadoPedido(id, 'en produccion', 'app', 'Yanua confirmó el pedido y repartió el trabajo');
        const p = S().pedidos.find((x) => x.id === id);
        const prod = A().producto(p.items[0].productoId);
        A().agregarMensaje(prod.artesanaId, {
          de: 'bot', tipo: 'texto',
          texto: ` *Trabajo nuevo para ti*\nYanua te asignó ${p.items[0].cantidad} ${p.items[0].cantidad === 1 ? prod.singular : prod.plural} del pedido ${p.id}.\n\nAvísame cuando vayas terminando y lo voy anotando. `,
        });
        A().notificar('asignacion');
      });
    });

    raiz.querySelectorAll('[data-avanzar]').forEach((b) => {
      b.addEventListener('click', async () => {
        b.disabled = true;
        await A().api.cambiarEstadoPedido(b.dataset.avanzar, b.dataset.estado, 'app', b.textContent);
      });
    });

    raiz.querySelectorAll('[data-ver]').forEach((b) => {
      b.addEventListener('click', () => { pestana = 'pedidos'; pintar(); });
    });

    raiz.querySelectorAll('[data-resolver]').forEach((b) => {
      b.addEventListener('click', async () => {
        const tid = b.dataset.resolver;
        const sel = raiz.querySelector('#tr-' + tid);
        const t = S().tareas.find((x) => x.id === tid);
        b.disabled = true; b.textContent = 'Registrando…';
        await A().api.resolverTarea(tid, { venta: { artesanaId: t.artesanaId, productoId: sel.value, cantidad: 1 } });
        U().avisar('whatsapp', 'Se le avisó por WhatsApp que su venta quedó anotada');
      });
    });

    raiz.querySelectorAll('.audio-falso__play').forEach((b) => {
      b.addEventListener('click', () => {
        const onda = b.parentElement.querySelector('.onda');
        b.textContent = '❚❚';
        let i = 0;
        const barras = onda.querySelectorAll('i');
        const t = setInterval(() => {
          barras.forEach((x, k) => { x.style.background = k <= i ? 'var(--rio)' : 'var(--borde-fuerte)'; });
          i += 1;
          if (i > barras.length) {
            clearInterval(t); b.textContent = '▶';
            barras.forEach((x) => { x.style.background = 'var(--borde-fuerte)'; });
          }
        }, 70);
      });
    });
  }

  MV.appCoordinadora = {
    montar,
    actualizar() { if (raiz) pintar(); },
    irAPestana(p) { pestana = p; pintar(); },
  };
}(window.MV));
