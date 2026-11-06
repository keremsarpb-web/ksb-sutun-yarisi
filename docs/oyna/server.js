// Sütun Yarışı web sürümü: okul sunucusunun (api.php) yaptığını tarayıcıda yapar.
// Kayıtlar bu cihazda (localStorage) tutulur; maçlar bilgisayar oyuncularına karşı oynanır.
window.LocalServer = (() => {
  const ACC_KEY = 'sy_web_accounts_v1';      // hesap listesi (ad, rol, şifre özeti)
  const SAVE_KEY = id => 'sy_web_save:' + id; // her hesabın kaydı ayrı
  const ME = 1; // bu cihazdaki oyuncu; odadaki arkadaşlar 2–5

  // ---- Oyun kuralları (api.php ile aynı) ----
  const QUEUE_WAIT_MS = 5000, COUNTDOWN_MS = 4000, QUESTION_MS = 15000, REVEAL_MS = 3500;
  const QUESTIONS_PER_MATCH = 10, START_LIVES = 3, EXAM_QUESTIONS = 10, EXAM_BOXES_PER_DAY = 3;
  const SHAPE_KEYS = ['round', 'square', 'drop', 'cat', 'bear'];
  const EYE_KEYS = ['normal', 'happy', 'cool', 'sleepy', 'star'];
  const MOUTH_KEYS = ['smile', 'laugh', 'tongue', 'wow', 'cool'];
  const FREE_EMOTES = ['wave', 'thumbs', 'laugh', 'wow'];
  const EMOTE_COOLDOWN_MS = 2500, EMOTE_SHOW_MS = 3500;
  const LOOT = {
    common: [['hat', 'cap'], ['hat', 'sunhat'], ['hat', 'party'], ['hat', 'beanie'], ['aura', 'leaf'], ['aura', 'bubble'], ['emote', 'fire']],
    rare: [['hat', 'grad'], ['hat', 'helmet'], ['hat', 'chef'], ['hat', 'cowboy'], ['aura', 'ice'], ['aura', 'sakura'], ['aura', 'ocean'], ['aura', 'heart'], ['emote', 'nerd'], ['emote', 'trophy'], ['emote', 'slay']],
    epic: [['hat', 'tophat'], ['hat', 'wizard'], ['hat', 'viking'], ['hat', 'slayshades'], ['aura', 'fire'], ['aura', 'electric'], ['aura', 'slay'], ['aura', 'shadow'], ['aura', 'toxic'], ['emote', 'hundred'], ['emote', 'griddy']],
    legendary: [['hat', 'crown'], ['hat', 'halo'], ['aura', 'rainbow'], ['aura', 'gold'], ['aura', 'diamond'], ['aura', 'phoenix'], ['emote', 'party'], ['shape', 'star']],
  };
  const BOXES = {
    classic: { price: 100, odds: [4, 12, 30] },
    gold: { price: 300, odds: [12, 30, 40] },
    cosmic: { price: 800, odds: [35, 45, 20] },
    void: { price: 0, odds: [35, 45, 20] },
  };
  // Özel auralar, binde şans; en değerliden başlanır. Void'in %5'i korunur.
  const SPECIAL_AURAS = [
    ['infinity', 'eternal', { classic: 2, gold: 5, cosmic: 10 }],
    ['supernova', 'divine', { classic: 5, gold: 10, cosmic: 25 }],
    ['celestial', 'divine', { classic: 8, gold: 15, cosmic: 35 }],
    ['void', 'mythic', { classic: 50, gold: 80, cosmic: 150 }],
    ['galaxy', 'mythic', { classic: 30, gold: 50, cosmic: 100 }],
  ];
  const WHEELS = {
    daily: { price: 0, slices: [['coins', 20, 30], ['coins', 50, 24], ['box', 'classic', 14], ['coins', 100, 14], ['coins', 200, 8], ['box', 'gold', 6], ['coins', 500, 3], ['box', 'cosmic', 1]] },
    gold: { price: 150, slices: [['coins', 50, 22], ['coins', 120, 20], ['box', 'classic', 18], ['coins', 300, 14], ['box', 'gold', 13], ['coins', 750, 6], ['box', 'cosmic', 5], ['coins', 1500, 2]] },
  };
  const COIN_CORRECT = 10, COIN_MATCH_ACTIVITY = 15, COIN_FULL_BONUS = 50, COIN_WIN = 100;
  const AURA_RARITY = { leaf: 'common', bubble: 'common', ice: 'rare', sakura: 'rare', ocean: 'rare', heart: 'rare', fire: 'epic', electric: 'epic', slay: 'epic', shadow: 'epic', toxic: 'epic',
    rainbow: 'legendary', gold: 'legendary', diamond: 'legendary', phoenix: 'legendary', void: 'mythic', galaxy: 'mythic', celestial: 'divine', supernova: 'divine', infinity: 'eternal' };
  const AURA_BONUS = { common: 10, rare: 20, epic: 35, legendary: 50, mythic: 100, divine: 150, eternal: 200 };
  const CHAMPIONS = ['arden', 'alptuna'];
  const BOT_NAMES = ['Ece', 'Mert', 'Zeynep', 'Emir', 'Elif', 'Yusuf', 'Defne', 'Kerem', 'Asya', 'Ömer', 'Nehir', 'Eymen', 'Duru', 'Aras', 'Ada', 'Çınar', 'Lina', 'Poyraz', 'Masal', 'Atlas'];
  const ACTIVITY_TYPES = ['mc', 'tf', 'match'];
  const MATCH_SIZE = 4, RECENT_EXAMS = 8;

  // ---- yardımcılar ----
  const now = () => Date.now();
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[ri(0, a.length - 1)];
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = ri(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const norm = s => String(s || '').trim().toLocaleLowerCase('tr').replace(/ı/g, 'i').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').normalize('NFD').replace(/[̀-ͯ]/g, '');
  const coinBonus = aura => AURA_BONUS[AURA_RARITY[aura]] || 0;
  const coinsFor = (base, aura) => Math.round(base * (100 + coinBonus(aura)) / 100);
  class ApiError extends Error { constructor(msg, status = 400) { super(msg); this.status = status; } }
  const fail = (msg, status) => { throw new ApiError(msg, status); };

  // ---- kayıt ----
  // ---- hesaplar: okul sürümündeki gibi; bu cihazda saklanır ----
  let accounts = null, curId = '', S = null;
  const saveAccounts = () => { try { localStorage.setItem(ACC_KEY, JSON.stringify(accounts)); } catch {} };
  function loadAccounts() {
    if (accounts) return accounts;
    try { accounts = JSON.parse(localStorage.getItem(ACC_KEY)) || []; } catch { accounts = []; }
    // İlk sürümün şifresiz tek kaydı bir öğrenci hesabına dönüşür, oturum açık kalır
    try {
      const old = JSON.parse(localStorage.getItem('sy_web_save_v1'));
      if (old?.player && !accounts.length) {
        const id = 'h' + now().toString(36);
        let login = usernameNorm(old.player.name);
        if (!/^[a-z][a-z0-9._]{2,19}$/.test(login)) login = 'oyuncu' + Math.floor(Math.random() * 900 + 100);
        accounts.push({ id, login, role: 'student', cls: '', salt: '', hash: '' });
        old.player.role = 'student'; old.player.username = login;
        localStorage.setItem(SAVE_KEY(id), JSON.stringify(old));
        localStorage.setItem('sy_token', id);
        saveAccounts();
      }
      localStorage.removeItem('sy_web_save_v1');
    } catch {}
    return accounts;
  }
  const account = () => loadAccounts().find(a => a.id === curId) || null;
  function use(token) {
    loadAccounts();
    if (token !== curId) { curId = token || ''; S = null; }
  }
  function load() {
    if (S) return S;
    try { S = curId ? JSON.parse(localStorage.getItem(SAVE_KEY(curId))) : null; } catch { S = null; }
    if (!S) S = { player: null, inv: [], nextId: 1, exams: [], recentQ: [], match: null, queue: null };
    if (S.match?.players.some(p => p.remote)) S.match = null;
    return S;
  }
  function save() { if (account()) try { localStorage.setItem(SAVE_KEY(curId), JSON.stringify(S)); } catch {} }
  const P = () => { const p = account() && load().player; if (!p) fail('Oturum bulunamadı', 401); return p; };

  // "6 a", "6-a " -> "6-A" (api.php class_name ile aynı)
  function className(raw) {
    let n = String(raw || '').trim().replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');
    n = n.replace(/^(\d{1,2})\s*[-\/ ]?\s*(\p{L})$/u, '$1-$2');
    return n.toLocaleUpperCase('tr').slice(0, 16);
  }
  // Ali.Yılmaz -> ali.yilmaz (api.php username_norm ile aynı)
  function usernameNorm(raw) {
    const map = { ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', I: 'i', İ: 'i', ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u', ' ': '.' };
    return String(raw || '').trim().replace(/[çÇğĞıIİöÖşŞüÜ ]/g, c => map[c]).toLowerCase();
  }
  async function hashPass(pass, salt) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + '|' + pass));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  const newSalt = () => [...crypto.getRandomValues(new Uint8Array(12))].map(b => b.toString(16).padStart(2, '0')).join('');
  async function createAccount(login, role, cls, password, look, name, display) {
    const id = 'h' + now().toString(36) + Math.floor(Math.random() * 1000);
    const salt = newSalt();
    accounts.push({ id, login, role, cls, salt, hash: await hashPass(password, salt) });
    saveAccounts();
    curId = id; S = null; load();
    S.player = { id: 1, name: display || name, username: role === 'student' ? login : '', className: cls, role,
      color: COLORS.includes(look.color) ? look.color : COLORS[5],
      shape: SHAPE_KEYS.includes(look.shape) ? look.shape : 'round', eyes: EYE_KEYS.includes(look.eyes) ? look.eyes : 'normal',
      mouth: MOUTH_KEYS.includes(look.mouth) ? look.mouth : 'smile', hat: '', aura: '', wins: 0, games: 0, coins: 0, lastSpin: null, championGift: false };
    addItem('box', ''); // hoş geldin kutusu
    save();
    return { token: id };
  }
  const owns = (type, key) => S.inv.some(i => i.type === type && i.key === key);
  const addItem = (type, key = '') => { S.inv.push({ id: S.nextId++, type, key }); };
  const addCoins = n => { if (n > 0) S.player.coins += n; };

  function publicPlayer(p) {
    return { id: p.id, name: p.name, color: p.color, shape: p.shape, eyes: p.eyes, mouth: p.mouth, hat: p.hat, aura: p.aura,
      wins: p.wins || 0, games: p.games || 0, needs_class: false, role: p.role || 'student' };
  }

  function profile() {
    const p = S.player;
    let champion = false;
    if ((CHAMPIONS.includes(norm(p.name)) || CHAMPIONS.includes(norm(p.username))) && !p.championGift) {
      p.championGift = true; addItem('box', 'void'); champion = true;
    }
    const owned = { hat: [], aura: [], emote: [...FREE_EMOTES], shape: [...SHAPE_KEYS] };
    const boxes = [];
    for (const i of S.inv) {
      if (i.type === 'box') boxes.push({ id: i.id, kind: BOXES[i.key] ? i.key : 'classic' });
      else if (owned[i.type] && !owned[i.type].includes(i.key)) owned[i.type].push(i.key);
    }
    save();
    const player = publicPlayer(p);
    if (p.role === 'student') { player.username = p.username || account()?.login || ''; player.class_name = p.className || ''; }
    return { player, boxes, owned, coins: p.coins, coin_bonus: coinBonus(p.aura), free_spin: p.lastSpin !== today(), champion };
  }

  // ---- kutular ----
  function rollLoot(kind) {
    const box = BOXES[kind] || BOXES.classic;
    if (kind === 'void') {
      const has = owns('aura', 'void');
      return { rarity: 'mythic', type: 'aura', key: 'void', duplicate: has, refund: has ? 500 : 0 };
    }
    for (const [key, rarity, chance] of SPECIAL_AURAS) {
      if (ri(1, 1000) <= chance[kind] && !owns('aura', key)) return { rarity, type: 'aura', key, duplicate: false, refund: 0 };
    }
    const [leg, epic, rare] = box.odds;
    const r = ri(1, 100);
    const rarity = r <= leg ? 'legendary' : r <= leg + epic ? 'epic' : r <= leg + epic + rare ? 'rare' : 'common';
    const pool = LOOT[rarity];
    const fresh = pool.filter(([t, k]) => !owns(t, k));
    const [type, key] = fresh.length ? pick(fresh) : pick(pool);
    return { rarity, type, key, duplicate: !fresh.length, refund: fresh.length ? 0 : { common: 30, rare: 60, epic: 120, legendary: 250 }[rarity] };
  }

  // ---- Sınava Hazırlık ----
  let DATA = null;
  const ready = fetch('data.json').then(r => r.json()).then(d => {
    d.topicMap = {};
    for (const t of d.topics) { if (t.gen) t.gen = window.MATH_GEN[t.id]; d.topicMap[t.id] = t; }
    DATA = d;
  });

  const topicTypes = t => {
    const out = [];
    if (t.mc.length || t.bank.length || t.gen) out.push('mc');
    if (t.tf.length || t.gen) out.push('tf');
    if (t.pairs.length || t.gen) out.push('match');
    return out;
  };

  function recentKeys() {
    const keys = new Set();
    for (const e of S.exams.slice(-RECENT_EXAMS)) for (const it of e.items) for (const k of it.keys) keys.add(k);
    return keys;
  }

  function mcItem(t, text, answer, wrong, exp, key) {
    const w = shuffle([...new Set(wrong.map(String))].filter(x => x !== answer && x !== ''));
    if (w.length < 3) return null;
    const options = shuffle([answer, ...w.slice(0, 3)]);
    return { type: 'mc', subject: t.subject, topic: t.name, text, options, correct: options.indexOf(answer), explanation: exp, keys: [key] };
  }
  const tfItem = (t, text, truth, exp, key) => ({ type: 'tf', subject: t.subject, topic: t.name, text, options: ['Doğru', 'Yanlış'], correct: truth ? 0 : 1, explanation: exp, keys: [key] });
  function matchItem(t, title, pairs) {
    const right = shuffle(pairs.map((_, i) => i));
    return { type: 'match', subject: t.subject, topic: t.name, text: title, left: pairs.map(p => p[0]), right: right.map(i => pairs[i][1]),
      answer: pairs.map((_, i) => right.indexOf(i)), explanation: pairs.map(p => p[0] + ' → ' + p[1]).join(' • '), keys: pairs.map(p => p[2]) };
  }

  function candidates(t, type, recent) {
    const c = [];
    if (type === 'mc') {
      for (const b of DATA.bank) if (t.bank.includes(b[1])) {
        const ans = b[3][b[4]];
        const it = mcItem(t, b[2], ans, b[3].filter((_, i) => i !== b[4]), b[5], 'b:' + b[0]);
        if (it) c.push(it);
      }
      t.mc.forEach((m, i) => { const it = mcItem(t, m[0], m[1][0], m[1].slice(1), m[2], `mc:${t.id}:${i}`); if (it) c.push(it); });
      if (t.gen) for (let i = 0; i < 6; i++) { const g = t.gen(); const it = mcItem(t, g.text, g.answer, g.wrong, g.exp, `g:${t.id}:${g.short}`); if (it) c.push(it); }
    } else if (type === 'tf') {
      t.tf.forEach((s, i) => c.push(tfItem(t, s[0], !!s[1], s[2], `tf:${t.id}:${i}`)));
      if (t.gen) for (let i = 0; i < 4; i++) {
        const g = t.gen(), truth = Math.random() < 0.5;
        c.push(tfItem(t, g.short + ' → ' + (truth ? g.answer : pick(g.wrong.map(String))), truth, g.exp, `gtf:${t.id}:${g.short}`));
      }
    } else {
      t.pairs.forEach((set, si) => {
        const items = shuffle(set.items.map((p, i) => [p[0], p[1], `p:${t.id}:${si}:${i}`]));
        items.sort((a, b) => recent.has(a[2]) - recent.has(b[2]));
        for (let i = 0; i + MATCH_SIZE <= items.length; i += MATCH_SIZE) c.push(matchItem(t, set.title, items.slice(i, i + MATCH_SIZE)));
      });
      if (t.gen) {
        const pairs = [], seen = new Set();
        for (let i = 0; i < 30 && pairs.length < MATCH_SIZE; i++) {
          const g = t.gen();
          if (seen.has(g.answer) || seen.has('s' + g.short)) continue;
          seen.add(g.answer); seen.add('s' + g.short);
          pairs.push([g.short, g.answer, `gm:${t.id}:${g.short}`]);
        }
        if (pairs.length === MATCH_SIZE) c.push(matchItem(t, 'İşlemleri sonuçlarıyla eşleştir.', pairs));
      }
    }
    return c;
  }

  function buildItems(topicIds, types, n) {
    const ids = [...new Set(topicIds)].filter(id => DATA.topicMap[id]);
    types = ACTIVITY_TYPES.filter(x => types.includes(x));
    if (!types.length) types = ACTIVITY_TYPES;
    if (!ids.length) return [];
    const recent = recentKeys(), used = new Set();
    const weights = { mc: 5, tf: 3, match: 2 };
    const order = shuffle([...ids]);
    const cache = {}, items = [];
    for (let slot = 0, tries = 0; items.length < n && tries < n * 6; tries++, slot++) {
      const t = DATA.topicMap[order[slot % order.length]];
      const ok = types.filter(x => topicTypes(t).includes(x));
      if (!ok.length) continue;
      const bag = ok.flatMap(x => Array(weights[x]).fill(x));
      const type = pick(bag);
      const ck = t.id + '|' + type;
      if (!cache[ck] || t.gen) cache[ck] = candidates(t, type, recent);
      const cands = shuffle([...cache[ck]]);
      const it = cands.find(c => !c.keys.some(k => recent.has(k) || used.has(k))) || cands.find(c => !c.keys.some(k => used.has(k)));
      if (!it) continue;
      it.keys.forEach(k => used.add(k));
      items.push(it);
    }
    return shuffle(items);
  }

  const publicItem = it => it.type === 'match'
    ? { type: it.type, subject: it.subject, topic: it.topic, text: it.text, left: it.left, right: it.right }
    : { type: it.type, subject: it.subject, topic: it.topic, text: it.text, options: it.options };
  const itemCorrect = (it, a) => it.type === 'match'
    ? Array.isArray(a) && a.length === it.answer.length && a.every((v, i) => Number(v) === it.answer[i])
    : a !== null && a !== undefined && !Array.isArray(a) && Number(a) === it.correct;

  // ---- Maç: bilgisayar oyuncularına karşı ----
  function makeBot(i) {
    const loot = Math.random() < 0.6;
    return {
      id: -(i + 1), name: '', bot: true, skill: 0.45 + Math.random() * 0.4,
      color: pick(COLORS), shape: pick(SHAPE_KEYS), eyes: pick(EYE_KEYS), mouth: pick(MOUTH_KEYS),
      hat: loot ? pick([...LOOT.common, ...LOOT.rare, ...LOOT.epic].filter(x => x[0] === 'hat'))[1] : '',
      aura: Math.random() < 0.4 ? pick(['leaf', 'ice', 'sakura', 'fire', 'electric', 'rainbow', 'gold', 'ocean']) : '',
      wins: ri(0, 30), games: ri(5, 60),
    };
  }

  function startMatch() {
    const q = S.queue;
    const names = shuffle([...BOT_NAMES]);
    const bots = q.bots.filter(b => b.joinAt <= now()).map((b, i) => Object.assign(makeBot(i), { name: names[i] }));
    const recent = new Set(S.recentQ);
    let pool = shuffle(DATA.questions.filter(x => !recent.has(x[0])));
    if (pool.length < QUESTIONS_PER_MATCH) pool = shuffle([...DATA.questions]);
    const qs = pool.slice(0, QUESTIONS_PER_MATCH);
    S.recentQ = [...S.recentQ, ...qs.map(x => x[0])].slice(-40);
    const me = S.player;
    const mk = p => ({ ...publicPlayer(p), id: p.id, bot: !!p.bot, skill: p.skill || 0, height: 0, lives: START_LIVES, alive: true,
      last_result: '', result_q: -1, answer: null, answerAt: 0, emote: '', emote_at: 0 });
    S.match = { id: now(), qs, q_index: 0, phase: 'countdown', ends: now() + COUNTDOWN_MS, players: [mk(me), ...bots.map(mk)], winner_id: null };
    S.queue = null;
    planBots();
  }

  // Botlar her soruda rastgele bir anda, becerilerine göre doğru ya da yanlış cevap verir
  function planBots() {
    const m = S.match;
    for (const p of m.players) if (p.bot) { p.answer = null; p.answerAt = now() + COUNTDOWN_MS * (m.phase === 'countdown' ? 1 : 0) + ri(2000, 11000); }
  }

  function tick() {
    const m = S.match;
    if (!m || m.phase === 'finished') return;
    const t = now();
    if (m.phase === 'countdown' && t >= m.ends) { m.phase = 'question'; m.ends = t + QUESTION_MS; }
    if (m.phase === 'question') {
      const q = m.qs[m.q_index];
      for (const p of m.players) if (p.bot && p.alive && p.answer === null && t >= p.answerAt) {
        p.answer = Math.random() < p.skill ? q[4] : pick([0, 1, 2, 3].filter(i => i !== q[4]));
      }
      const alive = m.players.filter(p => p.alive);
      if (t >= m.ends || alive.every(p => p.answer !== null)) resolveQuestion();
    } else if (m.phase === 'reveal' && t >= m.ends) {
      const alive = m.players.filter(p => p.alive).length;
      if (m.q_index + 1 >= m.qs.length || alive <= 1) finishMatch();
      else {
        m.q_index++; m.phase = 'question'; m.ends = t + QUESTION_MS;
        for (const p of m.players) { p.answer = null; if (p.bot) p.answerAt = t + ri(2000, 11000); }
      }
    }
  }

  function resolveQuestion() {
    const m = S.match, q = m.qs[m.q_index], qi = m.q_index;
    const alive = m.players.filter(p => p.alive);
    const survivors = alive.filter(p => p.answer === q[4] || p.lives > 1).length;
    for (const p of alive) {
      if (p.answer === q[4]) {
        p.height++; p.last_result = 'correct'; p.result_q = qi;
        if (p.id === ME) addCoins(coinsFor(COIN_CORRECT, S.player.aura));
        else if (p.bot && Math.random() < 0.2) { p.emote = pick(FREE_EMOTES); p.emote_at = now(); }
      } else {
        let lives = p.lives - 1;
        if (lives < 1 && survivors === 0) lives = 1;
        p.height = 0; p.lives = lives; p.alive = lives > 0; p.last_result = p.answer === null ? 'timeout' : 'wrong'; p.result_q = qi;
      }
    }
    m.phase = 'reveal'; m.ends = now() + REVEAL_MS;
  }

  function finishMatch() {
    const m = S.match;
    const ranked = [...m.players].sort((a, b) => (b.alive - a.alive) || (b.height - a.height) || (b.lives - a.lives) || (Math.random() - 0.5));
    const w = ranked[0];
    m.phase = 'finished'; m.winner_id = w.id;
    S.player.games = (S.player.games || 0) + 1;
    if (w.id === S.player.id) { S.player.wins = (S.player.wins || 0) + 1; addItem('box', ''); addCoins(coinsFor(COIN_WIN, S.player.aura)); }
  }

  function matchState(viewer = ME) {
    const m = S.match, q = m.qs[m.q_index], me = m.players.find(p => p.id === ME);
    const showQ = m.phase !== 'countdown';
    const reveal = m.phase === 'reveal' || m.phase === 'finished';
    const durations = { countdown: COUNTDOWN_MS, question: QUESTION_MS, reveal: REVEAL_MS, finished: 1 };
    // Oyuncunun güncel görünüşü maçta da görünsün
    Object.assign(me, { color: S.player.color, shape: S.player.shape, eyes: S.player.eyes, mouth: S.player.mouth, hat: S.player.hat, aura: S.player.aura });
    return {
      id: m.id, phase: m.phase, q_index: m.q_index, total: m.qs.length,
      time_left: Math.max(0, m.ends - now()), duration: durations[m.phase],
      question: showQ ? { category: q[1], text: q[2], options: q[3] } : null,
      correct: reveal ? q[4] : null,
      my_choice: (m.players.find(p => p.id === viewer) || me).answer,
      players: m.players.map(p => ({
        id: swapId(p.id, viewer), name: p.name, color: p.color, shape: p.shape, eyes: p.eyes, mouth: p.mouth, hat: p.hat, aura: p.aura,
        wins: p.wins, games: p.games, needs_class: false, role: 'student',
        height: p.height, lives: p.lives, alive: p.alive, last_result: p.last_result, result_q: p.result_q,
        answered: p.answer !== null, emote: p.emote_at > now() - EMOTE_SHOW_MS ? p.emote : '', emote_at: p.emote_at,
      })),
      winner_id: m.winner_id === null ? null : swapId(m.winner_id, viewer),
    };
  }
  const swapId = (id, viewer) => (id === viewer ? ME : id === ME ? viewer : id);

  // ---- istekler ----
  const actions = {
    // Yeni sınıf kaydet
    async register(b) {
      const name = className(b.name);
      if (name.length < 2) fail('Sınıf adı en az 2 karakter olmalı (ör. 6-A)');
      const password = String(b.password || '');
      if (password.length < 4) fail('Sınıf şifresi en az 4 karakter olmalı');
      if (accounts.some(a => a.login === name || a.login === usernameNorm(name))) fail('Bu sınıf bu cihazda zaten kayıtlı. "Giriş yap" sekmesinden sınıf şifresiyle gir.');
      return createAccount(name, 'class', '', password, b, name);
    },
    // Öğrenci hesabı aç: sınıf bu cihazda kayıtlıysa sınıf şifresi sorulur
    async register_student(b) {
      const cls = className(b.class_name);
      if (cls.length < 2) fail('Sınıfının adını yaz (ör. 6-A)');
      const clsAcc = accounts.find(a => a.role === 'class' && a.login === cls);
      if (clsAcc && clsAcc.hash !== await hashPass(String(b.class_password || ''), clsAcc.salt)) fail('Sınıf şifresi yanlış. Sınıf şifresini öğretmeninden öğrenebilirsin.');
      const display = String(b.display_name || '').replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');
      if (display.length < 2 || display.length > 20 || !/^[\p{L} .\-]+$/u.test(display)) fail('Adın 2–20 harf olmalı (ör. Ali Y.)');
      const login = usernameNorm(b.username);
      if (!/^[a-z][a-z0-9._]{2,19}$/.test(login)) fail('Kullanıcı adı 3–20 karakter olmalı, harfle başlamalı; yalnızca harf, rakam, nokta ve alt çizgi (ör. ali.y)');
      const password = String(b.password || '');
      if (password.length < 4) fail('Şifren en az 4 karakter olmalı');
      if (accounts.some(a => a.login === login)) fail('Bu kullanıcı adı bu cihazda alınmış. Başka bir tane dene (ör. ' + login + '2)');
      return createAccount(login, 'student', cls, password, b, login, display);
    },
    async login(b) {
      const u = usernameNorm(b.name), c = className(b.name);
      const a = accounts.find(x => x.role === 'student' && x.login === u) || accounts.find(x => x.role !== 'student' && x.login === c);
      // Şifresiz eski kayıtlar boş şifreyle açılır
      const ok = a && (a.hash === '' ? String(b.password || '') === '' : a.hash === await hashPass(String(b.password || ''), a.salt));
      if (!ok) { await new Promise(r => setTimeout(r, 600)); fail('Ad veya şifre yanlış'); }
      return { token: a.id };
    },
    me: () => (P(), profile()),
    look(b) {
      const p = P();
      if (COLORS.includes(b.color)) p.color = b.color;
      if (EYE_KEYS.includes(b.eyes)) p.eyes = b.eyes;
      if (MOUTH_KEYS.includes(b.mouth)) p.mouth = b.mouth;
      if (SHAPE_KEYS.includes(b.shape) || owns('shape', b.shape)) p.shape = b.shape;
      if (b.hat === '' || owns('hat', b.hat)) p.hat = b.hat || '';
      if (b.aura === '' || owns('aura', b.aura)) p.aura = b.aura || '';
      return profile();
    },
    open_box(b) {
      P();
      const i = S.inv.findIndex(x => x.id === Number(b.id) && x.type === 'box');
      if (i < 0) fail('Kutu bulunamadı');
      const kind = BOXES[S.inv[i].key] ? S.inv[i].key : 'classic';
      S.inv.splice(i, 1);
      const loot = { ...rollLoot(kind), box: kind };
      if (loot.duplicate) addCoins(loot.refund); else addItem(loot.type, loot.key);
      return { loot, ...profile() };
    },
    buy_box(b) {
      const p = P(), box = BOXES[b.kind];
      if (!box || box.price <= 0) fail('Bu kutu satılmıyor');
      if (p.coins < box.price) fail('Yeterli coin yok');
      p.coins -= box.price; addItem('box', b.kind === 'classic' ? '' : b.kind);
      return profile();
    },
    wheels: () => ({ wheels: Object.fromEntries(Object.entries(WHEELS).map(([k, w]) => [k, { price: w.price, slices: w.slices.map(s => [s[0], s[1]]) }])) }),
    spin(b) {
      const p = P(), w = WHEELS[b.wheel];
      if (!w) fail('Böyle bir çark yok');
      if (!w.price) { if (p.lastSpin === today()) fail('Günlük çarkı bugün çevirdin. Yarın yine gel!'); p.lastSpin = today(); }
      else { if (p.coins < w.price) fail('Yeterli coin yok'); p.coins -= w.price; }
      let r = ri(1, w.slices.reduce((s, x) => s + x[2], 0)), idx = 0;
      for (; idx < w.slices.length; idx++) { r -= w.slices[idx][2]; if (r <= 0) break; }
      const s = w.slices[idx];
      if (s[0] === 'coins') addCoins(s[1]); else addItem('box', s[1] === 'classic' ? '' : s[1]);
      return { slice: idx, prize: [s[0], s[1]], ...profile() };
    },
    // Bu cihazdaki hesapların sıralaması
    leaderboard: () => {
      const all = loadAccounts().map(a => { try { return JSON.parse(localStorage.getItem(SAVE_KEY(a.id)))?.player; } catch { return null; } }).filter(p => p && p.games);
      const rank = list => list.sort((x, y) => (y.wins - x.wins) || (x.games - y.games)).slice(0, 10);
      return { players: rank(all.filter(p => p.role === 'class')).map(publicPlayer),
        students: rank(all.filter(p => p.role !== 'class')).map(p => ({ ...publicPlayer(p), class_name: p.className || '' })) };
    },
    queue_join() {
      P();
      if (S.match && S.match.phase !== 'finished') fail('Zaten bir maçtasın');
      S.match = null;
      const n = ri(1, 4), t = now();
      S.queue = { joined: t, bots: Array.from({ length: n }, (_, i) => ({ joinAt: t + 800 + i * ri(600, 1800) })) };
      save();
      return { ok: true };
    },
    queue_leave: () => { if (S) { S.queue = null; save(); } return { ok: true }; },
    poll() {
      P();
      if (S.match) { tick(); save(); return { mode: 'match', match: matchState() }; }
      if (!S.queue) return { mode: 'idle' };
      const t = now(), joined = S.queue.bots.filter(b => b.joinAt <= t);
      const count = 1 + joined.length;
      const startAt = joined.length ? joined[0].joinAt + QUEUE_WAIT_MS : null;
      if (count >= 5 || (startAt && t >= startAt)) { startMatch(); save(); return { mode: 'match', match: matchState() }; }
      return { mode: 'queue', count, max: 5, min: 2, start_in: startAt ? Math.max(0, startAt - t) : null };
    },
    answer(b) {
      P();
      const m = S.match;
      if (!m) fail('Maçta değilsin');
      tick();
      if (m.phase !== 'question') fail('Şu an cevap verilemez');
      const me = m.players.find(p => p.id === ME);
      if (!me.alive) fail('Elendin, izlemeye devam edebilirsin');
      const c = Number(b.choice);
      if (!(c >= 0 && c <= 3)) fail('Geçersiz seçenek');
      if (me.answer === null) me.answer = c;
      tick(); save();
      return { ok: true };
    },
    emote(b) {
      P();
      const m = S.match;
      if (!m) fail('Maçta değilsin');
      if (!FREE_EMOTES.includes(b.key) && !owns('emote', b.key)) fail('Bu emote sende yok');
      const me = m.players.find(p => p.id === ME);
      if (me.emote_at >= now() - EMOTE_COOLDOWN_MS) return { ok: false };
      me.emote = b.key; me.emote_at = now(); save();
      return { ok: true };
    },
    leave_match() {
      P();
      const m = S.match;
      if (m && m.phase !== 'finished') { const me = m.players.find(p => p.id === ME); me.lives = 0; me.alive = false; S.player.games++; }
      S.match = null; save();
      return { ok: true };
    },
    exam_catalog: () => {
      const subjects = [];
      for (const t of DATA.topics) {
        let s = subjects.find(x => x.subject === t.subject);
        if (!s) subjects.push(s = { subject: t.subject, topics: [] });
        s.topics.push({ id: t.id, name: t.name, types: topicTypes(t), generated: !!t.gen });
      }
      return { catalog: subjects };
    },
    exam_start(b) {
      P();
      let topics = Array.isArray(b.topics) ? b.topics.filter(x => typeof x === 'string') : [];
      const types = Array.isArray(b.types) ? b.types : ACTIVITY_TYPES;
      if (!topics.length) topics = DATA.topics.filter(t => b.subject === 'Karma' || t.subject === b.subject).map(t => t.id);
      topics = topics.filter(id => DATA.topicMap[id]);
      if (!topics.length) fail('En az bir konu seç');
      const subs = [...new Set(topics.map(id => DATA.topicMap[id].subject))];
      const label = topics.length === 1 ? DATA.topicMap[topics[0]].name : subs.length > 1 ? 'Karma' : subs[0];
      const items = buildItems(topics, types, EXAM_QUESTIONS);
      if (!items.length) fail('Bu seçimde soru bulunamadı');
      const exam = { id: now(), label, items, answers: {}, finished: false, score: 0, coins: 0, rewarded: false, day: today() };
      S.exams.push(exam);
      S.exams = S.exams.slice(-30);
      save();
      return { exam_id: exam.id, subject: label, questions: items.map(publicItem), coin_bonus: coinBonus(S.player.aura) };
    },
    exam_answer(b) {
      P();
      const e = S.exams.find(x => x.id === Number(b.exam_id));
      if (!e || e.finished) fail('Sınav bulunamadı');
      const it = e.items[Number(b.index)];
      if (!it) fail('Geçersiz cevap');
      let choice = b.choice;
      if (it.type === 'match') {
        if (!Array.isArray(choice) || choice.length !== it.left.length) fail('Bütün eşleştirmeleri yap');
        choice = choice.map(Number);
      } else {
        choice = Number(choice);
        if (!(choice >= 0 && choice < it.options.length)) fail('Geçersiz cevap');
      }
      if (!(b.index in e.answers)) e.answers[b.index] = choice;
      const ok = itemCorrect(it, e.answers[b.index]);
      save();
      return { choice: e.answers[b.index], correct: it.type === 'match' ? it.answer : it.correct, is_correct: ok, explanation: it.explanation,
        coins: ok ? coinsFor(it.type === 'match' ? COIN_MATCH_ACTIVITY : COIN_CORRECT, S.player.aura) : 0 };
    },
    exam_finish(b) {
      P();
      const e = S.exams.find(x => x.id === Number(b.exam_id));
      if (!e) fail('Sınav bulunamadı');
      const full = n => n === e.items.length && e.items.length >= EXAM_QUESTIONS;
      if (!e.finished) {
        let score = 0, coins = 0;
        e.items.forEach((it, i) => { if (i in e.answers && itemCorrect(it, e.answers[i])) { score++; coins += coinsFor(it.type === 'match' ? COIN_MATCH_ACTIVITY : COIN_CORRECT, S.player.aura); } });
        if (full(score)) coins += coinsFor(COIN_FULL_BONUS, S.player.aura);
        e.finished = true; e.score = score; e.coins = coins; addCoins(coins);
        if (full(score) && S.exams.filter(x => x.rewarded && x.day === today()).length < EXAM_BOXES_PER_DAY) { e.rewarded = true; addItem('box', ''); }
      }
      const todayBoxes = S.exams.filter(x => x.rewarded && x.day === today()).length;
      save();
      return { score: e.score, total: e.items.length, rewarded: e.rewarded, earned: e.coins,
        limit_reached: !e.rewarded && full(e.score), short: e.items.length < EXAM_QUESTIONS,
        boxes_left_today: Math.max(0, EXAM_BOXES_PER_DAY - todayBoxes), ...profile() };
    },
  };

  // ---- Oda (online): bu cihaz oda sahibiyse maçı yönetir ----
  const room = {
    start(guests) {
      load(); P();
      const recent = new Set(S.recentQ);
      let pool = shuffle(DATA.questions.filter(x => !recent.has(x[0])));
      if (pool.length < QUESTIONS_PER_MATCH) pool = shuffle([...DATA.questions]);
      const qs = pool.slice(0, QUESTIONS_PER_MATCH);
      S.recentQ = [...S.recentQ, ...qs.map(x => x[0])].slice(-40);
      const mk = (p, extra) => ({ id: p.id, name: p.name, color: p.color, shape: p.shape, eyes: p.eyes, mouth: p.mouth, hat: p.hat, aura: p.aura,
        wins: p.wins || 0, games: p.games || 0, bot: false, skill: 0, height: 0, lives: START_LIVES, alive: true,
        last_result: '', result_q: -1, answer: null, answerAt: 0, emote: '', emote_at: 0, ...extra });
      S.queue = null;
      S.match = { id: now(), qs, q_index: 0, phase: 'countdown', ends: now() + COUNTDOWN_MS, room: true, winner_id: null,
        players: [mk(S.player), ...guests.map((g, i) => mk({ ...g, id: i + 2 }, { remote: true, peer: g.peer }))] };
      save();
      return S.match.players.filter(p => p.remote).map(p => ({ id: p.id, peer: p.peer }));
    },
    // Konuğun cevabı ve emote'u
    answer(id, choice) {
      const m = S.match; if (!m) return;
      tick();
      const p = m.players.find(x => x.id === id);
      if (m.phase === 'question' && p && p.alive && p.answer === null && choice >= 0 && choice <= 3) p.answer = choice;
      tick(); save();
    },
    emote(id, key) {
      const p = S.match?.players.find(x => x.id === id);
      if (p && typeof key === 'string' && key.length < 16 && p.emote_at < now() - EMOTE_COOLDOWN_MS) { p.emote = key; p.emote_at = now(); save(); }
    },
    leave(id) {
      const m = S.match, p = m?.players.find(x => x.id === id);
      if (p && m.phase !== 'finished') { p.lives = 0; p.alive = false; tick(); save(); }
    },
    state(id) { if (!S.match) return null; tick(); save(); return JSON.parse(JSON.stringify(matchState(id))); },
    active: () => !!S?.match?.room && S.match.phase !== 'finished',
    // Konuk tarafı: oda sahibinin yönettiği maçtan kendi ödüllerini bu cihaza yazar
    reward(kind) {
      load(); P();
      if (kind === 'correct') addCoins(coinsFor(COIN_CORRECT, S.player.aura));
      else if (kind === 'played') S.player.games++;
      else if (kind === 'win') { S.player.wins++; addItem('box', ''); addCoins(coinsFor(COIN_WIN, S.player.aura)); }
      save();
    },
    profile: () => (load(), S.player ? { ...publicPlayer(S.player) } : null),
  };

  async function handle(action, body = {}) {
    await ready;
    use(body.token);
    load();
    const fn = actions[action];
    if (!fn) fail('Bu özellik okul sürümünde var. Okulunda kurmak için oyunun sitesine bak.');
    return JSON.parse(JSON.stringify(await fn(body || {})));
  }

  return { handle, hasAccount: id => loadAccounts().some(a => a.id === id), accountCount: () => loadAccounts().length, ApiError, room, ready };
})();
