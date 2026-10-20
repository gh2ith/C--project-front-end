/* Bridgeway — Immersive 3D Scroll-Driven Bridge Journey
 * Complete 3D suspension bridge engine, camera spline controller,
 * GSAP ScrollTrigger orchestration, navigation, and interactive showcase milestones.
 */

(function () {
  'use strict';
  // Global Config & State
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const atmosphere = $('#journeyAtmosphere');

  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Journey milestones configuration
  // Maps milestone IDs to their target scroll progress (0.0 to 1.0) and display intervals
  const MILESTONES = [
    { id: 'hero',         range: [0.00, 0.10], target: 0.00, nav: null },
    { id: 'why',          range: [0.26, 0.38], target: 0.30, nav: 'why' },
    { id: 'features',     range: [0.38, 0.49], target: 0.43, nav: 'features' },
    { id: 'applications', range: [0.49, 0.60], target: 0.54, nav: 'features' },
    { id: 'progress',     range: [0.60, 0.70], target: 0.65, nav: 'features' },
    { id: 'openings',     range: [0.70, 0.81], target: 0.75, nav: 'openings' },
    { id: 'roles',        range: [0.81, 0.90], target: 0.85, nav: 'roles' },
    { id: 'faculty',          range: [0.90, 0.96], target: 0.93, nav: 'faculty' },
    { id: 'finale',       range: [0.96, 1.00], target: 0.98, nav: null }
  ];

  // Theme palettes for live tweaking
  const THEMES = {
    'Bridgeway Blue': {
      tower: 0x2563eb, towerAccent: 0x60a5fa, cable: 0x60a5fa, cableGlow: 0x1d4ed8,
      deck: 0x1e293b, sidewalk: 0xe2e8f0, railing: 0x94a3b8, light: 0xfef08a,
      sky: 0xf0f7ff, fog: 0xe0f2fe, sea: 0x0e4d7e, seaBed: 0x041830
    },
    'Cyber Glow': {
      tower: 0x0284c7, towerAccent: 0x38bdf8, cable: 0x38bdf8, cableGlow: 0x0369a1,
      deck: 0x0f172a, sidewalk: 0xe0f2fe, railing: 0x7dd3fc, light: 0x67e8f9,
      sky: 0xf0f9ff, fog: 0xe0f2fe, sea: 0x0a436e, seaBed: 0x051e36
    },
    'Academic Navy': {
      tower: 0x1e3a8a, towerAccent: 0x3b82f6, cable: 0x93c5fd, cableGlow: 0x1d4ed8,
      deck: 0x0b0f19, sidewalk: 0xf1f5f9, railing: 0x64748b, light: 0xfde047,
      sky: 0xf1f5f9, fog: 0xe2e8f0, sea: 0x0d3c68, seaBed: 0x041528
    },
    'Emerald Gold': {
      tower: 0x059669, towerAccent: 0x34d399, cable: 0x6ee7b7, cableGlow: 0x047857,
      deck: 0x064e3b, sidewalk: 0xecfdf5, railing: 0xa7f3d0, light: 0xfde68a,
      sky: 0xf0fdf4, fog: 0xd1fae5, sea: 0x0d5c58, seaBed: 0x042422
    }
  };

  const CONFIG = {
    themeName: 'Bridgeway Blue',
    pacing: 1.0,
    blueprint: true,
    lerpSpeed: 0.08,
    capFloat: true,
    streetlights: true
  };

  // State
  let scrollProgress = 0;
  let smoothProgress = 0;
  let activeMilestoneIndex = 0;
  let masterST = null;
  let lenisInstance = null;
  let statsCounted = false;
  // Mobile Navigation & Accessibility Controls
  const navToggle = $('#navToggle');
  const navLinks = $('#navLinks');
  const closeMobileMenu = () => {
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    if (navLinks) navLinks.classList.remove('is-open');
  };

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navToggle.getAttribute('aria-expanded') !== 'true';
      navToggle.setAttribute('aria-expanded', String(open));
      navLinks.classList.toggle('is-open', open);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileMenu();
    });
  }


  // Discovery Filter Chips (Showcase interactive behavior)
  $$('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.chip').forEach(c => c.classList.remove('is-on'));
      chip.classList.add('is-on');
    });
  });

  // Stats Counter Animation
  function runStatsCounters() {
    if (statsCounted) return;
    statsCounted = true;
    $$('[data-count]').forEach(el => {
      const end = +el.dataset.count;
      const suf = el.dataset.suffix || '';
      if (reduceMotion || !window.gsap) {
        el.textContent = end + suf;
        return;
      }
      const obj = { val: 0 };
      window.gsap.to(obj, {
        val: end,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = Math.round(obj.val) + suf;
        }
      });
    });
  }
  // Rail Progress Indicator
  const railFill = $('#railFill');
  const railCap = $('#railCap');

  function updateRailProgress(progress) {
    if (atmosphere) {
      const t = Math.max(0, Math.min(1, (progress - .65) / .35));
      atmosphere.style.setProperty('--arrival', reduceMotion ? 1 : t * t * (3 - 2 * t));
    }
    if (railFill) railFill.style.transform = `scaleX(${progress})`;
    if (railCap) {
      if (progress > 0.005) {
        railCap.classList.add('is-visible');
        const maxTravel = window.innerWidth - 30;
        railCap.style.transform = `translateX(${progress * maxTravel}px)`;
      } else {
        railCap.classList.remove('is-visible');
        railCap.style.transform = 'translateX(0px)';
      }
    }
  }
  // Navigation Active State Update
  const navAnchorElements = $$('.nav__links a');

  function updateActiveNav(milestoneNavId) {
    navAnchorElements.forEach(a => {
      const href = a.getAttribute('href');
      if (href && milestoneNavId && href === `#${milestoneNavId}`) {
        a.classList.add('is-active');
      } else {
        a.classList.remove('is-active');
      }
    });
  }
  // Three.js 3D Bridge Scene Architecture
  let scene, camera, renderer, bridgeGroup, capMesh, capBoardMat, capSkullMat, waterMesh, foamRings = [], seaRipples = [];
  let ambientLight, sunLight, fillLight, oceanSunLight, seaHemisphere, seaGlintLight, bedMesh;
  let nightSkyGroup, moonMesh, moonHalo, starPoints, starMat, moonLight;
  let lampGlowMat, lampHaloMat, lampHalos = [];
  let isDarkMode = false;
  let towerMaterials = [], cableMaterials = [];
  let isSceneReady = false;
  let sunriseGroup, sunriseHalo, arrivalSky, arrivalFog, warmSky, warmFog;

  function buildCinematicSun() {
    sunriseGroup = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.SphereGeometry(22, 24, 16), new THREE.MeshBasicMaterial({ color:0xffdf9e, fog:false, toneMapped:false }));
    sunriseGroup.add(disc);
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(64,64,0,64,64,64);
    gradient.addColorStop(0,'rgba(255,240,201,.9)');
    gradient.addColorStop(.25,'rgba(255,202,123,.5)');
    gradient.addColorStop(.6,'rgba(255,159,80,.16)');
    gradient.addColorStop(1,'rgba(255,159,80,0)');
    context.fillStyle=gradient; context.fillRect(0,0,128,128);
    sunriseHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map:new THREE.CanvasTexture(canvas), transparent:true, depthWrite:false, fog:false, blending:THREE.AdditiveBlending }));
    sunriseHalo.scale.set(180,180,1); sunriseGroup.add(sunriseHalo);
    scene.add(sunriseGroup);
    arrivalSky=new THREE.Color(); arrivalFog=new THREE.Color();
    warmSky=new THREE.Color(0xf5dcc4); warmFog=new THREE.Color(0xf0d3b3);
  }

  function updateCinematicLighting(progress) {
    // Reduced-motion users get the finished lighting without a travelling sweep.
    if (reduceMotion) progress = 1;
    const t=THREE.MathUtils.clamp((progress-.70)/.30,0,1);
    const arrival=t*t*(3-2*t);
    const lightingState = `${isDarkMode ? 'moon' : 'sun'}:${Math.round(arrival * 100)}`;
    if (renderer.domElement.dataset.bridgeLighting !== lightingState) {
      renderer.domElement.dataset.bridgeLighting = lightingState;
    }
    const theme=THEMES[CONFIG.themeName] || THEMES['Bridgeway Blue'];
    // The visible sun/moon lives in the sky overlay so camera travel cannot hide it.
    sunriseGroup.visible=false;
    moonMesh.visible=false;
    moonHalo.visible=false;
    // The forward-facing camera looks along +Z: negative X is screen-right.
    // Keep the celestial disc above the cards, not behind their text.
    sunriseGroup.position.set(-130,80+arrival*30,780);
    sunriseGroup.scale.setScalar(.55+arrival*.45);
    sunriseHalo.material.opacity=arrival*.8;
    if (isDarkMode) {
      // The moon moves into the forward view as the camera crosses the bridge.
      moonMesh.position.set(-50-80*arrival,125-15*arrival,-40+820*arrival);
      moonHalo.position.copy(moonMesh.position);
      moonHalo.material.opacity=.65+arrival*.25;
      moonLight.position.copy(moonMesh.position);
      moonLight.intensity=1.10+arrival*.35;
      fillLight.intensity=.45+arrival*.15;
      fillLight.color.setHex(0x8ebaff);
      renderer.toneMappingExposure=1.05+arrival*.10;
    } else {
      arrivalSky.setHex(theme.sky).lerp(warmSky,arrival*.90);
      arrivalFog.setHex(theme.fog).lerp(warmFog,arrival*.70);
      scene.background.copy(arrivalSky); scene.fog.color.copy(arrivalFog);
      sunLight.color.setRGB(1,1-arrival*.15,1-arrival*.38);
      sunLight.intensity=1.15+arrival*.35;
      sunLight.position.set(120,180-arrival*110,80+arrival*650);
      fillLight.color.setHex(0x93c5fd); fillLight.intensity=.45;
      oceanSunLight.color.copy(sunLight.color);
      renderer.toneMappingExposure=1.05+arrival*.04;
    }
    cableMaterials.forEach(material => { material.emissiveIntensity=(isDarkMode ? .55 : .35)+progress*.55; });
    // A scroll-driven wave lights the lanterns in the direction of travel.
    const front=-40+progress*570;
    lampHalos.forEach(halo => {
      const lit=THREE.MathUtils.smoothstep(front-halo.parent.position.z,-30,30);
      halo.visible=isDarkMode || progress>.24;
      halo.material.opacity=isDarkMode ? .28+lit*.67 : lit*.24;
    });
  }

  function initThreeScene() {
    const canvas = document.getElementById('bridgeCanvas');
    if (!canvas || !window.THREE) return false;

    // Test WebGL support
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
    } catch (e) {
      console.warn('WebGL initialization failed, falling back to static layout:', e);
      document.documentElement.classList.add('no-webgl');
      return false;
    }

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    // Scene & Fog
    scene = new THREE.Scene();
    const currentTheme = THEMES[CONFIG.themeName] || THEMES['Bridgeway Blue'];
    scene.background = new THREE.Color(currentTheme.sky);
    scene.fog = new THREE.FogExp2(currentTheme.fog, 0.0022);

    // Perspective Camera
    camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 1200);
    camera.up.set(0, 1, 0);

    // Lighting (Assigned to module variables for dynamic day/night switching)
    ambientLight = new THREE.AmbientLight(0xffffff, 0.72);
    scene.add(ambientLight);

    sunLight = new THREE.DirectionalLight(0xfffbeb, 1.15);
    sunLight.position.set(120, 180, 80);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 500;
    const d = 160;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    fillLight = new THREE.DirectionalLight(0x93c5fd, 0.45);
    fillLight.position.set(-100, 80, -60);
    scene.add(fillLight);

    // Ocean Natural Lighting (Balanced, non-overblown, realistic coastal illumination)
    oceanSunLight = new THREE.DirectionalLight(0xfff5ea, 0.85);
    oceanSunLight.position.set(-160, 110, 180);
    oceanSunLight.target.position.set(0, -5.5, 240);
    scene.add(oceanSunLight);
    scene.add(oceanSunLight.target);

    seaHemisphere = new THREE.HemisphereLight(0xe8f4fd, 0x0a2d4d, 0.55);
    scene.add(seaHemisphere);

    // Subtle natural sea specular accent
    seaGlintLight = new THREE.DirectionalLight(0x90cdf4, 0.60);
    seaGlintLight.position.set(120, 80, 320);
    seaGlintLight.target.position.set(0, -5.5, 240);
    scene.add(seaGlintLight);
    scene.add(seaGlintLight.target);

    // Build the 3D Bridge Group
    bridgeGroup = new THREE.Group();
    scene.add(bridgeGroup);

    buildBridgeModel(bridgeGroup, currentTheme);
    buildEnvironment(scene, currentTheme);
    buildCinematicSun();
    // Night Celestial Architecture (3D Moon & Twinkling Starfield)
    nightSkyGroup = new THREE.Group();
    nightSkyGroup.visible = false;
    scene.add(nightSkyGroup);

    // 1. Glowing 3D Moon with Procedural Lunar Maria Texture (Fog-Free, Pure Luminous White)
    const moonCanvas = document.createElement('canvas');
    moonCanvas.width = 256; moonCanvas.height = 256;
    const mCtx = moonCanvas.getContext('2d');
    const mGrad = mCtx.createRadialGradient(100, 100, 12, 128, 128, 128);
    mGrad.addColorStop(0, '#ffffff');
    mGrad.addColorStop(0.55, '#f8fafc');
    mGrad.addColorStop(0.85, '#f1f5f9');
    mGrad.addColorStop(1, '#e2e8f0');
    mCtx.fillStyle = mGrad;
    mCtx.fillRect(0, 0, 256, 256);
    // Soft subtle lunar surface craters / maria
    mCtx.fillStyle = 'rgba(148, 163, 184, 0.16)';
    mCtx.beginPath(); mCtx.arc(155, 95, 34, 0, Math.PI * 2); mCtx.fill();
    mCtx.beginPath(); mCtx.arc(175, 145, 26, 0, Math.PI * 2); mCtx.fill();
    mCtx.beginPath(); mCtx.arc(105, 160, 38, 0, Math.PI * 2); mCtx.fill();
    mCtx.beginPath(); mCtx.arc(80, 105, 24, 0, Math.PI * 2); mCtx.fill();
    const moonTex = new THREE.CanvasTexture(moonCanvas);

    const moonGeom = new THREE.SphereGeometry(18, 32, 32);
    // CRITICAL: fog: false prevents dark midnight fog from turning the moon into a dark grey circle
    const moonMat = new THREE.MeshBasicMaterial({
      map: moonTex,
      fog: false
    });
    moonMesh = new THREE.Mesh(moonGeom, moonMat);
    // Placement: High in clear night sky in upper-right quadrant, above bridge cables and well clear of headline
    moonMesh.position.set(-50, 125, -40);
    nightSkyGroup.add(moonMesh);

    // 2. Soft Glowing Moon Halo Sprite (Fog-Free, Brilliant Atmospheric Glow)
    const haloCanvas = document.createElement('canvas');
    haloCanvas.width = 128; haloCanvas.height = 128;
    const hCtx = haloCanvas.getContext('2d');
    const hGrad = hCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    hGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    hGrad.addColorStop(0.18, 'rgba(224, 242, 254, 0.85)');
    hGrad.addColorStop(0.45, 'rgba(147, 197, 253, 0.35)');
    hGrad.addColorStop(0.75, 'rgba(96, 165, 250, 0.12)');
    hGrad.addColorStop(1, 'rgba(37, 99, 235, 0)');
    hCtx.fillStyle = hGrad;
    hCtx.fillRect(0, 0, 128, 128);
    const haloTex = new THREE.CanvasTexture(haloCanvas);
    const haloMat = new THREE.SpriteMaterial({
      map: haloTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      fog: false,
      depthWrite: false
    });
    moonHalo = new THREE.Sprite(haloMat);
    moonHalo.scale.set(80, 80, 1);
    moonHalo.position.copy(moonMesh.position);
    nightSkyGroup.add(moonHalo);

    // 3. Moon Directional Specular Light (Casts soft silvery moonlit reflections on sea waves)
    moonLight = new THREE.DirectionalLight(0xe2e8f0, 1.15);
    moonLight.position.copy(moonMesh.position);
    moonLight.target.position.set(0, -5.5, 240);
    nightSkyGroup.add(moonLight);
    nightSkyGroup.add(moonLight.target);

    const moonGlintLight = new THREE.DirectionalLight(0x93c5fd, 0.70);
    moonGlintLight.position.set(140, 75, 220);
    moonGlintLight.target.position.set(0, -5.5, 240);
    nightSkyGroup.add(moonGlintLight);
    nightSkyGroup.add(moonGlintLight.target);

    // 4. Twinkling Night Starfield (1,400 celestial stars)
    const starCount = 1400;
    const starGeom = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * (Math.PI * 0.44);
      const r = 680 + Math.random() * 380;
      starPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = 35 + r * Math.cos(phi);
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));

    const starCanvas = document.createElement('canvas');
    starCanvas.width = 32; starCanvas.height = 32;
    const sCtx = starCanvas.getContext('2d');
    const sGrad = sCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    sGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    sGrad.addColorStop(0.35, 'rgba(224, 242, 254, 0.85)');
    sGrad.addColorStop(1, 'rgba(224, 242, 254, 0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 32, 32);
    const starTex = new THREE.CanvasTexture(starCanvas);

    starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 3.8,
      map: starTex,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    starPoints = new THREE.Points(starGeom, starMat);
    nightSkyGroup.add(starPoints);

    isSceneReady = true;

    // Synchronize initial dark/light state
    const savedTheme = 'light';
    if (savedTheme === 'dark') {
      setTheme('dark');
    }

    return true;
  }
  // 3D Suspension Bridge Model Construction
  function buildBridgeModel(group, theme) {
    // 1. Roadway Deck
    // Span length: -60 to 540 (total 600 units), width 14 units
    const deckLen = 600;
    const deckWidth = 14;
    const deckThickness = 1.2;
    const deckZCenter = 240;

    // Road surface slab
    const deckGeom = new THREE.BoxGeometry(deckWidth, deckThickness, deckLen);
    const deckMat = new THREE.MeshStandardMaterial({
      color: theme.deck,
      roughness: 0.8,
      metalness: 0.15
    });
    const deckMesh = new THREE.Mesh(deckGeom, deckMat);
    deckMesh.position.set(0, 0, deckZCenter);
    deckMesh.receiveShadow = true;
    group.add(deckMesh);

    // Sidewalks on left and right
    const walkWidth = 2.6;
    const walkHeight = 0.3;
    const walkGeom = new THREE.BoxGeometry(walkWidth, walkHeight, deckLen);
    const walkMat = new THREE.MeshStandardMaterial({
      color: theme.sidewalk,
      roughness: 0.6
    });

    const leftWalk = new THREE.Mesh(walkGeom, walkMat);
    leftWalk.position.set(-5.6, deckThickness / 2 + walkHeight / 2, deckZCenter);
    leftWalk.receiveShadow = true;
    group.add(leftWalk);

    const rightWalk = new THREE.Mesh(walkGeom, walkMat);
    rightWalk.position.set(5.6, deckThickness / 2 + walkHeight / 2, deckZCenter);
    rightWalk.receiveShadow = true;
    group.add(rightWalk);

    // Roadway Lane Divider Markings (Crisp white dashed lines down center)
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const dashLen = 3.5;
    const dashGap = 2.5;
    const dashGeom = new THREE.PlaneGeometry(0.25, dashLen);
    dashGeom.rotateX(-Math.PI / 2);

    for (let z = -50; z < 530; z += (dashLen + dashGap)) {
      const dash = new THREE.Mesh(dashGeom, lineMat);
      dash.position.set(0, deckThickness / 2 + 0.03, z);
      group.add(dash);
    }

    // Outer Solid Lane Boundary Lines
    const solidLineGeom = new THREE.PlaneGeometry(0.2, deckLen);
    solidLineGeom.rotateX(-Math.PI / 2);
    const leftSolid = new THREE.Mesh(solidLineGeom, lineMat);
    leftSolid.position.set(-4.2, deckThickness / 2 + 0.02, deckZCenter);
    group.add(leftSolid);

    const rightSolid = new THREE.Mesh(solidLineGeom, lineMat);
    rightSolid.position.set(4.2, deckThickness / 2 + 0.02, deckZCenter);
    group.add(rightSolid);

    // Underdeck Steel Floor Beams (Cross ribs)
    const beamGeom = new THREE.BoxGeometry(deckWidth + 1.2, 0.8, 0.6);
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    for (let z = -55; z <= 535; z += 6) {
      const beam = new THREE.Mesh(beamGeom, beamMat);
      beam.position.set(0, -deckThickness / 2 - 0.4, z);
      group.add(beam);
    }

    // Underdeck Longitudinal Girders
    const girderGeom = new THREE.BoxGeometry(0.8, 1.4, deckLen);
    const leftGirder = new THREE.Mesh(girderGeom, beamMat);
    leftGirder.position.set(-6.2, -deckThickness / 2 - 0.7, deckZCenter);
    group.add(leftGirder);
    const rightGirder = new THREE.Mesh(girderGeom, beamMat);
    rightGirder.position.set(6.2, -deckThickness / 2 - 0.7, deckZCenter);
    group.add(rightGirder);

    // 2. Pedestrian Railings (Left & Right)
    buildRailings(group, theme, deckLen, deckZCenter);

    // 3. Two Suspension Towers
    // Tower 1 at Z = 110, Tower 2 at Z = 370
    const towerMat = new THREE.MeshStandardMaterial({
      color: theme.tower,
      roughness: 0.35,
      metalness: 0.3
    });
    const towerAccentMat = new THREE.MeshStandardMaterial({
      color: theme.towerAccent,
      roughness: 0.3,
      metalness: 0.4
    });
    towerMaterials.push(towerMat, towerAccentMat);

    buildTower(group, 110, towerMat, towerAccentMat);
    buildTower(group, 370, towerMat, towerAccentMat);

    // 4. Main Parabolic Suspension Cables
    buildSuspensionCables(group, theme);

    // 5. Streetlamps along Sidewalks
    buildStreetlamps(group, theme);

    // 6. Graduation Cap Motif (Floating at Midspan Dip)
    capMesh = buildGraduationCap(theme);
    capMesh.position.set(0, 7.8, 240);
    group.add(capMesh);
  }

  // Helper: Build Architectural Suspension Tower
  function buildTower(group, zPos, mat, accentMat) {
    const towerGroup = new THREE.Group();
    towerGroup.position.set(0, 0, zPos);

    // Sculpted, elliptical piers: flared shoulders taper into the deep water.
    const profile = new THREE.SplineCurve([
      new THREE.Vector2(2.8,-196), new THREE.Vector2(3.1,-110),
      new THREE.Vector2(3.7,-45), new THREE.Vector2(4.2,-22),
      new THREE.Vector2(5.6,-12), new THREE.Vector2(5.6,-7),
      new THREE.Vector2(4.2,-4), new THREE.Vector2(2.6,-1)
    ]);
    const pierGeom = new THREE.LatheGeometry(profile.getPoints(64), 24);
    const positions = pierGeom.attributes.position;
    const colors = new Float32Array(positions.count * 3);
    const deepColor = new THREE.Color(0x3d779b);
    const surfaceColor = new THREE.Color(0xd4e7f1);
    for (let i = 0; i < positions.count; i++) {
      const depth = Math.max(0, Math.min(1, (positions.getY(i) + 196) / 190));
      const color = deepColor.clone().lerp(surfaceColor, depth * depth);
      color.toArray(colors, i * 3);
    }
    pierGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const pierMat = new THREE.MeshStandardMaterial({
      vertexColors:true, roughness:.72, metalness:.04,
      emissive:0x24445c, emissiveIntensity:.25
    });
    [-7.6,7.6].forEach(x => {
      const pier = new THREE.Mesh(pierGeom,pierMat);
      pier.position.x = x;
      pier.scale.set(.65,1,1.35);
      towerGroup.add(pier);
    });

    // Tower Pylon Columns (Twin steel legs)
    // Left leg at x = -7.6, Right leg at x = 7.6
    // Lower columns (from y = -2 to y = 20)
    const colLowerGeom = new THREE.BoxGeometry(2.4, 24, 3.2);
    const leftColLower = new THREE.Mesh(colLowerGeom, mat);
    leftColLower.position.set(-7.6, 9, 0);
    leftColLower.castShadow = true;
    towerGroup.add(leftColLower);

    const rightColLower = new THREE.Mesh(colLowerGeom, mat);
    rightColLower.position.set(7.6, 9, 0);
    rightColLower.castShadow = true;
    towerGroup.add(rightColLower);

    // Upper columns (from y = 20 to y = 52)
    const colUpperGeom = new THREE.BoxGeometry(2.1, 32, 2.8);
    const leftColUpper = new THREE.Mesh(colUpperGeom, mat);
    leftColUpper.position.set(-7.6, 36, 0);
    leftColUpper.castShadow = true;
    towerGroup.add(leftColUpper);

    const rightColUpper = new THREE.Mesh(colUpperGeom, mat);
    rightColUpper.position.set(7.6, 36, 0);
    rightColUpper.castShadow = true;
    towerGroup.add(rightColUpper);

    // Lower Cross-beam below roadway
    const beamLowerGeom = new THREE.BoxGeometry(17, 2.2, 2.6);
    const beamLower = new THREE.Mesh(beamLowerGeom, mat);
    beamLower.position.set(0, -1.5, 0);
    towerGroup.add(beamLower);

    // Portal Arch Beam above Roadway (Camera passes cleanly underneath!)
    // Clearance y = 0 to 11
    const portalBeamGeom = new THREE.BoxGeometry(17, 2.8, 2.4);
    const portalBeam = new THREE.Mesh(portalBeamGeom, accentMat);
    portalBeam.position.set(0, 13.5, 0);
    portalBeam.castShadow = true;
    towerGroup.add(portalBeam);

    // Mid Cross Strut
    const midStrutGeom = new THREE.BoxGeometry(15, 2.2, 2.2);
    const midStrut = new THREE.Mesh(midStrutGeom, mat);
    midStrut.position.set(0, 28, 0);
    towerGroup.add(midStrut);

    // Top Crosshead Arch
    const topStrutGeom = new THREE.BoxGeometry(17, 3.2, 2.4);
    const topStrut = new THREE.Mesh(topStrutGeom, accentMat);
    topStrut.position.set(0, 48, 0);
    topStrut.castShadow = true;
    towerGroup.add(topStrut);

    // Pinnacle Cable Saddles
    const saddleGeom = new THREE.BoxGeometry(2.6, 2.4, 3.4);
    const leftSaddle = new THREE.Mesh(saddleGeom, accentMat);
    leftSaddle.position.set(-7.6, 52.5, 0);
    towerGroup.add(leftSaddle);

    const rightSaddle = new THREE.Mesh(saddleGeom, accentMat);
    rightSaddle.position.set(7.6, 52.5, 0);
    towerGroup.add(rightSaddle);

    // Architectural Finials on Top
    const finialGeom = new THREE.ConeGeometry(0.6, 2.4, 4);
    const leftFinial = new THREE.Mesh(finialGeom, accentMat);
    leftFinial.position.set(-7.6, 54.8, 0);
    towerGroup.add(leftFinial);

    const rightFinial = new THREE.Mesh(finialGeom, accentMat);
    rightFinial.position.set(7.6, 54.8, 0);
    towerGroup.add(rightFinial);

    group.add(towerGroup);
  }

  // Helper: Cable Y Height Formula
  function getCableHeight(z) {
    if (z < 110) {
      // Approach backstay: z = -40, y = 1.2 to z = 110, y = 52.5
      const u = Math.max(0, (z + 40) / 150);
      return 1.2 + 51.3 * Math.pow(u, 1.25);
    } else if (z <= 370) {
      // Center span catenary: Tower 1 (z=110, y=52.5) to Tower 2 (z=370, y=52.5), dip at z=240, y=6.8
      const u = (z - 240) / 130;
      return 6.8 + 45.7 * (u * u);
    } else {
      // Exit backstay: Tower 2 (z=370, y=52.5) to z=520, y=1.2
      const u = Math.max(0, (520 - z) / 150);
      return 1.2 + 51.3 * Math.pow(u, 1.25);
    }
  }

  // Helper: Build Main Suspension Cables & Vertical Hangers
  function buildSuspensionCables(group, theme) {
    const cableMat = new THREE.MeshStandardMaterial({
      color: theme.cable,
      roughness: 0.3,
      metalness: 0.5,
      emissive: theme.cableGlow,
      emissiveIntensity: 0.35
    });
    cableMaterials.push(cableMat);

    // Sample points for left and right catenaries
    const leftPoints = [];
    const rightPoints = [];

    for (let z = -40; z <= 520; z += 5) {
      const y = getCableHeight(z);
      leftPoints.push(new THREE.Vector3(-7.6, y, z));
      rightPoints.push(new THREE.Vector3(7.6, y, z));
    }

    const leftCurve = new THREE.CatmullRomCurve3(leftPoints);
    const rightCurve = new THREE.CatmullRomCurve3(rightPoints);

    const tubeGeomLeft = new THREE.TubeGeometry(leftCurve, 160, 0.28, 8, false);
    const tubeGeomRight = new THREE.TubeGeometry(rightCurve, 160, 0.28, 8, false);

    const leftCableMesh = new THREE.Mesh(tubeGeomLeft, cableMat);
    leftCableMesh.castShadow = true;
    group.add(leftCableMesh);

    const rightCableMesh = new THREE.Mesh(tubeGeomRight, cableMat);
    rightCableMesh.castShadow = true;
    group.add(rightCableMesh);

    // Vertical Hanger Cables (Connecting main cable down to deck)
    const hangerMat = new THREE.MeshBasicMaterial({
      color: theme.cable,
      transparent: true,
      opacity: 0.75
    });

    const hangerGeom = new THREE.CylinderGeometry(0.04, 0.04, 1, 6);

    for (let z = -25; z <= 505; z += 5) {
      // Skip points very close to towers for architectural realism
      if (Math.abs(z - 110) < 4 || Math.abs(z - 370) < 4) continue;

      const cableY = getCableHeight(z);
      const deckTopY = 0.6;
      const height = cableY - deckTopY;
      if (height <= 0.5) continue;

      const midY = deckTopY + height / 2;

      // Left hanger
      const leftHanger = new THREE.Mesh(hangerGeom, hangerMat);
      leftHanger.scale.set(1, height, 1);
      leftHanger.position.set(-7.6, midY, z);
      group.add(leftHanger);

      // Right hanger
      const rightHanger = new THREE.Mesh(hangerGeom, hangerMat);
      rightHanger.scale.set(1, height, 1);
      rightHanger.position.set(7.6, midY, z);
      group.add(rightHanger);
    }
  }

  // Helper: Build Pedestrian Railings
  function buildRailings(group, theme, deckLen, deckZCenter) {
    const railMat = new THREE.MeshStandardMaterial({
      color: theme.railing,
      roughness: 0.5,
      metalness: 0.4
    });

    // Top Handrail tubes
    const handrailGeom = new THREE.CylinderGeometry(0.08, 0.08, deckLen, 8);
    handrailGeom.rotateX(Math.PI / 2);

    const leftHandrail = new THREE.Mesh(handrailGeom, railMat);
    leftHandrail.position.set(-6.8, 1.35, deckZCenter);
    group.add(leftHandrail);

    const rightHandrail = new THREE.Mesh(handrailGeom, railMat);
    rightHandrail.position.set(6.8, 1.35, deckZCenter);
    group.add(rightHandrail);

    // Lower guide rail
    const leftLowerRail = new THREE.Mesh(handrailGeom, railMat);
    leftLowerRail.position.set(-6.8, 0.4, deckZCenter);
    group.add(leftLowerRail);

    const rightLowerRail = new THREE.Mesh(handrailGeom, railMat);
    rightLowerRail.position.set(6.8, 0.4, deckZCenter);
    group.add(rightLowerRail);

    // Vertical Baluster Posts (Sampled every 3 units)
    const postGeom = new THREE.BoxGeometry(0.1, 1.0, 0.1);
    for (let z = -55; z <= 535; z += 3) {
      const lp = new THREE.Mesh(postGeom, railMat);
      lp.position.set(-6.8, 0.85, z);
      group.add(lp);

      const rp = new THREE.Mesh(postGeom, railMat);
      rp.position.set(6.8, 0.85, z);
      group.add(rp);
    }
  }

  // Helper: Build Walkway Streetlamps with Dark-Mode Night Illumination
  function buildStreetlamps(group, theme) {
    const lampPostMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.6 });

    // Luminous lantern globe material
    lampGlowMat = new THREE.MeshBasicMaterial({
      color: isDarkMode ? 0xfff6b8 : theme.light
    });

    // Warm radiant bloom halo sprite for illuminated night glow
    const haloCanvas = document.createElement('canvas');
    haloCanvas.width = 64;
    haloCanvas.height = 64;
    const lhCtx = haloCanvas.getContext('2d');
    const lhGrad = lhCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    lhGrad.addColorStop(0, 'rgba(255, 248, 190, 1.0)');
    lhGrad.addColorStop(0.25, 'rgba(255, 218, 110, 0.75)');
    lhGrad.addColorStop(0.55, 'rgba(245, 158, 11, 0.28)');
    lhGrad.addColorStop(0.85, 'rgba(245, 158, 11, 0.08)');
    lhGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    lhCtx.fillStyle = lhGrad;
    lhCtx.fillRect(0, 0, 64, 64);
    const haloTex = new THREE.CanvasTexture(haloCanvas);

    lampHaloMat = new THREE.SpriteMaterial({
      map: haloTex,
      transparent: true,
      opacity: isDarkMode ? 0.95 : 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    lampHalos = [];

    for (let z = -35; z <= 515; z += 24) {
      // Left Lamp
      const lampL = createSingleLamp(lampPostMat, lampGlowMat, lampHaloMat);
      lampL.position.set(-6.7, 0.6, z);
      group.add(lampL);

      // Right Lamp
      const lampR = createSingleLamp(lampPostMat, lampGlowMat, lampHaloMat);
      lampR.position.set(6.7, 0.6, z);
      lampR.rotation.y = Math.PI;
      group.add(lampR);
    }
  }

  function createSingleLamp(postMat, glowMat, haloMat) {
    const lamp = new THREE.Group();
    // Vertical post
    const postGeom = new THREE.CylinderGeometry(0.06, 0.08, 3.2, 8);
    const post = new THREE.Mesh(postGeom, postMat);
    post.position.set(0, 1.6, 0);
    lamp.add(post);

    // Curved arm
    const armGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6);
    armGeom.rotateZ(Math.PI / 3);
    const arm = new THREE.Mesh(armGeom, postMat);
    arm.position.set(0.35, 3.1, 0);
    lamp.add(arm);

    // Glowing globe
    const globeGeom = new THREE.SphereGeometry(0.22, 14, 14);
    const globe = new THREE.Mesh(globeGeom, glowMat);
    globe.position.set(0.65, 3.0, 0);
    lamp.add(globe);

    // Warm radiant night glow halo
    if (haloMat) {
      const halo = new THREE.Sprite(haloMat.clone());
      halo.scale.set(2.8, 2.8, 1);
      halo.position.set(0.65, 3.0, 0);
      halo.visible = isDarkMode;
      lamp.add(halo);
      lampHalos.push(halo);
    }

    return lamp;
  }

  // Helper: Build Stylized 3D Graduation Cap
  function buildGraduationCap(theme) {
    const capGroup = new THREE.Group();

    // Diamond Mortarboard
    const boardGeom = new THREE.BoxGeometry(2.4, 0.14, 2.4);
    boardGeom.rotateY(Math.PI / 4);
    capBoardMat = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0xffffff : 0x0f172a,
      roughness: 0.6,
      metalness: 0.1
    });
    const board = new THREE.Mesh(boardGeom, capBoardMat);
    board.position.set(0, 0.45, 0);
    board.castShadow = true;
    capGroup.add(board);

    // Skullcap Underneath
    const skullGeom = new THREE.CylinderGeometry(0.85, 0.75, 0.65, 24);
    capSkullMat = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x60a5fa : 0x1d4ed8,
      roughness: 0.5,
      metalness: 0.2
    });
    const skull = new THREE.Mesh(skullGeom, capSkullMat);
    skull.position.set(0, 0.1, 0);
    capGroup.add(skull);

    // Center Button
    const buttonGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.12, 12);
    const tasselMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.35,
      metalness: 0.3
    });
    const button = new THREE.Mesh(buttonGeom, tasselMat);
    button.position.set(0, 0.58, 0);
    capGroup.add(button);

    // Golden Amber Tassel hanging off corner
    const tasselCordGeom = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6);
    tasselCordGeom.rotateZ(Math.PI / 3.8);
    const tasselCord = new THREE.Mesh(tasselCordGeom, tasselMat);
    tasselCord.position.set(0.6, 0.4, 0.4);
    capGroup.add(tasselCord);

    const tasselBobGeom = new THREE.ConeGeometry(0.14, 0.5, 12);
    const tasselBob = new THREE.Mesh(tasselBobGeom, tasselMat);
    tasselBob.position.set(1.1, 0.12, 0.75);
    capGroup.add(tasselBob);

    return capGroup;
  }

  // Helper: Build Living 3D Sea & Ambient Coastal Environment
  function buildEnvironment(scene, theme) {
    const seaColor = theme.sea || 0x0e4d7e;
    const bedColor = theme.seaBed || 0x041830;

    // 1. Dynamic Animated 3D Sea Surface Mesh (Smooth shaded for realistic liquid waves)
    const segmentsX = 100;
    const segmentsZ = 100;
    const waterGeom = new THREE.PlaneGeometry(2400, 2400, segmentsX, segmentsZ);
    waterGeom.rotateX(-Math.PI / 2);
    // Cache original vertex positions for mathematical wave oscillator
    waterGeom.userData.base = Float32Array.from(waterGeom.attributes.position.array);

    // Dynamic Vertex Colors for realistic wave crest foam & ocean depth
    const vertCount = waterGeom.attributes.position.count;
    const colors = new Float32Array(vertCount * 3);
    waterGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const waterMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      vertexColors: true,
      roughness: 0.18,
      metalness: 0.08,
      emissive: new THREE.Color(0x011e38),
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0.64,
      depthWrite: false,
      flatShading: false
    });
    waterMesh = new THREE.Mesh(waterGeom, waterMat);
    waterMesh.position.set(0, -5.5, 240);
    waterMesh.receiveShadow = true;
    scene.add(waterMesh);

    // Tapered wave ribbons catch the light across the sea's surface.
    seaRipples = [];
    for (let i = 0; i < 42; i++) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(33 * 2 * 3), 3));
      const indices = [];
      for (let j = 0; j < 32; j++) {
        const a = j * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
      geometry.setIndex(indices);
      const material = new THREE.MeshBasicMaterial({color:0xd9f1ff, transparent:true, opacity:.45, side:THREE.DoubleSide, depthWrite:false, depthTest:false, fog:false, toneMapped:false});
      const ripple = new THREE.Mesh(geometry, material);
      ripple.renderOrder = 2;
      ripple.frustumCulled = false;
      ripple.userData = {x:30 + (i * 43) % 230, z:20 + (i * 97) % 440, length:25 + (i * 11) % 48, phase:i * 1.73};
      scene.add(ripple);
      seaRipples.push(ripple);
    }

    // 2. Deep Ocean Bed Layer (Prevents light leak, provides deep nautical color graduation)
    const bedGeom = new THREE.PlaneGeometry(2600, 2600);
    bedGeom.rotateX(-Math.PI / 2);
    const bedMat = new THREE.MeshStandardMaterial({
      color: bedColor,
      roughness: 0.95,
      metalness: 0.04
    });
    bedMesh = new THREE.Mesh(bedGeom, bedMat);
    bedMesh.position.set(0, -196, 240);
    scene.add(bedMesh);

    // 3. Pier Foundation Marine Foam Rings (At Tower 1 z=110 and Tower 2 z=370)
    foamRings = [];
    const foamGeom = new THREE.RingGeometry(3.6, 6.2, 32);
    foamGeom.rotateX(-Math.PI / 2);

    [-7.6, 7.6].forEach(x => {
      [110, 370].forEach((z, i) => {
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xcfe8f9,
          transparent: true,
          opacity: 0.45,
          side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(foamGeom, ringMat);
        ring.position.set(x, -5.35, z);
        ring.userData.phase = i * 1.5 + (x > 0 ? 0.8 : 0);
        scene.add(ring);
        foamRings.push(ring);
      });
    });
  }
  // Camera Journey Spline Path Architecture
  // Key camera control knots for continuous exterior-to-interior traversal:
  // t = 0.00: Full-width exterior side view (bridge runs horizontally across viewport)
  // t = 0.20: Sweeping 3/4 perspective toward entrance
  // t = 0.35: Aligning with entrance portal (road runs lower center to upper vanishing point)
  // t = 0.45: On the deck between railings looking forward toward Tower 1
  // t = 0.60: Cruising under Tower 1 onto center span
  // t = 0.72: Midspan viewpoint beside graduation cap
  // t = 0.85: Cruising under Tower 2
  // t = 1.00: Emerging onto destination plaza looking toward open sunrise horizon

  const CAM_KNOTS = [
    // [t, posX, posY, posZ, targetX, targetY, targetZ]
    [0.00,  320.0, 18.0, 240.0,   0.0,  23.5, 240.0], // Full-width exterior side view (lower third framing)
    [0.08,  318.0, 17.8, 235.0,   0.0,  23.0, 235.0], // Hero exterior framing
    [0.16,  220.0, 14.0, 120.0,   0.0,  14.0, 180.0], // Dynamic banking flight across open bay (No cards)
    [0.24,   65.0,  6.0, -10.0,   0.0,   4.5, 100.0], // Swooping down to align with bridge entrance (No cards)
    [0.28,    2.0,  2.2,  -5.0,   0.0,   2.5, 120.0], // ENTERING BRIDGE DECK (Why Bridgeway appears!)
    [0.38,   -1.2,  2.2,  55.0,   0.2,   2.5, 180.0], // Cruising along roadway deck toward Tower 1
    [0.48,    0.0,  2.2, 110.0,   0.0,   2.5, 240.0], // Cruising under Tower 1 onto center span (Features)
    [0.60,    1.4,  2.2, 180.0,  -0.2,   2.5, 300.0], // Center span progression (Applications & Progress)
    [0.72,    0.0,  2.2, 240.0,   0.0,   2.6, 360.0], // Midspan beside graduation cap (Live Openings)
    [0.84,   -1.2,  2.1, 330.0,   0.3,   2.5, 450.0], // Approaching Tower 2 (Platform Roles & Stats)
    [0.92,    0.8,  2.1, 395.0,  -0.2,   2.5, 500.0], // Passing Tower 2 (FAQ)
    [1.00,    0.0,  2.4, 460.0,   0.0,   3.2, 580.0]  // Emerging onto destination plaza (Finale)
  ];

  function evaluateCameraPath(t) {
    const clampedT = Math.max(0, Math.min(1, t));

    // Find segment
    let idx = 0;
    while (idx < CAM_KNOTS.length - 2 && CAM_KNOTS[idx + 1][0] < clampedT) {
      idx++;
    }

    const k0 = CAM_KNOTS[Math.max(0, idx - 1)];
    const k1 = CAM_KNOTS[idx];
    const k2 = CAM_KNOTS[Math.min(CAM_KNOTS.length - 1, idx + 1)];
    const k3 = CAM_KNOTS[Math.min(CAM_KNOTS.length - 1, idx + 2)];

    const span = Math.max(0.0001, k2[0] - k1[0]);
    const u = (clampedT - k1[0]) / span;

    // Cubic Catmull-Rom interpolation for smooth, continuous C1 camera path
    const interpolate = (p0, p1, p2, p3) => {
      return 0.5 * (
        (2 * p1) +
        (-p0 + p2) * u +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * (u * u) +
        (-p0 + 3 * p1 - 3 * p2 + p3) * (u * u * u)
      );
    };

    return {
      pos: new THREE.Vector3(
        interpolate(k0[1], k1[1], k2[1], k3[1]),
        interpolate(k0[2], k1[2], k2[2], k3[2]),
        interpolate(k0[3], k1[3], k2[3], k3[3])
      ),
      target: new THREE.Vector3(
        interpolate(k0[4], k1[4], k2[4], k3[4]),
        interpolate(k0[5], k1[5], k2[5], k3[5]),
        interpolate(k0[6], k1[6], k2[6], k3[6])
      )
    };
  }
  // Milestone Active State Controller
  const milestoneElements = MILESTONES.map(m => document.getElementById(m.id));

  function updateMilestones(progress) {
    let currentIdx = -1;

    for (let i = 0; i < MILESTONES.length; i++) {
      const [start, end] = MILESTONES[i].range;
      if (progress >= start && progress <= end) {
        currentIdx = i;
        break;
      }
    }

    if (currentIdx !== activeMilestoneIndex) {
      activeMilestoneIndex = currentIdx;

      milestoneElements.forEach((el, idx) => {
        if (!el) return;
        if (idx === activeMilestoneIndex) {
          el.classList.add('is-active');
        } else {
          el.classList.remove('is-active');
        }
      });

      const currentMilestone = activeMilestoneIndex >= 0 ? MILESTONES[activeMilestoneIndex] : null;
      if (!reduceMotion && !document.documentElement.classList.contains('no-webgl')) {
        atmosphere?.classList.toggle('is-visible', ['faculty', 'finale'].includes(currentMilestone?.id));
        atmosphere?.classList.toggle('is-hero', currentMilestone?.id === 'hero');
      }
      updateActiveNav(currentMilestone ? currentMilestone.nav : null);

      // Trigger stats counter when reaching platform roles milestone
      if (currentMilestone && (currentMilestone.id === 'roles' || currentMilestone.id === 'openings')) {
        runStatsCounters();
      }
    }
  }
  // Animation Render Loop
  let animFrameId = null;
  let lastTime = 0;

  function renderLoop(time) {
    animFrameId = requestAnimationFrame(renderLoop);

    const delta = (time - lastTime) * 0.001;
    lastTime = time;

    // Smooth lerping of scroll progress for silky camera motion
    smoothProgress += (scrollProgress - smoothProgress) * CONFIG.lerpSpeed;

    if (isSceneReady && camera && renderer) {
      // Evaluate camera position and lookAt target along spline
      const camState = evaluateCameraPath(smoothProgress);
      camera.position.copy(camState.pos);
      camera.lookAt(camState.target);
      updateCinematicLighting(smoothProgress);

      // Responsive Camera Adjustment for Portrait / Mobile
      const aspect = window.innerWidth / window.innerHeight;
      if (aspect < 1.0) {
        // In side view (Phase A), back the camera up slightly to keep full span visible
        if (smoothProgress < 0.25) {
          camera.position.x = camState.pos.x * (1.15 / aspect);
        }
      }

      // Gentle floating animation of graduation cap motif
      if (CONFIG.capFloat && capMesh) {
        capMesh.position.y = 7.8 + Math.sin(time * 0.002) * 0.25;
        capMesh.rotation.y = Math.sin(time * 0.0012) * 0.12;
      }

      // Animate 3D Sea Waves with gentle, realistic ocean swells (calm, natural motion)
      if (waterMesh && waterMesh.geometry && waterMesh.geometry.userData && waterMesh.geometry.userData.base) {
        const posAttr = waterMesh.geometry.attributes.position;
        const colorAttr = waterMesh.geometry.attributes.color;
        const arr = posAttr.array;
        const col = colorAttr.array;
        const base = waterMesh.geometry.userData.base;
        // Calm, gentle temporal pacing (moved less, natural slow rolling swell)
        const t = reduceMotion ? 0 : time * 0.00065;

        // Realistic Deep Oceanic Water Palette (Organic, non-plastic, sophisticated depth graduation)
        let rTrough, gTrough, bTrough;
        let rMid, gMid, bMid;
        let rCrest, gCrest, bCrest;

        if (isDarkMode) {
          // Night palette: Rich velvety deep midnight sea (#051329), natural twilight indigo-blue (#0e2f54), and soft muted moonlit foam (#89a9c8)
          rTrough = 0.020; gTrough = 0.075; bTrough = 0.160;
          rMid    = 0.055; gMid    = 0.185; bMid    = 0.330;
          rCrest  = 0.535; gCrest  = 0.665; bCrest  = 0.785;
        } else {
          // Day palette: Deep majestic Atlantic ocean (#0a2a4a), natural coastal cerulean (#1a5b8c), and soft natural sea-foam (#dbeafe to #f0f7ff)
          rTrough = 0.039; gTrough = 0.165; bTrough = 0.290;
          rMid    = 0.100; gMid    = 0.355; bMid    = 0.550;
          rCrest  = 0.860; gCrest  = 0.920; bCrest  = 0.975;
        }

        for (let i = 0; i < arr.length; i += 3) {
          const bx = base[i];     // World X (lateral across bridge)
          const bz = base[i + 2]; // World Z (along bridge span)

          // 1. Primary broad ocean roller (long wavelength, gentle slow swell)
          const k1 = bx * 0.010 + bz * 0.007 + t * 0.85;
          const s1 = Math.sin(k1) * 0.65;

          // 2. Secondary gentle diagonal swell
          const k2 = bx * -0.008 + bz * 0.012 + t * 0.95;
          const s2 = Math.cos(k2) * 0.38;

          // 3. Soft ambient surface wavelets
          const k3 = bx * 0.022 - bz * 0.018 + t * 1.30;
          const s3 = Math.sin(k3) * 0.16;

          // Combined gentle vertical elevation (max amplitude ~1.1 units instead of 2.9 units)
          const totalY = s1 + s2 + s3;
          arr[i + 1] = base[i + 1] + totalY;

          // Very subtle organic wave drift (no frantic sideways shifting)
          arr[i] = bx - Math.cos(k1) * 0.08;
          arr[i + 2] = bz - Math.sin(k2) * 0.08;

          // Realistic organic depth coloring with natural foam on highest crests only
          // Normalized elevation [-1.1 to +1.1] -> [0 to 1]
          const normH = Math.max(0, Math.min(1, (totalY + 1.1) / 2.2));
          if (normH > 0.76) {
            // Natural soft crest foam on peak swells only
            const f = (normH - 0.76) / 0.24;
            const smoothF = f * f; // Smooth quadratic blend into foam
            col[i]     = rMid + (rCrest - rMid) * smoothF;
            col[i + 1] = gMid + (gCrest - gMid) * smoothF;
            col[i + 2] = bMid + (bCrest - bMid) * smoothF;
          } else {
            // Smooth deep water graduation between trough and mid swell
            const f = normH / 0.76;
            col[i]     = rTrough + (rMid - rTrough) * f;
            col[i + 1] = gTrough + (gMid - gTrough) * f;
            col[i + 2] = bTrough + (bMid - bTrough) * f;
          }
        }

        posAttr.needsUpdate = true;
        colorAttr.needsUpdate = true;
        waterMesh.geometry.computeVertexNormals();
      }

      // Reuse the main render loop; no extra timers or animation loops.
      const rippleTime = reduceMotion ? 0 : time * .00065;
      seaRipples.forEach(ripple => {
        const {x,z,length,phase} = ripple.userData;
        const positions = ripple.geometry.attributes.position;
        const fade = .5 + .5 * Math.sin(rippleTime * .65 + phase);
        ripple.material.opacity = (isDarkMode ? .28 : .65) * (.45 + fade * .55);
        for (let j = 0; j < 33; j++) {
          const u = j / 32;
          const wx = x + Math.sin(u * Math.PI) * 5 + Math.sin(rippleTime * .4 + phase) * 6;
          const wz = z + (u - .5) * length + Math.sin(rippleTime * .3 + phase) * 2;
          const bz = wz - 240;
          const height = Math.sin(wx * .010 + bz * .007 + rippleTime * .85) * .65
            + Math.cos(wx * -.008 + bz * .012 + rippleTime * .95) * .38
            + Math.sin(wx * .022 - bz * .018 + rippleTime * 1.30) * .16;
          const width = Math.sin(u * Math.PI) * (1 + fade * .6);
          positions.setXYZ(j * 2, wx - width, -5.5 + height + .65, wz);
          positions.setXYZ(j * 2 + 1, wx + width, -5.5 + height + .65, wz);
        }
        positions.needsUpdate = true;
      });

      // Animate pier foundation foam rings
      if (foamRings && foamRings.length) {
        const ft = reduceMotion ? 0 : time * 0.0010;
        foamRings.forEach(ring => {
          const s = 1.0 + Math.sin(ft + ring.userData.phase) * 0.15;
          ring.scale.set(s, s, 1);
          ring.material.opacity = 0.30 + Math.sin(ft * 1.2 + ring.userData.phase) * 0.15;
        });
      }

      renderer.render(scene, camera);
    }
  }
  // Window Resize & Viewport Handling
  function onWindowResize() {
    if (!renderer || !camera) return;
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }

  window.addEventListener('resize', onWindowResize, { passive: true });
  // Master GSAP ScrollTrigger Orchestration
  function setupScrollTrigger() {
    if (reduceMotion || !window.gsap || !window.ScrollTrigger || document.documentElement.classList.contains('no-webgl')) {
      // Fallback: non-motion standard document presentation
      document.documentElement.classList.remove('motion');
      milestoneElements.forEach(el => {
        if (el) {
          el.classList.add('is-active');
          el.style.opacity = '1';
          el.style.visibility = 'visible';
          el.style.transform = 'none';
        }
      });
      runStatsCounters();
      // Closing sections show either orb; the hero shows only the dark-mode moon.
      const closingSections = new Set();
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) closingSections.add(entry.target);
          else closingSections.delete(entry.target);
        });
        atmosphere?.classList.toggle('is-visible', closingSections.size > 0);
        atmosphere?.classList.toggle('is-hero', heroVisible);
      }, { threshold:.1 });
      ['faculty', 'finale'].forEach(id => { const section = document.getElementById(id); if (section) observer.observe(section); });
      let heroVisible=false;
      const heroObserver=new IntersectionObserver(entries=>{heroVisible=entries.some(entry=>entry.isIntersecting);atmosphere?.classList.toggle('is-hero',heroVisible);},{threshold:.1});
      const hero=document.getElementById('hero');if(hero)heroObserver.observe(hero);
      return;
    }

    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);

    // Smooth scroll with Lenis (if available on non-coarse pointer devices)
    if (window.Lenis && !window.matchMedia('(pointer: coarse)').matches) {
      lenisInstance = new window.Lenis({
        lerp: 0.1,
        wheelMultiplier: 1.0
      });
      lenisInstance.on('scroll', ST.update);
      gsap.ticker.add(t => lenisInstance.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      window.BW_lenis = lenisInstance;
    }

    const journeyStage = $('#journeyStage');
    const journeyWrapper = $('#journeyWrapper');
    if (!journeyStage || !journeyWrapper) return;

    // Pin length: standard is 7.5x screen height, scaled by config pacing
    const getPinDistance = () => `+=${Math.round(window.innerHeight * 7.5 * CONFIG.pacing)}px`;

    masterST = ST.create({
      trigger: journeyWrapper,
      start: 'top top',
      end: getPinDistance,
      pin: journeyStage,
      anticipatePin: 1,
      scrub: 0.8,
      onUpdate: (self) => {
        scrollProgress = self.progress;
        updateRailProgress(scrollProgress);
        updateMilestones(scrollProgress);
      },
      onRefresh: (self) => {
        scrollProgress = self.progress;
        updateRailProgress(scrollProgress);
        updateMilestones(scrollProgress);
      }
    });

    // Check initial hash or query param and sync scroll position
    const initialHash = window.location.hash ? window.location.hash.substring(1) : '';
    const urlParams = new URLSearchParams(window.location.search);
    const pParam = urlParams.get('p') || urlParams.get('progress');
    const totalDist = masterST.end - masterST.start;

    if (pParam != null) {
      const p = parseFloat(pParam);
      if (!isNaN(p)) {
        const targetY = masterST.start + Math.max(0, Math.min(1, p)) * totalDist;
        if (lenisInstance) lenisInstance.scrollTo(targetY, { immediate:true });
        else window.scrollTo(0, targetY);
        scrollProgress = p;
        smoothProgress = p;
        updateRailProgress(p);
        updateMilestones(p);
      }
    } else if (initialHash) {
      const match = MILESTONES.find(m => m.id === initialHash || m.nav === initialHash);
      if (match) {
        const targetY = masterST.start + match.target * totalDist;
        if (lenisInstance) lenisInstance.scrollTo(targetY, { immediate:true });
        else window.scrollTo(0, targetY);
        scrollProgress = match.target;
        smoothProgress = match.target;
        updateRailProgress(match.target);
        updateMilestones(match.target);
      }
    }

    // Handle navigation click jumps smoothly to corresponding milestone progress
    const handleNavClick = (targetId) => {
      const ms = MILESTONES.find(m => m.id === targetId || m.nav === targetId);
      if (!ms) return;

      const totalScroll = masterST.end - masterST.start;
      const targetScrollPos = masterST.start + ms.target * totalScroll;

      closeMobileMenu();

      if (lenisInstance) {
        lenisInstance.scrollTo(targetScrollPos, { duration: 1.4 });
      } else {
        window.scrollTo({
          top: targetScrollPos,
          behavior: 'smooth'
        });
      }
    };
    window.addEventListener('hashchange', () => {
      handleNavClick(location.hash.slice(1) === 'top' ? 'hero' : location.hash.slice(1));
    });

    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const hash = a.getAttribute('href');
        if (!hash || hash.length < 2) return;
        const targetId = hash.substring(1);

        if (targetId === 'top' || targetId === 'hero') {
          e.preventDefault();
          closeMobileMenu();
          if (lenisInstance) lenisInstance.scrollTo(0, { duration: 1.2 });
          else window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        const milestoneMatch = MILESTONES.find(m => m.id === targetId || m.nav === targetId);
        if (milestoneMatch) {
          e.preventDefault();
          handleNavClick(targetId);
          history.replaceState(null, '', hash);
        }
      });
    });
  }
  // Live Tweaks API (window.BW)
  function applyLiveTweaks(tweaks) {
    if (!tweaks) return;

    if (tweaks.blueprint != null) {
      CONFIG.blueprint = tweaks.blueprint;
      document.documentElement.classList.toggle('no-grid', !tweaks.blueprint);
    }

    if (tweaks.pacing != null && tweaks.pacing !== CONFIG.pacing) {
      CONFIG.pacing = Number(tweaks.pacing);
      if (masterST) {
        masterST.refresh();
      }
    }

    if (tweaks.lerpSpeed != null) {
      CONFIG.lerpSpeed = Number(tweaks.lerpSpeed);
    }

    if (tweaks.theme && THEMES[tweaks.theme]) {
      CONFIG.themeName = tweaks.theme;
      const theme = THEMES[tweaks.theme];

      // Update materials live
      towerMaterials.forEach(m => {
        if (m) m.color.setHex(theme.tower);
      });
      cableMaterials.forEach(m => {
        if (m) {
          m.color.setHex(theme.cable);
          m.emissive.setHex(theme.cableGlow);
        }
      });
      if (scene) {
        scene.background.setHex(theme.sky);
        if (scene.fog) scene.fog.color.setHex(theme.fog);
        if (waterMesh && waterMesh.material) {
          waterMesh.material.color.setHex(0xffffff);
        }
      }
    }
  }

  window.BW = {
    apply: applyLiveTweaks,
    getMilestones: () => MILESTONES,
    setProgress: (p) => {
      const clampP = Math.max(0, Math.min(1, p));
      scrollProgress = clampP;
      updateMilestones(clampP);
      updateProgressRail(clampP);
      if (masterST) {
        const targetY = masterST.start + clampP * (masterST.end - masterST.start);
        window.scrollTo(0, targetY);
      }
    },
    goToMilestone: (id) => {
      const m = MILESTONES.find(item => item.id === id);
      if (m && window.BW.setProgress) {
        window.BW.setProgress(m.target);
      }
    },
    setTheme: (mode) => setTheme(mode)
  };
  // Dynamic Day / Night Theme Engine
  function setTheme(mode) {
    isDarkMode = (mode === 'dark');
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');

    if (!isSceneReady || !scene) return;

    if (isDarkMode) {
      // 1. Midnight Sky & Fog
      scene.background.setHex(0x060913);
      if (scene.fog) scene.fog.color.setHex(0x090e1a);

      // 2. Reveal Night Celestial Group (Moon & Stars)
      if (nightSkyGroup) nightSkyGroup.visible = true;

      // 3. Ambient & Sun Lighting for night
      if (sunLight) {
        sunLight.intensity = 0.20;
        sunLight.color.setHex(0x1e3a8a);
      }
      if (ambientLight) {
        ambientLight.intensity = 0.40;
        ambientLight.color.setHex(0x0f2744);
      }
      if (oceanSunLight) {
        oceanSunLight.intensity = 0.45;
        oceanSunLight.color.setHex(0x93c5fd);
        oceanSunLight.position.set(-50, 125, -40);
      }
      if (seaHemisphere) {
        seaHemisphere.intensity = 0.35;
        seaHemisphere.color.setHex(0x1e3a8a);
        seaHemisphere.groundColor.setHex(0x06152b);
      }
      if (seaGlintLight) {
        seaGlintLight.intensity = 0.50;
        seaGlintLight.color.setHex(0x60a5fa);
      }
      if (moonLight) {
        moonLight.intensity = 1.10;
        moonLight.color.setHex(0xe2e8f0);
      }

      // 4. Night Sea (Natural nocturnal ocean with soft moonlit sheen, non-plastic)
      if (waterMesh && waterMesh.material) {
        waterMesh.material.color.setHex(0xffffff);
        waterMesh.material.emissive.setHex(0x020d1c);
        waterMesh.material.emissiveIntensity = 0.12;
        waterMesh.material.roughness = 0.20;
        waterMesh.material.metalness = 0.08;
      }
      if (bedMesh && bedMesh.material) {
        bedMesh.material.color.setHex(0x020814);
      }
      if (foamRings) {
        foamRings.forEach(r => {
          r.material.color.setHex(0x93c5fd);
          r.material.opacity = 0.35;
        });
      }

      // 5. Glowing Night Cables, Towers, and White Graduation Cap
      if (capBoardMat) {
        capBoardMat.color.setHex(0xffffff);
        capBoardMat.emissive.setHex(0x38bdf8);
        capBoardMat.emissiveIntensity = 0.22;
      }
      if (capSkullMat) {
        capSkullMat.color.setHex(0x60a5fa);
      }
      cableMaterials.forEach(m => {
        m.color.setHex(0x38bdf8);
        m.emissive.setHex(0x0284c7);
      });
      towerMaterials.forEach(m => {
        m.color.setHex(0x1d4ed8);
      });

      // 6. Streetlamps Light Up with Warm Luminous Night Glow
      if (lampGlowMat) {
        lampGlowMat.color.setHex(0xfff6b8);
      }
      if (lampHaloMat) {
        lampHaloMat.opacity = 0.95;
      }
      lampHalos.forEach(h => { h.visible = true; });

    } else {
      // Daytime Sunny Sky & Fog
      const theme = THEMES[CONFIG.themeName] || THEMES['Bridgeway Blue'];
      scene.background.setHex(theme.sky);
      if (scene.fog) scene.fog.color.setHex(theme.fog);

      if (nightSkyGroup) nightSkyGroup.visible = false;

      if (sunLight) {
        sunLight.intensity = 1.15;
        sunLight.color.setHex(0xfffbeb);
      }
      if (ambientLight) {
        ambientLight.intensity = 0.72;
        ambientLight.color.setHex(0xffffff);
      }
      if (oceanSunLight) {
        oceanSunLight.intensity = 0.85;
        oceanSunLight.color.setHex(0xfff5ea);
        oceanSunLight.position.set(-160, 110, 180);
      }
      if (seaHemisphere) {
        seaHemisphere.intensity = 0.55;
        seaHemisphere.color.setHex(0xe8f4fd);
        seaHemisphere.groundColor.setHex(0x0a2d4d);
      }
      if (seaGlintLight) {
        seaGlintLight.intensity = 0.60;
        seaGlintLight.color.setHex(0x90cdf4);
      }

      if (waterMesh && waterMesh.material) {
        waterMesh.material.color.setHex(0xffffff);
        waterMesh.material.emissive.setHex(0x011e38);
        waterMesh.material.emissiveIntensity = 0.15;
        waterMesh.material.roughness = 0.18;
        waterMesh.material.metalness = 0.08;
      }
      if (bedMesh && bedMesh.material) {
        bedMesh.material.color.setHex(theme.seaBed || 0x041830);
      }
      if (foamRings) {
        foamRings.forEach(r => {
          r.material.color.setHex(0xcfe8f9);
          r.material.opacity = 0.45;
        });
      }

      if (capBoardMat) {
        capBoardMat.color.setHex(0x0f172a);
        capBoardMat.emissive.setHex(0x000000);
        capBoardMat.emissiveIntensity = 0;
      }
      if (capSkullMat) {
        capSkullMat.color.setHex(0x1d4ed8);
      }

      cableMaterials.forEach(m => {
        m.color.setHex(theme.cable);
        m.emissive.setHex(theme.cableGlow);
      });
      towerMaterials.forEach(m => {
        m.color.setHex(theme.tower);
      });

      // Streetlamps return to daytime unlit state
      if (lampGlowMat) {
        lampGlowMat.color.setHex(theme.light);
      }
      if (lampHaloMat) {
        lampHaloMat.opacity = 0.0;
      }
      lampHalos.forEach(h => { h.visible = false; });
    }
  }

  // Hook up Theme Toggle button
  const themeToggleBtn = document.getElementById('themeToggle');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      setTheme(isDarkMode ? 'light' : 'dark');
    });
  }
  // Initialization Sequence
  function init() {
    const has3D = initThreeScene();
    setupScrollTrigger();

    if (has3D) {
      lastTime = performance.now();
      renderLoop(lastTime);
    }

    // Check initial hash or URL query param for direct milestone landing
    const urlParams = new URLSearchParams(window.location.search);
    const pParam = urlParams.get('p') || urlParams.get('progress');
    const hash = window.location.hash ? window.location.hash.substring(1) : '';

    if (pParam != null) {
      const p = parseFloat(pParam);
      if (!isNaN(p)) {
        scrollProgress = Math.max(0, Math.min(1, p));
        smoothProgress = scrollProgress;
      }
    } else if (hash) {
      const match = MILESTONES.find(m => m.id === hash || m.nav === hash);
      if (match) {
        scrollProgress = match.target;
        smoothProgress = scrollProgress;
      }
    }

    // Initial milestone & rail updates
    updateRailProgress(scrollProgress);
    updateMilestones(scrollProgress);

    // Refresh after fonts and assets settle
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
        const landing = MILESTONES.find(m => m.id === hash || m.nav === hash);
        if (masterST && (landing || pParam != null)) {
          const progress = pParam != null ? Math.max(0, Math.min(1, parseFloat(pParam))) : landing.target;
          if (!Number.isFinite(progress)) return;
          const top = masterST.start + progress * (masterST.end - masterST.start);
          if (lenisInstance) lenisInstance.scrollTo(top, { immediate:true });
          else window.scrollTo(0, top);
          scrollProgress = smoothProgress = progress;
          updateRailProgress(progress); updateMilestones(progress);
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

/* Preview motion stays local and stops when hidden, off-screen, or paused. */
(() => {
  const preview = document.querySelector('.hero-preview');
  const button = document.getElementById('previewMotionToggle');
  if (!preview || !button) return;
  let paused = false, visible = true;
  const sync = () => preview.classList.toggle('is-paused', paused || !visible || document.hidden);
  button.addEventListener('click', () => {
    paused = !paused;
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = paused ? 'Resume animation' : 'Pause animation';
    sync();
  });
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, {threshold:.05});
  observer.observe(preview);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', () => observer.disconnect(), {once:true});
  sync();
})();
