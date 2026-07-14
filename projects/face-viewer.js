// AUDISP multi-sample face viewer — three.js. Pick a sample (own face, various expressions),
// toggle Coarse / Textured (albedo + normal map). Lazy-loads per sample.
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const mount = document.getElementById('face3d');
if (mount) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const status = document.getElementById('face3d-status');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);
  camera.position.set(0, 0.05, 3.2);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  mount.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.15); key.position.set(1.0, 1.2, 1.6); scene.add(key);
  const rim = new THREE.DirectionalLight(0x8fb4ff, 0.35); rim.position.set(-1.6, 0.4, -1.2); scene.add(rim);

  const greyMat = new THREE.MeshStandardMaterial({ color: 0xb9bec6, roughness: 0.72, metalness: 0.02 });
  const group = new THREE.Group();
  group.rotation.y = Math.PI; // 정면이 카메라를 향하도록
  scene.add(group);

  const objLoader = new OBJLoader();
  const texLoader = new THREE.TextureLoader();
  const cache = {};
  let mode = 'textured';
  let cur = null;

  const base = (n) => `/projects/assets/faces/${n}`;

  function apply(entry) {
    const mat = mode === 'textured' ? entry.texMat : greyMat;
    entry.obj.traverse((c) => { if (c.isMesh) c.material = mat; });
    group.clear(); group.add(entry.obj);
    if (status) status.textContent = '';
  }

  function loadSample(n) {
    cur = n;
    if (cache[n]) { apply(cache[n]); return; }
    if (status) status.textContent = '로딩 중…';
    const albedo = texLoader.load(`${base(n)}/albedo.png`);
    if ('colorSpace' in albedo) albedo.colorSpace = THREE.SRGBColorSpace;
    const nrm = texLoader.load(`${base(n)}/normals.png`);
    const texMat = new THREE.MeshStandardMaterial({
      map: albedo, normalMap: nrm, normalScale: new THREE.Vector2(1, 1), roughness: 0.68, metalness: 0.0,
    });
    objLoader.load(`${base(n)}/coarse.obj`,
      (o) => {
        o.traverse((c) => { if (c.isMesh) { c.geometry.deleteAttribute('normal'); c.geometry.computeVertexNormals(); } });
        cache[n] = { obj: o, texMat };
        if (cur === n) apply(cache[n]);
      },
      undefined,
      () => { if (status) status.textContent = '메시를 불러오지 못했습니다.'; });
  }

  // thumbnails
  const thumbs = document.querySelectorAll('.face-thumb');
  thumbs.forEach((el) => {
    el.addEventListener('click', () => {
      thumbs.forEach((x) => x.classList.remove('active'));
      el.classList.add('active');
      loadSample(el.getAttribute('data-sample'));
    });
  });

  // mode toggle
  const cb = document.getElementById('face-coarse-btn');
  const tb = document.getElementById('face-textured-btn');
  function setMode(m) {
    mode = m;
    if (cb) cb.classList.toggle('active', m === 'coarse');
    if (tb) tb.classList.toggle('active', m === 'textured');
    if (cur && cache[cur]) apply(cache[cur]);
  }
  if (cb) cb.addEventListener('click', () => setMode('coarse'));
  if (tb) tb.addEventListener('click', () => setMode('textured'));

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.enablePan = false; controls.minDistance = 1.9; controls.maxDistance = 6;
  controls.autoRotate = !reduce; controls.autoRotateSpeed = 1.1;

  function resize() { const w = mount.clientWidth, h = mount.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h || 1; camera.updateProjectionMatrix(); }
  window.addEventListener('resize', resize); resize();
  (function loop() { requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera); })();

  // default: sample 4, textured
  setMode('textured');
  const def = document.querySelector('.face-thumb[data-sample="4"]') || thumbs[0];
  if (def) { def.classList.add('active'); loadSample(def.getAttribute('data-sample')); }
}
