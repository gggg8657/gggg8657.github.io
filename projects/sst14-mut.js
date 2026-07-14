// SST-14 agent mutation-search animation (illustrative, slow & legible).
// PUBLIC SST-14 only; mutations are random illustrations, NOT real candidates.
(function () {
  const root = document.getElementById('sst14-mut');
  if (!root) return;
  const beadsEl = root.querySelector('.beads');
  const callout = root.querySelector('.mut-callout');
  const agentEl = root.querySelector('.mut-agent');
  const iterEl = root.querySelector('.mut-iter');
  const scoreEl = root.querySelector('.mut-score');
  const steps = {};
  root.querySelectorAll('.mut-step').forEach((s) => { steps[s.dataset.k] = s; });
  if (!beadsEl) return;

  const NATIVE = 'AGCKNFFWKTFTSC'.split('');
  const FIXED = new Set([2, 13]);
  const POOL = 'ARNDQEGHILKMFPSTWYV'.split('');
  const NAME = { A: 'Ala', R: 'Arg', N: 'Asn', D: 'Asp', C: 'Cys', Q: 'Gln', E: 'Glu', G: 'Gly', H: 'His', I: 'Ile', L: 'Leu', K: 'Lys', M: 'Met', F: 'Phe', P: 'Pro', S: 'Ser', T: 'Thr', W: 'Trp', Y: 'Tyr', V: 'Val' };
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cls = (a) => a === 'C' ? 'cys' : 'KRH'.includes(a) ? 'pos' : 'DE'.includes(a) ? 'neg' : 'STNQY'.includes(a) ? 'pol' : 'hyd';

  const seq = NATIVE.slice();
  const wraps = seq.map((a, i) => {
    const w = document.createElement('div'); w.className = 'bead-wrap';
    const b = document.createElement('div'); b.className = 'bead' + (FIXED.has(i) ? ' fixed' : ''); b.dataset.cls = cls(a);
    const aa = document.createElement('span'); aa.className = 'aa'; aa.textContent = a; b.appendChild(aa);
    const p = document.createElement('span'); p.className = 'pos'; p.textContent = String(i + 1);
    w.appendChild(b); w.appendChild(p); beadsEl.appendChild(w);
    return { w, b, aa };
  });

  if (reduce) { if (agentEl) agentEl.textContent = 'native SST-14 (설계 출발점)'; return; }

  const rint = (n) => Math.floor(Math.random() * n);
  const pickPos = () => { let i; do { i = rint(14); } while (FIXED.has(i)); return i; };
  const setStep = (k) => { for (const key in steps) steps[key].classList.toggle('on', key === k); };
  let round = 1, pass = 0, evald = 0;
  const updMeta = () => { if (iterEl) iterEl.textContent = '라운드 ' + round; if (scoreEl) scoreEl.textContent = '게이트 통과 ' + pass + ' / 평가 ' + evald; };
  updMeta();

  function step() {
    const i = pickPos();
    const { w, b, aa } = wraps[i];
    const old = seq[i];

    // 1) Planner — 위치 선택 (지목 + 떠오름)
    setStep('planner');
    if (agentEl) agentEl.textContent = 'Planner · ' + (i + 1) + '번 잔기 선택';
    b.classList.add('active'); w.classList.add('lift');

    setTimeout(() => {
      // 2) Builder — 변이 (모프)
      setStep('builder');
      if (agentEl) agentEl.textContent = 'Builder · 새 잔기로 변이';
      let na; do { na = POOL[rint(POOL.length)]; } while (na === old);
      b.classList.add('morph');
      if (callout) {
        callout.className = 'mut-callout';
        callout.textContent = old + ' → ' + na + '  ·  ' + NAME[old] + ' → ' + NAME[na];
        callout.style.left = (beadsEl.offsetLeft + w.offsetLeft + w.offsetWidth / 2) + 'px';
        // reflow then show
        void callout.offsetWidth; callout.classList.add('show');
      }
      setTimeout(() => { seq[i] = na; aa.textContent = na; b.dataset.cls = cls(na); b.classList.remove('morph'); }, 480);

      setTimeout(() => {
        // 3) QCRanker — 게이트 평가
        setStep('qc');
        evald += 1;
        const ok = Math.random() > 0.4; if (ok) pass += 1;
        b.classList.add(ok ? 'pass' : 'fail');
        if (agentEl) agentEl.textContent = 'QCRanker · 게이트 ' + (ok ? '통과' : '탈락') + ' → ' + (ok ? '보존' : '재샘플');
        if (callout) { callout.classList.add(ok ? 'ok' : 'no'); callout.textContent = old + ' → ' + na + '   ' + (ok ? '✓ 통과' : '✗ 탈락'); }
        updMeta();

        setTimeout(() => {
          // 4) 정리
          b.classList.remove('active', 'pass', 'fail'); w.classList.remove('lift');
          if (callout) callout.classList.remove('show', 'ok', 'no');
          if (evald % 8 === 0) {
            wraps.forEach((o, k) => { seq[k] = NATIVE[k]; o.aa.textContent = NATIVE[k]; o.b.dataset.cls = cls(NATIVE[k]); });
            round += 1; updMeta();
            setStep(''); if (agentEl) agentEl.textContent = 'Reporter · 라운드 정리 → native 재출발';
          }
          setTimeout(step, 1000);
        }, 1700);
      }, 1700);
    }, 1600);
  }
  setTimeout(step, 800);
})();
