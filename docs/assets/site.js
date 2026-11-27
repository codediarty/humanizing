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
  function bandS(b) { return String(b || '').replace(/^AI 작성률\s*/, ''); }   // 2026.11.24 판정 이름이 'AI 작성률 높음'이라 한 번만
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
      if (fn) fn.textContent = demo.classList.contains('dm5') ? S.label : S.file;   // 2026.11.24 개편안 5절: 머리에 '논문 분석 예시'
      var cut = $('.dm5-cut', demo); if (cut) { cut.textContent = ''; cut.classList.remove('on'); }
      doc.innerHTML = S.doc; var blk = $('.ai-blk', doc), sents = $$('.s', doc);
      sents.forEach(function (x) { x.classList.add('pre'); });
      idle(mFrom, '검사 중'); idle(mTo, '변환 전'); setBtn(false);   // 2026.11.24 개편안 5절(예전: 대기)
      say('<span class="dot"></span>AI 작성률 검사 중');
      demo.classList.remove('scanning'); void demo.offsetWidth; demo.classList.add('scanning');
      sents.forEach(function (x, j) { later(function () { x.classList.remove('pre'); }, RM ? 0 : 260 + j * 230); });
      later(function () { count(mFrom, 0, S.before.rate, RM ? 1 : 900, S.before.band); say('<b class="bad">AI 작성률 ' + S.before.rate + '%</b>'); /* 2026.11.24 개편안 5절(예전: AI 작성률 92% · 부적합 · AI 패턴 문장 4개) */ }, RM ? 0 : 260 + sents.length * 230);
      later(function () { if (!hover) humanize(); }, RM ? 400 : 1400 + sents.length * 230 + 1600);
    }
    function humanize() {
      if (phase !== 1) return; phase = 2; stop();
      var S = D.samples[cur], xs = $$('.x', doc), n = xs.length, done = 0, blk = $('.ai-blk', doc);
      setBtn(true);
      say('<span class="spin"></span>AI 작성 패턴 처리 중 (<b>0</b>/' + n + ')');
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
        say('<b class="good">AI 작성률 ' + S.before.rate + '% → ' + S.after.rate + '%</b>');
        var cut2 = $('.dm5-cut', demo); if (cut2) { cut2.textContent = 'AI 작성률 ' + (S.before.rate - S.after.rate) + '%p 감소'; cut2.classList.add('on'); }   // 2026.11.24 개편안 5절 결과 중심
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
      pl.className = 'pill l ' + bandCls(S.before.band); pl.textContent = 'AI 작성률 ' + S.before.rate + '% · ' + bandS(S.before.band);
      pr.className = 'pill r ' + bandCls(S.after.band); pr.textContent = 'AI 작성률 ' + S.after.rate + '% · ' + bandS(S.after.band);
      if (ft) ft.innerHTML = '<span>AI 작성 의심 문장 <b>' + S.before.n + '개 → ' + S.after.n + '개</b></span><span>바꾼 곳 <b>' + S.changes + '곳</b></span><span>숫자 · 이름 · 인용 <b>그대로</b></span>';
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
        oB.textContent = P.name + ' 충전하기'; oB.href = '/#buy-' + P.id; oB.setAttribute('data-buy', P.id); oB.removeAttribute('target');   /* 2026.11.25 대표: 충전 창 먼저(예전: oB.href = P.link || '/pricing/' · 새 창) */
      } else {
        var k = Math.ceil(t / big.tok);
        oR.innerHTML = '긴 글이네요. <b>' + big.name + ' ' + k + '개</b>(' + (k * big.tok).toLocaleString('ko-KR') + '토큰)를 같은 코드에 충전하거나, 걸린 장만 휴머나이징하면 토큰을 아낄 수 있습니다.';
        oB.textContent = big.name + ' 충전하기'; oB.href = '/#buy-' + big.id; oB.setAttribute('data-buy', big.id); oB.removeAttribute('target');   /* 2026.11.25 대표: 충전 창 먼저 */
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

  /* 2026.11.24 대표 개편안 7 · 10절(한국휴머나이징만): 검사 도구 · 결과 · 충전/코드 창이 그리는 글을 이 사이트 용어로.
     엔진 화면(humanize.js)은 다섯 사이트가 같은 파일이라 손대지 않고, 그려진 글자만 바꿔 보임. 지우는 것 없음 */
  (function () {
    var TX = [['AI 작성률 무료 검사 중', 'AI 작성률 확인 중'], ['AI 작성률 무료 검사', 'AI 작성률 무료로 확인하기'], ['무료 검사 20만 자까지', '최대 200,000자 무료 검사'], ['가입 없이 무료 · 글과 파일은 저장하지 않습니다', '회원가입 없이 바로 결과를 확인하세요.'],   /* 2026.11.25 18:05 대표 문구(예전: 무료 AI 작성률 검사 · 회원가입 없이 무료 검사 · 파일 업로드) */
              ['토큰 코드 넣기', '토큰 코드 등록'], ['파일 올리기', '파일 첨부하기'], ['부적합', 'AI 작성률 높음'], ['글 넣기', '문서 입력'], ['내 글 인간화', '휴머나이징'], ['인간화 엔진', '휴머나이징 엔진']];
    var RE = new RegExp(TX.map(function (p) { return p[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|'));
    var MAP = {}; TX.forEach(function (p) { MAP[p[0]] = p[1]; });
    var RG = new RegExp(RE.source, 'g');
    function fix(node) {
      if (!node) return;
      if (node.nodeType === 3) { var v = node.nodeValue; if (v && RE.test(v)) node.nodeValue = v.replace(RG, function (m) { return MAP[m]; }); return; }
      if (node.nodeType !== 1 || /^(SCRIPT|STYLE|TEXTAREA)$/.test(node.nodeName)) return;
      ['placeholder', 'aria-label', 'title'].forEach(function (a) { var v = node.getAttribute && node.getAttribute(a); if (v && RE.test(v)) node.setAttribute(a, v.replace(RG, function (m) { return MAP[m]; })); });
      var w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null), t; while ((t = w.nextNode())) { if (t.parentNode && /^(SCRIPT|STYLE|TEXTAREA)$/.test(t.parentNode.nodeName)) continue; if (RE.test(t.nodeValue)) t.nodeValue = t.nodeValue.replace(RG, function (m) { return MAP[m]; }); }
    }
    var roots = ['#hz', '#hzBuy', '#hzCode', '.hz7-dlg'].map(function (q) { return Array.prototype.slice.call(document.querySelectorAll(q)); }).reduce(function (a, b) { return a.concat(b); }, []);
    if (!roots.length || !window.MutationObserver) return;
    roots.forEach(function (r) { fix(r); new MutationObserver(function (ms) { ms.forEach(function (m) { if (m.type === 'characterData') fix(m.target); else Array.prototype.forEach.call(m.addedNodes, fix); }); }).observe(r, { childList: true, subtree: true, characterData: true }); });
  })();
})();

/* 2026.11.25 대표 '충전하기 단추를 누르지 않아도 큰 칸 안 아무 데나 눌러도 들어가지게': 요금 칸(.pk)은 칸 안 어디를 눌러도
   그 칸의 충전 단추를 누른 것과 같게. 충전 창 안의 고르기 칸은 지금처럼 고르기만(창 · 폼 · label 안은 건드리지 않음) */
(function () {
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var card = t.closest('.pk'); if (!card) return;
    if (t.closest('a[href], button, input, label, select, textarea, summary, [role=button]')) return;   // 단추 · 링크는 원래대로
    if (card.closest('dialog, [role=dialog], form')) return;
    try { if (String(window.getSelection ? window.getSelection() : '').length) return; } catch (x) {}   // 글자를 끌어 고르는 중이면 그대로
    var go = card.querySelector('a.btn[data-pack], button[data-pack], a.btn[href]'); if (!go) return;
    e.preventDefault(); go.click();
  });
})();

