// Matematik — 6. sınıf soru üreticileri (konular/matematik.php'nin tarayıcı karşılığı)
// Her üretici: { text, short, answer, wrong: [...], exp }
window.MATH_GEN = (() => {
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = arr => arr[ri(0, arr.length - 1)];
  const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
  const lcm = (a, b) => (a * b) / gcd(a, b);
  const num = n => {
    if (!Number.isInteger(n)) {
      let s = n.toFixed(3).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',');
      return s.replace('-', '−');
    }
    return n < 0 ? '−' + Math.abs(n) : String(n);
  };
  const par = n => (n < 0 ? '(' + num(n) + ')' : num(n));
  const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  const sup = n => String(n).split('').map(c => SUP[c]).join('');
  const frac = (a, b) => { const g = gcd(a, b); a /= g; b /= g; return b === 1 ? num(a) : num(a) + '/' + b; };
  const r2 = x => Math.round(x * 100) / 100;
  // Doğru cevabın yakınından farklı yanlış cevaplar
  const near = (ans, extra = [], positive = true) => {
    const c = [...extra];
    for (const d of [1, -1, 2, -2, 10, -10, 3, 5]) c.push(ans + d);
    return [...new Set(c.filter(x => x !== ans && (!positive || x > 0)))].map(num);
  };

  return {
    m_uslu() {
      const a = ri(2, 9);
      const n = a <= 3 ? ri(2, 5) : a <= 5 ? ri(2, 4) : ri(2, 3);
      const v = a ** n;
      if (ri(0, 2) === 0) {
        const b = ri(2, 5), w = b * b, ans = v + w;
        const short = `${a}${sup(n)} + ${b}²`;
        return { text: `${short} işleminin sonucu kaçtır?`, short, answer: num(ans), wrong: near(ans, [a * n + b * 2, v + b * 2, a * n + w]),
          exp: `${a}${sup(n)} = ${v}, ${b}² = ${w}. ${v} + ${w} = ${ans}.` };
      }
      const short = `${a}${sup(n)}`;
      return { text: `${short} ifadesinin değeri kaçtır?`, short, answer: num(v), wrong: near(v, [a * n, a + n, n ** a <= 99999 ? n ** a : v + 4]),
        exp: `${short}, ${a} sayısının kendisiyle ${n} kez çarpımıdır: ${v}. (${a} × ${n} değil!)` };
    },
    m_islem() {
      if (ri(0, 1)) {
        const c = ri(2, 6), q = ri(2, 6), b = c * q, d = ri(2, 4), a = q * d + ri(1, 30), ans = a - q * d;
        const short = `${a} − ${b} ÷ ${c} × ${d}`;
        const lr = ((a - b) % c === 0) ? ((a - b) / c) * d : ans + 4;
        return { text: `${short} işleminin sonucu kaçtır?`, short, answer: num(ans), wrong: near(ans, [lr, a - Math.floor(b / (c * d)) || ans + 6]),
          exp: `Önce bölme ve çarpma soldan sağa: ${b} ÷ ${c} = ${q}, ${q} × ${d} = ${q * d}. Sonra ${a} − ${q * d} = ${ans}.` };
      }
      const a = ri(2, 12), b = ri(2, 9), c = ri(2, 6), d = ri(1, 9), ans = (a + b) * c - d;
      const short = `(${a} + ${b}) × ${c} − ${d}`;
      return { text: `${short} işleminin sonucu kaçtır?`, short, answer: num(ans),
        wrong: near(ans, [a + b * c - d, (a + b) * (c - d) > 0 ? (a + b) * (c - d) : ans + 7]),
        exp: `Önce parantez: ${a} + ${b} = ${a + b}. Sonra çarpma: ${(a + b) * c}. En son çıkarma: ${ans}.` };
    },
    m_bolun() {
      const k = pick([3, 9]);
      let x, z, opts;
      do { x = ri(1, 9); z = ri(0, 9); opts = [...Array(10).keys()].filter(a => (x + a + z) % k === 0); } while (!opts.length);
      const a = Math.max(...opts);
      return { text: `${x}A${z} üç basamaklı sayısı ${k} ile tam bölünebiliyorsa A en çok kaçtır?`, short: `${x}A${z} sayısı ${k} ile bölünüyor, en büyük A`,
        answer: String(a), wrong: [...Array(10).keys()].filter(v => v !== a).map(String),
        exp: `${k} ile bölünebilme için rakamlar toplamı ${k} ile bölünebilmeli: ${x} + A + ${z}. En büyük uygun A = ${a}.` };
    },
    m_asal() {
      const g = pick([2, 3, 4, 5, 6, 8]);
      let p, r;
      do { p = ri(2, 7); r = ri(2, 7); } while (p === r || gcd(p, r) !== 1);
      const a = g * p, b = g * r;
      if (ri(0, 1)) {
        return { text: `${a} ve ${b} sayılarının en büyük ortak böleni (EBOB) kaçtır?`, short: `EBOB(${a}, ${b})`, answer: num(g),
          wrong: near(g, [lcm(a, b), g * 2, Math.floor(g / 2) || 1]), exp: `${a} ve ${b} sayılarını bölen en büyük sayı: ${g}. ${a} = ${g} × ${p}, ${b} = ${g} × ${r}.` };
      }
      const l = lcm(a, b);
      return { text: `${a} ve ${b} sayılarının en küçük ortak katı (EKOK) kaçtır?`, short: `EKOK(${a}, ${b})`, answer: num(l),
        wrong: near(l, [a * b, g, l * 2]), exp: `Ortak katların en küçüğü: ${l}. EKOK = ${g} × ${p} × ${r} = ${l}.` };
    },
    m_tam() {
      const a = ri(-15, 15) || 4, b = ri(-15, 15) || -6;
      if (ri(0, 1)) {
        const ans = a + b, short = `${par(a)} + ${par(b)}`;
        return { text: `${short} işleminin sonucu kaçtır?`, short, answer: num(ans), wrong: near(ans, [a - b, -ans, Math.abs(a) + Math.abs(b)], false),
          exp: `İşaretleri ${(a < 0) === (b < 0) ? 'aynı olan sayılar toplanır, işaret korunur' : 'farklı olan sayılarda büyükten küçük çıkarılır, büyüğün işareti alınır'}: ${short} = ${num(ans)}.` };
      }
      const ans = a - b, short = `${par(a)} − ${par(b)}`;
      return { text: `${short} işleminin sonucu kaçtır?`, short, answer: num(ans), wrong: near(ans, [a + b, -ans], false),
        exp: `Çıkarma, çıkanın ters işaretlisiyle toplamadır: ${par(a)} + ${par(-b)} = ${num(ans)}.` };
    },
    m_kesir() {
      const t = ri(0, 2);
      if (t === 0) {
        const d = pick([4, 6, 8, 9, 10, 12]), a = ri(1, d - 1), b = ri(1, d - 1), ans = frac(a + b, d), short = `${a}/${d} + ${b}/${d}`;
        return { text: `${short} işleminin sonucu kaçtır?`, short, answer: ans,
          wrong: [`${a + b}/${d * 2}`, frac(a + b + 1, d), frac(Math.abs(a + b - 1) || 2, d), frac(a * b, d)].filter(w => w !== ans),
          exp: `Paydalar eşitse paylar toplanır, payda aynı kalır: ${a + b}/${d} = ${ans}.` };
      }
      if (t === 1) {
        const d = pick([2, 3, 4, 5, 6]), a = ri(1, d - 1), k = ri(2, 9), n = d * k, ans = (n / d) * a;
        return { text: `${n} sayısının ${a}/${d} kadarı kaçtır?`, short: `${n} × ${a}/${d}`, answer: num(ans), wrong: near(ans, [k, n - ans, n * a]),
          exp: `${n} ÷ ${d} = ${k}, ${k} × ${a} = ${ans}.` };
      }
      const d1 = pick([2, 3, 4]); let d2 = pick([3, 4, 6, 8]); if (d1 === d2) d2 = 6;
      const a = ri(1, d1 - 1) || 1, b = ri(1, d2 - 1), l = lcm(d1, d2), nm = a * (l / d1) + b * (l / d2), short = `${a}/${d1} + ${b}/${d2}`, ans = frac(nm, l);
      return { text: `${short} işleminin sonucu kaçtır?`, short, answer: ans,
        wrong: [`${a + b}/${d1 + d2}`, frac(nm + 1, l), frac(a + b, l), frac(nm, l * 2)].filter(w => w !== ans),
        exp: `Paydalar ${l} olacak şekilde eşitlenir: ${a * (l / d1)}/${l} + ${b * (l / d2)}/${l} = ${nm}/${l} = ${ans}.` };
    },
    m_ondalik() {
      if (ri(0, 1)) {
        const a = ri(11, 99) / 10, b = ri(101, 499) / 100, ans = r2(a + b), short = `${num(a)} + ${num(b)}`;
        return { text: `${short} işleminin sonucu kaçtır?`, short, answer: num(ans),
          wrong: [num(r2(ans + 0.1)), num(r2(ans - 0.01)), num(r2(a * 10 + b)), num(r2(ans + 1))],
          exp: `Virgüller alt alta gelecek şekilde toplanır: ${num(ans)}.` };
      }
      const a = ri(101, 999) / 100, k = pick([10, 100]), ans = r2(a * k), short = `${num(a)} × ${k}`;
      return { text: `${short} işleminin sonucu kaçtır?`, short, answer: num(ans),
        wrong: [...new Set([num(r2(a * k * 10)), num(r2(a * k / 10)), num(r2(a + k)), num(Math.round(a * k / 100 * 1000) / 1000)])].filter(w => w !== num(ans)),
        exp: `${k} ile çarpınca virgül ${k === 10 ? 'bir' : 'iki'} basamak sağa kayar: ${num(ans)}.` };
    },
    m_oran() {
      let x, y;
      do { x = ri(1, 7); y = ri(2, 9); } while (x === y || gcd(x, y) !== 1);
      const k = ri(2, 8);
      if (ri(0, 1)) {
        return { text: `${x * k} : ${y * k} oranının en sade hâli hangisidir?`, short: `${x * k} : ${y * k} en sade hâli`, answer: `${x} : ${y}`,
          wrong: [`${x + 1} : ${y}`, `${y} : ${x}`, `${x} : ${y + 1}`, `${x * 2} : ${y * 3}`].filter(w => w !== `${x} : ${y}`), exp: `İki terim de ${k} ile bölünür: ${x} : ${y}.` };
      }
      const b = y * k, a = x * k;
      return { text: `Bir kulüpte kızların sayısının erkeklerin sayısına oranı ${x}/${y} ve kulüpte ${b} erkek varsa kaç kız vardır?`,
        short: `Kız : erkek = ${x} : ${y}, erkek ${b} → kız`, answer: num(a), wrong: near(a, [a + b, b, k]), exp: `${b} ÷ ${y} = ${k}, kızlar ${x} × ${k} = ${a}.` };
    },
    m_cebir() {
      const a = ri(2, 9), b = ri(1, 15), x = ri(2, 9);
      if (ri(0, 1)) {
        const ans = a * x + b;
        return { text: `${a}x + ${b} cebirsel ifadesinin x = ${x} için değeri kaçtır?`, short: `${a}x + ${b} (x = ${x})`, answer: num(ans),
          wrong: near(ans, [a + x + b, Number(`${a}${x}`) + b, a * (x + b)]), exp: `x yerine ${x} yazılır: ${a} × ${x} + ${b} = ${ans}.` };
      }
      const ans = a * (x - 1);
      return { text: `${a}(x − 1) ifadesinin x = ${x} için değeri kaçtır?`, short: `${a}(x − 1) (x = ${x})`, answer: num(ans),
        wrong: near(ans, [a * x - 1, a * x, a + x - 1]), exp: `Önce parantez: ${x} − 1 = ${x - 1}, sonra ${a} × ${x - 1} = ${ans}.` };
    },
    m_aci() {
      if (ri(0, 1)) {
        const a = ri(5, 85);
        return { text: `Ölçüsü ${a}° olan açının tümleri kaç derecedir?`, short: `${a}° açının tümleri`, answer: `${90 - a}°`,
          wrong: [180 - a, 100 - a, 100 - a, a + 90, 95 - a, 85 - a].map(v => v + '°'), exp: `Tümler açıların toplamı 90°’dir: 90 − ${a} = ${90 - a}°.` };
      }
      const a = ri(10, 170);
      return { text: `Ölçüsü ${a}° olan açının bütünleri kaç derecedir?`, short: `${a}° açının bütünleri`, answer: `${180 - a}°`,
        wrong: [Math.abs(90 - a), 190 - a, 360 - a, 170 - a].map(v => v + '°').filter(w => w !== `${180 - a}°`), exp: `Bütünler açıların toplamı 180°’dir: 180 − ${a} = ${180 - a}°.` };
    },
    m_alan() {
      const b = ri(3, 14); let h = ri(2, 12);
      const t = ri(0, 2), cm = v => v + ' cm²';
      if (t === 0) {
        if ((b * h) % 2) h++;
        const ans = (b * h) / 2;
        return { text: `Taban uzunluğu ${b} cm, yüksekliği ${h} cm olan üçgenin alanı kaç cm²’dir?`, short: `Üçgen: taban ${b}, yükseklik ${h}`, answer: cm(ans),
          wrong: [b * h, b + h, ans + b, 2 * (b + h), ans * 2, ans + 1].map(cm), exp: `Üçgenin alanı = taban × yükseklik ÷ 2 = ${b} × ${h} ÷ 2 = ${ans} cm².` };
      }
      const ans = b * h;
      if (t === 1) {
        return { text: `Taban uzunluğu ${b} cm, bu tabana ait yüksekliği ${h} cm olan paralelkenarın alanı kaç cm²’dir?`, short: `Paralelkenar: taban ${b}, yükseklik ${h}`,
          answer: cm(ans), wrong: [Math.floor(ans / 2) || 1, 2 * (b + h), b + h, ans + h, ans * 2, ans + b + 1].map(cm), exp: `Paralelkenarın alanı = taban × yükseklik = ${b} × ${h} = ${ans} cm².` };
      }
      return { text: `Kenar uzunlukları ${b} cm ve ${h} cm olan dikdörtgenin alanı kaç cm²’dir?`, short: `Dikdörtgen: ${b} cm × ${h} cm`, answer: cm(ans),
        wrong: [2 * (b + h), b + h, ans + 2, ans - b, ans * 2, ans + b].map(cm), exp: `Dikdörtgenin alanı = uzun kenar × kısa kenar = ${ans} cm². (${2 * (b + h)} cm çevresidir.)` };
    },
    m_veri() {
      const n = ri(3, 5);
      let mean = ri(4, 20);
      const vals = [];
      for (let i = 0; i < n - 1; i++) vals.push(mean + ri(-4, 4));
      let last = mean * n - vals.reduce((s, v) => s + v, 0);
      if (last < 1) last = mean;
      vals.push(last);
      let sum = vals.reduce((s, v) => s + v, 0);
      if (sum % n) { vals[n - 1] += n - (sum % n); sum = vals.reduce((s, v) => s + v, 0); }
      mean = sum / n;
      if (ri(0, 2) === 0) {
        if (Math.max(...vals) === Math.min(...vals)) vals[0] += 2;
        const range = Math.max(...vals) - Math.min(...vals), list = vals.join(', ');
        return { text: `${list} veri grubunun açıklığı kaçtır?`, short: `${list} verisinin açıklığı`, answer: num(range),
          wrong: near(range, [Math.max(...vals), vals.reduce((s, v) => s + v, 0)]), exp: `Açıklık = en büyük − en küçük = ${Math.max(...vals)} − ${Math.min(...vals)} = ${range}.` };
      }
      const list = vals.join(', ');
      return { text: `${list} sayılarının aritmetik ortalaması kaçtır?`, short: `${list} ortalaması`, answer: num(mean),
        wrong: near(mean, [sum, mean + n]), exp: `Toplam ${sum}, veri sayısı ${n}. ${sum} ÷ ${n} = ${mean}.` };
    },
  };
})();
