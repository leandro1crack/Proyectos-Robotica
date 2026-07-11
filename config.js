/* =====================================================
   CONFIG.JS — TODA LA CONFIGURACIÓN EDITABLE
   Modificá acá: obras, texturas, links, colores 3D
   ===================================================== */

window.GALLERY_CONFIG = {

  /* ── ARTISTA ──────────────────────────────────────── */
  artist: {
    name: "Leandro Rodriguez",
    subtitle: "Proyectos",
    bio: [
      "-",
      "-",
      "-"
    ]
  },

  /* ── COLORES 3D (escena Three.js) ────────────────── */
  scene: {
    bgColor:    0xf0efec,   /* color del cielo / fondo */
    wallColor:  0xdedad4,
    wallTextures: {
      color:     "assets/wall_color.png",
      normal:    "assets/wall_normal.png",
      roughness: "assets/wall_roughness.png",
    },
    floorColor: 0xc8c4bb,   /* color del piso */
    ceilColor:  0xe8e5e0,   /* color del techo */
    frameColor: 0x111111,   /* color de los marcos */
    circleColor:0x888888,   /* color círculos del piso */
    lightColor: 0xffffff,   /* color de la luz */
    fogColor:   0xf0efec,   /* color de la niebla */
    fogNear:    999,
    fogFar:     1000,
  },

  /* ── PERSONAJE ────────────────────────────────────── */
  character: {
    useGLB: true,          /* true = usa modelo GLB */
    glbPath: "assets/character.glb",  /* ruta al GLB */
    scale: 0.018,
    color: 0x111111,        /* color del personaje geométrico */
    speed: 0.06,
    rotSpeed: 0.05,
  },

  /* ── OBRAS DE ARTE ────────────────────────────────── */
  /* 
    texture: ruta a la imagen (reemplazala por tu archivo)
             usa "" o null para mostrar placeholder gris
    canvaLink: link al diseño en Canva
    title: título de la obra
    desc: descripción que aparece en el modal
  */
  artworks: [
    /* ── GALERÍA IZQUIERDA (gallery1) ── */
    {
      id: "obra1",
      texture: "assets/obra1.jpg",
      placeholder: "#7700ff",
      title: "ADN",
      desc: "Busqueda e impresion 3d de una cadena de ADN",
      canvaLink: "https://canva.link/h729l27im43x2p1",
      wall: "left",
      position: -4,
    },
    {
      id: "obra2",
      texture: "assets/obra2.jpg",
      placeholder: "#74f3ef",
      title: "Wifi Deauther",
      desc: "Deshabilitador de WIFI mediante saturación de paquetes.",
      canvaLink: "https://canva.link/apvmjz6emq8sth7",
      wall: "left",
      position: -1,
    },
    {
      id: "obra3",
      texture: "assets/obra3.jpg",
      placeholder: "#00b3ff",
      title: "Fracciones en 3d",
      desc: "Busqueda e impresion de un disco de fracciones en 3d",
      canvaLink: "https://canva.link/m98bex50vevsiz6",
      wall: "left",
      position: 2,
    },
    {
      id: "obra4",
      texture: "assets/obra4.jpg",
      placeholder: "#ecc900",
      title: "SmartBin",
      desc: "Instalación de un servomotor y 1 sensor ultrasonico a un tacho de basura.",
      canvaLink: "https://canva.link/r72u559kic747sv",
      wall: "left",
      position: 5,
    },

    /* ── GALERÍA DERECHA (gallery2) ── */
    {
      id: "obra5",
      texture: "assets/obra5.jpg",
      placeholder: "#b700ff",
      title: "Galeria 3d con Three.js",
      desc: "Documentando el diseño de la Galeria 3d",
      canvaLink: "https://canva.link/k9ov8uyb707xgb1",
      wall: "right",
      position: -5,
    },
    {
      id: "obra6",
      texture: "assets/obra6.jpg",
      placeholder: "#c2bfba",
      title: "-",
      desc: "-",
      canvaLink: "https://www.canva.com/design/TU_LINK_OBRA6",
      wall: "right",
      position: -2,
    },
    {
      id: "obra7",
      texture: "assets/obra7.jpg",
      placeholder: "#b8b5b0",
      title: "-",
      desc: "-.",
      canvaLink: "https://www.canva.com/design/TU_LINK_OBRA7",
      wall: "right",
      position: 1,
    },
    {
      id: "obra8",
      texture: "assets/obra8.jpg",
      placeholder: "#b8b5b0",
      title: "-",
      desc: "-.",
      canvaLink: "https://www.canva.com/design/TU_LINK_OBRA8",
      wall: "right",
      position: 4,
    },
  ],

  /* ── GALERÍAS / SECCIONES ─────────────────────────── */
  sections: {
    entrance: { x: 0,   z: 0  },
    gallery1: { x: 0,   z: -6 },
    gallery2: { x: 0,   z: 6  },
    about:    { x: 0,   z: 0  },
  },

};
