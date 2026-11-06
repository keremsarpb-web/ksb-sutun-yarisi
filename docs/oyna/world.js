// Köyüm: herkesin coinle kendi köyünü kurduğu ortak dünya (online sürüm).
// Kendi köyün kayıtta (LocalServer) tutulur; herkesin görmesi için Firestore'daki world/{uid} belgesine yansıtılır.
window.WORLD_ITEMS = {
  // anahtar: [ad, simge, fiyat, saatlik coin, tür]
  flower:   ['Çiçek', '🌷', 20, 0, 'doğa'],
  tree:     ['Ağaç', '🌳', 30, 0, 'doğa'],
  pine:     ['Çam', '🌲', 40, 0, 'doğa'],
  pond:     ['Gölet', '💧', 120, 0, 'doğa'],
  road:     ['Yol', '🟫', 5, 0, 'yol'],
  fence:    ['Çit', '🪵', 10, 0, 'yol'],
  lamp:     ['Sokak lambası', '🏮', 60, 0, 'yol'],
  tent:     ['Çadır', '⛺', 50, 0, 'ev'],
  house:    ['Ev', '🏠', 150, 0, 'ev'],
  villa:    ['Bahçeli ev', '🏡', 400, 0, 'ev'],
  tower:    ['Apartman', '🏢', 1200, 0, 'ev'],
  shop:     ['Dükkan', '🏪', 300, 10, 'işletme'],
  bakery:   ['Fırın', '🥐', 500, 20, 'işletme'],
  farm:     ['Çiftlik', '🌾', 600, 25, 'işletme'],
  cafe:     ['Kafe', '☕', 800, 35, 'işletme'],
  market:   ['Market', '🛒', 1500, 55, 'işletme'],
  school:   ['Okul', '🏫', 2000, 60, 'işletme'],
  hospital: ['Hastane', '🏥', 3000, 80, 'işletme'],
  factory:  ['Fabrika', '🏭', 5000, 150, 'işletme'],
  park:     ['Park', '⛲', 700, 0, 'süs'],
  stadium:  ['Stadyum', '🏟️', 4000, 0, 'süs'],
  castle:   ['Kale', '🏰', 10000, 0, 'süs'],
  rocket:   ['Uzay üssü', '🚀', 25000, 0, 'süs'],
};
window.WORLD = { PLOT: 8, PER_ROW: 6, MAX_HOURS: 12 };

