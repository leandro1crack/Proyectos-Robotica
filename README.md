# ASSETS — Guía para reemplazar texturas y obras

## 📁 Estructura de archivos

```
gallery/
├── index.html          ← página principal
├── css/
│   └── style.css       ← todos los colores / fonts CSS
├── js/
│   ├── config.js       ←  CONFIGURACIÓN PRINCIPAL 
│   ├── character.js    ← personaje 3D y soporte GLB
│   ├── gallery.js      ← sala 3D, cuadros, círculos
│   └── main.js         ← loop, controles, modal, zoom
│   └── npc.js          ← todo lo que tiene que ver con el NPC y su pedestal
└── assets/
    ├── README.md       ← este archivo
    ├── obra1.jpg       ← imagen del cuadro 1 (reemplazar)
    ├── obra2.jpg       ← imagen del cuadro 2 (reemplazar)
    ├── obra3.jpg       ← imagen del cuadro 3 (reemplazar)
    ├── obra4.jpg       ← imagen del cuadro 4 (reemplazar)
    ├── obra5.jpg       ← imagen del cuadro 5 (reemplazar)
    ├── obra6.jpg       ← imagen del cuadro 6 (reemplazar)
    ├── obra7.jpg       ← imagen del cuadro 7 (reemplazar)
    ├── character.glb   ← modelo 3D del personaje (opcional)
    ├── floor_texture.png ← Textura del piso (remplazable)
    ├── ceiling_texture.png  ←Textura del techo (remplazable)
    ├── npc.glb         ← Diseño 3d del personaje 
``` 

---

##  Cómo reemplazar una imagen de cuadro

1. Poné tu imagen en la carpeta `assets/`
2. Abrí `js/config.js`
3. Buscá el objeto de la obra y cambiá `texture`:

```js
{
  id: "obra1",
  texture: "assets/MI_IMAGEN.jpg",   // 
  title: "Nuevo título",
  desc:  "Nueva descripción.",
  canvaLink: "https://www.canva.com/design/TU_LINK",
  wall: "left",
  position: -8,
},
```

---

##  Cómo cambiar el link de Canva

En `js/config.js`, buscá `canvaLink` de la obra y reemplazá:

```js
canvaLink: "https://www.canva.com/design/DAxxxxxxxx/view",
```

---

##  Activar modelo GLB del personaje

1. Ponés tu archivo `.glb` en `assets/character.glb`
2. En `js/config.js` cambiás:

```js
character: {
  useGLB: true,                    // ← true
  glbPath: "assets/character.glb", // ← ruta al archivo
  scale: 1,
},
```

Si el GLB no carga, automáticamente usa el personaje geométrico.

---

##  Cambiar colores de la sala

En `js/config.js`, sección `scene`:

```js
scene: {
  bgColor:    0xf0efec,  // fondo/niebla
  wallColor:  0xdedad4,  // paredes
  floorColor: 0xc8c4bb,  // piso
  frameColor: 0x111111,  // marcos de cuadros
  ...
}
```

---

##  Controles

| Acción | Teclado | Táctil |
|---|---|---|
| Moverse | WASD / ↑↓←→ | Joystick (abajo derecha) |
| Abrir cuadro | Enter / Espacio / Click | Tap (dentro del círculo) |
| Cerrar modal | Escape / ✕ | Tap ✕ |
| Menú | — | MENU (arriba derecha) |

---

## 🌐 Deploy

Para hostearlo simplemente subí toda la carpeta `gallery/` a:
- **Netlify Drop**: arrastrá la carpeta a netlify.com/drop
- **GitHub Pages**: subí al repo y activá Pages
- **Vercel**: `vercel deploy`


