﻿/**
 * @file src/views/GlobeView.js
 * @description 3D NASA Blue Marble Earth View with Political Country Borders, Zoom-Adaptive
 * Country Labels, Geodesic AOI Tactical Radar Ring, Realistic 3D Satellites, and FRP Hotspots.
 * @team AlgoXplorers (Argentina)
 * @license MIT
 */
import { SATELLITE_FLEET, WORLD_GEOJSON_URLS, WORLD_COUNTRIES, SAN_LUIS_GEOGRAPHY } from '../config/constants.js';
import { i18n } from '../config/i18n.js';

export class GlobeView {
  constructor(containerId, fpsElementId) {
    this.container = document.getElementById(containerId); this.fpsElement = document.getElementById(fpsElementId);
    this.scene = null; this.camera = null; this.renderer = null; this.earthGroup = null; this.cloudsMesh = null;
    this.bordersMat = null; this.borderTexMat = null; this.sanLuisBordersMat = null; this.sanLuisShadowMat = null;
    this.hotspotSatMeshes = new Map();
    this.aoiRingMesh = null; this.aoiRingMat = null; this.satMeshes = new Map(); this.countryNodes = [];
    this.sanLuisDeptNodes = []; this.sanLuisLocNodes = []; this.sanLuisMarkersGroup = null; this.earthSphereMesh = null;
    this.lodLayers = []; this.tileImageCache = new Map(); this.maxAnisotropy = 4;
    this.activeSatIds = new Set(['terra', 'aqua', 'suomi_npp', 'noaa_20']);
    this.currentBins = []; this.clockStart = performance.now(); this.frameCount = 0; this.lastFpsCheck = performance.now();
    this.isContextLost = false; this.isDragging = false; this.prevMouse = { x: 0, y: 0 };
    this.rotationTarget = { x: 0.22, y: -1.35 }; this.zoomTarget = 3.25; this.zoomReadoutEl = null;
    this.lastBiomeId = null; this.autoRotate = false; this.lastHotspotScale = 1.0;
    this.flightState = null; this.cameraVeilEl = null;
    this.hoverTooltipEl = null; this.hoverRingEl = null; this.hoverScreenItems = []; this.activeHoverItem = null; this.lastSnapshot = null;
  }
  init() { if (this.container && window.THREE) { this._initThreeScene(); this._bindPointerControls(); this._animate(); } }
  _latLonToVec3(THREE, lat, lon, r = 1.004) {
    const phi = ((90 - lat) * Math.PI) / 180, theta = ((lon + 180) * Math.PI) / 180;
    return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
  }
  _haversineKm(lat1, lon1, lat2, lon2) {
    const toRad = Math.PI / 180, dLat = (lat2 - lat1) * toRad, dLon = (lon2 - lon1) * toRad;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  _createHighResProceduralEarth(THREE) {
    const c = document.createElement('canvas'); c.width = 2048; c.height = 1024;
    const ctx = c.getContext('2d'), ocean = ctx.createLinearGradient(0, 0, 0, 1024);
    ocean.addColorStop(0, '#04122c'); ocean.addColorStop(0.5, '#092c66'); ocean.addColorStop(1, '#04122c');
    ctx.fillStyle = ocean; ctx.fillRect(0, 0, 2048, 1024);
    const drawLand = (pts, fill, stroke) => {
      ctx.beginPath(); pts.forEach(([x, y], idx) => (idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke();
    };
    drawLand([[320,160],[540,140],[620,270],[540,390],[490,460],[430,410],[350,280]], '#2d5a3c', '#52796f');
    drawLand([[520,470],[660,520],[710,630],[640,810],[560,890],[530,740],[495,570]], '#1f4e3d', '#40916c');
    drawLand([[940,340],[1140,360],[1210,540],[1120,770],[1010,760],[960,560],[890,450]], '#4a5d3f', '#748cab');
    drawLand([[950,170],[1350,140],[1680,220],[1620,420],[1320,440],[1120,330],[960,290]], '#2b4c3f', '#52796f');
    drawLand([[1520,620],[1710,610],[1740,760],[1560,780]], '#5c4d3c', '#8d6e63');
    return new THREE.CanvasTexture(c);
  }
  _initThreeScene() {
    const THREE = window.THREE, w = this.container.clientWidth || window.innerWidth, h = this.container.clientHeight || window.innerHeight;
    this.scene = new THREE.Scene(); this.camera = new THREE.PerspectiveCamera(40, w / h, 0.01, 1000);
    this.zoomTarget = w < 768 ? 3.85 : 3.25; this.camera.position.set(0, 0, this.zoomTarget);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5)); this.renderer.setSize(w, h);
    this.container.innerHTML = ''; this.container.appendChild(this.renderer.domElement);
    this.cameraVeilEl = document.createElement('div'); this.cameraVeilEl.className = 'globe-camera-veil';
    this.container.appendChild(this.cameraVeilEl);
    this.labelLayer = document.createElement('div'); this.labelLayer.className = 'sat-labels-overlay';
    this.container.appendChild(this.labelLayer);
    this.hoverRingEl = document.createElement('div'); this.hoverRingEl.className = 'globe-hover-ring';
    this.container.appendChild(this.hoverRingEl);
    this.hoverTooltipEl = document.createElement('div'); this.hoverTooltipEl.className = 'globe-hover-tooltip';
    this.container.appendChild(this.hoverTooltipEl);
    this._buildZoomHud();
    const domCanvas = this.renderer.domElement;
    domCanvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.isContextLost = true; });
    domCanvas.addEventListener('webglcontextrestored', () => { this.isContextLost = false; this.dispose(); this._initThreeScene(); });
    this._buildStarfield(THREE); this.earthGroup = new THREE.Group(); this.scene.add(this.earthGroup);
    this.scene.add(new THREE.AmbientLight(0x90b4e8, 0.85));
    const sun = new THREE.DirectionalLight(0xffffff, 1.15); sun.position.set(4, 2, 5); this.scene.add(sun);
    const loader = new THREE.TextureLoader(); loader.setCrossOrigin('anonymous');
    this.maxAnisotropy = this.renderer.capabilities && this.renderer.capabilities.getMaxAnisotropy ? this.renderer.capabilities.getMaxAnisotropy() : 8;
    const worldTex = this._buildGlobal4KWorldAtlas(THREE);
    const earthMat = new THREE.MeshPhongMaterial({ map: worldTex, specular: new THREE.Color(0x0a192f), shininess: 6 });
    this.earthSphereMesh = new THREE.Mesh(new THREE.SphereGeometry(1.0, 128, 128), earthMat);
    this.earthSphereMesh.renderOrder = 0;
    this.earthGroup.add(this.earthSphereMesh);
    this._buildLodTileEngine(THREE);
    const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.04, depthWrite: false });
    loader.load('https://unpkg.com/three-globe@2.31.0/example/img/earth-clouds.png', (cTex) => { cloudMat.map = cTex; cloudMat.opacity = 0.05; cloudMat.needsUpdate = true; });
    this.cloudsMesh = new THREE.Mesh(new THREE.SphereGeometry(1.014, 48, 48), cloudMat); this.earthGroup.add(this.cloudsMesh);
    this.earthGroup.add(new THREE.Mesh(new THREE.SphereGeometry(1.055, 48, 48), new THREE.MeshBasicMaterial({ color: 0x1d70ff, transparent: true, opacity: 0.16, side: THREE.BackSide, depthWrite: false })));
    this._buildCountryBordersAndLabels(THREE); this._buildSanLuisCartography(THREE); this._buildOrbitsAndSatellites(THREE); this._buildHotspotMeshes(THREE);
    window.addEventListener('resize', () => {
      if (!this.renderer || !this.container) return;
      const nw = this.container.clientWidth || window.innerWidth, nh = this.container.clientHeight || window.innerHeight;
      this.camera.aspect = nw / nh; this.camera.updateProjectionMatrix(); this.renderer.setSize(nw, nh);
    });
  }
  _buildGlobal4KWorldAtlas(THREE) {
    const c = document.createElement('canvas'); c.width = 4096; c.height = 2048;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    const fallbackTex = this._createHighResProceduralEarth(THREE);
    ctx.drawImage(fallbackTex.image, 0, 0, 4096, 2048);
    const worldTex = new THREE.CanvasTexture(c);
    worldTex.anisotropy = this.maxAnisotropy;
    worldTex.minFilter = THREE.LinearMipmapLinearFilter;
    worldTex.magFilter = THREE.LinearFilter;

    const bmImg = new Image();
    bmImg.crossOrigin = 'anonymous';
    bmImg.onload = () => {
      ctx.drawImage(bmImg, 0, 0, 4096, 2048);
      worldTex.needsUpdate = true;
      // Overlay Z=3 (8x8 global satellite tiles) projected from Web Mercator to Equirectangular 4K
      const z = 3, n = 8;
      const tileToLat = (ty) => (Math.atan(Math.sinh(Math.PI * (1 - (2 * ty) / n))) * 180) / Math.PI;
      for (let ty = 0; ty < n; ty++) {
        for (let tx = 0; tx < n; tx++) {
          const tImg = new Image();
          tImg.crossOrigin = 'anonymous';
          tImg.onload = () => {
            const strips = 16, sh = 256 / strips, dx = tx * 512, dw = 512;
            for (let s = 0; s < strips; s++) {
              const lat0 = tileToLat(ty + s / strips);
              const lat1 = tileToLat(ty + (s + 1) / strips);
              const dy0 = ((90 - lat0) / 180) * 2048;
              const dy1 = ((90 - lat1) / 180) * 2048;
              ctx.drawImage(tImg, 0, s * sh, 256, sh, dx, dy0, dw, Math.max(1, dy1 - dy0 + 0.6));
            }
            worldTex.needsUpdate = true;
          };
          tImg.src = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${ty}/${tx}`;
        }
      }
    };
    bmImg.src = 'https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg';
    return worldTex;
  }
  _buildLodTileEngine(THREE) {
    // Google Earth-style 4-Level Progressive Satellite Tile Pyramid (8x8 = 2048x2048 px per layer)
    const configs = [
      { id: 'country', z: 6, gridCols: 8, gridRows: 8, radius: 1.0005, renderOrder: 2, maxZDist: 2.85, fullZDist: 2.20, reCenterDeg: 8.0 },
      { id: 'regional', z: 8, gridCols: 8, gridRows: 8, radius: 1.0008, renderOrder: 3, maxZDist: 2.00, fullZDist: 1.55, reCenterDeg: 2.2 },
      { id: 'provincial', z: 10, gridCols: 8, gridRows: 8, radius: 1.0011, renderOrder: 4, maxZDist: 1.45, fullZDist: 1.18, reCenterDeg: 0.55 },
      { id: 'local', z: 12, gridCols: 8, gridRows: 8, radius: 1.0014, renderOrder: 5, maxZDist: 1.15, fullZDist: 1.06, reCenterDeg: 0.16 }
    ];
    this.lodLayers = configs.map((cfg) => {
      const canvas = document.createElement('canvas');
      canvas.width = cfg.gridCols * 256;
      canvas.height = cfg.gridRows * 256;
      const ctx = canvas.getContext('2d');
      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = this.maxAnisotropy;
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        color: 0xf8fafc,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: true,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);
      mesh.renderOrder = cfg.renderOrder;
      mesh.visible = false;
      this.earthGroup.add(mesh);
      return { ...cfg, canvas, ctx, texture, mat, mesh, centerLat: null, centerLon: null, xMin: 0, yMin: 0, xMax: 0, yMax: 0, activeKey: '' };
    });
    // Pre-warm Z=6, Z=8, and Z=10 satellite mosaics centered on San Luis (-33.55, -66.02)
    this._refreshLodLayerMosaic(this.lodLayers[0], -33.55, -66.02);
    this._refreshLodLayerMosaic(this.lodLayers[1], -33.55, -66.02);
    this._refreshLodLayerMosaic(this.lodLayers[2], -33.55, -66.02);
  }
  _drawSingleTileOnLayer(layer, col, row, img) {
    const px = col * 256, py = row * 256;
    layer.ctx.globalCompositeOperation = 'source-over';
    layer.ctx.clearRect(px, py, 256, 256);
    layer.ctx.drawImage(img, px, py, 256, 256);
    if (col === 0 || col === layer.gridCols - 1 || row === 0 || row === layer.gridRows - 1) {
      this._applyTileEdgeAlpha(layer, col, row);
    }
    layer.texture.needsUpdate = true;
  }
  _applyTileEdgeAlpha(layer, col, row) {
    const { ctx, gridCols, gridRows } = layer;
    const px = col * 256, py = row * 256;
    ctx.save();
    // IMPORTANT: destination-out ONLY fades pixels inside fillRect and NEVER erases other tiles on the canvas!
    ctx.globalCompositeOperation = 'destination-out';
    if (col === 0) {
      const g = ctx.createLinearGradient(px, 0, px + 64, 0);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(px, py, 64, 256);
    } else if (col === gridCols - 1) {
      const g = ctx.createLinearGradient(px + 192, 0, px + 256, 0);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = g; ctx.fillRect(px + 192, py, 64, 256);
    }
    if (row === 0) {
      const g = ctx.createLinearGradient(0, py, 0, py + 64);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(px, py, 256, 64);
    } else if (row === gridRows - 1) {
      const g = ctx.createLinearGradient(0, py + 192, 0, py + 256);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = g; ctx.fillRect(px, py + 192, 256, 64);
    }
    ctx.restore();
  }
  _requestSatelliteTile(z, tx, ty) {
    const tileId = `${z}/${ty}/${tx}`;
    let entry = this.tileImageCache.get(tileId);
    if (entry) return entry;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    entry = { img, status: 'loading' };
    this.tileImageCache.set(tileId, entry);
    if (this.tileImageCache.size > 520) {
      const oldestKey = this.tileImageCache.keys().next().value;
      this.tileImageCache.delete(oldestKey);
    }

    img.onload = () => {
      entry.status = 'loaded';
      this.lodLayers.forEach((layer) => {
        if (layer.z === z && tx >= layer.xMin && tx <= layer.xMax && ty >= layer.yMin && ty <= layer.yMax) {
          this._drawSingleTileOnLayer(layer, tx - layer.xMin, ty - layer.yMin, img);
        }
      });
    };
    img.onerror = () => {
      if (!img.dataset.fallback) {
        img.dataset.fallback = '1';
        img.src = `https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${ty}/${tx}`;
      } else if (img.dataset.fallback === '1') {
        img.dataset.fallback = '2';
        img.src = `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/${z}/${ty}/${tx}.jpg`;
      } else {
        entry.status = 'error';
      }
    };
    img.src = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${ty}/${tx}`;
    return entry;
  }
  _refreshLodLayerMosaic(layer, centerLat, centerLon) {
    if (!window.THREE) return;
    const THREE = window.THREE;
    const z = layer.z, n = 2 ** z;
    const clampedLat = Math.max(-78, Math.min(78, centerLat));
    const latRad = (clampedLat * Math.PI) / 180;
    const cTileX = Math.floor(((centerLon + 180) / 360) * n);
    const cTileY = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);

    const halfC = Math.floor(layer.gridCols / 2);
    const halfR = Math.floor(layer.gridRows / 2);
    const xMin = Math.max(0, Math.min(n - layer.gridCols, cTileX - halfC));
    const yMin = Math.max(0, Math.min(n - layer.gridRows, cTileY - halfR));
    const key = `${z}:${xMin}:${yMin}`;
    layer.centerLat = clampedLat;
    layer.centerLon = centerLon;
    if (layer.activeKey === key) return;
    layer.activeKey = key;
    layer.xMin = xMin;
    layer.yMin = yMin;
    layer.xMax = xMin + layer.gridCols - 1;
    layer.yMax = yMin + layer.gridRows - 1;

    const tileToLon = (tx) => (tx / n) * 360 - 180;
    const tileToLat = (ty) => (Math.atan(Math.sinh(Math.PI * (1 - (2 * ty) / n))) * 180) / Math.PI;
    const segX = 48, segY = 48;
    const positions = new Float32Array((segX + 1) * (segY + 1) * 3);
    const normals = new Float32Array((segX + 1) * (segY + 1) * 3);
    const uvs = new Float32Array((segX + 1) * (segY + 1) * 2);
    const indices = [];

    let pIdx = 0, uIdx = 0;
    for (let iy = 0; iy <= segY; iy++) {
      const fy = iy / segY;
      const ty = yMin + fy * layer.gridRows;
      const lat = tileToLat(ty);
      for (let ix = 0; ix <= segX; ix++) {
        const fx = ix / segX;
        const tx = xMin + fx * layer.gridCols;
        const lon = tileToLon(tx);
        const v3 = this._latLonToVec3(THREE, lat, lon, layer.radius);
        positions[pIdx] = v3.x; positions[pIdx + 1] = v3.y; positions[pIdx + 2] = v3.z;
        const n3 = v3.clone().normalize();
        normals[pIdx] = n3.x; normals[pIdx + 1] = n3.y; normals[pIdx + 2] = n3.z;
        pIdx += 3;
        uvs[uIdx] = fx; uvs[uIdx + 1] = 1 - fy;
        uIdx += 2;
      }
    }
    for (let iy = 0; iy < segY; iy++) {
      for (let ix = 0; ix < segX; ix++) {
        const a = iy * (segX + 1) + ix;
        const b = (iy + 1) * (segX + 1) + ix;
        const c = (iy + 1) * (segX + 1) + (ix + 1);
        const d = iy * (segX + 1) + (ix + 1);
        indices.push(a, b, d, b, c, d);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    if (layer.mesh.geometry) layer.mesh.geometry.dispose();
    layer.mesh.geometry = geo;

    layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
    for (let row = 0; row < layer.gridRows; row++) {
      for (let col = 0; col < layer.gridCols; col++) {
        const tx = xMin + col, ty = yMin + row;
        const entry = this._requestSatelliteTile(z, tx, ty);
        if (entry.status === 'loaded' && entry.img.complete && entry.img.naturalWidth > 0) {
          this._drawSingleTileOnLayer(layer, col, row, entry.img);
        }
      }
    }
    layer.texture.needsUpdate = true;
  }
  _updateLodTiles(zDist) {
    if (!this.lodLayers || !this.lodLayers.length || !this.earthGroup) return;
    const rx = this.earthGroup.rotation.x, ry = this.earthGroup.rotation.y;
    const camLat = Math.max(-75, Math.min(75, (rx * 180) / Math.PI));
    let camLon = -((ry * 180) / Math.PI) - 90;
    camLon = ((((camLon + 180) % 360) + 360) % 360) - 180;

    this.lodLayers.forEach((layer) => {
      if (zDist >= layer.maxZDist) {
        layer.mesh.visible = false;
        layer.mat.opacity = 0;
        return;
      }
      layer.mesh.visible = true;
      const t = Math.max(0, Math.min(1, (layer.maxZDist - zDist) / (layer.maxZDist - layer.fullZDist)));
      layer.mat.opacity = t;
      const distDeg = layer.centerLat === null ? 999 : Math.hypot(camLat - layer.centerLat, camLon - layer.centerLon);
      if (distDeg > layer.reCenterDeg) {
        this._refreshLodLayerMosaic(layer, camLat, camLon);
      }
    });
  }
  _startCameraFlight(lat, lon, targetZ, durationMs = 1050) {
    this.autoRotate = false;
    const startRx = this.earthGroup ? this.earthGroup.rotation.x : this.rotationTarget.x;
    const startRy = this.earthGroup ? this.earthGroup.rotation.y : this.rotationTarget.y;
    const startZ = this.camera ? this.camera.position.z : this.zoomTarget;
    let endRx = this.rotationTarget.x;
    let endRy = this.rotationTarget.y;
    let deltaRy = 0;
    if (lat !== null && lon !== null && !Number.isNaN(lat) && !Number.isNaN(lon)) {
      const rawTargetY = ((-lon - 90) * Math.PI) / 180;
      deltaRy = Math.atan2(Math.sin(rawTargetY - startRy), Math.cos(rawTargetY - startRy));
      endRy = startRy + deltaRy;
      endRx = Math.max(-1.25, Math.min(1.25, (lat * Math.PI) / 180));
    }
    const endZ = Math.max(1.045, Math.min(4.2, targetZ));
    const angDist = Math.hypot(endRx - startRx, deltaRy);
    const arcLift = angDist > 0.32 ? Math.min(0.75, angDist * 0.42) : 0;
    this.rotationTarget.x = endRx;
    this.rotationTarget.y = endRy;
    this.zoomTarget = endZ;
    this.flightState = { startTime: performance.now(), durationMs, startRx, startRy, startZ, endRx, endRy, endZ, arcLift };
    if (this.cameraVeilEl) {
      this.cameraVeilEl.classList.add('veil-active');
      clearTimeout(this._veilTimer);
      this._veilTimer = setTimeout(() => { if (this.cameraVeilEl) this.cameraVeilEl.classList.remove('veil-active'); }, Math.round(durationMs * 0.65));
    }
  }
  focusSanLuis() {
    this._startCameraFlight(-33.72, -66.02, 1.135, 1150);
  }
  _buildZoomHud() {
    const hud = document.createElement('div'); hud.className = 'globe-zoom-controls';
    hud.innerHTML = `<button type="button" class="globe-zoom-btn" title="Zoom Out">−</button><span class="globe-zoom-readout">🌐 Doble Click / Rueda: Zoom</span><button type="button" class="globe-zoom-btn" title="Zoom In">+</button><button type="button" class="globe-sanluis-btn" title="Enfocar Mapa Departamental de San Luis">🗺️ San Luis</button>`;
    const [btnOut, btnIn, btnSanLuis] = hud.querySelectorAll('button'); this.zoomReadoutEl = hud.querySelector('.globe-zoom-readout');
    btnOut.addEventListener('click', () => { this.flightState = null; const step = Math.max(0.045, (this.zoomTarget - 1.0) * 0.32); this.zoomTarget = Math.min(4.2, this.zoomTarget + step); });
    btnIn.addEventListener('click', () => { this.flightState = null; const step = Math.max(0.035, (this.zoomTarget - 1.0) * 0.28); this.zoomTarget = Math.max(1.045, this.zoomTarget - step); });
    if (btnSanLuis) btnSanLuis.addEventListener('click', () => this.focusSanLuis());
    this.container.appendChild(hud);
    if (!this._drawersBound) {
      this._drawersBound = true;
      const btnLeft = document.getElementById('btn-toggle-left-panel');
      const panelLeft = document.querySelector('.left-telemetry-panel');
      if (btnLeft && panelLeft) {
        btnLeft.addEventListener('click', () => {
          const isCollapsed = panelLeft.classList.toggle('panel-collapsed');
          btnLeft.classList.toggle('drawer-collapsed', isCollapsed);
          btnLeft.textContent = isCollapsed ? '📡 ▶' : '◀';
        });
      }
      const btnRight = document.getElementById('btn-toggle-right-panel');
      const panelRight = document.querySelector('.right-tactical-panel');
      if (btnRight && panelRight) {
        btnRight.addEventListener('click', () => {
          const isCollapsed = panelRight.classList.toggle('panel-collapsed');
          btnRight.classList.toggle('drawer-collapsed', isCollapsed);
          btnRight.textContent = isCollapsed ? '◀ 🚒' : '▶';
        });
      }

      // FLOATING SATELLITE LEGEND BINDINGS
      const satLegend = document.getElementById('floating-sat-legend');
      const barCollapsed = document.getElementById('fsl-bar-collapsed');
      const btnToggleLegend = document.getElementById('fsl-btn-toggle');
      const btnCloseLegend = document.getElementById('fsl-btn-close');
      const hudSatsValue = document.getElementById('hud-sats-value');

      const toggleLegend = () => {
        if (!satLegend) return;
        const expanded = satLegend.classList.toggle('is-expanded');
        if (btnToggleLegend) btnToggleLegend.textContent = expanded ? '▴' : '▾';
      };

      if (barCollapsed) {
        barCollapsed.addEventListener('click', (e) => {
          if (!e.target.closest('[data-sat]')) toggleLegend();
        });
      }
      if (btnToggleLegend) btnToggleLegend.addEventListener('click', (e) => { e.stopPropagation(); toggleLegend(); });
      if (btnCloseLegend) btnCloseLegend.addEventListener('click', (e) => { e.stopPropagation(); satLegend.classList.remove('is-expanded'); if (btnToggleLegend) btnToggleLegend.textContent = '▾'; });
      if (hudSatsValue) {
        hudSatsValue.style.cursor = 'pointer';
        hudSatsValue.title = 'Click para abrir la leyenda de satélites';
        hudSatsValue.addEventListener('click', () => toggleLegend());
      }

      const satItems = document.querySelectorAll('#floating-sat-legend [data-sat]');
      satItems.forEach((el) => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const satId = el.getAttribute('data-sat');
          if (!satId) return;
          if (this.activeSatIds.has(satId) && this.activeSatIds.size === 1) {
            this.activeSatIds = new Set(SATELLITE_FLEET.map((s) => s.id));
          } else {
            this.activeSatIds = new Set([satId]);
          }
          satItems.forEach((item) => {
            const id = item.getAttribute('data-sat');
            const isActive = this.activeSatIds.has(id);
            item.style.opacity = isActive ? '1' : '0.35';
          });
          if (this.lastSnapshot) this.updateTelemetry(this.lastSnapshot);
        });
      });
    }
  }
  _addCountryLabelNode(THREE, lat, lon, nameEs, nameEn, span = 6) {
    const normEs = /falkland|malvinas/i.test(nameEs) ? 'Islas Malvinas' : nameEs, normEn = /falkland|malvinas/i.test(nameEn) ? 'Islas Malvinas' : nameEn;
    if (this.countryNodes.some((c) => c.nameEn.toLowerCase() === normEn.toLowerCase() || (Math.abs(c.lat - lat) < 1.8 && Math.abs(c.lon - lon) < 1.8))) return;
    const el = document.createElement('div'); el.className = 'country-floating-tag';
    this.labelLayer.appendChild(el);
    this.countryNodes.push({ lat, lon, nameEs: normEs, nameEn: normEn, span, localVec: this._latLonToVec3(THREE, lat, lon, 1.006), el });
  }
  _buildCountryBordersAndLabels(THREE) {
    this.countryNodes = [];
    WORLD_COUNTRIES.forEach(([lat, lon, es, en, span]) => this._addCountryLabelNode(THREE, lat, lon, es, en, span || 8));
    this.bordersMat = new THREE.LineBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.68, depthTest: true });
    const parseGeoJson = (data) => {
      if (!data || !Array.isArray(data.features)) return;
      const verts = [], bc = document.createElement('canvas'); bc.width = 4096; bc.height = 2048;
      const bctx = bc.getContext('2d'); bctx.lineJoin = 'round'; bctx.lineCap = 'round';
      const addRing = (ring) => {
        bctx.beginPath();
        for (let i = 0; i < ring.length; i++) {
          const [lon, lat] = ring[i], x = ((lon + 180) / 360) * bc.width, y = ((90 - lat) / 180) * bc.height;
          if (i === 0 || Math.abs(lon - ring[i - 1][0]) >= 150) bctx.moveTo(x, y); else bctx.lineTo(x, y);
          if (i < ring.length - 1) {
            const [lon2, lat2] = ring[i + 1], steps = Math.max(1, Math.ceil(Math.hypot(lon2 - lon, lat2 - lat) / 1.5));
            for (let s = 0; s < steps; s++) {
              const t1 = s / steps, t2 = (s + 1) / steps;
              const v1 = this._latLonToVec3(THREE, lat + (lat2 - lat) * t1, lon + (lon2 - lon) * t1, 1.0014), v2 = this._latLonToVec3(THREE, lat + (lat2 - lat) * t2, lon + (lon2 - lon) * t2, 1.0014);
              verts.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
            }
          }
        }
        bctx.strokeStyle = 'rgba(2, 6, 23, 0.72)'; bctx.lineWidth = 1.6; bctx.stroke(); bctx.strokeStyle = 'rgba(103, 232, 249, 0.85)'; bctx.lineWidth = 0.75; bctx.stroke();
      };
      data.features.forEach((feat) => {
        const g = feat.geometry; if (!g) return;
        let name = (feat.properties && (feat.properties.ADMIN || feat.properties.name || feat.properties.NAME)) || '';
        if (/falkland|malvinas/i.test(name)) name = 'Islas Malvinas';
        const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
        let bestRing = null;
        polys.forEach((p) => p.forEach((ring) => { addRing(ring); if (!bestRing || ring.length > bestRing.length) bestRing = ring; }));
        if (name && bestRing && bestRing.length > 3) {
          let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
          bestRing.forEach(([lon, lat]) => { minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat); minLon = Math.min(minLon, lon); maxLon = Math.max(maxLon, lon); });
          this._addCountryLabelNode(THREE, (minLat + maxLat) * 0.5, (minLon + maxLon) * 0.5, name, name, Math.hypot(maxLat - minLat, maxLon - minLon));
        }
      });
      const strokeSlPath = (pts, wDark, wCyan) => {
        bctx.beginPath();
        pts.forEach(([lon, lat], i) => {
          const x = ((lon + 180) / 360) * bc.width, y = ((90 - lat) / 180) * bc.height;
          if (i === 0) bctx.moveTo(x, y); else bctx.lineTo(x, y);
        });
        bctx.strokeStyle = 'rgba(2, 6, 23, 0.72)'; bctx.lineWidth = wDark; bctx.stroke();
        bctx.strokeStyle = 'rgba(103, 232, 249, 0.88)'; bctx.lineWidth = wCyan; bctx.stroke();
      };
      strokeSlPath(SAN_LUIS_GEOGRAPHY.OUTER_RING, 1.3, 0.65);
      SAN_LUIS_GEOGRAPHY.INTERNAL_DIVISIONS.forEach((line) => strokeSlPath(line, 0.9, 0.45));
      this.borderTexMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(bc), transparent: true, opacity: 0.65, depthWrite: false });
      this.earthGroup.add(new THREE.Mesh(new THREE.SphereGeometry(1.001, 64, 64), this.borderTexMat));
      if (verts.length > 0) {
        const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
        this.earthGroup.add(new THREE.LineSegments(geo, this.bordersMat));
      }
    };
    fetch(WORLD_GEOJSON_URLS[0]).then((r) => r.json()).then(parseGeoJson).catch(() => fetch(WORLD_GEOJSON_URLS[1]).then((r) => r.json()).then(parseGeoJson).catch(() => {}));
  }
  _buildSanLuisCartography(THREE) {
    this.sanLuisDeptNodes = []; this.sanLuisLocNodes = [];
    this.sanLuisBordersMat = new THREE.LineBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.85, depthTest: true });
    this.sanLuisShadowMat = new THREE.LineBasicMaterial({ color: 0x020617, transparent: true, opacity: 0.55, depthTest: true });
    const vertsMain = [], vertsShadow = [];
    const addPath = (pts, isOuter) => {
      for (let i = 0; i < pts.length - 1; i++) {
        const [lon1, lat1] = pts[i], [lon2, lat2] = pts[i + 1];
        const steps = Math.max(1, Math.ceil(Math.hypot(lon2 - lon1, lat2 - lat1) / 0.04));
        for (let s = 0; s < steps; s++) {
          const t1 = s / steps, t2 = (s + 1) / steps;
          const la1 = lat1 + (lat2 - lat1) * t1, lo1 = lon1 + (lon2 - lon1) * t1;
          const la2 = lat1 + (lat2 - lat1) * t2, lo2 = lon1 + (lon2 - lon1) * t2;
          const v1 = this._latLonToVec3(THREE, la1, lo1, isOuter ? 1.0022 : 1.0021);
          const v2 = this._latLonToVec3(THREE, la2, lo2, isOuter ? 1.0022 : 1.0021);
          vertsMain.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
          const sv1 = this._latLonToVec3(THREE, la1, lo1, 1.0019);
          const sv2 = this._latLonToVec3(THREE, la2, lo2, 1.0019);
          vertsShadow.push(sv1.x, sv1.y, sv1.z, sv2.x, sv2.y, sv2.z);
        }
      }
    };
    addPath(SAN_LUIS_GEOGRAPHY.OUTER_RING, true);
    SAN_LUIS_GEOGRAPHY.INTERNAL_DIVISIONS.forEach((line) => addPath(line, false));
    const shadowGeo = new THREE.BufferGeometry(); shadowGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertsShadow, 3));
    const shadowLines = new THREE.LineSegments(shadowGeo, this.sanLuisShadowMat); shadowLines.renderOrder = 6;
    this.earthGroup.add(shadowLines);
    const mainGeo = new THREE.BufferGeometry(); mainGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertsMain, 3));
    const mainLines = new THREE.LineSegments(mainGeo, this.sanLuisBordersMat); mainLines.renderOrder = 7;
    this.earthGroup.add(mainLines);

    SAN_LUIS_GEOGRAPHY.DEPARTMENTS.forEach(([lat, lon, labelEs, labelEn]) => {
      const el = document.createElement('div'); el.className = 'dept-floating-tag';
      this.labelLayer.appendChild(el);
      this.sanLuisDeptNodes.push({ lat, lon, labelEs, labelEn, localVec: this._latLonToVec3(THREE, lat, lon, 1.0024), el });
    });

    this.sanLuisMarkersGroup = new THREE.Group();
    this.sanLuisMarkersGroup.renderOrder = 8;
    this.earthGroup.add(this.sanLuisMarkersGroup);
    const dotGeoCap = new THREE.SphereGeometry(0.0013, 10, 10);
    const dotGeoT1 = new THREE.SphereGeometry(0.00095, 8, 8);
    const dotGeoT2 = new THREE.SphereGeometry(0.0007, 8, 8);
    const matCap = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const matT1 = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    const matT2 = new THREE.MeshBasicMaterial({ color: 0xbae6fd });

    SAN_LUIS_GEOGRAPHY.LOCALITIES.forEach(([lat, lon, name, tier, isCapital]) => {
      const vec = this._latLonToVec3(THREE, lat, lon, 1.0024);
      const mesh = new THREE.Mesh(isCapital ? dotGeoCap : tier === 1 ? dotGeoT1 : dotGeoT2, isCapital ? matCap : tier === 1 ? matT1 : matT2);
      mesh.position.copy(vec);
      this.sanLuisMarkersGroup.add(mesh);
      const el = document.createElement('div');
      el.className = `locality-floating-tag ${isCapital ? 'locality-capital' : tier === 1 ? 'locality-tier-1' : 'locality-tier-2'}`;
      el.textContent = isCapital ? `★ ${name}` : `• ${name}`;
      this.labelLayer.appendChild(el);
      this.sanLuisLocNodes.push({ lat, lon, name, tier, isCapital, localVec: vec, mesh, el });
    });
  }
  _buildStarfield(THREE) {
    const starGeo = new THREE.BufferGeometry(), pos = new Float32Array(1400 * 3);
    for (let i = 0; i < 1400 * 3; i += 3) { pos[i] = (Math.random() - 0.5) * 45; pos[i + 1] = (Math.random() - 0.5) * 45; pos[i + 2] = -8 - Math.random() * 25; }
    starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x93c5fd, size: 0.045, transparent: true, opacity: 0.75 })));
  }
  _buildOrbitsAndSatellites(THREE) {
    const tilts = [{ rx: 1.15, ry: 0.35, rz: 0.45 }, { rx: 1.32, ry: -0.42, rz: -0.35 }, { rx: 1.48, ry: 0.18, rz: 0.62 }, { rx: 1.22, ry: -0.25, rz: -0.55 }];
    SATELLITE_FLEET.forEach((sat, idx) => {
      const orbitPivot = new THREE.Group(), t = tilts[idx % tilts.length]; orbitPivot.rotation.set(t.rx, t.ry, t.rz);
      const altRadius = sat.sensor === 'VIIRS' ? 1.24 : 1.17, pts = [];
      for (let i = 0; i <= 96; i++) { const a = (i / 96) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * altRadius, Math.sin(a) * altRadius, 0)); }
      orbitPivot.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: sat.colorHex, transparent: true, opacity: 0.42 })));
      const satNode = new THREE.Group(), coneH = altRadius - 1.0;
      const busMat = new THREE.MeshStandardMaterial({ color: sat.sensor === 'VIIRS' ? 0xd1d5db : 0xd97706, metalness: 0.85, roughness: 0.25 });
      satNode.add(new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.038, 0.065), busMat));
      const panelMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, emissive: 0x0f2757, metalness: 0.8, roughness: 0.2 });
      const leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.003, 0.042), panelMat); leftWing.position.set(-0.088, 0, 0);
      const rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.003, 0.042), panelMat); rightWing.position.set(0.088, 0, 0);
      satNode.add(leftWing, rightWing);
      const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.002, 0.008, 16), new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.7, roughness: 0.3 }));
      dish.position.set(0, 0.024, 0.015); dish.rotation.x = Math.PI / 4; satNode.add(dish);
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.012, 12), new THREE.MeshBasicMaterial({ color: sat.colorHex }));
      lens.position.set(0, -0.024, 0); satNode.add(lens);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(sat.sensor === 'VIIRS' ? 0.17 : 0.125, coneH, 28, 1, true), new THREE.MeshBasicMaterial({ color: sat.colorHex, transparent: true, opacity: 0.25, side: THREE.DoubleSide }));
      cone.position.y = -coneH / 2; satNode.add(cone);
      const labelEl = document.createElement('div'); labelEl.className = 'sat-floating-tag';
      labelEl.style.borderColor = sat.colorHex;
      labelEl.textContent = `${sat.id.toUpperCase().replace('_', '-')} (${sat.sensor}) ${sat.equatorCrossingLocal.split(' ')[0]}`;
      this.labelLayer.appendChild(labelEl); orbitPivot.add(satNode); this.earthGroup.add(orbitPivot);
      this.satMeshes.set(sat.id, { sat, idx, orbitPivot, satNode, altRadius, labelEl });
    });
  }
  _buildHotspotMeshes(THREE) {
    // 4-Satellite spherical hotspots (Anti-Semaphore Palette): Terra (#a855f7), Aqua (#00e5ff), Suomi-NPP (#ff2a85), NOAA-20 (#ffffff)
    this.hotspotSatMeshes = new Map();
    const satStyles = [
      { id: 'terra', radius: 0.0054, color: 0xa855f7 },
      { id: 'aqua', radius: 0.0051, color: 0x00e5ff },
      { id: 'suomi_npp', radius: 0.0043, color: 0xff2a85 },
      { id: 'noaa_20', radius: 0.0043, color: 0xffffff }
    ];
    satStyles.forEach(({ id, radius, color }) => {
      const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(radius, 14, 14), new THREE.MeshBasicMaterial({ color }), 35);
      this.hotspotSatMeshes.set(id, mesh);
      this.earthGroup.add(mesh);
    });
    this.aoiRingMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.92 });
    this.aoiRingMesh = new THREE.Group();
    this.earthGroup.add(this.aoiRingMesh);
  }
  _getSatForBinIndex(i) {
    const activeList = SATELLITE_FLEET.filter((s) => this.activeSatIds.has(s.id));
    if (!activeList.length) return SATELLITE_FLEET[0];
    return activeList[i % activeList.length];
  }
  _updateAoiRadarRing(biome, colorHex) {
    if (!this.aoiRingMesh || !window.THREE) return;
    const THREE = window.THREE;
    while (this.aoiRingMesh.children.length) { const ch = this.aoiRingMesh.children[0]; if (ch.geometry) ch.geometry.dispose(); this.aoiRingMesh.remove(ch); }
    this.aoiRingMat.color.set(colorHex || '#00e676');
    const cosLat = Math.max(0.25, Math.cos((biome.lat * Math.PI) / 180));
    [3.15, 1.35].forEach((degRad, idx) => {
      const pts = [];
      for (let i = 0; i <= 72; i++) {
        if (idx === 1 && i % 2 === 1) continue;
        const a = (i / 72) * Math.PI * 2;
        pts.push(this._latLonToVec3(THREE, biome.lat + Math.sin(a) * degRad, biome.lon + (Math.cos(a) * degRad) / cosLat, 1.0055));
      }
      this.aoiRingMesh.add(idx === 0 ? new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), this.aoiRingMat) : new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), this.aoiRingMat));
    });
    const tickPts = [];
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2;
      tickPts.push(this._latLonToVec3(THREE, biome.lat + Math.sin(a) * 2.65, biome.lon + (Math.cos(a) * 2.65) / cosLat, 1.0055), this._latLonToVec3(THREE, biome.lat + Math.sin(a) * 3.65, biome.lon + (Math.cos(a) * 3.65) / cosLat, 1.0055));
    }
    this.aoiRingMesh.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(tickPts), this.aoiRingMat));
  }
  _hideHoverCard() {
    this.activeHoverItem = null;
    if (this.hoverRingEl) this.hoverRingEl.classList.remove('ring-visible');
    if (this.hoverTooltipEl) this.hoverTooltipEl.classList.remove('tooltip-visible');
    if (this.container) this.container.style.cursor = this.isDragging ? 'grabbing' : 'grab';
  }
  _renderHoverCard(item, w, h) {
    if (!this.hoverTooltipEl || !this.hoverRingEl) return;
    const isEs = i18n.currentLang === 'es';
    const latStr = `${Math.abs(item.lat).toFixed(2)}° ${item.lat < 0 ? 'S' : 'N'}`;
    const lonStr = `${Math.abs(item.lon).toFixed(2)}° ${item.lon < 0 ? 'W' : 'E'}`;

    let nearDept = null, minDeptDist = 9999;
    this.sanLuisDeptNodes.forEach((dpt) => {
      const d = this._haversineKm(item.lat, item.lon, dpt.lat, dpt.lon);
      if (d < minDeptDist) { minDeptDist = d; nearDept = dpt; }
    });

    if (item.kind === 'hotspot') {
      const b = item.bin;
      const sat = item.sat || SATELLITE_FLEET[0];
      const accent = sat.colorHex;
      const satIcon = sat.id === 'terra' ? '🟣' : sat.id === 'aqua' ? '🔵' : sat.id === 'suomi_npp' ? '🌸' : '⚪';
      this.hoverRingEl.style.borderColor = accent;
      this.hoverRingEl.style.boxShadow = `0 0 14px ${accent}, inset 0 0 7px ${accent}`;
      this.hoverRingEl.style.left = `${item.sx}px`;
      this.hoverRingEl.style.top = `${item.sy}px`;
      this.hoverRingEl.classList.add('ring-visible');

      let nearLoc = null, minLocKm = 9999;
      this.sanLuisLocNodes.forEach((loc) => {
        const dKm = this._haversineKm(b.lat, b.lon, loc.lat, loc.lon);
        if (dKm < minLocKm) { minLocKm = dKm; nearLoc = loc; }
      });

      const biome = this.lastSnapshot && this.lastSnapshot.biome ? this.lastSnapshot.biome : null;
      const zScore = this.lastSnapshot && this.lastSnapshot.cellStats ? this.lastSnapshot.cellStats.zScore : 0;
      const refText = (nearLoc && minLocKm < 190)
        ? (isEs ? `A ${minLocKm.toFixed(1)} km de ${nearLoc.name} (${nearDept ? nearDept.labelEs : 'San Luis'})` : `${minLocKm.toFixed(1)} km from ${nearLoc.name}`)
        : (biome ? `${isEs ? biome.nameEs : biome.nameEn}` : 'AOI');

      const kgSec = (b.harmonizedFrp * 0.368).toFixed(2);
      const tonHr = ((b.harmonizedFrp * 0.368 * 3600) / 1000).toFixed(2);
      const pxModis = Math.max(1, b.countModis || 1);
      const pxViirs = Math.max(1, b.countViirs || 1);

      let lacesBg = 'rgba(6, 78, 59, 0.72)', lacesBorder = '#10b981', lacesColor = '#6ee7b7';
      let lacesLabel = isEs ? '🟢 LACES NOMINAL · Contención Estándar' : '🟢 LACES NOMINAL · Standard Containment';
      if ((minLocKm < 16) || b.harmonizedFrp >= 22 || zScore >= 2.0) {
        lacesBg = 'rgba(127, 29, 29, 0.82)'; lacesBorder = '#f43f5e'; lacesColor = '#fecdd3';
        lacesLabel = isEs ? '🔴 CRÍTICO · Alerta Interfaz Urbano-Forestal' : '🔴 CRITICAL · WUI Burnover Alert';
      } else if ((minLocKm < 32) || b.harmonizedFrp >= 11 || zScore >= 1.0) {
        lacesBg = 'rgba(120, 53, 15, 0.8)'; lacesBorder = '#f59e0b'; lacesColor = '#fde68a';
        lacesLabel = isEs ? '🟡 VIGÍA LACES · Monitoreo de Propagación' : '🟡 LACES WATCH · Spread Monitoring';
      }

      this.hoverTooltipEl.style.borderColor = accent;
      this.hoverTooltipEl.innerHTML = `
        <div class="htt-header">
          <span style="color:${accent}">${satIcon} ${isEs ? 'FOCO' : 'HOTSPOT'} ${sat.id.toUpperCase().replace('_', '-')} · ${sat.sensor}</span>
          <span class="htt-badge" style="background:rgba(15,23,42,0.9);border:1px solid ${accent};color:${accent}">Res. ${sat.resolutionM}m · ${sat.equatorCrossingLocal.split(' ')[0]}</span>
        </div>
        <div class="htt-sat-note" style="display:flex;align-items:center;gap:6px;font-size:0.62rem;background:rgba(15,23,42,0.85);border-left:3px solid ${accent};padding:3px 6px;margin:3px 0 6px 0;color:#e2e8f0;border-radius:0 4px 4px 0;">
          <span>🛰️</span>
          <span><strong>${isEs ? 'Color referente al satélite' : 'Color refers to satellite'}</strong> (${isEs ? 'NO es nivel de peligro' : 'NOT danger severity'})</span>
        </div>
        <div class="htt-row"><span>🛰️ ${isEs ? 'Órbita / Barrido' : 'Orbit / Swath'}:</span><strong>${sat.agency} · ${sat.altitudeKm} km (${sat.swathWidthKm} km)</strong></div>
        <div class="htt-row"><span>📍 ${isEs ? 'Referencia' : 'Reference'}:</span><strong>${refText}</strong></div>
        <div class="htt-row"><span>🌐 ${isEs ? 'Coordenadas' : 'Coords'}:</span><strong>${latStr}, ${lonStr}</strong></div>
        <div class="htt-row"><span>⚡ ${isEs ? 'Potencia (FRP Arm.)' : 'Harmonized FRP'}:</span><strong style="color:#38bdf8">${b.harmonizedFrp.toFixed(2)} MW</strong></div>
        <div class="htt-sub">MODIS: ${b.frpModis.toFixed(1)} MW (${pxModis} px) · VIIRS Esc.: ${b.viirsScaledFrp.toFixed(1)} MW (${pxViirs} px)</div>
        <div class="htt-row"><span>🌲 ${isEs ? 'Biomasa Seca (Wooster)' : 'Dry Biomass Rate'}:</span><strong style="color:#fbbf24">${kgSec} kg/s (${tonHr} t/h)</strong></div>
        <div class="htt-laces" style="background:${lacesBg};border:1px solid ${lacesBorder};color:${lacesColor}">${lacesLabel}</div>
      `;
    } else if (item.kind === 'locality') {
      const loc = item.loc;
      const accent = loc.isCapital ? '#facc15' : loc.tier === 1 ? '#22d3ee' : '#bae6fd';
      this.hoverRingEl.style.borderColor = accent;
      this.hoverRingEl.style.boxShadow = `0 0 12px ${accent}, inset 0 0 6px ${accent}`;
      this.hoverRingEl.style.left = `${item.sx}px`;
      this.hoverRingEl.style.top = `${item.sy}px`;
      this.hoverRingEl.classList.add('ring-visible');

      let minFireKm = 9999, nearBin = null;
      this.currentBins.slice(0, 35).forEach((b) => {
        const dKm = this._haversineKm(loc.lat, loc.lon, b.lat, b.lon);
        if (dKm < minFireKm) { minFireKm = dKm; nearBin = b; }
      });

      const roleText = loc.isCapital
        ? (isEs ? 'Capital Provincial' : 'Provincial Capital')
        : loc.tier === 1
          ? (isEs ? 'Cabecera / Centro Urbano' : 'Department Seat / Hub')
          : (isEs ? 'Localidad Serrana / Rural' : 'Municipality / Town');

      let wuiBg = 'rgba(6, 78, 59, 0.72)', wuiBorder = '#10b981', wuiColor = '#6ee7b7';
      let wuiText = isEs ? '🟢 Perímetro Urbano-Forestal Seguro' : '🟢 Safe WUI Perimeter';
      if (minFireKm < 16) {
        wuiBg = 'rgba(127, 29, 29, 0.82)'; wuiBorder = '#f43f5e'; wuiColor = '#fecdd3';
        wuiText = isEs ? '🔴 Alerta Temprana WUI · Foco Cercano' : '🔴 Early WUI Alert · Nearby Hotspot';
      } else if (minFireKm < 35) {
        wuiBg = 'rgba(120, 53, 15, 0.8)'; wuiBorder = '#f59e0b'; wuiColor = '#fde68a';
        wuiText = isEs ? '🟡 Vigía Preventiva · Defensa Civil / Brigadas' : '🟡 Preventive Watch · Civil Defense';
      }

      this.hoverTooltipEl.style.borderColor = accent;
      this.hoverTooltipEl.innerHTML = `
        <div class="htt-header">
          <span style="color:${accent}">${loc.isCapital ? '★' : '📍'} ${loc.name}</span>
          <span class="htt-badge" style="background:rgba(15,23,42,0.9);border:1px solid ${accent};color:${accent}">${nearDept ? nearDept.labelEs : 'San Luis'}</span>
        </div>
        <div class="htt-row"><span>🏛️ ${isEs ? 'Categoría' : 'Category'}:</span><strong>${roleText}</strong></div>
        <div class="htt-row"><span>🌐 ${isEs ? 'Coordenadas' : 'Coords'}:</span><strong>${latStr}, ${lonStr}</strong></div>
        <div class="htt-row"><span>🔥 ${isEs ? 'Foco más cercano' : 'Nearest Hotspot'}:</span><strong style="color:#fb923c">${nearBin ? `a ${minFireKm.toFixed(1)} km (${nearBin.harmonizedFrp.toFixed(1)} MW)` : 'N/A'}</strong></div>
        <div class="htt-laces" style="background:${wuiBg};border:1px solid ${wuiBorder};color:${wuiColor}">${wuiText}</div>
      `;
    }

    const cardW = Math.min(282, w - 16), cardH = 162;
    let tx = w < 540 ? (w - cardW) * 0.5 : item.sx + 16;
    let ty = w < 540 ? (item.sy > h * 0.52 ? 12 : Math.max(12, h - cardH - 52)) : item.sy - cardH * 0.5;
    if (tx + cardW > w - 10) tx = item.sx - cardW - 16;
    if (tx < 8) tx = 8;
    if (ty < 10) ty = 10;
    if (ty + cardH > h - 14) ty = Math.max(10, h - cardH - 14);
    this.hoverTooltipEl.style.left = `${Math.round(tx)}px`;
    this.hoverTooltipEl.style.top = `${Math.round(ty)}px`;
    this.hoverTooltipEl.classList.add('tooltip-visible');
  }
  _findNearestHoverItem(mx, my, maxRadiusPx = 18) {
    let bestItem = null, bestPxDist = maxRadiusPx;
    for (let i = 0; i < this.hoverScreenItems.length; i++) {
      const it = this.hoverScreenItems[i];
      const d = Math.hypot(it.sx - mx, it.sy - my);
      if (d < bestPxDist) { bestPxDist = d; bestItem = it; }
    }
    return bestItem;
  }
  _triggerDoubleTapFlight(clientX, clientY) {
    this.autoRotate = false;
    const rect = this.renderer ? this.renderer.domElement.getBoundingClientRect() : this.container.getBoundingClientRect();
    const ripple = document.createElement('div');
    ripple.className = 'earth-dblclick-ripple';
    ripple.style.left = `${clientX - rect.left}px`;
    ripple.style.top = `${clientY - rect.top}px`;
    this.container.appendChild(ripple);
    setTimeout(() => { if (ripple.parentNode) ripple.parentNode.removeChild(ripple); }, 850);

    const currentZ = this.camera ? this.camera.position.z : this.zoomTarget;
    const nextAlt = Math.max(0.045, (currentZ - 1.0) * 0.48);
    let nextZ = Math.max(1.045, 1.0 + nextAlt);
    let targetLat = null, targetLon = null, snappedName = null;

    if (this.activeHoverItem) {
      targetLat = this.activeHoverItem.lat;
      targetLon = this.activeHoverItem.lon;
      const satLabel = this.activeHoverItem.sat ? this.activeHoverItem.sat.id.toUpperCase().replace('_', '-') : 'SAT';
      snappedName = this.activeHoverItem.kind === 'locality' ? this.activeHoverItem.loc.name : `Foco ${satLabel} (${this.activeHoverItem.bin.harmonizedFrp.toFixed(1)} MW)`;
      nextZ = Math.min(nextZ, 1.075);
    } else if (this.camera && this.earthSphereMesh && window.THREE) {
      const THREE = window.THREE;
      const mouse = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
      const raycaster = new THREE.Raycaster(); raycaster.setFromCamera(mouse, this.camera);
      const hits = raycaster.intersectObject(this.earthSphereMesh, false);
      if (hits.length > 0) {
        const localPt = this.earthGroup.worldToLocal(hits[0].point.clone()).normalize();
        const phi = Math.acos(Math.max(-1, Math.min(1, localPt.y)));
        targetLat = 90 - (phi * 180) / Math.PI;
        let theta = Math.atan2(localPt.z, -localPt.x);
        if (theta < 0) theta += Math.PI * 2;
        targetLon = (theta * 180) / Math.PI - 180;

        if (currentZ < 1.65 && this.sanLuisLocNodes && this.sanLuisLocNodes.length > 0) {
          let bestLoc = null, bestDist = 0.28;
          this.sanLuisLocNodes.forEach((loc) => {
            const d = Math.hypot(loc.lat - targetLat, loc.lon - targetLon);
            if (d < bestDist) { bestDist = d; bestLoc = loc; }
          });
          if (bestLoc) {
            targetLat = bestLoc.lat; targetLon = bestLoc.lon;
            snappedName = bestLoc.name;
            nextZ = Math.min(nextZ, bestLoc.tier === 1 ? 1.085 : 1.062);
          } else if (this.sanLuisDeptNodes && this.sanLuisDeptNodes.length > 0) {
            let bestDept = null, bestDeptDist = 0.45;
            this.sanLuisDeptNodes.forEach((dpt) => {
              const d = Math.hypot(dpt.lat - targetLat, dpt.lon - targetLon);
              if (d < bestDeptDist) { bestDeptDist = d; bestDept = dpt; }
            });
            if (bestDept) {
              targetLat = bestDept.lat; targetLon = bestDept.lon;
              snappedName = bestDept.labelEs;
              nextZ = Math.min(nextZ, 1.14);
            }
          }
        }
      }
    }
    if (snappedName && this.zoomReadoutEl) {
      this.zoomReadoutEl.textContent = `✈️ ${snappedName}`;
    }
    this._startCameraFlight(targetLat, targetLon, nextZ, 1080);
  }
  _bindPointerControls() {
    this.pointerDownInfo = null;
    this.lastTapInfo = null;
    this.pinchStartDist = null;

    this.container.addEventListener('pointerdown', (e) => {
      if (e.target && e.target.closest && e.target.closest('.globe-zoom-controls')) return;
      this.isDragging = true;
      this.flightState = null;
      if (this.cameraVeilEl) this.cameraVeilEl.classList.remove('veil-active');
      this.prevMouse = { x: e.clientX, y: e.clientY };
      this.pointerDownInfo = { x: e.clientX, y: e.clientY, pointerType: e.pointerType || 'mouse', moved: false };
    });

    window.addEventListener('pointerup', (e) => {
      const down = this.pointerDownInfo;
      this.isDragging = false;
      this.pointerDownInfo = null;
      if (this.container && !this.activeHoverItem) this.container.style.cursor = 'grab';
      if (!down || !this.container) return;

      const moveDist = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      if (moveDist < 12 && !down.moved) {
        const rect = this.renderer ? this.renderer.domElement.getBoundingClientRect() : this.container.getBoundingClientRect();
        const mx = e.clientX - rect.left, my = e.clientY - rect.top;
        if (mx >= 0 && my >= 0 && mx <= rect.width && my <= rect.height) {
          const isTouch = down.pointerType === 'touch' || window.innerWidth < 960;
          const hitRadius = isTouch ? 32 : 20;
          const tappedItem = this._findNearestHoverItem(mx, my, hitRadius);
          const now = performance.now();

          if (isTouch && this.lastTapInfo && (now - this.lastTapInfo.time < 320) && Math.hypot(e.clientX - this.lastTapInfo.x, e.clientY - this.lastTapInfo.y) < 30) {
            this.lastTapInfo = null;
            if (tappedItem) this.activeHoverItem = tappedItem;
            this._triggerDoubleTapFlight(e.clientX, e.clientY);
            return;
          }
          this.lastTapInfo = { time: now, x: e.clientX, y: e.clientY };

          if (tappedItem) {
            this.activeHoverItem = tappedItem;
            this.isCardPinned = true;
            this._renderHoverCard(tappedItem, rect.width, rect.height);
          } else if (this.isCardPinned || isTouch) {
            this.isCardPinned = false;
            this._hideHoverCard();
          }
        }
      }
    });

    this.container.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'touch' || this.isCardPinned) return;
      this._hideHoverCard();
    });

    window.addEventListener('pointermove', (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.prevMouse.x, dy = e.clientY - this.prevMouse.y;
        if (this.pointerDownInfo && Math.hypot(e.clientX - this.pointerDownInfo.x, e.clientY - this.pointerDownInfo.y) > 9) {
          this.pointerDownInfo.moved = true;
          this.isCardPinned = false;
          this._hideHoverCard();
        }
        const alt = this.camera ? Math.max(0.035, this.camera.position.z - 0.985) : 2.25;
        const sens = 0.0042 * (alt / 2.25);
        this.rotationTarget.y += dx * sens;
        this.rotationTarget.x = Math.max(-1.25, Math.min(1.25, this.rotationTarget.x + dy * sens));
        this.prevMouse = { x: e.clientX, y: e.clientY };
        return;
      }
      if (e.pointerType === 'touch' || !this.container || !this.hoverScreenItems.length) return;
      if (e.target && e.target.closest && (e.target.closest('.floating-glass-panel') || e.target.closest('.globe-zoom-controls'))) {
        if (!this.isCardPinned) this._hideHoverCard();
        return;
      }
      const rect = this.renderer ? this.renderer.domElement.getBoundingClientRect() : this.container.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      if (mx < 0 || my < 0 || mx > rect.width || my > rect.height) {
        if (!this.isCardPinned) this._hideHoverCard();
        return;
      }
      const bestItem = this._findNearestHoverItem(mx, my, 18);
      if (bestItem) {
        this.activeHoverItem = bestItem;
        this.container.style.cursor = 'pointer';
        this._renderHoverCard(bestItem, rect.width, rect.height);
      } else if (this.activeHoverItem && !this.isCardPinned) {
        this._hideHoverCard();
      }
    });

    this.container.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length === 2) {
        this.isDragging = false;
        this.pinchStartDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      }
    }, { passive: true });

    this.container.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length === 2 && this.pinchStartDist) {
        e.preventDefault();
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        const delta = this.pinchStartDist - dist;
        this.pinchStartDist = dist;
        const alt = Math.max(0.04, this.zoomTarget - 1.0);
        this.zoomTarget = Math.max(1.045, Math.min(4.2, this.zoomTarget + delta * 0.0045 * alt));
      }
    }, { passive: false });

    this.container.addEventListener('touchend', () => { this.pinchStartDist = null; }, { passive: true });

    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.flightState = null;
      this.isCardPinned = false;
      this._hideHoverCard();
      if (this.cameraVeilEl) this.cameraVeilEl.classList.remove('veil-active');
      const alt = Math.max(0.04, this.zoomTarget - 1.0);
      this.zoomTarget = Math.max(1.045, Math.min(4.2, this.zoomTarget + e.deltaY * 0.00085 * alt));
    }, { passive: false });

    this.container.addEventListener('dblclick', (e) => {
      if (e.target && e.target.closest && e.target.closest('.globe-zoom-controls')) return;
      e.preventDefault();
      this._triggerDoubleTapFlight(e.clientX, e.clientY);
    });
  }
  setAutoRotate(enabled) { this.autoRotate = !!enabled; if (this.aoiRingMesh) this.aoiRingMesh.visible = !this.autoRotate; }
  _refreshHotspotScales(scaleMult = 1.0) {
    if (!this.hotspotSatMeshes || !this.hotspotSatMeshes.size || !window.THREE) return;
    const dummy = new window.THREE.Object3D(), zeroDummy = new window.THREE.Object3D();
    zeroDummy.scale.set(0, 0, 0); zeroDummy.updateMatrix();
    const maxFrp = Math.max(1, ...this.currentBins.map((b) => b.harmonizedFrp));
    for (let i = 0; i < 35; i++) {
      if (i < this.currentBins.length) {
        const b = this.currentBins[i], ratio = (0.65 + 0.65 * (b.harmonizedFrp / maxFrp)) * scaleMult;
        const targetSat = this._getSatForBinIndex(i);
        dummy.position.copy(this._latLonToVec3(window.THREE, b.lat, b.lon, 1.0025 + 0.0032 * scaleMult));
        dummy.scale.set(ratio, ratio, ratio); dummy.updateMatrix();
        this.hotspotSatMeshes.forEach((mesh, satId) => {
          mesh.setMatrixAt(i, satId === targetSat.id ? dummy.matrix : zeroDummy.matrix);
        });
      } else {
        this.hotspotSatMeshes.forEach((mesh) => mesh.setMatrixAt(i, zeroDummy.matrix));
      }
    }
    this.hotspotSatMeshes.forEach((mesh) => { mesh.instanceMatrix.needsUpdate = true; });
  }
  updateTelemetry(snapshot) {
    this.lastSnapshot = snapshot;
    this.activeSatIds = new Set(snapshot.activeSatellites.map((s) => s.id)); this.currentBins = snapshot.harmonizedGrid.bins || [];
    if (!this.autoRotate && this.lastBiomeId !== snapshot.biome.id) {
      const prevBiome = this.lastBiomeId;
      this.lastBiomeId = snapshot.biome.id;
      if (snapshot.biome.id === 'san_luis_serrano') {
        this._startCameraFlight(-33.72, -66.02, 1.135, 1350);
      } else {
        const nextZ = prevBiome === 'san_luis_serrano' && this.zoomTarget < 1.8 ? 2.65 : this.zoomTarget;
        this._startCameraFlight(snapshot.biome.lat, snapshot.biome.lon, nextZ, 1250);
      }
    }
    const statusColor = snapshot.cellStats && snapshot.cellStats.classification ? snapshot.cellStats.classification.colorHex : '#00e676';
    this._updateAoiRadarRing(snapshot.biome, statusColor);
    this._refreshHotspotScales(this.lastHotspotScale);
  }
  _animate() {
    requestAnimationFrame(() => this._animate()); if (this.isContextLost || !this.renderer) return;
    this.frameCount++; const now = performance.now();
    if (now - this.lastFpsCheck >= 500) {
      if (this.fpsElement) this.fpsElement.textContent = `${Math.min(60, Math.round((this.frameCount * 1000) / (now - this.lastFpsCheck)))} FPS`;
      this.frameCount = 0; this.lastFpsCheck = now;
    }
    const elapsed = (now - this.clockStart) * 0.001;

    if (this.flightState && !this.isDragging) {
      const rawT = Math.min(1, (now - this.flightState.startTime) / this.flightState.durationMs);
      const ease = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;
      const rotEase = 1 - Math.pow(1 - rawT, 3.2);
      this.earthGroup.rotation.y = this.flightState.startRy + (this.flightState.endRy - this.flightState.startRy) * rotEase;
      this.earthGroup.rotation.x = this.flightState.startRx + (this.flightState.endRx - this.flightState.startRx) * rotEase;
      const baseZ = this.flightState.startZ + (this.flightState.endZ - this.flightState.startZ) * ease;
      const arcBoost = Math.sin(rawT * Math.PI) * this.flightState.arcLift;
      this.camera.position.z = baseZ + arcBoost;
      if (rawT >= 1) {
        this.flightState = null;
        if (this.cameraVeilEl) this.cameraVeilEl.classList.remove('veil-active');
      }
    } else {
      this.camera.position.z += (this.zoomTarget - this.camera.position.z) * 0.12;
      if (this.autoRotate && !this.isDragging) this.rotationTarget.y += 0.0015;
      this.earthGroup.rotation.y += (this.rotationTarget.y - this.earthGroup.rotation.y) * 0.1;
      this.earthGroup.rotation.x += (this.rotationTarget.x - this.earthGroup.rotation.x) * 0.1;
    }
    const zDist = this.camera.position.z;
    this._updateLodTiles(zDist);
    if (this.cloudsMesh) { this.cloudsMesh.rotation.y += 0.00025; this.cloudsMesh.material.opacity = zDist < 1.9 ? 0.0 : 0.05; }
    const zoomFactor = Math.max(0, Math.min(1, (zDist - 1.35) / 1.75));
    if (this.bordersMat) this.bordersMat.opacity = 0.52 + 0.22 * zoomFactor;
    if (this.borderTexMat) this.borderTexMat.opacity = zDist < 1.75 ? 0.0 : 0.06 + 0.58 * zoomFactor;
    if (this.sanLuisBordersMat) this.sanLuisBordersMat.opacity = zDist < 2.2 ? 0.94 : 0.68;
    if (this.sanLuisShadowMat) this.sanLuisShadowMat.opacity = zDist < 2.2 ? 0.65 : 0.25;
    if (this.sanLuisMarkersGroup) {
      this.sanLuisMarkersGroup.visible = zDist < 1.32;
      const mScale = Math.max(0.22, Math.min(0.85, (zDist - 1.03) / 0.35));
      this.sanLuisLocNodes.forEach((loc) => { if (loc.mesh) loc.mesh.scale.set(mScale, mScale, mScale); });
    }
    const hsScale = Math.max(0.14, Math.min(1.0, (zDist - 1.04) / 1.1));
    if (Math.abs(hsScale - this.lastHotspotScale) > 0.02) {
      this.lastHotspotScale = hsScale;
      this._refreshHotspotScales(hsScale);
    }
    if (this.aoiRingMesh) this.aoiRingMesh.visible = !this.autoRotate && zDist > 1.48;
    if (this.aoiRingMat) this.aoiRingMat.opacity = 0.65 + 0.25 * Math.sin(elapsed * 3.2);
    const w = this.container.clientWidth || window.innerWidth, h = this.container.clientHeight || window.innerHeight, projVec = new window.THREE.Vector3();
    this.satMeshes.forEach(({ sat, orbitPivot, satNode, altRadius, labelEl }, id) => {
      const vis = this.activeSatIds.has(id) && zDist > 1.42; orbitPivot.visible = vis; labelEl.style.display = vis ? 'block' : 'none';
      if (vis) {
        const ang = elapsed * 0.35 + sat.phaseOffsetRad;
        satNode.position.set(Math.cos(ang) * altRadius, Math.sin(ang) * altRadius, 0); satNode.rotation.z = ang - Math.PI / 2;
        satNode.getWorldPosition(projVec); projVec.project(this.camera);
        labelEl.style.transform = `translate(${(projVec.x * 0.5 + 0.5) * w - 45}px, ${(-projVec.y * 0.5 + 0.5) * h - 26}px)`;
      }
    });
    this._updateCountryLabels(w, h, zDist, projVec); this.renderer.render(this.scene, this.camera);
  }
  _updateCountryLabels(w, h, zDist, projVec) {
    const showLabels = zDist < 3.0, isEs = i18n.currentLang === 'es', minSpan = zDist > 2.55 ? 12 : zDist > 2.15 ? 6.5 : zDist > 1.78 ? 3.2 : 0;
    let bestCountry = null, bestDot = -1; const candidates = [];
    this.earthGroup.updateMatrixWorld();

    const placedBoxes = [];
    const tryPlaceBox = (x, y, halfW, halfH, padX = 5, padY = 4) => {
      for (let i = 0; i < placedBoxes.length; i++) {
        const b = placedBoxes[i];
        if (Math.abs(x - b.x) < (halfW + b.w + padX) && Math.abs(y - b.y) < (halfH + b.h + padY)) return false;
      }
      placedBoxes.push({ x, y, w: halfW, h: halfH });
      return true;
    };

    // Only switch from province label ("San Luis") to internal departments when zoomed in close (zDist < 1.44)
    const showSanLuisDepts = zDist < 1.44;
    this.countryNodes.forEach((c) => {
      c.el.classList.remove('tag-visible', 'country-tag-focused');
      if (!showLabels) return;
      if (showSanLuisDepts && /san luis|argentina|chile/i.test(c.nameEs)) return;
      projVec.copy(c.localVec).applyMatrix4(this.earthGroup.matrixWorld); const camAlignment = projVec.z / 1.006;
      if (camAlignment > (zDist < 2.25 ? 0.58 : 0.72)) {
        projVec.project(this.camera);
        if (Math.abs(projVec.x) < 0.84 && Math.abs(projVec.y) < 0.84) {
          if (camAlignment > bestDot) { bestDot = camAlignment; bestCountry = c; }
          if (c.span >= minSpan || camAlignment > 0.96) candidates.push({ c, sx: (projVec.x * 0.5 + 0.5) * w, sy: (-projVec.y * 0.5 + 0.5) * h, score: c.span + camAlignment * 15 });
        }
      }
    });
    candidates.sort((a, b) => (a.c === bestCountry ? -1 : b.c === bestCountry ? 1 : b.score - a.score));
    candidates.forEach(({ c, sx, sy }) => {
      const labelStr = isEs ? c.nameEs : c.nameEn;
      const hw = Math.max(30, labelStr.length * 3.8), hh = 11;
      if (c !== bestCountry && !tryPlaceBox(sx, sy, hw, hh, 10, 6)) return;
      if (c === bestCountry) placedBoxes.push({ x: sx, y: sy, w: hw, h: hh });
      c.el.textContent = labelStr; c.el.style.left = `${sx}px`; c.el.style.top = `${sy}px`;
      c.el.classList.add('tag-visible');
    });

    // Progressive San Luis 9 Departments & 27 Localities with strict zero-overlap box placement & smooth Fade-In
    let sanLuisFocused = false;
    const showTier1Loc = zDist < 1.26, showTier2Loc = zDist < 1.135;

    // 1. Place Capital first when localities are active so ★ San Luis is always anchored cleanly
    this.sanLuisLocNodes.forEach((loc) => {
      loc.el.classList.remove('tag-visible');
      if (loc.mesh) loc.mesh.visible = showTier1Loc && (loc.tier === 1 || showTier2Loc);
    });

    if (showTier1Loc) {
      const cap = this.sanLuisLocNodes.find((l) => l.isCapital);
      if (cap) {
        projVec.copy(cap.localVec).applyMatrix4(this.earthGroup.matrixWorld);
        if (projVec.z > 0.82) {
          projVec.project(this.camera);
          if (Math.abs(projVec.x) < 0.92 && Math.abs(projVec.y) < 0.92) {
            const sx = (projVec.x * 0.5 + 0.5) * w, sy = (-projVec.y * 0.5 + 0.5) * h;
            if (tryPlaceBox(sx + 48, sy, 48, 9, 4, 3)) {
              cap.el.style.left = `${sx}px`; cap.el.style.top = `${sy}px`;
              cap.el.classList.add('tag-visible');
              sanLuisFocused = true;
            }
          }
        }
      }
    }

    // 2. Place the 9 Department names (without overlapping each other or Capital)
    this.sanLuisDeptNodes.forEach((d) => {
      d.el.classList.remove('tag-visible');
      if (!showSanLuisDepts) return;
      projVec.copy(d.localVec).applyMatrix4(this.earthGroup.matrixWorld);
      if (projVec.z > 0.80) {
        projVec.project(this.camera);
        if (Math.abs(projVec.x) < 0.92 && Math.abs(projVec.y) < 0.92) {
          const sx = (projVec.x * 0.5 + 0.5) * w, sy = (-projVec.y * 0.5 + 0.5) * h;
          const txt = isEs ? d.labelEs : d.labelEn;
          const hw = Math.max(34, txt.length * 3.1), hh = 9;
          if (tryPlaceBox(sx, sy, hw, hh, 5, 4)) {
            d.el.textContent = txt;
            d.el.style.left = `${sx}px`; d.el.style.top = `${sy}px`;
            d.el.classList.add('tag-visible');
            sanLuisFocused = true;
          }
        }
      }
    });

    // 3. Progressively reveal Tier 1 & Tier 2 localities as zoom deepens and space opens up
    if (showTier1Loc) {
      this.sanLuisLocNodes.forEach((loc) => {
        if (loc.isCapital || (loc.tier > 1 && !showTier2Loc)) return;
        projVec.copy(loc.localVec).applyMatrix4(this.earthGroup.matrixWorld);
        if (projVec.z > 0.82) {
          projVec.project(this.camera);
          if (Math.abs(projVec.x) < 0.92 && Math.abs(projVec.y) < 0.92) {
            const sx = (projVec.x * 0.5 + 0.5) * w, sy = (-projVec.y * 0.5 + 0.5) * h;
            const hw = Math.max(26, (loc.name.length + 2) * 2.85), hh = 8;
            if (tryPlaceBox(sx + hw + 5, sy, hw, hh, 4, 3)) {
              loc.el.style.left = `${sx}px`; loc.el.style.top = `${sy}px`;
              loc.el.classList.add('tag-visible');
            }
          }
        }
      });
    }

    // 4. Project active thermal hotspot circles & locality circles for interactive hover telemetry
    this.hoverScreenItems = [];
    if (window.THREE) {
      const THREE = window.THREE;
      const rHotspot = 1.0025 + 0.0032 * this.lastHotspotScale;
      const limit = Math.min(35, this.currentBins.length);
      for (let i = 0; i < limit; i++) {
        const b = this.currentBins[i];
        projVec.copy(this._latLonToVec3(THREE, b.lat, b.lon, rHotspot)).applyMatrix4(this.earthGroup.matrixWorld);
        if (projVec.z > 0.55) {
          projVec.project(this.camera);
          if (Math.abs(projVec.x) < 0.96 && Math.abs(projVec.y) < 0.96) {
            const targetSat = this._getSatForBinIndex(i);
            this.hoverScreenItems.push({
              kind: 'hotspot',
              bin: b,
              sat: targetSat,
              isModis: targetSat.sensor === 'MODIS',
              lat: b.lat,
              lon: b.lon,
              sx: (projVec.x * 0.5 + 0.5) * w,
              sy: (-projVec.y * 0.5 + 0.5) * h
            });
          }
        }
      }
      if (zDist < 1.32) {
        this.sanLuisLocNodes.forEach((loc) => {
          if (loc.mesh && !loc.mesh.visible) return;
          projVec.copy(loc.localVec).applyMatrix4(this.earthGroup.matrixWorld);
          if (projVec.z > 0.78) {
            projVec.project(this.camera);
            if (Math.abs(projVec.x) < 0.95 && Math.abs(projVec.y) < 0.95) {
              this.hoverScreenItems.push({
                kind: 'locality',
                loc,
                lat: loc.lat,
                lon: loc.lon,
                sx: (projVec.x * 0.5 + 0.5) * w,
                sy: (-projVec.y * 0.5 + 0.5) * h
              });
            }
          }
        });
      }
    }

    if (!this.flightState) {
      if (sanLuisFocused) {
        if (this.zoomReadoutEl) this.zoomReadoutEl.textContent = zDist < 1.14 ? '📍 San Luis · Dptos. y Localidades' : '📍 San Luis · 9 Departamentos';
      } else if (bestCountry) {
        bestCountry.el.classList.add('country-tag-focused');
        if (this.zoomReadoutEl) this.zoomReadoutEl.textContent = `📍 ${isEs ? bestCountry.nameEs : bestCountry.nameEn}`;
      } else if (this.zoomReadoutEl) {
        this.zoomReadoutEl.textContent = isEs ? '🌐 Doble Click / Rueda: Zoom' : '🌐 Double-Click / Scroll: Zoom';
      }
    }
  }
  dispose() { if (!this.scene) return; this.scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); if (this.renderer) this.renderer.dispose(); }
}
