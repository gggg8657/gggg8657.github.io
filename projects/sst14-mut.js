// SST-14 mutation-search animation (illustrative). Beads = residues; an agent
// picks a position and mutates it. Uses PUBLIC SST-14 only; mutations are random
// illustrations, NOT real candidate sequences.
(function () {
  const root = document.getElementById('sst14-mut');
  if (!root) return;
  const beadsEl = root.querySelector('.beads');
  const agentEl = root.querySelector('.mut-agent');
  const iterEl = root.querySelector('.mut-iter');
  if (!beadsEl) return;

  const NATIVE = 'AGCKNFFWKTFTSC'.split('');
  const FIXED = new Set([2, 13]); // Cys3, Cys14 disulfide — kept
  const POOL = 'ARNDQEGHILKMFPSTWYV'.split(''); // no Cys (avoid fake disulfides)
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function cls(a) {
    if (a === 'C') return 'cys';
    if ('KRH'.includes(a)) return 'pos';
    if ('DE'.includes(a)) return 'neg';
    if ('STNQY'.includes(a)) return 'pol';
    return 'hyd';
  }

  const seq = NATIVE.slice();
  const beads = seq.map((a, i) => {
    const b = document.createElement('div');
    b.className = 'bead' + (FIXED.has(i) ? ' fixed' : '');
    b.dataset.cls = cls(a);
    b.textContent = a;
    beadsEl.appendChild(b);
    return b;
  });

  if (reduce) { if (agentEl) agentEl.textContent = 'SST-14 native (설계 출발점)'; return; }

  let iter = 0;
  const rint = (n) => Math.floor(Math.random() * n);
  function pickPos() { let i; do { i = rint(14); } while (FIXED.has(i)); return i; }
  function setAgent(t) { if (agentEl) agentEl.textContent = t; }

  function step() {
    const i = pickPos();
    const b = beads[i];
    // 1) Planner: 위치 선택
    b.classList.add('active');
    setAgent('Planner · 변이 위치 선택 (' + (i + 1) + '번)');
    setTimeout(() => {
      // 2) Builder: 변이
      let na; do { na = POOL[rint(POOL.length)]; } while (na === seq[i]);
      seq[i] = na; b.textContent = na; b.dataset.cls = cls(na);
      b.classList.add('pulse');
      setAgent('Builder · 후보 생성 · 변이 적용');
      setTimeout(() => {
        // 3) QCRanker: 평가
        const pass = Math.random() > 0.4;
        setAgent('QCRanker · 게이트 ' + (pass ? '통과' : '탈락 → 재샘플'));
        b.classList.toggle('pass', pass);
        b.classList.toggle('fail', !pass);
        setTimeout(() => {
          b.classList.remove('active', 'pulse', 'pass', 'fail');
          iter += 1;
          if (iterEl) iterEl.textContent = 'iteration ' + iter;
          // 주기적으로 native로 리셋 (native 주변 탐색임을 표현)
          if (iter % 9 === 0) {
            beads.forEach((bd, k) => { seq[k] = NATIVE[k]; bd.textContent = NATIVE[k]; bd.dataset.cls = cls(NATIVE[k]); });
            setAgent('native SST-14로 리셋 · 다음 라운드');
          }
          setTimeout(step, 500);
        }, 700);
      }, 550);
    }, 550);
  }
  if (iterEl) iterEl.textContent = 'iteration 0';
  setTimeout(step, 600);
})();
