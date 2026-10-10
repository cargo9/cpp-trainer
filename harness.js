// Сборка тестового main() для задачи. Общий код для приложения и для проверки задач в Node.
(function (root) {
  const JUDGE_H = String.raw`#pragma once
#include <bits/stdc++.h>
namespace jd {
using std::string;
inline string str(bool b) { return b ? "true" : "false"; }
inline string str(char c) { return string("'") + c + "'"; }
inline string str(const string& s) { return "\"" + s + "\""; }
inline string str(const char* s) { return str(string(s)); }
inline string str(double d) { std::ostringstream o; o << std::setprecision(10) << d; return o.str(); }
inline string str(float d) { return str((double)d); }
inline string str(int v) { return v == INT_MIN ? "null" : std::to_string(v); }
template <class T> typename std::enable_if<std::is_integral<T>::value, string>::type str(T v) { return std::to_string(v); }
template <class T> string str(const std::vector<T>& v);
template <class A, class B> string str(const std::pair<A, B>& p);
template <class T> string str(const std::vector<T>& v) {
  string r = "[";
  for (size_t i = 0; i < v.size(); i++) { if (i) r += ","; r += str(v[i]); if (r.size() > 2000) { r += ",..."; break; } }
  return r + "]";
}
template <class A, class B> string str(const std::pair<A, B>& p) { return "(" + str(p.first) + "," + str(p.second) + ")"; }

inline bool near(double a, double b) { return std::fabs(a - b) <= 1e-5 * std::max(1.0, std::fabs(b)); }
inline bool near(const std::vector<double>& a, const std::vector<double>& b) {
  if (a.size() != b.size()) return false;
  for (size_t i = 0; i < a.size(); i++) if (!near(a[i], b[i])) return false;
  return true;
}
inline int passed = 0, total = 0;
inline void flushAll() { std::cout << std::flush; std::fflush(stdout); }
template <int M, class F, class G> void check(int i, F f, G g) {
  flushAll();
  std::printf("\n\x1eS%d\n", i);
  flushAll();
  auto t0 = std::chrono::steady_clock::now();
  auto got = f();
  auto t1 = std::chrono::steady_clock::now();
  auto exp = g();
  string gs = str(got), es = str(exp);
  bool ok;
  if constexpr (M == 1) ok = near(got, exp);
  else if constexpr (M == 2) { std::sort(got.begin(), got.end()); std::sort(exp.begin(), exp.end()); ok = got == exp; }
  else if constexpr (M == 3) {
    for (auto& x : got) std::sort(x.begin(), x.end());
    for (auto& x : exp) std::sort(x.begin(), x.end());
    std::sort(got.begin(), got.end()); std::sort(exp.begin(), exp.end()); ok = got == exp;
  } else ok = got == exp;
  long long ms = std::chrono::duration_cast<std::chrono::milliseconds>(t1 - t0).count();
  flushAll();
  std::printf("\n\x1eR%d\x1f%d\x1f%lld\x1f%s\x1f%s\n", i, ok ? 1 : 0, ms, gs.c_str(), es.c_str());
  flushAll();
  total++; if (ok) passed++;
}
inline int finish() { flushAll(); std::printf("\n\x1e" "E%d\x1f%d\n", passed, total); flushAll(); return 0; }
// Детерминированный генератор для больших тестов
struct Rng { unsigned long long s; explicit Rng(unsigned long long seed) : s(seed) {} int next(int lo, int hi) { s = s * 6364136223846793005ULL + 1442695040888963407ULL; return lo + (int)((s >> 33) % (unsigned long long)(hi - lo + 1)); } };
}
`;

  const MODES = { eq: 0, near: 1, unordered: 2, unordered2: 3 };

  // Заменяет {} на [] вне строковых/символьных литералов: {2,7} -> [2,7]
  function prettyArg(a) {
    let out = '', q = null;
    for (let i = 0; i < a.length; i++) {
      const c = a[i];
      if (q) { out += c; if (c === '\\') { out += a[++i] || ''; } else if (c === q) q = null; continue; }
      if (c === '"' || c === "'") { q = c; out += c; continue; }
      out += c === '{' ? '[' : c === '}' ? ']' : c;
    }
    return out;
  }

  function argDecl(type, name, val) {
    if (type === 'ListNode*') return `ListNode* ${name} = mkList(std::vector<int>${val.trim().startsWith('{') ? val : '{' + val + '}'});`;
    if (type === 'TreeNode*') return `TreeNode* ${name} = mkTree(std::vector<int>${val.trim().startsWith('{') ? val : '{' + val + '}'});`;
    return `${type} ${name} = ${val};`;
  }

  // Возвращает { code, shows } — код тестов и подписи тестов для интерфейса
  function buildHarness(p) {
    const mode = MODES[p.cmp || 'eq'];
    const shows = [];
    let body = '';
    p.tests.forEach((t, i) => {
      let run, expect, show;
      if (Array.isArray(t)) {
        const [args, exp, sh] = t;
        const decls = args.map((a, k) => argDecl(p.args[k], 'a' + k, a)).join(' ');
        const call = `${p.fn}(${args.map((_, k) => 'a' + k).join(', ')})`;
        let ret = p.inplace !== undefined ? `${call}; return a${p.inplace};` : `return ${call};`;
        if (p.ret === 'list') ret = `return toVec(${call});`;
        if (p.ret === 'tree') ret = `return treeVec(${call});`;
        run = `${decls} ${ret}`;
        expect = exp;
        show = sh || `${p.fn}(${args.map(prettyArg).join(', ')})`.replace(/\bnil\b/g, 'null');
      } else {
        run = t.run; expect = t.expect; show = t.show;
      }
      shows.push(show);
      const e = expect === 'AUTO' ? 'R{}' : expect.trim().startsWith('{') ? `R${expect}` : `R{${expect}}`;
      body += `  { auto f = [&]() { ${run} }; jd::check<${mode}>(${i}, f, [&]() { using R = decltype(f()); return ${e}; }); }\n`;
    });
    const code = `\n#line 1 "tests.cpp"\n#include "judge.h"\nusing namespace std;\n${p.extra || ''}\nint main() {\n${body}  return jd::finish();\n}\n`;
    return { code, shows };
  }

  // Разбор вывода программы с маркерами тестов
  function parseOutput(out) {
    const cases = {}; let cur = null, summary = null; const free = [];
    for (const line of out.split('\n')) {
      if (line.startsWith('\x1eS')) { cur = +line.slice(2); cases[cur] = { i: cur, out: '' }; continue; }
      if (line.startsWith('\x1eR')) {
        const [i, ok, ms, got, exp] = line.slice(2).split('\x1f');
        Object.assign(cases[+i] || (cases[+i] = { i: +i, out: '' }), { done: true, ok: ok === '1', ms: +ms, got, exp });
        cur = null; continue;
      }
      if (line.startsWith('\x1eE')) { const [p, t] = line.slice(2).split('\x1f'); summary = { passed: +p, total: +t }; continue; }
      if (cur !== null) cases[cur].out += line + '\n'; else if (line !== '' || free.length) free.push(line);
    }
    return { cases, summary, free: free.join('\n').trim() };
  }

  const api = { JUDGE_H, buildHarness, parseOutput, prettyArg };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else Object.assign(root, api);
})(typeof self !== 'undefined' ? self : this);
