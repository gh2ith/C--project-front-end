/* ==========================================================================
   Yarmouk University Internship Management System
   Roman Stone Arch & The Golden Thread 3D Experience
   Faculty of Information Technology and Computer Science — Irbid, Jordan
   ========================================================================== */

(() => {
  "use strict";

  // Utility helpers
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const clamp = (val, min = 0, max = 1) => Math.max(min, Math.min(max, val));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const smoothstep = (min, max, value) => {
    const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
  };

  // Stage configuration matching the 5 chapters and reference structure
  const STAGES = [
    {
      id: "discover",
      num: "01",
      name: "Discover",
      badge: "Stage 01 · Discover",
      glyph: "🏛️",
      label: "Step 1 of 5",
      scrollRange: [0.0, 0.2],
      targetScroll: 0.05,
      camera: { x: 0, y: 1, z: 18.5, fov: 44, lookX: 0, lookY: 1, yaw: -0.12 },
      cue: "Scroll to shape your journey",
    },
    {
      id: "apply",
      num: "02",
      name: "Apply",
      badge: "Stage 02 · Apply",
      glyph: "📜",
      label: "Step 2 of 5",
      scrollRange: [0.2, 0.4],
      targetScroll: 0.28,
      camera: { x: -1, y: 1.8, z: 12.5, fov: 43, lookX: -3, lookY: 0.7, yaw: 0.2 },
      cue: "A foundation takes shape",
    },
    {
      id: "train",
      num: "03",
      name: "Train",
      badge: "Stage 03 · Train",
      glyph: "⚒️",
      label: "Step 3 of 5",
      scrollRange: [0.4, 0.65],
      targetScroll: 0.52,
      camera: { x: 3.8, y: 2, z: 11.8, fov: 44, lookX: 2.9, lookY: 1, yaw: -0.42 },
      cue: "Built through practice",
    },
    {
      id: "complete",
      num: "04",
      name: "Complete",
      badge: "Stage 04 · Complete",
      glyph: "👑",
      label: "Step 4 of 5",
      scrollRange: [0.65, 0.85],
      targetScroll: 0.79,
      camera: { x: 0, y: 0.6, z: 12, fov: 44, lookX: 0, lookY: 0.45, yaw: 0 },
      cue: "Your next beginning",
    },
    {
      id: "faculty",
      num: "05",
      name: "Our faculty",
      badge: "Our faculty",
      glyph: "🎓",
      label: "Step 5 of 5",
      scrollRange: [0.85, 1.0],
      targetScroll: 0.95,
      camera: { x: -0.6, y: 1.8, z: 17, fov: 43, lookX: -3.8, lookY: 1, yaw: 0.28 },
      cue: "One university. Your path.",
    },
  ];

  // DOM Elements
  const runway = $("#experience-runway");
  const canvas = $("#experience-canvas");
  const stepLabel = $("#step-label");
  const progressFill = $("#progress-fill");
  const progressBarEl = $("#progress-bar-el");
  const badgeTitle = $("#badge-title");
  const cueText = $("#cue-text");
  const motionToggle = $("#motion-toggle");
  const motionLabel = $("#motion-label");
  const announcer = $("#a11y-announcer");
  const stepperButtons = $$(".stepper-btn");
  const chapterCards = $$(".chapter-card");

  // State
  let currentStageIndex = -1;
  let scrollProgress = 0;
  let targetProgress = 0;
  let isPaused = false;
  let lastTime = performance.now();
  let idleTime = 0;
  let animationFrameId = null;

  // Orbit drag state
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragYaw = 0;
  let dragPitch = 0;
  let targetDragYaw = 0;
  let targetDragPitch = 0;

  // Reduced motion preference
  const motionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let isReducedMotion = motionMediaQuery.matches;

  // Three.js Scene Variables
  let renderer = null;
  let scene = null;
  let camera = null;
  let archGroup = null;
  let threadMesh = null;
  let threadWireMesh = null;
  let stoneBlocks = [];
  let stoneMaterial = null;
  let carvedMaterial = null;
  let goldMaterial = null;
  let threadGlowMaterial = null;
  let isSceneReady = false;

  // ========================================================================
  // Procedural Stone Texture Generator (Decapolis Limestone & Carvings)
  // ========================================================================
  function createProceduralStoneTexture(isCarved = false) {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    // Warm limestone base
    ctx.fillStyle = "#dfd8c8";
    ctx.fillRect(0, 0, size, size);

    // Subtle stone flecks & chiseling texture
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 36;
      data[i] = clamp(data[i] + noise, 180, 245);
      data[i + 1] = clamp(data[i + 1] + noise * 0.95, 175, 238);
      data[i + 2] = clamp(data[i + 2] + noise * 0.85, 160, 222);
    }
    ctx.putImageData(imgData, 0, 0);

    // Subtle ashlar chisel lines
    ctx.strokeStyle = "rgba(156, 144, 123, 0.22)";
    ctx.lineWidth = 1.5;
    for (let y = 30; y < size; y += 45) {
      ctx.beginPath();
      ctx.moveTo(0, y + (Math.random() - 0.5) * 4);
      ctx.lineTo(size, y + (Math.random() - 0.5) * 4);
      ctx.stroke();
    }

    if (isCarved) {
      // Roman Egg-and-Dart & Greek Key heritage reliefs
      ctx.strokeStyle = "rgba(143, 111, 50, 0.4)";
      ctx.fillStyle = "rgba(223, 216, 200, 0.6)";
      ctx.lineWidth = 3;

      // Decorative frieze band across the middle
      const bandY = size / 2;
      ctx.beginPath();
      ctx.moveTo(0, bandY - 35);
      ctx.lineTo(size, bandY - 35);
      ctx.moveTo(0, bandY + 35);
      ctx.lineTo(size, bandY + 35);
      ctx.stroke();

      // Repeated Roman rosettes / palmettes
      for (let x = 32; x < size; x += 64) {
        ctx.beginPath();
        ctx.arc(x, bandY, 16, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, bandY, 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(180, 160, 125, 0.5)";
        ctx.fill();

        // 4 small petal flutes
        for (let a = 0; a < 4; a++) {
          const angle = (a * Math.PI) / 2;
          ctx.beginPath();
          ctx.arc(
            x + Math.cos(angle) * 12,
            bandY + Math.sin(angle) * 12,
            4,
            0,
            Math.PI * 2
          );
          ctx.stroke();
        }
      }
    }

    const T = window.THREE;
    const texture = new T.CanvasTexture(canvas);
    texture.wrapS = T.RepeatWrapping;
    texture.wrapT = T.RepeatWrapping;
    return texture;
  }

  // ========================================================================
  // Initialize Three.js Scene and Roman Arch Geometry
  // ========================================================================
  function initThreeScene() {
    const T = window.THREE;
    if (!T || !canvas) {
      document.body.classList.add("no-webgl");
      return false;
    }

    try {
      renderer = new T.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch (e) {
      console.warn("WebGL initialization failed, falling back to static presentation:", e);
      document.body.classList.add("no-webgl");
      return false;
    }

    const maxPixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(maxPixelRatio);
    const sceneBounds = canvas.parentElement.getBoundingClientRect();
    renderer.setSize(sceneBounds.width, sceneBounds.height, false);
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.88;

    scene = new T.Scene();
    camera = new T.PerspectiveCamera(40, sceneBounds.width / sceneBounds.height, 0.1, 100);
    camera.position.set(0, 0.4, 14.2);

    // Ambient & Directional Lighting tailored for Jordan limestone
    const hemiLight = new T.HemisphereLight(0xf5edd8, 0x002e18, 0.85);
    scene.add(hemiLight);

    const mainSun = new T.DirectionalLight(0xfff3db, 2.2);
    mainSun.position.set(8, 12, 10);
    scene.add(mainSun);

    const rimLight = new T.DirectionalLight(0xc5a059, 1.4);
    rimLight.position.set(-9, 6, -6);
    scene.add(rimLight);

    const fillLight = new T.DirectionalLight(0x709982, 0.6);
    fillLight.position.set(0, -6, 8);
    scene.add(fillLight);

    // Stone Materials
    const stoneTex = createProceduralStoneTexture(false);
    const carvedTex = createProceduralStoneTexture(true);

    stoneMaterial = new T.MeshStandardMaterial({
      map: stoneTex,
      bumpMap: stoneTex,
      bumpScale: 0.04,
      roughness: 0.84,
      metalness: 0.04,
      color: 0xdfd8c8,
    });

    carvedMaterial = new T.MeshStandardMaterial({
      map: carvedTex,
      bumpMap: carvedTex,
      bumpScale: 0.09,
      roughness: 0.78,
      metalness: 0.06,
      color: 0xe6dfcf,
    });

    goldMaterial = new T.MeshStandardMaterial({
      color: 0xc5a059,
      emissive: 0x5a431c,
      roughness: 0.22,
      metalness: 0.92,
    });

    threadGlowMaterial = new T.MeshStandardMaterial({
      color: 0xf5cf78,
      emissive: 0xc5a059,
      emissiveIntensity: 0.9,
      roughness: 0.18,
      metalness: 0.88,
    });

    archGroup = new T.Group();
    scene.add(archGroup);

    buildRomanArchGeometry(T);
    buildGoldenThread(T);

    document.body.classList.add("has-webgl");
    isSceneReady = true;

    // Handle context loss gracefully
    canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      document.body.classList.remove("has-webgl");
      document.body.classList.add("no-webgl");
      isSceneReady = false;
    });

    return true;
  }

  // ========================================================================
  // Build the Roman Stone Arch Geometry
  // ========================================================================
  function buildRomanArchGeometry(T) {
    stoneBlocks = [];
    let blockIndex = 0;

    // Helper to register individual heritage stone block with assembly targets
    function addStoneBlock(geometry, material, finalPos, finalRot, stageTier, seedOffset) {
      const mesh = new T.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Deterministic pseudo-random scattering for Stage 1 drifting
      const angle = blockIndex * 2.39996 + seedOffset * 0.2;
      // A deliberate open center lets the introduction inhabit the exploded model.
      const radius = 1 + (blockIndex % 4) * 0.09;
      const scatterX = Math.cos(angle) * 7.4 * radius;
      const scatterY = 1 + Math.sin(angle) * 4.9 * radius;
      const scatterZ = Math.sin(angle * 1.5) * 2.8;

      const scatterRot = new T.Euler(
        (Math.sin(blockIndex * 2.1) * 0.8),
        (Math.cos(blockIndex * 1.7) * 0.9),
        (Math.sin(blockIndex * 3.3) * 0.6)
      );

      mesh.position.set(scatterX, scatterY, scatterZ);
      mesh.rotation.copy(scatterRot);
      archGroup.add(mesh);

      stoneBlocks.push({
        mesh,
        finalPos: finalPos.clone(),
        finalRot: finalRot.clone(),
        scatterPos: new T.Vector3(scatterX, scatterY, scatterZ),
        scatterRot,
        stageTier, // 0: Footings, 1: Lower Pier, 2: Upper Pier & Impost, 3: Voussoirs, 4: Keystone, 5: Attic
        index: blockIndex++,
      });
    }

    // Geometry parameters for Irbid Roman Arch
    const pierX = 2.65;
    const pierDepth = 1.1;

    // 1. Footings & Plinths (StageTier 0 - Lock in early Stage 2)
    for (const side of [-1, 1]) {
      const x = side * pierX;

      // Heavy sub-base foundation
      addStoneBlock(
        new T.BoxGeometry(1.65, 0.45, pierDepth + 0.35),
        stoneMaterial,
        new T.Vector3(x, -2.8, 0),
        new T.Euler(0, 0, 0),
        0,
        side * 1.2
      );

      // Torus base moulding
      addStoneBlock(
        new T.BoxGeometry(1.45, 0.3, pierDepth + 0.18),
        carvedMaterial,
        new T.Vector3(x, -2.42, 0),
        new T.Euler(0, 0, 0),
        0,
        side * 2.4
      );
    }

    // 2. Pier Courses (StageTier 1: Lower courses, StageTier 2: Upper courses)
    const courseHeights = [-2.05, -1.45, -0.85, -0.25, 0.35, 0.95];
    for (let c = 0; c < courseHeights.length; c++) {
      const y = courseHeights[c];
      const tier = c < 3 ? 1 : 2;

      for (const side of [-1, 1]) {
        const x = side * pierX;
        // Two ashlar blocks per course with subtle joints
        const w1 = 0.62;
        const w2 = 0.58;
        const x1 = x - side * 0.28;
        const x2 = x + side * 0.31;

        addStoneBlock(
          new T.BoxGeometry(w1, 0.54, pierDepth),
          stoneMaterial,
          new T.Vector3(x1, y, 0),
          new T.Euler(0, 0, 0),
          tier,
          c + side
        );

        addStoneBlock(
          new T.BoxGeometry(w2, 0.54, pierDepth - 0.04),
          stoneMaterial,
          new T.Vector3(x2, y, 0),
          new T.Euler(0, 0, 0),
          tier,
          c * 2 - side
        );
      }
    }

    // 3. Impost Capitals with Carved Mouldings (StageTier 2 - End of Stage 2 / Start of Stage 3)
    for (const side of [-1, 1]) {
      const x = side * pierX;
      // Projecting cornice capital
      addStoneBlock(
        new T.BoxGeometry(1.5, 0.42, pierDepth + 0.24),
        carvedMaterial,
        new T.Vector3(x, 1.45, 0),
        new T.Euler(0, 0, 0),
        2,
        side * 3.8
      );
    }

    // 4. Semicircular Arch Voussoirs (StageTier 3 - Train to Complete)
    // Semicircular vault springing from y = 1.45
    const archCenterY = 1.45;
    const archRadius = 2.65;
    const voussoirCount = 13;
    const halfWedge = Math.PI / voussoirCount / 2 - 0.006;
    function stoneWedge(halfAngle, depth = pierDepth + 0.08) {
      const inner = archRadius - 0.44, outer = archRadius + 0.44;
      const shape = new T.Shape();
      shape.moveTo(-inner * Math.sin(halfAngle), inner * Math.cos(halfAngle) - archRadius);
      shape.lineTo(-outer * Math.sin(halfAngle), outer * Math.cos(halfAngle) - archRadius);
      shape.absarc(0, -archRadius, outer, Math.PI / 2 + halfAngle, Math.PI / 2 - halfAngle, true);
      shape.lineTo(inner * Math.sin(halfAngle), inner * Math.cos(halfAngle) - archRadius);
      shape.absarc(0, -archRadius, inner, Math.PI / 2 - halfAngle, Math.PI / 2 + halfAngle, false);
      shape.closePath();
      const geometry = new T.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: 0.018, bevelThickness: 0.018, bevelSegments: 1, steps: 1, curveSegments: 8 });
      geometry.translate(0, 0, -depth / 2);
      return geometry;
    }

    for (let i = 0; i < voussoirCount; i++) {
      // Angles from ~0.2 to ~Math.PI - 0.2 (excluding center keystone)
      const t = (i + 0.5) / voussoirCount;
      const angle = t * Math.PI;

      // Skip exact apex (reserved for keystone)
      if (i === Math.floor(voussoirCount / 2)) continue;

      const vx = Math.cos(angle) * archRadius;
      const vy = archCenterY + Math.sin(angle) * archRadius;
      const rotZ = angle - Math.PI / 2;

      // Wedge geometry for each voussoir
      const wedgeGeo = stoneWedge(halfWedge);

      addStoneBlock(
        wedgeGeo,
        i % 2 === 0 ? carvedMaterial : stoneMaterial,
        new T.Vector3(vx, vy, 0),
        new T.Euler(0, 0, rotZ),
        3,
        i * 1.7
      );
    }

    // 5. The Keystone Crown (StageTier 4 - Climax of Complete chapter)
    // Prominent, projecting central keystone at the apex
    const keystoneGeo = stoneWedge(halfWedge, pierDepth + 0.24);
    addStoneBlock(
      keystoneGeo,
      carvedMaterial,
      new T.Vector3(0, archCenterY + archRadius, 0.04),
      new T.Euler(0, 0, 0),
      4,
      9.9
    );

    // 6. Attic Cornice & Horizontal Crowning Band (StageTier 5 - Collaboration)
    addStoneBlock(
      new T.BoxGeometry(6.4, 0.38, pierDepth + 0.28),
      carvedMaterial,
      new T.Vector3(0, archCenterY + archRadius + 0.88, 0),
      new T.Euler(0, 0, 0),
      5,
      12.0
    );

    addStoneBlock(
      new T.BoxGeometry(6.8, 0.22, pierDepth + 0.42),
      stoneMaterial,
      new T.Vector3(0, archCenterY + archRadius + 1.18, 0),
      new T.Euler(0, 0, 0),
      5,
      14.0
    );
  }

  // ========================================================================
  // Build "The Golden Thread" 3D Weaving Curve
  // ========================================================================
  function buildGoldenThread(T) {
    const pierX = 2.65;
    const archCenterY = 1.45;
    const archRadius = 2.65;

    // 3D Path that weaves from left footing, wraps up column, arcs through voussoirs, over keystone, and down right column
    const threadPoints = [
      new T.Vector3(-pierX - 0.7, -2.9, 0.55),
      new T.Vector3(-pierX - 0.5, -2.1, 0.62),
      new T.Vector3(-pierX + 0.3, -1.3, 0.58),
      new T.Vector3(-pierX - 0.4, -0.4, 0.55),
      new T.Vector3(-pierX + 0.3, 0.6, 0.62),
      new T.Vector3(-pierX - 0.1, 1.45, 0.65),
      // Arc points through voussoirs
      new T.Vector3(-2.2, 2.7, 0.62),
      new T.Vector3(-1.3, 3.65, 0.65),
      // Keystone crest
      new T.Vector3(0.0, 4.45, 0.75),
      new T.Vector3(1.3, 3.65, 0.65),
      new T.Vector3(2.2, 2.7, 0.62),
      // Right column descent
      new T.Vector3(pierX + 0.1, 1.45, 0.65),
      new T.Vector3(pierX - 0.3, 0.6, 0.62),
      new T.Vector3(pierX + 0.4, -0.4, 0.55),
      new T.Vector3(pierX - 0.3, -1.3, 0.58),
      new T.Vector3(pierX + 0.5, -2.1, 0.62),
      new T.Vector3(pierX + 0.7, -2.9, 0.55),
    ];

    const threadCurve = new T.CatmullRomCurve3(threadPoints);

    // Glowing Golden Thread Tube
    const threadGeo = new T.TubeGeometry(threadCurve, 120, 0.045, 8, false);
    threadMesh = new T.Mesh(threadGeo, threadGlowMaterial);
    archGroup.add(threadMesh);

    // Faint sketched outline for Stage 1 (Discover)
    const wirePoints = [];
    for (let i = 0; i <= 60; i++) {
      wirePoints.push(threadCurve.getPoint(i / 60));
    }
    const wireGeo = new T.BufferGeometry().setFromPoints(wirePoints);
    const wireMat = new T.LineBasicMaterial({
      color: 0xc5a059,
      transparent: true,
      opacity: 0.35,
    });
    threadWireMesh = new T.Line(wireGeo, wireMat);
    archGroup.add(threadWireMesh);
  }

  // ========================================================================
  // Update Assembly State Driven by Scroll Progress [0.0 - 1.0]
  // ========================================================================
  function updateArchAssembly(progress) {
    if (!isSceneReady || !archGroup) return;

    // Thresholds for block stage tiers flying in
    // Tier 0 (Footings): Locks between 0.18 and 0.32
    // Tier 1 (Lower Piers): Locks between 0.26 and 0.42
    // Tier 2 (Upper Piers & Imposts): Locks between 0.38 and 0.58
    // Tier 3 (Voussoirs): Locks between 0.52 and 0.74
    // Tier 4 (Keystone): Drops between 0.68 and 0.82
    // Tier 5 (Attic Frieze): Locks between 0.76 and 0.88

    const tierRanges = [
      [0.16, 0.32], // Tier 0: Base
      [0.25, 0.42], // Tier 1: Lower courses
      [0.38, 0.58], // Tier 2: Upper courses
      [0.50, 0.74], // Tier 3: Voussoirs
      [0.61, 0.74], // Tier 4: Keystone
      [0.70, 0.80], // Tier 5: Attic
    ];

    stoneBlocks.forEach((block) => {
      const [startP, endP] = tierRanges[block.stageTier];
      let t = 0;

      if (isReducedMotion) {
        t = 1.0; // Instantly fully assembled in reduced motion mode
      } else {
        t = smoothstep(startP, endP, progress);
      }

      // Idle floating drift for drifting blocks (when not yet locked)
      let driftX = 0;
      let driftY = 0;
      let driftZ = 0;
      if (t < 0.99 && !isPaused && !isReducedMotion) {
        const driftFactor = (1 - t) * 0.14;
        const wave = idleTime * 1.5 + block.index * 0.6;
        driftX = Math.sin(wave) * driftFactor;
        driftY = Math.cos(wave * 0.8) * driftFactor;
        driftZ = Math.sin(wave * 1.2) * driftFactor;
      }

      // Loose elements gather around the forming structure before each course locks in.
      const gathering = smoothstep(0.07, 0.24, progress);
      const orbit = block.index * 2.39996;
      const gatheringX = lerp(block.scatterPos.x, block.finalPos.x + Math.cos(orbit) * 2, gathering);
      const gatheringY = lerp(block.scatterPos.y, block.finalPos.y + Math.sin(orbit) * 1.7, gathering);
      const gatheringZ = lerp(block.scatterPos.z, -1.5 + Math.cos(orbit) * 0.8, gathering);
      block.mesh.position.x = lerp(gatheringX + driftX, block.finalPos.x, t);
      block.mesh.position.y = lerp(gatheringY + driftY, block.finalPos.y, t);
      block.mesh.position.z = lerp(gatheringZ + driftZ, block.finalPos.z, t);

      // Interpolate rotation
      block.mesh.rotation.x = lerp(block.scatterRot.x, block.finalRot.x, t);
      block.mesh.rotation.y = lerp(block.scatterRot.y, block.finalRot.y, t);
      block.mesh.rotation.z = lerp(block.scatterRot.z, block.finalRot.z, t);
    });

    // Golden Thread growth and illumination
    if (threadMesh && threadGlowMaterial) {
      if (isReducedMotion) {
        threadMesh.scale.set(1, 1, 1);
        threadGlowMaterial.emissiveIntensity = 0.9;
      } else {
        // Thread reveals as arch rises, glows intensely in Stages 4 and 5
        const threadReveal = smoothstep(0.18, 0.82, progress);
        threadMesh.scale.set(threadReveal, threadReveal, threadReveal);

        const glowPulse = Math.sin(idleTime * 3) * 0.2 + 0.85;
        const completeGlow = smoothstep(0.65, 0.85, progress);
        threadGlowMaterial.emissiveIntensity = 0.4 + completeGlow * 0.8 * (isPaused ? 1 : glowPulse);
      }
    }

    if (threadWireMesh) {
      // Wireframe faint outline is prominent in Stage 1, then dissolves as blocks solidify
      const wireOpacity = clamp(1.0 - progress * 2.8, 0, 0.35);
      threadWireMesh.material.opacity = wireOpacity;
      threadWireMesh.visible = wireOpacity > 0.01;
    }
  }

  // ========================================================================
  // Camera & Orbit Pacing Interpolation
  // ========================================================================
  function updateCameraAndOrbit(progress) {
    if (!camera || !archGroup) return;

    // Camera poses are sampled from the same reversible scroll timeline as the stones.
    let stageA = STAGES[0], stageB = STAGES[0], segmentT = 0;
    for (let i = 0; i < STAGES.length - 1; i++) {
      if (progress >= STAGES[i].targetScroll) {
        stageA = STAGES[i];
        stageB = STAGES[i + 1];
        segmentT = smoothstep(stageA.targetScroll, stageB.targetScroll, progress);
      }
    }
    const sample = key => lerp(stageA.camera[key], stageB.camera[key], segmentT);
    const mobile = window.innerWidth <= 760;
    let camX = sample('x'), camY = sample('y'), camZ = sample('z');
    let lookX = sample('lookX'), lookY = sample('lookY');
    let modelY = 0;
    if (mobile) {
      const mobilePose = [
        { z: 19.5, lookX: 0, lookY: 1, modelY: 0 },
        { z: 15.5, lookX: -1.3, lookY: 2.2, modelY: -1.4 },
        { z: 13.5, lookX: 2.1, lookY: -0.4, modelY: 1.6 },
        { z: 13.3, lookX: 0, lookY: 0.45, modelY: 0 },
        { z: 15.5, lookX: -1.8, lookY: 2.3, modelY: -1.1 },
      ];
      const a = mobilePose[STAGES.indexOf(stageA)], b = mobilePose[STAGES.indexOf(stageB)];
      camX *= 0.25;
      camZ = lerp(a.z, b.z, segmentT);
      lookX = lerp(a.lookX, b.lookX, segmentT);
      lookY = lerp(a.lookY, b.lookY, segmentT);
      modelY = lerp(a.modelY, b.modelY, segmentT);
    }
    camera.position.set(camX, camY, camZ);
    camera.fov = sample('fov');
    camera.updateProjectionMatrix();
    camera.lookAt(lookX, lookY, 0);
    archGroup.position.y = modelY;
    // Apply User Orbit Inspection with clamped bounds and soft return
    targetDragYaw = clamp(targetDragYaw, -0.45, 0.45);
    targetDragPitch = clamp(targetDragPitch, -0.25, 0.25);

    dragYaw = lerp(dragYaw, targetDragYaw, 0.12);
    dragPitch = lerp(dragPitch, targetDragPitch, 0.12);

    // Slowly decay drag orbit back to compose baseline when not dragging
    if (!isDragging && Math.abs(targetDragYaw) > 0.001) {
      targetDragYaw *= 0.96;
      targetDragPitch *= 0.96;
    }

    // Subtle ambient breathing motion when not paused
    let ambientYaw = 0;
    if (!isPaused && !isReducedMotion) {
      ambientYaw = Math.sin(idleTime * 0.4) * 0.025;
    }

    archGroup.rotation.y = sample('yaw') + dragYaw + ambientYaw;
    archGroup.rotation.x = dragPitch;
  }

  // ========================================================================
  // DOM UI Sync (Chapter Activation, Stepper, Step N of 5)
  // ========================================================================
  function syncStageUI(progress) {
    // Determine active stage
    let activeIdx = 0;
    for (let i = 0; i < STAGES.length; i++) {
      const [minP, maxP] = STAGES[i].scrollRange;
      if (progress >= minP && progress <= maxP) {
        activeIdx = i;
        break;
      }
      if (i === STAGES.length - 1 && progress > maxP) {
        activeIdx = i;
      }
    }

    if (activeIdx !== currentStageIndex) {
      const previousCard = chapterCards[currentStageIndex];
      const moveFocus = previousCard?.contains(document.activeElement);
      currentStageIndex = activeIdx;
      const stage = STAGES[activeIdx];
      document.body.dataset.scene = stage.id;

      // Update Step counter & badge
      if (stepLabel) stepLabel.textContent = stage.label;
      if (badgeTitle) badgeTitle.textContent = stage.badge;
      if (cueText) cueText.textContent = stage.cue;

      // Update Chapter Cards visibility
      chapterCards.forEach((card, idx) => {
        const isActive = idx === activeIdx;
        card.classList.toggle("is-active", isActive);
        card.setAttribute("aria-hidden", String(!isActive));
        card.inert = !isActive;
      });
      const chapterArea = $(".chapter-container");
      if (chapterArea) chapterArea.scrollTop = 0;
      $("#journey-previous").disabled = activeIdx === 0;
      $("#journey-next").disabled = activeIdx === STAGES.length - 1;
      if (moveFocus) chapterCards[activeIdx].querySelector(".chapter-title").focus({ preventScroll: true });

      // Update Stepper buttons
      stepperButtons.forEach((btn, idx) => {
        const isActive = idx === activeIdx;
        btn.classList.toggle("is-active", isActive);
        if (isActive) {
          btn.setAttribute("aria-current", "step");
        } else {
          btn.removeAttribute("aria-current");
        }
      });

      // Screen reader announcement
      if (announcer) {
        announcer.textContent = `${stage.label}: ${stage.name}. ${stage.badge}`;
      }
    }

    // Text belongs to the scroll timeline: it clears before the next scene takes over.
    const [start, end] = STAGES[activeIdx].scrollRange;
    const entering = activeIdx === 0 ? 1 : smoothstep(start, start + 0.025, progress);
    const leaving = activeIdx === STAGES.length - 1 ? 1 : 1 - smoothstep(end - 0.025, end, progress);
    chapterCards[activeIdx].style.opacity = isReducedMotion || isPaused ? "1" : String(entering * leaving);
    // Update Progress Bar
    const percent = Math.round(progress * 100);
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressBarEl) progressBarEl.setAttribute("aria-valuenow", String(percent));
  }

  // ========================================================================
  // Main Animation Loop
  // ========================================================================
  function render(time) {
    animationFrameId = requestAnimationFrame(render);

    const delta = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;

    if (!isPaused && !isReducedMotion) {
      idleTime += delta;
    }

    // Smooth scroll interpolation
    scrollProgress = isReducedMotion || isPaused ? targetProgress : lerp(scrollProgress, targetProgress, 1 - Math.exp(-delta / 0.11));
    if (Math.abs(scrollProgress - targetProgress) < 0.0001) {
      scrollProgress = targetProgress;
    }

    updateArchAssembly(scrollProgress);
    updateCameraAndOrbit(scrollProgress);
    syncStageUI(scrollProgress);

    if (isSceneReady && renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  // ========================================================================
  // Event Listeners: Scroll, Resize, Stepper, Orbit & Motion
  // ========================================================================
  function onScroll() {
    if (!runway) return;
    const maxScroll = runway.offsetHeight - window.innerHeight;
    const currentY = window.scrollY;
    targetProgress = clamp(currentY / Math.max(1, maxScroll), 0, 1);
  }

  function onResize() {
    if (!renderer || !camera) return;
    const { width, height } = canvas.parentElement.getBoundingClientRect();
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    onScroll();
  }

  function jumpToStage(stageIndex) {
    if (!runway || stageIndex < 0 || stageIndex >= STAGES.length) return;
    const targetP = STAGES[stageIndex].targetScroll;
    const maxScroll = runway.offsetHeight - window.innerHeight;
    const targetY = targetP * maxScroll;

    window.scrollTo({
      top: targetY,
      behavior: isReducedMotion || isPaused ? "auto" : "smooth",
    });
  }

  function setupInteractions() {
    $(".skip-link").addEventListener("click", (event) => {
      event.preventDefault();
      chapterCards[Math.max(0, currentStageIndex)].querySelector(".chapter-title").focus({ preventScroll: true });
    });
    // Scroll listener
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    $("#journey-previous")?.addEventListener("click", () => jumpToStage(currentStageIndex - 1));
    $("#journey-next")?.addEventListener("click", () => jumpToStage(currentStageIndex + 1));

    // Header nav stage jumps
    $$("[data-stage-jump]").forEach((el) => {
      el.addEventListener("click", (e) => {
        const stageIdx = parseInt(el.dataset.stageJump, 10);
        if (!isNaN(stageIdx)) {
          e.preventDefault();
          jumpToStage(stageIdx);
        }
      });
    });

    // Keyboard Arrow navigation
    window.addEventListener("keydown", (e) => {
      if (document.querySelector("dialog[open]")) return;
      if (e.target.closest("a, button, input, select, textarea, [contenteditable]")) return;
      if (e.key === "ArrowRight") {
        if (currentStageIndex < STAGES.length - 1) {
          e.preventDefault();
          jumpToStage(currentStageIndex + 1);
        }
      } else if (e.key === "ArrowLeft") {
        if (currentStageIndex > 0) {
          e.preventDefault();
          jumpToStage(currentStageIndex - 1);
        }
      }
    });

    // Motion pause/resume toggle
    if (motionToggle) {
      motionToggle.addEventListener("click", () => {
        isPaused = !isPaused;
        motionToggle.setAttribute("aria-pressed", String(isPaused));
        motionToggle.setAttribute("aria-label", isPaused ? "Resume ambient motion" : "Pause ambient motion");
        if (motionLabel) motionLabel.textContent = isPaused ? "Resume" : "Pause";
        const icon = motionToggle.querySelector(".motion-icon");
        if (icon) icon.textContent = isPaused ? "▷" : "Ⅱ";
      });
    }

    // Pointer Drag to Orbit Arch (Clamped to preserve composition)
    if (canvas) {
      canvas.addEventListener("pointerdown", (e) => {
        if (isReducedMotion) return;
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
        canvas.classList.add("is-dragging");
      });

      canvas.addEventListener("pointermove", (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;
        dragStartX = e.clientX;
        dragStartY = e.clientY;

        targetDragYaw += deltaX * 0.005;
        targetDragPitch += deltaY * 0.003;
      });

      const stopDrag = (e) => {
        if (isDragging) {
          isDragging = false;
          canvas.classList.remove("is-dragging");
          try {
            canvas.releasePointerCapture(e.pointerId);
          } catch (err) {}
        }
      };

      canvas.addEventListener("pointerup", stopDrag);
      canvas.addEventListener("pointercancel", stopDrag);
    }

    // Visibility change (pause render loop when tab is hidden to conserve power)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      } else {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    });

    // Reduced motion listener
    motionMediaQuery.addEventListener("change", (e) => {
      isReducedMotion = e.matches;
      document.body.classList.toggle("reduced-motion", isReducedMotion);
      if (isReducedMotion) {
        targetDragYaw = 0;
        targetDragPitch = 0;
        updateArchAssembly(1.0);
      }
    });

    // Majors Dialog Modal
    const majorsDialog = $("#majors-dialog");
    const openMajorsBtn = $("#open-majors-modal");
    const closeMajorsBtn = $("#close-majors-modal");

    if (majorsDialog && openMajorsBtn && closeMajorsBtn) {
      openMajorsBtn.addEventListener("click", () => majorsDialog.showModal());
      closeMajorsBtn.addEventListener("click", () => majorsDialog.close());

      // Close on backdrop click
      majorsDialog.addEventListener("click", (e) => {
        const rect = majorsDialog.getBoundingClientRect();
        const isInDialog =
          rect.top <= e.clientY &&
          e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX &&
          e.clientX <= rect.left + rect.width;
        if (!isInDialog) {
          majorsDialog.close();
        }
      });
    }
    document.querySelectorAll("[data-open-dialog]").forEach((button) => {
      button.addEventListener("click", () => document.getElementById(button.dataset.openDialog)?.showModal());
    });
    document.querySelectorAll("[data-close-dialog]").forEach((button) => {
      button.addEventListener("click", () => button.closest("dialog").close());
    });
    document.querySelectorAll(".journey-dialog").forEach((dialog) => {
      dialog.addEventListener("click", (event) => {
        if (event.target !== dialog) return;
        const box = dialog.getBoundingClientRect();
        if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
      });
    });
  }

  // ========================================================================
  // Load Dynamic Public Opportunities Preview
  // ========================================================================
  function loadOpportunityPreviews() {
    const listEl = $("#featured-opportunities-list");
    if (!listEl) return;

    fetch("../../shared/data/firebase-seed.json")
      .then((res) => {
        if (!res.ok) throw new Error("Seed fetch error");
        return res.json();
      })
      .then((data) => {
        if (!data || !data.opportunities) return;
        const opps = Object.values(data.opportunities).filter((opp) => opp.status === "Open").slice(0, 4);
        if (opps.length === 0) {
          listEl.textContent = "No open opportunities are listed at the moment.";
          return;
        }
        const escape = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));

        listEl.innerHTML = opps
          .map((opp) => {
            const companyName = data.companies?.[opp.companyId]?.name || "Company";
            return `
              <div class="opp-mini-card">
                <div class="opp-badge">${escape(opp.title)}</div>
                <h3 class="opp-name">${escape(companyName)}</h3>
                <div class="opp-meta">
                  <span>${escape(opp.location)}</span>
                  <span>${escape(opp.seats)} seats</span>
                </div>
              </div>
            `;
          })
          .join("");
      })
      .catch(() => {
        listEl.textContent = "Opportunity summaries could not be loaded. Log in to explore opportunities.";
      });
  }

  // ========================================================================
  // Initialization
  // ========================================================================
  function init() {
    document.body.classList.toggle("reduced-motion", isReducedMotion);
    initThreeScene();
    setupInteractions();
    loadOpportunityPreviews();
    onScroll();
    syncStageUI(targetProgress);
    animationFrameId = requestAnimationFrame(render);

    // Global debug & inspection hook
    window.YarmoukArch = {
      getStage: () => currentStageIndex,
      getProgress: () => scrollProgress,
      jumpTo: jumpToStage,
      toggleMotion: () => motionToggle && motionToggle.click(),
      scene,
      camera,
      archGroup,
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
