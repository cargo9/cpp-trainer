// Мини-учебник: что нужно знать для задачи. Каждое понятие объясняется в первой задаче,
// где оно нужно; в следующих задачах оно уже не повторяется (только в списке «уже знаешь»).
(function (root) {
  const C = {
    func: { t: 'Функция и return', h: `<p>Функция — это кусок кода с именем. Слева от имени пишется тип результата, в скобках — входные данные (параметры). <code>return</code> отдаёт результат и сразу завершает функцию.</p>
<pre>int twice(int x) {   // принимает int, возвращает int
    return x * 2;
}</pre>
<p>В задачах ты пишешь только функцию. Проверка сама вызовет её с разными числами и сравнит ответ.</p>` },
    arith: { t: 'Числа int и арифметика', h: `<p><code>int</code> — целое число (примерно до ±2 миллиардов). Операции: <code>+</code> <code>-</code> <code>*</code> <code>/</code>. Порядок как в математике, скобки работают.</p>
<pre>int a = 7, b = 2;
int s = a + b;       // 9
int p = (a + 1) * b; // 16</pre>
<p>Каждая команда заканчивается точкой с запятой <code>;</code>. Забыл её — будет ошибка компиляции.</p>` },
    mod: { t: 'Деление нацело / и остаток %', h: `<p>Если делить <code>int</code> на <code>int</code>, дробная часть отбрасывается. Оператор <code>%</code> даёт остаток.</p>
<pre>17 / 5   // 3
17 % 5   // 2
123 % 10 // 3  — последняя цифра
123 / 10 // 12 — число без последней цифры</pre>` },
    double: { t: 'Дробные числа double', h: `<p><code>double</code> хранит дробные числа: <code>3.14</code>, <code>-0.5</code>. Важная ловушка: если обе части деления целые, деление будет целым.</p>
<pre>int a = 5;
double x = a / 2;    // 2   (сначала 5/2 = 2, потом в double)
double y = a / 2.0;  // 2.5 (2.0 — дробное, деление дробное)</pre>` },
    vars: { t: 'Переменные', h: `<p>Переменная — именованная ячейка. Объявляется так: тип, имя, начальное значение. Потом её можно менять.</p>
<pre>int total = 0;
total = total + 5;  // теперь 5
total += 3;         // то же самое короче: теперь 8
total++;            // +1: теперь 9</pre>` },
    if: { t: 'if / else и сравнения', h: `<p><code>if</code> выполняет код, только если условие верно. Сравнения: <code>&lt;</code> <code>&gt;</code> <code>&lt;=</code> <code>&gt;=</code> <code>==</code> (равно, два знака!) <code>!=</code> (не равно).</p>
<pre>if (x < 0) {
    return -x;
} else {
    return x;
}</pre>
<p>Частая ошибка: <code>if (x = 5)</code> присваивает, а не сравнивает. Нужно <code>==</code>.</p>` },
    bool: { t: 'Тип bool: true / false', h: `<p><code>bool</code> хранит «да» или «нет»: <code>true</code> или <code>false</code>. Результат сравнения уже является bool, его можно сразу вернуть.</p>
<pre>bool isPositive(int n) {
    return n > 0;   // вместо if (n > 0) return true; else return false;
}</pre>` },
    elseif: { t: 'Цепочка else if', h: `<p>Когда вариантов больше двух, условия проверяются по очереди сверху вниз. Срабатывает первое верное.</p>
<pre>if (t < 0)       cout << "мороз";
else if (t < 20) cout << "прохладно";
else             cout << "тепло";</pre>` },
    char: { t: 'Тип char: один символ', h: `<p><code>char</code> — один символ. Пишется в <b>одинарных</b> кавычках: <code>'A'</code>, <code>'7'</code>, <code>' '</code>. Двойные кавычки <code>"A"</code> — это уже строка.</p>
<pre>char c = 'B';
if (c == 'B') { ... }</pre>` },
    logic: { t: 'Логика: && (и), || (или), ! (не)', h: `<p>Условия можно комбинировать.</p>
<pre>if (x > 0 && x < 10)   // x от 1 до 9: оба условия верны
if (c == 'a' || c == 'e') // хотя бы одно верно
if (!found)             // found == false</pre>
<p>Скобки помогают не запутаться: <code>(a && b) || c</code>.</p>` },
    for: { t: 'Цикл for', h: `<p><code>for</code> повторяет код. Три части в скобках: с чего начать; пока что верно; что делать после каждого шага.</p>
<pre>for (int i = 1; i <= 5; i++) {
    cout << i << " ";   // 1 2 3 4 5
}</pre>
<p>Типичный приём — накопление: заводим переменную до цикла и меняем её внутри.</p>
<pre>int sum = 0;
for (int i = 1; i <= n; i++) sum += i;</pre>` },
    longlong: { t: 'long long: большие числа', h: `<p><code>int</code> переполняется после ~2·10⁹ и начинает выдавать мусор. Для больших чисел есть <code>long long</code>, до ~9·10¹⁸.</p>
<pre>long long big = 1;
for (int i = 1; i <= 20; i++) big *= i;  // 20! влезает только в long long</pre>` },
    while: { t: 'Цикл while', h: `<p><code>while</code> повторяет, пока условие верно. Удобен, когда заранее неизвестно, сколько будет шагов.</p>
<pre>while (n > 0) {
    int digit = n % 10;  // последняя цифра
    n /= 10;             // отрезали её
}</pre>
<p>Следи, чтобы условие когда-нибудь стало ложным, иначе будет бесконечный цикл.</p>` },
    early: { t: 'Ранний return из цикла', h: `<p><code>return</code> внутри цикла сразу завершает всю функцию. Удобно для поиска: нашли — вернули, не нашли — вернём после цикла.</p>
<pre>for (int i = 2; i < n; i++) {
    if (n % i == 0) return false;  // нашли делитель — дальше не ищем
}
return true;</pre>
<p>Ещё есть <code>break</code> — выходит только из цикла, а не из функции.</p>` },
    sqrt: { t: 'Перебор до корня: i * i <= n', h: `<p>Если у числа есть делитель больше √n, то есть и парный меньше √n. Поэтому проверять хватит до корня — это в тысячи раз быстрее.</p>
<pre>for (long long i = 2; i * i <= n; i++) { ... }</pre>
<p><code>long long</code> нужен, чтобы <code>i * i</code> не переполнился.</p>` },
    string: { t: 'Строки string', h: `<p><code>string</code> — текст в <b>двойных</b> кавычках. Длина: <code>s.size()</code>. Символ по номеру: <code>s[i]</code> (номера с нуля). Каждый символ — это <code>char</code>.</p>
<pre>string s = "hello";
s.size();   // 5
s[0];       // 'h'
s[4];       // 'o'  (последний — s[s.size() - 1])</pre>` },
    forrange: { t: 'Перебор: for (x : коллекция)', h: `<p>Короткий цикл «для каждого элемента». Работает со строками и массивами.</p>
<pre>for (char c : s) { ... }     // каждый символ строки
for (int x : nums) { ... }   // каждый элемент массива</pre>
<p>Если элемент нужно изменить на месте, пиши <code>&</code>: <code>for (char &c : s) c = toupper(c);</code></p>` },
    swap: { t: 'swap и два указателя', h: `<p><code>swap(a, b)</code> меняет значения местами. Приём «два указателя»: один индекс идёт с начала, другой с конца, навстречу друг другу.</p>
<pre>int i = 0, j = s.size() - 1;
while (i < j) {
    swap(s[i], s[j]);
    i++; j--;
}</pre>` },
    cctype: { t: 'Функции для символов', h: `<p>Готовые функции для одного символа:</p>
<pre>toupper('a')  // 'A'
tolower('Q')  // 'q'
isalpha(c)    // буква?
isdigit(c)    // цифра?
isalnum(c)    // буква или цифра?
isspace(c)    // пробел?</pre>` },
    concat: { t: 'Склейка строк', h: `<p>Строки складываются плюсом. <code>+=</code> дописывает в конец.</p>
<pre>string r = "";
r += "ab";      // "ab"
r += 'c';       // "abc" — можно и символ
string t = r + "!"; // "abc!"</pre>` },
    vector: { t: 'Массив vector', h: `<p><code>vector&lt;int&gt;</code> — список чисел. Размер: <code>nums.size()</code>. Элемент: <code>nums[i]</code> (с нуля). В тестах массив показан как <code>[1,2,3]</code>.</p>
<pre>vector&lt;int&gt; nums = {5, 3, 8};
nums.size();  // 3
nums[0];      // 5
for (int i = 0; i < (int)nums.size(); i++) { ... } // по индексам
for (int x : nums) { ... }                         // по значениям</pre>
<p><code>(int)</code> перед size() убирает предупреждение о сравнении знакового и беззнакового числа.</p>` },
    ref: { t: 'Параметр по ссылке &', h: `<p><code>vector&lt;int&gt;&amp; nums</code> — знак <code>&amp;</code> значит «работаем с тем же массивом, без копии». Это быстрее, а изменения видны снаружи функции. Так принято на LeetCode.</p>
<pre>void addOne(vector&lt;int&gt;& v) {
    for (int &x : v) x++;   // меняем оригинал
}</pre>` },
    pushback: { t: 'push_back: добавить в конец', h: `<p>Пустой массив создаётся без элементов, а <code>push_back</code> дописывает в конец.</p>
<pre>vector&lt;int&gt; r;     // []
r.push_back(4);     // [4]
r.push_back(7);     // [4,7]
return r;</pre>
<p>Можно вернуть массив сразу: <code>return {1, 2};</code> или пустой: <code>return {};</code></p>` },
    tostring: { t: 'to_string: число в строку', h: `<pre>string s = to_string(42);   // "42"
int n = stoi("123");        // обратно: 123</pre>` },
    fibvars: { t: 'Две переменные «предыдущих»', h: `<p>Когда новое значение зависит от двух прошлых, храни их в двух переменных и сдвигай на каждом шаге.</p>
<pre>long long a = 0, b = 1;
for (...) {
    long long next = a + b;
    a = b;
    b = next;
}</pre>` },
    // ───── Лёгкий и дальше ─────
    umap: { t: 'unordered_map: словарь', h: `<p>Хранит пары «ключ → значение», поиск почти мгновенный (O(1)).</p>
<pre>unordered_map&lt;string, int&gt; age;
age["Ann"] = 20;
age["Ann"]++;                 // 21
if (age.count("Bob")) { ... } // есть ли ключ
auto it = age.find("Ann");
if (it != age.end()) cout << it->second;
for (auto& [k, v] : age) { ... } // перебор пар</pre>
<p>Если ключа нет, <code>m[key]</code> создаст его со значением 0.</p>` },
    uset: { t: 'unordered_set: множество', h: `<p>Хранит уникальные значения, проверка «есть ли» за O(1).</p>
<pre>unordered_set&lt;int&gt; seen;
seen.insert(5);
if (seen.count(5)) { ... }        // есть
if (!seen.insert(x).second) { ... } // x уже был</pre>` },
    counting: { t: 'Подсчёт в массиве-счётчике', h: `<p>Для маленьких латинских букв удобно считать в массиве из 26 ячеек: индекс — буква.</p>
<pre>int cnt[26] = {0};
for (char c : s) cnt[c - 'a']++;  // 'a'→0, 'b'→1, ...</pre>` },
    minmax: { t: 'min, max и INT_MAX', h: `<pre>min(a, b)      // меньшее
max(a, b)      // большее
INT_MAX        // самое большое int — удобно как «бесконечность»
INT_MIN        // самое маленькое
min({a, b, c}) // минимум из нескольких</pre>` },
    stack: { t: 'Стек stack', h: `<p>Стопка тарелок: кладём сверху, берём сверху.</p>
<pre>stack&lt;char&gt; st;
st.push('(');
st.top();     // посмотреть верхний
st.pop();     // убрать верхний
st.empty();   // пустой?</pre>` },
    binsearch: { t: 'Бинарный поиск', h: `<p>В отсортированном массиве смотрим в середину и отбрасываем половину, где ответа точно нет. O(log n): миллион элементов за 20 шагов.</p>
<pre>int lo = 0, hi = n - 1;
while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    if (a[mid] == x) return mid;
    if (a[mid] < x) lo = mid + 1; else hi = mid - 1;
}</pre>` },
    sort: { t: 'Сортировка sort', h: `<pre>sort(v.begin(), v.end());              // по возрастанию
sort(v.rbegin(), v.rend());            // по убыванию
sort(s.begin(), s.end());              // строку тоже можно</pre>
<p>Работает за O(n log n). Пары сортируются по первому элементу, потом по второму.</p>` },
    switchst: { t: 'switch и лямбда', h: `<p><code>switch</code> выбирает ветку по значению. Лямбда — маленькая функция прямо внутри кода.</p>
<pre>auto value = [](char c) {
    switch (c) {
        case 'I': return 1;
        case 'V': return 5;
        default:  return 0;
    }
};
int x = value('V');  // 5</pre>` },
    dp: { t: 'Динамическое программирование', h: `<p>Ответ для большой задачи собирается из ответов для меньших. Заводим массив <code>dp</code>, где <code>dp[i]</code> — ответ для размера i, и заполняем по порядку.</p>
<pre>vector&lt;int&gt; dp(n + 1);
dp[0] = 1; dp[1] = 1;
for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];</pre>` },
    pointers: { t: 'Указатели и связный список', h: `<p>Узел списка хранит значение и указатель <code>next</code> на следующий узел. <code>nullptr</code> — «никуда», конец списка. К полям через указатель обращаются стрелкой <code>-&gt;</code>.</p>
<pre>ListNode* cur = head;
while (cur != nullptr) {
    cout << cur->val;
    cur = cur->next;
}</pre>` },
    recursion: { t: 'Рекурсия и деревья', h: `<p>Рекурсия — функция вызывает саму себя для меньшей части задачи. Обязательно нужен базовый случай, где она останавливается. С деревьями это самый естественный способ.</p>
<pre>int count(TreeNode* root) {
    if (root == nullptr) return 0;   // базовый случай
    return 1 + count(root->left) + count(root->right);
}</pre>` },
    window: { t: 'Скользящее окно', h: `<p>Два индекса <code>l</code> и <code>r</code> задают «окно». <code>r</code> расширяет его вправо, <code>l</code> сжимает, когда окно стало плохим. Каждый индекс проходит массив один раз: O(n).</p>
<pre>int l = 0;
for (int r = 0; r < n; r++) {
    // добавить s[r] в окно
    while (/* окно плохое */) { /* убрать s[l] */ l++; }
    // обновить ответ
}</pre>` },
    vector2d: { t: 'Двумерный vector', h: `<pre>vector&lt;vector&lt;int&gt;&gt; g(n, vector&lt;int&gt;(m, 0)); // n строк по m нулей
g[i][j] = 5;
g.size();      // строк
g[0].size();   // столбцов</pre>` },
    queue: { t: 'Очередь queue и BFS', h: `<p>Очередь: добавляем в конец, берём из начала. Обход в ширину (BFS) обрабатывает сначала ближайшие клетки или вершины.</p>
<pre>queue&lt;int&gt; q;
q.push(start);
while (!q.empty()) {
    int v = q.front(); q.pop();
    // добавить в q соседей v
}</pre>` },
    pair: { t: 'pair и auto', h: `<pre>pair&lt;int, int&gt; p = {3, 4};
p.first;   // 3
p.second;  // 4
auto [x, y] = p;   // распаковка
auto v = 5;        // auto сам выводит тип</pre>` },
    heap: { t: 'Куча priority_queue', h: `<p>Всегда отдаёт наибольший элемент за O(log n). Для наименьшего добавь <code>greater</code>.</p>
<pre>priority_queue&lt;int&gt; maxq;
priority_queue&lt;int, vector&lt;int&gt;, greater&lt;int&gt;&gt; minq;
maxq.push(5);
maxq.top();  // наибольший
maxq.pop();</pre>` },
    classes: { t: 'Класс class', h: `<p>Класс объединяет данные (поля) и функции (методы). Поля обычно в <code>private</code>, методы в <code>public</code>.</p>
<pre>class Counter {
    int value = 0;          // поле
public:
    void inc() { value++; } // метод
    int get() { return value; }
};
Counter c; c.inc(); c.get(); // 1</pre>` },
    backtrack: { t: 'Перебор с возвратом', h: `<p>Строим ответ по шагам: пробуем вариант, уходим глубже рекурсией, потом откатываем выбор и пробуем следующий.</p>
<pre>void go(int i, vector&lt;int&gt;& cur) {
    if (i == n) { save(cur); return; }
    go(i + 1, cur);           // не берём nums[i]
    cur.push_back(nums[i]);
    go(i + 1, cur);           // берём
    cur.pop_back();           // откат
}</pre>` },
    graph: { t: 'Графы: список смежности', h: `<p>Граф хранят как массив списков: <code>g[v]</code> — соседи вершины v.</p>
<pre>vector&lt;vector&lt;int&gt;&gt; g(n);
for (auto& e : edges) g[e[0]].push_back(e[1]);
for (int u : g[v]) { ... }  // соседи v</pre>` },
    list: { t: 'list и итераторы', h: `<p><code>list</code> — двусвязный список: вставка и удаление в любом месте за O(1). Итератор — «указатель» на элемент контейнера.</p>
<pre>list&lt;int&gt; L = {1, 2, 3};
auto it = L.begin();      // на первый
L.push_front(0);
L.splice(L.begin(), L, it); // перенести элемент в начало
L.erase(it);</pre>` },
    lowerbound: { t: 'lower_bound', h: `<p>В отсортированном массиве находит первый элемент ≥ x за O(log n).</p>
<pre>auto it = lower_bound(v.begin(), v.end(), x);
if (it == v.end()) { /* все меньше x */ }
int index = it - v.begin();</pre>` },
    deque: { t: 'Дека deque и монотонный стек', h: `<p><code>deque</code> позволяет добавлять и удалять с обоих концов. Монотонная дека или стек хранит элементы в порядке возрастания или убывания и выкидывает тех, кто уже никогда не станет ответом.</p>
<pre>deque&lt;int&gt; dq;
dq.push_back(i); dq.pop_back();
dq.push_front(i); dq.pop_front();
dq.front(); dq.back();</pre>` },
    bits: { t: 'Битовые операции', h: `<pre>1 << n        // 2 в степени n
mask >> i & 1 // i-й бит маски
a | b         // объединение битов
a & ~b        // убрать биты b
x & -x        // младший единичный бит</pre>` },
    sstream: { t: 'istringstream и function', h: `<p><code>istringstream</code> читает из строки так же, как <code>cin</code> из клавиатуры. <code>function</code> позволяет лямбде вызывать саму себя.</p>
<pre>istringstream in("12 # 5");
string tok; in >> tok;   // "12"
function&lt;int(int)&gt; f = [&](int n) { return n ? n + f(n - 1) : 0; };</pre>` },
  };

  // Какие понятия нужны в каждой задаче
  const L = {
    sum: ['func', 'arith'], square: [], minutes: ['vars'], lastdigit: ['mod'], average: ['double'], celsius: [],
    absval: ['if'], max3: [], even: ['bool'], sign: ['elseif'], grade: ['char'], leap: ['logic'],
    sumto: ['for'], fact: ['longlong'], power: [], divisors: [], digits: ['while'], fib: ['fibvars'], prime: ['early', 'sqrt'],
    countchar: ['string', 'forrange'], revstr: ['swap'], upper: ['cctype'], vowels: [], palin: [], repeat: ['concat'],
    arrsum: ['vector', 'ref'], arrmax: [], counteven: [], indexof: [], revarr: ['pushback'], multiples: [], fizz: ['tostring'],
    twosum: ['umap'], runsum: [], dup: ['uset'], anagram: ['counting'], stock: ['minmax'], zeroes: [], parens: ['stack'],
    merge2: [], bsearch: ['binsearch'], major: [], roman: ['switchst'], stairs: ['dp'], revlist: ['pointers'], depth: ['recursion'],
    lswr: ['window'], groupana: ['sort'], product: [], kadane: [], water: [], '3sum': [], topk: ['pair'], islands: ['vector2d', 'queue'],
    intervals: [], coins: [], subsets: ['backtrack', 'bits'], levelorder: [], minstack: ['classes'], rotated: [], paths: [],
    lru: ['list'], lis: ['lowerbound'], edit: [], wordbreak: [], courses: ['graph'], dijkstra: ['heap'], mergek: [],
    trap: [], median2: [], slidemax: ['deque'], minwin: [], histogram: [], nqueens: [], regex: [], codec: ['sstream'], medianstream: [],
  };

  // Повторение уже пройденного, которое пригодится в задаче (показывается свёрнутым)
  const R = {
    square: ['func', 'arith'], minutes: ['arith'], celsius: ['double'], max3: ['if'], even: ['mod', 'if'], sign: ['if'], grade: ['if'],
    leap: ['mod', 'bool'], power: ['for', 'longlong'], divisors: ['for', 'mod', 'if'], digits: ['mod'], prime: ['for', 'mod'],
    revstr: ['string'], vowels: ['forrange', 'cctype', 'logic'], palin: ['swap', 'cctype', 'while'], repeat: ['for', 'string'],
    arrmax: ['vector', 'forrange', 'if'], counteven: ['vector', 'mod'], indexof: ['vector', 'early'], multiples: ['pushback', 'for'],
    fizz: ['pushback', 'elseif', 'mod'], runsum: ['vector', 'ref'], zeroes: ['vector', 'ref'], merge2: ['pushback'], major: ['vector'],
    product: ['vector'], kadane: ['minmax'], water: ['swap', 'minmax'], '3sum': ['sort', 'swap'], intervals: ['sort', 'vector2d'],
    coins: ['dp', 'minmax'], levelorder: ['queue', 'recursion'], rotated: ['binsearch'], paths: ['dp'], edit: ['dp', 'vector2d'],
    wordbreak: ['dp', 'uset'], mergek: ['heap', 'pointers'], trap: ['swap'], median2: ['binsearch'], minwin: ['window'],
    histogram: ['stack'], nqueens: ['backtrack', 'bits'], regex: ['dp'], medianstream: ['heap', 'classes'], groupana: ['umap'],
    topk: ['umap', 'sort'], lru: ['umap', 'classes'], courses: ['queue'], dijkstra: ['graph'], codec: ['recursion', 'classes'],
  };

  const api = { CONCEPTS: C, LEARN: L, REVIEW: R };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else Object.assign(root, api);
})(typeof self !== 'undefined' ? self : this);
