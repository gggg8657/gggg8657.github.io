// AUDISP face mesh viewer — three.js (module). Coarse vs detail toggle, orbit, lighting.
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

  const mat = new THREE.MeshStandardMaterial({ color: 0xb9bec6, roughness: 0.72, metalness: 0.02 });
  const group = new THREE.Group(); scene.add(group);

  const loader = new OBJLoader();
  let coarse = null, detail = null, want = 'coarse';

  function prep(obj) {
    obj.traverse((c) => {
      if (c.isMesh) {
        c.geometry.deleteAttribute('normal');
        c.geometry.computeVertexNormals();
        c.material = mat;
      }
    });
    return obj;
  }
  function show(which) {
    const o = which === 'detail' ? detail : coarse;
    if (!o) return;
    group.clear(); group.add(o); want = which;
    if (status) status.textContent = '';
  }

  loader.load('/projects/assets/face-coarse.obj',
    (o) => { coarse = prep(o); if (want === 'coarse') show('coarse'); },
    undefined,
    () => { if (status) status.textContent = '메시를 불러오지 못했습니다.'; });
  loader.load('/projects/assets/face-detail.obj',
    (o) => { detail = prep(o); if (want === 'detail') show('detail'); });

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.enablePan = false; controls.minDistance = 1.9; controls.maxDistance = 6;
  controls.autoRotate = !reduce; controls.autoRotateSpeed = 1.1;

  function resize() {
    const w = mount.clientWidth, h = mount.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h || 1; camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize); resize();
  (function loop() { requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera); })();

  const cb = document.getElementById('face-coarse-btn');
  const db = document.getElementById('face-detail-btn');
  function setActive(w) { cb.classList.toggle('active', w === 'coarse'); db.classList.toggle('active', w === 'detail'); }
  cb.addEventListener('click', () => { setActive('coarse'); show('coarse'); });
  db.addEventListener('click', () => {
    setActive('detail');
    if (detail) show('detail'); else { want = 'detail'; if (status) status.textContent = '디테일 메시 로딩 중…'; }
  });
}
