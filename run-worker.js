// Воркер запуска: исполняет скомпилированную программу (WASI preview1) с заданным stdin.
// Главный поток убивает этот воркер по таймауту, поэтому бесконечный цикл не повесит приложение.
const MAX_OUT = 1 << 20; // 1 МБ вывода

self.onmessage = async (ev) => {
  const { wasm, stdin } = ev.data;
  const input = new TextEncoder().encode(stdin || '');
  let inPos = 0, outLen = 0, truncated = false;
  const outChunks = [], errChunks = [];
  let mem = null;
  const streamDec = new TextDecoder();
  const ENOSYS = 52, EBADF = 8;

  class Exit extends Error { constructor(code) { super('exit ' + code); this.code = code; } }

  const view = () => new DataView(mem.buffer);
  const bytes = () => new Uint8Array(mem.buffer);

  const wasi = {
    args_sizes_get(argc, bufSize) { const v = view(); v.setUint32(argc, 1, true); v.setUint32(bufSize, 5, true); return 0; },
    args_get(argv, buf) { const v = view(); v.setUint32(argv, buf, true); bytes().set([112, 114, 111, 103, 0], buf); return 0; },
    environ_sizes_get(cnt, size) { const v = view(); v.setUint32(cnt, 0, true); v.setUint32(size, 0, true); return 0; },
    environ_get() { return 0; },
    clock_res_get(id, ptr) { view().setBigUint64(ptr, 1000n, true); return 0; },
    clock_time_get(id, prec, ptr) {
      const ns = id === 0 ? BigInt(Date.now()) * 1000000n : BigInt(Math.round(performance.now() * 1e6));
      view().setBigUint64(ptr, ns, true); return 0;
    },
    fd_write(fd, iovs, iovsLen, nwritten) {
      const v = view(), b = bytes(); let n = 0;
      for (let i = 0; i < iovsLen; i++) {
        const ptr = v.getUint32(iovs + i * 8, true), len = v.getUint32(iovs + i * 8 + 4, true);
        if (fd === 1 || fd === 2) {
          if (outLen < MAX_OUT) {
            const chunk = b.slice(ptr, ptr + len);
            (fd === 1 ? outChunks : errChunks).push(chunk); outLen += len;
            // поток для главного потока: если программа зависнет, будет видно, на каком тесте
            if (fd === 1) self.postMessage({ type: 'out', s: streamDec.decode(chunk, { stream: true }) });
          }
          else truncated = true;
        }
        n += len;
      }
      v.setUint32(nwritten, n, true);
      return fd === 1 || fd === 2 ? 0 : EBADF;
    },
    fd_read(fd, iovs, iovsLen, nread) {
      if (fd !== 0) return EBADF;
      const v = view(), b = bytes(); let n = 0;
      for (let i = 0; i < iovsLen; i++) {
        const ptr = v.getUint32(iovs + i * 8, true), len = v.getUint32(iovs + i * 8 + 4, true);
        const chunk = input.subarray(inPos, inPos + len);
        b.set(chunk, ptr); inPos += chunk.length; n += chunk.length;
        if (chunk.length < len) break;
      }
      v.setUint32(nread, n, true); return 0;
    },
    fd_fdstat_get(fd, ptr) {
      if (fd > 2) return EBADF;
      const v = view();
      v.setUint8(ptr, 2); // character device
      v.setUint16(ptr + 2, 0, true);
      v.setBigUint64(ptr + 8, 0xffffffffn, true); v.setBigUint64(ptr + 16, 0xffffffffn, true);
      return 0;
    },
    fd_fdstat_set_flags() { return 0; },
    fd_prestat_get() { return EBADF; },
    fd_prestat_dir_name() { return EBADF; },
    fd_close() { return 0; },
    fd_seek() { return 70; /* ESPIPE */ },
    fd_filestat_get() { return EBADF; },
    random_get(ptr, len) { const b = bytes(); for (let i = 0; i < len; i += 65536) crypto.getRandomValues(b.subarray(ptr + i, ptr + Math.min(len, i + 65536))); return 0; },
    sched_yield() { return 0; },
    poll_oneoff() { return ENOSYS; },
    proc_exit(code) { throw new Exit(code); },
    proc_raise() { return ENOSYS; },
  };

  const t0 = performance.now();
  let exitCode = 0, trap = null;
  try {
    const module = await WebAssembly.compile(wasm);
    const imports = { wasi_snapshot_preview1: {} };
    for (const imp of WebAssembly.Module.imports(module)) {
      if (imp.module === 'wasi_snapshot_preview1' && imp.kind === 'function')
        imports.wasi_snapshot_preview1[imp.name] = wasi[imp.name] || (() => ENOSYS);
    }
    const inst = await WebAssembly.instantiate(module, imports);
    mem = inst.exports.memory;
    inst.exports._start();
  } catch (e) {
    if (e instanceof Exit) exitCode = e.code;
    else { trap = String(e && e.message || e); exitCode = -1; }
  }
  const dec = (chunks) => { const d = new TextDecoder(); return chunks.map((c) => d.decode(c, { stream: true })).join('') + d.decode(); };
  self.postMessage({ type: 'done', stdout: dec(outChunks), stderr: dec(errChunks), exitCode, trap, truncated, ms: Math.round(performance.now() - t0) });
};
