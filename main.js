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
  var els = document.querySelectorAll('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }
})();
