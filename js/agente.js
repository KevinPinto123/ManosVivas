/* ManosVivas · El agente de WhatsApp
 * Dos asistentes sobre el mismo chat:
 * Agente Negocio → registra ventas, gastos y arma el resumen del día.
 * Agente Marca → convierte una foto en una ficha comercial para aprobar.
 * Entiende texto libre por palabras clave y también ofrece chips de respuesta rápida.
 * Nunca se queda mudo: si no entiende, ofrece el menú o deriva a la coordinadora.
 */
window.MV = window.MV || {};

(function (MV) {
  'use strict';

  const A = () => MV.almacen;
  const S = () => MV.almacen.estado;
  const moneda = (n) => S().config.moneda + (Math.round(n * 100) / 100).toLocaleString('es-PE');

  const NUMEROS = {
    un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7,
    ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, trece: 13, catorce: 14,
    quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19,
    veinte: 20, veinticinco: 25, treinta: 30, cuarenta: 40, cincuenta: 50,
    sesenta: 60, setenta: 70, ochenta: 80, noventa: 90, cien: 100, ciento: 100,
  };

  function limpiar(t) {
    return (t || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ').trim();
  }

  function numeroDe(palabra) {
    if (/^\d+([.,]\d+)?$/.test(palabra)) return parseFloat(palabra.replace(',', '.'));
    return NUMEROS[palabra] != null ? NUMEROS[palabra] : null;
  }

  /** Busca un monto en soles: "por 80 soles", "S/80", "a 25". */
  function montoDe(texto) {
    const t = limpiar(texto);
    let m = t.match(/(?:s\/\s*|soles?\s*)(\d+(?:[.,]\d+)?)/);
    if (m) return parseFloat(m[1].replace(',', '.'));
    m = t.match(/(\d+(?:[.,]\d+)?)\s*(?:soles|sol\b|s\/)/);
    if (m) return parseFloat(m[1].replace(',', '.'));
    m = t.match(/(?:por|a|en|de)\s+((?:\d+(?:[.,]\d+)?)|[a-z]+)\s*(?:soles|sol\b)?/);
    if (m) { const n = numeroDe(m[1]); if (n != null && n >= 5) return n; }
    return null;
  }

  /** Encuentra el producto nombrado y cuántos. */
  function productoDe(texto) {
    const t = limpiar(texto);
    const palabras = t.split(' ');
    let mejor = null;
    S().productos.forEach((p) => {
      (p.claves || []).forEach((c) => {
        const cc = limpiar(c);
        const i = palabras.indexOf(cc);
        if (i >= 0 && (!mejor || cc.length > mejor.clave.length)) mejor = { producto: p, indice: i, clave: cc };
      });
    });
    if (!mejor) return null;
    let cantidad = 1;
    for (let i = mejor.indice - 1; i >= 0 && i >= mejor.indice - 3; i -= 1) {
      const n = numeroDe(palabras[i]);
      if (n != null && n > 0 && n < 500) { cantidad = n; break; }
    }
    return { producto: mejor.producto, cantidad };
  }

  /* --- intención ---------------------------------------------------------- */
  const REGLAS = [
    { id: 'menu', re: /\b(menu|menú|opciones|ayuda|que puedes hacer|comandos)\b/ },
    { id: 'saludo', re: /\b(hola|buenas|buenos dias|buenas tardes|buenas noches|ola)\b/ },
    { id: 'resumen', re: /\b(resumen|cuanto gane|cuanto gano|cuanto llevo|ganancia|ganancias|como voy|balance|cuentas|hoy)\b/ },
    { id: 'venta', re: /\b(vendi|vendí|venta|vendimos|me compraron|se llevaron|salio|salió)\b/ },
    { id: 'gasto', re: /\b(compre|compré|gaste|gasté|pague|pagué|gasto|costo|me costo|invert)\b/ },
    { id: 'marca', re: /\b(foto|publicar|promocionar|promoción|promocion|marca|catalogo|catálogo|subir|anunciar)\b/ },
    { id: 'mercado', re: /\b(mercado|enlace|link|tienda|compradores|pagina|página)\b/ },
    { id: 'pedidos', re: /\b(pedido|pedidos|encargo|encargos)\b/ },
    { id: 'humano', re: /\b(humano|persona|coordinadora|yanua|no entiendo|hablar con alguien)\b/ },
    { id: 'gracias', re: /\b(gracias|ya esta|listo|ok|bueno)\b/ },
  ];

  function intencion(texto) {
    const t = limpiar(texto);
    if (/^\s*[1-5]\s*$/.test(t)) return { id: 'menu-numero', numero: parseInt(t, 10) };
    for (const r of REGLAS) if (r.re.test(t)) return { id: r.id };
    if (productoDe(t) && montoDe(t)) return { id: 'venta' };
    return { id: 'nada' };
  }

  /* --- fotos de ejemplo del Agente Marca ---------------------------------- */
  const FOTOS = [
    {
      ref: 'foto-collar', etiqueta: 'Collar de semillas',
      motivo: 'rombos', colores: ['#90AD2E', '#123F1B'],
      categoria: 'Collares', singular: 'collar', plural: 'collares',
      claves: ['collar', 'collares'],
      detectado: 'Collar de semillas con mostacilla roja y negra',
      materiales: ['Semillas de huayruro', 'Mostacilla de vidrio', 'Hilo encerado'],
      nombre: 'Collar Nuwa de huayruro',
      descripcion: 'Collar tejido a mano con semillas de huayruro recogidas del suelo del bosque y mostacilla de vidrio. Cada pieza es única: el tamaño y el tono de la semilla los pone la naturaleza.',
      post: ' Nuevo en el Mercado ManosVivas\nCollar de huayruro hecho a mano en Urakusa, Condorcanqui.\nSemillas recogidas del suelo, ensartadas una por una.\nS/{{precio}} · Pedidos por mensaje directo.\n#ArtesaníaAmazónica #HechoAMano #Condorcanqui',
      estadoWa: ' Collar de huayruro · S/{{precio}} · Hecho a mano en Urakusa. Escríbeme para separarlo.',
      costoMaterial: 14, costoEmpaque: 6, horas: 2, precioSugerido: 55,
    },
    {
      ref: 'foto-canasta', etiqueta: 'Canasta tejida',
      motivo: 'espiral', colores: ['#BDD3A7', '#2F4D35'],
      categoria: 'Cestería', singular: 'canasta', plural: 'canastas',
      claves: ['canasta', 'canastas', 'cesta'],
      detectado: 'Canasta de fibra vegetal tejida en espiral',
      materiales: ['Tamshi', 'Bombonaje teñido con corteza'],
      nombre: 'Canasta Yaku de tamshi',
      descripcion: 'Canasta tejida en liana de tamshi, firme y liviana. Sirve para la mesa, para guardar o para llevar. Tejida en húmedo y secada a la sombra.',
      post: ' Nuevo en el Mercado ManosVivas\nCanasta de tamshi tejida a mano en Puerto Galilea.\nLiana cortada en menguante, como enseña la abuela.\nS/{{precio}} · Pedidos por mensaje directo.\n#Cestería #ArtesaníaAmazónica #Wampís',
      estadoWa: ' Canasta de tamshi · S/{{precio}} · Tejida a mano. Quedan pocas.',
      costoMaterial: 10, costoEmpaque: 10, horas: 7, precioSugerido: 115,
    },
    {
      ref: 'foto-cuenco', etiqueta: 'Cuenco de barro',
      motivo: 'ondas', colores: ['#2F4D35', '#E8EDD6'],
      categoria: 'Cerámica', singular: 'cuenco', plural: 'cuencos',
      claves: ['cuenco', 'cuencos', 'bowl'],
      detectado: 'Cuenco de cerámica pintado con líneas',
      materiales: ['Arcilla de orilla', 'Tierras de color', 'Resina vegetal'],
      nombre: 'Cuenco Nunka de barro',
      descripcion: 'Cuenco modelado a mano por rollos, sin torno, pintado con tierras de color y sellado con resina vegetal. Cocido a leña.',
      post: ' Nuevo en el Mercado ManosVivas\nCuenco de barro hecho a mano en Huampami, río Cenepa.\nArcilla de la orilla, cocido a leña.\nS/{{precio}} · Pedidos por mensaje directo.\n#Cerámica #ArtesaníaAmazónica #Awajún',
      estadoWa: ' Cuenco de barro · S/{{precio}} · Hecho a mano, pieza única.',
      costoMaterial: 9, costoEmpaque: 14, horas: 5, precioSugerido: 90,
    },
  ];

  /* --- menú --------------------------------------------------------------- */
  const MENU = [
    'Registrar una *venta* — escríbeme “vendí 2 collares por 80 soles”',
    'Anotar un *gasto* — “compré mostacilla por 25 soles”',
    'Ver mi *resumen* del día',
    'Publicar una pieza: mándame una *foto*',
    'Hablar con la *coordinadora*',
  ];

  function textoMenu() {
    return 'Puedo ayudarte con esto:\n\n' +
      MENU.map((m, i) => `*${i + 1}.* ${m}`).join('\n') +
      '\n\nEscribe el número o dímelo con tus palabras. ';
  }

  const CHIPS_BASE = [
    { id: 'resumen', titulo: ' Mi resumen de hoy' },
    { id: 'foto', titulo: ' Enviar una foto' },
    { id: 'menu', titulo: 'Menú' },
  ];

  /* --- tarjetas ------------------------------------------------------------ */
  function tarjetaResumen(aid) {
    const r = A().resumenDia(aid);
    return { de: 'bot', tipo: 'resumen', resumen: r, artesanaId: aid };
  }

  /* --- el agente ----------------------------------------------------------- */
  const agente = {
    FOTOS,

    /** Punto de entrada único. Devuelve una lista de respuestas del bot. */
    async responder(aid, entrada) {
      const chat = S().chats[aid] || (S().chats[aid] = { artesanaId: aid, mensajes: [], sesion: null });
      const persona = A().artesana(aid);

      // 1) ¿Hay una pregunta abierta?
      if (chat.sesion) {
        const r = await agente.continuarSesion(aid, chat, entrada);
        if (r) return r;
      }

      // 2) Botones y chips
      if (entrada.tipo === 'boton') return agente.porBoton(aid, chat, entrada);

      // 3) Audio
      if (entrada.tipo === 'audio') return agente.porAudio(aid, chat, entrada);

      // 4) Imagen
      if (entrada.tipo === 'imagen') return agente.iniciarMarca(aid, chat, entrada.foto);

      // 5) Texto libre
      const texto = entrada.texto || '';
      const intento = intencion(texto);

      switch (intento.id) {
        case 'menu':
          return [{ de: 'bot', tipo: 'chips', texto: textoMenu(), botones: CHIPS_BASE }];

        case 'menu-numero': {
          const mapa = { 1: 'ejemplo-venta', 2: 'ejemplo-gasto', 3: 'resumen', 4: 'foto', 5: 'humano' };
          return agente.porBoton(aid, chat, { tipo: 'boton', idBoton: mapa[intento.numero] });
        }

        case 'saludo':
          return [{
            de: 'bot', tipo: 'chips',
            texto: `¡Hola, ${persona.corto}! Soy ManosVivas.\n\n¿Qué quieres hacer hoy?`,
            botones: [
              { id: 'ejemplo-venta', titulo: ' Anotar una venta' },
              { id: 'resumen', titulo: ' Mi resumen' },
              { id: 'foto', titulo: ' Enviar foto' },
            ],
          }];

        case 'venta': return agente.registrarVenta(aid, chat, texto);
        case 'gasto': return agente.registrarGasto(aid, chat, texto);

        case 'resumen':
          return [tarjetaResumen(aid), {
            de: 'bot', tipo: 'chips', texto: '¿Quieres hacer algo más?',
            botones: [
              { id: 'detalle-precio', titulo: ' ¿Por qué esa ganancia?' },
              { id: 'foto', titulo: ' Publicar una pieza' },
            ],
          }];

        case 'marca': return agente.pedirFoto(aid, chat);

        case 'mercado':
          return [{
            de: 'bot', tipo: 'texto',
            texto: `Este es el enlace de tu Mercado \n\n*${S().config.enlaceMercado}*\n\nAhí están ${S().productos.filter((p) => p.estado === 'publicado').length} piezas de la asociación. Puedes mandarlo por WhatsApp a quien quieras.`,
          }];

        case 'pedidos': {
          const abiertos = S().pedidos.filter((p) => p.estado !== 'enviado');
          if (!abiertos.length) return [{ de: 'bot', tipo: 'texto', texto: 'Ahora mismo no hay pedidos pendientes. ' }];
          return [{
            de: 'bot', tipo: 'texto',
            texto: ' *Pedidos abiertos*\n\n' + abiertos.map((p) => {
              const c = A().comprador(p.compradorId);
              const total = p.items.reduce((s, it) => s + it.precio * it.cantidad, 0);
              return `• *${p.id}* — ${c.nombre}\n ${moneda(total)} · ${agente.etiquetaEstado(p.estado)}`;
            }).join('\n'),
          }];
        }

        case 'humano':
          return [{
            de: 'bot', tipo: 'texto',
            texto: `Le aviso a ${A().artesana(S().asociacion.coordinadoraId).corto}, la coordinadora. Ella te escribe apenas pueda. \n\nMientras tanto puedo seguir anotando tus ventas.`,
          }];

        case 'gracias':
          return [{ de: 'bot', tipo: 'texto', texto: '¡Con gusto! Aquí estoy cuando me necesites. ' }];

        default:
          return [{
            de: 'bot', tipo: 'chips',
            texto: 'Perdona, no entendí bien eso. \n\nPuedes decírmelo con tus palabras, por ejemplo “vendí 2 collares por 80 soles”, o elegir una opción:',
            botones: [
              { id: 'menu', titulo: 'Ver el menú' },
              { id: 'resumen', titulo: ' Mi resumen' },
              { id: 'humano', titulo: ' Hablar con Yanua' },
            ],
          }];
      }
    },

    etiquetaEstado(e) {
      return ({
        solicitado: 'Esperando confirmación', confirmado: 'Confirmado',
        'en produccion': 'En producción', listo: 'Listo para enviar', enviado: 'Enviado',
      })[e] || e;
    },

    /* --- ventas ----------------------------------------------------------- */
    async registrarVenta(aid, chat, texto) {
      const hallazgo = productoDe(texto);
      const monto = montoDe(texto);

      if (!hallazgo) {
        chat.sesion = { paso: 'venta-producto', datos: { monto } };
        return [{
          de: 'bot', tipo: 'chips',
          texto: '¡Qué bueno! ¿Qué vendiste?',
          botones: S().productos.filter((p) => p.artesanaId === aid).slice(0, 3)
            .map((p) => ({ id: 'sel-' + p.id, titulo: p.nombre })),
        }];
      }

      const { producto: p, cantidad } = hallazgo;
      const esperado = p.precio * cantidad;
      const total = monto != null ? monto : esperado;

      const r = await A().api.registrarVenta(aid, p.id, cantidad, total);
      const salida = [{
        de: 'bot', tipo: 'venta',
        titulo: '¡Registré tu venta!',
        producto: p.nombre, cantidad, monto: total,
        acumulado: { ventas: r.ventas, piezas: r.piezas },
      }];

      if (monto != null && Math.abs(total - esperado) > 0.5) {
        salida.push({
          de: 'bot', tipo: 'texto',
          texto: `Ojo: en tu catálogo ${cantidad === 1 ? 'ese' : 'cada'} ${p.singular} está a ${moneda(p.precio)}, así que ${cantidad} serían ${moneda(esperado)}. Anoté los ${moneda(total)} que me dijiste. Si fue un descuento, está bien. `,
        });
      }

      salida.push({
        de: 'bot', tipo: 'chips',
        texto: '¿Quieres anotar lo que gastaste en estas piezas?',
        botones: [
          { id: 'ejemplo-gasto', titulo: ' Anotar un gasto' },
          { id: 'resumen', titulo: ' Ver mi resumen' },
        ],
      });
      return salida;
    },

    /* --- gastos ----------------------------------------------------------- */
    async registrarGasto(aid, chat, texto) {
      const monto = montoDe(texto);
      if (monto == null) {
        chat.sesion = { paso: 'gasto-monto', datos: { detalle: texto } };
        return [{ de: 'bot', tipo: 'texto', texto: '¿Cuánto gastaste? Dime solo el número, por ejemplo *25*.' }];
      }
      const detalle = texto.replace(/^\s*(compre|compré|gaste|gasté|pague|pagué)\s*/i, '').trim() || 'Gasto';
      chat.sesion = { paso: 'gasto-destino', datos: { monto, detalle } };
      return [{
        de: 'bot', tipo: 'chips',
        texto: `Anotado: ${moneda(monto)} en *${detalle}*.\n\nUna cosa más, para no confundir tus cuentas: ¿ese material lo usaste en lo que vendiste hoy, o lo guardas para próximos trabajos?`,
        botones: [
          { id: 'gasto-hoy', titulo: 'Lo usé en lo de hoy' },
          { id: 'gasto-despues', titulo: 'Es para después' },
        ],
      }];
    },

    /* --- Agente Marca ------------------------------------------------------ */
    pedirFoto(aid, chat) {
      chat.sesion = { paso: 'marca-foto', datos: {} };
      return [{
        de: 'bot', tipo: 'chips',
        texto: 'Mándame la foto de tu pieza y te preparo el nombre, la descripción y la publicación para redes. Tú decides si se publica o no.',
        botones: FOTOS.map((f) => ({ id: 'foto-' + f.ref, titulo: ' ' + f.etiqueta })),
        nota: 'En la demo las fotos son de ejemplo. En producción la artesana adjunta la suya.',
      }];
    },

    iniciarMarca(aid, chat, foto) {
      chat.sesion = { paso: 'marca-precio', datos: { foto } };
      return [
        { de: 'bot', tipo: 'texto', texto: 'Recibí tu foto. Déjame mirarla un momento… ' },
        {
          de: 'bot', tipo: 'chips',
          texto: `Veo *${foto.detectado.toLowerCase()}*.\n\n¿A cuánto quieres venderla?`,
          botones: [
            { id: 'precio-' + foto.precioSugerido, titulo: moneda(foto.precioSugerido) },
            { id: 'precio-' + Math.round(foto.precioSugerido * 1.2), titulo: moneda(Math.round(foto.precioSugerido * 1.2)) },
            { id: 'precio-otro', titulo: 'Otro precio' },
          ],
          nota: 'Te sugiero un rango a partir de tus materiales y tus horas, pero el precio lo pones tú.',
        },
      ];
    },

    async armarFicha(aid, chat, precio) {
      const foto = chat.sesion.datos.foto;
      chat.sesion = null;
      const ficha = await A().api.proponerFicha(aid, {
        nombre: foto.nombre,
        categoria: foto.categoria,
        singular: foto.singular, plural: foto.plural,
        precio,
        stock: 1,
        costoMaterial: foto.costoMaterial, costoEmpaque: foto.costoEmpaque, horas: foto.horas,
        materiales: foto.materiales,
        claves: foto.claves,
        motivo: foto.motivo, colores: foto.colores,
        descripcion: foto.descripcion,
        historia: A().artesana(aid).historia,
        post: foto.post.replace(/\{\{precio\}\}/g, precio),
        estadoWa: foto.estadoWa.replace(/\{\{precio\}\}/g, precio),
        fotoRef: foto.ref,
      });
      const trabajo = foto.horas * S().config.tarifaHora;
      const gananciaPieza = precio - foto.costoMaterial - foto.costoEmpaque - trabajo;
      return [
        { de: 'bot', tipo: 'ficha', fichaId: ficha.id },
        {
          de: 'bot', tipo: 'chips',
          texto: `Con ese precio, por cada pieza te quedan ${moneda(gananciaPieza)} de ganancia, después de pagar tus materiales (${moneda(foto.costoMaterial + foto.costoEmpaque)}) y tus ${foto.horas} horas de trabajo (${moneda(trabajo)}).\n\n¿Lo publico en el Mercado?`,
          botones: [
            { id: 'publicar-' + ficha.id, titulo: ' Sí, publicar' },
            { id: 'cambiar-' + ficha.id, titulo: '✏ Cambiar el texto' },
          ],
          nota: 'No invento el significado del diseño ni el origen de la pieza. Si quieres contar algo, escríbelo y lo agrego tal cual.',
        },
      ];
    },

    /* --- audios ------------------------------------------------------------ */
    async porAudio(aid, chat, entrada) {
      if (entrada.escenario === 'nativo') {
        const t = S().tareas.find((x) => x.tipo === 'audio' && x.estado === 'pendiente' && x.artesanaId === aid);
        if (!t) {
          S().tareas.unshift({
            id: A().nuevoId('t'), tipo: 'audio', artesanaId: aid, ts: new Date().toISOString(),
            estado: 'pendiente', titulo: 'Audio sin transcribir',
            detalle: `${A().artesana(aid).corto} envió un audio en ${A().artesana(aid).idioma.split(' ')[0].toLowerCase()}. Confianza de la transcripción: 31 %.`,
            duracion: '0:11', confianza: 0.31,
          });
          S().noLeidos.app = (S().noLeidos.app || 0) + 1;
          A().notificar('tarea-nueva');
        }
        return [{
          de: 'bot', tipo: 'texto',
          texto: 'Escuché tu audio, pero no estoy seguro de haber entendido bien. \n\nPrefiero no anotar algo equivocado en tus cuentas, así que se lo paso a Yanua para que lo escuche ella y lo registre.\n\nTe aviso apenas quede anotado. ',
          nota: 'Transcripción automática: 31 % de confianza. Por debajo de 70 % el agente no registra: deriva a una persona.',
        }];
      }
      // audio claro
      const transcrito = 'vendí dos collares por ochenta soles';
      const respuestas = await agente.registrarVenta(aid, chat, transcrito);
      return [{
        de: 'bot', tipo: 'texto',
        texto: `Entendí: “${transcrito}”.`,
        nota: 'Transcripción automática: 92 % de confianza.',
      }].concat(respuestas);
    },

    /* --- botones ------------------------------------------------------------ */
    async porBoton(aid, chat, entrada) {
      const b = entrada.idBoton || '';

      if (b === 'menu') return [{ de: 'bot', tipo: 'chips', texto: textoMenu(), botones: CHIPS_BASE }];
      if (b === 'resumen') {
        return [tarjetaResumen(aid), {
          de: 'bot', tipo: 'chips', texto: '¿Quieres ver cómo se arma ese número?',
          botones: [{ id: 'detalle-precio', titulo: ' Ver el detalle' }, { id: 'foto', titulo: ' Publicar una pieza' }],
        }];
      }
      if (b === 'foto') return agente.pedirFoto(aid, chat);
      if (b === 'humano') return agente.responder(aid, { tipo: 'texto', texto: 'quiero hablar con la coordinadora' });

      if (b === 'ejemplo-venta') {
        return [{
          de: 'bot', tipo: 'texto',
          texto: 'Cuéntame qué vendiste, con tus palabras. Por ejemplo:\n\n_“vendí dos collares por 80 soles”_\n\nTambién puedes mandarme un audio. ',
        }];
      }
      if (b === 'ejemplo-gasto') {
        return [{
          de: 'bot', tipo: 'texto',
          texto: 'Dime qué compraste y cuánto pagaste. Por ejemplo:\n\n_“compré mostacilla por 25 soles”_',
        }];
      }

      if (b === 'detalle-precio') {
        const p = S().productos.find((x) => x.artesanaId === aid) || S().productos[0];
        return [{ de: 'bot', tipo: 'desglose', productoId: p.id }];
      }

      if (b === 'gasto-hoy' || b === 'gasto-despues') {
        const d = (chat.sesion && chat.sesion.datos) || {};
        chat.sesion = null;
        const paraHoy = b === 'gasto-hoy';
        await A().api.registrarGasto(aid, d.monto, d.detalle, paraHoy);
        return [{
          de: 'bot', tipo: 'texto',
          texto: paraHoy
            ? `Listo. Lo conté como costo de lo que vendiste hoy, así que tu ganancia del día ya lo tiene descontado.`
            : `Listo. Lo guardé como *compra de material para después*.\n\nSalió de tu caja hoy, pero no lo descuento de la ganancia de lo que vendiste hoy: ese material todavía no se ha convertido en una pieza vendida. Así tus cuentas no se mezclan. `,
        }, tarjetaResumen(aid)];
      }

      if (b.startsWith('foto-')) {
        const foto = FOTOS.find((f) => f.ref === b.slice(5));
        if (foto) {
          A().agregarMensaje(aid, { de: 'yo', tipo: 'imagen', foto, estado: 'leido' });
          A().notificar('mensaje');
          return agente.iniciarMarca(aid, chat, foto);
        }
      }

      if (b.startsWith('precio-')) {
        const resto = b.slice(7);
        if (resto === 'otro') {
          chat.sesion = { paso: 'marca-precio-libre', datos: chat.sesion.datos };
          return [{ de: 'bot', tipo: 'texto', texto: 'Dime el precio en soles. Solo el número, por ejemplo *70*.' }];
        }
        return agente.armarFicha(aid, chat, parseFloat(resto));
      }

      if (b.startsWith('publicar-')) {
        const nuevo = await A().api.aprobarFicha(b.slice(9));
        if (!nuevo) return [{ de: 'bot', tipo: 'texto', texto: 'Esa pieza ya estaba publicada. ' }];
        return [{
          de: 'bot', tipo: 'texto',
          texto: `¡Publicado! *${nuevo.nombre}* ya aparece en el Mercado ManosVivas.\n\n${S().config.enlaceMercado}\n\nTe aviso apenas alguien lo pida.`,
        }];
      }

      if (b.startsWith('cambiar-')) {
        chat.sesion = { paso: 'marca-editar', datos: { fichaId: b.slice(8) } };
        return [{
          de: 'bot', tipo: 'texto',
          texto: 'Claro. Escríbeme el nombre que tú le pondrías a la pieza y lo cambio tal cual, sin inventar nada.',
        }];
      }

      if (b.startsWith('sel-')) {
        const pid = b.slice(4);
        const p = A().producto(pid);
        const d = (chat.sesion && chat.sesion.datos) || {};
        chat.sesion = null;
        const cantidad = d.monto ? Math.max(1, Math.round(d.monto / p.precio)) : 1;
        return agente.registrarVenta(aid, chat, `vendi ${cantidad} ${cantidad === 1 ? p.singular : p.plural}` + (d.monto ? ` por ${d.monto} soles` : ''));
      }

      if (b.startsWith('pedido-aceptar-')) {
        const pid = b.slice(15);
        await A().api.cambiarEstadoPedido(pid, 'en produccion', 'whatsapp', 'Yanua confirmó el pedido desde WhatsApp');
        return [{ de: 'bot', tipo: 'texto', texto: `Confirmado El pedido *${pid}* pasó a producción y el comprador ya lo ve en el Mercado.` }];
      }

      return [{ de: 'bot', tipo: 'chips', texto: textoMenu(), botones: CHIPS_BASE }];
    },

    /* --- sesiones abiertas --------------------------------------------------- */
    async continuarSesion(aid, chat, entrada) {
      const paso = chat.sesion.paso;

      if (entrada.tipo === 'boton') {
        const b = entrada.idBoton || '';
        const esDeSesion = b.startsWith('sel-') || b.startsWith('precio-') || b.startsWith('foto-') ||
          b === 'gasto-hoy' || b === 'gasto-despues';
        if (!esDeSesion) chat.sesion = null;
        return null; // porBoton se encarga
      }

      const texto = entrada.texto || '';

      if (paso === 'gasto-monto') {
        const n = montoDe(texto) != null ? montoDe(texto) : numeroDe(limpiar(texto));
        if (n == null) { chat.sesion = null; return null; }
        chat.sesion = { paso: 'gasto-destino', datos: { monto: n, detalle: chat.sesion.datos.detalle } };
        return [{
          de: 'bot', tipo: 'chips',
          texto: `Anotado: ${moneda(n)}.\n\n¿Ese material lo usaste en lo que vendiste hoy o lo guardas para próximos trabajos?`,
          botones: [
            { id: 'gasto-hoy', titulo: 'Lo usé en lo de hoy' },
            { id: 'gasto-despues', titulo: 'Es para después' },
          ],
        }];
      }

      if (paso === 'marca-precio-libre') {
        const n = montoDe(texto) != null ? montoDe(texto) : numeroDe(limpiar(texto));
        if (n == null) return [{ de: 'bot', tipo: 'texto', texto: 'No pude leer ese número. Escríbeme solo la cifra, por ejemplo *70*.' }];
        chat.sesion = { paso: 'marca-precio', datos: chat.sesion.datos };
        return agente.armarFicha(aid, chat, n);
      }

      if (paso === 'marca-editar') {
        const fid = chat.sesion.datos.fichaId;
        const f = S().fichas.find((x) => x.id === fid);
        chat.sesion = null;
        if (!f) return null;
        f.nombre = texto.trim();
        A().notificar('ficha-editada');
        return [{ de: 'bot', tipo: 'ficha', fichaId: fid }, {
          de: 'bot', tipo: 'chips',
          texto: `Cambiado. Ahora se llama *${f.nombre}*. ¿Lo publico así?`,
          botones: [{ id: 'publicar-' + fid, titulo: ' Sí, publicar' }, { id: 'cambiar-' + fid, titulo: '✏ Cambiar otra vez' }],
        }];
      }

      if (paso === 'venta-producto' || paso === 'marca-foto' || paso === 'marca-precio') {
        chat.sesion = null;
        return null;
      }

      chat.sesion = null;
      return null;
    },
  };

  MV.agente = agente;
  MV.util = { limpiar, numeroDe, montoDe, productoDe, intencion, moneda };
}(window.MV));
