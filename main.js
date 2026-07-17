// Scroll reveal + theme toggle. Theme persists in localStorage, defaults to OS.
// ponytail: 저장된 테마를 body 끝 스크립트에서 적용 → OS와 반대로 고정 시 최초 1프레임 깜빡임.
//   거슬리면 각 <head>에 인라인 <script>로 data-theme 선적용으로 승격.
(function () {
  var root = document.documentElement;
  try { var saved = localStorage.getItem('theme'); if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved); } catch (e) {}

  function sysDark() { return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; }
  function current() { return root.getAttribute('data-theme') || (sysDark() ? 'dark' : 'light'); }

  var toggle = document.getElementById('theme-toggle');
  function sync() {
    if (!toggle) return;
    var dark = current() === 'dark';
    toggle.textContent = dark ? '☀' : '☾';           // ☀ / ☾
    toggle.setAttribute('aria-label', dark ? '라이트 모드로 전환' : '다크 모드로 전환');
  }
  sync();
  if (toggle) toggle.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    sync();
  });

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 히어로 지표 카운트업 — 숫자 앞부분만 애니메이션, 단위(만/%)·<small>은 보존
  document.querySelectorAll('.metric .v').forEach(function (v) {
    var node = v.firstChild;
    if (!node || node.nodeType !== 3) return;
    var m = node.nodeValue.trim().match(/^([\d.]+)(.*)$/);
    if (!m) return;
    var target = parseFloat(m[1]); if (isNaN(target)) return;
    var suffix = m[2], dec = (m[1].split('.')[1] || '').length;
    if (reduce) return;                                  // 정적: 원래 값 유지
    var t0 = null;
    function loop(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / 900, 1), e = 1 - Math.pow(1 - p, 3);
      node.nodeValue = (target * e).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  });

  // 스크롤 리빌 (+계단식 지연)
  var els = document.querySelectorAll('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var sibs = e.target.parentNode ? e.target.parentNode.children : [e.target];
        var idx = Array.prototype.indexOf.call(sibs, e.target);
        e.target.style.setProperty('--rd', ((idx % 6) * 55) + 'ms');
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  // 포인터 반응 — 카드 3D 틸트 + 스포트라이트 (마우스 기기에서만, 모션 축소 시 비활성)
  var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!reduce && fine) {
    document.querySelectorAll('.proj-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var mx = (e.clientX - r.left) / r.width, my = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', (mx * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (my * 100).toFixed(1) + '%');
        card.style.setProperty('--rx', ((mx - 0.5) * 7).toFixed(2) + 'deg');
        card.style.setProperty('--ry', (-(my - 0.5) * 7).toFixed(2) + 'deg');
      });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
      });
    });
  }
})();
