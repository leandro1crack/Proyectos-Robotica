/* =====================================================
   MAIN.JS
   ===================================================== */

(async function () {

  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Mono:wght@300;400&display=swap";
  document.head.appendChild(link);

  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js");
  const THREE = window.THREE;

  const cfg = window.GALLERY_CONFIG;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(cfg.scene.bgColor);

  const canvas   = document.getElementById("gallery-canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.6, 16);

  if (!window.GalleryModule)   { console.error("GalleryModule no cargó");   return; }
  if (!window.CharacterModule) { console.error("CharacterModule no cargó"); return; }

  window.GalleryModule.init(scene, THREE);
  window.CharacterModule.init(scene, THREE);
  if (window.NPCModule) window.NPCModule.init(scene, THREE);

  const charState = { pos: new THREE.Vector3(0, 0, 16), angle: Math.PI };

  const keys = {};
  document.addEventListener("keydown", e => { keys[e.key.toLowerCase()] = true; });
  document.addEventListener("keyup",   e => { keys[e.key.toLowerCase()] = false; });

  const joystickZone = document.getElementById("joystick-zone");
  let joystickActive = false;
  let joystickStart  = { x: 0, y: 0 };
  let joystickDelta  = { x: 0, y: 0 };

  joystickZone.addEventListener("touchstart", e => {
    joystickActive = true;
    joystickStart  = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  document.addEventListener("touchmove", e => {
    if (!joystickActive) return;
    joystickDelta = {
      x: (e.touches[0].clientX - joystickStart.x) / 80,
      y: (e.touches[0].clientY - joystickStart.y) / 80,
    };
  }, { passive: true });
  document.addEventListener("touchend", () => { joystickActive = false; joystickDelta = { x: 0, y: 0 }; });

  /* ── Colisiones ─────────────────────────────────────── */
  const RAIL_X  = 1.2;
  const DOOR_Z  = -10;    /* debe coincidir con gallery.js */
  const L_HALF  = 17.2;  /* L=35 / 2 */

  function clampPosition(pos) {
    pos.x = Math.max(-2.2, Math.min(2.2, pos.x));
    pos.z = Math.max(-L_HALF, Math.min(L_HALF, pos.z));

    /* barandas */
    if (pos.x > RAIL_X && pos.x < RAIL_X + 0.4)   pos.x = RAIL_X;
    if (pos.x < -RAIL_X && pos.x > -RAIL_X - 0.4)  pos.x = -RAIL_X;

    /* puerta bloqueada — no pasar */
    if (pos.z < DOOR_Z + 0.8) pos.z = DOOR_Z + 0.8;

    /* pared trasera (spawn) — abrir menú al llegar */
    if (pos.z > L_HALF - 1.2) {
      pos.z = L_HALF - 1.2;
      openEndMenu();
    }
  }

  /* ── End-of-hall menu ───────────────────────────────── */
  function createEndMenu() {
    const overlay = document.createElement("div");
    overlay.id = "end-menu";
    overlay.innerHTML = `
      <div class="end-menu-inner">
        <div class="end-menu-logo">${cfg.artist.name}</div>
        <div class="end-menu-sub">${cfg.artist.subtitle}</div>
        <nav class="end-menu-nav">
          <a href="#" id="end-back">← Volver a la galería</a>
          <a href="#" id="end-gallery1">Galería I</a>
          <a href="${cfg.artist.website || 'https://testeandocanva2024.my.canva.site/robotica-parte2'}" target="_blank" id="end-site">Sitio web →</a>
        </nav>
        <div class="end-menu-footer">Sala en construcción — próximamente</div>
      </div>
      <img src="assets/pichones_logo.png" class="end-menu-pichones" alt="Los Pichones Army" />
    `;
    document.body.appendChild(overlay);

    const style = document.createElement("style");
    style.textContent = `
      #end-menu {
        position: fixed; inset: 0; z-index: 600;
        background: rgba(8,8,8,0.97);
        display: flex; align-items: center; justify-content: center;
        opacity: 0; pointer-events: none;
        transition: opacity 0.6s ease;
      }
      #end-menu.visible { opacity: 1; pointer-events: all; }
      .end-menu-inner { text-align: center; color: #f0efec; }
      .end-menu-logo {
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: clamp(2.5rem, 6vw, 5rem);
        letter-spacing: 0.04em;
        margin-bottom: 6px;
      }
      .end-menu-sub {
        font-family: 'DM Mono', monospace;
        font-size: 0.7rem;
        letter-spacing: 0.3em;
        color: #ffcc00;
        text-transform: uppercase;
        margin-bottom: 48px;
      }
      .end-menu-nav {
        display: flex; flex-direction: column;
        gap: 20px; align-items: center;
      }
      .end-menu-nav a {
        font-family: 'Cormorant Garamond', serif;
        font-size: clamp(1.4rem, 3vw, 2.2rem);
        color: #f0efec; text-decoration: none;
        letter-spacing: 0.06em;
        transition: color 0.2s, opacity 0.2s;
      }
      .end-menu-nav a:hover { color: #ffcc00; }
      .end-menu-footer {
        margin-top: 48px;
        font-family: 'DM Mono', monospace;
        font-size: 0.6rem;
        letter-spacing: 0.2em;
        opacity: 0.3;
      }
      .end-menu-pichones {
        position: fixed;
        bottom: 24px;
        left: 28px;
        width: 220px;
        opacity: 0.85;
        filter: drop-shadow(0 2px 8px rgba(0,0,0,0.7));
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);

    return overlay;
  }

  const endMenu = createEndMenu();
  let endMenuOpen = false;

  function openEndMenu() {
    if (endMenuOpen) return;
    endMenuOpen = true;
    endMenu.classList.add("visible");
  }

  function closeEndMenu() {
    endMenuOpen = false;
    endMenu.classList.remove("visible");
  }

  document.getElementById("end-back").addEventListener("click", e => {
    e.preventDefault();
    closeEndMenu();
    charState.pos.set(0, 0, DOOR_Z + 2);
    charState.angle = 0; /* dar vuelta */
  });

  document.getElementById("end-gallery1").addEventListener("click", e => {
    e.preventDefault();
    closeEndMenu();
    charState.pos.set(0, 0, 16);
    charState.angle = Math.PI;
  });



  /* ── Modal obras ────────────────────────────────────── */
  const modal      = document.getElementById("artwork-modal");
  const modalImg   = document.getElementById("modal-img");
  const modalTitle = document.getElementById("modal-title");
  const modalDesc  = document.getElementById("modal-desc");
  const modalLink  = document.getElementById("modal-canva-link");
  const modalClose = document.querySelector(".modal-close");
  let isModalOpen  = false;

  function openModal(artwork) {
    if (artwork.texture) {
      modalImg.src = artwork.texture;
      modalImg.style.display = "block";
      modalImg.style.cursor  = "pointer";
      modalImg.style.background = "none";
      modalImg.style.minHeight  = "auto";
    } else {
      modalImg.src = "";
      modalImg.style.display    = "block";
      modalImg.style.background = artwork.placeholder || "#888";
      modalImg.style.minHeight  = "180px";
      modalImg.style.cursor     = "pointer";
    }
    modalImg.onclick       = () => window.open(artwork.canvaLink, "_blank");
    modalTitle.textContent = artwork.title;
    modalDesc.textContent  = artwork.desc;
    modalLink.href         = artwork.canvaLink;
    modal.classList.add("open");
    isModalOpen = true;
  }

  function closeModal() {
    modal.classList.remove("open");
    isModalOpen = false;
  }

  modalClose.addEventListener("click", closeModal);
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeModal(); closeEndMenu(); } });

  const hint = document.getElementById("hint");

  /* ── Zoom hotspot ───────────────────────────────────── */
  let isZooming   = false;
  const camTarget = new THREE.Vector3();
  const camLookAt = new THREE.Vector3();

  function triggerHotspot(hs) {
    if (isModalOpen || isZooming) return;
    const art  = hs.artwork;
    const side = art.wall === "left" ? 0.9 : -0.9;
    camTarget.set(hs.mesh.position.x + side, 1.55, hs.mesh.position.z);
    camLookAt.set(hs.mesh.position.x + side * -2, 1.55, hs.mesh.position.z);
    isZooming = true;
    setTimeout(() => { openModal(art); isZooming = false; }, 600);
  }

  /* ── Menú principal ─────────────────────────────────── */
  document.getElementById("menu-btn").addEventListener("click", () =>
    document.getElementById("menu-overlay").classList.add("open"));
  document.querySelector(".menu-close").addEventListener("click", () =>
    document.getElementById("menu-overlay").classList.remove("open"));
  document.querySelectorAll(".menu-nav a").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      const sec = cfg.sections[a.dataset.section];
      if (sec) { charState.pos.set(sec.x, 0, sec.z + 1); charState.angle = Math.PI; }
      document.getElementById("menu-overlay").classList.remove("open");
    });
  });

  /* ── Loading ────────────────────────────────────────── */
  setTimeout(() => {
    const ls = document.getElementById("loading-screen");
    if (ls) { ls.classList.add("hidden"); setTimeout(() => ls.remove(), 900); }
  }, 1800);

  const clock = new THREE.Clock();

  /* ── LOOP ───────────────────────────────────────────── */
  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (!isModalOpen && !endMenuOpen) {
      const spd = cfg.character.speed;
      const rot = cfg.character.rotSpeed;
      let moving = false;

      if (keys["arrowleft"]  || keys["a"]) charState.angle += rot;
      if (keys["arrowright"] || keys["d"]) charState.angle -= rot;
      if (keys["arrowup"]    || keys["w"]) {
        charState.pos.x += Math.sin(charState.angle) * spd;
        charState.pos.z += Math.cos(charState.angle) * spd;
        moving = true;
      }
      if (keys["arrowdown"]  || keys["s"]) {
        charState.pos.x -= Math.sin(charState.angle) * spd;
        charState.pos.z -= Math.cos(charState.angle) * spd;
        moving = true;
      }
      if (joystickActive) {
        charState.angle -= joystickDelta.x * rot;
        charState.pos.x += Math.sin(charState.angle) * (-joystickDelta.y) * spd;
        charState.pos.z += Math.cos(charState.angle) * (-joystickDelta.y) * spd;
        if (Math.abs(joystickDelta.y) > 0.1) moving = true;
      }

      clampPosition(charState.pos);

      /* ── Detectar llegada a la puerta ───────────────── */
      if (charState.pos.z < DOOR_Z + 1.5) {
        openEndMenu();
      }

      const char = window.CharacterModule.getMesh();
      if (char) {
        char.position.set(charState.pos.x, 0, charState.pos.z);
        char.rotation.y = charState.angle;
      }
      window.CharacterModule.animateWalk(moving);

      /* ── Hotspots ───────────────────────────────────── */
      const hotspots = window.GalleryModule.getHotspots();
      let nearHotspot = null;
      hotspots.forEach(hs => {
        const dx = charState.pos.x - hs.mesh.position.x;
        const dz = charState.pos.z - hs.mesh.position.z;
        if (Math.sqrt(dx * dx + dz * dz) < 1.6) nearHotspot = hs;
      });

      if (nearHotspot && hint) {
        hint.textContent = "[ E ] Ver obra";
        hint.style.opacity = "1";
      } else if (hint) {
        hint.style.opacity = "0";
      }

      /* ── Cámara ─────────────────────────────────────── */
      if (!isZooming) {
        const dist = 2.0;
        let tx = charState.pos.x - Math.sin(charState.angle) * dist;
        let tz = charState.pos.z - Math.cos(charState.angle) * dist;
        tx = Math.max(-2.0, Math.min(2.0, tx));
        tz = Math.max(-16.7, Math.min(16.7, tz));

        camera.position.x += (tx   - camera.position.x) * 0.06;
        camera.position.y += (1.55 - camera.position.y) * 0.06;
        camera.position.z += (tz   - camera.position.z) * 0.06;
        camera.lookAt(
          charState.pos.x + Math.sin(charState.angle) * 2,
          1.3,
          charState.pos.z + Math.cos(charState.angle) * 2
        );
      } else {
        camera.position.lerp(camTarget, 0.08);
        camera.lookAt(camLookAt);
      }

      /* E para hotspot */
      if ((keys["e"] || keys[" "]) && nearHotspot && !isModalOpen) {
        keys["e"] = false; keys[" "] = false;
        triggerHotspot(nearHotspot);
      }
    }

    window.CharacterModule.update(delta);
    if (window.NPCModule) window.NPCModule.update(delta, charState.pos, keys);
    renderer.render(scene, camera);
  }

  canvas.addEventListener("click", () => {
    if (isModalOpen || endMenuOpen) return;
    const hotspots = window.GalleryModule.getHotspots();
    hotspots.forEach(hs => {
      const dx = charState.pos.x - hs.mesh.position.x;
      const dz = charState.pos.z - hs.mesh.position.z;
      if (Math.sqrt(dx*dx + dz*dz) < 1.6) triggerHotspot(hs);
    });
  });

  canvas.addEventListener("touchend", () => {
    if (isModalOpen || joystickActive || endMenuOpen) return;
    const hotspots = window.GalleryModule.getHotspots();
    hotspots.forEach(hs => {
      const dx = charState.pos.x - hs.mesh.position.x;
      const dz = charState.pos.z - hs.mesh.position.z;
      if (Math.sqrt(dx*dx + dz*dz) < 1.6) triggerHotspot(hs);
    });
  });

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
})();