/* ================================================================
 * 13.43 머리 '토큰 충전' 옆 남은 토큰 · 메일 단추 코드 먼저(2026.11.25 대표) · 안내 페이지용(am.js 와 같은 일)
 *  - '결제한 사람들 토큰 얼마 남았는지 가시성 좋게', 'AIMarker · 형제 · 카피휴먼 모두 토큰 충전 옆에 잔여 토큰',
 *    '뭐가 됐든 메일로 온 링크로 들어가게 되면 그 토큰으로 적용이 되어야지'
 *  - 주소에 코드(?pass=)가 있으면 어느 페이지든 그 코드를 이 브라우저 코드로 먼저 저장(글 검사 화면은 그 화면이 이어서 확인)
 *  - 이 브라우저에 토큰 코드(am_pass)가 있으면 어느 페이지에서나 '토큰 충전' 바로 옆에 '남은 토큰 N'. 코드가 없으면 넣지 않음
 *  - 마지막으로 본 값을 바로 보여 주고 서버(am.pass, 차감 없음)로 새로 읽음. 검사 · 휴머나이징 응답에 실린 남은 토큰으로도 바로 바뀜
 *  - 10토큰 미만은 붉은색. 누르면 '토큰 충전'과 같은 곳. 휴머나이징 흐름 · 엔진은 그대로(서버 응답을 읽기만 함)
 * ================================================================ */
