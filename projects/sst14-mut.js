// SST-14 agent mutation-search animation (illustrative). PUBLIC SST-14 only;
// mutations are random illustrations, NOT real candidate sequences.
(function () {
  const root = document.getElementById('sst14-mut');
  if (!root) return;
  const beadsEl = root.querySelector('.beads');
  const stageEl = root.querySelector('.mut-stage');
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
    const b = document.createElement('div'); b.className = 'bead' + (FIXED.has(i) ? ' fixed' : ''); b.dataset.cls = cls(a); b.textContent = a;
    const p = document.createElement('span'); p.className = 'pos'; p.textContent = String(i + 1);
    w.appendChild(b); w.appendChild(p); beadsEl.appendChild(w);
    return { w, b };
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
    const { w, b } = wraps[i];
    const old = seq[i];
    // Planner
    setStep('planner');
    if (agentEl) agentEl.textContent = 'Planner · ' + (i + 1) + '번 위치 선택';
    b.classList.add('active');
    setTimeout(() => {
      // Builder + callout
      setStep('builder');
      let na; do { na = POOL[rint(POOL.length)]; } while (na === old);
      seq[i] = na; b.textContent = na; b.dataset.cls = cls(na); b.classList.add('pulse');
      if (agentEl) agentEl.textContent = 'Builder · 변이 생성';
      if (callout) {
        callout.textContent = old + ' → ' + na + '  (' + NAME[old] + '→' + NAME[na] + ')';
        callout.style.left = (beadsEl.offsetLeft + w.offsetLeft + w.offsetWidth / 2) + 'px';
        callout.classList.add('show');
      }
      setTimeout(() => {
        // QCRanker
        setStep('qc');
        evald += 1;
        const ok = Math.random() > 0.4; if (ok) pass += 1;
        if (agentEl) agentEl.textContent = 'QCRanker · 게이트 ' + (ok ? '통과' : '탈락 → 재샘플');
        b.classList.add(ok ? 'pass' : 'fail');
        updMeta();
        setTimeout(() => {
          b.classList.remove('active', 'pulse', 'pass', 'fail');
          if (callout) callout.classList.remove('show');
          // 주기적으로 native로 리셋 (native 주변 탐색)
          if (evald % 8 === 0) {
            wraps.forEach((o, k) => { seq[k] = NATIVE[k]; o.b.textContent = NATIVE[k]; o.b.dataset.cls = cls(NATIVE[k]); });
            round += 1; updMeta();
            if (agentEl) agentEl.textContent = 'Reporter · 라운드 정리 → native 재출발';
          }
          setTimeout(step, 550);
        }, 750);
      }, 650);
    }, 650);
  }
  setTimeout(step, 700);
})();
