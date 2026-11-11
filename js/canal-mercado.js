/* ManosVivas · Canal 3 — el Mercado
 * Lo que ve un comprador: catálogo colectivo, la historia detrás de cada pieza
 * y el estado real del pedido que hizo.
 */
window.MV = window.MV || {};

(function (MV) {
  'use strict';

  const A = () => MV.almacen;
  const S = () => MV.almacen.estado;
  const U = () => MV.ui;

  let raiz = null;
  let filtro = 'Todos';
  let abierta = null; // id de producto en ficha
  let compradorActivo = 'c1';

  function montar(contenedor) { raiz = contenedor; pintar(); }

  function categorias() {
    return ['Todos'].concat(Array.from(new Set(S().productos.map((p) => p.categoria))));
  }

  /* --- catálogo -------------------------------------------------------------- */
  function vistaCatalogo() {
    const r = A().resumenAsociacion();
    const lista = S().productos.filter((p) => p.estado === 'publicado' && (filtro === 'Todos' || p.categoria === filtro));

    return `<div class="mercado">
      <header class="mercado__cabecera">
        <div style="flex:1;min-width:260px">
          <span class="rotulo">Mercado ManosVivas</span>
          <h2>Creaciones con identidad amazónica</h2>
          <p>Piezas hechas a mano por mujeres de la ${U().escapar(S().asociacion.nombre)},
             en ${U().escapar(S().asociacion.provincia)}, ${U().escapar(S().asociacion.region)}.
             Cada ficha dice quién la hizo, de dónde salió el material y cómo se compone su precio.</p>
        </div>
        <div class="kpis">
          <div class="kpi"><div class="kpi__et">Piezas publicadas</div><div class="kpi__v">${r.fichasPublicadas}</div></div>
          <div class="kpi"><div class="kpi__et">Artesanas</div><div class="kpi__v">${r.artesanasTotal}</div></div>
          <div class="kpi"><div class="kpi__et">Comunidades</div><div class="kpi__v">${r.comunidades}</div></div>
          <div class="kpi"><div class="kpi__et">Técnicas</div><div class="kpi__v">${r.tecnicas}</div></div>
        </div>
      </header>

      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;justify-content:space-between">
        <div class="filtros" role="group" aria-label="Filtrar por categoría">
          ${categorias().map((c) => `<button class="filtro" data-filtro="${U().escapar(c)}" aria-pressed="${c === filtro}">${U().escapar(c)}</button>`).join('')}
        </div>
        <label style="display:flex;gap:8px;align-items:center;font-size:12.5px;color:var(--tinta-2)">
          Compras como
          <select id="mk-comprador" style="border:1px solid var(--borde-fuerte);border-radius:999px;padding:7px 12px;background:var(--superficie);color:var(--tinta);min-height:40px">
            ${S().compradores.map((c) => `<option value="${c.id}" ${c.id === compradorActivo ? 'selected' : ''}>${U().escapar(c.nombre)} · ${U().escapar(c.ciudad)}</option>`).join('')}
          </select>
        </label>
      </div>

      <div class="rejilla">
        ${lista.map(tarjeta).join('') || '<p style="color:var(--tinta-3)">No hay piezas en esa categoría todavía.</p>'}
      </div>

      ${seccionPedidos()}
      ${seccionEjes()}
    </div>`;
  }

  function tarjeta(p) {
    const a = A().artesana(p.artesanaId);
    return `<button class="pieza" data-pieza="${p.id}" aria-label="Ver ${U().escapar(p.nombre)}">
      <div style="position:relative">
        ${U().ilustracion(p)}
        ${p.nuevo ? '<span class="cinta">Recién publicado</span>' : ''}
      </div>
      <div class="pieza__cuerpo">
        <div class="pieza__nombre">${U().escapar(p.nombre)}</div>
        <div class="pieza__autora">${U().escapar(a.corto)} · ${U().escapar(a.comunidad)}</div>
        <div class="pieza__pie">
          <span class="pieza__precio">${U().moneda(p.precio)}</span>
          <span style="font-size:11.5px;color:var(--tinta-3)">${p.stock > 0 ? p.stock + ' disponible' + (p.stock === 1 ? '' : 's') : 'Por encargo'}</span>
        </div>
      </div>
    </button>`;
  }

  /* --- ficha de la pieza ------------------------------------------------------ */
  function vistaFicha() {
    const p = A().producto(abierta);
    if (!p) { abierta = null; return vistaCatalogo(); }
    const a = A().artesana(p.artesanaId);
    const t = S().tecnicas[a.tecnica];
    const codigo = 'MV-' + S().asociacion.region.slice(0, 2).toUpperCase() + '-' + p.id.toUpperCase() + '-' + a.id.toUpperCase();

    return `<div class="mercado">
      <button class="boton-icono" id="mk-volver" style="align-self:flex-start">‹ Volver al catálogo</button>
      <div class="ficha">
        <div class="ficha__media">
          ${U().ilustracion(p, 'ficha__img')}
          <p style="font-size:11.5px;color:var(--tinta-3)">Ilustración de referencia generada para la demo. En producción iría la foto que la artesana mandó por WhatsApp.</p>
          <div class="qr">
            <svg width="76" height="76" viewBox="0 0 29 29" role="img" aria-label="Código de trazabilidad ${codigo}" style="flex:none;background:#fff;border-radius:6px;padding:3px">
              ${qrFalso(codigo)}
            </svg>
            <div>
              <div class="rotulo">Código de trazabilidad</div>
              <div class="qr__codigo">${codigo}</div>
              <p style="font-size:11.5px;color:var(--tinta-3);margin-top:5px">Simulado. En producción llevaría a esta misma ficha pública.</p>
            </div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:18px;min-width:0">
          <div>
            <span class="rotulo">${U().escapar(p.categoria)}</span>
            <h2 style="font-size:clamp(23px,3vw,31px);letter-spacing:-.02em;margin-top:5px">${U().escapar(p.nombre)}</h2>
            <p style="color:var(--tinta-2);margin-top:9px">${U().escapar(p.descripcion)}</p>
          </div>

          <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
            <span class="num" style="font-size:30px;font-weight:700;letter-spacing:-.03em">${U().moneda(p.precio)}</span>
            <span style="font-size:13px;color:var(--tinta-3)">${p.stock > 0 ? p.stock + ' disponible' + (p.stock === 1 ? '' : 's') : 'Se hace por encargo'}</span>
          </div>

          <div class="bloque bloque--plano">
            <div class="bloque__cabeza"><h4>La historia detrás de la pieza</h4></div>
            <div class="fila-persona" style="margin-bottom:11px">
              ${U().avatar(a, 44)}
              <div class="fila-persona__t">
                <div class="fila-persona__n">${U().escapar(a.nombre)}</div>
                <div class="fila-persona__s">${U().escapar(a.comunidad)}, distrito de ${U().escapar(S().comunidades[a.comunidad].distrito)}</div>
                <div class="fila-persona__s">Pueblo ${U().escapar(a.pueblo)} · teje desde ${a.desde}</div>
              </div>
            </div>
            <p style="font-size:13.5px;color:var(--tinta-2)">${U().escapar(p.historia)}</p>
          </div>

          <div class="bloque bloque--plano">
            <div class="bloque__cabeza"><h4>Trazabilidad</h4></div>
            <div class="trazabilidad">
              ${traza('', 'Técnica', t.nombre)}
              ${traza('', 'Materiales', p.materiales.join(' · '))}
              ${traza('', 'Dónde se hizo', `${a.comunidad} · ${S().comunidades[a.comunidad].acceso}`)}
              ${traza('', 'Tiempo de trabajo', `${p.horas} h por pieza`)}
              ${traza('♻', 'Manejo del material', t.bioeconomia)}
            </div>
            <p style="font-size:12px;color:var(--tinta-3);margin-top:10px">${U().escapar(t.nota)}</p>
          </div>

          <div class="bloque bloque--plano">
            <div class="bloque__cabeza"><h4>Precio justo, a la vista</h4></div>
            ${U().desglosePrecio(p)}
          </div>

          <div class="bloque">
            <div class="bloque__cabeza"><h4>Hacer un pedido</h4></div>
            <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap">
              <div class="campo" style="flex:1;min-width:120px">
                <label for="mk-cant">Cantidad</label>
                <input id="mk-cant" type="number" min="1" max="99" value="6">
              </div>
              <div class="campo" style="flex:2;min-width:180px">
                <label for="mk-quien">A nombre de</label>
                <select id="mk-quien">
                  ${S().compradores.map((c) => `<option value="${c.id}" ${c.id === compradorActivo ? 'selected' : ''}>${U().escapar(c.nombre)}</option>`).join('')}
                </select>
              </div>
            </div>
            <button class="boton" id="mk-pedir" style="margin-top:12px">Enviar pedido a la asociación</button>
            <p style="font-size:11.5px;color:var(--tinta-3);margin-top:8px">
              El pedido le llega a la coordinadora por WhatsApp y a su app al instante. Ella decide si lo acepta.</p>
          </div>
        </div>
      </div>
    </div>`;
  }

  function traza(ic, et, v) {
    return `<div class="traza">
      <span class="traza__ic" aria-hidden="true">${ic}</span>
      <div><div class="traza__et">${U().escapar(et)}</div><div class="traza__v">${U().escapar(v)}</div></div>
    </div>`;
  }

  /** Cuadrícula tipo QR, determinista a partir del código. No es un QR legible. */
  function qrFalso(semillaTexto) {
    let h = 0;
    for (let i = 0; i < semillaTexto.length; i += 1) h = (h * 31 + semillaTexto.charCodeAt(i)) >>> 0;
    const celdas = [];
    const ocupada = (x, y) => (x < 8 && y < 8) || (x > 20 && y < 8) || (x < 8 && y > 20);
    for (let y = 0; y < 29; y += 1) {
      for (let x = 0; x < 29; x += 1) {
        if (ocupada(x, y)) continue;
        h = (h * 1103515245 + 12345) >>> 0;
        if ((h >>> 16) % 100 < 46) celdas.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
      }
    }
    const ojo = (ox, oy) => `<rect x="${ox}" y="${oy}" width="7" height="7" fill="none" stroke="#111" stroke-width="1"/>
      <rect x="${ox + 2}" y="${oy + 2}" width="3" height="3" fill="#111"/>`;
    return `<g fill="#111">${celdas.join('')}</g>${ojo(0, 0)}${ojo(22, 0)}${ojo(0, 22)}`;
  }

  /* --- pedidos del comprador --------------------------------------------------- */
  function seccionPedidos() {
    const mios = S().pedidos.filter((p) => p.compradorId === compradorActivo);
    if (!mios.length) return '';
    return `<div class="bloque">
      <div class="bloque__cabeza"><h4>Mis pedidos</h4><span class="rotulo">${U().escapar(A().comprador(compradorActivo).nombre)}</span></div>
      <ul class="lista-limpia">
        ${mios.map((p) => {
          const total = p.items.reduce((s, it) => s + it.precio * it.cantidad, 0);
          const ult = p.historial[p.historial.length - 1];
          return `<li class="bloque bloque--plano" style="padding:13px">
            <div class="bloque__cabeza" style="margin-bottom:6px">
              <b style="font-family:var(--mono);font-size:13px">${p.id}</b>${U().insignia(p.estado)}
            </div>
            <div style="font-size:13px;color:var(--tinta-2)">
              ${p.items.map((it) => `${it.cantidad} × ${U().escapar(A().producto(it.productoId).nombre)}`).join('<br>')}
            </div>
            <div style="display:flex;justify-content:space-between;gap:10px;margin-top:8px;flex-wrap:wrap">
              <span class="num" style="font-weight:700">${U().moneda(total)}</span>
              <span style="font-size:11.5px;color:var(--tinta-3)">Entrega ${U().faltan(p.entrega)}</span>
            </div>
            <div style="font-size:11.5px;color:var(--tinta-3);margin-top:7px;border-top:1px solid var(--borde);padding-top:7px">
              Último movimiento: ${U().escapar(ult.texto)} · ${U().fechaCorta(ult.ts)}
            </div>
          </li>`;
        }).join('')}
      </ul>
    </div>`;
  }

  function seccionEjes() {
    return `<div class="bloque">
      <div class="bloque__cabeza"><h4>Cómo responde ManosVivas al reto Amazonía Viva</h4></div>
      <div class="ejes">
        <div class="eje">
          <h4>Bioeconomía</h4>
          <p>Cada ficha declara de dónde sale el material y cómo se cosecha. El Agente Negocio pone precio al trabajo y al material, para que la pieza no se venda por debajo de lo que cuesta hacerla.</p>
        </div>
        <div class="eje">
          <h4>Biodiversidad</h4>
          <p>Semillas recogidas del suelo, fibra de cogollo sin tumbar la palmera, lianas de corte selectivo, madera caída. La trazabilidad hace visible esa práctica ante el comprador.</p>
        </div>
        <div class="eje">
          <h4>Comunidades</h4>
          <p>La tecnología entra por WhatsApp, que ellas ya usan. Nadie está obligada a instalar una app, y el agente deriva a una persona cuando no entiende: no decide por ellas.</p>
        </div>
      </div>
    </div>`;
  }

  /* --- pintado ----------------------------------------------------------------- */
  function pintar() {
    if (!raiz) return;
    const scroll = raiz.scrollTop;
    raiz.innerHTML = abierta ? vistaFicha() : vistaCatalogo();
    cablear();
    raiz.scrollTop = abierta ? 0 : scroll;
  }

  function cablear() {
    raiz.querySelectorAll('[data-filtro]').forEach((b) => {
      b.addEventListener('click', () => { filtro = b.dataset.filtro; pintar(); });
    });
    raiz.querySelectorAll('[data-pieza]').forEach((b) => {
      b.addEventListener('click', () => { abierta = b.dataset.pieza; pintar(); });
    });
    const volver = raiz.querySelector('#mk-volver');
    if (volver) volver.addEventListener('click', () => { abierta = null; pintar(); });

    const selC = raiz.querySelector('#mk-comprador');
    if (selC) selC.addEventListener('change', (e) => { compradorActivo = e.target.value; pintar(); });

    const pedir = raiz.querySelector('#mk-pedir');
    if (pedir) {
      pedir.addEventListener('click', async () => {
        const cant = Math.max(1, parseInt(raiz.querySelector('#mk-cant').value, 10) || 1);
        const cid = raiz.querySelector('#mk-quien').value;
        compradorActivo = cid;
        pedir.disabled = true; pedir.textContent = 'Enviando el pedido…';
        const pedido = await A().api.crearPedido(cid, [{ productoId: abierta, cantidad: cant }], 15);
        const prod = A().producto(abierta);
        const coord = S().asociacion.coordinadoraId;
        A().agregarMensaje(coord, {
          de: 'bot', tipo: 'chips',
          texto: ` *Pedido nuevo en el Mercado*\n${A().comprador(cid).nombre} pidió ${cant} ${cant === 1 ? prod.singular : prod.plural}.\n\nTotal: ${U().moneda(cant * prod.precio)}\nPedido: *${pedido.id}*`,
          botones: [{ id: 'pedido-aceptar-' + pedido.id, titulo: ' Confirmar el pedido' }],
        });
        A().notificar('pedido-aviso');
        abierta = null;
        pintar();
        U().avisar('mercado', `Pedido ${pedido.id} enviado. La coordinadora ya lo tiene en su WhatsApp.`);
      });
    }
  }

  MV.mercado = {
    montar,
    actualizar() { if (raiz) pintar(); },
    abrirPieza(pid) { abierta = pid; pintar(); },
    get compradorActivo() { return compradorActivo; },
  };
}(window.MV));
