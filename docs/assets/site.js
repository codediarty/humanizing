/* 한국휴머나이징 사이트 동작 1.0 (2026.11.21): 머리글 · 모바일 메뉴 · 예시 화면(전 · 후) · 비교 탭 · 토큰 계산기 · 나타남 · 아래 고정 단추 */
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 머리글 그림자 · 모바일 메뉴 */
  var hd = $('#hd');
  function onScroll() { if (hd) hd.classList.toggle('on', window.scrollY > 6); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var mb = $('#menuBtn'), mn = $('#mnav');
  if (mb && mn) mb.addEventListener('click', function () { var on = !mn.classList.contains('open'); mn.classList.toggle('open', on); mb.setAttribute('aria-expanded', on ? 'true' : 'false'); });
  if (mn) mn.addEventListener('click', function (e) { if (e.target.closest('a')) { mn.classList.remove('open'); if (mb) mb.setAttribute('aria-expanded', 'false'); } });

  /* 도구로 가는 단추: 같은 페이지에 도구가 있으면 그리로 내려가 글 칸에 커서 */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-tool]'); if (!a) return;
    var t = document.getElementById('tool'); if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
    setTimeout(function () { var ta = document.getElementById('hzText'); if (ta) try { ta.focus({ preventScroll: true }); } catch (x) { ta.focus(); } }, RM ? 0 : 450);
  });

  /* 예시 데이터 */
  var D = null; try { D = JSON.parse(($('#hzDemoData') || {}).textContent || 'null'); } catch (e) { D = null; }
  function bandCls(b) { return /안전/.test(b) ? 'good' : 'bad'; }
  function meter(el, rate, band, wait) {
    if (!el) return;
    el.className = 'dm ' + (wait ? 'wait ' : '') + bandCls(band);
    $('b', el).innerHTML = (wait ? '–' : rate + '<small style="font-size:18px">%</small>') + ' <em>' + band + '</em>';
    var bar = $('.dm-bar i', el); if (bar) bar.style.width = (wait ? 0 : Math.max(3, rate)) + '%';
  }

  /* 첫 화면 예시: ① 검사 스캔(보라색 AI 문장 · 문장별 AI 점수) → ② 휴머나이징(바뀔 말이 한 곳씩 지워지고 사람 말로 바뀜, 초록) → ③ AI 작성률 뚝 → 다음 글 */
  var demo = $('#demo');
  if (demo && D && D.samples && D.samples.length) {
    var doc = $('.demo-doc', demo), mFrom = $('.dm.from', demo), mTo = $('.dm.to', demo), fn = $('.demo-bar .fn span', demo), st = $('.demo-state', demo), btn = $('[data-demo-run]', demo);
    var cur = 0, timers = [], phase = 0, hover = false;
    function later(f, ms) { timers.push(setTimeout(f, ms)); }
    function stop() { timers.forEach(clearTimeout); timers = []; }
    function count(el, from, to, ms, band) {
      var b = $('b', el), t0 = performance.now(), bar = $('.dm-bar i', el);
      el.className = 'dm ' + (el.classList.contains('to') ? 'to ' : 'from ') + bandCls(band);
      function f(now) {
        var k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3), v = Math.round(from + (to - from) * e);
        b.innerHTML = v + '<small style="font-size:18px">%</small> <em>' + (k < 1 ? '측정 중' : band) + '</em>';
        if (bar) bar.style.width = Math.max(3, v) + '%';
        if (k < 1) requestAnimationFrame(f);
      }
      requestAnimationFrame(f);
    }
    function idle(el, txt) { el.className = 'dm ' + (el.classList.contains('to') ? 'to' : 'from') + ' wait'; $('b', el).innerHTML = '– <em>' + txt + '</em>'; var bar = $('.dm-bar i', el); if (bar) bar.style.width = '0'; }
    function say(t) { if (st) st.innerHTML = t; }
    function setBtn(on) { if (btn) btn.innerHTML = on ? btn.getAttribute('data-again') : btn.getAttribute('data-run'); }
    function play(i) {
      stop(); cur = i; phase = 1; var S = D.samples[i];
      $$('.demo-tabs button', demo).forEach(function (b, j) { b.setAttribute('aria-selected', j === i ? 'true' : 'false'); });
      if (fn) fn.textContent = S.file;
      doc.innerHTML = S.doc; var blk = $('.ai-blk', doc), sents = $$('.s', doc);
      sents.forEach(function (x) { x.classList.add('pre'); });
      idle(mFrom, '검사 중'); idle(mTo, '대기'); setBtn(false);
      say('<span class="dot"></span>AI 작성률 검사 중');
      demo.classList.remove('scanning'); void demo.offsetWidth; demo.classList.add('scanning');
      sents.forEach(function (x, j) { later(function () { x.classList.remove('pre'); }, RM ? 0 : 260 + j * 230); });
      later(function () { count(mFrom, 0, S.before.rate, RM ? 1 : 900, S.before.band); say('<b class="bad">AI 작성률 ' + S.before.rate + '% · ' + S.before.band + '</b> · AI 패턴 문장 ' + S.before.n + '개'); }, RM ? 0 : 260 + sents.length * 230);
      later(function () { if (!hover) humanize(); }, RM ? 400 : 1400 + sents.length * 230 + 1600);
    }
    function humanize() {
      if (phase !== 1) return; phase = 2; stop();
      var S = D.samples[cur], xs = $$('.x', doc), n = xs.length, done = 0, blk = $('.ai-blk', doc);
      setBtn(true);
      say('<span class="spin"></span>휴머나이징 중 · <b>0</b> / ' + n + '곳');
      var gap = RM ? 0 : Math.max(55, Math.min(150, 2600 / Math.max(1, n)));
      xs.forEach(function (x, j) {
        later(function () { x.classList.add('del'); }, j * gap);
        later(function () {
          x.textContent = x.getAttribute('data-n') || ''; x.classList.remove('del'); x.classList.add('ins'); done++;
          var b = st && st.querySelector('b'); if (b) b.textContent = done;
          var s = x.closest('.s'); if (s && !$('.x:not(.ins)', s)) { s.classList.remove('ai'); s.classList.add('hu'); var tg = $('.demo-tag', s); if (tg && S.after.n === 0) { tg.classList.add('ok'); tg.textContent = 'AI 미검출'; } }
        }, j * gap + (RM ? 0 : 260));
      });
      later(function () {
        $$('.s.ai', doc).forEach(function (s) { s.classList.remove('ai'); s.classList.add('hu'); });
        if (S.after.n === 0) $$('.demo-tag:not(.ok)', doc).forEach(function (tg) { tg.classList.add('ok'); tg.textContent = 'AI 미검출'; });
        if (blk) blk.classList.add('done');
        count(mTo, S.before.rate, S.after.rate, RM ? 1 : 1300, S.after.band);
        say('<b class="good">AI 작성률 ' + S.before.rate + '% → ' + S.after.rate + '% · ' + S.after.band + '</b> · 바꾼 곳 ' + n + '곳 · 뜻 · 숫자 그대로');
        phase = 3;
        later(function () { if (!hover) play((cur + 1) % D.samples.length); }, RM ? 8000 : 5600);
      }, n * gap + (RM ? 0 : 500));
    }
    $$('.demo-tabs button', demo).forEach(function (b, j) { b.addEventListener('click', function () { play(j); }); });
    if (btn) btn.addEventListener('click', function () { if (phase === 1) humanize(); else play(cur); });
    demo.addEventListener('mouseenter', function () { hover = true; });
    demo.addEventListener('mouseleave', function () { hover = false; if (phase === 3) later(function () { if (!hover) play((cur + 1) % D.samples.length); }, 2500); else if (phase === 1) later(function () { if (!hover) humanize(); }, 1500); });
    var started = false;
    function go() { if (!started) { started = true; play(0); } }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es, o) { es.forEach(function (x) { if (x.isIntersecting) { go(); o.disconnect(); } }); }, { threshold: .3 }).observe(demo); else go();
  }

  /* 큰 비교 화면(전 · 후 나란히) */
  var cmp = $('#cmp');
  if (cmp && D && D.samples) {
    var L = $('.cmp-t.l', cmp), R = $('.cmp-t.r', cmp), pl = $('.pill.l', cmp), pr = $('.pill.r', cmp), ft = $('.cmp-foot', cmp.parentNode);
    function pick(i) {
      var S = D.samples[i];
      $$('.cmp-tabs button').forEach(function (b, j) { b.setAttribute('aria-selected', j === i ? 'true' : 'false'); });
      L.innerHTML = S.src; R.innerHTML = S.dst;
      pl.className = 'pill l ' + bandCls(S.before.band); pl.textContent = 'AI 작성률 ' + S.before.rate + '% · ' + S.before.band;
      pr.className = 'pill r ' + bandCls(S.after.band); pr.textContent = 'AI 작성률 ' + S.after.rate + '% · ' + S.after.band;
      if (ft) ft.innerHTML = '<span>AI 패턴 문장 <b>' + S.before.n + '개 → ' + S.after.n + '개</b></span><span>바꾼 곳 <b>' + S.changes + '곳</b></span><span>숫자 · 이름 · 인용 <b>그대로</b></span>';
    }
    $$('.cmp-tabs button').forEach(function (b, j) { b.addEventListener('click', function () { pick(j); }); });
    pick(0);
  }


  /* 토큰 계산기(한국휴머나이징에서 새로 더함): 서버 단가와 같은 셈. 2026.11.22 AI 작성률 검사는 무료 · 휴머나이징 100자당 0.6토큰(최소 3, 2026.11.23 1.5배) */
  var cal = $('#calc');
  if (cal) {
    var CD = null; try { CD = JSON.parse(($('#calcData', cal) || {}).textContent || 'null'); } catch (e) { CD = null; }
    var rng = $('#calcN', cal), outN = $('#calcO', cal), cC = $('#calcC', cal), cH = $('#calcH', cal), cT = $('#calcT', cal);
    var oC = $('#calcCc', cal), oH = $('#calcHc', cal), oS = $('#calcS', cal), oR = $('#calcR', cal), oB = $('#calcB', cal);
    function fmt(n) { return (Math.round(n * 10) / 10).toLocaleString('ko-KR', { maximumFractionDigits: 1 }); }
    function cost(n, k) { var c = CD && CD.cost && CD.cost[k] || (k === 'check' ? [0, 0] : [6, 3]); var u = Math.ceil(n / 100); return Math.max(c[1], u * c[0] / 10); }
    function calcRun() {
      if (!CD) return;
      var n = +rng.value || 0, c = cC.checked ? cost(n, 'check') : 0, h = cH.checked ? cost(n, 'hum') * (cT.checked ? 2 : 1) : 0, t = c + h;
      outN.textContent = n.toLocaleString('ko-KR') + '자';
      oC.textContent = cC.checked ? (c ? fmt(c) + '토큰' : '무료') : '무료 검사만';
      oH.textContent = cH.checked ? fmt(h) + '토큰' + (cT.checked ? '(두 번)' : '') : '하지 않음';
      oS.textContent = fmt(t) + '토큰 · 약 ' + Math.round(t * 100).toLocaleString('ko-KR') + '원';
      var P = (CD.packs || []).filter(function (p) { return p.tok >= t; })[0], big = (CD.packs || [])[CD.packs.length - 1];
      if (!t) { oR.innerHTML = 'AI 작성률 검사는 가입 없이 <b>무료</b>입니다.'; oB.textContent = '무료로 검사하기'; oB.href = '/#tool'; oB.setAttribute('data-tool', ''); return; }
      oB.removeAttribute('data-tool');
      if (P) {
        oR.innerHTML = '<b>' + P.name + ' ' + P.tok.toLocaleString('ko-KR') + '토큰(' + P.price.toLocaleString('ko-KR') + '원)</b>이면 됩니다. 쓰고 남는 ' + fmt(P.tok - t) + '토큰은 기한 없이 그대로입니다.';
        oB.textContent = P.name + ' 충전하기'; oB.href = P.link || '/pricing/';
        if (P.link) { oB.target = '_blank'; oB.rel = 'noopener'; } else { oB.removeAttribute('target'); }
      } else {
        var k = Math.ceil(t / big.tok);
        oR.innerHTML = '긴 글이네요. <b>' + big.name + ' ' + k + '개</b>(' + (k * big.tok).toLocaleString('ko-KR') + '토큰)를 같은 코드에 충전하거나, 걸린 장만 휴머나이징하면 토큰을 아낄 수 있습니다.';
        oB.textContent = big.name + ' 충전하기'; oB.href = big.link || '/pricing/';
        if (big.link) { oB.target = '_blank'; oB.rel = 'noopener'; } else { oB.removeAttribute('target'); }
      }
    }
    $$('.calc-docs button', cal).forEach(function (b) {
      b.addEventListener('click', function () { $$('.calc-docs button', cal).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); rng.value = b.getAttribute('data-chars'); calcRun(); });
    });
    rng.addEventListener('input', function () { $$('.calc-docs button', cal).forEach(function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-chars') === rng.value ? 'true' : 'false'); }); calcRun(); });
    [cC, cH, cT].forEach(function (x) { x.addEventListener('change', calcRun); });
    calcRun();
  }

  /* 나타남 */
  window.HZ_SITE = 1;
  var rv = $$('.rv');
  if ('IntersectionObserver' in window && !RM && !navigator.webdriver) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  /* 아래 고정 단추(모바일): 도구가 화면에 없을 때만 */
  var mc = $('#mcta'), tool = document.getElementById('tool');
  if (mc) {
    var seen = !tool;
    if (tool && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es.forEach(function (x) { seen = !x.isIntersecting; mc.classList.toggle('on', seen && window.scrollY > 500); }); }).observe(tool);
    }
    window.addEventListener('scroll', function () { mc.classList.toggle('on', seen && window.scrollY > 500); }, { passive: true });
  }
})();
