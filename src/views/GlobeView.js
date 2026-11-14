/**
 * @file src/views/GlobeView.js
 * @description Fullscreen 3D Space & NASA Blue Marble Earth View with Starfield,
 * Cloud Sphere, Atmospheric Fresnel Glow, 4 Tilted Polar Orbital Rings, 3D Satellites
 * with floating HUD labels, Nadir Swath Cones, InstancedMesh hotspots, and .dispose().
 * @team AlgoXplorers (Argentina)
 * @license MIT
 */

import { SATELLITE_FLEET } from '../config/constants.js';

export class GlobeView {
  constructor(containerId, fpsElementId) {
    this.container = document.getElementById(containerId);
    this.fpsElement = document.getElementById(fpsElementId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.earthGroup = null;
    this.cloudsMesh = null;
    this.hotspotModisMesh = null;
    this.hotspotViirsMesh = null;
    this.satMeshes = new Map();
    this.activeSatIds = new Set(['terra', 'aqua', 'suomi_npp', 'noaa_20']);
    this.currentBins = [];
    this.clockStart = performance.now();
    this.frameCount = 0;
    this.lastFpsCheck = performance.now();
    this.isContextLost = false;
    this.isDragging = false;
    this.prevMouse = { x: 0, y: 0 };
    this.rotationTarget = { x: 0.22, y: -1.35 };
  }

  init() {
    if (!this.container || typeof window.THREE === 'undefined') return;
    this._initThreeScene();
    this._bindPointerControls();
    this._animate();
  }

  _createHighResProceduralEarth(THREE) {
    const c = document.createElement('canvas');
    c.width = 2048;
    c.height = 1024;
    const ctx = c.getContext('2d');
    const ocean = ctx.createLinearGradient(0, 0, 0, 1024);
    ocean.addColorStop(0, '#04122c');
    ocean.addColorStop(0.5, '#092c66');
    ocean.addColorStop(1, '#04122c');
    ctx.fillStyle = ocean;
    ctx.fillRect(0, 0, 2048, 1024);

    const drawLand = (pts, fill, stroke) => {
      ctx.beginPath();
      pts.forEach(([x, y], idx) => (idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
    };
    drawLand([[320,160],[540,140],[620,270],[540,390],[490,460],[430,410],[350,280]], '#2d5a3c', '#52796f');
    drawLand([[520,470],[660,520],[710,630],[640,810],[560,890],[530,740],[495,570]], '#1f4e3d', '#40916c');
    drawLand([[940,340],[1140,360],[1210,540],[1120,770],[1010,760],[960,560],[890,450]], '#4a5d3f', '#748cab');
    drawLand([[950,170],[1350,140],[1680,220],[1620,420],[1320,440],[1120,330],[960,290]], '#2b4c3f', '#52796f');
    drawLand([[1520,620],[1710,610],[1740,760],[1560,780]], '#5c4d3c', '#8d6e63');
    return new THREE.CanvasTexture(c);
  }

  _initThreeScene() {
    const THREE = window.THREE;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 1000);
    this.camera.position.set(0, 0, w < 768 ? 3.85 : 3.25);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(w, h);
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    this.labelLayer = document.createElement('div');
    this.labelLayer.className = 'sat-labels-overlay';
    this.container.appendChild(this.labelLayer);

    const domCanvas = this.renderer.domElement;
    domCanvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.isContextLost = true; });
    domCanvas.addEventListener('webglcontextrestored', () => { this.isContextLost = false; this.dispose(); this._initThreeScene(); });

    this._buildStarfield(THREE);
    this.earthGroup = new THREE.Group();
    this.scene.add(this.earthGroup);
    this.scene.add(new THREE.AmbientLight(0x90b4e8, 0.75));
    const sun = new THREE.DirectionalLight(0xffffff, 1.35);
    sun.position.set(4, 2, 5);
    this.scene.add(sun);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    const earthMat = new THREE.MeshPhongMaterial({
      map: this._createHighResProceduralEarth(THREE),
      specular: new THREE.Color(0x2b6cb0),
      shininess: 22
    });
    loader.load('https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg', (tex) => {
      earthMat.map = tex;
      earthMat.needsUpdate = true;
    });
    this.earthGroup.add(new THREE.Mesh(new THREE.SphereGeometry(1.0, 64, 64), earthMat));

    const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.22 });
    loader.load('https://unpkg.com/three-globe@2.31.0/example/img/earth-clouds.png', (cTex) => {
      cloudMat.map = cTex;
      cloudMat.alphaMap = cTex;
      cloudMat.opacity = 0.55;
      cloudMat.needsUpdate = true;
    });
    this.cloudsMesh = new THREE.Mesh(new THREE.SphereGeometry(1.012, 48, 48), cloudMat);
    this.earthGroup.add(this.cloudsMesh);

    const atmoMat = new THREE.MeshBasicMaterial({ color: 0x1d70ff, transparent: true, opacity: 0.18, side: THREE.BackSide });
    this.earthGroup.add(new THREE.Mesh(new THREE.SphereGeometry(1.055, 48, 48), atmoMat));

    this._buildOrbitsAndSatellites(THREE);
    this._buildHotspotMeshes(THREE);

    window.addEventListener('resize', () => {
      if (!this.renderer || !this.container) return;
      const nw = this.container.clientWidth || window.innerWidth;
      const nh = this.container.clientHeight || window.innerHeight;
      this.camera.aspect = nw / nh;
      this.camera.position.z = nw < 768 ? 3.85 : 3.25;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(nw, nh);
    });
  }

  _buildStarfield(THREE) {
    const starGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(1400 * 3);
    for (let i = 0; i < 1400 * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 45;
      pos[i + 1] = (Math.random() - 0.5) * 45;
      pos[i + 2] = -8 - Math.random() * 25;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x93c5fd, size: 0.045, transparent: true, opacity: 0.75 })));
  }

  _buildOrbitsAndSatellites(THREE) {
    const tilts = [
      { rx: 1.15, ry: 0.35, rz: 0.45 },
      { rx: 1.32, ry: -0.42, rz: -0.35 },
      { rx: 1.48, ry: 0.18, rz: 0.62 },
      { rx: 1.22, ry: -0.25, rz: -0.55 }
    ];
    SATELLITE_FLEET.forEach((sat, idx) => {
      const orbitPivot = new THREE.Group();
      const t = tilts[idx % tilts.length];
      orbitPivot.rotation.set(t.rx, t.ry, t.rz);
      const altRadius = sat.sensor === 'VIIRS' ? 1.24 : 1.17;

      const pts = [];
      for (let i = 0; i <= 96; i++) {
        const a = (i / 96) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * altRadius, Math.sin(a) * altRadius, 0));
      }
      orbitPivot.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: sat.colorHex, transparent: true, opacity: 0.42 })));

      const satNode = new THREE.Group();
      satNode.add(new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.036, 0.065), new THREE.MeshBasicMaterial({ color: 0xe2e8f0 })));
      const coneH = altRadius - 1.0;
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(sat.sensor === 'VIIRS' ? 0.17 : 0.125, coneH, 28, 1, true),
        new THREE.MeshBasicMaterial({ color: sat.colorHex, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
      );
      cone.position.y = -coneH / 2;
      satNode.add(cone);

      const labelEl = document.createElement('div');
      labelEl.className = 'sat-floating-tag';
      labelEl.textContent = `${sat.id.toUpperCase().replace('_', '-')} (${sat.sensor}) ${sat.equatorCrossingLocal.split(' ')[0]}`;
      this.labelLayer.appendChild(labelEl);

      orbitPivot.add(satNode);
      this.earthGroup.add(orbitPivot);
      this.satMeshes.set(sat.id, { sat, orbitPivot, satNode, altRadius, labelEl });
    });
  }

  _buildHotspotMeshes(THREE) {
    this.hotspotModisMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.015, 10, 10), new THREE.MeshBasicMaterial({ color: 0xf97316 }), 35);
    this.hotspotViirsMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.013, 10, 10), new THREE.MeshBasicMaterial({ color: 0x06b6d4 }), 35);
    this.earthGroup.add(this.hotspotModisMesh, this.hotspotViirsMesh);
  }

  _bindPointerControls() {
    this.container.addEventListener('pointerdown', (e) => { this.isDragging = true; this.prevMouse = { x: e.clientX, y: e.clientY }; });
    window.addEventListener('pointerup', () => (this.isDragging = false));
    window.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      this.rotationTarget.y += (e.clientX - this.prevMouse.x) * 0.005;
      this.rotationTarget.x = Math.max(-1.1, Math.min(1.1, this.rotationTarget.x + (e.clientY - this.prevMouse.y) * 0.005));
      this.prevMouse = { x: e.clientX, y: e.clientY };
    });
  }

  updateTelemetry(snapshot) {
    this.activeSatIds = new Set(snapshot.activeSatellites.map((s) => s.id));
    this.currentBins = snapshot.harmonizedGrid.bins || [];
    this.rotationTarget.y = ((-snapshot.biome.lon - 65) * Math.PI) / 180;
    this.rotationTarget.x = Math.max(-0.6, Math.min(0.6, (-snapshot.biome.lat * 0.45 * Math.PI) / 180));

    if (this.hotspotModisMesh && window.THREE) {
      const dummy = new window.THREE.Object3D();
      for (let i = 0; i < 35; i++) {
        if (i < this.currentBins.length) {
          const b = this.currentBins[i];
          const phi = ((90 - b.lat) * Math.PI) / 180;
          const theta = ((b.lon + 180) * Math.PI) / 180;
          dummy.position.set(-1.014 * Math.sin(phi) * Math.cos(theta), 1.014 * Math.cos(phi), 1.014 * Math.sin(phi) * Math.sin(theta));
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          const targetMesh = i % 2 === 0 ? this.hotspotModisMesh : this.hotspotViirsMesh;
          const otherMesh = i % 2 === 0 ? this.hotspotViirsMesh : this.hotspotModisMesh;
          targetMesh.setMatrixAt(i, dummy.matrix);
          dummy.scale.set(0, 0, 0);
          dummy.updateMatrix();
          otherMesh.setMatrixAt(i, dummy.matrix);
        } else {
          dummy.scale.set(0, 0, 0);
          dummy.updateMatrix();
          this.hotspotModisMesh.setMatrixAt(i, dummy.matrix);
          this.hotspotViirsMesh.setMatrixAt(i, dummy.matrix);
        }
      }
      this.hotspotModisMesh.instanceMatrix.needsUpdate = true;
      this.hotspotViirsMesh.instanceMatrix.needsUpdate = true;
    }
  }

  _animate() {
    requestAnimationFrame(() => this._animate());
    if (this.isContextLost || !this.renderer) return;
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsCheck >= 500) {
      const fps = Math.min(60, Math.round((this.frameCount * 1000) / (now - this.lastFpsCheck)));
      if (this.fpsElement) this.fpsElement.textContent = `${fps} FPS`;
      this.frameCount = 0;
      this.lastFpsCheck = now;
    }
    const elapsed = (now - this.clockStart) * 0.001;
    if (!this.isDragging) this.rotationTarget.y += 0.0005;
    this.earthGroup.rotation.y += (this.rotationTarget.y - this.earthGroup.rotation.y) * 0.07;
    this.earthGroup.rotation.x += (this.rotationTarget.x - this.earthGroup.rotation.x) * 0.07;
    if (this.cloudsMesh) this.cloudsMesh.rotation.y += 0.0003;

    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    const projVec = new window.THREE.Vector3();
    this.satMeshes.forEach(({ sat, orbitPivot, satNode, altRadius, labelEl }, id) => {
      const vis = this.activeSatIds.has(id);
      orbitPivot.visible = vis;
      labelEl.style.display = vis ? 'block' : 'none';
      if (vis) {
        const ang = elapsed * 0.35 + sat.phaseOffsetRad;
        satNode.position.set(Math.cos(ang) * altRadius, Math.sin(ang) * altRadius, 0);
        satNode.rotation.z = ang - Math.PI / 2;
        satNode.getWorldPosition(projVec);
        projVec.project(this.camera);
        labelEl.style.transform = `translate(${(projVec.x * 0.5 + 0.5) * w - 45}px, ${(-projVec.y * 0.5 + 0.5) * h - 26}px)`;
      }
    });
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    if (!this.scene) return;
    this.scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    if (this.renderer) this.renderer.dispose();
  }
}
