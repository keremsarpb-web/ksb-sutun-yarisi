const COLORS = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#38d9a9', '#4dabf7', '#748ffc', '#da77f2', '#f783ac', '#8d6e63'];
const SHAPES = { round: 'Yuvarlak', square: 'Kutu', drop: 'Damla', cat: 'Kedi', bear: 'Ayıcık', star: '⭐ Slay Yıldız' };
const EYES = { normal: 'Normal', happy: 'Mutlu', cool: 'Gözlüklü', sleepy: 'Uykulu', star: 'Yıldız' };
const MOUTHS = { smile: 'Gülümseme', laugh: 'Kahkaha', tongue: 'Dil', wow: 'Şaşkın', cool: 'Havalı' };
const HATS = {
  cap: { e: '🧢', n: 'Kep', r: 'common' },
  sunhat: { e: '👒', n: 'Hasır Şapka', r: 'common' },
  grad: { e: '🎓', n: 'Mezuniyet Kepi', r: 'rare' },
  helmet: { e: '⛑️', n: 'Kask', r: 'rare' },
  tophat: { e: '🎩', n: 'Silindir Şapka', r: 'epic' },
  crown: { e: '👑', n: 'Altın Taç', r: 'legendary' },
  party: { e: '🥳', n: 'Parti Şapkası', r: 'common' },
  beanie: { e: '🧶', n: 'Bere', r: 'common' },
  chef: { e: '👨‍🍳', n: 'Aşçı Şapkası', r: 'rare' },
  cowboy: { e: '🤠', n: 'Kovboy Şapkası', r: 'rare' },
  wizard: { e: '🧙', n: 'Büyücü Şapkası', r: 'epic' },
  viking: { e: '🪓', n: 'Viking Kaskı', r: 'epic' },
  halo: { e: '😇', n: 'Hale', r: 'legendary' },
  slayshades: { e: '🕶️', n: 'Slay Gözlüğü', r: 'epic' },
};
// Değere göre sıralı. Void'den değerliler: Göksel, Süpernova (İlahi) ve Sonsuzluk (Sonsuz).
const AURAS = {
  leaf: { n: 'Yaprak Aurası', r: 'common' },
  bubble: { n: 'Köpük Aurası', r: 'common' },
  ice: { n: 'Buz Aurası', r: 'rare' },
  sakura: { n: 'Sakura Aurası', r: 'rare' },
  ocean: { n: 'Okyanus Aurası', r: 'rare' },
  heart: { n: 'Kalp Aurası', r: 'rare' },
  fire: { n: 'Ateş Aurası', r: 'epic' },
  electric: { n: 'Elektrik Aurası', r: 'epic' },
  slay: { n: 'Slay Aurası', r: 'epic' },
  shadow: { n: 'Gölge Aurası', r: 'epic' },
  toxic: { n: 'Zehir Aurası', r: 'epic' },
  rainbow: { n: 'Gökkuşağı Aurası', r: 'legendary' },
  gold: { n: 'Altın Aura', r: 'legendary' },
  diamond: { n: 'Elmas Aurası', r: 'legendary' },
  phoenix: { n: 'Anka Aurası', r: 'legendary' },
  void: { n: 'Void Aura', r: 'mythic', e: '◉' },
  galaxy: { n: 'Galaksi Aurası', r: 'mythic', e: '🌌' },
  celestial: { n: 'Göksel Aura', r: 'divine', e: '✴' },
  supernova: { n: 'Süpernova Aurası', r: 'divine', e: '💥' },
  infinity: { n: 'Sonsuzluk Aurası', r: 'eternal', e: '∞' },
};
// İlk dördü herkese açık, diğerleri Mystery Box'tan çıkar
const EMOTES = {
  wave: { e: '👋', n: 'Selam' },
  thumbs: { e: '👍', n: 'Süper' },
  laugh: { e: '😂', n: 'Kahkaha' },
  wow: { e: '😮', n: 'Vay' },
  fire: { e: '🔥', n: 'Ateş', r: 'common' },
  nerd: { e: '🤓', n: 'İnek', r: 'rare' },
  trophy: { e: '🏆', n: 'Kupa', r: 'rare' },
  hundred: { e: '💯', n: 'Yüzde Yüz', r: 'epic' },
  party: { e: '🎉', n: 'Kutlama', r: 'legendary' },
  slay: { e: '💅', n: 'Slay', r: 'rare' },
  griddy: { e: '🕺', n: 'Griddy Dansı', r: 'epic', dance: true },
};
// Aura değerine göre coin bonusu (sunucudaki AURA_BONUS ile aynı)
const AURA_BONUS = { common: 10, rare: 20, epic: 35, legendary: 50, mythic: 100, divine: 150, eternal: 200 };
const BOX_KINDS = {
  classic: { n: 'Klasik Kutu', price: 100, d: 'Void %5 · İlahi/Sonsuz %1,5' },
  gold: { n: 'Altın Kutu', price: 300, d: 'Destansı+ %42 · Void %8 · İlahi/Sonsuz %3' },
  void: { n: 'Void Kutusu', price: 0, d: 'Void Aura garanti' },
  cosmic: { n: 'Kozmik Kutu', price: 800, d: 'Destansı+ %80 · Void %15 · İlahi/Sonsuz %7' },
};
const WHEEL_INFO = {
  daily: { n: 'Günlük Çark', d: 'Günde 1 kez ücretsiz' },
  gold: { n: 'Altın Çark', d: '150 coin · büyük ödüller' },
};
const TYPE_NAMES = { mc: 'Test', tf: 'Doğru-Yanlış', match: 'Eşleştirme' };
const RARITY = { common: 'Sıradan', rare: 'Nadir', epic: 'Destansı', legendary: 'Efsanevi', mythic: 'Mitik', divine: 'İlahi', eternal: 'Sonsuz' };

