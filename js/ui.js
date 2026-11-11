/* ManosVivas · Piezas de interfaz compartidas por los tres canales. */
window.MV = window.MV || {};

(function (MV) {
  'use strict';

  const A = () => MV.almacen;

  function escapar(t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Negrita *así* y cursiva _así_, como en WhatsApp. */
  function formatoWa(t) {
    return escapar(t)
      .replace(/\*([^*\n]+)\*/g, '<b>$1</b>')
      .replace(/_([^_\n]+)_/g, '<em>$1</em>');
  }

  function moneda(n) {
    const v = Math.round(n * 100) / 100;
    return A().estado.config.moneda + v.toLocaleString('es-PE', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 });
  }

  function horaDe(iso) {
    const d = new Date(iso);
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  function fechaCorta(iso) {
    return new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
  }

  function diaRelativo(iso) {
    const d = new Date(iso); d.setHours(0, 0, 0, 0);
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const dif = Math.round((hoy - d) / 86400000);
    if (dif === 0) return 'HOY';
    if (dif === 1) return 'AYER';
    return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long' }).toUpperCase();
  }

  function faltan(iso) {
    const dias = Math.ceil((new Date(iso) - Date.now()) / 86400000);
    if (dias < 0) return `hace ${Math.abs(dias)} d`;
    if (dias === 0) return 'hoy';
    return `en ${dias} d`;
  }

  /* --- ilustración generada de cada pieza ---------------------------------
   * No hay fotos reales: se dibuja un motivo geométrico abstracto a partir del
   * producto. Deliberadamente abstracto: no reproduce ni interpreta diseños
   * de ningún pueblo.
   */
  function ilustracion(p, clase) {
    const [c1, c2] = p.colores || ['#123F1B', '#E8EDD6'];
    const sem = (p.id || 'x').split('').reduce((s, ch) => s + ch.charCodeAt(0), 0);
    const id = 'mot' + sem + (p.motivo || 'x');
    let patron = '';

    if (p.motivo === 'rombos') {
      patron = `<pattern id="${id}" width="26" height="26" patternUnits="userSpaceOnUse">
        <rect width="26" height="26" fill="${c2}"/>
        <path d="M13 3 L23 13 L13 23 L3 13 Z" fill="none" stroke="${c1}" stroke-width="2.4"/>
        <circle cx="13" cy="13" r="2.6" fill="${c1}"/></pattern>`;
    } else if (p.motivo === 'zigzag') {
      patron = `<pattern id="${id}" width="30" height="18" patternUnits="userSpaceOnUse">
        <rect width="30" height="18" fill="${c2}"/>
        <path d="M0 14 L7.5 4 L15 14 L22.5 4 L30 14" fill="none" stroke="${c1}" stroke-width="2.6" stroke-linejoin="round"/></pattern>`;
    } else if (p.motivo === 'ondas') {
      patron = `<pattern id="${id}" width="34" height="20" patternUnits="userSpaceOnUse">
        <rect width="34" height="20" fill="${c2}"/>
        <path d="M0 10 Q8.5 1 17 10 T34 10" fill="none" stroke="${c1}" stroke-width="2.4"/>
        <path d="M0 18 Q8.5 9 17 18 T34 18" fill="none" stroke="${c1}" stroke-width="1.2" opacity=".5"/></pattern>`;
    } else if (p.motivo === 'espiral') {
      patron = `<pattern id="${id}" width="32" height="32" patternUnits="userSpaceOnUse">
        <rect width="32" height="32" fill="${c2}"/>
        <circle cx="16" cy="16" r="12" fill="none" stroke="${c1}" stroke-width="1.8"/>
        <circle cx="16" cy="16" r="7.5" fill="none" stroke="${c1}" stroke-width="1.8"/>
        <circle cx="16" cy="16" r="3" fill="${c1}"/></pattern>`;
    } else if (p.motivo === 'franjas') {
      patron = `<pattern id="${id}" width="22" height="22" patternUnits="userSpaceOnUse">
        <rect width="22" height="22" fill="${c2}"/>
        <rect y="0" width="22" height="5" fill="${c1}"/>
        <rect y="11" width="22" height="2" fill="${c1}" opacity=".55"/></pattern>`;
    } else { /* trama */
      patron = `<pattern id="${id}" width="20" height="20" patternUnits="userSpaceOnUse">
        <rect width="20" height="20" fill="${c2}"/>
        <rect x="0" y="0" width="9" height="9" fill="${c1}"/>
        <rect x="11" y="11" width="9" height="9" fill="${c1}" opacity=".6"/></pattern>`;
    }

    return `<svg class="${clase || 'pieza__img'}" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice"
      role="img" aria-label="Ilustración de referencia de ${escapar(p.nombre)}">
      <defs>${patron}</defs>
      <rect width="200" height="150" fill="url(#${id})"/>
      <rect width="200" height="150" fill="none" stroke="rgba(0,0,0,.08)" stroke-width="2"/>
    </svg>`;
  }

  function avatar(a, tam) {
    const t = tam || 36;
    return `<div class="avatar" style="background:${a.color};width:${t}px;height:${t}px;font-size:${Math.round(t * .4)}px" aria-hidden="true">${a.inicial}</div>`;
  }

  const ETIQUETAS_ESTADO = {
    solicitado: { t: 'Esperando confirmación', c: 'nuevo' },
    confirmado: { t: 'Confirmado', c: 'produccion' },
    'en produccion': { t: 'En producción', c: 'produccion' },
    listo: { t: 'Listo para enviar', c: 'listo' },
    enviado: { t: 'Enviado', c: 'enviado' },
  };

  function insignia(estado) {
    const e = ETIQUETAS_ESTADO[estado] || { t: estado, c: 'enviado' };
    return `<span class="insignia insignia--${e.c}"><i class="insignia__pt"></i>${e.t}</span>`;
  }

  /* --- avisos cruzados ---------------------------------------------------- */
  const ICONOS_CANAL = { whatsapp: '', app: '', mercado: '' };
  const NOMBRE_CANAL = { whatsapp: 'WhatsApp', app: 'App de la coordinadora', mercado: 'Mercado' };

  function avisar(canal, texto) {
    const caja = document.getElementById('avisos');
    if (!caja) return;
    const el = document.createElement('div');
    el.className = 'aviso aviso--' + canal;
    el.setAttribute('role', 'status');
    el.innerHTML = `<span class="aviso__ic" aria-hidden="true">${ICONOS_CANAL[canal] || ''}</span>
      <div><div class="aviso__canal">${NOMBRE_CANAL[canal] || canal}</div>
      <div class="aviso__t">${escapar(texto)}</div></div>`;
    caja.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity .3s, transform .3s';
      el.style.opacity = '0'; el.style.transform = 'translateX(16px)';
      setTimeout(() => el.remove(), 320);
    }, 5200);
  }

  /* --- gráfico de barras (una serie, sin leyenda) -------------------------- */
  function graficoIngresos(serie, alto) {
    const H = alto || 130, W = 560, pl = 46, pr = 10, pt = 14, pb = 26;
    const max = Math.max(100, ...serie.map((d) => d.monto));
    const paso = (W - pl - pr) / serie.length;
    const ancho = Math.max(6, paso - 6);
    const esc = (v) => H - pb - (v / max) * (H - pt - pb);

    const ticks = [0, max / 2, max].map((v) => {
      const y = esc(v);
      return `<line x1="${pl}" y1="${y}" x2="${W - pr}" y2="${y}" stroke="var(--borde)" stroke-width="1"/>
        <text x="${pl - 7}" y="${y + 4}" text-anchor="end" font-size="10" fill="var(--tinta-3)" font-family="var(--mono)">${Math.round(v)}</text>`;
    }).join('');

    const barras = serie.map((d, i) => {
      const x = pl + i * paso + (paso - ancho) / 2;
      const y = esc(d.monto);
      const h = Math.max(d.monto > 0 ? 2 : 0, H - pb - y);
      const hoy = i === serie.length - 1;
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${ancho.toFixed(1)}" height="${h.toFixed(1)}"
        rx="3" fill="${hoy ? 'var(--arcilla)' : 'var(--rio)'}"><title>${fechaCorta(d.fecha.toISOString())}: ${moneda(d.monto)}</title></rect>`;
    }).join('');

    const etiquetas = serie.map((d, i) => {
      if (i % 3 !== 0 && i !== serie.length - 1) return '';
      const x = pl + i * paso + paso / 2;
      return `<text x="${x.toFixed(1)}" y="${H - 8}" text-anchor="middle" font-size="10" fill="var(--tinta-3)">${fechaCorta(d.fecha.toISOString())}</text>`;
    }).join('');

    return `<svg class="gra" viewBox="0 0 ${W} ${H}" role="img"
      aria-label="Ventas registradas por día en los últimos ${serie.length} días. Máximo ${moneda(max)}.">
      ${ticks}${barras}${etiquetas}
      <line x1="${pl}" y1="${H - pb}" x2="${W - pr}" y2="${H - pb}" stroke="var(--borde-fuerte)" stroke-width="1"/>
    </svg>`;
  }

  /** Composición del precio de una pieza: barra apilada + leyenda + tabla. */
  function desglosePrecio(p) {
    const trabajo = A().valorTrabajo(p);
    const gan = A().ganancia(p);
    const partes = [
      { et: 'Materiales', v: p.costoMaterial, c: 'var(--s1)' },
      { et: 'Valor de su trabajo', v: trabajo, c: 'var(--s2)' },
      { et: 'Empaque y envío', v: p.costoEmpaque, c: 'var(--s3)' },
      { et: 'Ganancia', v: gan, c: 'var(--s4)' },
    ];
    const total = p.precio;
    const barra = partes.map((x) => `<i style="width:${Math.max(0, (x.v / total) * 100)}%;background:${x.c}" title="${x.et}: ${moneda(x.v)}"></i>`).join('');
    const leyenda = partes.map((x) => `<span><i style="background:${x.c}"></i>${x.et} · <b class="num">${moneda(x.v)}</b></span>`).join('');
    const filas = partes.map((x) => `<tr><td><span class="linea__pt" style="background:${x.c}"></span>${x.et}</td><td class="n">${moneda(x.v)}</td></tr>`).join('');
    return `<div class="precio-desglose">
      <div class="barra-apilada" role="img" aria-label="Composición del precio de ${escapar(p.nombre)}">${barra}</div>
      <div class="leyenda">${leyenda}</div>
      <div class="tabla-caja"><table class="datos">
        <caption class="solo-lectura">Composición del precio de ${escapar(p.nombre)}</caption>
        <tbody>${filas}
        <tr><td><b>Precio al público</b></td><td class="n"><b>${moneda(total)}</b></td></tr></tbody>
      </table></div>
      <p style="font-size:12.5px;color:var(--tinta-2)">La asociación acordó valorar la hora de trabajo en ${moneda(A().estado.config.tarifaHora)}.
      Ese monto no es una pérdida: es el pago de la artesana por su tiempo.</p>
    </div>`;
  }

  MV.ui = {
    escapar, formatoWa, moneda, horaDe, fechaCorta, diaRelativo, faltan,
    ilustracion, avatar, insignia, avisar, graficoIngresos, desglosePrecio,
    ETIQUETAS_ESTADO,
  };
}(window.MV));
