// Minikler: küçük çocuklar için resimli, sesli, dokunmalı etkinlikler (MentalUp tarzı).
// Her soru her seferinde yeniden üretilir. İki sürümde de aynı kod; coin ödülü sunucudan (kids_finish).
(() => {
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[ri(0, a.length - 1)];
  const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = ri(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (a, n) => shuffle(a).slice(0, n);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---- veri ----
  // Türkçe kelimeler: [kelime, resim]
  const WORDS = [['kedi', '🐱'], ['köpek', '🐶'], ['elma', '🍎'], ['araba', '🚗'], ['balık', '🐟'], ['ev', '🏠'], ['güneş', '☀️'], ['ağaç', '🌳'],
    ['top', '⚽'], ['uçak', '✈️'], ['ördek', '🦆'], ['çiçek', '🌸'], ['şemsiye', '☂️'], ['inek', '🐄'], ['yıldız', '⭐'], ['muz', '🍌'],
    ['aslan', '🦁'], ['fil', '🐘'], ['zürafa', '🦒'], ['havuç', '🥕'], ['limon', '🍋'], ['saat', '⌚'], ['pasta', '🎂'], ['dondurma', '🍦'],
    ['robot', '🤖'], ['gemi', '🚢'], ['tavşan', '🐰'], ['kuş', '🐦'], ['bisiklet', '🚲'], ['kalem', '✏️'], ['ayı', '🐻'], ['çilek', '🍓'],
    ['üzüm', '🍇'], ['nar', '🍎'], ['kurbağa', '🐸'], ['penguen', '🐧'], ['kitap', '📕'], ['bebek', '👶'], ['domates', '🍅'], ['mantar', '🍄']]
    .filter(w => w[0] !== 'nar');
  const LETTERS = 'ABCÇDEFGHIİJKLMNOÖPRSŞTUÜVYZ'.split('');
  const VOWELS = 'aeıioöuü';
  const syllables = w => [...w].filter(c => VOWELS.includes(c)).length;
  const upTR = s => s.toLocaleUpperCase('tr');

  const ENG = {
    hayvanlar: [['cat', '🐱'], ['dog', '🐶'], ['fish', '🐟'], ['bird', '🐦'], ['cow', '🐄'], ['lion', '🦁'], ['elephant', '🐘'], ['monkey', '🐒'], ['horse', '🐴'], ['rabbit', '🐰'], ['frog', '🐸'], ['bear', '🐻']],
    meyveler: [['apple', '🍎'], ['banana', '🍌'], ['grapes', '🍇'], ['strawberry', '🍓'], ['lemon', '🍋'], ['orange', '🍊'], ['watermelon', '🍉'], ['cherry', '🍒'], ['pear', '🍐']],
    renkler: [['red', '#e03131'], ['blue', '#1c7ed6'], ['green', '#2f9e44'], ['yellow', '#fcc419'], ['orange', '#fd7e14'], ['purple', '#7048e8'], ['pink', '#f06595'], ['black', '#212529'], ['white', '#ffffff'], ['brown', '#8b5a2b']],
    sayilar: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
  };

  const GROUPS = {
    meyve: ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍒', '🍐', '🍍', '🥝'],
    sebze: ['🥕', '🥦', '🍅', '🥒', '🌽', '🍆', '🥔', '🧅', '🫑'],
    hayvan: ['🐱', '🐶', '🐰', '🐻', '🦁', '🐘', '🐒', '🐴', '🐄', '🐸', '🐧', '🦒'],
    tasit: ['🚗', '🚌', '🚲', '✈️', '🚢', '🚂', '🚁', '🚀', '🛵'],
    giysi: ['👕', '👖', '👗', '🧢', '🧣', '🧤', '👟', '🧦'],
    oyuncak: ['⚽', '🧸', '🪁', '🎈', '🪀', '🎲', '🧩'],
  };
  const HABITATS = { su: ['🐟', '🐬', '🐙', '🦈', '🐳', '🦀', '🐠'], kara: ['🐱', '🐶', '🦁', '🐘', '🐄', '🐴', '🐰', '🐻'], hava: ['🐦', '🦅', '🦋', '🐝', '🦉', '🕊️'] };
  const SEASONS = [['Kış', '⛄', ['⛄', '🧣', '❄️', '🎿', '🧤']], ['İlkbahar', '🌸', ['🌸', '🌷', '🐣', '🌱']], ['Yaz', '☀️', ['🏖️', '🍉', '🩳', '🍦', '🏊']], ['Sonbahar', '🍂', ['🍂', '🍁', '☔', '🌰']]];
  const ORGANS = [['görmek', '👁️', 'gözümüzü'], ['duymak', '👂', 'kulağımızı'], ['koklamak', '👃', 'burnumuzu'], ['tatmak', '👅', 'dilimizi'], ['dokunmak', '✋', 'elimizi']];
  const JOBS = [['Hastaları kim iyileştirir?', '🧑‍⚕️', 'Doktor'], ['Yangını kim söndürür?', '🧑‍🚒', 'İtfaiyeci'], ['Yemeği kim pişirir?', '🧑‍🍳', 'Aşçı'], ['Bize ders kim anlatır?', '🧑‍🏫', 'Öğretmen'],
    ['Tarlayı kim eker?', '🧑‍🌾', 'Çiftçi'], ['Uçağı kim uçurur?', '🧑‍✈️', 'Pilot'], ['Bizi kim korur?', '👮', 'Polis']];
  const HEALTHY = ['🥦', '🍎', '🥕', '🥛', '🍌', '🥚', '🐟', '🍇'];
  const UNHEALTHY = ['🍭', '🍟', '🥤', '🍩', '🍬', '🍫'];

  // Şekiller (SVG)
  const SHAPES = {
    'daire': '<circle cx="50" cy="50" r="38"/>',
    'kare': '<rect x="14" y="14" width="72" height="72"/>',
    'üçgen': '<polygon points="50,10 90,86 10,86"/>',
    'dikdörtgen': '<rect x="6" y="26" width="88" height="48"/>',
    'yıldız': '<polygon points="50,6 61,38 95,38 67,58 78,92 50,72 22,92 33,58 5,38 39,38"/>',
    'kalp': '<path d="M50 88 C10 60 6 30 26 20 C40 13 50 26 50 32 C50 26 60 13 74 20 C94 30 90 60 50 88Z"/>',
  };
  const SHAPE_COLORS = ['#ff6b6b', '#4dabf7', '#69db7c', '#ffd43b', '#da77f2', '#ffa94d'];
  const shapeSvg = (k, c) => `<svg viewBox="0 0 100 100" class="k-shape" aria-hidden="true"><g fill="${c || pick(SHAPE_COLORS)}" stroke="#1d2340" stroke-width="3" stroke-linejoin="round">${SHAPES[k]}</g></svg>`;

  // ---- görünüş yardımcıları ----
  const row = (emojis, cls = '') => `<div class="k-row ${cls}">${emojis.map(e => `<span>${e}</span>`).join('')}</div>`;
  const opt = (html, label) => ({ html, label });
  const numOpts = (ans, lo = 1, hi = 10) => {
    const set = new Set([ans]);
    while (set.size < 4) set.add(Math.max(lo, Math.min(hi, ans + pick([-3, -2, -1, 1, 2, 3]))));
    if (set.size < 4) for (let n = lo; set.size < 4; n++) set.add(n);
    const list = shuffle([...set]);
    return { options: list.map(n => opt(`<b class="k-num">${n}</b>`, String(n))), correct: list.indexOf(ans) };
  };
  const choice = (correctItem, wrongs, render) => {
    const list = shuffle([correctItem, ...wrongs]);
    return { options: list.map(render), correct: list.indexOf(correctItem) };
  };

  // ---- üreticiler: her biri { say, visual, options, correct, kind } döndürür ----
  const GEN = {
    matematik: [
      // Say
      () => { const e = pick(GROUPS.meyve.concat(GROUPS.hayvan)); const n = ri(2, 10); return { say: `Kaç tane var? Say bakalım!`, visual: row(Array(n).fill(e), 'k-count'), ...numOpts(n) }; },
      // Resimli toplama
      () => { const e = pick(GROUPS.meyve); const a = ri(1, 5), b = ri(1, 5); return { say: `${a} artı ${b} kaç eder?`, visual: `<div class="k-math">${row(Array(a).fill(e))}<b>+</b>${row(Array(b).fill(e))}<b>=</b><b class="k-q">?</b></div>`, ...numOpts(a + b, 1, 10) }; },
      // Resimli çıkarma (uçanlar çizili)
      () => { const e = pick(['🎈', '🐦', '🦋', '🍪']); const a = ri(3, 9), b = ri(1, a - 1); return { say: `${a} tane vardı, ${b} tanesi gitti. Kaç tane kaldı?`, visual: `<div class="k-row k-count">${Array(a).fill(0).map((_, i) => `<span class="${i >= a - b ? 'gone' : ''}">${e}</span>`).join('')}</div>`, ...numOpts(a - b, 0, 9) }; },
      // Hangisi daha çok
      () => {
        const e1 = pick(GROUPS.meyve), e2 = pick(GROUPS.hayvan); let a = ri(2, 9), b = ri(2, 9); if (a === b) b = a === 9 ? 3 : a + 1;
        const more = a > b ? 0 : 1;
        return { say: 'Hangisi daha çok?', visual: '', options: [opt(row(Array(a).fill(e1), 'small'), 'sol'), opt(row(Array(b).fill(e2), 'small'), 'sağ')], correct: more, wide: true };
      },
      // Şekil bul
      () => { const keys = sample(Object.keys(SHAPES), 4); const k = keys[0]; return { say: `Hangisi ${k}?`, visual: '', ...choice(k, keys.slice(1), x => opt(shapeSvg(x), x)) }; },
      // Örüntü
      () => {
        const pool = sample(['🔴', '🔵', '🟢', '🟡', '⭐', '🌙', '🍎', '🐟'], 3);
        const pat = pick([[0, 1], [0, 0, 1], [0, 1, 2], [0, 1, 1]]).map(i => pool[i]);
        const seq = Array.from({ length: pat.length * 2 + 1 }, (_, i) => pat[i % pat.length]);
        const ans = seq.pop();
        return { say: 'Sırada hangisi gelir?', visual: `<div class="k-row">${seq.map(e => `<span>${e}</span>`).join('')}<span class="k-q">?</span></div>`, ...choice(ans, pool.filter(p => p !== ans).concat(pool.length < 4 ? ['🟣'] : []).slice(0, 3), x => opt(`<span class="k-big">${x}</span>`, x)) };
      },
      // Büyük - küçük
      () => { const e = pick(GROUPS.hayvan); const big = ri(0, 2); const sizes = [1, 2, 3].map((s, i) => i === big ? 2.6 : 1 + i * 0.35); return { say: 'Hangisi en büyük?', visual: '', options: sizes.map((s, i) => opt(`<span style="font-size:${s * 34}px">${e}</span>`, String(i))), correct: big }; },
      // Rakam - nokta eşle
      () => { const n = ri(1, 9); return { say: `${n} rakamı hangisinde var?`, visual: `<b class="k-num huge">${n}</b>`, ...choice(n, sample([1, 2, 3, 4, 5, 6, 7, 8, 9].filter(x => x !== n), 3), x => opt(`<span class="k-dots">${'●'.repeat(x)}</span>`, String(x))) }; },
    ],
    turkce: [
      // Hangi harfle başlar
      () => { const [w, e] = pick(WORDS); const L = upTR(w[0]); return { say: `${w}. Hangi harfle başlar?`, visual: `<span class="k-big huge">${e}</span>`, ...choice(L, sample(LETTERS.filter(x => x !== L), 3), x => opt(`<b class="k-letter">${x}</b>`, x)) }; },
      // Kaç heceli
      () => { const [w, e] = pick(WORDS); return { say: `${w}. Kaç hecelidir? El çırparak say!`, visual: `<span class="k-big huge">${e}</span><div class="k-word">${w}</div>`, ...numOpts(syllables(w), 1, 4) }; },
      // Resim - kelime
      () => { const items = sample(WORDS, 4); const [w, e] = items[0]; return { say: `Bu resim hangi kelime?`, visual: `<span class="k-big huge">${e}</span>`, ...choice(w, items.slice(1).map(x => x[0]), x => opt(`<b class="k-wordbtn">${x}</b>`, x)) }; },
      // Kelime - resim
      () => { const items = sample(WORDS, 4); const [w, e] = items[0]; return { say: `${w} hangisi?`, visual: `<div class="k-word big">${w}</div>`, ...choice(e, items.slice(1).map(x => x[1]), x => opt(`<span class="k-big">${x}</span>`, x)) }; },
      // Eksik harf
      () => { const [w, e] = pick(WORDS.filter(x => x[0].length >= 3 && x[0].length <= 6)); const i = ri(0, w.length - 1); const L = upTR(w[i]); return { say: `${w}. Eksik harf hangisi?`, visual: `<span class="k-big huge">${e}</span><div class="k-word">${upTR(w).split('').map((c, j) => j === i ? '<span class="k-q">_</span>' : c).join('')}</div>`, ...choice(L, sample(LETTERS.filter(x => x !== L), 3), x => opt(`<b class="k-letter">${x}</b>`, x)) }; },
    ],
    hayat: [
      // Nerede yaşar
      () => { const place = pick(Object.keys(HABITATS)); const e = pick(HABITATS[place]); const label = { su: 'Suda', kara: 'Karada', hava: 'Havada' }; const icon = { su: '🌊', kara: '🌳', hava: '☁️' }; return { say: 'Bu hayvan nerede yaşar?', visual: `<span class="k-big huge">${e}</span>`, ...choice(place, Object.keys(HABITATS).filter(p => p !== place), p => opt(`<span class="k-big">${icon[p]}</span><small>${label[p]}</small>`, label[p])) }; },
      // Hangisi suda yaşar / uçar
      () => { const place = pick(['su', 'hava']); const right = pick(HABITATS[place]); const wrong = sample(HABITATS.kara, 3); return { say: place === 'su' ? 'Hangisi suda yaşar?' : 'Hangisi uçabilir?', visual: '', ...choice(right, wrong, x => opt(`<span class="k-big">${x}</span>`, x)) }; },
      // Mevsim
      () => { const [name, , items] = pick(SEASONS); const e = pick(items); return { say: 'Bu hangi mevsimde olur?', visual: `<span class="k-big huge">${e}</span>`, ...choice(name, SEASONS.map(s => s[0]).filter(n => n !== name), n => opt(`<span class="k-big">${SEASONS.find(s => s[0] === n)[1]}</span><small>${n}</small>`, n)) }; },
      // Meyve mi sebze mi
      () => { const isVeg = Math.random() < 0.5; const right = pick(isVeg ? GROUPS.sebze : GROUPS.meyve); const wrong = sample(isVeg ? GROUPS.meyve : GROUPS.sebze, 3); return { say: isVeg ? 'Hangisi sebzedir?' : 'Hangisi meyvedir?', visual: '', ...choice(right, wrong, x => opt(`<span class="k-big">${x}</span>`, x)) }; },
      // Organlar
      () => { const [verb, e] = pick(ORGANS); return { say: `${verb[0].toLocaleUpperCase('tr') + verb.slice(1)} için hangi organımızı kullanırız?`, visual: '', ...choice(e, ORGANS.map(o => o[1]).filter(x => x !== e).slice(0, 3), x => opt(`<span class="k-big">${x}</span>`, x)) }; },
      // Sağlıklı beslenme
      () => { const right = pick(HEALTHY); return { say: 'Hangisi sağlıklı bir yiyecek?', visual: '', ...choice(right, sample(UNHEALTHY, 3), x => opt(`<span class="k-big">${x}</span>`, x)) }; },
      // Meslekler
      () => { const [q, e, n] = pick(JOBS); return { say: q, visual: '', ...choice(e, sample(JOBS.filter(j => j[1] !== e), 3).map(j => j[1]), x => opt(`<span class="k-big">${x}</span><small>${JOBS.find(j => j[1] === x)[2]}</small>`, x)) }; },
      // Trafik ışığı
      () => { const lights = [['Kırmızı ışıkta ne yaparız?', '🔴', 'Dururuz', '🧍'], ['Yeşil ışıkta ne yaparız?', '🟢', 'Geçeriz', '🚶']]; const [q, l, ans, e] = pick(lights); return { say: q, visual: `<span class="k-big huge">🚦${l}</span>`, ...choice(ans, [lights.find(x => x[2] !== ans)[2]], x => opt(`<span class="k-big">${x === 'Dururuz' ? '🧍' : '🚶'}</span><small>${x}</small>`, x)) }; },
    ],
    ingilizce: [
      // Renk
      () => { const items = sample(ENG.renkler, 4); const [w, c] = items[0]; return { say: `Which color is ${w}?`, sayLang: 'en-US', visual: `<div class="k-word big">${w}</div>`, ...choice(c, items.slice(1).map(x => x[1]), x => opt(`<span class="k-swatch" style="background:${x}"></span>`, x)) }; },
      // Hayvan / meyve resmi -> kelime
      () => { const set = pick([ENG.hayvanlar, ENG.meyveler]); const items = sample(set, 4); const [w, e] = items[0]; return { say: 'What is this?', sayLang: 'en-US', visual: `<span class="k-big huge">${e}</span>`, ...choice(w, items.slice(1).map(x => x[0]), x => opt(`<b class="k-wordbtn">${x}</b>`, x)) }; },
      // Kelime -> resim
      () => { const set = pick([ENG.hayvanlar, ENG.meyveler]); const items = sample(set, 4); const [w, e] = items[0]; return { say: `Find the ${w}!`, sayLang: 'en-US', visual: `<div class="k-word big">${w}</div>`, ...choice(e, items.slice(1).map(x => x[1]), x => opt(`<span class="k-big">${x}</span>`, x)) }; },
      // Sayılar
      () => { const n = ri(1, 10); return { say: `Count! How many?`, sayLang: 'en-US', visual: row(Array(n).fill(pick(['⭐', '🍎', '🎈'])), 'k-count'), ...choice(ENG.sayilar[n - 1], sample(ENG.sayilar.filter((_, i) => i !== n - 1), 3), x => opt(`<b class="k-wordbtn">${x}</b>`, x)) }; },
    ],
    dikkat: [
      // Farklı olanı bul (kategori)
      () => { const [g1, g2] = sample(Object.keys(GROUPS), 2); const same = sample(GROUPS[g1], 3), odd = pick(GROUPS[g2]); return { say: 'Farklı olanı bul!', visual: '', ...choice(odd, same, x => opt(`<span class="k-big">${x}</span>`, x)) }; },
      // Aynısını bul
      () => { const g = pick(Object.values(GROUPS)); const items = sample(g, 4); return { say: 'Aynısını bul!', visual: `<span class="k-big huge">${items[0]}</span>`, ...choice(items[0], items.slice(1), x => opt(`<span class="k-big">${x}</span>`, x)) }; },
      // Eksik parçayı bul: dizide hangi resim yok
      () => { const items = sample(pick(Object.values(GROUPS)), 4); const shown = items.slice(0, 3); const missing = items[3]; const extra = sample(items.slice(0, 3), 3); return { say: 'Yukarıda olmayan resmi bul!', visual: row(shown), ...choice(missing, extra, x => opt(`<span class="k-big">${x}</span>`, x)) }; },
      // Kaç tane kırmızı
      () => { const n = ri(1, 6); const others = ri(2, 6); const all = shuffle([...Array(n).fill('🔴'), ...Array(others).fill(pick(['🔵', '🟢', '🟡']))]); return { say: 'Kaç tane kırmızı daire var?', visual: row(all, 'k-count'), ...numOpts(n, 1, 9) }; },
    ],
  };
  const CATS = [
    ['matematik', '🔢', 'Matematik'], ['turkce', '🔤', 'Türkçe'], ['hayat', '🌱', 'Hayat Bilgisi'],
    ['ingilizce', '🇬🇧', 'İngilizce'], ['dikkat', '🧠', 'Dikkat'], ['karisik', '🎲', 'Karışık'], ['hafiza', '🃏', 'Hafıza Oyunu'],
  ];
  const SET = 10;
  window.KIDS_CATS = CATS;

  function makeSet(cat) {
    const cats = cat === 'karisik' ? Object.keys(GEN) : [cat];
    const seen = new Set(), list = [];
    for (let tries = 0; list.length < SET && tries < 200; tries++) {
      const area = pick(cats); const q = pick(GEN[area])(); q.area = area;
      const key = q.say + q.visual + q.options.map(o => o.label).join();
      if (seen.has(key)) continue;
      seen.add(key); list.push(q);
    }
    return list;
  }

  // Sesli okuma (okuma bilmeyen çocuklar için)
  function say(text, lang = 'tr-TR') {
    try {
      if (!('speechSynthesis' in window) || !text) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang; u.rate = 0.9; u.pitch = 1.1;
      const v = speechSynthesis.getVoices().find(v => v.lang.replace('_', '-').startsWith(lang.slice(0, 2)));
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch {}
  }

  const base = window.game;
  window.game = function () {
    const g = base();
    Object.assign(g, {
      KIDS_CATS: CATS,
      kids: { cat: '', list: [], i: 0, picked: null, stars: 0, done: false, result: null, sound: true, mem: null, res: {} },

      openKids(cat) {
        const k = this.kids;
        k.cat = cat; k.res = {}; k.i = 0; k.picked = null; k.stars = 0; k.done = false; k.result = null; k.mem = null;
        if (cat === 'hafiza') this.memStart();
        else k.list = makeSet(cat);
        this.screen = 'kids';
        window.scrollTo(0, 0);
        this.$nextTick(() => this.kidsSay());
      },
      kidsBack() { this.kidsMute(); this.screen = 'lobby'; },
      kidsMute() { try { window.speechSynthesis && speechSynthesis.cancel(); } catch {} },
      kidsQ() { return this.kids.list[this.kids.i]; },
      kidsSay() { const q = this.kidsQ(); if (this.kids.sound && q && !this.kids.mem) say(q.say, q.sayLang); },

      kidsPick(j) {
        const k = this.kids, q = this.kidsQ();
        if (!q || k.picked !== null) return;
        k.picked = j;
        const ok = j === q.correct;
        if (ok) k.stars++;
        const a = (k.res[q.area] ||= [0, 0]); a[1]++; if (ok) a[0]++;
        if (k.sound) say(ok ? pick(['Aferin!', 'Harika!', 'Süpersin!', 'Doğru!']) : 'Tekrar dene, bir dahakine!');
        setTimeout(() => this.kidsNext(), ok ? 1100 : 1700);
      },
      kidsNext() {
        const k = this.kids;
        if (k.i + 1 < k.list.length) { k.i++; k.picked = null; this.kidsSay(); return; }
        this.kidsFinish(k.stars);
      },
      async kidsFinish(stars) {
        const k = this.kids;
        k.done = true;
        try {
          const r = await this.api('kids_finish', { stars: Math.min(SET, stars), cat: k.cat, areas: k.mem ? { hafiza: [Math.min(SET, stars), SET] } : k.res });
          k.result = r;
          this.applyProfile(r);
        } catch (e) { k.result = { earned: 0, message: e.message }; }
        if (k.sound) say(stars >= 8 ? 'Muhteşem! Çok başarılısın!' : stars >= 5 ? 'Çok iyi! Devam et!' : 'Güzel! Biraz daha çalışalım!');
      },
      kidsOptClass(j) {
        const k = this.kids, q = this.kidsQ();
        if (k.picked === null) return '';
        if (j === q.correct) return 'ok';
        return j === k.picked ? 'bad' : 'dim';
      },

      // ---- Hafıza: 6 çift kart ----
      memStart() {
        const pool = sample([...new Set(pick(Object.values(GROUPS)).concat(sample(GROUPS.hayvan, 6)))], 6);
        this.kids.mem = { cards: shuffle([...pool, ...pool]).map((e, id) => ({ id, e, open: false, done: false })), first: null, lock: false, moves: 0, pairs: 0 };
        if (this.kids.sound) say('Aynı resimleri bul! Kartlara dokun.');
      },
      memFlip(c) {
        const m = this.kids.mem;
        if (!m || m.lock || c.open || c.done) return;
        c.open = true;
        if (!m.first) { m.first = c; return; }
        m.moves++;
        const a = m.first; m.first = null;
        if (a.e === c.e) {
          a.done = c.done = true; m.pairs++;
          if (m.pairs === 6) {
            // Az hamlede bitiren çok yıldız alır (en iyi 6 hamle)
            const stars = Math.max(3, Math.min(SET, 16 - m.moves));
            setTimeout(() => { this.kids.stars = stars; this.kidsFinish(stars); }, 600);
          }
          return;
        }
        m.lock = true;
        setTimeout(() => { a.open = c.open = false; m.lock = false; }, 900);
      },
      kidsStarsText(n) { return '⭐'.repeat(Math.max(0, n)) + '☆'.repeat(Math.max(0, SET - n)); },
    });
    return g;
  };
})();
