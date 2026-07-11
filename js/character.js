/* =====================================================
   CHARACTER.JS — Hollow Knight GLB
   ===================================================== */

window.CharacterModule = (function () {

  let mesh  = null;
  let mixer = null;

  function loadGLB(scene, THREE) {
    const cfg = window.GALLERY_CONFIG.character;

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';

    script.onload = function () {
      const loader = new THREE.GLTFLoader();
      loader.load(
        cfg.glbPath,
        function (gltf) {
          const model = gltf.scene;

          /* Escalar */
          model.scale.setScalar(cfg.scale);

          /* Rotar 180° para que mire hacia adelante al presionar W */
          model.rotation.y = Math.PI;

          /* Agregar a escena para poder medir */
          scene.add(model);

          /* Calcular bounding box y apoyar pies en Y=0 */
          const box = new THREE.Box3().setFromObject(model);
          const center = new THREE.Vector3();
          box.getCenter(center);

          model.position.x -= center.x;
          model.position.z -= center.z;
          model.position.y -= box.min.y;

          /* Sombras */
          model.traverse(function (child) {
            if (child.isMesh && child.material) {
              const mats = Array.isArray(child.material) ? child.material : [child.material];
              mats.forEach(m => {
                m.transparent = false;
                m.alphaTest   = 0;
                m.depthWrite  = true;
                m.needsUpdate = true;
              });
            }
            if (child.isMesh) {
              child.castShadow    = true;
              child.receiveShadow = true;
            }
            /* sombra circular en el piso */
const shadowGeo = new THREE.CircleGeometry(0.18, 32);
const shadowMat = new THREE.MeshBasicMaterial({
  color: 0x000000,
  transparent: true,
  opacity: 1,
  depthWrite: false,
});
const shadow = new THREE.Mesh(shadowGeo, shadowMat);
shadow.rotation.x = -Math.PI / 2;
shadow.position.y = 0.01;
model.add(shadow);
          });

          mesh = model;

          /* ── Ojos: dos esferas negras ───────────────────
             Se agregan al grupo del modelo para que se
             muevan con él. Posición relativa a la cabeza.  */
          const eyeMat = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.2,
            metalness: 0.1,
            emissive: 0x000000,
          });

          /* Calcular altura de la cabeza aproximada */
          const modelHeight = box.max.y - box.min.y;
          const eyeY = modelHeight * 0.72;   /* ~72% de la altura = zona de ojos */
          const eyeSize = modelHeight * 0.07; /* tamaño relativo al modelo */
          const eyeSpread = modelHeight * 0.13;
          const eyeZ = modelHeight * 0.30;   /* hacia adelante (frente al modelo) */

          const eyeGeo = new THREE.SphereGeometry(eyeSize, 12, 12);

          const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
          eyeL.position.set(-eyeSpread, eyeY, -eyeZ);
          model.add(eyeL);

          const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
          eyeR.position.set(eyeSpread, eyeY, -eyeZ);
          model.add(eyeR);

          /* Animaciones */
          if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            mixer.clipAction(gltf.animations[0]).play();
          }

          console.log('✅ Hollow Knight listo. Altura del modelo:', modelHeight.toFixed(2));
        },
        undefined,
        function (err) {
          console.error('❌ Error cargando GLB:', err);
        }
      );
    };

    script.onerror = function () {
      console.error('❌ No se pudo cargar GLTFLoader.');
    };

    document.head.appendChild(script);
  }

  function init(scene, THREE) {
    loadGLB(scene, THREE);
  }

  function update(delta) {
    if (mixer) mixer.update(delta);
  }

  let walkCycle = 0;
function animateWalk(moving) {
  if (!mesh) return;
  if (moving) {
    walkCycle += 0.12;
    /* balanceo lateral */
    mesh.rotation.z = Math.sin(walkCycle) * 0.08;
    /* rebote vertical */
    mesh.position.y = Math.abs(Math.sin(walkCycle)) * 0.04;
  } else {
    /* volver a posición neutral suavemente */
    mesh.rotation.z += (0 - mesh.rotation.z) * 0.1;
    mesh.position.y += (0 - mesh.position.y) * 0.1;
  }
}

  return { init, update, animateWalk, getMesh: () => mesh };
})();
