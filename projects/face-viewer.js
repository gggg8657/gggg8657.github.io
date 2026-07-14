// AUDISP face mesh viewer — three.js. Coarse / Detail / Textured toggle, orbit, lighting.
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
  const tex = new THREE.TextureLoader().load('/projects/assets/face-albedo.png');
  if ('colorSpace' in tex) tex.colorSpace = THREE.SRGBColorSpace;
  const texMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.68, metalness: 0.0 });

  const group = new THREE.Group();
  group.rotation.y = Math.PI; // 정면이 카메라를 향하도록
  scene.add(group);

  const loader = new OBJLoader();
  let coarse = null, detail = null, want = 'coarse';

  function prep(o) { o.traverse((c) => { if (c.isMesh) { c.geometry.deleteAttribute('normal'); c.geometry.computeVertexNormals(); } }); return o; }
  function setMat(o, m) { o.traverse((c) => { if (c.isMesh) c.material = m; }); }
  function ready(mode) { return (mode === 'detail' ? detail : coarse); }
  function show(mode) {
    const o = ready(mode);
    if (!o) return;
    setMat(o, mode === 'textured' ? texMat : greyMat);
    group.clear(); group.add(o); want = mode;
    if (status) status.textContent = '';
  }

  loader.load('/projects/assets/face-coarse.obj',
    (o) => { coarse = prep(o); if (want !== 'detail') show(want); },
    undefined,
    () => { if (status) status.textContent = '메시를 불러오지 못했습니다.'; });
  loader.load('/projects/assets/face-detail.obj',
    (o) => { detail = prep(o); if (want === 'detail') show('detail'); });

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.enablePan = false; controls.minDistance = 1.9; controls.maxDistance = 6;
  controls.autoRotate = !reduce; controls.autoRotateSpeed = 1.1;

  function resize() { const w = mount.clientWidth, h = mount.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h || 1; camera.updateProjectionMatrix(); }
  window.addEventListener('resize', resize); resize();
  (function loop() { requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera); })();

  const btns = {
    coarse: document.getElementById('face-coarse-btn'),
    detail: document.getElementById('face-detail-btn'),
    textured: document.getElementById('face-textured-btn'),
  };
  function setActive(m) { for (const k in btns) { if (btns[k]) btns[k].classList.toggle('active', k === m); } }
  for (const m in btns) {
    if (!btns[m]) continue;
    btns[m].addEventListener('click', () => {
      setActive(m);
      if (ready(m)) show(m); else { want = m; if (status) status.textContent = '로딩 중…'; }
    });
  }
}
