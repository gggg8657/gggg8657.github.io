// Minimal self-contained 3D molecule viewer (Canvas 2D, no dependencies).
// Reads window.SST14 = {atoms:[{e,x,y,z,n,r}...]}. Ball-and-stick, auto-rotate + drag.
(function () {
  var data = window.SST14;
  var canvas = document.getElementById('mol');
  if (!data || !canvas) return;
  var ctx = canvas.getContext('2d');
  var atoms = data.atoms;
  var CPK = { C: '#8b929c', N: '#4674ff', O: '#ff5555', S: '#e6b422' };
  var RAD = { C: 0.32, N: 0.32, O: 0.31, S: 0.40 };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- bonds by distance (heavy atoms); disulfide S-S allowed a bit longer ---
  var bonds = [];
  function d2(a, b) { var dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z; return dx * dx + dy * dy + dz * dz; }
  for (var i = 0; i < atoms.length; i++) {
    for (var j = i + 1; j < atoms.length; j++) {
      var ss = atoms[i].e === 'S' && atoms[j].e === 'S';
      var max = ss ? 2.4 : 1.85;
      if (d2(atoms[i], atoms[j]) < max * max) bonds.push([i, j, ss]);
    }
  }

  // --- fit scale ---
  var maxr = 1;
  for (var k = 0; k < atoms.length; k++) {
    var rr = Math.sqrt(atoms[k].x * atoms[k].x + atoms[k].y * atoms[k].y + atoms[k].z * atoms[k].z);
    if (rr > maxr) maxr = rr;
  }

  var rotY = 0.5, rotX = 0.25, spin = !reduce, W = 0, H = 0, dpr = 1;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    var cssW = canvas.clientWidth, cssH = canvas.clientHeight;
    W = cssW; H = cssH;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    var cx = W / 2, cy = H / 2;
    var scale = (Math.min(W, H) * 0.42) / maxr;
    var cosY = Math.cos(rotY), sinY = Math.sin(rotY), cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    var P = new Array(atoms.length);
    for (var i = 0; i < atoms.length; i++) {
      var a = atoms[i];
      var x1 = a.x * cosY - a.z * sinY, z1 = a.x * sinY + a.z * cosY;
      var y1 = a.y * cosX - z1 * sinX, z2 = a.y * sinX + z1 * cosX;
      P[i] = { sx: cx + x1 * scale, sy: cy - y1 * scale, z: z2, e: a.e };
    }
    var depth = function (z) { return (z + maxr) / (2 * maxr); }; // 0 far .. 1 near
    // bonds (draw far first via midpoint z)
    var border = getComputedStyle(canvas).getPropertyValue('--line') || '#ccc';
    bonds.slice().sort(function (b1, b2) { return (P[b1[0]].z + P[b1[1]].z) - (P[b2[0]].z + P[b2[1]].z); })
      .forEach(function (b) {
        var p = P[b[0]], q = P[b[1]];
        ctx.beginPath(); ctx.moveTo(p.sx, p.sy); ctx.lineTo(q.sx, q.sy);
        if (b[2]) { ctx.strokeStyle = '#e6b422'; ctx.lineWidth = 3.4; ctx.setLineDash([4, 3]); }
        else { ctx.strokeStyle = border.trim() || '#9aa4b0'; ctx.lineWidth = 2.6; ctx.setLineDash([]); }
        ctx.stroke();
      });
    ctx.setLineDash([]);
    // atoms (near last)
    var order = P.map(function (_, i) { return i; }).sort(function (a, b) { return P[a].z - P[b].z; });
    order.forEach(function (i) {
      var p = P[i], dp = depth(p.z);
      var r = (RAD[p.e] || 0.3) * scale * (0.7 + 0.5 * dp);
      ctx.beginPath(); ctx.arc(p.sx, p.sy, r, 0, 6.2832);
      ctx.fillStyle = CPK[p.e] || '#8b929c';
      ctx.globalAlpha = 0.55 + 0.45 * dp;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.stroke();
    });
  }

  function tick() { if (spin) { rotY += 0.008; } render(); requestAnimationFrame(tick); }

  // drag to rotate
  var dragging = false, lx = 0, ly = 0;
  function down(e) { dragging = true; spin = false; var t = e.touches ? e.touches[0] : e; lx = t.clientX; ly = t.clientY; }
  function move(e) {
    if (!dragging) return;
    var t = e.touches ? e.touches[0] : e;
    var dx = t.clientX - lx, dy = t.clientY - ly;
    if (e.touches) {
      if (Math.abs(dy) > Math.abs(dx)) { dragging = false; return; } // 세로 드래그 → 페이지 스크롤 허용
      rotY += dx * 0.01; lx = t.clientX; ly = t.clientY;
      if (e.cancelable) e.preventDefault();
    } else {
      rotY += dx * 0.01; rotX += dy * 0.01; lx = t.clientX; ly = t.clientY;
    }
  }
  function up() { dragging = false; }
  canvas.addEventListener('mousedown', down); window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
  canvas.addEventListener('touchstart', down, { passive: true }); canvas.addEventListener('touchmove', move, { passive: false }); canvas.addEventListener('touchend', up);
  window.addEventListener('resize', function () { resize(); if (reduce) render(); });
  if (window.ResizeObserver) new ResizeObserver(function () { resize(); if (reduce) render(); }).observe(canvas);

  resize();
  if (reduce) { render(); } else { requestAnimationFrame(tick); }
})();
