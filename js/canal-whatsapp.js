/* ManosVivas · Canal 1 — el chat de WhatsApp
 * Es el canal principal: lo que la artesana escribe aquí mueve todo el sistema.
 */
window.MV = window.MV || {};

(function (MV) {
  'use strict';

  const A = () => MV.almacen;
  const S = () => MV.almacen.estado;
  const U = () => MV.ui;

  let raiz = null;
  let hilo = null;
  let pintados = new Set();
  let ultimoDia = null;
  let ocupado = false;

  const aid = () => S().personaActiva;
  const chat = () => S().chats[aid()];

  /* --- armazón ------------------------------------------------------------ */
  function montar(contenedor) {
    raiz = contenedor;
    raiz.innerHTML = `
      <div class="wa">
        <div class="wa__barra">
          <span class="wa__volver" aria-hidden="true">‹</span>
          <div class="wa__avatar" aria-hidden="true">MV</div>
          <div class="wa__quien">
            <div class="wa__nombre">ManosVivas</div>
            <div class="wa__estado" id="wa-estado">en línea</div>
          </div>
          <div class="wa__iconos" aria-hidden="true"><span></span><span></span><span>⋮</span></div>
        </div>
        <div class="wa__persona">
          <label for="wa-persona">Escribes como</label>
          <select id="wa-persona" aria-label="Elegir desde qué teléfono se escribe"></select>
          <span id="wa-comunidad" style="opacity:.8"></span>
        </div>
        <div class="wa__hilo" id="wa-hilo" role="log" aria-live="polite" aria-label="Conversación con ManosVivas"></div>
        <div class="wa__pie">
          <div class="wa__caja">
            <button type="button" id="wa-foto" aria-label="Enviar una foto" title="Enviar una foto"></button>
            <input id="wa-entrada" type="text" autocomplete="off"
              placeholder="Escribe un mensaje" aria-label="Escribe un mensaje">
            <button type="button" id="wa-audio" aria-label="Enviar un audio" title="Enviar un audio"></button>
          </div>
          <button type="button" class="wa__enviar" id="wa-enviar" aria-label="Enviar">➤</button>
        </div>
      </div>`;

    hilo = raiz.querySelector('#wa-hilo');
    const sel = raiz.querySelector('#wa-persona');
    sel.innerHTML = S().artesanas.map((a) =>
      `<option value="${a.id}">${a.corto} · ${a.rol === 'coordinadora' ? 'coordinadora' : 'artesana'}</option>`).join('');
    sel.value = aid();
    sel.addEventListener('change', () => { S().personaActiva = sel.value; A().notificar('persona'); });

    raiz.querySelector('#wa-enviar').addEventListener('click', enviarTexto);
    raiz.querySelector('#wa-entrada').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); enviarTexto(); }
    });
    raiz.querySelector('#wa-foto').addEventListener('click', () => {
      despachar({ tipo: 'texto', texto: 'quiero publicar una foto' }, 'Quiero publicar una foto');
    });
    raiz.querySelector('#wa-audio').addEventListener('click', menuAudio);

    redibujar(true);
  }

  /* --- entrada ------------------------------------------------------------- */
  function enviarTexto() {
    const campo = raiz.querySelector('#wa-entrada');
    const texto = campo.value.trim();
    if (!texto || ocupado) return;
    campo.value = '';
    despachar({ tipo: 'texto', texto }, texto);
  }

  function menuAudio() {
    if (ocupado) return;
    const prev = raiz.querySelector('.menu-audio');
    if (prev) { prev.remove(); return; }
    const caja = document.createElement('div');
    caja.className = 'chips menu-audio';
    caja.style.cssText = 'padding:0 12px 8px';
    caja.innerHTML = `
      <button class="chip" data-esc="claro"> Audio en castellano</button>
      <button class="chip" data-esc="nativo"> Audio en awajún</button>`;
    hilo.appendChild(caja);
    hilo.scrollTop = hilo.scrollHeight;
    caja.addEventListener('click', (e) => {
      const b = e.target.closest('[data-esc]');
      if (!b) return;
      const esc = b.dataset.esc;
      caja.remove();
      A().agregarMensaje(aid(), {
        de: 'yo', tipo: 'audio', escenario: esc, estado: 'leido',
        duracion: esc === 'claro' ? '0:07' : '0:11',
      });
      A().notificar('mensaje');
      despachar({ tipo: 'audio', escenario: esc }, null);
    });
  }

  /** Manda la entrada al agente y va soltando sus respuestas con ritmo humano. */
  async function despachar(entrada, textoVisible) {
    if (ocupado) return;
    ocupado = true;
    try {
      if (textoVisible) {
        const m = A().agregarMensaje(aid(), { de: 'yo', tipo: 'texto', texto: textoVisible, estado: 'enviando' });
        A().notificar('mensaje');
        setTimeout(() => { m.estado = 'leido'; A().notificar('acuse'); }, 700);
      }
      const respuestas = await MV.agente.responder(aid(), entrada);
      for (const r of respuestas) {
        mostrarEscribiendo(true);
        await new Promise((res) => setTimeout(res, 550 + Math.random() * 450));
        mostrarEscribiendo(false);
        A().agregarMensaje(aid(), r);
        A().notificar('mensaje-bot');
      }
    } catch (e) {
      console.error('[ManosVivas] el agente falló', e);
      mostrarEscribiendo(false);
      A().agregarMensaje(aid(), {
        de: 'bot', tipo: 'chips',
        texto: 'Se me cruzaron los cables un momento. ¿Probamos de nuevo?',
        botones: [{ id: 'menu', titulo: 'Ver el menú' }],
      });
      A().notificar('error');
    } finally {
      ocupado = false;
    }
  }

  function mostrarEscribiendo(v) {
    const est = raiz && raiz.querySelector('#wa-estado');
    if (est) est.textContent = v ? 'escribiendo…' : 'en línea';
    let el = hilo.querySelector('.escribiendo');
    if (v && !el) {
      el = document.createElement('div');
      el.className = 'escribiendo';
      el.innerHTML = '<i></i><i></i><i></i>';
      hilo.appendChild(el);
      hilo.scrollTop = hilo.scrollHeight;
    } else if (!v && el) { el.remove(); }
  }

  /* --- pintado ------------------------------------------------------------- */
  function redibujar(completo) {
    if (!raiz) return;
    const sel = raiz.querySelector('#wa-persona');
    if (sel.value !== aid()) { sel.value = aid(); completo = true; }
    const a = A().artesana(aid());
    raiz.querySelector('#wa-comunidad').textContent = `· ${a.comunidad}`;

    if (completo) { hilo.innerHTML = ''; pintados = new Set(); ultimoDia = null; }

    const msgs = chat().mensajes;
    msgs.forEach((m) => {
      if (pintados.has(m.id)) { actualizarAcuse(m); return; }
      const dia = U().diaRelativo(m.ts);
      if (dia !== ultimoDia) {
        ultimoDia = dia;
        const sep = document.createElement('div');
        sep.className = 'wa__dia';
        sep.textContent = dia;
        hilo.appendChild(sep);
      }
      hilo.appendChild(nodo(m));
      pintados.add(m.id);
    });
    const esc = hilo.querySelector('.escribiendo');
    if (esc) hilo.appendChild(esc);
    hilo.scrollTop = hilo.scrollHeight;
  }

  function actualizarAcuse(m) {
    const el = hilo.querySelector(`[data-msg="${m.id}"] .ticks`);
    if (el && m.estado === 'leido') el.classList.add('leido');
  }

  function pie(m) {
    const ticks = m.de === 'yo'
      ? `<span class="ticks" aria-label="${m.estado === 'leido' ? 'Leído' : 'Enviado'}">✓✓</span>` : '';
    return `<div class="burbuja__pie"><span class="burbuja__hora num">${U().horaDe(m.ts)}</span>${ticks}</div>`;
  }

  function nota(m) {
    return m.nota ? `<span class="burbuja__nota">ⓘ ${U().escapar(m.nota)}</span>` : '';
  }

  function nodo(m) {
    const caja = document.createElement('div');
    caja.dataset.msg = m.id;
    caja.style.display = 'contents';

    /* --- tarjetas especiales --- */
    if (m.tipo === 'venta') { caja.appendChild(tarjetaVenta(m)); return caja; }
    if (m.tipo === 'resumen') { caja.appendChild(tarjetaResumen(m)); return caja; }
    if (m.tipo === 'ficha') { caja.appendChild(tarjetaFicha(m)); return caja; }
    if (m.tipo === 'desglose') { caja.appendChild(tarjetaDesglose(m)); return caja; }

    const b = document.createElement('div');
    b.className = 'burbuja burbuja--' + (m.de === 'yo' ? 'yo' : 'bot');

    if (m.tipo === 'audio') {
      b.innerHTML = `<div class="audio-falso" style="background:transparent;padding:2px 0">
          <button class="audio-falso__play" aria-label="Reproducir audio">▶</button>
          <span class="onda" aria-hidden="true">${Array.from({ length: 22 }, (_, i) =>
            `<i style="height:${5 + ((i * 7) % 14)}px"></i>`).join('')}</span>
          <span class="num" style="font-size:11px">${m.duracion || '0:08'}</span>
        </div>${pie(m)}`;
    } else if (m.tipo === 'imagen') {
      const f = m.foto;
      b.innerHTML = `${U().ilustracion({ id: f.ref, nombre: f.etiqueta, motivo: f.motivo, colores: f.colores }, 'pieza-foto')}
        <div style="font-size:11px;color:var(--tinta-3);margin-top:5px">Foto de ejemplo · ${U().escapar(f.etiqueta)}</div>${pie(m)}`;
    } else if (m.tipo === 'codigo') {
      b.innerHTML = `${U().formatoWa(m.texto)}
        <div class="otp" aria-label="Código ${m.codigo.split('').join(' ')}">${m.codigo.split('').map((d) => `<span>${d}</span>`).join('')}</div>
        ${pie(m)}`;
    } else {
      b.innerHTML = `${U().formatoWa(m.texto || '')}${nota(m)}${pie(m)}`;
    }
    caja.appendChild(b);

    if (m.tipo === 'chips' && m.botones && m.botones.length) {
      const fila = document.createElement('div');
      fila.className = 'chips';
      fila.innerHTML = m.botones.map((x) =>
        `<button class="chip" data-boton="${U().escapar(x.id)}">${U().escapar(x.titulo)}</button>`).join('');
      fila.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-boton]');
        if (!btn || ocupado) return;
        fila.querySelectorAll('.chip').forEach((c) => { c.disabled = true; c.style.opacity = '.45'; });
        despachar({ tipo: 'boton', idBoton: btn.dataset.boton }, btn.textContent);
      });
      caja.appendChild(fila);
    }
    return caja;
  }

  /* --- tarjetas ------------------------------------------------------------ */
  function envoltura(cabeza, cuerpo, pieTexto) {
    const d = document.createElement('div');
    d.className = 'tarjeta-wa';
    d.innerHTML = `<div class="tarjeta-wa__cabeza">${cabeza}</div>
      <div class="tarjeta-wa__cuerpo">${cuerpo}</div>
      ${pieTexto ? `<div class="tarjeta-wa__pie">${pieTexto}</div>` : ''}`;
    return d;
  }

  function tarjetaVenta(m) {
    return envoltura(
      `<span aria-hidden="true"></span> ${U().escapar(m.titulo)}`,
      `<div class="cifras">
        <div class="cifra"><div class="cifra__et">Ingreso por esta venta</div><div class="cifra__v">${U().moneda(m.monto)}</div></div>
        <div class="cifra"><div class="cifra__et">Piezas vendidas</div><div class="cifra__v">${m.cantidad}</div></div>
      </div>
      <p style="margin-top:9px;font-size:12.5px;color:var(--tinta-2)">${U().escapar(m.producto)}</p>`,
      `Hoy llevas <b class="num">${U().moneda(m.acumulado.ventas)}</b> en ${m.acumulado.piezas} pieza${m.acumulado.piezas === 1 ? '' : 's'}.`
    );
  }

  function tarjetaResumen(m) {
    const r = m.resumen;
    if (r.vacio) {
      return envoltura('<span aria-hidden="true"></span> Resumen de hoy',
        '<p style="font-size:13px;color:var(--tinta-2)">Todavía no has anotado nada hoy. Cuéntame tu primera venta y empezamos. </p>');
    }
    const linea = (et, v, color, signo) =>
      `<div class="linea"><span>${color ? `<span class="linea__pt" style="background:${color}"></span>` : ''}${et}</span><span>${signo || ''}${U().moneda(v)}</span></div>`;

    let cuerpo = `<div class="lineas">
      ${linea('Ventas del día', r.ventas, 'var(--s2)')}
      ${linea('Materiales usados', r.materiales, 'var(--s1)', '− ')}
      ${linea('Empaque y transporte', r.empaque, 'var(--s3)', '− ')}
      ${linea('Valor de tu trabajo', r.trabajo, 'var(--s4)', '− ')}
      <div class="linea linea--total"><span>Ganancia estimada</span><span>${U().moneda(r.ganancia)}</span></div>
    </div>`;

    if (r.compras > 0) {
      cuerpo += `<div style="margin-top:11px;padding:10px;background:var(--oro-claro);border-radius:8px;font-size:12px">
        <b>Aparte:</b> hoy compraste ${U().moneda(r.compras)} en material para próximos trabajos.
        Salió de tu caja, pero no lo descuento de esta ganancia: ese material todavía no se ha vendido.</div>`;
    }

    return envoltura('<span aria-hidden="true"></span> Resumen de hoy', cuerpo,
      `El valor de tu trabajo (${U().moneda(r.trabajo)}) es tuyo: es el pago de tus horas, no una pérdida.`);
  }

  function tarjetaFicha(m) {
    const f = S().fichas.find((x) => x.id === m.fichaId);
    if (!f) return envoltura('Ficha', '<p>Esta ficha ya no está disponible.</p>');
    const foto = MV.agente.FOTOS.find((x) => x.ref === f.fotoRef) || { motivo: f.motivo, colores: f.colores };
    return envoltura(
      `<span aria-hidden="true"></span> Ficha lista para revisar`,
      `${U().ilustracion({ id: f.id, nombre: f.nombre, motivo: foto.motivo, colores: foto.colores }, 'pieza-foto')}
      <div style="margin-top:10px;display:flex;flex-direction:column;gap:9px">
        <div><div class="rotulo">Nombre</div><div style="font-family:var(--display);font-weight:600;font-size:15px">${U().escapar(f.nombre)}</div></div>
        <div><div class="rotulo">Descripción</div><div style="font-size:12.8px;color:var(--tinta-2)">${U().escapar(f.descripcion)}</div></div>
        <div><div class="rotulo">Precio</div><div class="num" style="font-size:17px;font-weight:700">${U().moneda(f.precio)}</div></div>
        <div><div class="rotulo">Publicación para redes</div>
          <div style="font-size:12.5px;color:var(--tinta-2);white-space:pre-wrap;background:var(--superficie-2);padding:9px;border-radius:8px">${U().escapar(f.post)}</div></div>
        <div><div class="rotulo">Estado de WhatsApp</div>
          <div style="font-size:12.5px;color:var(--tinta-2)">${U().escapar(f.estadoWa)}</div></div>
      </div>`,
      'Nada se publica sin que tú lo apruebes.'
    );
  }

  function tarjetaDesglose(m) {
    const p = A().producto(m.productoId);
    return envoltura(`<span aria-hidden="true"></span> Cómo se arma el precio de tu ${U().escapar(p.singular)}`,
      U().desglosePrecio(p));
  }

  /* --- público -------------------------------------------------------------- */
  MV.whatsapp = {
    montar,
    actualizar(motivo) {
      if (!raiz) return;
      redibujar(motivo === 'persona' || motivo === 'inicio' || motivo === 'reinicio');
    },
    /** usado por la demo guiada y por los otros canales */
    enviarComo(artesanaId, entrada, textoVisible) {
      S().personaActiva = artesanaId;
      A().notificar('persona');
      return despachar(entrada, textoVisible);
    },
    /** Mover el nodo entre vistas pierde el scroll; esto lo devuelve al final. */
    alFondo() { if (hilo) hilo.scrollTop = hilo.scrollHeight; },
    escribirEnCaja(texto) {
      const campo = raiz && raiz.querySelector('#wa-entrada');
      if (campo) { campo.value = texto; campo.focus(); }
    },
    get ocupado() { return ocupado; },
  };
}(window.MV));
