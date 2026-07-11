/* =====================================================
   NPC.JS — 
   ===================================================== */

window.NPCModule = (function () {

  let scene, THREE;
  let mesh   = null;
  let mixer  = null;

  const NPC_POS   = { x: -1.8, z: -8.0 };  /*  (menos z negativo) */
  const NPC_SCALE = 0.050;

  /* ── Frases ──────────────────────────────────────── */
  const PHRASES = [
    "Hola visitante",
    
    "Lean es un estudiante crack",
    "¿Has venido a contemplar... o a aprender?",
    "No sé por qué me pusieron en un pedestal. Igual no me quejo.",
    "El silencio de la documentacion habla fuerte",
    "Nico si no me pones un 10 sos un pichon. -Leon(pichon supremo)",
    "Lean es un crack",
     "Harry es un crack",
    "Garabello es un crack",
    "Leon es un pichon",
    "Ponganle un 10 a Lean",
    "...",
    "aguante bocaaaaaa",
  ];

  let lastPhrase  = -1;
  let isTalking   = false;
  let talkTimeout = null;

 let phraseIndex = 0;
function getRandomPhrase() {
  const phrase = PHRASES[phraseIndex];
  phraseIndex = (phraseIndex + 1) % PHRASES.length;
  return phrase;
}

  /* ── UI diálogo ──────────────────────────────────── */
  function createDialogUI() {
    const box = document.createElement("div");
    box.id = "npc-dialog";
    box.innerHTML = `
      <div class="npc-dialog-inner">
        <div class="npc-name">Cuidador de Documentaciones</div>
        <div class="npc-text" id="npc-text"></div>
      </div>
    `;
    document.body.appendChild(box);

    const style = document.createElement("style");
    style.textContent = `
      #npc-dialog {
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 500;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
        max-width: 480px;
        width: 90%;
      }
      #npc-dialog.visible { opacity: 1; }
      .npc-dialog-inner {
        background: rgba(10,10,10,0.92);
        border: 1px solid #ffcc00;
        padding: 16px 24px;
        font-family: 'DM Mono', 'Courier New', monospace;
        color: #f0efec;
        border-radius: 2px;
        box-shadow: 0 0 20px rgba(255,200,0,0.15);
      }
      .npc-name {
        font-size: 0.65rem;
        letter-spacing: 0.2em;
        color: #ffcc00;
        margin-bottom: 8px;
        text-transform: uppercase;
      }
      .npc-text { font-size: 0.9rem; line-height: 1.6; color: #e8e8e8; }
      #npc-hint {
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 499;
        font-family: 'DM Mono', monospace;
        font-size: 0.62rem;
        letter-spacing: 0.18em;
        color: #ffcc00;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        text-align: center;
      }
      #npc-hint.visible { opacity: 0.8; }
    `;
    document.head.appendChild(style);

    const hint = document.createElement("div");
    hint.id = "npc-hint";
    hint.textContent = "[ E ] Hablar con el cuidador";
    document.body.appendChild(hint);
  }

  function showDialog(text) {
    const box  = document.getElementById("npc-dialog");
    const txt  = document.getElementById("npc-text");
    const hint = document.getElementById("npc-hint");
    if (!box || !txt) return;
    isTalking = true;
    txt.textContent = "";
    box.classList.add("visible");
    if (hint) hint.classList.remove("visible");
    let i = 0;
    const interval = setInterval(() => {
      txt.textContent += text[i]; i++;
      if (i >= text.length) clearInterval(interval);
    }, 38);
    clearTimeout(talkTimeout);
    talkTimeout = setTimeout(() => hideDialog(), 4500);
  }

  function hideDialog() {
    const box = document.getElementById("npc-dialog");
    if (box) box.classList.remove("visible");
    isTalking = false;
  }

  function showNPCHint(show) {
    const hint = document.getElementById("npc-hint");
    if (!hint) return;
    if (show && !isTalking) hint.classList.add("visible");
    else hint.classList.remove("visible");
  }

  /* ── Pedestal/pilar bajo el NPC ─────────────────── */
  function addGravestone() {
    const stoneMat  = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.95, metalness: 0.05 });
    const capMat    = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.8,  metalness: 0.15 });

    /* pilar central */
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.55, 0.38), stoneMat);
    pillar.position.set(NPC_POS.x, 0.275, NPC_POS.z);
    scene.add(pillar);

    /* base del pilar (más ancha) */
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.07, 0.52), capMat);
    base.position.set(NPC_POS.x, 0.035, NPC_POS.z);
    scene.add(base);

    /* capitel (tapa superior, más ancha) */
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.07, 0.50), capMat);
    cap.position.set(NPC_POS.x, 0.585, NPC_POS.z);
    scene.add(cap);

    /* moldura decorativa central */
    const mold = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.42), capMat);
    mold.position.set(NPC_POS.x, 0.28, NPC_POS.z);
    scene.add(mold);

    /* plataforma encima del capitel donde para el NPC */
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.04, 0.44), stoneMat);
    top.position.set(NPC_POS.x, 0.64, NPC_POS.z);
    scene.add(top);


    /* cartel de aviso */