function lootInfo(l) {
  if (l.type === 'shape') return { name: (SHAPES[l.key] || l.key).replace('⭐ ', ''), icon: '⭐', kind: 'Gövde' };
  const map = { hat: HATS, aura: AURAS, emote: EMOTES }[l.type] || {};
  const it = map[l.key] || {};
  return { name: it.n || l.key, icon: it.e || '✦', kind: { hat: 'Şapka', aura: 'Aura', emote: 'Emote' }[l.type] };
}

// ---------- Güncelleme kontrolü ----------
// Sunucudaki sürüm açık sayfanınkinden farklıysa üstte "Şimdi güncelle" çubuğu çıkar.
document.addEventListener('alpine:init', () => {
  Alpine.store('update', { ready: false, version: '' });
});

function checkUpdate() {
  fetch('version.php', { cache: 'no-store' })
    .then(r => r.json())
    .then(j => {
      const current = document.documentElement.dataset.version;
      if (!j.version || j.version === current || !window.Alpine) return;
      const s = Alpine.store('update');
      s.version = j.version;
      s.ready = true;
      navigator.serviceWorker?.getRegistration().then(reg => reg?.update()).catch(() => {});
    })
    .catch(() => {});
}
setInterval(checkUpdate, 60000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkUpdate(); });

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ---------- Karakter çizimi (SVG) ----------

let charSeq = 0;
const INK = '#1b1b2f';

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const ch = s => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f)));
  return '#' + [16, 8, 0].map(s => ch(s).toString(16).padStart(2, '0')).join('');
}

const BODY = {
  round: '<ellipse cx="50" cy="60" rx="36" ry="35"/>',
  square: '<rect x="15" y="25" width="70" height="70" rx="20"/>',
  drop: '<path d="M50 16 C66 36 86 46 86 66 A36 30 0 0 1 14 66 C14 46 34 36 50 16Z"/>',
  cat: '<ellipse cx="50" cy="61" rx="36" ry="34"/>',
  bear: '<ellipse cx="50" cy="61" rx="36" ry="34"/>',
};

function ears(shape, c, dark) {
  if (shape === 'cat') {
    return `<path d="M20 44 L24 12 L46 30Z M80 44 L76 12 L54 30Z" fill="${c}" stroke="${dark}" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M25 36 L27 20 L38 30Z M75 36 L73 20 L62 30Z" fill="#ffb3c6"/>`;
  }
  if (shape === 'bear') {
    return `<circle cx="24" cy="32" r="12" fill="${c}" stroke="${dark}" stroke-width="3"/><circle cx="76" cy="32" r="12" fill="${c}" stroke="${dark}" stroke-width="3"/>` +
      `<circle cx="24" cy="32" r="6" fill="#ffffff" opacity=".35"/><circle cx="76" cy="32" r="6" fill="#ffffff" opacity=".35"/>`;
  }
  return '';
}