(() => {
  const base = window.game;
  const PLOT = WORLD.PLOT;
  const CATS = ['ev', 'işletme', 'doğa', 'yol', 'süs'];

  window.game = function () {
    const g = base();
    let unwatch = null, beat = 0;
    Object.assign(g, {
      WORLD_ITEMS, WORLD_CATS: CATS,
      world: { open: false, loading: false, villages: [], mine: null, mode: 'walk', pick: 'house', cat: 'ev', zoom: 1, msg: '', income: 0, sel: null },

      async openWorld() {
        this.err = '';
        const w = this.world;
        w.loading = true;
        try {
          let r = await this.api('village_get');
          if (!r.village) {
            const plot = await CloudSync.worldAllocPlot();
            r = await this.api('village_init', { plot });
          }
          w.mine = r.village;
          await this.publishVillage();
          if (!window.World3D) throw new Error('Bu cihaz 3D görüntülemeyi desteklemiyor');
          this.screen = 'world';
          w.open = true;
          await this.$nextTick();
          World3D.init(document.querySelector('.w3d'), { onTile: (x, y) => this.tileClick(x, y) });
          unwatch?.();
          unwatch = await CloudSync.worldWatch(list => { w.villages = list; });
          clearInterval(beat);
          beat = setInterval(() => { if (this.screen === 'world') this.publishVillage(true); else clearInterval(beat); }, 60000);
          this.worldIncome();
          this.centerOn(w.mine.plot, w.mine.pos);
          this.worldSync();
        } catch (e) { this.err = e.message; }
        w.loading = false;
      },

      closeWorld() { unwatch?.(); unwatch = null; clearInterval(beat); this.world.open = false; this.screen = 'lobby'; this.loadMe(); },

      // Kendi köyünü herkesin göreceği belgeye yazar
      async publishVillage(heartbeat = false) {
        const v = this.world.mine, me = this.me;
        if (!v || !me) return;
        try {
          await CloudSync.worldPublish({
            name: me.name, className: me.class_name || '', plot: v.plot, tiles: v.tiles, pos: v.pos,
            look: { color: me.color, shape: me.shape, eyes: me.eyes, mouth: me.mouth, hat: me.hat || '', aura: me.aura || '' },
          }, heartbeat);
        } catch (e) { if (!heartbeat) this.world.msg = 'Köy kaydedilemedi: ' + e.message; }
      },

      villageAt(n) { return this.world.villages.find(v => v.plot === n); },
      isOnline(v) { return v && Date.now() - (v.lastSeen || 0) < 150000; },

      // 3D sahneye güncel durumu verir (x-effect ile her değişiklikte çağrılır)
      worldSync() {
        const w = this.world;
        if (!window.World3D || !w.open) return;
        World3D.sync({
          mine: w.mine ? { plot: w.mine.plot, tiles: { ...w.mine.tiles }, pos: { ...(w.mine.pos || {}) } } : null,
          villages: w.villages.map(v => ({ ...v, online: this.isOnline(v) })),
          me: this.me ? { ...this.me } : null,
          mode: w.mode,
        });
      },
      centerOn(plot, pos) { if (window.World3D && plot !== undefined) World3D.focus(plot, pos); },
      visitVillage(plot) { if (plot !== '') this.centerOn(Number(plot)); },
      zoomBy(f) { World3D?.zoom(1 / f); },
      rotateWorld(d) { World3D?.rotate(d); },

      // Kendi arsasındaki kareye tıklama: yürü, kur ya da sat
      async tileClick(x, y) {
        const w = this.world, v = w.mine;
        if (!v) return;
        const k = x + '_' + y, existing = v.tiles[k];
        w.msg = '';
        try {
          if (w.mode === 'build') {
            if (existing) { w.sel = { x, y, key: existing }; return; }
            const it = WORLD_ITEMS[w.pick];
            if (this.coins < it[2]) { w.msg = `${it[0]} için ${it[2]} coin gerek. Soru çözerek coin kazan!`; return; }
            const r = await this.api('village_build', { x, y, key: w.pick });
            w.mine = r.village; this.applyProfile(r);
            w.msg = `${it[1]} ${it[0]} kuruldu (−${it[2]} coin)`;
            this.publishVillage(); this.worldIncome();
          } else if (!existing || WORLD_ITEMS[existing][4] === 'yol' || WORLD_ITEMS[existing][4] === 'doğa') {
            const r = await this.api('village_move', { x, y });
            w.mine = r.village; this.publishVillage(true);
          } else w.sel = { x, y, key: existing };
        } catch (e) { w.msg = e.message; }
      },

      async sellSelected() {
        const w = this.world, s = w.sel;
        if (!s) return;
        try {
          const r = await this.api('village_sell', { x: s.x, y: s.y });
          w.mine = r.village; this.applyProfile(r); w.sel = null;
          w.msg = `Satıldı (+${r.refund} coin)`;
          this.publishVillage(); this.worldIncome();
        } catch (e) { w.msg = e.message; }
      },

      worldIncome() {
        const v = this.world.mine;
        if (!v) return;
        const perHour = Object.values(v.tiles).reduce((s, k) => s + (WORLD_ITEMS[k]?.[3] || 0), 0);
        const hours = Math.min(WORLD.MAX_HOURS, (Date.now() - (v.lastCollect || Date.now())) / 3600000);
        this.world.income = Math.floor(perHour * hours);
        this.world.perHour = perHour;
      },

      async collectIncome() {
        try {
          const r = await this.api('village_collect');
          this.world.mine = r.village; this.applyProfile(r);
          this.world.msg = r.gained ? `İşletmelerinden ${r.gained} coin topladın!` : 'Henüz toplanacak kazanç yok.';
          this.worldIncome();
        } catch (e) { this.world.msg = e.message; }
      },

      // Ok tuşları / WASD ile kendi köyünde yürü
      worldKey(e) {
        if (this.screen !== 'world' || /input|textarea/i.test(e.target.tagName)) return;
        const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] }[e.key];
        const v = this.world.mine;
        if (!d || !v) return;
        e.preventDefault();
        const x = Math.max(0, Math.min(PLOT - 1, (v.pos?.x ?? 3) + d[0])), y = Math.max(0, Math.min(PLOT - 1, (v.pos?.y ?? 3) + d[1]));
        const t = v.tiles[x + '_' + y];
        if (t && !['yol', 'doğa'].includes(WORLD_ITEMS[t]?.[4])) return; // binaların içinden geçilmez
        v.pos = { x, y };
        clearTimeout(this._mv);
        this._mv = setTimeout(() => this.api('village_move', { x, y }).then(r => { this.world.mine = r.village; this.publishVillage(true); }).catch(() => {}), 500);
      },

      worldItemsIn(cat) { return Object.entries(WORLD_ITEMS).filter(([, it]) => it[4] === cat); },
    });
    addEventListener('keydown', e => g.worldKey?.call(window.Alpine ? Alpine.$data(document.querySelector('[x-data]')) : g, e));
    return g;
  };
})();
