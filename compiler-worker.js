// Модульный воркер: держит Clang (WebAssembly) прогретым и компилирует C++ в .wasm
import { runClang } from './vendor/clang/bundle.js';

const FLAGS = ['-std=c++20', '-O1'];
let shared = null; // общие файлы: PCH, заголовок bits/stdc++.h, заглушка исключений

async function loadShared() {
  if (shared) return shared;
  const get = async (name, bin) => {
    const r = await fetch(new URL('./vendor/' + name, import.meta.url));
    if (!r.ok) throw new Error('Не удалось загрузить ' + name);
    return bin ? new Uint8Array(await r.arrayBuffer()) : r.text();
  };
  const [pch, hdr, stub] = await Promise.all([get('stdc++.h.pch', true), get('stdc++.h'), get('stub.o', true)]);
  shared = { pch, hdr, stub };
  return shared;
}

function decode(chunks) {
  let len = 0; for (const c of chunks) len += c.length;
  const all = new Uint8Array(len); let o = 0;
  for (const c of chunks) { all.set(c, o); o += c.length; }
  return new TextDecoder().decode(all);
}

async function compile(code, judge) {
  const s = await loadShared();
  const err = [];
  const files = {
    'main.cpp': code,
    'stdc++.h': s.hdr,
    'stdc++.h.pch': s.pch,
    'stub.o': s.stub,
    'inc': { 'bits': { 'stdc++.h': s.hdr } },
  };
  if (judge) files['judge.h'] = judge;
  const t0 = performance.now();
  try {
    const out = await runClang(
      ['clang++', ...FLAGS, '-include-pch', 'stdc++.h.pch', '-I', 'inc', '-I', '.', 'main.cpp', 'stub.o',
        '-Wl,-z,stack-size=16777216', '-o', 'prog.wasm'],
      files,
      { stderr: (b) => { if (b) err.push(b); }, stdout: (b) => { if (b) err.push(b); }, fetchProgress: () => {} });
    return { ok: true, wasm: out['prog.wasm'], log: decode(err), ms: Math.round(performance.now() - t0) };
  } catch (e) {
    return { ok: false, log: decode(err) || String(e && e.message || e), ms: Math.round(performance.now() - t0) };
  }
}

self.onmessage = async (ev) => {
  const m = ev.data;
  try {
    if (m.type === 'warmup') {
      const t0 = performance.now();
      const r = await compile('int main() { return 0; }\n');
      self.postMessage({ type: 'ready', ok: r.ok, log: r.log, ms: Math.round(performance.now() - t0) });
    } else if (m.type === 'compile') {
      const r = await compile(m.code, m.judge);
      self.postMessage({ type: 'compiled', id: m.id, ...r }, r.wasm ? [r.wasm.buffer] : []);
    }
  } catch (e) {
    self.postMessage({ type: m.type === 'warmup' ? 'ready' : 'compiled', id: m.id, ok: false, log: String(e && e.stack || e) });
  }
};