(function () {
  'use strict';
  if (window.AM && typeof window.AM.call === 'function') return;   // 글 검사 화면(am.js 가 있는 쪽)은 am.js 가 맡음
  /* 안내 · 요금 페이지(am.js 없음): 남은 토큰만 읽는 작은 연결. 서버 크레딧 → 토큰(10크레딧 = 1토큰, am.js 와 같은 셈) */
  var API = window.HZ_API || 'https://script.google.com/macros/s/AKfycby6Mo_qORon9V0ZnMeN4xUFx-yzD1gOh5xBbyZJl25vBsHbF6aealbLYs3gWGqeMrsr7Q/exec';
  var AM = { root: '/', call: function (action, data, ms) {
    var ctl = 'AbortController' in window ? new AbortController() : null, t = ctl ? setTimeout(function () { ctl.abort(); }, ms || 20000) : 0;
    return fetch(API, { method: 'POST', body: JSON.stringify(Object.assign({ action: action, _o: location.hostname }, data || {})), signal: ctl ? ctl.signal : undefined, redirect: 'follow' })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (j && j.pass && j.pass.credit && typeof j.pass.cr === 'number') j.pass.cr = Math.round(j.pass.cr * 10 / 100 * 10) / 10; return j; })
      .finally(function () { if (t) clearTimeout(t); });
  } };
  var KEY = 'am_pass', LAST = 'am_tok_last', LOW = 10, el = null, got = 0, lastRef = 0, inflight = '', bad = {};
  var ICO = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.3-9.3M17 6l3 3M14 9l2 2"/></svg>';
  function sget(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function sput(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* 저장 없이 */ } }
  function norm(c) { return String(c || '').toUpperCase().replace(/[^0-9A-Z]/g, ''); }
  function fmtC(c) { return norm(c).replace(/(.{4})(?=.)/g, '$1-'); }
  function code() { var c = norm(sget(KEY)); return c.length === 16 ? c : ''; }
  function memo() { try { var o = JSON.parse(sget(LAST) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } }
  function memoGet(c) { var o = memo()[c.slice(-6)]; return o && typeof o.l === 'number' ? o.l : null; }
  function memoPut(c, l) {
    var o = memo(); o[c.slice(-6)] = { l: l, t: Date.now() };
    Object.keys(o).sort(function (a, b) { return (o[b].t || 0) - (o[a].t || 0); }).slice(5).forEach(function (k) { delete o[k]; });
    sput(LAST, JSON.stringify(o));
  }
  function fmt(x) { x = +x || 0; return x >= 100 ? Math.floor(x).toLocaleString('ko-KR') : (Math.round(x * 10) / 10).toLocaleString('ko-KR', { maximumFractionDigits: 1 }); }
  function full(x) { return (Math.round((+x || 0) * 10) / 10).toLocaleString('ko-KR', { maximumFractionDigits: 1 }); }

  /* 메일 단추 주소의 코드: 글 검사 화면이 아니면 여기서 저장하고 주소에서 지움(글 검사 화면은 그 화면이 같은 코드를 넣고 지움) */
  try {
    var q = new URLSearchParams(location.search), qc = norm(q.get('pass'));
    if (/^[2-9A-HJ-NP-Z]{16}$/.test(qc)) {
      sput(KEY, fmtC(qc));
      if (!document.getElementById('hzText')) { q.delete('pass'); var rest = q.toString(); history.replaceState(null, '', location.pathname + (rest ? '?' + rest : '') + location.hash); }
    }
  } catch (eQ) { /* 주소 그대로 */ }

  function host() { return document.querySelector('.k-hd-r') || document.querySelector('.hd .hd-r'); }
  function buyLink(h) { var a = [].slice.call(h.querySelectorAll('a')).filter(function (x) { return x !== el && /^\s*토큰 충전\s*$/.test(x.textContent || ''); }); return a[0] || null; }
  function paint(l) {
    var c = code(), h = host();
    if (!h) return;
    if (!c || bad[c]) { if (el && el.parentNode) el.parentNode.removeChild(el); el = null; document.documentElement.classList.remove('am-tok-on'); return; }
    if (l == null) l = memoGet(c);
    if (!el || !el.parentNode) {
      var a = buyLink(h);
      el = document.createElement('a'); el.className = 'am-tok';
      el.href = a ? a.getAttribute('href') : (AM.root || '/') + 'pricing/';
      if (a && a.parentNode === h) h.insertBefore(el, a.nextSibling); else h.insertBefore(el, h.querySelector('.k-menu-btn, .menu-btn, #menuBtn'));
    }
    el.classList.toggle('low', l != null && l < LOW); el.classList.toggle('wait', l == null);
    el.innerHTML = ICO + '<span class="am-tok-l"><span class="am-tok-p">남은 </span>토큰</span><b>' + (l != null ? fmt(l) : '<i class="am-tok-d"></i>') + '</b>';
    var t = '남은 토큰 ' + (l != null ? full(l) : '확인 중') + ' · 지금 쓰는 코드 끝 ' + c.slice(-4) + (l != null && l < LOW ? ' · 토큰이 얼마 남지 않았습니다. 눌러서 충전하세요.' : ' · 눌러서 충전');
    el.title = t; el.setAttribute('aria-label', t);
    document.documentElement.classList.add('am-tok-on');
  }
  /* 서버 응답을 지켜봄: 토큰 코드 상태(pass)가 실린 응답이면 그 코드의 남은 토큰을 기억하고, 지금 코드면 바로 칸을 바꿈 */
  var call0 = AM.call;
  AM.call = function (action, data) {
    var p = norm(data && data.pass), mine = p.length === 16 && action === 'am.pass';
    if (mine) inflight = p;
    return call0.apply(this, arguments).then(function (j) {
      if (mine && inflight === p) inflight = '';
      try {
        if (p.length === 16 && j && j.pass && typeof j.pass.cr === 'number') {
          if (j.pass.credit) { delete bad[p]; memoPut(p, j.pass.cr); got = Date.now(); } else bad[p] = 1;   // 예전 이용권(횟수제)은 토큰이 아니라 칸을 띄우지 않음
          if (p === code()) paint(j.pass.credit ? j.pass.cr : null); else setTimeout(function () { if (p === code()) paint(); }, 80);   // 새 코드를 넣는 중이면 저장된 뒤에
        } else if (p.length === 16 && j && j.ok === false && j.code === 'PASS') { bad[p] = 1; setTimeout(function () { paint(); }, 80); }
      } catch (e) { /* 칸만 못 바꿈 */ }
      return j;
    }, function (e) { if (mine && inflight === p) inflight = ''; throw e; });
  };
  function refresh() {
    var c = code(); paint();
    if (!c || inflight === c) return;
    lastRef = Date.now();
    AM.call('am.pass', { pass: fmtC(c) }, 20000).catch(function () { /* 다음에 */ });
  }
  function start() {
    paint();
    if (!code()) return;
    setTimeout(function () { if (inflight !== code() && Date.now() - got > 5000) refresh(); }, 900);   // 글 검사 화면은 그 화면이 먼저 읽으므로 겹치지 않게
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.addEventListener('storage', function (e) { if (e.key === KEY) { delete bad[code()]; refresh(); } });
  window.addEventListener('focus', function () { if (code() && Date.now() - lastRef > 30000 && Date.now() - got > 30000) refresh(); });
  AM.tokPaint = paint;
})();