const warnCanvas = document.createElement("canvas");
warnCanvas.width = 512; warnCanvas.height = 256;
const wctx = warnCanvas.getContext("2d");

wctx.fillStyle = "#1a1a1a";
wctx.fillRect(0, 0, 512, 256);
wctx.strokeStyle = "#ffcc00";
wctx.lineWidth = 6;
wctx.strokeRect(8, 8, 496, 240);

wctx.fillStyle = "#ffcc00";
wctx.font = "bold 48px Georgia, serif";
wctx.textAlign = "center";
wctx.fillText("⚠ AVISO ⚠", 256, 70);

wctx.fillStyle = "#ffffff";
wctx.font = "22px 'Courier New', monospace";
wctx.fillText("Tomar algunas frases del NPC", 256, 130);
wctx.fillText("como chiste.", 256, 162);

const warnTex = new THREE.CanvasTexture(warnCanvas);
const warnSign = new THREE.Mesh(
  new THREE.PlaneGeometry(1.4, 0.7),
  new THREE.MeshStandardMaterial({ map: warnTex, roughness: 0.9 })
);
warnSign.position.set(-2.45, 1.8, NPC_POS.z);
warnSign.rotation.y = Math.PI / 2;
scene.add(warnSign);
  }

  /* ── Cargar GLB ──────────────────────────────────── */
  function load() {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js";
    script.onload = () => {
      const loader = new THREE.GLTFLoader();
      loader.load(
        "assets/npc.glb",
        gltf => {
          const model = gltf.scene;
          model.scale.setScalar(NPC_SCALE);
          scene.add(model);

          const box = new THREE.Box3().setFromObject(model);
          const center = new THREE.Vector3();
          box.getCenter(center);
          model.position.x = NPC_POS.x - center.x;
          model.position.z = NPC_POS.z - center.z;
          model.position.y -= box.min.y - 0.65; /* encima del pedestal */

          /* mirando hacia el pasillo (+Z = hacia donde entra el jugador) */
          model.rotation.y = 0;

          model.traverse(child => {
            if (child.isMesh) {
              const mats = Array.isArray(child.material) ? child.material : [child.material];
              mats.forEach(m => { m.transparent = false; m.depthWrite = true; m.needsUpdate = true; });
              child.castShadow = child.receiveShadow = true;
            }
          });

          if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            mixer.clipAction(gltf.animations[0]).play();
          }

          mesh = model;
          console.log("✅ NPC cargado");
        },
        undefined,
        err => console.warn("❌ NPC:", err)
      );
    };
    document.head.appendChild(script);
  }

  /* ── Init ────────────────────────────────────────── */
  function init(sceneRef, THREERef) {
    scene = sceneRef;
    THREE = THREERef;
    createDialogUI();
    addGravestone();
    load();
  }

  /* ── Update ──────────────────────────────────────── */
  function update(delta, charPos, keys) {
    if (mixer) mixer.update(delta);
    if (!mesh) return;

    const dx = charPos.x - NPC_POS.x;
    const dz = charPos.z - NPC_POS.z;
    const d  = Math.sqrt(dx * dx + dz * dz);

    if (d < 2.5) {
      /* atan2(dx, dz) da el ángulo en XZ apuntando hacia el jugador.
         El modelo cargado tiene rotation.y=0 mirando en +Z,
         así que NO hace falta sumar PI — apunta directo. */
      const targetAngle = Math.atan2(dx, dz);
      /* interpolación suave */
      let diff = targetAngle - mesh.rotation.y;
      /* normalizar entre -PI y PI para evitar giros largos */
      while (diff >  Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      mesh.rotation.y += diff * 0.06;

      showNPCHint(d < 1.3);
    } else {
      showNPCHint(false);
      if (d > 3) hideDialog();
    }

    if (keys["e"] && d < 1.3 && !isTalking) {
      keys["e"] = false;
      showDialog(getRandomPhrase());
    }
  }

  return { init, update };
})();
