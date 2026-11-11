/* ManosVivas · Almacén
 * Un solo estado para los tres canales. Patrón observable simple:
 * los canales se suscriben y se redibujan cuando algo cambia, venga de donde venga.
 * La "API" es falsa: funciones async con latencia de 300–600 ms para que la demo
 * se sienta como un sistema real y no como una maqueta instantánea.
 */
window.MV = window.MV || {};

(function (MV) {
  'use strict';

  const CLAVE = 'manosvivas.estado.v6';
  const oyentes = new Set();
  let estado = null;
  let seq = 0;

  /* --- persistencia ------------------------------------------------------ */
  function leerGuardado() {
    try {
      const crudo = localStorage.getItem(CLAVE);
      if (!crudo) return null;
      const dato = JSON.parse(crudo);
      return dato && dato.version === 6 ? dato : null;
    } catch (e) { return null; }
  }

  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* modo privado */ }
  }

  /* --- ciclo ------------------------------------------------------------- */
  function notificar(motivo) {
    guardar();
    oyentes.forEach((fn) => {
      try { fn(estado, motivo); } catch (e) { console.error('[ManosVivas] oyente falló', e); }
    });
  }

  function id(prefijo) { seq += 1; return prefijo + '_' + Date.now().toString(36) + seq.toString(36); }

  async function latencia() {
    const ms = 300 + Math.random() * 300;
    return new Promise((r) => setTimeout(r, ms));
  }

  /* --- utilidades de dominio -------------------------------------------- */
  function artesana(aid) { return estado.artesanas.find((a) => a.id === aid); }
  function producto(pid) { return estado.productos.find((p) => p.id === pid); }
  function comprador(cid) { return estado.compradores.find((c) => c.id === cid); }

  function valorTrabajo(p) { return p.horas * estado.config.tarifaHora; }
  function costoDirecto(p) { return p.costoMaterial + p.costoEmpaque + valorTrabajo(p); }
  function ganancia(p) { return p.precio - costoDirecto(p); }

  function mismaFecha(iso, ref) {
    const a = new Date(iso); const b = ref || new Date();
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  /** Resumen del día de una artesana.
   * Distingue dos cosas que suelen confundirse:
   * - costo de lo vendido hoy → sí baja la ganancia estimada
   * - compra de materiales para después → sale de la caja, pero no es costo de hoy
   */
  function resumenDia(aid, ref) {
    const dia = ref || new Date();
    const movs = estado.movimientos.filter((m) => m.artesanaId === aid && mismaFecha(m.ts, dia));
    let ventas = 0, piezas = 0, materiales = 0, empaque = 0, trabajo = 0, compras = 0;
    const detalle = [];
    movs.forEach((m) => {
      if (m.tipo === 'venta') {
        ventas += m.monto;
        const p = producto(m.productoId);
        const cant = m.cantidad || 1;
        piezas += cant;
        if (p) {
          materiales += p.costoMaterial * cant;
          empaque += p.costoEmpaque * cant;
          trabajo += valorTrabajo(p) * cant;
        }
        detalle.push({ tipo: 'venta', texto: m.detalle, monto: m.monto });
      } else if (m.tipo === 'material') {
        materiales += m.monto;
        detalle.push({ tipo: 'material', texto: m.detalle, monto: m.monto });
      } else if (m.tipo === 'empaque' || m.tipo === 'transporte') {
        empaque += m.monto;
        detalle.push({ tipo: 'empaque', texto: m.detalle, monto: m.monto });
      } else if (m.tipo === 'compra') {
        compras += m.monto;
        detalle.push({ tipo: 'compra', texto: m.detalle, monto: m.monto });
      }
    });
    const gananciaDia = ventas - materiales - empaque - trabajo;
    return {
      ventas, piezas, materiales, empaque, trabajo, compras, detalle,
      ganancia: gananciaDia,
      caja: ventas - materiales - empaque - compras,
      vacio: movs.length === 0,
    };
  }

  function resumenAsociacion() {
    const act = new Set();
    let ventasMes = 0, gananciaMes = 0;
    const limite = Date.now() - 30 * 86400000;
    estado.movimientos.forEach((m) => {
      if (m.tipo !== 'venta') return;
      if (new Date(m.ts).getTime() < limite) return;
      act.add(m.artesanaId);
      ventasMes += m.monto;
      const p = producto(m.productoId);
      if (p) gananciaMes += ganancia(p) * (m.cantidad || 1);
    });
    const comunidades = new Set(estado.artesanas.map((a) => a.comunidad));
    const tecnicas = new Set(estado.artesanas.map((a) => a.tecnica));
    const pendientes = estado.pedidos.filter((p) => p.estado !== 'enviado').length;
    return {
      artesanasActivas: act.size,
      artesanasTotal: estado.artesanas.length,
      ventasMes, gananciaMes,
      comunidades: comunidades.size,
      tecnicas: tecnicas.size,
      pedidosAbiertos: pendientes,
      fichasPublicadas: estado.productos.filter((p) => p.estado === 'publicado').length,
    };
  }

  /** Ingresos por día de los últimos n días, para el gráfico del panel. */
  function serieIngresos(dias) {
    const n = dias || 14;
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const salida = [];
    for (let i = n - 1; i >= 0; i -= 1) {
      const d = new Date(hoy.getTime() - i * 86400000);
      let monto = 0;
      estado.movimientos.forEach((m) => {
        if (m.tipo === 'venta' && mismaFecha(m.ts, d)) monto += m.monto;
      });
      salida.push({ fecha: d, monto });
    }
    return salida;
  }

  function eventosRecientes(n) {
    return estado.eventos.slice(0, n || 6);
  }

  function registrarEvento(canal, texto, destino) {
    estado.eventos.unshift({ id: id('ev'), ts: new Date().toISOString(), canal, texto });
    if (estado.eventos.length > 40) estado.eventos.length = 40;
    if (destino) (destino || []).forEach((d) => { estado.noLeidos[d] = (estado.noLeidos[d] || 0) + 1; });
  }

  /* --- mensajes del chat -------------------------------------------------- */
  function agregarMensaje(aid, mensaje) {
    const chat = estado.chats[aid] || (estado.chats[aid] = { artesanaId: aid, mensajes: [], sesion: null });
    const m = Object.assign({ id: id('msg'), ts: new Date().toISOString() }, mensaje);
    chat.mensajes.push(m);
    return m;
  }

  /* --- API simulada -------------------------------------------------------- */
  const api = {

    /** Venta registrada desde el chat. */
    async registrarVenta(aid, pid, cantidad, montoTotal) {
      await latencia();
      const p = producto(pid);
      const monto = montoTotal != null ? montoTotal : p.precio * cantidad;
      estado.movimientos.push({
        id: id('mov'), artesanaId: aid, ts: new Date().toISOString(), tipo: 'venta',
        monto, cantidad, productoId: pid, canal: 'whatsapp',
        detalle: `${cantidad} ${cantidad === 1 ? p.singular : p.plural}`,
      });
      p.stock = Math.max(0, p.stock - cantidad);
      registrarEvento('whatsapp', `${artesana(aid).corto} registró la venta de ${cantidad} ${cantidad === 1 ? p.singular : p.plural} (${estado.config.moneda}${monto})`, ['app', 'mercado']);
      notificar('venta');
      return resumenDia(aid);
    },

    /** Gasto. paraHoy=true → costo de lo vendido hoy; false → compra para después. */
    async registrarGasto(aid, monto, detalle, paraHoy) {
      await latencia();
      estado.movimientos.push({
        id: id('mov'), artesanaId: aid, ts: new Date().toISOString(),
        tipo: paraHoy ? 'material' : 'compra', monto, detalle, canal: 'whatsapp',
      });
      registrarEvento('whatsapp', `${artesana(aid).corto} anotó ${paraHoy ? 'un costo' : 'una compra de material'} de ${estado.config.moneda}${monto}`, ['app']);
      notificar('gasto');
      return resumenDia(aid);
    },

    /** Agente Marca: propone una ficha a partir de una foto. */
    async proponerFicha(aid, borrador) {
      await latencia();
      await latencia();
      const ficha = Object.assign({
        id: id('fch'), artesanaId: aid, ts: new Date().toISOString(), estado: 'propuesta',
      }, borrador);
      estado.fichas.unshift(ficha);
      registrarEvento('whatsapp', `El Agente Marca preparó una ficha para ${artesana(aid).corto}`, ['app']);
      notificar('ficha');
      return ficha;
    },

    async aprobarFicha(fid, cambios) {
      await latencia();
      const f = estado.fichas.find((x) => x.id === fid);
      if (!f || f.estado === 'aprobada') return null;
      Object.assign(f, cambios || {});
      f.estado = 'aprobada';
      const nuevo = {
        id: id('p'), artesanaId: f.artesanaId, nombre: f.nombre, categoria: f.categoria,
        singular: f.singular, plural: f.plural, precio: f.precio, stock: f.stock || 1,
        costoMaterial: f.costoMaterial, costoEmpaque: f.costoEmpaque, horas: f.horas,
        materiales: f.materiales, claves: f.claves || [], motivo: f.motivo,
        colores: f.colores, estado: 'publicado', descripcion: f.descripcion,
        historia: f.historia, creado: new Date().toISOString(), nuevo: true,
      };
      estado.productos.unshift(nuevo);
      f.productoId = nuevo.id;
      registrarEvento('whatsapp', `${artesana(f.artesanaId).corto} aprobó “${nuevo.nombre}”. Ya está en el Mercado`, ['mercado', 'app']);
      notificar('ficha-aprobada');
      return nuevo;
    },

    /** Pedido creado desde el Mercado. */
    async crearPedido(cid, items, dias) {
      await latencia();
      const num = 145 + estado.pedidos.filter((p) => p.id.startsWith('PED-')).length - 4;
      const pedido = {
        id: 'PED-0' + num, compradorId: cid, estado: 'solicitado', canal: 'mercado',
        items: items.map((it) => ({ productoId: it.productoId, cantidad: it.cantidad, precio: producto(it.productoId).precio })),
        creado: new Date().toISOString(),
        entrega: new Date(Date.now() + (dias || 15) * 86400000).toISOString(),
        historial: [{ ts: new Date().toISOString(), canal: 'mercado', texto: `${comprador(cid).nombre} hizo el pedido desde el Mercado` }],
        nuevo: true,
      };
      estado.pedidos.unshift(pedido);
      registrarEvento('mercado', `Pedido nuevo de ${comprador(cid).nombre}: ${pedido.id}`, ['app', 'whatsapp']);
      notificar('pedido');
      return pedido;
    },

    async cambiarEstadoPedido(pid, nuevoEstado, canal, texto) {
      await latencia();
      const p = estado.pedidos.find((x) => x.id === pid);
      if (!p) return null;
      p.estado = nuevoEstado;
      p.historial.push({ ts: new Date().toISOString(), canal: canal || 'app', texto: texto || `Pasó a ${nuevoEstado}` });
      registrarEvento(canal || 'app', `${p.id}: ${texto || nuevoEstado}`, ['mercado', 'whatsapp']);
      notificar('pedido-estado');
      return p;
    },

    /** Código de acceso de un solo uso, entregado por el chat. */
    async pedirCodigo(aid) {
      await latencia();
      const codigo = String(Math.floor(100000 + Math.random() * 900000));
      estado.acceso.codigo = codigo;
      estado.acceso.codigoPara = aid;
      estado.acceso.vence = Date.now() + 5 * 60000;
      agregarMensaje(aid, {
        de: 'bot', tipo: 'codigo', codigo,
        texto: `Tu código para entrar a ManosVivas es *${codigo}*.\n\nVence en 5 minutos. No lo compartas con nadie.`,
      });
      estado.personaActiva = aid;
      registrarEvento('whatsapp', `Código de acceso enviado a ${artesana(aid).corto}`, ['whatsapp']);
      notificar('codigo');
      return codigo;
    },

    async validarCodigo(aid, codigo) {
      await latencia();
      const ok = estado.acceso.codigo === String(codigo).trim() && estado.acceso.codigoPara === aid;
      if (ok) {
        estado.acceso = { autenticada: true, artesanaId: aid, codigo: null, codigoPara: null };
        registrarEvento('app', `${artesana(aid).corto} entró a la app`, []);
        notificar('acceso');
      }
      return ok;
    },

    salir() {
      estado.acceso = { autenticada: false, artesanaId: null, codigo: null, codigoPara: null };
      notificar('acceso');
    },

    /** La coordinadora escucha un audio que el bot no entendió y lo registra. */
    async resolverTarea(tid, resolucion) {
      await latencia();
      const t = estado.tareas.find((x) => x.id === tid);
      if (!t) return null;
      t.estado = 'resuelta';
      t.resolucion = resolucion;
      if (resolucion && resolucion.venta) {
        const { artesanaId, productoId, cantidad } = resolucion.venta;
        const p = producto(productoId);
        estado.movimientos.push({
          id: id('mov'), artesanaId, ts: new Date().toISOString(), tipo: 'venta',
          monto: p.precio * cantidad, cantidad, productoId, canal: 'app',
          detalle: `${cantidad} ${cantidad === 1 ? p.singular : p.plural} (registrado por la coordinadora)`,
        });
        p.stock = Math.max(0, p.stock - cantidad);
        agregarMensaje(artesanaId, {
          de: 'bot', tipo: 'texto',
          texto: `Yanua escuchó tu audio y anotó tu venta: ${cantidad} ${cantidad === 1 ? p.singular : p.plural}, ${estado.config.moneda}${p.precio * cantidad}. \n\nGracias por avisar. `,
        });
      }
      registrarEvento('app', 'Yanua escuchó el audio de Dolores y registró la venta', ['whatsapp']);
      notificar('tarea');
      return t;
    },

    async anotarInteres(pid, cid) {
      await latencia();
      const p = producto(pid);
      registrarEvento('mercado', `${comprador(cid).nombre} guardó “${p.nombre}”`, []);
      notificar('interes');
    },
  };

  /* --- público ------------------------------------------------------------ */
  MV.almacen = {
    iniciar(forzar) {
      estado = (!forzar && leerGuardado()) || MV.crearSemilla();
      if (!estado.eventos.length) {
        registrarEvento('mercado', 'Kuyay Diseño pidió 2 cántaros de barro', []);
        registrarEvento('whatsapp', 'Esther reportó 8 juegos de individuales terminados', []);
      }
      notificar('inicio');
      return estado;
    },
    reiniciar() { try { localStorage.removeItem(CLAVE); } catch (e) {} return this.iniciar(true); },
    get estado() { return estado; },
    suscribir(fn) { oyentes.add(fn); return () => oyentes.delete(fn); },
    notificar,
    agregarMensaje,
    api,
    // helpers de dominio, usados por los tres canales
    artesana, producto, comprador,
    valorTrabajo, costoDirecto, ganancia,
    resumenDia, resumenAsociacion, serieIngresos, eventosRecientes, mismaFecha,
    nuevoId: id,
  };
}(window.MV));
