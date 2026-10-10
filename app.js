/* C++ Тренажёр — интерфейс, редактор, офлайн-загрузка и запуск */
(() => {
  'use strict';
  const APP_VERSION = '1.0.0';
  const VENDOR_CACHE = 'cpp-trainer-vendor-v1';
  // Файлы компилятора (размеры в байтах нужны для полосы загрузки)
  const VENDOR = [
    ['vendor/clang/bundle.js', 'text/javascript', 253926],
    ['vendor/clang/llvm.core.wasm', 'application/wasm', 75532134],
    ['vendor/clang/llvm.core2.wasm', 'application/wasm', 37626],
    ['vendor/clang/llvm.core3.wasm', 'application/wasm', 5458],
    ['vendor/clang/llvm.core4.wasm', 'application/wasm', 787],
    ['vendor/clang/llvm-resources.tar', 'application/x-tar', 29665280],
    ['vendor/stdc++.h.pch', 'application/octet-stream', 19878556],
    ['vendor/stdc++.h', 'text/plain', 636],
    ['vendor/stub.o', 'application/octet-stream', 765],
  ];
  const TEST_TIMEOUT = 10000; // мс на весь прогон тестов
  const HEAD = '#include <bits/stdc++.h>\nusing namespace std;\n\n';

  const $ = (sel, el = document) => el.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const byId = Object.fromEntries(PROBLEMS.map((p, i) => [p.id, { ...p, idx: i }]));
  const levelOf = (id) => LEVELS.find((l) => l.id === id);

  // ───────── Хранилище (только на этом устройстве) ─────────
  const store = {
    get(k, d) { try { const v = localStorage.getItem('cppt:' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('cppt:' + k, JSON.stringify(v)); } catch { /* приватный режим */ } },
  };
  let progress = store.get('progress', {});
  const saveProgress = () => store.set('progress', progress);
  const getCode = (p) => store.get('code:' + p.id, null) ?? starterOf(p);
  const setCode = (p, code) => store.set('code:' + p.id, code);
  const starterOf = (p) => HEAD + (p.pre ? p.pre + '\n' : '') + p.starter + '\n';
  const solutionOf = (p) => HEAD + (p.pre ? p.pre + '\n' : '') + p.sol + '\n';
  let fontSize = store.get('font', 14);
  document.documentElement.style.setProperty('--code-size', fontSize + 'px');

  function toast(msg, ms = 2200) {
    const t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toast.tm); toast.tm = setTimeout(() => { t.hidden = true; }, ms);
  }

  // ───────── Сервис-воркер и офлайн ─────────
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch((e) => console.warn('SW', e));
  }
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

  const offline = { state: 'unknown', done: 0, total: VENDOR.reduce((s, f) => s + f[2], 0), error: null, listeners: new Set() };
  const emitOffline = () => offline.listeners.forEach((f) => f());

  async function checkOffline() {
    if (!('caches' in window)) { offline.state = 'nocache'; emitOffline(); return; }
    try {
      const c = await caches.open(VENDOR_CACHE);
      let missing = 0;
      for (const [u] of VENDOR) if (!(await c.match(new URL(u, location.href).href))) missing++;
      offline.state = missing ? 'missing' : 'ready';
    } catch { offline.state = 'missing'; }
    emitOffline();
    if (offline.state === 'ready') compiler.warmup();
  }

  async function downloadVendor() {
    if (offline.state === 'downloading') return;
    offline.state = 'downloading'; offline.done = 0; offline.error = null; emitOffline();
    try {
      const c = await caches.open(VENDOR_CACHE);
      for (const [u, type, size] of VENDOR) {
        const url = new URL(u, location.href).href;
        if (await c.match(url)) { offline.done += size; emitOffline(); continue; }
        const resp = await fetch(url, { cache: 'no-store' });
        if (!resp.ok) throw new Error(u + ': HTTP ' + resp.status);
        const reader = resp.body.getReader(); const parts = []; let got = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          parts.push(value); got += value.length; offline.done += value.length; emitOffline();
        }
        offline.done += Math.max(0, size - got);
        await c.put(url, new Response(new Blob(parts, { type }), { headers: { 'Content-Type': type, 'Content-Length': String(got) } }));
      }
      offline.state = 'ready'; emitOffline();
      toast('Готово! Теперь тренажёр работает без интернета');
      compiler.warmup();
    } catch (e) {
      offline.state = 'missing'; offline.error = String(e.message || e); emitOffline();
    }
  }

  // ───────── Компилятор (воркер) ─────────
  const compiler = {
    worker: null, state: 'idle', seq: 0, pending: new Map(), listeners: new Set(), warmMs: 0,
    emit() { this.listeners.forEach((f) => f()); },
    ensure() {
      if (this.worker) return;
      this.worker = new Worker('compiler-worker.js', { type: 'module' });
      this.worker.onmessage = (ev) => {
        const m = ev.data;
        if (m.type === 'ready') {
          this.state = m.ok ? 'ready' : 'error'; this.warmMs = m.ms; this.errorLog = m.log; this.emit();
          if (!m.ok) console.warn('warmup', m.log);
        } else if (m.type === 'compiled') {
          const cb = this.pending.get(m.id); this.pending.delete(m.id); cb && cb(m);
        }
      };
      this.worker.onerror = (e) => { this.state = 'error'; this.errorLog = e.message; this.emit(); };
    },
    warmup() {
      if (this.worker) return;
      this.ensure(); this.state = 'loading'; this.emit();
      this.worker.postMessage({ type: 'warmup' });
    },
    compile(code, judge) {
      this.ensure();
      if (this.state === 'idle') { this.state = 'loading'; this.emit(); this.worker.postMessage({ type: 'warmup' }); }
      const id = ++this.seq;
      return new Promise((res) => { this.pending.set(id, res); this.worker.postMessage({ type: 'compile', id, code, judge }); });
    },
  };

  function runWasm(wasm, stdin, timeout) {
    return new Promise((resolve) => {
      const w = new Worker('run-worker.js');
      let partial = '';
      const tm = setTimeout(() => { w.terminate(); resolve({ timeout: true, stdout: partial, stderr: '' }); }, timeout);
      w.onmessage = (ev) => {
        if (ev.data.type === 'out') { if (partial.length < 1 << 20) partial += ev.data.s; return; }
        clearTimeout(tm); w.terminate(); resolve(ev.data);
      };
      w.onerror = (e) => { clearTimeout(tm); w.terminate(); resolve({ trap: e.message, stdout: '', stderr: '' }); };
      w.postMessage({ wasm, stdin });
    });
  }

  // ───────── Подсветка C++ ─────────
  const KW = new Set('alignas alignof and asm auto break case catch class const constexpr consteval constinit const_cast continue co_await co_return co_yield decltype default delete do dynamic_cast else enum explicit export extern false for friend goto if inline mutable namespace new noexcept not nullptr operator or private protected public register reinterpret_cast requires return sizeof static static_assert static_cast struct switch template this thread_local throw true try typedef typeid typename union using virtual volatile while'.split(' '));
  const TY = new Set('bool char char8_t char16_t char32_t double float int long short signed unsigned void wchar_t size_t string vector map set unordered_map unordered_set pair queue stack deque priority_queue list array tuple int64_t uint64_t int32_t uint32_t ListNode TreeNode greater less function optional string_view bitset multiset multimap istringstream ostringstream stringstream'.split(' '));
  const TOKEN_RE = /(\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$))|("(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?)|(^[ \t]*#[^\n]*)|(\b\d[\d']*\.?\d*(?:[eE][+-]?\d+)?[uUlLfF]*\b|\b0x[\da-fA-F']+\b)|([A-Za-z_]\w*)/gm;
  function highlight(src) {
    let out = '', last = 0, m;
    TOKEN_RE.lastIndex = 0;
    while ((m = TOKEN_RE.exec(src))) {
      out += esc(src.slice(last, m.index));
      const t = m[0];
      if (m[1]) out += `<span class="tk-co">${esc(t)}</span>`;
      else if (m[2]) out += `<span class="tk-st">${esc(t)}</span>`;
      else if (m[3]) {
        const mm = t.match(/^(\s*#\s*\w+)(.*)$/);
        out += mm ? `<span class="tk-pp">${esc(mm[1])}</span><span class="tk-st">${esc(mm[2])}</span>` : `<span class="tk-pp">${esc(t)}</span>`;
      }
      else if (m[4]) out += `<span class="tk-nu">${esc(t)}</span>`;
      else if (KW.has(t)) out += `<span class="tk-kw">${t}</span>`;
      else if (TY.has(t)) out += `<span class="tk-ty">${t}</span>`;
      else if (src[TOKEN_RE.lastIndex] === '(') out += `<span class="tk-fn">${t}</span>`;
      else out += t;
      last = TOKEN_RE.lastIndex;
    }
    return out + esc(src.slice(last));
  }

  // ───────── Редактор ─────────
  let activeEditor = null;
  function createEditor(host, value, onChange) {
    host.innerHTML = `<div class="editor"><div class="gutter"></div><div class="area"><pre class="hl" aria-hidden="true"></pre>
      <textarea spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="Код"></textarea></div></div>`;
    const ta = $('textarea', host), pre = $('pre', host), gutter = $('.gutter', host);
    let errLines = new Set();
    ta.value = value;
    const render = () => {
      pre.innerHTML = highlight(ta.value) + '\n ';
      const n = ta.value.split('\n').length;
      let g = '';
      for (let i = 1; i <= n; i++) g += errLines.has(i) ? `<span class="err">${i}</span>\n` : i + '\n';
      gutter.innerHTML = g;
      ta.style.height = 'auto'; ta.style.width = '100%';
      ta.style.height = ta.scrollHeight + 'px';
      ta.style.width = Math.max(ta.scrollWidth, ta.parentElement.clientWidth) + 'px';
    };
    let tm;
    const changed = () => { render(); clearTimeout(tm); tm = setTimeout(() => onChange && onChange(ta.value), 300); };

    const insert = (text) => {
      ta.focus();
      // execCommand сохраняет историю отмены; если недоступен — setRangeText
      if (!document.execCommand || !document.execCommand('insertText', false, text)) {
        ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, 'end');
      }
      changed();
    };
    const lineStart = (pos) => ta.value.lastIndexOf('\n', pos - 1) + 1;
    const indentOf = (pos) => (ta.value.slice(lineStart(pos)).match(/^[ \t]*/) || [''])[0];

    ta.addEventListener('input', changed);
    ta.addEventListener('keydown', (e) => {
      const s = ta.selectionStart, en = ta.selectionEnd, v = ta.value;
      if (e.key === 'Tab') {
        e.preventDefault();
        if (s !== en && v.slice(s, en).includes('\n')) {
          const ls = lineStart(s);
          const block = v.slice(ls, en);
          const nb = e.shiftKey ? block.replace(/^( {1,4}|\t)/gm, '') : block.replace(/^/gm, '    ');
          ta.setSelectionRange(ls, en);
          insert(nb); ta.setSelectionRange(ls, ls + nb.length);
        } else if (e.shiftKey) {
          const ls = lineStart(s); const m = v.slice(ls).match(/^ {1,4}/);
          if (m) { ta.setSelectionRange(ls, ls + m[0].length); insert(''); ta.setSelectionRange(Math.max(ls, s - m[0].length), Math.max(ls, s - m[0].length)); }
        } else insert('    ');
      } else if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const ind = indentOf(s);
        const prev = v.slice(0, s).trimEnd().slice(-1);
        const next = v.slice(en).match(/^[ \t]*(.)/);
        if (prev === '{' && next && next[1] === '}') {
          insert('\n' + ind + '    ' + '\n' + ind);
          const p = ta.selectionStart - 1 - ind.length; ta.setSelectionRange(p, p);
        } else insert('\n' + ind + (prev === '{' ? '    ' : ''));
      } else if (e.key === '}' && s === en) {
        const ls = lineStart(s);
        if (/^[ \t]+$/.test(v.slice(ls, s)) && v.slice(ls, s).length >= 4) {
          e.preventDefault(); ta.setSelectionRange(s - 4, s); insert('}');
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault(); host.dispatchEvent(new CustomEvent('run'));
      }
    });
    ta.addEventListener('focus', () => { activeEditor = api; keybar.show(); });
    ta.addEventListener('blur', () => { setTimeout(() => { if (document.activeElement !== ta) keybar.hide(); }, 150); });
    window.addEventListener('resize', render);

    const api = {
      ta, insert, render,
      get value() { return ta.value; },
      set value(v) { ta.value = v; render(); onChange && onChange(v); },
      setErrors(lines) { errLines = new Set(lines); render(); },
      gotoLine(n) {
        const lines = ta.value.split('\n'); let pos = 0;
        for (let i = 0; i < n - 1 && i < lines.length; i++) pos += lines[i].length + 1;
        ta.focus(); ta.setSelectionRange(pos, pos + (lines[n - 1] || '').length);
        const lh = parseFloat(getComputedStyle(ta).lineHeight) || 21;
        const top = ta.getBoundingClientRect().top + window.scrollY + (n - 3) * lh;
        window.scrollTo({ top: Math.max(0, top - 80), behavior: 'smooth' });
      },
      moveCursor(d) { const p = Math.max(0, Math.min(ta.value.length, ta.selectionStart + d)); ta.focus(); ta.setSelectionRange(p, p); },
    };
    requestAnimationFrame(render);
    return api;
  }

  // ───────── Панель символов над клавиатурой ─────────
  const keybar = (() => {
    const el = $('#keybar');
    const keys = [['⇥', '    '], ['{ }', 'BLOCK'], ['(', '('], [')', ')'], ['[', '['], [']', ']'], [';', ';'], ['<', '<'], ['>', '>'], ['=', '='],
      ['"', '"'], ["'", "'"], ['+', '+'], ['-', '-'], ['*', '*'], ['/', '/'], ['&', '&'], ['|', '|'], ['!', '!'], [':', ':'], ['#', '#'], ['%', '%'], ['←', 'LEFT'], ['→', 'RIGHT']];
    el.innerHTML = keys.map(([l, v]) => `<button type="button" data-v="${esc(v)}" class="${l.length > 1 && v.length > 1 && v !== '    ' ? 'wide' : ''}">${esc(l)}</button>`).join('') + `<button type="button" data-v="HIDE" class="wide">Готово</button>`;
    let saved = null;
    el.addEventListener('mousedown', (e) => e.preventDefault());
    el.addEventListener('touchstart', () => { if (activeEditor) saved = [activeEditor.ta.selectionStart, activeEditor.ta.selectionEnd]; }, { passive: true });
    el.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b || !activeEditor) return;
      const ed = activeEditor, v = b.dataset.v;
      if (document.activeElement !== ed.ta) { ed.ta.focus(); if (saved) ed.ta.setSelectionRange(saved[0], saved[1]); }
      if (v === 'HIDE') { ed.ta.blur(); hide(); return; }
      if (v === 'LEFT') return ed.moveCursor(-1);
      if (v === 'RIGHT') return ed.moveCursor(1);
      if (v === 'BLOCK') {
        const s = ed.ta.selectionStart; const ls = ed.ta.value.lastIndexOf('\n', s - 1) + 1;
        const ind = (ed.ta.value.slice(ls).match(/^[ \t]*/) || [''])[0];
        ed.insert('{\n' + ind + '    \n' + ind + '}');
        const p = ed.ta.selectionStart - 2 - ind.length; ed.ta.setSelectionRange(p, p);
        return;
      }
      ed.insert(v);
    });
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const place = () => {
      const vv = window.visualViewport; if (!vv) return;
      const off = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      el.style.transform = `translateY(${-off}px)`;
    };
    if (window.visualViewport) { visualViewport.addEventListener('resize', place); visualViewport.addEventListener('scroll', place); }
    function show() { if (!coarse) return; el.hidden = false; place(); }
    function hide() { el.hidden = true; }
    return { show, hide };
  })();

  // ───────── Маршрутизация ─────────
  const app = $('#app');
  function route() {
    keybar.hide(); activeEditor = null;
    offline.listeners.clear(); compiler.listeners.clear();
    const h = location.hash.slice(1);
    if (h.startsWith('/p/') && byId[h.slice(3)]) renderProblem(byId[h.slice(3)]);
    else if (h === '/sandbox') renderSandbox();
    else renderHome();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  function statusChipHTML() {
    const s = compiler.state, o = offline.state;
    if (o !== 'ready' && s === 'idle') return '<span class="status-chip"><span class="d"></span>компилятор не скачан</span>';
    if (s === 'loading') return '<span class="status-chip"><span class="d busy"></span>прогрев компилятора…</span>';
    if (s === 'ready') return '<span class="status-chip"><span class="d ok"></span>компилятор готов</span>';
    if (s === 'error') return '<span class="status-chip"><span class="d" style="background:var(--bad)"></span>ошибка компилятора</span>';
    return '<span class="status-chip"><span class="d"></span>компилятор</span>';
  }

  function offlineCardHTML() {
    const o = offline;
    const mb = (b) => (b / 1048576).toFixed(0);
    if (o.state === 'ready') return `<div class="card"><div class="row"><span class="ready-badge">✓ Работает офлайн</span><span class="spacer" style="flex:1"></span>${statusChipHTML()}</div></div>`;
    if (o.state === 'nocache') return `<div class="card"><h3>Офлайн недоступен</h3><p>Этот браузер не поддерживает кэш приложений. Открой страницу в Safari по https.</p></div>`;
    if (o.state === 'downloading') {
      const pct = o.total ? Math.min(100, (o.done / o.total) * 100) : 0;
      return `<div class="card"><h3>Скачиваю компилятор C++…</h3><div class="dl-bar"><div style="width:${pct.toFixed(1)}%"></div></div>
        <p>${mb(o.done)} из ${mb(o.total)} МБ. Не закрывай приложение до конца загрузки.</p></div>`;
    }
    return `<div class="card"><h3>Скачай компилятор для офлайна</h3>
      <p>Один раз, около ${mb(o.total)} МБ (лучше по Wi-Fi). После этого задачи компилируются и проверяются прямо на телефоне без интернета.</p>
      ${o.error ? `<p style="color:var(--bad)">Ошибка: ${esc(o.error)}. Проверь интернет и попробуй ещё раз.</p>` : ''}
      <div class="row"><button class="btn primary" id="dl">⬇︎ Скачать</button></div></div>`;
  }

  // ───────── Главная ─────────
  function renderHome() {
    const solved = PROBLEMS.filter((p) => progress[p.id]?.solved).length;
    const next = PROBLEMS.find((p) => !progress[p.id]?.solved);
    app.innerHTML = `
      <div class="topbar"><h1>C++ Тренажёр</h1><button class="icon-btn" id="theme" aria-label="Сменить тему">☀︎ / ☾</button></div>
      <div class="wrap">
        <div class="hero">
          <h2>От «Hello» до Hard</h2>
          <p>${PROBLEMS.length} задач с автотестами, 5 уровней сложности. Пиши код и жми «Проверить».</p>
          <div class="progress"><div style="width:${(solved / PROBLEMS.length) * 100}%"></div></div>
          <div class="stats"><span>Решено ${solved} из ${PROBLEMS.length}</span>${next ? `<a href="#/p/${next.id}">Продолжить: ${esc(next.title)} →</a>` : '<span>Все задачи решены 🏆</span>'}</div>
        </div>
        <div id="offline">${offlineCardHTML()}</div>
        <a class="pitem" href="#/sandbox" style="margin-top:4px"><span class="num">{ }</span><span class="t"><b>Песочница</b><br><span style="color:var(--muted);font-size:13px">Свободный код с main() и вводом с клавиатуры</span></span><span>→</span></a>
        ${LEVELS.map((l) => {
          const ps = PROBLEMS.filter((p) => p.lvl === l.id);
          const s = ps.filter((p) => progress[p.id]?.solved).length;
          return `<section class="level">
            <div class="level-head"><span class="dot" style="background:${l.color}"></span><h3>${l.id}. ${l.name}</h3><span class="cnt">${s}/${ps.length}</span></div>
            <div class="level-about">${l.about}</div>
            <div class="plist">${ps.map((p) => {
              const st = progress[p.id]?.solved ? 'solved' : progress[p.id]?.tried ? 'tried' : '';
              return `<a class="pitem" href="#/p/${p.id}"><span class="num">${p.idx + 1}</span><span class="t">${esc(p.title)}</span><span class="st ${st}">${st === 'solved' ? '✓' : ''}</span></a>`;
            }).join('')}</div></section>`;
        }).join('')}
        <p style="color:var(--muted);font-size:13px;margin-top:28px">Прогресс и код хранятся только на этом устройстве. Версия ${APP_VERSION}.</p>
      </div>`;
    PROBLEMS.forEach((p, i) => { p.idx = i; });
    const bindOffline = () => {
      $('#offline').innerHTML = offlineCardHTML();
      const b = $('#dl'); if (b) b.onclick = downloadVendor;
    };
    bindOffline();
    offline.listeners.add(bindOffline); compiler.listeners.add(bindOffline);
    $('#theme').onclick = toggleTheme;
  }

  function toggleTheme() {
    const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const nx = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nx; store.set('theme', nx);
  }
  const savedTheme = store.get('theme', null);
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;

  // ───────── Экран задачи ─────────
  function renderProblem(p) {
    const lvl = levelOf(p.lvl);
    const idx = PROBLEMS.findIndex((x) => x.id === p.id);
    const harness = buildHarness(p);
    let tab = store.get('tab', 'desc');
    if (tab === 'res') tab = 'code';
    app.innerHTML = `
      <div class="topbar">
        <a class="icon-btn back" href="#/" aria-label="Назад">‹</a>
        <h1>${idx + 1}. ${esc(p.title)}</h1>
        <button class="btn primary" id="run">▶ Проверить</button>
      </div>
      <div class="wrap wide">
        <div class="split">
          <div class="tabs" role="tablist">
            <button data-tab="desc">Условие</button><button data-tab="code">Код</button><button data-tab="res">Результат<span class="badge" id="resbadge"></span></button>
          </div>
          <div class="left"><div class="pane pane-desc statement">
            <div><span class="chip" style="background:${lvl.color}">${lvl.name}</span></div>
            <h2>${esc(p.title)}</h2>
            ${p.desc}
            <p style="color:var(--muted);font-size:14px">Тестов: ${p.tests.length}. Функцию <code>main()</code> писать не нужно, её добавит проверка.</p>
            <div class="reveal">
              <div class="row" style="display:flex;gap:8px;flex-wrap:wrap">
                <button class="btn small" id="hintBtn">💡 Подсказка</button>
                <button class="btn small" id="solBtn">🔑 Решение</button>
              </div>
              <div id="hintBox"></div><div id="solBox"></div>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:22px;gap:8px">
              ${idx > 0 ? `<a class="btn small" href="#/p/${PROBLEMS[idx - 1].id}">← Назад</a>` : '<span></span>'}
              ${idx < PROBLEMS.length - 1 ? `<a class="btn small" href="#/p/${PROBLEMS[idx + 1].id}">Дальше →</a>` : ''}
            </div>
          </div></div>
          <div class="right">
            <div class="pane pane-code">
              <div class="ed-tools">
                <span id="chip">${statusChipHTML()}</span><span class="spacer"></span>
                <button class="btn small" id="fminus" aria-label="Меньше">A−</button><button class="btn small" id="fplus" aria-label="Больше">A+</button>
                <button class="btn small" id="reset">Сброс</button>
              </div>
              <div id="ed"></div>
            </div>
            <div class="pane pane-res"><div id="res"><div class="empty">Нажми «▶ Проверить», и здесь появятся результаты тестов.</div></div></div>
          </div>
        </div>
        <div class="keybar-space"></div>
      </div>`;

    const ed = createEditor($('#ed'), getCode(p), (v) => setCode(p, v));
    $('#ed').addEventListener('run', () => run());
    const setTab = (t) => {
      tab = t; store.set('tab', t === 'res' ? 'code' : t);
      app.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === t));
      app.querySelectorAll('.pane').forEach((x) => x.classList.toggle('on', x.classList.contains('pane-' + t)));
      if (t === 'code') ed.render();
    };
    app.querySelectorAll('.tabs button').forEach((b) => (b.onclick = () => setTab(b.dataset.tab)));
    setTab(tab);

    $('#hintBtn').onclick = () => { $('#hintBox').innerHTML = `<div class="box">💡 ${esc(p.hint)}</div>`; };
    $('#solBtn').onclick = () => {
      if (!$('#solBox').innerHTML && !confirm('Показать эталонное решение? Сначала попробуй сам, так лучше запоминается.')) return;
      $('#solBox').innerHTML = `<div class="box"><b>Эталонное решение</b><pre class="sol">${highlight(p.sol)}</pre>
        <button class="btn small" id="useSol">Вставить в редактор</button></div>`;
      $('#useSol').onclick = () => { ed.value = solutionOf(p); setTab('code'); toast('Решение в редакторе. Разбери его построчно!'); };
    };
    $('#reset').onclick = () => { if (confirm('Вернуть стартовый код? Текущий код пропадёт.')) { ed.value = starterOf(p); } };
    const font = (d) => { fontSize = Math.max(11, Math.min(22, fontSize + d)); store.set('font', fontSize); document.documentElement.style.setProperty('--code-size', fontSize + 'px'); ed.render(); };
    $('#fminus').onclick = () => font(-1); $('#fplus').onclick = () => font(1);
    compiler.listeners.add(() => { const c = $('#chip'); if (c) c.innerHTML = statusChipHTML(); });
    if (offline.state === 'ready' || offline.state === 'unknown') compiler.warmup();

    let running = false;
    async function run() {
      if (running) return;
      if (offline.state !== 'ready' && !navigator.onLine) { toast('Компилятор ещё не скачан. Подключись к интернету и скачай его на главной.', 3500); return; }
      running = true;
      const btn = $('#run'); btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Компилирую';
      ed.ta.blur(); keybar.hide();
      setTab('res');
      $('#res').innerHTML = `<div class="verdict warn"><h3><span class="spin"></span> ${compiler.state === 'ready' ? 'Компилирую…' : 'Запускаю компилятор…'}</h3><p>${compiler.state === 'ready' ? 'Обычно 1–3 секунды.' : 'Первый запуск после открытия приложения дольше: компилятор загружается в память.'}</p></div>`;
      const code = ed.value;
      progress[p.id] = { ...(progress[p.id] || {}), tried: true }; saveProgress();
      const src = code + '\n' + harness.code;
      const c = await compiler.compile(src, JUDGE_H);
      if (!c.ok) {
        renderCompileError(c.log, ed, code);
        ed.setErrors(errorLines(c.log));
        btn.disabled = false; btn.textContent = '▶ Проверить'; running = false;
        $('#resbadge').style.background = 'var(--bad)';
        return;
      }
      ed.setErrors([]);
      btn.innerHTML = '<span class="spin"></span> Тестирую';
      const r = await runWasm(c.wasm, '', TEST_TIMEOUT);
      renderResults(p, harness, r, c, ed);
      btn.disabled = false; btn.textContent = '▶ Проверить'; running = false;
    }
    $('#run').onclick = run;
  }

  function errorLines(log) {
    const s = new Set();
    for (const m of log.matchAll(/main\.cpp:(\d+):\d+: (?:fatal )?error/g)) s.add(+m[1]);
    return [...s];
  }
  function logHTML(log) {
    return esc(log).replace(/main\.cpp:(\d+):(\d+)/g, '<span class="jump" data-line="$1">main.cpp:$1:$2</span>');
  }
  function bindJumps(root, ed, setTabFn) {
    root.querySelectorAll('.jump').forEach((j) => (j.onclick = () => {
      const t = app.querySelector('.tabs button[data-tab="code"]'); if (t && getComputedStyle(t.parentElement).display !== 'none') t.click();
      ed.gotoLine(+j.dataset.line);
    }));
  }

  function renderCompileError(log, ed) {
    const errs = (log.match(/error:/g) || []).length;
    const inTests = /tests\.cpp:\d+/.test(log) && !/main\.cpp:\d+:\d+: (?:fatal )?error/.test(log);
    $('#res').innerHTML = `<div class="verdict bad"><h3>Ошибка компиляции</h3>
      <p>${errs ? `Ошибок: ${errs}. ` : ''}${inTests ? 'Ошибка в тестовом коде: скорее всего, изменилось имя или сигнатура функции. Сравни с условием или нажми «Сброс».' : 'Нажми на <u>main.cpp:строка</u>, чтобы перейти к месту ошибки.'}</p></div>
      <div class="log">${logHTML(log.trim() || 'Компилятор не вернул сообщение.')}</div>`;
    bindJumps($('#res'), ed);
  }

  function renderResults(p, harness, r, c, ed) {
    const parsed = parseOutput(r.stdout || '');
    const n = p.tests.length;
    const cases = [];
    let passed = 0, firstBad = -1, crashedAt = -1;
    for (let i = 0; i < n; i++) {
      const cs = parsed.cases[i];
      if (cs && cs.done) { cases.push(cs); if (cs.ok) passed++; else if (firstBad < 0) firstBad = i; }
      else if (cs && !cs.done) { crashedAt = i; cases.push({ i, crashed: true, out: cs.out }); if (firstBad < 0) firstBad = i; }
      else cases.push({ i, skipped: true });
    }
    let cls, title, sub;
    const timing = `Компиляция ${(c.ms / 1000).toFixed(1)} с${r.ms !== undefined ? `, выполнение ${r.ms} мс` : ''}.`;
    if (r.timeout) {
      const at = crashedAt >= 0 ? crashedAt : cases.findIndex((x) => !x.done);
      cls = 'warn'; title = 'Превышено время';
      sub = `Программа не уложилась в ${TEST_TIMEOUT / 1000} с. Скорее всего, бесконечный цикл или слишком медленный алгоритм. ${timing}`;
      if (at >= 0 && !cases[at].done) cases[at] = { i: at, crashed: true, timeout: true, out: '' };
    } else if (r.trap || crashedAt >= 0 || (r.exitCode && r.exitCode !== 0)) {
      cls = 'bad'; title = 'Ошибка выполнения';
      sub = `Программа упала${crashedAt >= 0 ? ` на тесте ${crashedAt + 1}` : ''}: ${esc(explainTrap(r.trap, r.stderr))} ${timing}`;
    } else if (passed === n) {
      cls = 'ok'; title = `Принято! ${passed}/${n} 🎉`; sub = timing;
    } else {
      cls = 'bad'; title = `Неверный ответ: ${passed}/${n}`; sub = `Посмотри первый проваленный тест ниже. ${timing}`;
    }
    const solvedNow = cls === 'ok';
    if (solvedNow) { progress[p.id] = { solved: true, tried: true }; saveProgress(); }
    const idx = PROBLEMS.findIndex((x) => x.id === p.id);
    const next = PROBLEMS[idx + 1];
    $('#resbadge').style.background = solvedNow ? 'var(--ok)' : 'var(--bad)';
    const warn = c.log && /warning:/.test(c.log) ? `<details class="case"><summary><span class="ic skip">!</span><span class="call">Предупреждения компилятора</span></summary><div class="body"><div class="log">${logHTML(c.log)}</div></div></details>` : '';
    $('#res').innerHTML = `
      <div class="verdict ${cls}"><h3>${title}</h3><p>${sub}</p>
        ${solvedNow && next ? `<div class="row"><a class="btn ok" href="#/p/${next.id}">Следующая задача →</a></div>` : ''}</div>
      ${cases.map((x) => caseHTML(x, harness.shows[x.i], x.i === firstBad)).join('')}
      ${parsed.free ? `<div class="io-label">Вывод программы вне тестов</div><div class="log">${esc(parsed.free)}</div>` : ''}
      ${r.stderr ? `<div class="io-label">stderr</div><div class="log">${esc(r.stderr)}</div>` : ''}
      ${warn}`;
    bindJumps($('#res'), ed);
  }

  function explainTrap(trap, stderr) {
    const t = (trap || '') + ' ' + (stderr || '');
    if (/uncaught C\+\+ exception/.test(t)) return 'выброшено исключение (throw). В тренажёре исключения не перехватываются.';
    if (/out of bounds|memory access/i.test(t)) return 'обращение к памяти вне массива (выход за границы, nullptr или висячий указатель).';
    if (/unreachable/i.test(t)) return 'аварийное завершение (abort, assert, или функция закончилась без return).';
    if (/stack|recursion/i.test(t)) return 'переполнение стека: слишком глубокая или бесконечная рекурсия.';
    if (/divide by zero|integer overflow/i.test(t)) return 'деление на ноль.';
    return trap || 'код завершения не 0.';
  }

  function caseHTML(x, show, open) {
    const trunc = (s) => (s && s.length > 1500 ? s.slice(0, 1500) + '…' : s);
    if (x.skipped) return `<details class="case"><summary><span class="ic skip">·</span><span class="call">${esc(show)}</span><span class="ms">не запущен</span></summary></details>`;
    if (x.crashed) return `<details class="case" ${open ? 'open' : ''}><summary><span class="ic bad">!</span><span class="call">${esc(show)}</span><span class="ms">${x.timeout ? 'время' : 'упал'}</span></summary>
      <div class="body"><div class="kv"><b>Тест</b><pre>${esc(show)}</pre></div>${x.out ? `<div class="kv"><b>Твой вывод (cout)</b><pre>${esc(trunc(x.out))}</pre></div>` : ''}</div></details>`;
    return `<details class="case" ${open ? 'open' : ''}><summary><span class="ic ${x.ok ? 'ok' : 'bad'}">${x.ok ? '✓' : '✕'}</span><span class="call">${esc(show)}</span><span class="ms">${x.ms} мс</span></summary>
      <div class="body">
        <div class="kv"><b>Тест</b><pre>${esc(show)}</pre></div>
        <div class="kv"><b>Ожидалось</b><pre>${esc(trunc(x.exp))}</pre></div>
        <div class="kv"><b>Получено</b><pre style="${x.ok ? '' : 'color:var(--bad)'}">${esc(trunc(x.got))}</pre></div>
        ${x.out && x.out.trim() ? `<div class="kv"><b>Твой вывод (cout)</b><pre>${esc(trunc(x.out))}</pre></div>` : ''}
      </div></details>`;
  }

  // ───────── Песочница ─────────
  const SANDBOX_DEFAULT = `#include <bits/stdc++.h>
using namespace std;

int main() {
    string name;
    cout << "Как тебя зовут? ";
    cin >> name;
    cout << "\\nПривет, " << name << "! Это C++ прямо на iPhone." << endl;

    vector<int> v = {5, 3, 8, 1};
    sort(v.begin(), v.end());
    for (int x : v) cout << x << ' ';
    cout << endl;
    return 0;
}
`;
  function renderSandbox() {
    app.innerHTML = `
      <div class="topbar"><a class="icon-btn back" href="#/" aria-label="Назад">‹</a><h1>Песочница</h1><button class="btn primary" id="run">▶ Запустить</button></div>
      <div class="wrap">
        <div class="ed-tools"><span id="chip">${statusChipHTML()}</span><span class="spacer"></span>
          <button class="btn small" id="fminus">A−</button><button class="btn small" id="fplus">A+</button><button class="btn small" id="reset">Сброс</button></div>
        <div id="ed"></div>
        <div class="io-label">Ввод (stdin)</div>
        <textarea class="stdin" id="stdin" spellcheck="false" autocapitalize="off" autocorrect="off">${esc(store.get('sandbox:stdin', 'Ярослав'))}</textarea>
        <div class="io-label">Вывод</div>
        <div id="out" class="log" style="min-height:60px">Здесь появится вывод программы.</div>
        <div class="keybar-space"></div>
      </div>`;
    const ed = createEditor($('#ed'), store.get('sandbox:code', SANDBOX_DEFAULT), (v) => store.set('sandbox:code', v));
    $('#ed').addEventListener('run', () => run());
    $('#stdin').oninput = (e) => store.set('sandbox:stdin', e.target.value);
    $('#reset').onclick = () => { if (confirm('Вернуть пример?')) ed.value = SANDBOX_DEFAULT; };
    const font = (d) => { fontSize = Math.max(11, Math.min(22, fontSize + d)); store.set('font', fontSize); document.documentElement.style.setProperty('--code-size', fontSize + 'px'); ed.render(); };
    $('#fminus').onclick = () => font(-1); $('#fplus').onclick = () => font(1);
    compiler.listeners.add(() => { const c = $('#chip'); if (c) c.innerHTML = statusChipHTML(); });
    if (offline.state === 'ready' || offline.state === 'unknown') compiler.warmup();
    let running = false;
    async function run() {
      if (running) return; running = true;
      const btn = $('#run'); btn.disabled = true; btn.innerHTML = '<span class="spin"></span>';
      ed.ta.blur(); keybar.hide();
      const out = $('#out'); out.innerHTML = '<span class="spin"></span> Компилирую…';
      const c = await compiler.compile(ed.value);
      if (!c.ok) {
        out.innerHTML = `<b style="color:var(--bad)">Ошибка компиляции</b>\n\n${logHTML(c.log)}`;
        ed.setErrors(errorLines(c.log)); bindJumps(out, ed);
      } else {
        ed.setErrors([]);
        out.innerHTML = '<span class="spin"></span> Выполняю…';
        const r = await runWasm(c.wasm, $('#stdin').value, 10000);
        let html = esc(r.stdout || '');
        if (r.stderr) html += `<span style="color:var(--bad)">${esc(r.stderr)}</span>`;
        if (r.truncated) html += '\n<i>…вывод обрезан (больше 1 МБ)</i>';
        const tail = r.timeout ? '\n\n⏱ Превышено время (10 с). Бесконечный цикл?' : r.trap ? `\n\n💥 ${explainTrap(r.trap, r.stderr)}` : `\n\n— завершено с кодом ${r.exitCode}, ${r.ms} мс (компиляция ${(c.ms / 1000).toFixed(1)} с)`;
        out.innerHTML = (html || '<i>(пустой вывод)</i>') + `<span style="color:var(--muted)">${esc(tail)}</span>`;
        if (warnOnly(c.log)) out.innerHTML += `\n\n<span style="color:var(--warn)">${logHTML(c.log)}</span>`;
        bindJumps(out, ed);
      }
      btn.disabled = false; btn.textContent = '▶ Запустить'; running = false;
    }
    const warnOnly = (log) => log && /warning:/.test(log);
    $('#run').onclick = run;
  }

  // ───────── Старт ─────────
  route();
  checkOffline();
  window.__cppt = { compiler, offline, downloadVendor, runWasm };
})();