function eyesSvg(kind) {
  const eye = x => ({
    normal: `<circle cx="${x}" cy="54" r="8.5" fill="#fff"/><circle cx="${x + 1}" cy="55" r="5" fill="${INK}"/><circle cx="${x + 2.6}" cy="52.6" r="1.8" fill="#fff"/>`,
    happy: `<path d="M${x - 7} 57 Q${x} 47 ${x + 7} 57" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"/>`,
    sleepy: `<path d="M${x - 8} 54 A8 8 0 0 0 ${x + 8} 54Z" fill="#fff"/><circle cx="${x}" cy="57" r="3.6" fill="${INK}"/><path d="M${x - 9} 54 H${x + 9}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
    star: `<path d="M${x} 45 L${x + 2.6} 51.4 L${x + 9} 54 L${x + 2.6} 56.6 L${x} 63 L${x - 2.6} 56.6 L${x - 9} 54 L${x - 2.6} 51.4Z" fill="${INK}"/><circle cx="${x + 2}" cy="52" r="1.4" fill="#fff"/>`,
  }[kind]);
  if (kind === 'cool') {
    return `<g><rect x="26" y="47" width="21" height="13" rx="5" fill="${INK}"/><rect x="53" y="47" width="21" height="13" rx="5" fill="${INK}"/>` +
      `<path d="M47 51 H53" stroke="${INK}" stroke-width="3"/><path d="M30 51 L36 51 M57 51 L63 51" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/></g>`;
  }
  return `<g class="blink">${eye(38)}${eye(62)}</g>`;
}

function mouthSvg(kind) {
  return {
    smile: `<path d="M42 69 Q50 77 58 69" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>`,
    laugh: `<path d="M40 67 Q50 84 60 67Z" fill="#5c1a2b" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/><ellipse cx="50" cy="75" rx="5" ry="3" fill="#ff8fab"/>`,
    tongue: `<path d="M42 69 Q50 76 58 69" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/><path d="M47 72 Q50 81 53 72Z" fill="#ff6b8b"/>`,
    wow: `<ellipse cx="50" cy="72" rx="4.5" ry="5.5" fill="#5c1a2b" stroke="${INK}" stroke-width="2.4"/>`,
    cool: `<path d="M42 72 Q51 76 59 67" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>`,
  }[kind];
}

function charSvg(p) {
  const id = 'cb' + (++charSeq);
  const c = COLORS.includes(p.color) ? p.color : COLORS[5];
  const dark = shade(c, 0.62);
  const shape = BODY[p.shape] ? p.shape : 'round';
  const eyes = EYES[p.eyes] ? p.eyes : 'normal';
  const mouth = MOUTHS[p.mouth] ? p.mouth : 'smile';
  const body = BODY[shape];
  return `<svg class="csvg" viewBox="0 0 100 110" aria-hidden="true">` +
    `<defs><clipPath id="${id}">${body}</clipPath></defs>` +
    `<ellipse cx="50" cy="104" rx="30" ry="4" fill="#000" opacity=".12"/>` +
    `<ellipse cx="36" cy="98" rx="11" ry="6.5" fill="${dark}"/><ellipse cx="64" cy="98" rx="11" ry="6.5" fill="${dark}"/>` +
    `<g class="arms"><ellipse cx="14" cy="68" rx="7" ry="11" fill="${c}" stroke="${dark}" stroke-width="3" transform="rotate(20 14 68)"/>` +
    `<ellipse cx="86" cy="68" rx="7" ry="11" fill="${c}" stroke="${dark}" stroke-width="3" transform="rotate(-20 86 68)"/></g>` +
    ears(shape, c, dark) +
    `<g fill="${c}" stroke="${dark}" stroke-width="3">${body}</g>` +
    `<g clip-path="url(#${id})"><ellipse cx="74" cy="98" rx="46" ry="30" fill="#000" opacity=".13"/>` +
    `<ellipse cx="50" cy="82" rx="20" ry="13" fill="#fff" opacity=".22"/><ellipse cx="32" cy="38" rx="12" ry="7" fill="#fff" opacity=".4" transform="rotate(-25 32 38)"/></g>` +
    `<circle cx="27" cy="66" r="5.5" fill="#ff8fab" opacity=".55"/><circle cx="73" cy="66" r="5.5" fill="#ff8fab" opacity=".55"/>` +
    eyesSvg(eyes) + mouthSvg(mouth) +
    `</svg>`;
}

function game() {
  return {
    COLORS, SHAPES, EYES, MOUTHS, HATS, AURAS, EMOTES, RARITY, lootInfo, BOX_KINDS, WHEEL_INFO, TYPE_NAMES, AURA_BONUS,
    token: (() => { try { return localStorage.getItem('sy_token') || ''; } catch { return ''; } })(),
    screen: 'loading', err: '',
    form: { name: '', class_name: '', class_password: '', display_name: '', username: '', password: '', password2: '', color: COLORS[5], shape: 'round', eyes: 'normal', mouth: 'smile', hat: '', aura: '' },
    compact: false,
    notice: '',
    admin: { list: [], q: '', amount: 500, busy: false, loaded: false, msg: '' },
    me: null, boxes: [], owned: { hat: [], aura: [], emote: [], shape: [] }, board: [], boardStudents: [], boardTab: 'class',
    coins: 0, coinBonus: 0, freeSpin: false,
    queue: { count: 0, max: 5, start_in: null },
    m: null, shown: {}, anim: {}, revealKey: '', finishedId: null,
    localEnd: 0, now: Date.now(), opening: null, loot: null, busy: false,

    async api(action, body = {}) {
      const r = await fetch('api.php?action=' + action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, token: this.token }),
      });
      const j = await r.json().catch(() => ({ error: 'Sunucu yanıt vermedi' }));
      if (!r.ok) { const e = new Error(j.error || 'Hata'); e.status = r.status; throw e; }
      return j;
    },

    installEvt: null,

    async install() {
      if (!this.installEvt) return;
      this.installEvt.prompt();
      await this.installEvt.userChoice.catch(() => {});
      this.installEvt = null;
    },

    async init() {
      if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
      window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); this.installEvt = e; });
      window.addEventListener('appinstalled', () => { this.installEvt = null; });
      setInterval(() => { this.now = Date.now(); }, 200);
      const mq = matchMedia('(max-width: 600px)');
      this.compact = mq.matches;
      mq.addEventListener('change', e => { this.compact = e.matches; });
      setInterval(() => { if (this.screen === 'queue' || this.screen === 'match') this.poll(); }, 900);
      if (!this.token) { this.screen = 'create'; return; }
      try {
        await this.loadMe();
        this.screen = 'lobby';
        await this.poll();
      } catch (e) {
        if (e.status === 401) { this.setToken(''); this.screen = 'create'; this.authTab = 'login'; } else { this.err = e.message; this.screen = 'lobby'; }
      }
    },

    setToken(t) {
      this.token = t;
      try { t ? localStorage.setItem('sy_token', t) : localStorage.removeItem('sy_token'); } catch {}
    },

    applyProfile(r) {
      this.me = r.player; this.boxes = r.boxes; this.owned = r.owned;
      this.coins = r.coins ?? 0; this.coinBonus = r.coin_bonus ?? 0; this.freeSpin = !!r.free_spin;
      if (r.champion) this.champion = true;
    },

    champion: false,

    openChampionBox() {
      this.champion = false;
      const b = this.boxes.find(x => x.kind === 'void');
      if (b) { this.screen = 'lobby'; this.$nextTick(() => document.querySelector('.boxes')?.scrollIntoView({ block: 'center' })); this.openBox(b.id); }
    },

    async loadMe() {
      this.applyProfile(await this.api('me'));
      this.api('leaderboard').then(r => { this.board = r.players; this.boardStudents = r.students || []; if (this.me?.role === 'student') this.boardTab = 'student'; }).catch(() => {});
    },

    authTab: 'login',
    loginForm: { name: '', password: '' },

    async register() {
      if (this.form.password !== this.form.password2) { this.err = 'Şifreler aynı değil'; return; }
      try {
        const r = await this.api('register', this.form);
        this.form.password = this.form.password2 = '';
        this.setToken(r.token);
        await this.loadMe();
        this.err = '';
        this.screen = 'lobby';
      } catch (e) { this.err = e.message; }
    },

    async registerStudent() {
      const f = this.form;
      if (f.password !== f.password2) { this.err = 'Şifreler aynı değil'; return; }
      try {
        const r = await this.api('register_student', {
          class_name: f.class_name, class_password: f.class_password, display_name: f.display_name, username: f.username,
          password: f.password, color: f.color, shape: f.shape, eyes: f.eyes, mouth: f.mouth,
        });
        f.password = f.password2 = f.class_password = '';
        this.setToken(r.token);
        await this.loadMe();
        this.err = '';
        this.screen = 'lobby';
      } catch (e) { this.err = e.message; }
    },

    async login() {
      try {
        const r = await this.api('login', this.loginForm);
        this.loginForm.password = '';
        this.setToken(r.token);
        await this.loadMe();
        this.err = '';
        this.screen = 'lobby';
        this.poll();
      } catch (e) { this.err = e.message; }
    },

    // ---------- Öğretmen paneli ----------
    teacher: { classes: [], students: [], classFilter: '', subjects: [], loading: false, msg: '', resetFor: null, newPass: '', deleteFor: null, seasonAsk: false },

    filteredStudents() {
      const f = this.teacher.classFilter;
      if (!f) return this.teacher.students;
      return this.teacher.students.filter(s => (f === 'none' ? s.class_id === null : String(s.class_id) === f));
    },
    teacherPass: { password: '', password2: '' },

    isTeacher() { return this.me?.role === 'teacher'; },

    async openTeacher() {
      this.screen = 'teacher';
      window.scrollTo(0, 0);
      await this.loadTeacher();
    },

    async loadTeacher() {
      const t = this.teacher;
      t.loading = true;
      try {
        const r = await this.api('teacher_overview');
        t.classes = r.classes;
        t.students = r.students || [];
        t.subjects = r.subjects;
      } catch (e) { this.err = e.message; }
      t.loading = false;
    },

    async teacherAct(action, body, after) {
      try {
        const r = await this.api(action, body);
        this.teacher.msg = r.message || 'Tamam';
        if (after) after();
        await this.loadTeacher();
      } catch (e) { this.err = e.message; }
    },

    tResetPass(c) {
      const t = this.teacher;
      this.teacherAct('teacher_reset_password', { class_id: c.id, password: t.newPass }, () => { t.resetFor = null; t.newPass = ''; });
    },
    tGiveBox(c) { this.teacherAct('teacher_give_box', { class_id: c.id, count: 1 }); },
    tDelete(c) { this.teacherAct('teacher_delete_class', { class_id: c.id }, () => { this.teacher.deleteFor = null; }); },
    tSeason() { this.teacherAct('teacher_reset_season', {}, () => { this.teacher.seasonAsk = false; this.loadMe(); }); },

    async setTeacherPassword() {
      const f = this.teacherPass;
      if (f.password !== f.password2) { this.err = 'Şifreler aynı değil'; return; }
      try {
        this.applyProfile(await this.api('set_password', { password: f.password }));
        f.password = f.password2 = '';
        this.err = '';
      } catch (e) { this.err = e.message; }
    },

    pct(s) { return s.answered ? Math.round((s.correct / s.answered) * 100) : 0; },

    // ---------- Kura (adil: her isim eşit şansa sahip) ----------
    draw: {
      names: (() => { try { return localStorage.getItem('sy_kura_names') || ''; } catch { return ''; } })(),
      count: 1, removeDrawn: true, spinning: false, shown: '', winners: [], history: [],
    },

    drawList() {
      const seen = new Set();
      return this.draw.names.split(/\r?\n/).map(s => s.trim()).filter(s => s && !seen.has(s.toLocaleLowerCase('tr')) && seen.add(s.toLocaleLowerCase('tr')));
    },

    // Kripto rastgelelik + reddetme örneklemesi: hiçbir sıra numarasına kayma olmaz
    fairIndex(n) {
      const limit = Math.floor(0x100000000 / n) * n;
      const buf = new Uint32Array(1);
      do { crypto.getRandomValues(buf); } while (buf[0] >= limit);
      return buf[0] % n;
    },

    saveDrawNames() {
      try { localStorage.setItem('sy_kura_names', this.draw.names); } catch {}
    },

    async runDraw() {
      const d = this.draw;
      const list = this.drawList();
      if (d.spinning || !list.length) return;
      const count = Math.max(1, Math.min(list.length, Math.floor(d.count) || 1));
      d.spinning = true;
      d.winners = [];
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      for (let t = 0, delay = 60; !reduce && t < 22; t++, delay += 6) {
        d.shown = list[this.fairIndex(list.length)];
        await new Promise(r => setTimeout(r, delay));
      }
      const pool = [...list];
      for (let i = 0; i < count; i++) {
        const j = i + this.fairIndex(pool.length - i);
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      d.winners = pool.slice(0, count);
      d.shown = d.winners[0];
      d.history.unshift({ time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), names: d.winners, total: list.length });
      if (d.removeDrawn) {
        const out = new Set(d.winners);
        d.names = list.filter(n => !out.has(n)).join('\n');
        this.saveDrawNames();
      }
      d.spinning = false;
    },

    claimForm: { name: '', password: '', password2: '' },

    async claimClass() {
      const f = this.claimForm;
      if (f.password !== f.password2) { this.err = 'Şifreler aynı değil'; return; }
      try {
        this.applyProfile(await this.api('claim_class', f));
        f.password = f.password2 = '';
        this.err = '';
      } catch (e) { this.err = e.message; }
    },

    async logout() {
      await this.api('queue_leave').catch(() => {});
      this.setToken('');
      this.me = null; this.m = null; this.exam = null; this.boxes = []; this.owned = { hat: [], aura: [], emote: [], shape: [] }; this.coins = 0;
      this.authTab = 'login';
      this.screen = 'create';
    },

    async saveLook(patch) {
      const look = { color: this.me.color, shape: this.me.shape, eyes: this.me.eyes, mouth: this.me.mouth, hat: this.me.hat, aura: this.me.aura, ...patch };
      Object.assign(this.me, look);
      try { this.applyProfile(await this.api('look', look)); } catch (e) { this.err = e.message; }
    },

    async openBox(id) {
      this.opening = id; this.loot = null;
      await new Promise(r => setTimeout(r, 1100));
      try {
        const r = await this.api('open_box', { id });
        this.applyProfile(r);
        this.loot = r.loot;
      } catch (e) { this.err = e.message; }
      this.opening = null;
    },

    // ---------- Admin paneli ----------
    async adminLoad() {
      const a = this.admin;
      a.busy = true;
      try { a.list = (await this.api('admin_list')).players; a.loaded = true; } catch (e) { a.msg = e.message; }
      a.busy = false;
    },

    adminFiltered() {
      const q = this.admin.q.trim().toLocaleLowerCase('tr');
      const list = q ? this.admin.list.filter(u => [u.name, u.username, u.class_name].join(' ').toLocaleLowerCase('tr').includes(q)) : this.admin.list;
      return list.slice(0, 100);
    },

    // target: oyuncu kimliği, 'self' ya da 'all'
    async adminGive(target) {
      const a = this.admin, amount = Math.floor(Number(a.amount) || 0);
      if (amount < 1 || amount > 100000) { a.msg = 'Miktar 1 ile 100.000 arasında olmalı'; return; }
      if (target === 'all' && !confirm(`Bütün oyunculara ${amount} coin verilsin mi?`)) return;
      a.busy = true; a.msg = '';
      try {
        const r = await this.api('admin_give', { target, amount });
        a.msg = r.message;
        if (r.coins !== undefined) this.coins = r.coins;
        await this.adminLoad();
      } catch (e) { a.msg = e.message; }
      a.busy = false;
    },

    boxCount(kind) { return this.boxes.filter(b => b.kind === kind).length; },

    async buyBox(kind) {
      if (this.coins < BOX_KINDS[kind].price) { this.err = 'Yeterli coin yok. Soru çözerek coin kazan!'; return; }
      try { this.applyProfile(await this.api('buy_box', { kind })); } catch (e) { this.err = e.message; }
    },

    // Bonus metni: takılı auranın değerine göre
    bonusText() { return this.coinBonus ? '+%' + this.coinBonus + ' coin (aura bonusu)' : 'Aura tak, coin bonusu kazan'; },

    // ---------- Çarklar ----------
    wheels: null, spinning: null, wheelRot: { daily: 0, gold: 0 }, prize: null,

    async loadWheels() {
      if (this.wheels) return;
      try { this.wheels = (await this.api('wheels')).wheels; } catch (e) { this.err = e.message; }
    },

    sliceLabel(s) {
      return s[0] === 'coins' ? s[1] + ' 🪙' : { classic: 'Kutu', gold: 'Altın', cosmic: 'Kozmik' }[s[1]];
    },

    // Çarkı SVG olarak çizer
    wheelSvg(key) {
      const w = this.wheels?.[key];
      if (!w) return '';
      const n = w.slices.length, R = 100;
      const colors = key === 'gold' ? ['#f59f00', '#e8590c'] : ['#7048e8', '#9775fa'];
      let out = `<svg viewBox="-105 -105 210 210" class="wheel-svg" aria-hidden="true">`;
      w.slices.forEach((s, i) => {
        const a0 = (i / n) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
        const fill = s[0] === 'box' ? { classic: '#da77f2', gold: '#fab005', cosmic: '#1c1c3c' }[s[1]] : colors[i % 2];
        const p = (a, r) => (Math.cos(a) * r).toFixed(2) + ' ' + (Math.sin(a) * r).toFixed(2);
        out += `<path d="M0 0 L${p(a0, R)} A${R} ${R} 0 0 1 ${p(a1, R)} Z" fill="${fill}" stroke="#fff" stroke-width="2"/>`;
        const am = (a0 + a1) / 2, tx = (Math.cos(am) * 62).toFixed(2), ty = (Math.sin(am) * 62).toFixed(2);
        out += `<text x="${tx}" y="${ty}" transform="rotate(${((am * 180) / Math.PI + 90).toFixed(1)} ${tx} ${ty})" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-size="13" font-weight="800">${this.sliceLabel(s)}</text>`;
      });
      return out + `<circle r="16" fill="#fff"/><circle r="8" fill="${colors[0]}"/></svg>`;
    },

    async spin(key) {
      if (this.spinning) return;
      const w = this.wheels?.[key];
      if (!w) return;
      if (key === 'daily' && !this.freeSpin) { this.err = 'Günlük çarkı bugün çevirdin. Yarın yine gel!'; return; }
      if (w.price && this.coins < w.price) { this.err = 'Yeterli coin yok. Soru çözerek coin kazan!'; return; }
      this.spinning = key; this.prize = null;
      try {
        const r = await this.api('spin', { wheel: key });
        const n = w.slices.length;
        // Kazanılan dilim üstteki oka gelecek şekilde 5 tur + hedef açı
        const target = 360 - ((r.slice + 0.5) / n) * 360;
        const cur = this.wheelRot[key];
        this.wheelRot[key] = cur - (cur % 360) + 360 * 5 + target;
        if (w.price) this.coins -= w.price;
        await new Promise(res => setTimeout(res, 4200));
        this.applyProfile(r);
        this.prize = { wheel: key, text: r.prize[0] === 'coins' ? r.prize[1] + ' coin kazandın!' : BOX_KINDS[r.prize[1]].n + ' kazandın!' };
      } catch (e) { this.err = e.message; }
      this.spinning = null;
    },

    async findMatch() {
      try {
        await this.api('queue_join');
        this.m = null; this.shown = {}; this.anim = {}; this.revealKey = '';
        this.queue = { count: 1, max: 5, start_in: null };
        this.screen = 'queue';
        this.poll();
      } catch (e) { this.err = e.message; }
    },

    async cancelQueue() {
      await this.api('queue_leave').catch(() => {});
      this.screen = 'lobby';
    },

    async poll() {
      if (this.busy) return;
      this.busy = true;
      try {
        const r = await this.api('poll');
        if (r.mode === 'match') { this.applyMatch(r.match); this.screen = 'match'; }
        else if (r.mode === 'queue') { this.queue = r; this.screen = 'queue'; }
        else if (this.screen === 'queue' || this.screen === 'match') this.screen = 'lobby';
      } catch (e) { this.err = e.message; }
      this.busy = false;
    },

    applyMatch(m) {
      const keepChoice = this.m && this.m.id === m.id && this.m.q_index === m.q_index && m.my_choice === null ? this.m.my_choice : null;
      if (keepChoice !== null && m.phase === 'question') m.my_choice = keepChoice;
      this.m = m;
      this.localEnd = Date.now() + m.time_left;
      const key = m.id + ':' + m.q_index;
      const revealing = (m.phase === 'reveal' || m.phase === 'finished') && this.revealKey !== key;
      if (revealing) this.revealKey = key;

      for (const p of m.players) {
        if (this.shown[p.id] === undefined) { this.shown[p.id] = p.height; continue; }
        if (revealing && p.result_q === m.q_index) {
          if (p.last_result === 'correct') {
            this.shown[p.id] = p.height;
            this.flash(p.id, 'jump', 900);
          } else {
            // önce sütundan düşer, sonra sıfırdan başlar
            this.flash(p.id, 'fall', 1300);
            setTimeout(() => { this.shown[p.id] = p.height; this.flash(p.id, 'respawn', 500); }, 1300);
          }
        } else if (!this.anim[p.id]) {
          this.shown[p.id] = p.height;
        }
      }

      if (m.phase === 'finished' && this.finishedId !== m.id) { this.finishedId = m.id; this.loadMe(); }
    },

    flash(id, cls, ms) {
      this.anim = { ...this.anim, [id]: cls };
      setTimeout(() => { if (this.anim[id] === cls) { const a = { ...this.anim }; delete a[id]; this.anim = a; } }, ms);
    },

    // ---------- Emote ----------
    emoteReadyAt: 0,

    emoteReady() { return this.now >= this.emoteReadyAt; },

    lobbyDance: '',

    tryDance(k) {
      this.lobbyDance = k;
      setTimeout(() => { if (this.lobbyDance === k) this.lobbyDance = ''; }, 3500);
    },

    async sendEmote(key) {
      if (!this.emoteReady()) return;
      this.emoteReadyAt = Date.now() + 2500;
      const me = this.myP();
      if (me) me.emote = key; // anında göster, sonraki yoklama sunucudan doğrular
      try { await this.api('emote', { key }); } catch (e) { this.err = e.message; }
    },

    async answer(i) {
      if (!this.m || this.m.phase !== 'question' || this.m.my_choice !== null) return;
      this.m.my_choice = i;
      try { await this.api('answer', { choice: i }); } catch (e) { this.err = e.message; }
    },

    async leaveMatch() {
      await this.api('leave_match').catch(() => {});
      this.m = null;
      this.screen = 'lobby';
      this.loadMe();
    },

    async playAgain() {
      await this.api('leave_match').catch(() => {});
      this.findMatch();
    },

    // ---------- Sınava Hazırlık ----------
    EXAM_SUBJECTS: ['Matematik', 'Fen Bilimleri', 'Türkçe', 'Sosyal Bilgiler', 'İngilizce', 'Karma'],
    exam: null,
    catalog: null,
    pick: (() => { try { return JSON.parse(localStorage.getItem('sy_pick')) || { topics: [], types: ['mc', 'tf', 'match'] }; } catch { return { topics: [], types: ['mc', 'tf', 'match'] }; } })(),

    async openTopics() {
      try {
        if (!this.catalog) this.catalog = (await this.api('exam_catalog')).catalog;
        const ids = this.catalog.flatMap(s => s.topics.map(t => t.id));
        this.pick.topics = this.pick.topics.filter(id => ids.includes(id));
        this.screen = 'topics';
        window.scrollTo(0, 0);
      } catch (e) { this.err = e.message; }
    },

    savePick() { try { localStorage.setItem('sy_pick', JSON.stringify(this.pick)); } catch {} },

    toggleTopic(id) {
      const t = this.pick.topics;
      this.pick.topics = t.includes(id) ? t.filter(x => x !== id) : [...t, id];
      this.savePick();
    },

    subjectAll(s) { return s.topics.every(t => this.pick.topics.includes(t.id)); },

    toggleSubject(s) {
      const ids = s.topics.map(t => t.id);
      this.pick.topics = this.subjectAll(s) ? this.pick.topics.filter(id => !ids.includes(id)) : [...new Set([...this.pick.topics, ...ids])];
      this.savePick();
    },

    toggleType(k) {
      const t = this.pick.types;
      if (t.includes(k) && t.length === 1) return; // en az bir tür kalsın
      this.pick.types = t.includes(k) ? t.filter(x => x !== k) : [...t, k];
      this.savePick();
    },

    startPicked() {
      if (!this.pick.topics.length) { this.err = 'En az bir konu seç'; return; }
      this.startExam({ topics: this.pick.topics, types: this.pick.types });
    },

    // req: ders adı (hızlı başlat) ya da { topics, types }
    async startExam(req) {
      const body = typeof req === 'string' ? { subject: req } : req;
      try {
        const r = await this.api('exam_start', body);
        this.exam = { id: r.exam_id, subject: r.subject, req: body, questions: r.questions, index: 0, feedback: null, correctCount: 0, earned: 0, result: null, sending: false, sel: null, links: [] };
        this.resetLinks();
        this.loot = null;
        this.screen = 'exam';
        window.scrollTo(0, 0);
      } catch (e) { this.err = e.message; }
    },

    examQ() { return this.exam?.questions[this.exam.index]; },

    resetLinks() {
      const q = this.examQ();
      this.exam.sel = null;
      this.exam.links = q?.type === 'match' ? q.left.map(() => null) : [];
    },

    async sendExamAnswer(choice) {
      const ex = this.exam;
      if (!ex || ex.feedback || ex.sending) return;
      ex.sending = true;
      try {
        const r = await this.api('exam_answer', { exam_id: ex.id, index: ex.index, choice });
        ex.feedback = r;
        if (r.is_correct) { ex.correctCount++; ex.earned += r.coins; }
      } catch (e) { this.err = e.message; }
      ex.sending = false;
    },

    examAnswer(i) { this.sendExamAnswer(i); },

    // Eşleştirme: önce soldan, sonra sağdan bir kart seçilir
    pickLeft(i) {
      if (this.exam.feedback) return;
      this.exam.sel = this.exam.sel === i ? null : i;
    },

    pickRight(j) {
      const ex = this.exam;
      if (ex.feedback) return;
      const owner = ex.links.indexOf(j);
      if (ex.sel === null) { if (owner >= 0) ex.links[owner] = null; return; }
      if (owner >= 0) ex.links[owner] = null;
      ex.links[ex.sel] = j;
      const next = ex.links.indexOf(null);
      ex.sel = next >= 0 ? next : null;
    },

    linksDone() { return this.exam?.links.length && !this.exam.links.includes(null); },

    // Eşleşen kartlar aynı renkte görünür
    linkColor(i) { return ['#4dabf7', '#f783ac', '#69db7c', '#ffa94d', '#9775fa', '#38d9a9'][i % 6]; },

    rightOwner(j) { return this.exam.links.indexOf(j); },

    matchState(i) {
      const f = this.exam?.feedback;
      if (!f) return '';
      return f.choice[i] === f.correct[i] ? 'ok' : 'bad';
    },

    async examNext() {
      const ex = this.exam;
      if (!ex?.feedback) return;
      if (ex.index + 1 < ex.questions.length) {
        ex.index++;
        ex.feedback = null;
        this.resetLinks();
        return;
      }
      try {
        const r = await this.api('exam_finish', { exam_id: ex.id });
        this.applyProfile(r);
        ex.result = r;
      } catch (e) { this.err = e.message; }
    },

    examOptClass(i) {
      const f = this.exam?.feedback;
      if (!f) return '';
      if (i === f.correct) return 'ok';
      if (i === f.choice) return 'bad';
      return 'dim';
    },

    correctText() {
      const q = this.examQ(), f = this.exam?.feedback;
      if (!q || !f || q.type === 'match') return '';
      return q.type === 'tf' ? q.options[f.correct] : 'ABCD'[f.correct] + ') ' + q.options[f.correct];
    },

    leaveExam() {
      this.exam = null;
      this.screen = 'lobby';
    },

    // Canlı 3D önizleme; Three.js yoksa düz görüntüye döner
    stage(el, p) {
      if (!p) return;
      const look = { color: p.color, shape: p.shape, eyes: p.eyes, mouth: p.mouth, hat: p.hat, aura: p.aura, name: p.name };
      if (window.Char3D) {
        el.className = 'stage3d ' + (look.aura ? 'aura-' + look.aura : '');
        Char3D.preview(el, look);
      } else {
        el.innerHTML = this.charHtml(look, 'big');
      }
    },

    myP() { return this.m?.players.find(p => p.id === this.me?.id); },
    winner() { return this.m?.players.find(p => p.id === this.m.winner_id); },
    // Telefonda arena kısa: 10 kat sütun ekrana sığsın
    pillarPx(id) { const h = Math.min(this.shown[id] || 0, 10); return this.compact ? 18 + h * 9 : 28 + h * 24; },
    secsLeft() { return Math.max(0, Math.ceil((this.localEnd - this.now) / 1000)); },
    progress() { return this.m ? Math.max(0, Math.min(1, (this.localEnd - this.now) / this.m.duration)) : 0; },

    optClass(i) {
      const m = this.m;
      if (m.correct !== null) {
        if (i === m.correct) return 'ok';
        if (i === m.my_choice) return 'bad';
        return 'dim';
      }
      return i === m.my_choice ? 'picked' : '';
    },

    revealText() {
      const p = this.myP();
      if (!p || p.result_q !== this.m.q_index) return '';
      if (p.last_result === 'correct') return 'Doğru! Sütunun yükseldi.';
      const tail = p.alive ? ' Sütundan düştün, 1 can gitti.' : ' Canların bitti, elendin.';
      return (p.last_result === 'timeout' ? 'Süre doldu.' : 'Yanlış.') + tail;
    },

    tier(w) { return w >= 15 ? 'Elmas' : w >= 8 ? 'Altın' : w >= 3 ? 'Gümüş' : 'Bronz'; },

    charHtml(p, size = '') {
      const aura = p.aura && AURAS[p.aura] ? 'aura-' + p.aura : '';
      if (window.Char3D) {
        return `<div class="char c3d ${size} ${aura}" title="${esc(p.name || '')}"><img class="csvg" src="${Char3D.image(p)}" alt=""></div>`;
      }
      const hat = p.hat && HATS[p.hat] ? `<div class="hat">${HATS[p.hat].e}</div>` : '';
      return `<div class="char ${size} ${aura}" title="${esc(p.name || '')}">${hat}${charSvg(p)}</div>`;
    },
  };
}
