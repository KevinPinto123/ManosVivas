/* ManosVivas · Canal 1 — el chat de WhatsApp
 * Es el canal principal: lo que la artesana escribe aquí mueve todo el sistema.
 * La interfaz imita WhatsApp a propósito: el jurado tiene que reconocerla de
 * inmediato. Los colores de esta pantalla son los de WhatsApp, no los de la marca.
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

  /* --- iconos -------------------------------------------------------------- */
  const IC = {
    volver: '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    video: '<path d="M3 7.5A1.5 1.5 0 014.5 6h8A1.5 1.5 0 0114 7.5v9A1.5 1.5 0 0112.5 18h-8A1.5 1.5 0 013 16.5v-9z" fill="currentColor"/><path d="M15.5 10.5l4-2.5v8l-4-2.5z" fill="currentColor"/>',
    llamar: '<path d="M6.6 4.2l1.9 3.3-1.6 1.7a11 11 0 004.9 4.9l1.7-1.6 3.3 1.9v3a1.6 1.6 0 01-1.8 1.6C9.5 18.3 4.7 13.5 4 6.9A1.6 1.6 0 015.6 5h1z" fill="currentColor"/>',
    menu: '<circle cx="11" cy="4.5" r="1.7" fill="currentColor"/><circle cx="11" cy="11" r="1.7" fill="currentColor"/><circle cx="11" cy="17.5" r="1.7" fill="currentColor"/>',
    emoji: '<circle cx="11" cy="11" r="8.2" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="8.2" cy="9" r="1.2" fill="currentColor"/><circle cx="13.8" cy="9" r="1.2" fill="currentColor"/><path d="M7.4 13.4a4.4 4.4 0 007.2 0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    clip: '<path d="M15.4 9.3l-5.6 5.6a3 3 0 01-4.2-4.2l6.6-6.6a2 2 0 012.8 2.8l-6.6 6.6a1 1 0 01-1.4-1.4l5.6-5.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    camara: '<path d="M3.6 7.4h3l1.3-2h5.2l1.3 2h3a1.4 1.4 0 011.4 1.4v7.4a1.4 1.4 0 01-1.4 1.4H3.6a1.4 1.4 0 01-1.4-1.4V8.8a1.4 1.4 0 011.4-1.4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="11" cy="12.4" r="3.1" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    micro: '<rect x="8.4" y="2.6" width="5.2" height="10" rx="2.6" fill="currentColor"/><path d="M5.4 10.6a5.6 5.6 0 0011.2 0M11 16.2v3.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    enviar: '<path d="M2.6 11L19 3.4 11.4 19.8l-1.9-6.9-6.9-1.9z" fill="currentColor"/>',
    play: '<path d="M6.5 4.2l10 6.8-10 6.8z" fill="currentColor"/>',
    pausa: '<rect x="5.6" y="4.2" width="3.6" height="13.6" rx="1" fill="currentColor"/><rect x="12.8" y="4.2" width="3.6" height="13.6" rx="1" fill="currentColor"/>',
    galeria: '<rect x="2.6" y="4.2" width="16.8" height="13.6" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="7.4" cy="9" r="1.6" fill="currentColor"/><path d="M3.4 15.6l4.6-4.2 3.4 3 3-2.4 4.2 3.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
    subir: '<path d="M11 15.4V4.6M6.8 8.8L11 4.6l4.2 4.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.6 14v3a1.4 1.4 0 001.4 1.4h12a1.4 1.4 0 001.4-1.4v-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    onda: '<path d="M4 11h1.6M8 6.8v8.4M11.6 4.4v13.2M15.2 7.6v6.8M18.4 9.8v2.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    senal: '<path d="M1 10h2.6v4H1zM5 7.4h2.6V14H5zM9 4.6h2.6V14H9zM13 2h2.6v12H13z" fill="currentColor"/>',
    bateria: '<rect x="1" y="3" width="17" height="10" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="5" width="12" height="6" rx="1" fill="currentColor"/><path d="M20 6.6v2.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  };
  const ico = (n, tam) => `<svg class="ic" viewBox="0 0 22 22" width="${tam || 22}" height="${tam || 22}" aria-hidden="true">${IC[n]}</svg>`;

  /* --- armazón ------------------------------------------------------------- */
  function montar(contenedor) {
    raiz = contenedor;
    raiz.innerHTML = `
      <div class="wa">
        <div class="wa__sistema" aria-hidden="true">
          <span class="wa__reloj num">${U().horaDe(new Date().toISOString())}</span>
          <span class="wa__sistema-der">${ico('senal', 15)}${ico('bateria', 20)}</span>
        </div>

        <header class="wa__barra">
          <button type="button" class="wa__icono wa__volver" aria-label="Volver">${ico('volver')}</button>
          <div class="wa__avatar" aria-hidden="true"><img src="img/Logo_vector.svg" alt=""></div>
          <div class="wa__quien">
            <div class="wa__nombre">ManosVivas</div>
            <div class="wa__estado" id="wa-estado">en línea</div>
          </div>
          <button type="button" class="wa__icono" aria-label="Videollamada">${ico('video')}</button>
          <button type="button" class="wa__icono" aria-label="Llamar">${ico('llamar')}</button>
          <button type="button" class="wa__icono" aria-label="Más opciones">${ico('menu')}</button>
        </header>

        <div class="wa__persona">
          <label for="wa-persona">Escribes como</label>
          <select id="wa-persona" aria-label="Elegir desde qué teléfono se escribe"></select>
          <span id="wa-comunidad"></span>
        </div>

        <div class="wa__hilo" id="wa-hilo" role="log" aria-live="polite" aria-label="Conversación con ManosVivas"></div>

        <div class="wa__bandeja" id="wa-bandeja" hidden>
          <div class="wa__bandeja-rejilla">
            <button type="button" class="adj adj--foto" data-adj="galeria">
              <span class="adj__ic">${ico('galeria', 24)}</span>Foto de ejemplo
            </button>
            <button type="button" class="adj adj--subir" data-adj="subir">
              <span class="adj__ic">${ico('subir', 24)}</span>Subir una foto
            </button>
            <button type="button" class="adj adj--audio" data-adj="audio-claro">
              <span class="adj__ic">${ico('micro', 24)}</span>Audio en castellano
            </button>
            <button type="button" class="adj adj--audio2" data-adj="audio-nativo">
              <span class="adj__ic">${ico('onda', 24)}</span>Audio en awajún
            </button>
          </div>
          <p class="wa__bandeja-nota">En la demo las fotos y los audios son de ejemplo. La artesana enviaría los suyos.</p>
        </div>

        <input type="file" id="wa-archivo" accept="image/*" hidden>

        <div class="wa__pie">
          <div class="wa__caja">
            <span class="wa__caja-ic" aria-hidden="true">${ico('emoji')}</span>
            <input id="wa-entrada" type="text" autocomplete="off"
              placeholder="Mensaje" aria-label="Escribe un mensaje">
            <button type="button" class="wa__caja-ic" id="wa-clip" aria-label="Adjuntar foto o audio">${ico('clip')}</button>
            <button type="button" class="wa__caja-ic" id="wa-camara" aria-label="Enviar una foto">${ico('camara')}</button>
          </div>
          <button type="button" class="wa__enviar" id="wa-enviar" aria-label="Enviar un audio">
            <span id="wa-enviar-ic">${ico('micro', 21)}</span>
          </button>
        </div>
      </div>`;

    hilo = raiz.querySelector('#wa-hilo');
    const sel = raiz.querySelector('#wa-persona');
    sel.innerHTML = S().artesanas.map((a) =>
      `<option value="${a.id}">${a.corto} · ${a.rol === 'coordinadora' ? 'coordinadora' : 'artesana'}</option>`).join('');
    sel.value = aid();
    sel.addEventListener('change', () => { S().personaActiva = sel.value; A().notificar('persona'); });

    const campo = raiz.querySelector('#wa-entrada');
    const botonEnviar = raiz.querySelector('#wa-enviar');
    const iconoEnviar = raiz.querySelector('#wa-enviar-ic');

    // El botón pasa de micrófono a avión cuando hay texto, como en WhatsApp.
    campo.addEventListener('input', () => {
      const hay = campo.value.trim().length > 0;
      iconoEnviar.innerHTML = ico(hay ? 'enviar' : 'micro', 21);
      botonEnviar.setAttribute('aria-label', hay ? 'Enviar mensaje' : 'Enviar un audio');
    });
    campo.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); enviarTexto(); }
    });
    botonEnviar.addEventListener('click', () => {
      if (campo.value.trim()) enviarTexto();
      else alternarBandeja(true);
    });

    raiz.querySelector('#wa-clip').addEventListener('click', () => alternarBandeja());
    raiz.querySelector('#wa-camara').addEventListener('click', () => alternarBandeja(true));

    raiz.querySelector('#wa-bandeja').addEventListener('click', (e) => {
      const b = e.target.closest('[data-adj]');
      if (!b) return;
      alternarBandeja(false);
      const q = b.dataset.adj;
      if (q === 'galeria') despachar({ tipo: 'boton', idBoton: 'foto' }, null);
      else if (q === 'subir') raiz.querySelector('#wa-archivo').click();
      else enviarAudio(q === 'audio-claro' ? 'claro' : 'nativo');
    });

    raiz.querySelector('#wa-archivo').addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      e.target.value = '';
      if (f) enviarFotoPropia(f);
    });

    redibujar(true);
  }

  function alternarBandeja(forzar) {
    const b = raiz.querySelector('#wa-bandeja');
    b.hidden = forzar === undefined ? !b.hidden : !forzar;
    if (!b.hidden) hilo.scrollTop = hilo.scrollHeight;
  }

  /* --- entrada -------------------------------------------------------------- */
  function enviarTexto() {
    const campo = raiz.querySelector('#wa-entrada');
    const texto = campo.value.trim();
    if (!texto || ocupado) return;
    campo.value = '';
    campo.dispatchEvent(new Event('input'));
    despachar({ tipo: 'texto', texto }, texto);
  }

  function enviarAudio(escenario) {
    if (ocupado) return;
    A().agregarMensaje(aid(), {
      de: 'yo', tipo: 'audio', escenario, estado: 'leido', artesanaId: aid(),
      duracion: escenario === 'claro' ? '0:07' : '0:11',
    });
    A().notificar('mensaje');
    despachar({ tipo: 'audio', escenario }, null);
  }

  /** Foto real de quien presenta. El agente no la analiza y lo dice. */
  function enviarFotoPropia(archivo) {
    if (ocupado) return;
    if (!/^image\//.test(archivo.type)) {
      A().agregarMensaje(aid(), { de: 'bot', tipo: 'texto', texto: 'Ese archivo no es una imagen. Mándame una foto.' });
      A().notificar('mensaje');
      return;
    }
    if (archivo.size > 6 * 1024 * 1024) {
      A().agregarMensaje(aid(), { de: 'bot', tipo: 'texto', texto: 'Esa foto pesa más de 6 MB y no la puedo abrir en la demo. Prueba con una más liviana.' });
      A().notificar('mensaje');
      return;
    }
    const lector = new FileReader();
    lector.onload = () => {
      A().agregarMensaje(aid(), { de: 'yo', tipo: 'imagen', url: lector.result, estado: 'leido' });
      A().notificar('mensaje');
      despachar({ tipo: 'imagen-propia', url: lector.result }, null);
    };
    lector.onerror = () => {
      A().agregarMensaje(aid(), { de: 'bot', tipo: 'texto', texto: 'No pude abrir esa foto. Intenta con otra.' });
      A().notificar('mensaje');
    };
    lector.readAsDataURL(archivo);
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

  /* --- pintado -------------------------------------------------------------- */
  function redibujar(completo) {
    if (!raiz) return;
    const sel = raiz.querySelector('#wa-persona');
    if (sel.value !== aid()) { sel.value = aid(); completo = true; }
    raiz.querySelector('#wa-comunidad').textContent = A().artesana(aid()).comunidad;

    if (completo) { hilo.innerHTML = ''; pintados = new Set(); ultimoDia = null; }

    chat().mensajes.forEach((m) => {
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
      ? `<span class="ticks${m.estado === 'leido' ? ' leido' : ''}" aria-label="${m.estado === 'leido' ? 'Leído' : 'Enviado'}">
           <svg viewBox="0 0 18 12" width="17" height="12" aria-hidden="true"><path d="M1.6 6.6l2.6 2.6L9.5 3.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.6 6.6l2.6 2.6 5.3-5.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
         </span>` : '';
    return `<span class="burbuja__pie"><span class="burbuja__hora num">${U().horaDe(m.ts)}</span>${ticks}</span>`;
  }

  function nota(m) {
    return m.nota ? `<span class="burbuja__nota">${U().escapar(m.nota)}</span>` : '';
  }

  const SELLO = { venta: 'Agente Negocio', resumen: 'Agente Negocio', desglose: 'Agente Negocio', ficha: 'Agente Marca' };

  function nodo(m) {
    const caja = document.createElement('div');
    caja.dataset.msg = m.id;
    caja.style.display = 'contents';

    if (m.tipo === 'venta') { caja.appendChild(tarjetaVenta(m)); return caja; }
    if (m.tipo === 'resumen') { caja.appendChild(tarjetaResumen(m)); return caja; }
    if (m.tipo === 'ficha') { caja.appendChild(tarjetaFicha(m)); return caja; }
    if (m.tipo === 'desglose') { caja.appendChild(tarjetaDesglose(m)); return caja; }

    const b = document.createElement('div');
    b.className = 'burbuja burbuja--' + (m.de === 'yo' ? 'yo' : 'bot');

    if (m.tipo === 'audio') {
      b.classList.add('burbuja--audio');
      b.innerHTML = reproductor(m) + pie(m) + nota(m);
      cablearAudio(b);
    } else if (m.tipo === 'imagen') {
      b.classList.add('burbuja--media');
      const cuerpo = m.url
        ? `<img src="${m.url}" alt="Foto enviada desde el teléfono" class="pieza-foto">`
        : U().ilustracion({ id: m.foto.ref, nombre: m.foto.etiqueta, motivo: m.foto.motivo, colores: m.foto.colores }, 'pieza-foto');
      b.innerHTML = `<span class="media">${cuerpo}<span class="media__pie">${pie(m)}</span></span>`;
    } else if (m.tipo === 'codigo') {
      b.innerHTML = `<span class="burbuja__txt">${U().formatoWa(m.texto)}</span>
        <span class="otp" aria-label="Código ${m.codigo.split('').join(' ')}">${m.codigo.split('').map((d) => `<span>${d}</span>`).join('')}</span>
        ${pie(m)}`;
    } else {
      b.innerHTML = `<span class="burbuja__txt">${U().formatoWa(m.texto || '')}</span>${nota(m)}${pie(m)}`;
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
        fila.querySelectorAll('.chip').forEach((c) => { c.disabled = true; });
        fila.classList.add('chips--usados');
        despachar({ tipo: 'boton', idBoton: btn.dataset.boton }, btn.textContent);
      });
      caja.appendChild(fila);
    }
    return caja;
  }

  /* --- audio ---------------------------------------------------------------- */
  function reproductor(m) {
    const a = A().artesana(m.artesanaId || aid());
    const barras = Array.from({ length: 26 }, (_, i) =>
      `<i style="height:${4 + ((i * 7 + (i % 5) * 11) % 15)}px"></i>`).join('');
    return `<span class="audio">
      <button type="button" class="audio__play" aria-label="Reproducir el audio">${ico('play', 20)}</button>
      <span class="audio__onda" aria-hidden="true">${barras}</span>
      <span class="audio__dur num">${m.duracion || '0:08'}</span>
      <span class="audio__av" aria-hidden="true" style="background:${a.color}">${a.inicial}</span>
    </span>`;
  }

  function cablearAudio(b) {
    const boton = b.querySelector('.audio__play');
    if (!boton) return;
    const barras = b.querySelectorAll('.audio__onda i');
    let t = null;
    function detener() {
      if (t) clearInterval(t);
      t = null;
      boton.innerHTML = ico('play', 20);
      barras.forEach((x) => x.classList.remove('on'));
    }
    boton.addEventListener('click', () => {
      if (t) { detener(); return; }
      boton.innerHTML = ico('pausa', 20);
      let i = 0;
      t = setInterval(() => {
        barras.forEach((x, k) => x.classList.toggle('on', k <= i));
        i += 1;
        if (i > barras.length) detener();
      }, 80);
    });
  }

  /* --- tarjetas ------------------------------------------------------------- */
  function envoltura(tipo, cabeza, cuerpo, pieTexto) {
    const d = document.createElement('div');
    d.className = 'tarjeta-wa';
    const sello = SELLO[tipo] ? `<span class="tarjeta-wa__sello">${SELLO[tipo]}</span>` : '';
    d.innerHTML = `<div class="tarjeta-wa__cabeza"><span>${cabeza}</span>${sello}</div>
      <div class="tarjeta-wa__cuerpo">${cuerpo}</div>
      ${pieTexto ? `<div class="tarjeta-wa__pie">${pieTexto}</div>` : ''}`;
    return d;
  }

  function tarjetaVenta(m) {
    return envoltura('venta', U().escapar(m.titulo),
      `<div class="cifras">
        <div class="cifra"><div class="cifra__et">Ingreso por esta venta</div><div class="cifra__v">${U().moneda(m.monto)}</div></div>
        <div class="cifra"><div class="cifra__et">Piezas vendidas</div><div class="cifra__v">${m.cantidad}</div></div>
      </div>
      <p class="tarjeta-wa__detalle">${U().escapar(m.producto)}</p>`,
      `Hoy llevas <b class="num">${U().moneda(m.acumulado.ventas)}</b> en ${m.acumulado.piezas} pieza${m.acumulado.piezas === 1 ? '' : 's'}.`
    );
  }

  function tarjetaResumen(m) {
    const r = m.resumen;
    if (r.vacio) {
      return envoltura('resumen', 'Resumen de hoy',
        '<p class="tarjeta-wa__detalle">Todavía no has anotado nada hoy. Cuéntame tu primera venta y empezamos.</p>');
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
      cuerpo += `<div class="tarjeta-wa__aviso">
        <b>Aparte:</b> hoy compraste ${U().moneda(r.compras)} en material para próximos trabajos.
        Salió de tu caja, pero no lo descuento de esta ganancia: ese material todavía no se ha vendido.</div>`;
    }

    return envoltura('resumen', 'Resumen de hoy', cuerpo,
      `El valor de tu trabajo (${U().moneda(r.trabajo)}) es tuyo: es el pago de tus horas, no una pérdida.`);
  }

  function tarjetaFicha(m) {
    const f = S().fichas.find((x) => x.id === m.fichaId);
    if (!f) return envoltura('ficha', 'Ficha', '<p class="tarjeta-wa__detalle">Esta ficha ya no está disponible.</p>');
    const foto = MV.agente.FOTOS.find((x) => x.ref === f.fotoRef) || { motivo: f.motivo, colores: f.colores };
    const imagen = f.url
      ? `<img src="${f.url}" alt="Foto de la pieza" class="pieza-foto">`
      : U().ilustracion({ id: f.id, nombre: f.nombre, motivo: foto.motivo, colores: foto.colores }, 'pieza-foto');
    return envoltura('ficha', 'Ficha lista para revisar',
      `${imagen}
      <div class="ficha-wa">
        <div><div class="rotulo">Nombre</div><div class="ficha-wa__nombre">${U().escapar(f.nombre)}</div></div>
        <div><div class="rotulo">Descripción</div><div class="ficha-wa__txt">${U().escapar(f.descripcion)}</div></div>
        <div><div class="rotulo">Precio</div><div class="num ficha-wa__precio">${U().moneda(f.precio)}</div></div>
        <div><div class="rotulo">Publicación para redes</div><div class="ficha-wa__post">${U().escapar(f.post)}</div></div>
        <div><div class="rotulo">Estado de WhatsApp</div><div class="ficha-wa__txt">${U().escapar(f.estadoWa)}</div></div>
      </div>`,
      'Nada se publica sin que tú lo apruebes.'
    );
  }

  function tarjetaDesglose(m) {
    const p = A().producto(m.productoId);
    return envoltura('desglose', `Cómo se arma el precio de tu ${U().escapar(p.singular)}`,
      U().desglosePrecio(p));
  }

  /* --- público --------------------------------------------------------------- */
  MV.whatsapp = {
    montar,
    actualizar(motivo) {
      if (!raiz) return;
      redibujar(motivo === 'persona' || motivo === 'inicio' || motivo === 'reinicio');
    },
    enviarComo(artesanaId, entrada, textoVisible) {
      S().personaActiva = artesanaId;
      A().notificar('persona');
      return despachar(entrada, textoVisible);
    },
    alFondo() { if (hilo) hilo.scrollTop = hilo.scrollHeight; },
    escribirEnCaja(texto) {
      const campo = raiz && raiz.querySelector('#wa-entrada');
      if (campo) { campo.value = texto; campo.dispatchEvent(new Event('input')); campo.focus(); }
    },
    get ocupado() { return ocupado; },
  };
}(window.MV));