/* 실시간 현황판 신호(2026.11.26 · 현황판 1.0.0): 들어옴 · 화면을 보는 동안 30초마다 머묾 · 나감.
   글 · 이름 · 메일 · 토큰 코드는 보내지 않음(이 브라우저의 무작위 번호 · 본 쪽 주소 · 들어온 사이트 이름만). 검색 로봇은 보내지 않음. 실패해도 화면에 영향 없음 */
(function () {
  try {
    if (window.__lvOn) return; window.__lvOn = 1;
    if (Date.now() < Date.UTC(2026, 10, 26, 15, 0)) return;   // 2026.11.27 00:00(한국)부터 셈(대표 11.27 결정, 개인정보처리방침 11.26 알림 · 처음엔 12.03)
    var U = "https://script.google.com/macros/s/AKfycbynqa4gSpMjYlnOHPH6xaM3d2vys7aVMJHLuxQL_9osna0026p-Z6uywH2d4d0fzUbK_w/exec";
    var d = document, l = location, nav = navigator, S = null;
    if (nav.webdriver || /bot|crawl|spider|slurp|lighthouse|headless|facebookexternalhit|yeti|daumoa/i.test(nav.userAgent || "")) return;
    var host = l.hostname.replace(/^www\./, "");
    if (!/\./.test(host) || /localhost|127\.0\.0\.1|github\.io$/.test(host)) return;
    try { S = window.localStorage; } catch (e0) { S = null; }
    var gt = function (k) { try { return S ? S.getItem(k) : null; } catch (e) { return null; } };
    var st = function (k, v) { try { if (S) S.setItem(k, v); } catch (e) { /* 무시 */ } };
    var v = gt("lv_id"), f = 0;
    if (!v) { v = (Math.random().toString(36).slice(2, 10) + Date.now().toString(36)).slice(0, 16); st("lv_id", v); f = 1; }
    var day = new Date(Date.now() + 324e5).toISOString().slice(0, 10), n = gt("lv_day") !== day ? 1 : 0;
    if (n) st("lv_day", day);
    var rf = ""; try { rf = d.referrer ? new URL(d.referrer).hostname.replace(/^www\./, "") : ""; } catch (e1) { rf = ""; }
    if (rf === host) rf = "";
    var send = function (t, x) {
      var q = U + "?a=h&t=" + t + "&s=" + encodeURIComponent(host) + "&v=" + v + "&p=" + encodeURIComponent(l.pathname.slice(0, 80)) + (x || "");
      try { if (nav.sendBeacon && nav.sendBeacon(q)) return; } catch (e2) { /* 아래로 */ }
      try { fetch(q, { method: "POST", mode: "no-cors", keepalive: true }); } catch (e3) { /* 무시 */ }
    };
    var c = 0, timer = 0, on = false;
    var beat = function () { if (d.visibilityState !== "visible") return; if (++c > 120) { clearInterval(timer); return; } send("h"); };
    var start = function () { if (on) return; on = true; send("v", "&n=" + n + "&f=" + f + "&r=" + encodeURIComponent(rf)); timer = setInterval(beat, 30000); };
    d.addEventListener("visibilitychange", function () { if (!on) return; send(d.visibilityState === "visible" ? "h" : "x"); });
    addEventListener("pagehide", function () { if (on) send("x"); });
    if (d.readyState === "complete") setTimeout(start, 600); else addEventListener("load", function () { setTimeout(start, 600); });
  } catch (e) { /* 신호 실패는 무시 */ }
})();
