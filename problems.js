// Задачи тренажёра. starter и sol пишутся без шапки: приложение само добавит
// #include <bits/stdc++.h> / using namespace std; и нужные структуры (ListNode, TreeNode).
(function (root) {
  const LIST_STRUCT = `struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};
`;
  const LIST_EXTRA = `ListNode* mkList(const std::vector<int>& v) { ListNode d(0); ListNode* t = &d; for (int x : v) { t->next = new ListNode(x); t = t->next; } return d.next; }
std::vector<int> toVec(ListNode* h) { std::vector<int> r; int guard = 0; while (h && guard++ < 1000000) { r.push_back(h->val); h = h->next; } return r; }
`;
  const TREE_STRUCT = `struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};
`;
  const TREE_EXTRA = `const int nil = INT_MIN;
TreeNode* mkTree(const std::vector<int>& v) {
  if (v.empty() || v[0] == nil) return nullptr;
  TreeNode* r = new TreeNode(v[0]); std::queue<TreeNode*> q; q.push(r); size_t i = 1;
  while (!q.empty() && i < v.size()) {
    TreeNode* n = q.front(); q.pop();
    if (i < v.size() && v[i] != nil) { n->left = new TreeNode(v[i]); q.push(n->left); } i++;
    if (i < v.size() && v[i] != nil) { n->right = new TreeNode(v[i]); q.push(n->right); } i++;
  }
  return r;
}
std::vector<int> treeVec(TreeNode* r) {
  std::vector<int> out; std::queue<TreeNode*> q; q.push(r);
  while (!q.empty()) { TreeNode* n = q.front(); q.pop(); if (n) { out.push_back(n->val); q.push(n->left); q.push(n->right); } else out.push_back(nil); }
  while (!out.empty() && out.back() == nil) out.pop_back();
  return out;
}
`;

  const LEVELS = [
    { id: 0, name: 'Основы', color: '#a371f7', about: 'Самое начало: функция, return, арифметика, if/else. Жми «📘 Что нужно знать», если не знаешь, как сделать.' },
    { id: 1, name: 'Разминка', color: '#3fb950', about: 'Циклы, строки и первые массивы (vector).' },
    { id: 2, name: 'Лёгкий', color: '#58a6ff', about: 'Массивы, строки, хеш-таблицы, первые структуры.' },
    { id: 3, name: 'Средний', color: '#d29922', about: 'Два указателя, окна, графы, DP, деревья.' },
    { id: 4, name: 'Сложный', color: '#f0883e', about: 'Классика собеседований: LRU, DP, топосорт, Дейкстра.' },
    { id: 5, name: 'Про', color: '#f85149', about: 'Hard с LeetCode. Есть тесты на скорость.' },
  ];

  const VI = 'vector<int>', VVI = 'vector<vector<int>>', VS = 'vector<string>';

  const P = [
    // ───────────── 1. Разминка ─────────────
    {
      id: 'sum', lvl: 0, title: 'Сумма двух чисел', fn: 'sum', args: ['int', 'int'],
      desc: `<p>Напиши функцию, которая возвращает сумму двух целых чисел <code>a</code> и <code>b</code>.</p>
<pre>sum(2, 3) → 5
sum(-4, 10) → 6</pre>`,
      starter: `int sum(int a, int b) {
    // твой код
    return 0;
}`,
      tests: [[['2', '3'], '5'], [['-4', '10'], '6'], [['0', '0'], '0'], [['1000000', '2000000'], '3000000'], [['-7', '-8'], '-15']],
      hint: 'Просто верни a + b.',
      sol: `int sum(int a, int b) {
    return a + b;
}`,
    },
    {
      id: 'max3', lvl: 0, title: 'Максимум из трёх', fn: 'maxOfThree', args: ['int', 'int', 'int'],
      desc: `<p>Верни наибольшее из трёх чисел. Попробуй без <code>std::max</code>, только через <code>if</code>.</p>
<pre>maxOfThree(1, 2, 3) → 3
maxOfThree(-3, -7, -1) → -1</pre>`,
      starter: `int maxOfThree(int a, int b, int c) {
    return 0;
}`,
      tests: [[['1', '2', '3'], '3'], [['5', '-1', '2'], '5'], [['-3', '-7', '-1'], '-1'], [['4', '4', '2'], '4'], [['0', '9', '9'], '9']],
      hint: 'Заведи переменную best = a, потом сравни её с b и c.',
      sol: `int maxOfThree(int a, int b, int c) {
    int best = a;
    if (b > best) best = b;
    if (c > best) best = c;
    return best;
}`,
    },
    {
      id: 'even', lvl: 0, title: 'Чётное или нет', fn: 'isEven', args: ['int'],
      desc: `<p>Верни <code>true</code>, если число чётное, иначе <code>false</code>. Учти отрицательные числа.</p>
<pre>isEven(4) → true
isEven(-5) → false</pre>`,
      starter: `bool isEven(int n) {
    return false;
}`,
      tests: [[['4'], 'true'], [['7'], 'false'], [['0'], 'true'], [['-2'], 'true'], [['-5'], 'false']],
      hint: 'Остаток от деления: n % 2. В C++ для отрицательных он может быть -1, поэтому сравнивай с нулём.',
      sol: `bool isEven(int n) {
    return n % 2 == 0;
}`,
    },
    {
      id: 'fact', lvl: 1, title: 'Факториал', fn: 'factorial', args: ['int'],
      desc: `<p>Верни <code>n!</code> = 1·2·…·n. По определению <code>0! = 1</code>. <code>0 ≤ n ≤ 20</code>.</p>
<p>Подумай, какой тип нужен: <code>20!</code> не влезает в <code>int</code>.</p>
<pre>factorial(5) → 120</pre>`,
      starter: `long long factorial(int n) {
    return 0;
}`,
      tests: [[['0'], '1'], [['1'], '1'], [['5'], '120'], [['10'], '3628800'], [['20'], '2432902008176640000']],
      hint: 'Цикл от 2 до n, копи произведение в long long.',
      sol: `long long factorial(int n) {
    long long r = 1;
    for (int i = 2; i <= n; i++) r *= i;
    return r;
}`,
    },
    {
      id: 'digits', lvl: 1, title: 'Сумма цифр', fn: 'digitSum', args: ['int'],
      desc: `<p>Дано неотрицательное число <code>n</code>. Верни сумму его цифр.</p>
<pre>digitSum(123) → 6
digitSum(9999) → 36</pre>`,
      starter: `int digitSum(int n) {
    return 0;
}`,
      tests: [[['0'], '0'], [['7'], '7'], [['123'], '6'], [['9999'], '36'], [['1000000'], '1'], [['2147483647'], '46']],
      hint: 'n % 10 даёт последнюю цифру, n / 10 её отрезает. Повторяй, пока n > 0.',
      sol: `int digitSum(int n) {
    int s = 0;
    while (n > 0) { s += n % 10; n /= 10; }
    return s;
}`,
    },
    {
      id: 'fizz', lvl: 1, title: 'FizzBuzz', fn: 'fizzBuzz', args: ['int'],
      desc: `<p>Верни массив строк для чисел от 1 до <code>n</code>: если число делится на 3 и на 5, то <code>"FizzBuzz"</code>, на 3 — <code>"Fizz"</code>, на 5 — <code>"Buzz"</code>, иначе само число строкой.</p>
<pre>fizzBuzz(5) → ["1","2","Fizz","4","Buzz"]</pre>`,
      starter: `vector<string> fizzBuzz(int n) {
    vector<string> res;
    return res;
}`,
      tests: [[['1'], '{"1"}'], [['3'], '{"1","2","Fizz"}'], [['5'], '{"1","2","Fizz","4","Buzz"}'],
        [['15'], '{"1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"}']],
      hint: 'Сначала проверяй делимость на 15, потом на 3 и на 5. Число в строку: to_string(i).',
      sol: `vector<string> fizzBuzz(int n) {
    vector<string> res;
    for (int i = 1; i <= n; i++) {
        if (i % 15 == 0) res.push_back("FizzBuzz");
        else if (i % 3 == 0) res.push_back("Fizz");
        else if (i % 5 == 0) res.push_back("Buzz");
        else res.push_back(to_string(i));
    }
    return res;
}`,
    },
    {
      id: 'revstr', lvl: 1, title: 'Разворот строки', fn: 'reverseString', args: ['string'],
      desc: `<p>Верни строку задом наперёд. Попробуй сделать двумя указателями, без <code>std::reverse</code>.</p>
<pre>reverseString("hello") → "olleh"</pre>`,
      starter: `string reverseString(string s) {
    return s;
}`,
      tests: [[['"hello"'], '"olleh"'], [['""'], '""'], [['"a"'], '"a"'], [['"C++ rocks"'], '"skcor ++C"'], [['"abcd"'], '"dcba"']],
      hint: 'i = 0, j = s.size() - 1; пока i < j: swap(s[i], s[j]), i++, j--.',
      sol: `string reverseString(string s) {
    int i = 0, j = (int)s.size() - 1;
    while (i < j) swap(s[i++], s[j--]);
    return s;
}`,
    },
    {
      id: 'vowels', lvl: 1, title: 'Подсчёт гласных', fn: 'countVowels', args: ['string'],
      desc: `<p>Посчитай количество английских гласных <code>a e i o u</code> в строке, без учёта регистра.</p>
<pre>countVowels("hello") → 2
countVowels("AEIOU xyz") → 5</pre>`,
      starter: `int countVowels(string s) {
    return 0;
}`,
      tests: [[['"hello"'], '2'], [['"AEIOU xyz"'], '5'], [['"rhythm"'], '0'], [['""'], '0'], [['"Programming In CPP"'], '4']],
      hint: 'tolower(c), потом проверь, входит ли символ в строку "aeiou" (string::find или switch).',
      sol: `int countVowels(string s) {
    int cnt = 0;
    for (char c : s) {
        char l = tolower(c);
        if (l == 'a' || l == 'e' || l == 'i' || l == 'o' || l == 'u') cnt++;
    }
    return cnt;
}`,
    },
    {
      id: 'prime', lvl: 1, title: 'Простое число', fn: 'isPrime', args: ['int'],
      desc: `<p>Верни <code>true</code>, если <code>n</code> простое. <code>0 ≤ n ≤ 2·10⁹</code>.</p>
<p>Перебор до <code>n</code> слишком медленный для больших чисел: подумай, до какой границы достаточно проверять делители.</p>
<pre>isPrime(17) → true
isPrime(21) → false</pre>`,
      starter: `bool isPrime(int n) {
    return false;
}`,
      tests: [[['0'], 'false'], [['1'], 'false'], [['2'], 'true'], [['17'], 'true'], [['21'], 'false'], [['97'], 'true'], [['1000000007'], 'true'], [['2147483647'], 'true'], [['1000000000'], 'false']],
      hint: 'Делители достаточно проверять до √n. Пиши условие как (long long)i * i <= n, чтобы не было переполнения.',
      sol: `bool isPrime(int n) {
    if (n < 2) return false;
    for (long long i = 2; i * i <= n; i++)
        if (n % i == 0) return false;
    return true;
}`,
    },
    {
      id: 'palin', lvl: 1, title: 'Палиндром', fn: 'isPalindrome', args: ['string'],
      desc: `<p>Строка — палиндром, если после удаления всех символов, кроме букв и цифр, и перевода в нижний регистр она читается одинаково в обе стороны. <i>(LeetCode 125)</i></p>
<pre>isPalindrome("A man, a plan, a canal: Panama") → true
isPalindrome("race a car") → false</pre>`,
      starter: `bool isPalindrome(string s) {
    return false;
}`,
      tests: [[['"A man, a plan, a canal: Panama"'], 'true'], [['"race a car"'], 'false'], [['" "'], 'true'], [['"0P"'], 'false'], [['"Was it a car or a cat I saw?"'], 'true']],
      hint: 'Два указателя с краёв. Пропускай символы, где isalnum(c) == false. Сравнивай tolower.',
      sol: `bool isPalindrome(string s) {
    int i = 0, j = (int)s.size() - 1;
    while (i < j) {
        if (!isalnum((unsigned char)s[i])) { i++; continue; }
        if (!isalnum((unsigned char)s[j])) { j--; continue; }
        if (tolower(s[i]) != tolower(s[j])) return false;
        i++; j--;
    }
    return true;
}`,
    },

    // ───────────── 2. Лёгкий ─────────────
    {
      id: 'twosum', lvl: 2, title: 'Two Sum', fn: 'twoSum', args: [VI, 'int'], cmp: 'unordered',
      desc: `<p>Дан массив <code>nums</code> и число <code>target</code>. Верни индексы двух разных элементов, сумма которых равна <code>target</code>. Ответ ровно один, порядок индексов не важен. <i>(LeetCode 1)</i></p>
<pre>twoSum([2,7,11,15], 9) → [0,1]</pre>
<p>Цель: O(n) вместо O(n²).</p>`,
      starter: `vector<int> twoSum(vector<int>& nums, int target) {
    return {};
}`,
      tests: [[['{2,7,11,15}', '9'], '{0,1}'], [['{3,2,4}', '6'], '{1,2}'], [['{3,3}', '6'], '{0,1}'], [['{-1,-2,-3,-4,-5}', '-8'], '{2,4}'], [['{0,4,3,0}', '0'], '{0,3}']],
      hint: 'unordered_map<int,int> «значение → индекс». Для каждого x ищи в map target - x, потом добавляй x.',
      sol: `vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < (int)nums.size(); i++) {
        auto it = seen.find(target - nums[i]);
        if (it != seen.end()) return {it->second, i};
        seen[nums[i]] = i;
    }
    return {};
}`,
    },
    {
      id: 'runsum', lvl: 2, title: 'Префиксные суммы', fn: 'runningSum', args: [VI],
      desc: `<p>Верни массив, где <code>i</code>-й элемент равен сумме <code>nums[0..i]</code>. <i>(LeetCode 1480)</i></p>
<pre>runningSum([1,2,3,4]) → [1,3,6,10]</pre>`,
      starter: `vector<int> runningSum(vector<int>& nums) {
    return nums;
}`,
      tests: [[['{1,2,3,4}'], '{1,3,6,10}'], [['{1,1,1,1,1}'], '{1,2,3,4,5}'], [['{3,1,2,10,1}'], '{3,4,6,16,17}'], [['{5}'], '{5}']],
      hint: 'Иди слева направо: nums[i] += nums[i-1].',
      sol: `vector<int> runningSum(vector<int>& nums) {
    for (size_t i = 1; i < nums.size(); i++) nums[i] += nums[i - 1];
    return nums;
}`,
    },
    {
      id: 'dup', lvl: 2, title: 'Есть ли дубликат', fn: 'containsDuplicate', args: [VI],
      desc: `<p>Верни <code>true</code>, если какое-то значение встречается в массиве хотя бы дважды. <i>(LeetCode 217)</i></p>
<pre>containsDuplicate([1,2,3,1]) → true</pre>`,
      starter: `bool containsDuplicate(vector<int>& nums) {
    return false;
}`,
      tests: [[['{1,2,3,1}'], 'true'], [['{1,2,3,4}'], 'false'], [['{1,1,1,3,3,4,3,2,4,2}'], 'true'], [['{}'], 'false'], [['{-1,1}'], 'false']],
      hint: 'unordered_set: если элемент уже есть в множестве, нашли дубликат.',
      sol: `bool containsDuplicate(vector<int>& nums) {
    unordered_set<int> s;
    for (int x : nums) if (!s.insert(x).second) return true;
    return false;
}`,
    },
    {
      id: 'anagram', lvl: 2, title: 'Анаграмма', fn: 'isAnagram', args: ['string', 'string'],
      desc: `<p>Верни <code>true</code>, если <code>t</code> — перестановка букв <code>s</code>. Строки из маленьких латинских букв. <i>(LeetCode 242)</i></p>
<pre>isAnagram("anagram", "nagaram") → true
isAnagram("rat", "car") → false</pre>`,
      starter: `bool isAnagram(string s, string t) {
    return false;
}`,
      tests: [[['"anagram"', '"nagaram"'], 'true'], [['"rat"', '"car"'], 'false'], [['"a"', '"ab"'], 'false'], [['"listen"', '"silent"'], 'true'], [['""', '""'], 'true']],
      hint: 'Массив int cnt[26]: +1 для букв s, -1 для букв t. В конце все нули.',
      sol: `bool isAnagram(string s, string t) {
    if (s.size() != t.size()) return false;
    int cnt[26] = {0};
    for (size_t i = 0; i < s.size(); i++) { cnt[s[i] - 'a']++; cnt[t[i] - 'a']--; }
    for (int c : cnt) if (c != 0) return false;
    return true;
}`,
    },
    {
      id: 'stock', lvl: 2, title: 'Купить и продать акцию', fn: 'maxProfit', args: [VI],
      desc: `<p><code>prices[i]</code> — цена акции в день <code>i</code>. Купи в один день и продай в другой, позже. Верни максимальную прибыль или 0. <i>(LeetCode 121)</i></p>
<pre>maxProfit([7,1,5,3,6,4]) → 5   // купить за 1, продать за 6</pre>`,
      starter: `int maxProfit(vector<int>& prices) {
    return 0;
}`,
      tests: [[['{7,1,5,3,6,4}'], '5'], [['{7,6,4,3,1}'], '0'], [['{1,2}'], '1'], [['{2,4,1}'], '2'], [['{3,3,5,0,0,3,1,4}'], '4']],
      hint: 'Держи минимальную цену, встреченную до сегодняшнего дня, и обновляй ответ: price - minSoFar.',
      sol: `int maxProfit(vector<int>& prices) {
    int mn = INT_MAX, best = 0;
    for (int p : prices) { mn = min(mn, p); best = max(best, p - mn); }
    return best;
}`,
    },
    {
      id: 'zeroes', lvl: 2, title: 'Сдвинуть нули', fn: 'moveZeroes', args: [VI], inplace: 0,
      desc: `<p>Перенеси все нули в конец массива, сохранив порядок остальных элементов. Меняй массив <b>на месте</b>, функция ничего не возвращает. <i>(LeetCode 283)</i></p>
<pre>[0,1,0,3,12] → [1,3,12,0,0]</pre>`,
      starter: `void moveZeroes(vector<int>& nums) {

}`,
      tests: [[['{0,1,0,3,12}'], '{1,3,12,0,0}'], [['{0}'], '{0}'], [['{1,2,3}'], '{1,2,3}'], [['{0,0,1}'], '{1,0,0}'], [['{4,0,5,0,0,6}'], '{4,5,6,0,0,0}']],
      hint: 'Указатель pos «куда писать следующий ненулевой». Пройди массив, ненулевые ставь в nums[pos++], остаток забей нулями.',
      sol: `void moveZeroes(vector<int>& nums) {
    int pos = 0;
    for (int x : nums) if (x != 0) nums[pos++] = x;
    while (pos < (int)nums.size()) nums[pos++] = 0;
}`,
    },
    {
      id: 'parens', lvl: 2, title: 'Правильные скобки', fn: 'isValid', args: ['string'],
      desc: `<p>Строка из символов <code>()[]{}</code>. Верни <code>true</code>, если скобки расставлены правильно: каждая открытая закрыта скобкой того же типа и в правильном порядке. <i>(LeetCode 20)</i></p>
<pre>isValid("()[]{}") → true
isValid("([)]") → false</pre>`,
      starter: `bool isValid(string s) {
    return false;
}`,
      tests: [[['"()"'], 'true'], [['"()[]{}"'], 'true'], [['"(]"'], 'false'], [['"([)]"'], 'false'], [['"{[]}"'], 'true'], [['"("'], 'false'], [['"]"'], 'false']],
      hint: 'Стек: открывающие кладёшь, на закрывающей проверяешь, что вершина стека — её пара. В конце стек пуст.',
      sol: `bool isValid(string s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') { st.push(c); continue; }
        if (st.empty()) return false;
        char o = st.top(); st.pop();
        if ((c == ')' && o != '(') || (c == ']' && o != '[') || (c == '}' && o != '{')) return false;
    }
    return st.empty();
}`,
    },
    {
      id: 'merge2', lvl: 2, title: 'Слияние отсортированных', fn: 'mergeSorted', args: [VI, VI],
      desc: `<p>Даны два отсортированных массива. Верни один отсортированный массив из всех их элементов за O(n + m), без <code>sort</code>.</p>
<pre>mergeSorted([1,3,5], [2,4,6]) → [1,2,3,4,5,6]</pre>`,
      starter: `vector<int> mergeSorted(vector<int>& a, vector<int>& b) {
    return {};
}`,
      tests: [[['{1,3,5}', '{2,4,6}'], '{1,2,3,4,5,6}'], [['{}', '{1}'], '{1}'], [['{1,2,2}', '{2,3}'], '{1,2,2,2,3}'], [['{-5,0}', '{}'], '{-5,0}'], [['{1,1,1}', '{0,9}'], '{0,1,1,1,9}']],
      hint: 'Два индекса i и j, на каждом шаге бери меньший из a[i] и b[j]. Потом доклей хвосты.',
      sol: `vector<int> mergeSorted(vector<int>& a, vector<int>& b) {
    vector<int> r;
    size_t i = 0, j = 0;
    while (i < a.size() && j < b.size()) r.push_back(a[i] <= b[j] ? a[i++] : b[j++]);
    while (i < a.size()) r.push_back(a[i++]);
    while (j < b.size()) r.push_back(b[j++]);
    return r;
}`,
    },
    {
      id: 'bsearch', lvl: 2, title: 'Бинарный поиск', fn: 'search', args: [VI, 'int'],
      desc: `<p>Массив отсортирован по возрастанию. Верни индекс <code>target</code> или <code>-1</code>. Нужно O(log n). <i>(LeetCode 704)</i></p>
<pre>search([-1,0,3,5,9,12], 9) → 4</pre>`,
      starter: `int search(vector<int>& nums, int target) {
    return -1;
}`,
      tests: [[['{-1,0,3,5,9,12}', '9'], '4'], [['{-1,0,3,5,9,12}', '2'], '-1'], [['{5}', '5'], '0'], [['{1,3}', '3'], '1'], [['{1,3}', '0'], '-1'],
        { show: 'search([0..999999], 777777)  — большой массив', run: 'std::vector<int> a(1000000); for (int i = 0; i < 1000000; i++) a[i] = i; int r = 0; for (int k = 0; k < 2000; k++) r = search(a, 777777); return r;', expect: '777777' }],
      hint: 'lo = 0, hi = n - 1; mid = lo + (hi - lo) / 2; сдвигай нужную границу.',
      sol: `int search(vector<int>& nums, int target) {
    int lo = 0, hi = (int)nums.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;
    }
    return -1;
}`,
    },
    {
      id: 'major', lvl: 2, title: 'Элемент большинства', fn: 'majorityElement', args: [VI],
      desc: `<p>Верни элемент, который встречается больше <code>n/2</code> раз (он гарантированно есть). Попробуй за O(n) времени и O(1) памяти. <i>(LeetCode 169)</i></p>
<pre>majorityElement([2,2,1,1,1,2,2]) → 2</pre>`,
      starter: `int majorityElement(vector<int>& nums) {
    return 0;
}`,
      tests: [[['{3,2,3}'], '3'], [['{2,2,1,1,1,2,2}'], '2'], [['{1}'], '1'], [['{6,5,5}'], '5']],
      hint: 'Алгоритм голосования Бойера–Мура: кандидат и счётчик. Совпало: +1, нет: -1, на нуле меняй кандидата.',
      sol: `int majorityElement(vector<int>& nums) {
    int cand = 0, cnt = 0;
    for (int x : nums) {
        if (cnt == 0) cand = x;
        cnt += (x == cand) ? 1 : -1;
    }
    return cand;
}`,
    },
    {
      id: 'roman', lvl: 2, title: 'Римские цифры', fn: 'romanToInt', args: ['string'],
      desc: `<p>Переведи римское число в целое. I=1, V=5, X=10, L=50, C=100, D=500, M=1000. Если меньшая цифра стоит перед большей, она вычитается (IV = 4). <i>(LeetCode 13)</i></p>
<pre>romanToInt("MCMXCIV") → 1994</pre>`,
      starter: `int romanToInt(string s) {
    return 0;
}`,
      tests: [[['"III"'], '3'], [['"LVIII"'], '58'], [['"MCMXCIV"'], '1994'], [['"IV"'], '4'], [['"MMXXVI"'], '2026']],
      hint: 'Иди слева направо: если значение текущей цифры меньше следующей, вычитай его, иначе прибавляй.',
      sol: `int romanToInt(string s) {
    auto v = [](char c) {
        switch (c) { case 'I': return 1; case 'V': return 5; case 'X': return 10; case 'L': return 50;
                     case 'C': return 100; case 'D': return 500; default: return 1000; }
    };
    int r = 0;
    for (size_t i = 0; i < s.size(); i++) {
        if (i + 1 < s.size() && v(s[i]) < v(s[i + 1])) r -= v(s[i]); else r += v(s[i]);
    }
    return r;
}`,
    },
    {
      id: 'stairs', lvl: 2, title: 'Лестница', fn: 'climbStairs', args: ['int'],
      desc: `<p>До вершины <code>n</code> ступенек, за шаг можно подняться на 1 или 2. Сколькими способами можно дойти до вершины? <code>1 ≤ n ≤ 45</code>. Это первая задача на динамическое программирование. <i>(LeetCode 70)</i></p>
<pre>climbStairs(3) → 3   // 1+1+1, 1+2, 2+1</pre>`,
      starter: `int climbStairs(int n) {
    return 0;
}`,
      tests: [[['1'], '1'], [['2'], '2'], [['3'], '3'], [['5'], '8'], [['45'], '1836311903']],
      hint: 'ways(n) = ways(n-1) + ways(n-2). Рекурсия без запоминания на n=45 будет очень долгой, считай циклом.',
      sol: `int climbStairs(int n) {
    int a = 1, b = 1;
    for (int i = 2; i <= n; i++) { int c = a + b; a = b; b = c; }
    return b;
}`,
    },
    {
      id: 'revlist', lvl: 2, title: 'Развернуть связный список', fn: 'reverseList', args: ['ListNode*'], ret: 'list', pre: LIST_STRUCT, extra: LIST_EXTRA,
      desc: `<p>Дана голова односвязного списка. Разверни список и верни новую голову. <i>(LeetCode 206)</i></p>
<pre>[1,2,3,4,5] → [5,4,3,2,1]</pre>
<p>Структура <code>ListNode</code> уже объявлена в коде, не удаляй её.</p>`,
      starter: `ListNode* reverseList(ListNode* head) {
    return head;
}`,
      tests: [[['{1,2,3,4,5}'], '{5,4,3,2,1}'], [['{1,2}'], '{2,1}'], [['{}'], '{}'], [['{7}'], '{7}']],
      hint: 'Три указателя: prev = nullptr, cur = head. В цикле: next = cur->next; cur->next = prev; prev = cur; cur = next.',
      sol: `ListNode* reverseList(ListNode* head) {
    ListNode* prev = nullptr;
    while (head) { ListNode* nx = head->next; head->next = prev; prev = head; head = nx; }
    return prev;
}`,
    },
    {
      id: 'depth', lvl: 2, title: 'Глубина дерева', fn: 'maxDepth', args: ['TreeNode*'], pre: TREE_STRUCT, extra: TREE_EXTRA,
      desc: `<p>Верни максимальную глубину бинарного дерева: число узлов на самом длинном пути от корня до листа. <i>(LeetCode 104)</i></p>
<p>Дерево в тестах записано по уровням, <code>null</code> — пустой узел.</p>
<pre>[3,9,20,null,null,15,7] → 3</pre>`,
      starter: `int maxDepth(TreeNode* root) {
    return 0;
}`,
      tests: [[['{3,9,20,nil,nil,15,7}'], '3'], [['{1,nil,2}'], '2'], [['{}'], '0'], [['{1,2,3,4,nil,nil,5,6}'], '4']],
      hint: 'Рекурсия: глубина = 1 + max(глубина левого, глубина правого), для nullptr это 0.',
      sol: `int maxDepth(TreeNode* root) {
    if (!root) return 0;
    return 1 + max(maxDepth(root->left), maxDepth(root->right));
}`,
    },

    // ───────────── 3. Средний ─────────────
    {
      id: 'lswr', lvl: 3, title: 'Самая длинная подстрока без повторов', fn: 'lengthOfLongestSubstring', args: ['string'],
      desc: `<p>Верни длину самой длинной подстроки без повторяющихся символов. <i>(LeetCode 3)</i></p>
<pre>"abcabcbb" → 3   // "abc"
"pwwkew"   → 3   // "wke"</pre>`,
      starter: `int lengthOfLongestSubstring(string s) {
    return 0;
}`,
      tests: [[['"abcabcbb"'], '3'], [['"bbbbb"'], '1'], [['"pwwkew"'], '3'], [['""'], '0'], [['" "'], '1'], [['"dvdf"'], '3'], [['"abba"'], '2']],
      hint: 'Скользящее окно [l, r]. Храни последнюю позицию каждого символа; при повторе сдвигай l за предыдущее вхождение.',
      sol: `int lengthOfLongestSubstring(string s) {
    vector<int> last(256, -1);
    int l = 0, best = 0;
    for (int r = 0; r < (int)s.size(); r++) {
        unsigned char c = s[r];
        if (last[c] >= l) l = last[c] + 1;
        last[c] = r;
        best = max(best, r - l + 1);
    }
    return best;
}`,
    },
    {
      id: 'groupana', lvl: 3, title: 'Группы анаграмм', fn: 'groupAnagrams', args: [VS], cmp: 'unordered2',
      desc: `<p>Сгруппируй слова-анаграммы. Порядок групп и слов внутри групп не важен. <i>(LeetCode 49)</i></p>
<pre>["eat","tea","tan","ate","nat","bat"]
→ [["bat"],["nat","tan"],["ate","eat","tea"]]</pre>`,
      starter: `vector<vector<string>> groupAnagrams(vector<string>& strs) {
    return {};
}`,
      tests: [[['{"eat","tea","tan","ate","nat","bat"}'], '{{"bat"},{"nat","tan"},{"ate","eat","tea"}}'], [['{""}'], '{{""}}'], [['{"a"}'], '{{"a"}}'], [['{"abc","bca","xyz","zyx","q"}'], '{{"abc","bca"},{"xyz","zyx"},{"q"}}']],
      hint: 'Ключ группы — отсортированное слово. unordered_map<string, vector<string>>.',
      sol: `vector<vector<string>> groupAnagrams(vector<string>& strs) {
    unordered_map<string, vector<string>> g;
    for (auto& s : strs) { string k = s; sort(k.begin(), k.end()); g[k].push_back(s); }
    vector<vector<string>> res;
    for (auto& [k, v] : g) res.push_back(v);
    return res;
}`,
    },
    {
      id: 'product', lvl: 3, title: 'Произведение без себя', fn: 'productExceptSelf', args: [VI],
      desc: `<p>Верни массив, где <code>res[i]</code> — произведение всех элементов, кроме <code>nums[i]</code>. Без деления, за O(n). <i>(LeetCode 238)</i></p>
<pre>[1,2,3,4] → [24,12,8,6]</pre>`,
      starter: `vector<int> productExceptSelf(vector<int>& nums) {
    return {};
}`,
      tests: [[['{1,2,3,4}'], '{24,12,8,6}'], [['{-1,1,0,-3,3}'], '{0,0,9,0,0}'], [['{2,3}'], '{3,2}'], [['{0,0}'], '{0,0}']],
      hint: 'Произведение слева от i умножь на произведение справа от i. Два прохода: слева направо и справа налево.',
      sol: `vector<int> productExceptSelf(vector<int>& nums) {
    int n = nums.size();
    vector<int> res(n, 1);
    int left = 1;
    for (int i = 0; i < n; i++) { res[i] = left; left *= nums[i]; }
    int right = 1;
    for (int i = n - 1; i >= 0; i--) { res[i] *= right; right *= nums[i]; }
    return res;
}`,
    },
    {
      id: 'kadane', lvl: 3, title: 'Максимальный подмассив', fn: 'maxSubArray', args: [VI],
      desc: `<p>Найди непрерывный подмассив с максимальной суммой и верни эту сумму. <i>(LeetCode 53)</i></p>
<pre>[-2,1,-3,4,-1,2,1,-5,4] → 6   // [4,-1,2,1]</pre>`,
      starter: `int maxSubArray(vector<int>& nums) {
    return 0;
}`,
      tests: [[['{-2,1,-3,4,-1,2,1,-5,4}'], '6'], [['{1}'], '1'], [['{5,4,-1,7,8}'], '23'], [['{-3,-1,-2}'], '-1']],
      hint: 'Алгоритм Кадане: cur = max(x, cur + x), best = max(best, cur).',
      sol: `int maxSubArray(vector<int>& nums) {
    int cur = nums[0], best = nums[0];
    for (size_t i = 1; i < nums.size(); i++) { cur = max(nums[i], cur + nums[i]); best = max(best, cur); }
    return best;
}`,
    },
    {
      id: 'water', lvl: 3, title: 'Контейнер с водой', fn: 'maxArea', args: [VI],
      desc: `<p><code>height[i]</code> — высота вертикальной линии. Выбери две линии, которые вместе с осью образуют контейнер с максимальным объёмом воды. <i>(LeetCode 11)</i></p>
<pre>[1,8,6,2,5,4,8,3,7] → 49</pre>`,
      starter: `int maxArea(vector<int>& height) {
    return 0;
}`,
      tests: [[['{1,8,6,2,5,4,8,3,7}'], '49'], [['{1,1}'], '1'], [['{4,3,2,1,4}'], '16'], [['{1,2,1}'], '2'],
        { show: 'n = 200000 (тест на скорость)', run: 'jd::Rng g(7); std::vector<int> h(200000); for (auto& x : h) x = g.next(0, 10000); return maxArea(h);', expect: '1989551322' }],
      hint: 'Два указателя с краёв. Двигай тот, у которого линия ниже: только так площадь может вырасти.',
      sol: `int maxArea(vector<int>& height) {
    int i = 0, j = (int)height.size() - 1, best = 0;
    while (i < j) {
        best = max(best, min(height[i], height[j]) * (j - i));
        if (height[i] < height[j]) i++; else j--;
    }
    return best;
}`,
    },
    {
      id: '3sum', lvl: 3, title: '3Sum', fn: 'threeSum', args: [VI], cmp: 'unordered2',
      desc: `<p>Найди все уникальные тройки <code>[a,b,c]</code> из массива с суммой 0. Тройки не должны повторяться. <i>(LeetCode 15)</i></p>
<pre>[-1,0,1,2,-1,-4] → [[-1,-1,2],[-1,0,1]]</pre>`,
      starter: `vector<vector<int>> threeSum(vector<int>& nums) {
    return {};
}`,
      tests: [[['{-1,0,1,2,-1,-4}'], '{{-1,-1,2},{-1,0,1}}'], [['{0,1,1}'], '{}'], [['{0,0,0}'], '{{0,0,0}}'], [['{-2,0,1,1,2}'], '{{-2,0,2},{-2,1,1}}'], [['{0,0,0,0}'], '{{0,0,0}}']],
      hint: 'Отсортируй. Фиксируй i, для остатка запускай два указателя. Пропускай одинаковые значения, чтобы не было дублей.',
      sol: `vector<vector<int>> threeSum(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    vector<vector<int>> res;
    int n = nums.size();
    for (int i = 0; i < n; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        int l = i + 1, r = n - 1;
        while (l < r) {
            int s = nums[i] + nums[l] + nums[r];
            if (s < 0) l++;
            else if (s > 0) r--;
            else {
                res.push_back({nums[i], nums[l], nums[r]});
                while (l < r && nums[l] == nums[l + 1]) l++;
                while (l < r && nums[r] == nums[r - 1]) r--;
                l++; r--;
            }
        }
    }
    return res;
}`,
    },
    {
      id: 'topk', lvl: 3, title: 'K самых частых', fn: 'topKFrequent', args: [VI, 'int'], cmp: 'unordered',
      desc: `<p>Верни <code>k</code> самых частых элементов в любом порядке. Ответ однозначен. <i>(LeetCode 347)</i></p>
<pre>topKFrequent([1,1,1,2,2,3], 2) → [1,2]</pre>`,
      starter: `vector<int> topKFrequent(vector<int>& nums, int k) {
    return {};
}`,
      tests: [[['{1,1,1,2,2,3}', '2'], '{1,2}'], [['{1}', '1'], '{1}'], [['{4,4,4,5,5,6,6,6,6}', '2'], '{6,4}'], [['{3,0,1,0}', '1'], '{0}']],
      hint: 'Посчитай частоты в unordered_map, потом куча (priority_queue) или сортировка пар (частота, число).',
      sol: `vector<int> topKFrequent(vector<int>& nums, int k) {
    unordered_map<int, int> cnt;
    for (int x : nums) cnt[x]++;
    vector<pair<int, int>> v;
    for (auto& [x, c] : cnt) v.push_back({c, x});
    sort(v.rbegin(), v.rend());
    vector<int> res;
    for (int i = 0; i < k; i++) res.push_back(v[i].second);
    return res;
}`,
    },
    {
      id: 'islands', lvl: 3, title: 'Количество островов', fn: 'numIslands', args: ['vector<vector<char>>'],
      desc: `<p>Карта из <code>'1'</code> (земля) и <code>'0'</code> (вода). Остров — группа земли, соединённой по горизонтали или вертикали. Посчитай острова. <i>(LeetCode 200)</i></p>
<pre>1 1 0 0 0
1 1 0 0 0
0 0 1 0 0
0 0 0 1 1   → 3</pre>`,
      starter: `int numIslands(vector<vector<char>>& grid) {
    return 0;
}`,
      tests: [
        [["{{'1','1','1','1','0'},{'1','1','0','1','0'},{'1','1','0','0','0'},{'0','0','0','0','0'}}"], '1'],
        [["{{'1','1','0','0','0'},{'1','1','0','0','0'},{'0','0','1','0','0'},{'0','0','0','1','1'}}"], '3'],
        [["{{'0'}}"], '0'], [["{{'1','0','1','0','1'}}"], '3'],
        { show: 'сетка 60×60 из одной земли (глубокая рекурсия)', run: "std::vector<std::vector<char>> g(60, std::vector<char>(60, '1')); return numIslands(g);", expect: '1' }],
      hint: 'Обходи сетку; встретив непосещённую 1, увеличь счётчик и «затопи» весь остров через DFS или BFS. В браузере глубина рекурсии ограничена (несколько тысяч вызовов), BFS с очередью надёжнее.',
      sol: `int numIslands(vector<vector<char>>& grid) {
    int n = grid.size(), m = grid[0].size(), cnt = 0;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++) {
            if (grid[i][j] != '1') continue;
            cnt++;
            queue<pair<int, int>> q; q.push({i, j}); grid[i][j] = '0';
            while (!q.empty()) {
                auto [x, y] = q.front(); q.pop();
                int dx[] = {1, -1, 0, 0}, dy[] = {0, 0, 1, -1};
                for (int d = 0; d < 4; d++) {
                    int a = x + dx[d], b = y + dy[d];
                    if (a >= 0 && a < n && b >= 0 && b < m && grid[a][b] == '1') { grid[a][b] = '0'; q.push({a, b}); }
                }
            }
        }
    return cnt;
}`,
    },
    {
      id: 'intervals', lvl: 3, title: 'Слияние интервалов', fn: 'merge', args: [VVI],
      desc: `<p>Объедини все пересекающиеся интервалы и верни результат, отсортированный по началу. <i>(LeetCode 56)</i></p>
<pre>[[1,3],[2,6],[8,10],[15,18]] → [[1,6],[8,10],[15,18]]</pre>`,
      starter: `vector<vector<int>> merge(vector<vector<int>>& intervals) {
    return {};
}`,
      tests: [[['{{1,3},{2,6},{8,10},{15,18}}'], '{{1,6},{8,10},{15,18}}'], [['{{1,4},{4,5}}'], '{{1,5}}'], [['{{1,4},{0,4}}'], '{{0,4}}'], [['{{1,4},{2,3}}'], '{{1,4}}'], [['{{5,6},{1,2}}'], '{{1,2},{5,6}}']],
      hint: 'Отсортируй по началу. Если текущий интервал начинается не позже конца последнего в ответе, расширь конец.',
      sol: `vector<vector<int>> merge(vector<vector<int>>& intervals) {
    sort(intervals.begin(), intervals.end());
    vector<vector<int>> res;
    for (auto& in : intervals) {
        if (!res.empty() && in[0] <= res.back()[1]) res.back()[1] = max(res.back()[1], in[1]);
        else res.push_back(in);
    }
    return res;
}`,
    },
    {
      id: 'coins', lvl: 3, title: 'Размен монет', fn: 'coinChange', args: [VI, 'int'],
      desc: `<p>Минимальное число монет, чтобы набрать сумму <code>amount</code>. Монет каждого номинала бесконечно. Если нельзя, верни <code>-1</code>. <i>(LeetCode 322)</i></p>
<pre>coinChange([1,2,5], 11) → 3   // 5+5+1</pre>`,
      starter: `int coinChange(vector<int>& coins, int amount) {
    return -1;
}`,
      tests: [[['{1,2,5}', '11'], '3'], [['{2}', '3'], '-1'], [['{1}', '0'], '0'], [['{186,419,83,408}', '6249'], '20'], [['{2,5,10,1}', '27'], '4']],
      hint: 'dp[s] = минимум монет для суммы s. dp[0] = 0, dp[s] = min(dp[s - c] + 1) по всем монетам c.',
      sol: `int coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount + 1, INT_MAX);
    dp[0] = 0;
    for (int s = 1; s <= amount; s++)
        for (int c : coins)
            if (c <= s && dp[s - c] != INT_MAX) dp[s] = min(dp[s], dp[s - c] + 1);
    return dp[amount] == INT_MAX ? -1 : dp[amount];
}`,
    },
    {
      id: 'subsets', lvl: 3, title: 'Все подмножества', fn: 'subsets', args: [VI], cmp: 'unordered2',
      desc: `<p>Все элементы различны. Верни все подмножества (включая пустое) в любом порядке. Задача на перебор с возвратом. <i>(LeetCode 78)</i></p>
<pre>[1,2,3] → [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]</pre>`,
      starter: `vector<vector<int>> subsets(vector<int>& nums) {
    return {};
}`,
      tests: [[['{1,2,3}'], '{{},{1},{2},{1,2},{3},{1,3},{2,3},{1,2,3}}'], [['{0}'], '{{},{0}}'], [['{5,9}'], '{{},{5},{9},{5,9}}']],
      hint: 'Рекурсия dfs(i, cur): для каждого элемента два варианта, взять или не взять. Или битовые маски от 0 до 2ⁿ-1.',
      sol: `vector<vector<int>> subsets(vector<int>& nums) {
    int n = nums.size();
    vector<vector<int>> res;
    for (int mask = 0; mask < (1 << n); mask++) {
        vector<int> cur;
        for (int i = 0; i < n; i++) if (mask >> i & 1) cur.push_back(nums[i]);
        res.push_back(cur);
    }
    return res;
}`,
    },
    {
      id: 'levelorder', lvl: 3, title: 'Обход дерева по уровням', fn: 'levelOrder', args: ['TreeNode*'], pre: TREE_STRUCT, extra: TREE_EXTRA,
      desc: `<p>Верни значения узлов по уровням, слева направо. <i>(LeetCode 102)</i></p>
<pre>[3,9,20,null,null,15,7] → [[3],[9,20],[15,7]]</pre>`,
      starter: `vector<vector<int>> levelOrder(TreeNode* root) {
    return {};
}`,
      tests: [[['{3,9,20,nil,nil,15,7}'], '{{3},{9,20},{15,7}}'], [['{1}'], '{{1}}'], [['{}'], '{}'], [['{1,2,3,4,nil,nil,5}'], '{{1},{2,3},{4,5}}']],
      hint: 'BFS с очередью. На каждой итерации обрабатывай ровно q.size() узлов: это один уровень.',
      sol: `vector<vector<int>> levelOrder(TreeNode* root) {
    vector<vector<int>> res;
    if (!root) return res;
    queue<TreeNode*> q; q.push(root);
    while (!q.empty()) {
        int sz = q.size();
        vector<int> lvl;
        while (sz--) {
            TreeNode* n = q.front(); q.pop();
            lvl.push_back(n->val);
            if (n->left) q.push(n->left);
            if (n->right) q.push(n->right);
        }
        res.push_back(lvl);
    }
    return res;
}`,
    },
    {
      id: 'minstack', lvl: 3, title: 'Стек с минимумом',
      desc: `<p>Реализуй класс <code>MinStack</code>: <code>push(x)</code>, <code>pop()</code>, <code>top()</code> и <code>getMin()</code>, все за O(1). <i>(LeetCode 155)</i></p>
<pre>push(-2), push(0), push(-3)
getMin() → -3
pop()
top() → 0
getMin() → -2</pre>
<p>В тестах результаты вызовов собираются в массив.</p>`,
      starter: `class MinStack {
public:
    MinStack() {}
    void push(int x) {}
    void pop() {}
    int top() { return 0; }
    int getMin() { return 0; }
};`,
      tests: [
        { show: 'push(-2) push(0) push(-3) getMin() pop() top() getMin()', run: 'MinStack s; std::vector<int> r; s.push(-2); s.push(0); s.push(-3); r.push_back(s.getMin()); s.pop(); r.push_back(s.top()); r.push_back(s.getMin()); return r;', expect: '{-3,0,-2}' },
        { show: 'push(5) push(5) push(7) getMin() pop() pop() getMin() top()', run: 'MinStack s; std::vector<int> r; s.push(5); s.push(5); s.push(7); r.push_back(s.getMin()); s.pop(); s.pop(); r.push_back(s.getMin()); r.push_back(s.top()); return r;', expect: '{5,5,5}' },
        { show: 'push(2) push(1) push(1) pop() getMin() pop() getMin()', run: 'MinStack s; std::vector<int> r; s.push(2); s.push(1); s.push(1); s.pop(); r.push_back(s.getMin()); s.pop(); r.push_back(s.getMin()); return r;', expect: '{1,2}' },
        { show: '200000 операций (тест на скорость)', run: 'MinStack s; long long sum = 0; jd::Rng g(3); for (int i = 0; i < 200000; i++) { s.push(g.next(-1000000, 1000000)); sum += s.getMin(); if (i % 3 == 2) { s.pop(); sum += s.top(); } } return sum;', expect: '-199923807080' },
      ],
      hint: 'Храни второй стек минимумов: при push кладёшь туда min(x, текущий минимум).',
      sol: `class MinStack {
    vector<int> st, mn;
public:
    MinStack() {}
    void push(int x) { st.push_back(x); mn.push_back(mn.empty() ? x : min(x, mn.back())); }
    void pop() { st.pop_back(); mn.pop_back(); }
    int top() { return st.back(); }
    int getMin() { return mn.back(); }
};`,
    },
    {
      id: 'rotated', lvl: 3, title: 'Поиск в повёрнутом массиве', fn: 'search', args: [VI, 'int'],
      desc: `<p>Отсортированный массив различных чисел повернули в неизвестной точке (например, <code>[0,1,2,4,5,6,7]</code> → <code>[4,5,6,7,0,1,2]</code>). Найди индекс <code>target</code> за O(log n) или верни <code>-1</code>. <i>(LeetCode 33)</i></p>
<pre>search([4,5,6,7,0,1,2], 0) → 4</pre>`,
      starter: `int search(vector<int>& nums, int target) {
    return -1;
}`,
      tests: [[['{4,5,6,7,0,1,2}', '0'], '4'], [['{4,5,6,7,0,1,2}', '3'], '-1'], [['{1}', '0'], '-1'], [['{3,1}', '1'], '1'], [['{5,1,3}', '5'], '0'], [['{6,7,1,2,3,4,5}', '6'], '0']],
      hint: 'Бинпоиск: на каждом шаге одна из половин [lo, mid] или [mid, hi] точно отсортирована. Проверь, лежит ли target в ней.',
      sol: `int search(vector<int>& nums, int target) {
    int lo = 0, hi = (int)nums.size() - 1;
    while (lo <= hi) {
        int mid = (lo + hi) / 2;
        if (nums[mid] == target) return mid;
        if (nums[lo] <= nums[mid]) {
            if (nums[lo] <= target && target < nums[mid]) hi = mid - 1; else lo = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[hi]) lo = mid + 1; else hi = mid - 1;
        }
    }
    return -1;
}`,
    },
    {
      id: 'paths', lvl: 3, title: 'Пути в сетке', fn: 'uniquePaths', args: ['int', 'int'],
      desc: `<p>Робот в левом верхнем углу сетки <code>m×n</code> ходит только вправо или вниз. Сколько путей до правого нижнего угла? Ответ ≤ 2·10⁹. <i>(LeetCode 62)</i></p>
<pre>uniquePaths(3, 7) → 28</pre>`,
      starter: `int uniquePaths(int m, int n) {
    return 0;
}`,
      tests: [[['3', '7'], '28'], [['3', '2'], '3'], [['1', '1'], '1'], [['10', '10'], '48620'], [['23', '12'], '193536720']],
      hint: 'dp[i][j] = dp[i-1][j] + dp[i][j-1], первая строка и столбец равны 1. Хватит одной строки dp.',
      sol: `int uniquePaths(int m, int n) {
    vector<long long> dp(n, 1);
    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++) dp[j] += dp[j - 1];
    return dp[n - 1];
}`,
    },

    // ───────────── 4. Сложный ─────────────
    {
      id: 'lru', lvl: 4, title: 'LRU-кэш',
      desc: `<p>Реализуй класс <code>LRUCache(capacity)</code>: <code>get(key)</code> возвращает значение или <code>-1</code>, <code>put(key, value)</code> добавляет или обновляет значение. При переполнении удаляется ключ, к которому дольше всего не обращались. Обе операции за O(1). <i>(LeetCode 146)</i></p>
<pre>LRUCache c(2);
put(1,1) put(2,2) get(1)→1 put(3,3) get(2)→-1
put(4,4) get(1)→-1 get(3)→3 get(4)→4</pre>`,
      starter: `class LRUCache {
public:
    LRUCache(int capacity) {}
    int get(int key) { return -1; }
    void put(int key, int value) {}
};`,
      tests: [
        { show: 'cap=2: put(1,1) put(2,2) get(1) put(3,3) get(2) put(4,4) get(1) get(3) get(4)', run: 'LRUCache c(2); std::vector<int> r; c.put(1,1); c.put(2,2); r.push_back(c.get(1)); c.put(3,3); r.push_back(c.get(2)); c.put(4,4); r.push_back(c.get(1)); r.push_back(c.get(3)); r.push_back(c.get(4)); return r;', expect: '{1,-1,-1,3,4}' },
        { show: 'cap=1: put(2,1) get(2) put(3,2) get(2) get(3)', run: 'LRUCache c(1); std::vector<int> r; c.put(2,1); r.push_back(c.get(2)); c.put(3,2); r.push_back(c.get(2)); r.push_back(c.get(3)); return r;', expect: '{1,-1,2}' },
        { show: 'cap=2: put(2,1) put(2,2) get(2) put(1,1) put(4,1) get(2)', run: 'LRUCache c(2); std::vector<int> r; c.put(2,1); c.put(2,2); r.push_back(c.get(2)); c.put(1,1); c.put(4,1); r.push_back(c.get(2)); return r;', expect: '{2,-1}' },
        { show: 'cap=1000, 300000 операций (тест на скорость)', run: 'LRUCache c(1000); jd::Rng g(11); long long sum = 0; for (int i = 0; i < 300000; i++) { int k = g.next(0, 3000); if (g.next(0, 1)) c.put(k, i); else sum += c.get(k); } return sum;', expect: '7452401713' },
      ],
      hint: 'list<pair<int,int>> хранит порядок использования, unordered_map<key, list::iterator> даёт доступ за O(1). splice переносит узел в начало.',
      sol: `class LRUCache {
    int cap;
    list<pair<int, int>> order;
    unordered_map<int, list<pair<int, int>>::iterator> pos;
public:
    LRUCache(int capacity) : cap(capacity) {}
    int get(int key) {
        auto it = pos.find(key);
        if (it == pos.end()) return -1;
        order.splice(order.begin(), order, it->second);
        return it->second->second;
    }
    void put(int key, int value) {
        auto it = pos.find(key);
        if (it != pos.end()) { it->second->second = value; order.splice(order.begin(), order, it->second); return; }
        if ((int)order.size() == cap) { pos.erase(order.back().first); order.pop_back(); }
        order.push_front({key, value});
        pos[key] = order.begin();
    }
};`,
    },
    {
      id: 'lis', lvl: 4, title: 'Наибольшая возрастающая подпоследовательность', fn: 'lengthOfLIS', args: [VI],
      desc: `<p>Верни длину самой длинной строго возрастающей подпоследовательности. <i>(LeetCode 300)</i></p>
<pre>[10,9,2,5,3,7,101,18] → 4   // [2,3,7,101]</pre>
<p>Последний тест на n = 100 000: решение O(n²) не успеет, нужно O(n log n).</p>`,
      starter: `int lengthOfLIS(vector<int>& nums) {
    return 0;
}`,
      tests: [[['{10,9,2,5,3,7,101,18}'], '4'], [['{0,1,0,3,2,3}'], '4'], [['{7,7,7,7,7}'], '1'], [['{1}'], '1'],
        { show: 'n = 100000 (тест на скорость)', run: 'jd::Rng g(5); std::vector<int> a(100000); for (auto& x : a) x = g.next(-1000000000, 1000000000); return lengthOfLIS(a);', expect: '606' }],
      hint: 'Массив tails: tails[k] = минимальный последний элемент возрастающей подпоследовательности длины k+1. Для каждого x: lower_bound в tails, заменить или дописать.',
      sol: `int lengthOfLIS(vector<int>& nums) {
    vector<int> tails;
    for (int x : nums) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x); else *it = x;
    }
    return tails.size();
}`,
    },
    {
      id: 'edit', lvl: 4, title: 'Редакционное расстояние', fn: 'minDistance', args: ['string', 'string'],
      desc: `<p>Минимальное число операций (вставка, удаление, замена символа), чтобы превратить <code>word1</code> в <code>word2</code>. Расстояние Левенштейна. <i>(LeetCode 72)</i></p>
<pre>minDistance("horse", "ros") → 3</pre>`,
      starter: `int minDistance(string word1, string word2) {
    return 0;
}`,
      tests: [[['"horse"', '"ros"'], '3'], [['"intention"', '"execution"'], '5'], [['""', '"abc"'], '3'], [['"abc"', '"abc"'], '0'], [['"kitten"', '"sitting"'], '3'],
        { show: 'две строки по 2000 символов (тест на скорость)', run: 'jd::Rng g(9); std::string a, b; for (int i = 0; i < 2000; i++) { a += char(g.next(97, 100)); b += char(g.next(97, 100)); } return minDistance(a, b);', expect: '1058' }],
      hint: 'dp[i][j] — ответ для первых i символов word1 и первых j символов word2. Если символы равны, dp[i-1][j-1], иначе 1 + min из трёх соседей.',
      sol: `int minDistance(string a, string b) {
    int n = a.size(), m = b.size();
    vector<vector<int>> dp(n + 1, vector<int>(m + 1));
    for (int i = 0; i <= n; i++) dp[i][0] = i;
    for (int j = 0; j <= m; j++) dp[0][j] = j;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++)
            dp[i][j] = a[i - 1] == b[j - 1] ? dp[i - 1][j - 1] : 1 + min({dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]});
    return dp[n][m];
}`,
    },
    {
      id: 'wordbreak', lvl: 4, title: 'Разбиение на слова', fn: 'wordBreak', args: ['string', VS],
      desc: `<p>Можно ли разбить строку <code>s</code> на слова из словаря (слова можно использовать многократно)? <i>(LeetCode 139)</i></p>
<pre>wordBreak("applepenapple", ["apple","pen"]) → true</pre>`,
      starter: `bool wordBreak(string s, vector<string>& wordDict) {
    return false;
}`,
      tests: [[['"leetcode"', '{"leet","code"}'], 'true'], [['"applepenapple"', '{"apple","pen"}'], 'true'], [['"catsandog"', '{"cats","dog","sand","and","cat"}'], 'false'], [['"a"', '{"b"}'], 'false'],
        [['std::string(150, \'a\') + "b"', '{"a","aa","aaa","aaaa","aaaaa"}'], 'false', 'wordBreak("aaa…aab" (150 a), ["a","aa",…]) — ловушка для перебора']],
      hint: 'dp[i] = можно ли разбить префикс длины i. dp[0] = true; dp[i] = true, если есть j < i с dp[j] и s.substr(j, i-j) в словаре.',
      sol: `bool wordBreak(string s, vector<string>& wordDict) {
    unordered_set<string> dict(wordDict.begin(), wordDict.end());
    int n = s.size();
    vector<bool> dp(n + 1, false);
    dp[0] = true;
    for (int i = 1; i <= n; i++)
        for (int j = 0; j < i && !dp[i]; j++)
            if (dp[j] && dict.count(s.substr(j, i - j))) dp[i] = true;
    return dp[n];
}`,
    },
    {
      id: 'courses', lvl: 4, title: 'Расписание курсов', fn: 'canFinish', args: ['int', VVI],
      desc: `<p>Курсы пронумерованы от 0 до <code>numCourses-1</code>. Пара <code>[a, b]</code> значит: чтобы пройти a, сначала пройди b. Можно ли пройти все курсы? По сути: есть ли цикл в ориентированном графе. <i>(LeetCode 207)</i></p>
<pre>canFinish(2, [[1,0]]) → true
canFinish(2, [[1,0],[0,1]]) → false</pre>`,
      starter: `bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
    return false;
}`,
      tests: [[['2', '{{1,0}}'], 'true'], [['2', '{{1,0},{0,1}}'], 'false'], [['4', '{{1,0},{2,1},{3,2}}'], 'true'], [['3', '{{0,1},{1,2},{2,0}}'], 'false'], [['1', '{}'], 'true'], [['5', '{{1,4},{2,4},{3,1},{3,2}}'], 'true']],
      hint: 'Алгоритм Кана: считай входящие степени, кладёшь в очередь вершины со степенью 0, «удаляешь» их рёбра. Если обработал все вершины, цикла нет.',
      sol: `bool canFinish(int n, vector<vector<int>>& pre) {
    vector<vector<int>> g(n);
    vector<int> indeg(n, 0);
    for (auto& e : pre) { g[e[1]].push_back(e[0]); indeg[e[0]]++; }
    queue<int> q;
    for (int i = 0; i < n; i++) if (indeg[i] == 0) q.push(i);
    int done = 0;
    while (!q.empty()) {
        int v = q.front(); q.pop(); done++;
        for (int u : g[v]) if (--indeg[u] == 0) q.push(u);
    }
    return done == n;
}`,
    },
    {
      id: 'dijkstra', lvl: 4, title: 'Время задержки сети', fn: 'networkDelayTime', args: [VVI, 'int', 'int'],
      desc: `<p>Есть <code>n</code> узлов (1..n) и направленные рёбра <code>times[i] = [u, v, w]</code>: сигнал идёт от u к v за w. Сигнал отправлен из узла <code>k</code>. За какое время он дойдёт до всех узлов? Если до кого-то не дойдёт, верни <code>-1</code>. Классический алгоритм Дейкстры. <i>(LeetCode 743)</i></p>
<pre>networkDelayTime([[2,1,1],[2,3,1],[3,4,1]], 4, 2) → 2</pre>`,
      starter: `int networkDelayTime(vector<vector<int>>& times, int n, int k) {
    return -1;
}`,
      tests: [[['{{2,1,1},{2,3,1},{3,4,1}}', '4', '2'], '2'], [['{{1,2,1}}', '2', '1'], '1'], [['{{1,2,1}}', '2', '2'], '-1'], [['{{1,2,1},{2,3,2},{1,3,4}}', '3', '1'], '3'],
        { show: 'n = 20000, 200000 рёбер (тест на скорость)', run: 'jd::Rng g(13); int n = 20000; std::vector<std::vector<int>> t; for (int i = 1; i < n; i++) t.push_back({i, i + 1, g.next(1, 100)}); for (int i = 0; i < 180000; i++) t.push_back({g.next(1, n), g.next(1, n), g.next(1, 10000)}); return networkDelayTime(t, n, 1);', expect: '2934' }],
      hint: 'priority_queue<pair<int,int>, vector<...>, greater<...>> с парами (расстояние, вершина). Достаёшь ближайшую, релаксируешь соседей. Ответ: максимум из расстояний.',
      sol: `int networkDelayTime(vector<vector<int>>& times, int n, int k) {
    vector<vector<pair<int, int>>> g(n + 1);
    for (auto& t : times) g[t[0]].push_back({t[1], t[2]});
    vector<int> dist(n + 1, INT_MAX);
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;
    dist[k] = 0; pq.push({0, k});
    while (!pq.empty()) {
        auto [d, v] = pq.top(); pq.pop();
        if (d > dist[v]) continue;
        for (auto [u, w] : g[v])
            if (d + w < dist[u]) { dist[u] = d + w; pq.push({dist[u], u}); }
    }
    int ans = 0;
    for (int i = 1; i <= n; i++) { if (dist[i] == INT_MAX) return -1; ans = max(ans, dist[i]); }
    return ans;
}`,
    },
    {
      id: 'mergek', lvl: 4, title: 'Слияние K списков', pre: LIST_STRUCT, extra: LIST_EXTRA,
      desc: `<p>Дан массив из <code>k</code> отсортированных связных списков. Слей их в один отсортированный список. <i>(LeetCode 23)</i></p>
<pre>[[1,4,5],[1,3,4],[2,6]] → [1,1,2,3,4,4,5,6]</pre>`,
      starter: `ListNode* mergeKLists(vector<ListNode*>& lists) {
    return nullptr;
}`,
      tests: [
        { show: 'mergeKLists([[1,4,5],[1,3,4],[2,6]])', run: 'std::vector<ListNode*> v{mkList({1,4,5}), mkList({1,3,4}), mkList({2,6})}; return toVec(mergeKLists(v));', expect: '{1,1,2,3,4,4,5,6}' },
        { show: 'mergeKLists([])', run: 'std::vector<ListNode*> v; return toVec(mergeKLists(v));', expect: '{}' },
        { show: 'mergeKLists([[]])', run: 'std::vector<ListNode*> v{nullptr}; return toVec(mergeKLists(v));', expect: '{}' },
        { show: '2000 списков по 100 элементов (тест на скорость)', run: 'jd::Rng g(17); std::vector<ListNode*> v; for (int i = 0; i < 2000; i++) { std::vector<int> a(100); for (auto& x : a) x = g.next(0, 1000000); std::sort(a.begin(), a.end()); v.push_back(mkList(a)); } auto r = toVec(mergeKLists(v)); unsigned long long h = 0; for (int x : r) h = h * 31 + x; return (long long)(h + r.size());', expect: '3261384259799426314' },
      ],
      hint: 'Мин-куча из голов списков: достаёшь минимальный узел, подвешиваешь к ответу и кладёшь в кучу его next.',
      sol: `ListNode* mergeKLists(vector<ListNode*>& lists) {
    auto cmp = [](ListNode* a, ListNode* b) { return a->val > b->val; };
    priority_queue<ListNode*, vector<ListNode*>, decltype(cmp)> pq(cmp);
    for (auto l : lists) if (l) pq.push(l);
    ListNode dummy(0); ListNode* t = &dummy;
    while (!pq.empty()) {
        ListNode* n = pq.top(); pq.pop();
        t->next = n; t = n;
        if (n->next) pq.push(n->next);
    }
    return dummy.next;
}`,
    },

    // ───────────── 5. Про ─────────────
    {
      id: 'trap', lvl: 5, title: 'Дождевая вода', fn: 'trap', args: [VI],
      desc: `<p><code>height[i]</code> — высота столбика ширины 1. Сколько воды соберётся после дождя? <i>(LeetCode 42)</i></p>
<pre>[0,1,0,2,1,0,1,3,2,1,2,1] → 6</pre>
<p>Есть тест на 300 000 столбиков: O(n²) не пройдёт. Сможешь за O(n) времени и O(1) памяти?</p>`,
      starter: `int trap(vector<int>& height) {
    return 0;
}`,
      tests: [[['{0,1,0,2,1,0,1,3,2,1,2,1}'], '6'], [['{4,2,0,3,2,5}'], '9'], [['{}'], '0'], [['{5,4,1,2}'], '1'], [['{2,0,2}'], '2'],
        { show: 'n = 300000 (тест на скорость)', run: 'jd::Rng g(21); std::vector<int> h(300000); for (auto& x : h) x = g.next(0, 100000); long long r = trap(h); return r;', expect: '2114095424' }],
      hint: 'Вода над i = min(maxLeft, maxRight) - h[i]. Два указателя: двигай сторону с меньшим максимумом, она и ограничивает уровень.',
      sol: `int trap(vector<int>& h) {
    int l = 0, r = (int)h.size() - 1, lm = 0, rm = 0;
    long long w = 0;
    while (l < r) {
        if (h[l] < h[r]) { lm = max(lm, h[l]); w += lm - h[l]; l++; }
        else { rm = max(rm, h[r]); w += rm - h[r]; r--; }
    }
    return (int)w;
}`,
    },
    {
      id: 'median2', lvl: 5, title: 'Медиана двух массивов', fn: 'findMedianSortedArrays', args: [VI, VI], cmp: 'near',
      desc: `<p>Даны два отсортированных массива. Верни медиану их объединения. Нужно O(log(min(n, m))). <i>(LeetCode 4)</i></p>
<pre>([1,3], [2]) → 2.0
([1,2], [3,4]) → 2.5</pre>`,
      starter: `double findMedianSortedArrays(vector<int>& a, vector<int>& b) {
    return 0.0;
}`,
      tests: [[['{1,3}', '{2}'], '2.0'], [['{1,2}', '{3,4}'], '2.5'], [['{}', '{1}'], '1.0'], [['{0,0}', '{0,0}'], '0.0'], [['{2}', '{}'], '2.0'], [['{1,2,3,4,5}', '{6,7,8,9,10,11}'], '6.0'], [['{1,4,9}', '{2,3,10,11}'], '4.0']],
      hint: 'Бинпоиск по разрезу меньшего массива: слева от разрезов должно быть (n+m+1)/2 элементов, и maxLeftA ≤ minRightB, maxLeftB ≤ minRightA.',
      sol: `double findMedianSortedArrays(vector<int>& a, vector<int>& b) {
    if (a.size() > b.size()) return findMedianSortedArrays(b, a);
    int n = a.size(), m = b.size(), half = (n + m + 1) / 2;
    int lo = 0, hi = n;
    while (lo <= hi) {
        int i = (lo + hi) / 2, j = half - i;
        int aL = i ? a[i - 1] : INT_MIN, aR = i < n ? a[i] : INT_MAX;
        int bL = j ? b[j - 1] : INT_MIN, bR = j < m ? b[j] : INT_MAX;
        if (aL <= bR && bL <= aR) {
            if ((n + m) % 2) return max(aL, bL);
            return (max(aL, bL) + (double)min(aR, bR)) / 2.0;
        }
        if (aL > bR) hi = i - 1; else lo = i + 1;
    }
    return 0.0;
}`,
    },
    {
      id: 'slidemax', lvl: 5, title: 'Максимум в скользящем окне', fn: 'maxSlidingWindow', args: [VI, 'int'],
      desc: `<p>Окно размера <code>k</code> двигается по массиву слева направо. Верни максимум в каждом положении окна. <i>(LeetCode 239)</i></p>
<pre>([1,3,-1,-3,5,3,6,7], 3) → [3,3,5,5,6,7]</pre>
<p>Тест на скорость: n = 300 000, k = 150 000. Нужно O(n).</p>`,
      starter: `vector<int> maxSlidingWindow(vector<int>& nums, int k) {
    return {};
}`,
      tests: [[['{1,3,-1,-3,5,3,6,7}', '3'], '{3,3,5,5,6,7}'], [['{1}', '1'], '{1}'], [['{9,8,7,6}', '2'], '{9,8,7}'], [['{1,-1}', '1'], '{1,-1}'], [['{4,2,12,3}', '4'], '{12}'],
        { show: 'n = 300000, k = 150000 (тест на скорость, сумма ответа)', run: 'jd::Rng g(23); std::vector<int> a(300000); for (auto& x : a) x = g.next(-1000000, 1000000); auto r = maxSlidingWindow(a, 150000); long long s = 0; for (int x : r) s += x; return s + (long long)r.size();', expect: '149998628117' }],
      hint: 'Монотонная дека индексов: значения в ней убывают. Перед добавлением выкидывай с конца всё, что меньше нового. Спереди выкидывай вышедшие из окна.',
      sol: `vector<int> maxSlidingWindow(vector<int>& nums, int k) {
    deque<int> dq;
    vector<int> res;
    for (int i = 0; i < (int)nums.size(); i++) {
        while (!dq.empty() && nums[dq.back()] <= nums[i]) dq.pop_back();
        dq.push_back(i);
        if (dq.front() <= i - k) dq.pop_front();
        if (i >= k - 1) res.push_back(nums[dq.front()]);
    }
    return res;
}`,
    },
    {
      id: 'minwin', lvl: 5, title: 'Минимальное окно', fn: 'minWindow', args: ['string', 'string'],
      desc: `<p>Найди самую короткую подстроку <code>s</code>, содержащую все символы <code>t</code> (с учётом повторов). Если такой нет, верни <code>""</code>. Ответ единственный. <i>(LeetCode 76)</i></p>
<pre>minWindow("ADOBECODEBANC", "ABC") → "BANC"</pre>`,
      starter: `string minWindow(string s, string t) {
    return "";
}`,
      tests: [[['"ADOBECODEBANC"', '"ABC"'], '"BANC"'], [['"a"', '"a"'], '"a"'], [['"a"', '"aa"'], '""'], [['"aaflslflsldkalskaaa"', '"aaa"'], '"aaa"'], [['"ab"', '"b"'], '"b"'],
        { show: 's: 200000 символов, t: 50 символов (тест на скорость)', run: 'jd::Rng g(29); std::string s, t; for (int i = 0; i < 200000; i++) s += char(g.next(65, 90)); for (int i = 0; i < 50; i++) t += char(g.next(65, 90)); return (long long)minWindow(s, t).size();', expect: '79' }],
      hint: 'Окно [l, r] и счётчик need[c]. Расширяй r, пока окно не покроет t, потом сжимай l, обновляя ответ.',
      sol: `string minWindow(string s, string t) {
    vector<int> need(128, 0);
    for (char c : t) need[c]++;
    int missing = t.size(), l = 0, bestL = 0, bestLen = INT_MAX;
    for (int r = 0; r < (int)s.size(); r++) {
        if (need[s[r]]-- > 0) missing--;
        while (missing == 0) {
            if (r - l + 1 < bestLen) { bestLen = r - l + 1; bestL = l; }
            if (++need[s[l++]] > 0) missing++;
        }
    }
    return bestLen == INT_MAX ? "" : s.substr(bestL, bestLen);
}`,
    },
    {
      id: 'histogram', lvl: 5, title: 'Прямоугольник в гистограмме', fn: 'largestRectangleArea', args: [VI],
      desc: `<p>Столбики ширины 1 с высотами <code>heights</code>. Найди площадь наибольшего прямоугольника внутри гистограммы. <i>(LeetCode 84)</i></p>
<pre>[2,1,5,6,2,3] → 10</pre>
<p>Тест на скорость: n = 300 000.</p>`,
      starter: `int largestRectangleArea(vector<int>& heights) {
    return 0;
}`,
      tests: [[['{2,1,5,6,2,3}'], '10'], [['{2,4}'], '4'], [['{1}'], '1'], [['{6,2,5,4,5,1,6}'], '12'], [['{3,3,3,3}'], '12'],
        { show: 'n = 300000 (тест на скорость)', run: 'jd::Rng g(31); std::vector<int> h(300000); for (auto& x : h) x = g.next(0, 10000); return largestRectangleArea(h);', expect: '132240' }],
      hint: 'Монотонный стек индексов с возрастающими высотами. Когда приходит столбик ниже вершины, вершина «закрывается»: её прямоугольник тянется от нового верха стека до i.',
      sol: `int largestRectangleArea(vector<int>& h) {
    stack<int> st;
    long long best = 0;
    int n = h.size();
    for (int i = 0; i <= n; i++) {
        int cur = i == n ? 0 : h[i];
        while (!st.empty() && h[st.top()] >= cur) {
            int height = h[st.top()]; st.pop();
            int left = st.empty() ? -1 : st.top();
            best = max(best, (long long)height * (i - left - 1));
        }
        st.push(i);
    }
    return (int)best;
}`,
    },
    {
      id: 'nqueens', lvl: 5, title: 'N ферзей', fn: 'totalNQueens', args: ['int'],
      desc: `<p>Сколькими способами можно расставить <code>n</code> ферзей на доске <code>n×n</code>, чтобы они не били друг друга? <code>1 ≤ n ≤ 12</code>. <i>(LeetCode 52)</i></p>
<pre>totalNQueens(4) → 2
totalNQueens(8) → 92</pre>`,
      starter: `int totalNQueens(int n) {
    return 0;
}`,
      tests: [[['1'], '1'], [['4'], '2'], [['6'], '4'], [['8'], '92'], [['10'], '724'], [['12'], '14200']],
      hint: 'Backtracking по строкам. Занятые столбцы и диагонали (r+c и r-c+n) храни в булевых массивах или битовых масках.',
      sol: `int solveQ(int n, int row, int cols, int d1, int d2) {
    if (row == n) return 1;
    int cnt = 0;
    int avail = ((1 << n) - 1) & ~(cols | d1 | d2);
    while (avail) {
        int bit = avail & -avail;
        avail -= bit;
        cnt += solveQ(n, row + 1, cols | bit, (d1 | bit) << 1, (d2 | bit) >> 1);
    }
    return cnt;
}
int totalNQueens(int n) {
    return solveQ(n, 0, 0, 0, 0);
}`,
    },
    {
      id: 'regex', lvl: 5, title: 'Регулярные выражения', fn: 'isMatch', args: ['string', 'string'],
      desc: `<p>Реализуй сопоставление строки <code>s</code> с шаблоном <code>p</code>, где <code>.</code> — любой символ, <code>*</code> — ноль или больше повторений предыдущего символа. Шаблон должен покрыть всю строку. <i>(LeetCode 10)</i></p>
<pre>isMatch("aa", "a*") → true
isMatch("mississippi", "mis*is*p*.") → false</pre>`,
      starter: `bool isMatch(string s, string p) {
    return false;
}`,
      tests: [[['"aa"', '"a"'], 'false'], [['"aa"', '"a*"'], 'true'], [['"ab"', '".*"'], 'true'], [['"aab"', '"c*a*b"'], 'true'], [['"mississippi"', '"mis*is*p*."'], 'false'], [['""', '"a*b*"'], 'true'],
        [['"aaaaaaaaaaaaaaaaaaaaaaaaaaaab"', '"a*a*a*a*a*a*a*a*a*a*a*c"'], 'false', 'isMatch("aaaa…ab", "a*a*a*…c") — ловушка для перебора']],
      hint: 'dp[i][j] — совпадает ли s[i..] с p[j..]. Если p[j+1] == \'*\': пропусти пару (dp[i][j+2]) или съешь символ s (first && dp[i+1][j]).',
      sol: `bool isMatch(string s, string p) {
    int n = s.size(), m = p.size();
    vector<vector<bool>> dp(n + 1, vector<bool>(m + 1, false));
    dp[n][m] = true;
    for (int i = n; i >= 0; i--)
        for (int j = m - 1; j >= 0; j--) {
            bool first = i < n && (p[j] == s[i] || p[j] == '.');
            if (j + 1 < m && p[j + 1] == '*') dp[i][j] = dp[i][j + 2] || (first && dp[i + 1][j]);
            else dp[i][j] = first && dp[i + 1][j + 1];
        }
    return dp[0][0];
}`,
    },
    {
      id: 'codec', lvl: 5, title: 'Сериализация дерева', pre: TREE_STRUCT, extra: TREE_EXTRA,
      desc: `<p>Напиши класс <code>Codec</code>: <code>serialize(root)</code> превращает дерево в строку, <code>deserialize(data)</code> восстанавливает его обратно. Формат строки придумай сам. <i>(LeetCode 297)</i></p>
<p>Тест проверяет, что <code>deserialize(serialize(tree))</code> даёт то же дерево.</p>`,
      starter: `class Codec {
public:
    string serialize(TreeNode* root) {
        return "";
    }
    TreeNode* deserialize(string data) {
        return nullptr;
    }
};`,
      tests: [
        { show: '[1,2,3,null,null,4,5]', run: 'Codec c; return treeVec(c.deserialize(c.serialize(mkTree({1,2,3,nil,nil,4,5}))));', expect: '{1,2,3,nil,nil,4,5}' },
        { show: '[]', run: 'Codec c; return treeVec(c.deserialize(c.serialize(mkTree({}))));', expect: '{}' },
        { show: '[-1000,nil,25,7]', run: 'Codec c; return treeVec(c.deserialize(c.serialize(mkTree({-1000,nil,25,7}))));', expect: '{-1000,nil,25,7}' },
        { show: 'вырожденное дерево из 1000 узлов (цепочка)', run: 'TreeNode* r = new TreeNode(0); TreeNode* t = r; for (int i = 1; i < 1000; i++) { t->right = new TreeNode(i); t = t->right; } Codec c; auto v = treeVec(c.deserialize(c.serialize(r))); return (long long)v.size();', expect: '1999' },
      ],
      hint: 'Префиксный обход (корень, левое, правое), пустой узел пиши как "#". Разделяй пробелами, читай обратно через istringstream рекурсивно.',
      sol: `class Codec {
public:
    string serialize(TreeNode* root) {
        string out;
        function<void(TreeNode*)> go = [&](TreeNode* n) {
            if (!n) { out += "# "; return; }
            out += to_string(n->val) + " ";
            go(n->left); go(n->right);
        };
        go(root);
        return out;
    }
    TreeNode* deserialize(string data) {
        istringstream in(data);
        function<TreeNode*()> go = [&]() -> TreeNode* {
            string tok;
            in >> tok;
            if (tok == "#" || tok.empty()) return nullptr;
            TreeNode* n = new TreeNode(stoi(tok));
            n->left = go(); n->right = go();
            return n;
        };
        return go();
    }
};`,
    },
    {
      id: 'medianstream', lvl: 5, title: 'Медиана потока', cmp: 'near',
      desc: `<p>Класс <code>MedianFinder</code>: <code>addNum(x)</code> добавляет число, <code>findMedian()</code> возвращает медиану всех добавленных чисел. <i>(LeetCode 295)</i></p>
<pre>addNum(1) addNum(2) findMedian() → 1.5
addNum(3) findMedian() → 2.0</pre>`,
      starter: `class MedianFinder {
public:
    MedianFinder() {}
    void addNum(int num) {}
    double findMedian() { return 0.0; }
};`,
      tests: [
        { show: 'addNum(1) addNum(2) findMedian() addNum(3) findMedian()', run: 'MedianFinder m; std::vector<double> r; m.addNum(1); m.addNum(2); r.push_back(m.findMedian()); m.addNum(3); r.push_back(m.findMedian()); return r;', expect: '{1.5,2.0}' },
        { show: 'addNum(5) findMedian() addNum(-5) findMedian() addNum(0) findMedian()', run: 'MedianFinder m; std::vector<double> r; m.addNum(5); r.push_back(m.findMedian()); m.addNum(-5); r.push_back(m.findMedian()); m.addNum(0); r.push_back(m.findMedian()); return r;', expect: '{5.0,0.0,0.0}' },
        { show: '200000 addNum + findMedian после каждого (тест на скорость)', run: 'MedianFinder m; jd::Rng g(37); double s = 0; for (int i = 0; i < 200000; i++) { m.addNum(g.next(-100000, 100000)); s += m.findMedian(); } return std::vector<double>{s};', expect: '{5268412.5}' },
      ],
      hint: 'Две кучи: max-heap для меньшей половины и min-heap для большей. Держи их размеры равными или с разницей 1.',
      sol: `class MedianFinder {
    priority_queue<int> lo;
    priority_queue<int, vector<int>, greater<int>> hi;
public:
    MedianFinder() {}
    void addNum(int num) {
        lo.push(num);
        hi.push(lo.top()); lo.pop();
        if (hi.size() > lo.size()) { lo.push(hi.top()); hi.pop(); }
    }
    double findMedian() {
        return lo.size() > hi.size() ? lo.top() : (lo.top() + (double)hi.top()) / 2.0;
    }
};`,
    },
    // ───────── Новые задачи для новичков (уровни 0 и 1) ─────────
    {
      id: 'square', lvl: 0, title: 'Квадрат числа', fn: 'square', args: ['int'],
      desc: `<p>Верни квадрат числа <code>x</code>, то есть <code>x · x</code>.</p>
<pre>square(3) → 9
square(-4) → 16</pre>`,
      starter: `int square(int x) {
    // умножь x на само себя и верни результат
    return 0;
}`,
      tests: [[['3'], '9'], [['-4'], '16'], [['0'], '0'], [['12'], '144'], [['1000'], '1000000']],
      hint: 'Умножение в C++ записывается звёздочкой: x * x.',
      sol: `int square(int x) {
    return x * x;
}`,
    },
    {
      id: 'minutes', lvl: 0, title: 'Часы в минуты', fn: 'toMinutes', args: ['int', 'int'],
      desc: `<p>Дано время: <code>hours</code> часов и <code>minutes</code> минут. Верни, сколько это всего минут.</p>
<pre>toMinutes(1, 30) → 90
toMinutes(2, 0) → 120</pre>`,
      starter: `int toMinutes(int hours, int minutes) {
    return 0;
}`,
      tests: [[['1', '30'], '90'], [['0', '45'], '45'], [['2', '0'], '120'], [['24', '0'], '1440'], [['3', '15'], '195']],
      hint: 'В одном часе 60 минут: hours * 60 + minutes.',
      sol: `int toMinutes(int hours, int minutes) {
    return hours * 60 + minutes;
}`,
    },
    {
      id: 'lastdigit', lvl: 0, title: 'Последняя цифра', fn: 'lastDigit', args: ['int'],
      desc: `<p>Дано неотрицательное число <code>n</code>. Верни его последнюю цифру.</p>
<pre>lastDigit(123) → 3
lastDigit(50) → 0</pre>`,
      starter: `int lastDigit(int n) {
    return 0;
}`,
      tests: [[['123'], '3'], [['7'], '7'], [['50'], '0'], [['98765'], '5'], [['0'], '0']],
      hint: 'Остаток от деления на 10 и есть последняя цифра: n % 10.',
      sol: `int lastDigit(int n) {
    return n % 10;
}`,
    },
    {
      id: 'average', lvl: 0, title: 'Среднее трёх чисел', fn: 'average', args: ['int', 'int', 'int'], cmp: 'near',
      desc: `<p>Верни среднее арифметическое трёх целых чисел. Ответ может быть дробным, поэтому функция возвращает <code>double</code>.</p>
<pre>average(1, 2, 3) → 2
average(1, 2, 2) → 1.666667</pre>
<p>Осторожно с ловушкой: <code>5 / 3</code> в C++ даёт <code>1</code>, а не 1.67.</p>`,
      starter: `double average(int a, int b, int c) {
    return 0;
}`,
      tests: [[['1', '2', '3'], '2.0'], [['1', '2', '2'], '5.0 / 3'], [['10', '0', '5'], '5.0'], [['-3', '3', '1'], '1.0 / 3'], [['7', '7', '8'], '22.0 / 3']],
      hint: 'Сумма делится на 3.0 (с точкой), а не на 3: (a + b + c) / 3.0.',
      sol: `double average(int a, int b, int c) {
    return (a + b + c) / 3.0;
}`,
    },
    {
      id: 'celsius', lvl: 0, title: 'Цельсий в Фаренгейт', fn: 'toFahrenheit', args: ['double'], cmp: 'near',
      desc: `<p>Переведи температуру из градусов Цельсия в Фаренгейты по формуле <code>F = C · 9 / 5 + 32</code>.</p>
<pre>toFahrenheit(0) → 32
toFahrenheit(100) → 212</pre>`,
      starter: `double toFahrenheit(double c) {
    return 0;
}`,
      tests: [[['0'], '32.0'], [['100'], '212.0'], [['-40'], '-40.0'], [['36.6'], '97.88'], [['25'], '77.0']],
      hint: 'Просто перепиши формулу: return c * 9 / 5 + 32; Так как c уже double, деление будет дробным.',
      sol: `double toFahrenheit(double c) {
    return c * 9 / 5 + 32;
}`,
    },
    {
      id: 'absval', lvl: 0, title: 'Модуль числа', fn: 'absValue', args: ['int'],
      desc: `<p>Верни модуль числа (число без знака минус). Не используй готовую <code>abs</code>, сделай через <code>if</code>.</p>
<pre>absValue(-5) → 5
absValue(7) → 7</pre>`,
      starter: `int absValue(int n) {
    return n;
}`,
      tests: [[['-5'], '5'], [['7'], '7'], [['0'], '0'], [['-100'], '100'], [['42'], '42']],
      hint: 'Если n < 0, верни -n. Иначе верни n.',
      sol: `int absValue(int n) {
    if (n < 0) {
        return -n;
    }
    return n;
}`,
    },
    {
      id: 'sign', lvl: 0, title: 'Знак числа', fn: 'sign', args: ['int'],
      desc: `<p>Верни <code>-1</code>, если число отрицательное, <code>0</code>, если оно равно нулю, и <code>1</code>, если положительное.</p>
<pre>sign(-8) → -1
sign(0) → 0
sign(15) → 1</pre>`,
      starter: `int sign(int n) {
    return 0;
}`,
      tests: [[['-8'], '-1'], [['0'], '0'], [['15'], '1'], [['-1'], '-1'], [['1000000'], '1']],
      hint: 'Три случая: if (n < 0) ... else if (n == 0) ... else ...',
      sol: `int sign(int n) {
    if (n < 0) return -1;
    else if (n == 0) return 0;
    else return 1;
}`,
    },
    {
      id: 'grade', lvl: 0, title: 'Оценка за тест', fn: 'grade', args: ['int'],
      desc: `<p>По количеству баллов (0–100) верни букву-оценку: 90 и выше — <code>'A'</code>, 75 и выше — <code>'B'</code>, 60 и выше — <code>'C'</code>, иначе <code>'F'</code>.</p>
<pre>grade(95) → 'A'
grade(80) → 'B'
grade(59) → 'F'</pre>`,
      starter: `char grade(int score) {
    return 'F';
}`,
      tests: [[['95'], "'A'"], [['90'], "'A'"], [['80'], "'B'"], [['75'], "'B'"], [['60'], "'C'"], [['59'], "'F'"], [['0'], "'F'"]],
      hint: 'Проверяй сверху вниз: сначала >= 90, потом >= 75, потом >= 60. Буква пишется в одинарных кавычках: \'A\'.',
      sol: `char grade(int score) {
    if (score >= 90) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    return 'F';
}`,
    },
    {
      id: 'leap', lvl: 0, title: 'Високосный год', fn: 'isLeap', args: ['int'],
      desc: `<p>Год високосный, если он делится на 4, но не делится на 100. Исключение: годы, которые делятся на 400, тоже високосные.</p>
<pre>isLeap(2024) → true
isLeap(1900) → false
isLeap(2000) → true</pre>`,
      starter: `bool isLeap(int year) {
    return false;
}`,
      tests: [[['2024'], 'true'], [['2023'], 'false'], [['1900'], 'false'], [['2000'], 'true'], [['2100'], 'false'], [['1996'], 'true']],
      hint: 'Одним выражением: (year % 4 == 0 && year % 100 != 0) || year % 400 == 0.',
      sol: `bool isLeap(int year) {
    return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
}`,
    },
    {
      id: 'sumto', lvl: 1, title: 'Сумма от 1 до n', fn: 'sumTo', args: ['int'],
      desc: `<p>Верни сумму всех чисел от 1 до <code>n</code> включительно. Сделай это циклом.</p>
<pre>sumTo(5) → 15   // 1+2+3+4+5</pre>`,
      starter: `int sumTo(int n) {
    int total = 0;
    // пройди циклом от 1 до n и прибавляй к total
    return total;
}`,
      tests: [[['1'], '1'], [['5'], '15'], [['10'], '55'], [['100'], '5050'], [['0'], '0']],
      hint: 'for (int i = 1; i <= n; i++) { total += i; }',
      sol: `int sumTo(int n) {
    int total = 0;
    for (int i = 1; i <= n; i++) {
        total += i;
    }
    return total;
}`,
    },
    {
      id: 'power', lvl: 1, title: 'Возведение в степень', fn: 'power', args: ['int', 'int'],
      desc: `<p>Верни <code>a</code> в степени <code>n</code> (n ≥ 0). Сделай циклом, без готовой <code>pow</code>. Результат может быть большим, поэтому тип <code>long long</code>.</p>
<pre>power(2, 10) → 1024
power(3, 0) → 1</pre>`,
      starter: `long long power(int a, int n) {
    return 0;
}`,
      tests: [[['2', '10'], '1024'], [['3', '0'], '1'], [['5', '3'], '125'], [['-2', '3'], '-8'], [['10', '18'], '1000000000000000000']],
      hint: 'Начни с result = 1 и n раз умножь его на a.',
      sol: `long long power(int a, int n) {
    long long result = 1;
    for (int i = 0; i < n; i++) result *= a;
    return result;
}`,
    },
    {
      id: 'divisors', lvl: 1, title: 'Количество делителей', fn: 'countDivisors', args: ['int'],
      desc: `<p>Сколько у числа <code>n</code> (n ≥ 1) делителей? Делитель — число, на которое <code>n</code> делится без остатка.</p>
<pre>countDivisors(6) → 4    // 1, 2, 3, 6
countDivisors(13) → 2   // 1, 13</pre>`,
      starter: `int countDivisors(int n) {
    return 0;
}`,
      tests: [[['1'], '1'], [['6'], '4'], [['12'], '6'], [['13'], '2'], [['100'], '9']],
      hint: 'Перебери i от 1 до n и считай те, где n % i == 0.',
      sol: `int countDivisors(int n) {
    int cnt = 0;
    for (int i = 1; i <= n; i++) {
        if (n % i == 0) cnt++;
    }
    return cnt;
}`,
    },
    {
      id: 'fib', lvl: 1, title: 'Числа Фибоначчи', fn: 'fib', args: ['int'],
      desc: `<p>Последовательность Фибоначчи: 0, 1, 1, 2, 3, 5, 8, 13… Каждое число равно сумме двух предыдущих. Верни <code>n</code>-е число (считая с нуля).</p>
<pre>fib(0) → 0
fib(10) → 55</pre>`,
      starter: `long long fib(int n) {
    return 0;
}`,
      tests: [[['0'], '0'], [['1'], '1'], [['2'], '1'], [['10'], '55'], [['50'], '12586269025']],
      hint: 'Храни два последних числа a = 0, b = 1. n раз делай: next = a + b; a = b; b = next. Ответ в a.',
      sol: `long long fib(int n) {
    long long a = 0, b = 1;
    for (int i = 0; i < n; i++) {
        long long next = a + b;
        a = b;
        b = next;
    }
    return a;
}`,
    },
    {
      id: 'countchar', lvl: 1, title: 'Сколько раз встречается буква', fn: 'countChar', args: ['string', 'char'],
      desc: `<p>Посчитай, сколько раз символ <code>c</code> встречается в строке <code>s</code>.</p>
<pre>countChar("banana", 'a') → 3</pre>`,
      starter: `int countChar(string s, char c) {
    return 0;
}`,
      tests: [[['"hello"', "'l'"], '2'], [['"banana"', "'a'"], '3'], [['""', "'x'"], '0'], [['"C++"', "'+'"], '2'], [['"Mississippi"', "'s'"], '4']],
      hint: 'Перебери символы: for (char ch : s) { if (ch == c) cnt++; }',
      sol: `int countChar(string s, char c) {
    int cnt = 0;
    for (char ch : s) {
        if (ch == c) cnt++;
    }
    return cnt;
}`,
    },
    {
      id: 'upper', lvl: 1, title: 'ЗАГЛАВНЫЕ БУКВЫ', fn: 'toUpper', args: ['string'],
      desc: `<p>Верни строку, где все латинские буквы стали заглавными. Остальные символы не меняются.</p>
<pre>toUpper("C++ is Fun") → "C++ IS FUN"</pre>`,
      starter: `string toUpper(string s) {
    return s;
}`,
      tests: [[['"hello"'], '"HELLO"'], [['"C++ is Fun"'], '"C++ IS FUN"'], [['""'], '""'], [['"123abc"'], '"123ABC"']],
      hint: 'Пройди по индексам: s[i] = toupper(s[i]);',
      sol: `string toUpper(string s) {
    for (int i = 0; i < (int)s.size(); i++) {
        s[i] = toupper(s[i]);
    }
    return s;
}`,
    },
    {
      id: 'repeat', lvl: 1, title: 'Повтор строки', fn: 'repeatStr', args: ['string', 'int'],
      desc: `<p>Верни строку <code>s</code>, повторённую <code>n</code> раз подряд.</p>
<pre>repeatStr("ab", 3) → "ababab"</pre>`,
      starter: `string repeatStr(string s, int n) {
    string result = "";
    return result;
}`,
      tests: [[['"ab"', '3'], '"ababab"'], [['"x"', '0'], '""'], [['"Hi "', '2'], '"Hi Hi "'], [['"-"', '5'], '"-----"']],
      hint: 'n раз выполни result += s;',
      sol: `string repeatStr(string s, int n) {
    string result = "";
    for (int i = 0; i < n; i++) result += s;
    return result;
}`,
    },
    {
      id: 'arrsum', lvl: 1, title: 'Сумма массива', fn: 'arraySum', args: [VI],
      desc: `<p>Дан массив чисел <code>nums</code>. Верни сумму всех его элементов. Это первая задача на <code>vector</code>.</p>
<pre>arraySum([1,2,3]) → 6
arraySum([]) → 0</pre>`,
      starter: `int arraySum(vector<int>& nums) {
    return 0;
}`,
      tests: [[['{1,2,3}'], '6'], [['{}'], '0'], [['{-5,5,10}'], '10'], [['{100}'], '100'], [['{1,1,1,1,1,1,1}'], '7']],
      hint: 'int sum = 0; for (int x : nums) sum += x; return sum;',
      sol: `int arraySum(vector<int>& nums) {
    int sum = 0;
    for (int x : nums) sum += x;
    return sum;
}`,
    },
    {
      id: 'arrmax', lvl: 1, title: 'Максимум массива', fn: 'arrayMax', args: [VI],
      desc: `<p>Верни самый большой элемент массива. Массив не пустой. Числа могут быть отрицательными.</p>
<pre>arrayMax([3,9,2]) → 9
arrayMax([-5,-1,-9]) → -1</pre>`,
      starter: `int arrayMax(vector<int>& nums) {
    return 0;
}`,
      tests: [[['{3,9,2}'], '9'], [['{-5,-1,-9}'], '-1'], [['{7}'], '7'], [['{4,4,4}'], '4'], [['{1,2,3,100,4}'], '100']],
      hint: 'Начни с best = nums[0] (не с 0: все числа могут быть отрицательными), потом сравни с каждым.',
      sol: `int arrayMax(vector<int>& nums) {
    int best = nums[0];
    for (int x : nums) {
        if (x > best) best = x;
    }
    return best;
}`,
    },
    {
      id: 'counteven', lvl: 1, title: 'Сколько чётных', fn: 'countEven', args: [VI],
      desc: `<p>Посчитай, сколько в массиве чётных чисел.</p>
<pre>countEven([1,2,3,4]) → 2</pre>`,
      starter: `int countEven(vector<int>& nums) {
    return 0;
}`,
      tests: [[['{1,2,3,4}'], '2'], [['{}'], '0'], [['{0,-2,7}'], '2'], [['{1,3,5}'], '0'], [['{2,4,6,8}'], '4']],
      hint: 'Перебери числа, проверяй x % 2 == 0.',
      sol: `int countEven(vector<int>& nums) {
    int cnt = 0;
    for (int x : nums) {
        if (x % 2 == 0) cnt++;
    }
    return cnt;
}`,
    },
    {
      id: 'indexof', lvl: 1, title: 'Найти элемент', fn: 'indexOf', args: [VI, 'int'],
      desc: `<p>Верни индекс первого вхождения числа <code>x</code> в массив или <code>-1</code>, если его нет. Индексы начинаются с 0.</p>
<pre>indexOf([5,3,8], 8) → 2
indexOf([5,3,8], 4) → -1</pre>`,
      starter: `int indexOf(vector<int>& nums, int x) {
    return -1;
}`,
      tests: [[['{5,3,8}', '8'], '2'], [['{5,3,8}', '4'], '-1'], [['{1,1,1}', '1'], '0'], [['{}', '1'], '-1'], [['{9,8,7,6}', '6'], '3']],
      hint: 'Цикл по индексам i от 0 до nums.size(). Как только nums[i] == x, сразу return i. После цикла return -1.',
      sol: `int indexOf(vector<int>& nums, int x) {
    for (int i = 0; i < (int)nums.size(); i++) {
        if (nums[i] == x) return i;
    }
    return -1;
}`,
    },
    {
      id: 'revarr', lvl: 1, title: 'Перевернуть массив', fn: 'reverseArray', args: [VI],
      desc: `<p>Верни новый массив с элементами в обратном порядке.</p>
<pre>reverseArray([1,2,3]) → [3,2,1]</pre>`,
      starter: `vector<int> reverseArray(vector<int>& nums) {
    vector<int> result;
    return result;
}`,
      tests: [[['{1,2,3}'], '{3,2,1}'], [['{}'], '{}'], [['{5}'], '{5}'], [['{1,2,3,4}'], '{4,3,2,1}']],
      hint: 'Иди с конца: for (int i = nums.size() - 1; i >= 0; i--) result.push_back(nums[i]);',
      sol: `vector<int> reverseArray(vector<int>& nums) {
    vector<int> result;
    for (int i = (int)nums.size() - 1; i >= 0; i--) {
        result.push_back(nums[i]);
    }
    return result;
}`,
    },
    {
      id: 'multiples', lvl: 1, title: 'Таблица умножения', fn: 'multiples', args: ['int', 'int'],
      desc: `<p>Верни массив из первых <code>n</code> чисел, кратных <code>x</code>: x, 2x, 3x…</p>
<pre>multiples(3, 4) → [3,6,9,12]</pre>`,
      starter: `vector<int> multiples(int x, int n) {
    vector<int> result;
    return result;
}`,
      tests: [[['3', '4'], '{3,6,9,12}'], [['5', '1'], '{5}'], [['7', '0'], '{}'], [['-2', '3'], '{-2,-4,-6}'], [['1', '5'], '{1,2,3,4,5}']],
      hint: 'for (int i = 1; i <= n; i++) result.push_back(x * i);',
      sol: `vector<int> multiples(int x, int n) {
    vector<int> result;
    for (int i = 1; i <= n; i++) result.push_back(x * i);
    return result;
}`,
    },
  ];

  // Порядок задач: сначала основы, потом разминка, дальше как было
  const ORDER = ["sum", "square", "minutes", "lastdigit", "average", "celsius", "absval", "max3", "even", "sign", "grade", "leap", "sumto", "fact", "power", "divisors", "digits", "fib", "prime", "countchar", "revstr", "upper", "vowels", "palin", "repeat", "arrsum", "arrmax", "counteven", "indexof", "revarr", "multiples", "fizz"];
  P.sort((a, b) => {
    const ia = ORDER.indexOf(a.id), ib = ORDER.indexOf(b.id);
    if (a.lvl !== b.lvl) return a.lvl - b.lvl;
    return (ia < 0 ? 1e9 : ia) - (ib < 0 ? 1e9 : ib);
  });

  const api = { PROBLEMS: P, LEVELS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else Object.assign(root, api);
})(typeof self !== 'undefined' ? self : this);
