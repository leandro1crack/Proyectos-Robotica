/* =====================================================
   GALLERY.JS — sala compacta, puerta, luces sin caja negra
   ===================================================== */

window.GalleryModule = (function () {

  let scene, THREE, textureLoader;
  const hotspots  = [];
  const artMeshes = [];

  /* dimensiones globales de la sala */
  const W = 5, H = 4, L = 35;
  const DOOR_Z = -10; /* puerta fija, no depende de L */

  /* ── Placeholder ──────────────────────────────────── */
  function makePlaceholder(hexColor) {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d");
    ctx.fillStyle = hexColor || "#c0bdb8";
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 240, 240);
    return new THREE.CanvasTexture(c);
  }

  /* ── Textura de obra con fallback ─────────────────── */
  function loadArtTexture(artwork) {
    const ph = makePlaceholder(artwork.placeholder);
    if (!artwork.texture) return ph;
    textureLoader.load(artwork.texture, tex => {
      artMeshes.forEach(({ mesh, art }) => {
        if (art.id === artwork.id) { mesh.material.map = tex; mesh.material.needsUpdate = true; }
      });
    }, undefined, () => {});
    return ph;
  }

  /* ── Material de pared (instancia nueva cada vez) ─── */
  function makeWallMat(repeatX, repeatY) {
    const cfg = window.GALLERY_CONFIG.scene;
    repeatX = repeatX || 3; repeatY = repeatY || 2;
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0 });
    if (cfg.wallTextures) {
      textureLoader.load(cfg.wallTextures.color, tex => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(repeatX, repeatY);
        mat.map = tex; mat.needsUpdate = true;
      });
      textureLoader.load(cfg.wallTextures.normal, tex => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(repeatX, repeatY);
        mat.normalMap = tex; mat.needsUpdate = true;
      });
      textureLoader.load(cfg.wallTextures.roughness, tex => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(repeatX, repeatY);
        mat.roughnessMap = tex; mat.needsUpdate = true;
      });
    } else {
      mat.color.set(cfg.wallColor);
    }
    return mat;
  }

  /* ── Cuadro + lámpara + hotspot ───────────────────── */
  function createArtwork(artwork, wallX, wallZ, rotation) {
    const cfg = window.GALLERY_CONFIG.scene;
    const group = new THREE.Group();

    const frameW = 1.6, frameH = 1.1, frameD = 0.05;
    group.add(new THREE.Mesh(
      new THREE.BoxGeometry(frameW + 0.08, frameH + 0.08, frameD),
      new THREE.MeshStandardMaterial({ color: cfg.frameColor, roughness: 0.4, metalness: 0.3 })
    ));

    const canvasMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(frameW, frameH),
      new THREE.MeshStandardMaterial({ map: loadArtTexture(artwork), roughness: 0.9 })
    );
    canvasMesh.position.z = frameD / 2 + 0.001;
    group.add(canvasMesh);
    artMeshes.push({ mesh: canvasMesh, art: artwork });

    group.position.set(wallX, 1.55, wallZ);
    group.rotation.y = rotation;
    scene.add(group);

    addPictureLamp(wallX, wallZ, rotation, frameW);

    /* hotspot invisible — solo guarda posición para detección por distancia */
    const dummyGeo = new THREE.PlaneGeometry(0.01, 0.01);
    const dummyMat = new THREE.MeshBasicMaterial({ visible: false });
    const circle   = new THREE.Mesh(dummyGeo, dummyMat);
    circle.rotation.x = -Math.PI / 2;
    /* posición frente al cuadro, en el pasillo */
    let cx = wallX;
    if (Math.abs(rotation) === Math.PI / 2) {
      cx = wallX + (rotation > 0 ? 1.0 : -1.0);
    }
    circle.position.set(cx, 0.001, wallZ);
    scene.add(circle);
    hotspots.push({ mesh: circle, artwork });
  }

  /* ── Lámpara sobre cuadro — SOLO barra + luz, sin caja ── */
  function addPictureLamp(wallX, wallZ, rotation, frameW) {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.9 });

    /* barra horizontal */
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, frameW * 0.9, 8), mat);
    bar.rotation.z = Math.PI / 2;
    g.add(bar);

    /* dos soportes curvos en los extremos */
    [-frameW * 0.35, frameW * 0.35].forEach(ox => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.1, 6), mat);
      arm.position.set(ox, -0.05, 0.03);
      arm.rotation.x = 0.5;
      g.add(arm);
    });

    /* difusor luminoso — sin geometry de caja, solo un plano delgado */
    const diffMat = new THREE.MeshStandardMaterial({
      color: 0xfff8e7,
      emissive: 0xfff5cc,
      emissiveIntensity: 2,
      roughness: 0.05,
      transparent: true,
      opacity: 0.9,
    });
    const diff = new THREE.Mesh(new THREE.PlaneGeometry(frameW * 0.8, 0.04), diffMat);
    diff.position.set(0, -0.04, 0.025);
    g.add(diff);

    /* spot apuntando al cuadro */
    const spot = new THREE.SpotLight(0xfff5cc, 2.5, 3.0, Math.PI / 6, 0.4);
    spot.position.set(0, 0, 0.05);
    spot.target.position.set(0, -1.5, 0.5);
    g.add(spot);
    g.add(spot.target);

    g.position.set(wallX, 2.5, wallZ);
    g.rotation.y = rotation;
    scene.add(g);
  }

  /* ── Ring light en techo — sin caja base ─────────── */
  function addCeilingRingLight(x, z) {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3, metalness: 0.9 });

    /* aro exterior */
    g.add(new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.035, 10, 48), mat));
    /* aro interior */
    g.add(new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.022, 8, 32), mat));

    /* varilla de techo — reemplaza la caja negra */
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.06, 8), mat);
    rod.position.y = 0.03;
    g.add(rod);

    /* difusor anular luminoso */
    const glowMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffeedd,
      emissiveIntensity: 2,
      roughness: 0.05,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
    });
    g.add(new THREE.Mesh(new THREE.RingGeometry(0.15, 0.31, 48), glowMat));

    /* luz puntual hacia abajo */
    const light = new THREE.PointLight(0xfff5e0, 1.4, 8);
    light.position.set(0, -0.1, 0);
    g.add(light);

    g.rotation.x = Math.PI / 2;
    g.position.set(x, H - 0.02, z);
    scene.add(g);
  }

  /* ── Baranda ─────────────────────────────────────── */
  function addRail(x) {
    const mat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3, metalness: 0.8 });
    const RAIL_H   = 0.90;  /* altura total de la baranda */
    const POST_GAP = 1.4;   /* separación entre postes */

    /* ── Barras horizontales ──
       CylinderGeometry apunta en Y por defecto.
       Para que quede horizontal en Z, rotamos PI/2 en X. */
    const topBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, L, 8), mat
    );
    topBar.rotation.x = Math.PI / 2;   /* ahora apunta en Z */
    topBar.position.set(x, RAIL_H, 0);
    scene.add(topBar);

    const midBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, L, 8), mat
    );
    midBar.rotation.x = Math.PI / 2;
    midBar.position.set(x, RAIL_H * 0.55, 0);
    scene.add(midBar);

    /* ── Postes verticales ──
       Van desde Y=0 hasta Y=RAIL_H.
       Centro del cilindro en Y = RAIL_H / 2. */
    const zStart = -(L / 2);
    const zEnd   =  (L / 2);
    for (let z = zStart; z <= zEnd + 0.01; z += POST_GAP) {
      /* poste */
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.014, RAIL_H, 8), mat
      );
      post.position.set(x, RAIL_H / 2, z);
      scene.add(post);

      /* base al ras del piso */
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.04, 8), mat
      );
      base.position.set(x, 0.02, z);
      scene.add(base);
    }
  }

  /* ── Puerta "Próximamente" ────────────────────────── */
  function addBlockedDoor() {
    const doorW = 1.4, doorH = 2.6;
    const wallZ = DOOR_Z + 0.06;

    /* Marco de la puerta */
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4, metalness: 0.6 });

    /* jambas laterales */
    [-doorW / 2 - 0.07, doorW / 2 + 0.07].forEach(ox => {
      const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.14, doorH + 0.14, 0.12), frameMat);
      jamb.position.set(ox, doorH / 2, wallZ);
      scene.add(jamb);
    });
    /* dintel */
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(doorW + 0.28, 0.14, 0.12), frameMat);
    lintel.position.set(0, doorH + 0.07, wallZ);
    scene.add(lintel);

    /* Puerta bloqueada — panel oscuro con cadena */
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.6, metalness: 0.4 });
    const door = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, 0.08), doorMat);
    door.position.set(0, doorH / 2, wallZ + 0.02);
    scene.add(door);

    /* cadena horizontal */
    const chainMat = new THREE.MeshStandardMaterial({ color: 0x888800, roughness: 0.3, metalness: 0.9 });
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, doorW * 0.9, 6), chainMat);
    chain.rotation.z = Math.PI / 2;
    chain.position.set(0, doorH * 0.5, wallZ + 0.07);
    scene.add(chain);

    /* texto "PRÓXIMAMENTE" en canvas */
    const c = document.createElement("canvas");
    c.width = 512; c.height = 256;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.clearRect(0, 0, 512, 256);

    ctx.fillStyle = "#ffcc00";
    ctx.font = "bold 52px Georgia, serif";
    ctx.textAlign = "center";
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 8;
    ctx.fillText("PRÓXIMAMENTE", 256, 100);

    ctx.font = "22px 'Courier New', monospace";
    ctx.fillStyle = "#aaaaaa";
    ctx.shadowBlur = 4;
    ctx.fillText("Sala en construcción", 256, 148);

    const signTex = new THREE.CanvasTexture(c);
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.6),
      new THREE.MeshStandardMaterial({ map: signTex, transparent: true, roughness: 0.9 })
    );
    sign.position.set(0, doorH * 0.72, wallZ + 0.1);
    scene.add(sign);

    /* luz roja encima de la puerta */
    const redLight = new THREE.PointLight(0xff2200, 0.8, 2.5);
    redLight.position.set(0, doorH + 0.4, wallZ + 0.3);
    scene.add(redLight);

    /* pequeño foco rojo */
    const bulbMat = new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: 0xff2200, emissiveIntensity: 3 });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), bulbMat);
    bulb.position.set(0, doorH + 0.4, wallZ + 0.3);
    scene.add(bulb);
  }

  /* ── Construir sala ───────────────────────────────── */
  function buildRoom() {
    /* Piso */
    const floorMat = new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.05 });
    textureLoader.load("assets/floor_texture.png", tex => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 10);
      floorMat.map = tex; floorMat.needsUpdate = true;
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, L), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    /* Techo */
    const ceilMat = new THREE.MeshStandardMaterial({ roughness: 0.9 });
    textureLoader.load("assets/ceiling_texture.png", tex => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(3, 10);
      ceilMat.map = tex; ceilMat.needsUpdate = true;
    });
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, L), ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = H;
    scene.add(ceil);

    /* Paredes */
    const wallL = new THREE.Mesh(new THREE.PlaneGeometry(L, H), makeWallMat(10, 2));
    wallL.rotation.y = Math.PI / 2;
    wallL.position.set(-W / 2, H / 2, 0);
    scene.add(wallL);

    const wallR = new THREE.Mesh(new THREE.PlaneGeometry(L, H), makeWallMat(10, 2));
    wallR.rotation.y = -Math.PI / 2;
    wallR.position.set(W / 2, H / 2, 0);
    scene.add(wallR);

    /* pared frontal — con hueco para la puerta (fija en DOOR_Z) */
    const wallFmat = makeWallMat(2, 2);
    const sideW = (W - 1.68) / 2;
    [-1, 1].forEach(side => {
      const s = new THREE.Mesh(new THREE.PlaneGeometry(sideW, H), wallFmat);
      s.position.set(side * (W / 2 - sideW / 2), H / 2, DOOR_Z);
      scene.add(s);
    });
    const topH = H - 2.74;
    const topWall = new THREE.Mesh(new THREE.PlaneGeometry(W, topH), wallFmat);
    topWall.position.set(0, H - topH / 2, DOOR_Z);
    scene.add(topWall);

    /* corredor detrás de la puerta: paredes laterales extra */
    const corridorL = L / 2 - (-DOOR_Z);
    [-W/2, W/2].forEach((cx, i) => {
      const cw = new THREE.Mesh(
        new THREE.PlaneGeometry(corridorL, H),
        makeWallMat(2, 2)
      );
      cw.rotation.y = i === 0 ? Math.PI / 2 : -Math.PI / 2;
      cw.position.set(cx, H / 2, DOOR_Z - corridorL / 2);
      scene.add(cw);
    });

    /* pared trasera — rotation.y = PI para que la cara mire hacia -Z (hacia el jugador) */
    const wallB = new THREE.Mesh(new THREE.PlaneGeometry(W, H), makeWallMat(2, 2));
    wallB.rotation.y = Math.PI;
    wallB.position.set(0, H / 2, L / 2);
    scene.add(wallB);

    /* Barandas */
    addRail(-W / 2 + 1.3);
    addRail( W / 2 - 1.3);

    /* Ring lights en el techo */
    [-14, -9, -4, 0, 4, 9, 14].forEach(z => addCeilingRingLight(0, z));

    /* Puerta bloqueada */
    addBlockedDoor();
  }

  /* ── Luces globales ───────────────────────────────── */
  function addLights() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dir = new THREE.DirectionalLight(0xfff5e0, 0.35);
    dir.position.set(0, 8, 3);
    dir.castShadow = true;
    scene.add(dir);
  }

  /* ── Init ─────────────────────────────────────────── */
  function init(sceneRef, THREERef) {
    scene = sceneRef;
    THREE = THREERef;
    textureLoader = new THREE.TextureLoader();

    addLights();
    buildRoom();

    const HALF = 2.44;
    window.GALLERY_CONFIG.artworks.forEach(art => {
      if (art.wall === "left")  createArtwork(art, -HALF, art.position, Math.PI / 2);
      if (art.wall === "right") createArtwork(art,  HALF, art.position, -Math.PI / 2);
    });
  }

  /* exponer dimensiones para colisiones */
  return {
    init,
    getHotspots:  () => hotspots,
    getArtMeshes: () => artMeshes,
    getRoomSize:  () => ({ W, H, L }),
  };

})();
