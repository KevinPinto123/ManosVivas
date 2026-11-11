/* ManosVivas · Datos de demostración
 * ----------------------------------------------------------------------------
 * TODO lo que está aquí es FICTICIO. Las personas, la asociación, los compradores
 * y los pedidos no existen. Los distritos y comunidades de Condorcanqui (Amazonas)
 * se usan solo como contexto geográfico real; ninguna comunidad ha sido consultada
 * ni ha autorizado nada de este prototipo.
 * Las fechas se calculan desde "hoy" para que la demo siempre se vea vigente.
 */
window.MV = window.MV || {};

MV.crearSemilla = function crearSemilla() {
  const DIA = 86400000;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const base = hoy.getTime();
  const dia = (n) => new Date(base + n * DIA);
  const hora = (n, h, m) => new Date(base + n * DIA + h * 3600000 + (m || 0) * 60000).toISOString();

  /* --- técnicas y materiales -------------------------------------------- */
  const tecnicas = {
    chambira: {
      nombre: 'Tejido en fibra de chambira',
      material: 'Fibra de palmera chambira',
      nota: 'La fibra se extrae del cogollo tierno de la palmera, se cocina, se seca al sol y se tuerce a mano antes de tejer.',
      bioeconomia: 'La palmera no se tumba: se cosecha el cogollo y la planta sigue viva.',
    },
    semillas: {
      nombre: 'Bisutería con semillas del bosque',
      material: 'Huayruro, achira, lágrima de San Pedro',
      nota: 'Las semillas se recogen del suelo después de las lluvias, se limpian y se perforan una por una.',
      bioeconomia: 'Se recolecta lo que el bosque ya soltó; ningún árbol se corta.',
    },
    ceramica: {
      nombre: 'Cerámica de barro de ribera',
      material: 'Arcilla de orilla, tierras de color, resina vegetal',
      nota: 'Se modela por rollos, sin torno, y se cuece con leña recogida del monte.',
      bioeconomia: 'Arcilla local y leña de ramas caídas; sin esmaltes industriales.',
    },
    cesteria: {
      nombre: 'Cestería en tamshi y bombonaje',
      material: 'Tamshi, bombonaje',
      nota: 'Las lianas se cortan en luna menguante, se rajan en tiras finas y se tejen húmedas.',
      bioeconomia: 'Corte selectivo de lianas que rebrotan; se deja descansar la zona.',
    },
    telar: {
      nombre: 'Tejido en telar de cintura',
      material: 'Algodón nativo, hilo de algodón',
      nota: 'Se teje amarrando el telar a la cintura y a un poste; el cuerpo tensa la trama.',
      bioeconomia: 'Algodón nativo de chacra familiar, en sus colores naturales.',
    },
  };

  const comunidades = {
    'Santa María de Nieva': { distrito: 'Nieva', acceso: 'Capital provincial, con carretera' },
    'Urakusa': { distrito: 'Nieva', acceso: 'Río Marañón, 2 h en bote' },
    'Huampami': { distrito: 'El Cenepa', acceso: 'Río Cenepa, 5 h en bote' },
    'Puerto Galilea': { distrito: 'Río Santiago', acceso: 'Río Santiago, 6 h en bote' },
    'Yutupis': { distrito: 'Río Santiago', acceso: 'Río Santiago, 7 h en bote' },
  };

  /* --- personas ---------------------------------------------------------- */
  const artesanas = [
    {
      id: 'a1', nombre: 'Yanua Impi Wajai', corto: 'Yanua', rol: 'coordinadora',
      comunidad: 'Santa María de Nieva', tecnica: 'chambira', pueblo: 'Awajún',
      telefono: '+51 961 ••• 204', idioma: 'Awajún y castellano', desde: 2015,
      color: '#0F8A66', inicial: 'Y',
      historia: 'Aprendió a torcer chambira mirando a su madre. Hoy coordina a las socias de cuatro comunidades y es quien habla con los compradores.',
    },
    {
      id: 'a2', nombre: 'Rosa Chamik Nugkuag', corto: 'Rosa', rol: 'artesana',
      comunidad: 'Urakusa', tecnica: 'semillas', pueblo: 'Awajún',
      telefono: '+51 975 ••• 318', idioma: 'Awajún, entiende castellano', desde: 2018,
      color: '#C0522B', inicial: 'R',
      historia: 'Sale a buscar semillas con sus dos hijas cuando pasan las lluvias. Dice que el huayruro se ofrece solo: hay que saber mirar el suelo.',
    },
    {
      id: 'a3', nombre: 'Dolores Yagkug Tiwi', corto: 'Dolores', rol: 'artesana',
      comunidad: 'Huampami', tecnica: 'ceramica', pueblo: 'Awajún',
      telefono: '+51 962 ••• 877', idioma: 'Awajún y castellano', desde: 2012,
      color: '#7A4FA8', inicial: 'D',
      historia: 'Saca la arcilla en vaciante, cuando el río baja y deja la orilla limpia. Cada pieza se seca a la sombra una semana antes de ir al fuego.',
    },
    {
      id: 'a4', nombre: 'Esther Pujupat Kayap', corto: 'Esther', rol: 'artesana',
      comunidad: 'Puerto Galilea', tecnica: 'cesteria', pueblo: 'Wampís',
      telefono: '+51 948 ••• 455', idioma: 'Wampís y castellano', desde: 2019,
      color: '#D29A1E', inicial: 'E',
      historia: 'Teje canastas desde los once años. Corta el tamshi en menguante porque, dice, así no le entra la polilla.',
    },
    {
      id: 'a5', nombre: 'Marina Dekentai Juwau', corto: 'Marina', rol: 'artesana',
      comunidad: 'Yutupis', tecnica: 'telar', pueblo: 'Wampís',
      telefono: '+51 955 ••• 190', idioma: 'Wampís y castellano', desde: 2020,
      color: '#2F6B4F', inicial: 'M',
      historia: 'Teje al atardecer, después de la chacra. Siembra su propio algodón nativo y no le pone tinte: usa el color con el que creció.',
    },
  ];

  /* --- productos ---------------------------------------------------------
   * precio = costoMaterial + costoEmpaque + (horas × tarifaHora) + ganancia
   * La tarifa por hora la acordó la asociación en la demo: S/10.
   */
  const productos = [
    {
      id: 'p1', artesanaId: 'a2', nombre: 'Collar de huayruro y achira', categoria: 'Collares',
      singular: 'collar', plural: 'collares', precio: 40, stock: 14,
      costoMaterial: 11, costoEmpaque: 6.5, horas: 1,
      materiales: ['Semillas de huayruro', 'Semillas de achira', 'Hilo encerado'],
      claves: ['collar', 'collares', 'huayruro', 'achira'],
      motivo: 'rombos', colores: ['#90AD2E', '#123F1B'], estado: 'publicado',
      descripcion: 'Collar de semillas recogidas del suelo del bosque, ensartadas a mano una por una.',
      historia: 'Rosa sale con sus hijas después de las lluvias. Las semillas caen solas; nadie corta el árbol para tenerlas.',
      creado: dia(-120).toISOString(),
    },
    {
      id: 'p2', artesanaId: 'a1', nombre: 'Bolso tejido en chambira', categoria: 'Tejidos',
      singular: 'bolso', plural: 'bolsos', precio: 130, stock: 6,
      costoMaterial: 18, costoEmpaque: 8, horas: 8,
      materiales: ['Fibra de palmera chambira', 'Tinte de hoja y corteza'],
      claves: ['bolso', 'bolsos', 'cartera', 'chambira'],
      motivo: 'trama', colores: ['#123F1B', '#E8EDD6'], estado: 'publicado',
      descripcion: 'Bolso tejido a mano en fibra de chambira, con tintes de hoja y corteza.',
      historia: 'La chambira se cosecha del cogollo tierno sin tumbar la palmera. Yanua la cocina, la seca al sol y la tuerce sobre su pierna antes de empezar.',
      creado: dia(-96).toISOString(),
    },
    {
      id: 'p3', artesanaId: 'a2', nombre: 'Aretes de mostacilla y semilla', categoria: 'Pulseras y aretes',
      singular: 'par de aretes', plural: 'pares de aretes', precio: 30, stock: 22,
      costoMaterial: 7, costoEmpaque: 3, horas: 1,
      materiales: ['Mostacilla de vidrio', 'Semilla de huayruro', 'Gancho hipoalergénico'],
      claves: ['arete', 'aretes', 'pendiente', 'pendientes', 'mostacilla'],
      motivo: 'zigzag', colores: ['#BDD3A7', '#90AD2E'], estado: 'publicado',
      descripcion: 'Aretes livianos que combinan mostacilla de vidrio con una semilla del bosque.',
      historia: 'La pieza más pedida de Rosa. Le toma una hora y la hace mientras conversa con sus hijas.',
      creado: dia(-80).toISOString(),
    },
    {
      id: 'p4', artesanaId: 'a3', nombre: 'Cántaro de barro pintado', categoria: 'Cerámica',
      singular: 'cántaro', plural: 'cántaros', precio: 180, stock: 3,
      costoMaterial: 14, costoEmpaque: 22, horas: 11,
      materiales: ['Arcilla de orilla', 'Tierras de color', 'Resina vegetal'],
      claves: ['cantaro', 'cántaro', 'cantaros', 'ceramica', 'cerámica', 'olla', 'tinaja'],
      motivo: 'ondas', colores: ['#2F4D35', '#BDD3A7'], estado: 'publicado',
      descripcion: 'Cántaro modelado a mano por rollos, pintado con tierras y sellado con resina.',
      historia: 'Dolores saca la arcilla cuando el río baja. La pieza se seca una semana a la sombra antes de ir al fuego de leña.',
      creado: dia(-150).toISOString(),
    },
    {
      id: 'p5', artesanaId: 'a4', nombre: 'Canasta de tamshi', categoria: 'Cestería',
      singular: 'canasta', plural: 'canastas', precio: 95, stock: 7,
      costoMaterial: 9, costoEmpaque: 10, horas: 6,
      materiales: ['Tamshi', 'Bombonaje'],
      claves: ['canasta', 'canastas', 'cesta', 'tamshi'],
      motivo: 'espiral', colores: ['#90AD2E', '#0B1F10'], estado: 'publicado',
      descripcion: 'Canasta de liana tejida en húmedo, firme y liviana.',
      historia: 'Esther corta el tamshi en luna menguante. Dice que así la canasta dura años sin que le entre la polilla.',
      creado: dia(-70).toISOString(),
    },
    {
      id: 'p6', artesanaId: 'a5', nombre: 'Faja de algodón nativo', categoria: 'Tejidos',
      singular: 'faja', plural: 'fajas', precio: 110, stock: 4,
      costoMaterial: 12, costoEmpaque: 6, horas: 7,
      materiales: ['Algodón nativo pardo', 'Algodón nativo crema'],
      claves: ['faja', 'fajas', 'cinturon', 'telar'],
      motivo: 'franjas', colores: ['#123F1B', '#BDD3A7'], estado: 'publicado',
      descripcion: 'Faja tejida en telar de cintura con algodón nativo en sus colores naturales.',
      historia: 'Marina siembra el algodón, lo hila con huso y lo teje amarrada al telar. No usa tinte: ese pardo es el color de la planta.',
      creado: dia(-45).toISOString(),
    },
    {
      id: 'p7', artesanaId: 'a4', nombre: 'Individuales de bombonaje (juego de 4)', categoria: 'Cestería',
      singular: 'juego de individuales', plural: 'juegos de individuales', precio: 70, stock: 5,
      costoMaterial: 8, costoEmpaque: 5, horas: 4,
      materiales: ['Bombonaje teñido con corteza'],
      claves: ['individual', 'individuales', 'mantel', 'bombonaje'],
      motivo: 'trama', colores: ['#90AD2E', '#2F4D35'], estado: 'publicado',
      descripcion: 'Cuatro individuales tejidos en bombonaje, teñidos con corteza.',
      historia: 'Esther los empezó a hacer cuando un hotel le pidió algo para la mesa. Hoy es su pedido más repetido.',
      creado: dia(-30).toISOString(),
    },
  ];

  /* --- compradores -------------------------------------------------------- */
  const compradores = [
    { id: 'c1', nombre: 'Kuyay Diseño', tipo: 'Tienda de diseño', ciudad: 'Lima' },
    { id: 'c2', nombre: 'Hotel Selva Viva', tipo: 'Hotel boutique', ciudad: 'Bagua Grande' },
    { id: 'c3', nombre: 'Raíz Comercio Justo', tipo: 'Tienda de comercio justo', ciudad: 'Arequipa' },
  ];

  /* --- pedidos ------------------------------------------------------------ */
  const pedidos = [
    {
      id: 'PED-0141', compradorId: 'c1', estado: 'enviado', canal: 'mercado',
      items: [{ productoId: 'p1', cantidad: 12, precio: 40 }],
      creado: dia(-22).toISOString(), entrega: dia(-4).toISOString(),
      historial: [
        { ts: dia(-22).toISOString(), canal: 'mercado', texto: 'Kuyay Diseño hizo el pedido desde el Mercado' },
        { ts: dia(-18).toISOString(), canal: 'app', texto: 'Yanua confirmó y lo asignó a Rosa' },
        { ts: dia(-7).toISOString(), canal: 'whatsapp', texto: 'Rosa reportó las 12 piezas terminadas' },
        { ts: dia(-4).toISOString(), canal: 'app', texto: 'Enviado por agencia a Lima' },
      ],
    },
    {
      id: 'PED-0142', compradorId: 'c2', estado: 'listo', canal: 'whatsapp',
      items: [{ productoId: 'p7', cantidad: 8, precio: 70 }],
      creado: dia(-15).toISOString(), entrega: dia(2).toISOString(),
      historial: [
        { ts: dia(-15).toISOString(), canal: 'whatsapp', texto: 'El hotel escribió a Yanua y ella lo registró por WhatsApp' },
        { ts: dia(-2).toISOString(), canal: 'whatsapp', texto: 'Esther reportó los 8 juegos terminados' },
      ],
    },
    {
      id: 'PED-0143', compradorId: 'c3', estado: 'en produccion', canal: 'mercado',
      items: [{ productoId: 'p2', cantidad: 6, precio: 130 }, { productoId: 'p6', cantidad: 3, precio: 110 }],
      creado: dia(-9).toISOString(), entrega: dia(16).toISOString(),
      historial: [
        { ts: dia(-9).toISOString(), canal: 'mercado', texto: 'Raíz Comercio Justo hizo el pedido desde el Mercado' },
        { ts: dia(-8).toISOString(), canal: 'app', texto: 'Yanua repartió el trabajo entre ella y Marina' },
        { ts: dia(-3).toISOString(), canal: 'whatsapp', texto: 'Yanua reportó 2 bolsos listos' },
      ],
      avance: { p2: 2, p6: 0 },
    },
    {
      id: 'PED-0144', compradorId: 'c1', estado: 'solicitado', canal: 'mercado',
      items: [{ productoId: 'p4', cantidad: 2, precio: 180 }],
      creado: hora(0, 8, 40), entrega: dia(20).toISOString(),
      historial: [{ ts: hora(0, 8, 40), canal: 'mercado', texto: 'Kuyay Diseño pidió 2 cántaros desde el Mercado' }],
    },
  ];

  /* --- movimientos (Agente Negocio) ---------------------------------------
   * tipo: venta | material | empaque | transporte | compra
   * "compra" = materiales que se guardan para próximos trabajos: NO son costo
   * de lo vendido hoy. Esa distinción es el punto del Agente Negocio.
   */
  const movimientos = [];
  let mSeq = 0;
  const mov = (artesanaId, d, h, tipo, monto, detalle, extra) => {
    mSeq += 1;
    movimientos.push(Object.assign({
      id: 'mov' + mSeq, artesanaId, ts: hora(d, h, 0), tipo, monto,
      detalle, canal: 'whatsapp',
    }, extra || {}));
  };

  // Historial de 14 días para que el panel tenga una curva real que mostrar.
  const ventasPrevias = [
    ['a2', -13, 'p1', 1], ['a4', -13, 'p5', 1],
    ['a2', -12, 'p3', 2], ['a1', -11, 'p2', 1],
    ['a2', -10, 'p1', 2], ['a3', -10, 'p4', 1],
    ['a4', -9, 'p7', 2], ['a2', -9, 'p3', 1],
    ['a5', -8, 'p6', 1], ['a2', -7, 'p1', 1],
    ['a1', -6, 'p2', 2], ['a4', -6, 'p5', 1],
    ['a2', -5, 'p3', 3], ['a3', -4, 'p4', 1],
    ['a2', -4, 'p1', 2], ['a5', -3, 'p6', 1],
    ['a4', -2, 'p7', 1], ['a2', -2, 'p3', 2],
    ['a1', -1, 'p2', 1], ['a2', -1, 'p1', 1],
  ];
  ventasPrevias.forEach(([aid, d, pid, cant], i) => {
    const p = productos.find((x) => x.id === pid);
    mov(aid, d, 10 + (i % 7), 'venta', p.precio * cant,
      `${cant} ${cant === 1 ? p.singular : p.plural}`, { productoId: pid, cantidad: cant });
  });
  // Compras de material guardadas para después (no afectan la ganancia del día).
  mov('a2', -6, 9, 'compra', 60, 'Mostacilla y nailon para los próximos trabajos');
  mov('a4', -3, 9, 'compra', 45, 'Tinte de corteza');

  /* --- tareas de la coordinadora ------------------------------------------ */
  const tareas = [
    {
      id: 't1', tipo: 'audio', artesanaId: 'a3', ts: hora(0, 7, 15), estado: 'pendiente',
      titulo: 'Audio en awajún sin transcribir',
      detalle: 'Dolores envió un audio de 14 s. La transcripción automática quedó en 38 % de confianza.',
      duracion: '0:14', confianza: 0.38,
    },
  ];

  /* --- chats --------------------------------------------------------------- */
  const chats = {};
  artesanas.forEach((a) => { chats[a.id] = { artesanaId: a.id, mensajes: [], sesion: null }; });

  chats.a2.mensajes.push(
    { id: 'h1', de: 'bot', ts: hora(-1, 17, 30), tipo: 'texto',
      texto: 'Buenas tardes, Rosa. Anoté tu venta de ayer: 1 collar, S/40.\n\nEscribe *resumen* cuando quieras ver cómo vas.' },
  );
  chats.a1.mensajes.push(
    { id: 'h2', de: 'bot', ts: hora(0, 8, 41), tipo: 'texto',
      texto: ' *Pedido nuevo en el Mercado*\nKuyay Diseño pidió 2 cántaros de barro (S/360).\n\nEstá esperando tu confirmación en la app.' },
  );
  chats.a4.mensajes.push(
    { id: 'h3', de: 'bot', ts: hora(-2, 16, 5), tipo: 'texto',
      texto: '¡Gracias, Esther! Anoté los 8 juegos de individuales. El pedido PED-0142 quedó *listo para enviar*.' },
  );

  return {
    version: 5,
    config: {
      moneda: 'S/',
      tarifaHora: 10,
      enlaceMercado: 'manosvivas.pe/mercado',
    },
    asociacion: {
      nombre: 'Asociación de Mujeres Artesanas “Manos Vivas”',
      corto: 'Manos Vivas',
      provincia: 'Condorcanqui',
      region: 'Amazonas',
      pueblos: 'Awajún y Wampís',
      coordinadoraId: 'a1',
    },
    tecnicas, comunidades, artesanas, productos, compradores, pedidos,
    movimientos, tareas, chats,
    fichas: [],
    eventos: [],
    acceso: { autenticada: false, artesanaId: null, codigo: null, codigoPara: null },
    personaActiva: 'a2',
    noLeidos: { app: 1, mercado: 0, whatsapp: 0 },
  };
};
