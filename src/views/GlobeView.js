﻿/**
 * @file src/views/GlobeView.js
 * @description 3D NASA Blue Marble Earth View with Political Country Borders, Zoom-Adaptive
 * Country Labels, Geodesic AOI Tactical Radar Ring, Realistic 3D Satellites, and FRP Hotspots.
 * @team AlgoXplorers (Argentina)
 * @license MIT
 */
import { SATELLITE_FLEET, WORLD_GEOJSON_URLS, WORLD_COUNTRIES } from '../config/constants.js';
import { i18n } from '../config/i18n.js';

export class GlobeView {
  constructor(containerId, fpsElementId) {
    this.container = document.getElementById(containerId); this.fpsElement = document.getElementById(fpsElementId);
    this.scene = null; this.camera = null; this.renderer = null; this.earthGroup = null; this.cloudsMesh = null;
    this.bordersMat = null; this.borderTexMat = null;
    this.hotspotModisMesh = null; this.hotspotViirsMesh = null;
    this.aoiRingMesh = null; this.aoiRingMat = null; this.satMeshes = new Map(); this.countryNodes = [];
    this.activeSatIds = new Set(['terra', 'aqua', 'suomi_npp', 'noaa_20']);
    this.currentBins = []; this.clockStart = performance.now(); this.frameCount = 0; this.lastFpsCheck = performance.now();
    this.isContextLost = false; this.isDragging = false; this.prevMouse = { x: 0, y: 0 };
    this.rotationTarget = { x: 0.22, y: -1.35 }; this.zoomTarget = 3.25; this.zoomReadoutEl = null;
    this.lastBiomeId = null; this.autoRotate = false;
  }
  init() { if (this.container && window.THREE) { this._initThreeScene(); this._bindPointerControls(); this._animate(); } }
  _latLonToVec3(THREE, lat, lon, r = 1.004) {
    const phi = ((90 - lat) * Math.PI) / 180, theta = ((lon + 180) * Math.PI) / 180;
    return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
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
    this.scene = new THREE.Scene(); this.camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 1000);
    this.zoomTarget = w < 768 ? 3.85 : 3.25; this.camera.position.set(0, 0, this.zoomTarget);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const isMob = w < 960 || (window.innerWidth < 960); this.renderer.setPixelRatio(isMob ? Math.min(window.devicePixelRatio || 1, 1.5) : Math.min(window.devicePixelRatio || 1, 2.0)); this.renderer.setSize(w, h);
    this.container.innerHTML = ''; this.container.appendChild(this.renderer.domElement);
    this.labelLayer = document.createElement('div'); this.labelLayer.className = 'sat-labels-overlay';
    this.container.appendChild(this.labelLayer); this._buildZoomHud();
    const domCanvas = this.renderer.domElement;
    domCanvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.isContextLost = true; });
    domCanvas.addEventListener('webglcontextrestored', () => { this.isContextLost = false; this.dispose(); this._initThreeScene(); });
    this._buildStarfield(THREE); this.earthGroup = new THREE.Group(); this.scene.add(this.earthGroup);
    this.scene.add(new THREE.AmbientLight(0x90b4e8, 0.85));
    const sun = new THREE.DirectionalLight(0xffffff, 1.15); sun.position.set(4, 2, 5); this.scene.add(sun);
    const loader = new THREE.TextureLoader(); loader.setCrossOrigin('anonymous');
    const earthMat = new THREE.MeshPhongMaterial({ map: this._createHighResProceduralEarth(THREE), specular: new THREE.Color(0x1e3a5f), shininess: 12 });
    loader.load('https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg', (tex) => { earthMat.map = tex; earthMat.needsUpdate = true; });
    this.earthGroup.add(new THREE.Mesh(new THREE.SphereGeometry(1.0, 64, 64), earthMat));
    const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.16, depthWrite: false });
    loader.load('https://unpkg.com/three-globe@2.31.0/example/img/earth-clouds.png', (cTex) => { cloudMat.map = cTex; cloudMat.alphaMap = cTex; cloudMat.opacity = 0.35; cloudMat.needsUpdate = true; });
    this.cloudsMesh = new THREE.Mesh(new THREE.SphereGeometry(1.014, 48, 48), cloudMat); this.earthGroup.add(this.cloudsMesh);
    this.earthGroup.add(new THREE.Mesh(new THREE.SphereGeometry(1.055, 48, 48), new THREE.MeshBasicMaterial({ color: 0x1d70ff, transparent: true, opacity: 0.16, side: THREE.BackSide, depthWrite: false })));
    this._buildCountryBordersAndLabels(THREE); this._buildOrbitsAndSatellites(THREE); this._buildHotspotMeshes(THREE);
    window.addEventListener('resize', () => {
      if (!this.renderer || !this.container) return;
      const nw = this.container.clientWidth || window.innerWidth, nh = this.container.clientHeight || window.innerHeight;
      this.camera.aspect = nw / nh; this.camera.updateProjectionMatrix(); this.renderer.setSize(nw, nh);
    });
  }
  _buildZoomHud() {
    const hud = document.createElement('div'); hud.className = 'globe-zoom-controls';
    hud.innerHTML = `<button type="button" class="globe-zoom-btn" title="Zoom Out">−</button><span class="globe-zoom-readout">🌐 Rueda: Acercar País</span><button type="button" class="globe-zoom-btn" title="Zoom In">+</button>`;
    const [btnOut, btnIn] = hud.querySelectorAll('button'); this.zoomReadoutEl = hud.querySelector('.globe-zoom-readout');
    btnOut.addEventListener('click', () => { this.zoomTarget = Math.min(4.2, this.zoomTarget + 0.35); });
    btnIn.addEventListener('click', () => { this.zoomTarget = Math.max(1.38, this.zoomTarget - 0.35); });
    this.container.appendChild(hud);
  }
  _addCountryLabelNode(THREE, lat, lon, nameEs, nameEn, span = 6) {
    const normEs = /falkland|malvinas/i.test(nameEs) ? 'Islas Malvinas' : nameEs, normEn = /falkland|malvinas/i.test(nameEn) ? 'Islas Malvinas' : nameEn;
    if (this.countryNodes.some((c) => c.nameEn.toLowerCase() === normEn.toLowerCase() || (Math.abs(c.lat - lat) < 1.8 && Math.abs(c.lon - lon) < 1.8))) return;
    const el = document.createElement('div'); el.className = 'country-floating-tag'; el.style.display = 'none';
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
      this.borderTexMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(bc), transparent: true, opacity: 0.65, depthWrite: false });
      this.earthGroup.add(new THREE.Mesh(new THREE.SphereGeometry(1.001, 64, 64), this.borderTexMat));
      if (verts.length > 0) {
        const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
        this.earthGroup.add(new THREE.LineSegments(geo, this.bordersMat));
      }
    };
    fetch(WORLD_GEOJSON_URLS[0]).then((r) => r.json()).then(parseGeoJson).catch(() => fetch(WORLD_GEOJSON_URLS[1]).then((r) => r.json()).then(parseGeoJson).catch(() => {}));
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
      labelEl.textContent = `${sat.id.toUpperCase().replace('_', '-')} (${sat.sensor}) ${sat.equatorCrossingLocal.split(' ')[0]}`;
      this.labelLayer.appendChild(labelEl); orbitPivot.add(satNode); this.earthGroup.add(orbitPivot);
      this.satMeshes.set(sat.id, { sat, orbitPivot, satNode, altRadius, labelEl });
    });
  }
  _buildHotspotMeshes(THREE) {
    // Clean spherical hotspots without spikes: MODIS (1000m, orange #ff6d00) and VIIRS (375m, cyan #00e5ff)
    this.hotspotModisMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.0055, 14, 14), new THREE.MeshBasicMaterial({ color: 0xff6d00 }), 35);
    this.hotspotViirsMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.0042, 14, 14), new THREE.MeshBasicMaterial({ color: 0x00e5ff }), 35);
    this.aoiRingMat = new THREE.LineBasicMaterial({ color: 0x00e676, transparent: true, opacity: 0.92 });
    this.aoiRingMesh = new THREE.Group();
    this.earthGroup.add(this.hotspotModisMesh, this.hotspotViirsMesh, this.aoiRingMesh);
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
  _bindPointerControls() {
    this.container.addEventListener('pointerdown', (e) => { this.isDragging = true; this.prevMouse = { x: e.clientX, y: e.clientY }; }); window.addEventListener('pointerup', () => (this.isDragging = false));
    window.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const sens = 0.0045 * (this.camera ? this.camera.position.z / 3.25 : 1);
      this.rotationTarget.y += (e.clientX - this.prevMouse.x) * sens;
      this.rotationTarget.x = Math.max(-1.25, Math.min(1.25, this.rotationTarget.x + (e.clientY - this.prevMouse.y) * sens));
      this.prevMouse = { x: e.clientX, y: e.clientY };
    });
    this.container.addEventListener('wheel', (e) => { e.preventDefault(); this.zoomTarget = Math.max(1.38, Math.min(4.2, this.zoomTarget + e.deltaY * 0.0016)); }, { passive: false });
  }
  setAutoRotate(enabled) { this.autoRotate = !!enabled; if (this.aoiRingMesh) this.aoiRingMesh.visible = !this.autoRotate; }
  updateTelemetry(snapshot) {
    this.activeSatIds = new Set(snapshot.activeSatellites.map((s) => s.id)); this.currentBins = snapshot.harmonizedGrid.bins || [];
    if (!this.autoRotate && this.lastBiomeId !== snapshot.biome.id) {
      this.lastBiomeId = snapshot.biome.id; this.rotationTarget.y = ((-snapshot.biome.lon - 90) * Math.PI) / 180; this.rotationTarget.x = (snapshot.biome.lat * Math.PI) / 180;
    }
    const statusColor = snapshot.cellStats && snapshot.cellStats.classification ? snapshot.cellStats.classification.colorHex : '#00e676';
    this._updateAoiRadarRing(snapshot.biome, statusColor);
    if (this.hotspotModisMesh && window.THREE) {
      const dummy = new window.THREE.Object3D(), maxFrp = Math.max(1, ...this.currentBins.map((b) => b.harmonizedFrp));
      for (let i = 0; i < 35; i++) {
        if (i < this.currentBins.length) {
          const b = this.currentBins[i], ratio = 0.65 + 0.65 * (b.harmonizedFrp / maxFrp);
          dummy.position.copy(this._latLonToVec3(window.THREE, b.lat, b.lon, 1.005));
          dummy.scale.set(ratio, ratio, ratio); dummy.updateMatrix();
          (i % 2 === 0 ? this.hotspotModisMesh : this.hotspotViirsMesh).setMatrixAt(i, dummy.matrix);
          dummy.scale.set(0, 0, 0); dummy.updateMatrix();
          (i % 2 === 0 ? this.hotspotViirsMesh : this.hotspotModisMesh).setMatrixAt(i, dummy.matrix);
        } else {
          dummy.scale.set(0, 0, 0); dummy.updateMatrix();
          this.hotspotModisMesh.setMatrixAt(i, dummy.matrix); this.hotspotViirsMesh.setMatrixAt(i, dummy.matrix);
        }
      }
      this.hotspotModisMesh.instanceMatrix.needsUpdate = true; this.hotspotViirsMesh.instanceMatrix.needsUpdate = true;
    }
  }
  _animate() {
    requestAnimationFrame(() => this._animate()); if (this.isContextLost || !this.renderer) return;
    this.frameCount++; const now = performance.now();
    if (now - this.lastFpsCheck >= 500) {
      if (this.fpsElement) this.fpsElement.textContent = `${Math.min(60, Math.round((this.frameCount * 1000) / (now - this.lastFpsCheck)))} FPS`;
      this.frameCount = 0; this.lastFpsCheck = now;
    }
    const elapsed = (now - this.clockStart) * 0.001;
    this.camera.position.z += (this.zoomTarget - this.camera.position.z) * 0.12; const zDist = this.camera.position.z;
    if (this.autoRotate && !this.isDragging) this.rotationTarget.y += 0.0015;
    this.earthGroup.rotation.y += (this.rotationTarget.y - this.earthGroup.rotation.y) * 0.1;
    this.earthGroup.rotation.x += (this.rotationTarget.x - this.earthGroup.rotation.x) * 0.1;
    if (this.cloudsMesh) { this.cloudsMesh.rotation.y += 0.00025; this.cloudsMesh.material.opacity = zDist < 2.5 ? 0.10 : 0.32; }
    const zoomFactor = Math.max(0, Math.min(1, (zDist - 1.5) / 1.6));
    if (this.bordersMat) this.bordersMat.opacity = 0.52 + 0.22 * zoomFactor;
    if (this.borderTexMat) this.borderTexMat.opacity = 0.06 + 0.58 * zoomFactor;
    if (this.aoiRingMat) this.aoiRingMat.opacity = 0.65 + 0.3 * Math.sin(elapsed * 3.2);
    const w = this.container.clientWidth || window.innerWidth, h = this.container.clientHeight || window.innerHeight, projVec = new window.THREE.Vector3();
    this.satMeshes.forEach(({ sat, orbitPivot, satNode, altRadius, labelEl }, id) => {
      const vis = this.activeSatIds.has(id); orbitPivot.visible = vis; labelEl.style.display = vis ? 'block' : 'none';
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
    this.countryNodes.forEach((c) => {
      c.el.style.display = 'none'; c.el.classList.remove('country-tag-focused'); if (!showLabels) return;
      projVec.copy(c.localVec).applyMatrix4(this.earthGroup.matrixWorld); const camAlignment = projVec.z / 1.006;
      if (camAlignment > (zDist < 2.25 ? 0.58 : 0.72)) {
        projVec.project(this.camera);
        if (Math.abs(projVec.x) < 0.84 && Math.abs(projVec.y) < 0.84) {
          if (camAlignment > bestDot) { bestDot = camAlignment; bestCountry = c; }
          if (c.span >= minSpan || camAlignment > 0.96) candidates.push({ c, sx: (projVec.x * 0.5 + 0.5) * w, sy: (-projVec.y * 0.5 + 0.5) * h, score: c.span + camAlignment * 15 });
        }
      }
    });
    candidates.sort((a, b) => (a.c === bestCountry ? -1 : b.c === bestCountry ? 1 : b.score - a.score)); const placed = [], minDx = zDist > 2.1 ? 92 : 74, minDy = zDist > 2.1 ? 28 : 22;
    candidates.forEach(({ c, sx, sy }) => {
      if (c !== bestCountry && placed.some((p) => Math.abs(sx - p.x) < minDx && Math.abs(sy - p.y) < minDy)) return;
      placed.push({ x: sx, y: sy }); c.el.textContent = isEs ? c.nameEs : c.nameEn; c.el.style.display = 'block'; c.el.style.left = `${sx}px`; c.el.style.top = `${sy}px`;
    });
    if (bestCountry) { bestCountry.el.classList.add('country-tag-focused'); if (this.zoomReadoutEl) this.zoomReadoutEl.textContent = `📍 ${isEs ? bestCountry.nameEs : bestCountry.nameEn}`; } else if (this.zoomReadoutEl) { this.zoomReadoutEl.textContent = isEs ? '🌐 Rueda / + : Ver Países' : '🌐 Scroll / + : Show Countries'; }
  }
  dispose() { if (!this.scene) return; this.scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); if (this.renderer) this.renderer.dispose(); }
}
