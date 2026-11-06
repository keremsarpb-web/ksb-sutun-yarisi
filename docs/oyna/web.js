// Web sürümü: oyunun arayüzünü sunucu yerine tarayıcıdaki LocalServer'a bağlar.
// Odalar (online): oda kuran tarayıcı maçı yönetir, konuklar PeerJS ile bağlanır.
(() => {
  const base = window.game;
  const PREFIX = 'ksb-sutun-yarisi-oda-';
  const ALPH = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const MAX_GUESTS = 4;
  const newCode = () => Array.from({ length: 5 }, () => ALPH[Math.floor(Math.random() * ALPH.length)]).join('');

  let peerJs = null;
  const loadPeer = () => peerJs || (peerJs = new Promise((res, rej) => {
    if (window.Peer) return res();
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
    s.onload = res;
    s.onerror = () => { peerJs = null; rej(new Error('Online bağlantı kurulamadı. İnternetini kontrol et.')); };
    document.head.appendChild(s);
  }));

  window.game = function () {
    const g = base();
    const localApi = async (action, body) => {
      try { return await LocalServer.handle(action, body); } catch (e) { const err = new Error(e.message || 'Hata'); err.status = e.status; throw err; }
    };
    // Oda bağlantıları reaktif olmasın diye Alpine'in dışında tutulur
    const net = { peer: null, conns: new Map(), host: null, loop: 0, guestState: null, rewarded: {} };

    const baseLogout = g.logout;
    // Admin hediye coin gönderince
    addEventListener('sy-gift', e => {
      const self = window.Alpine && document.querySelector('[x-data]') && Alpine.$data(document.querySelector('[x-data]'));
      if (!self) return;
      self.notice = `🎁 Hesabına ${e.detail.coins} coin geldi!`;
      self.loadMe();
      if (self.me?.is_admin) self.adminLoad();
      setTimeout(() => { if (self.notice.startsWith('🎁')) self.notice = ''; }, 6000);
    });
    Object.assign(g, {
      // Çıkışta sunucu oturumu da kapanır; kayıt önce sunucuya gönderilir
      async logout() { await window.CloudSync?.signOut(); return baseLogout.call(this); },
      // Oturum: okul sürümü gibi sy_token; hesap bu cihazda yoksa giriş ekranı
      token: (() => { const n = LocalServer.accountCount(); let t = ''; try { t = localStorage.getItem('sy_token') || ''; } catch {} return n && LocalServer.hasAccount(t) ? t : ''; })(),
      authTab: LocalServer.accountCount() ? 'login' : 'student',
      // Ana ekrandan açıldıysa yükleme düğmesi gizlenir
      standalone: matchMedia('(display-mode: standalone)').matches || navigator.standalone === true,
      installTip: '',

      // Android'de tarayıcının kurulum penceresi; iPhone ve diğerlerinde adım adım yol tarifi
      async installApp() {
        if (this.installEvt) return this.install();
        const ua = navigator.userAgent;
        const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document);
        this.installTip = ios ? 'iPhone / iPad: Safari’de alttaki Paylaş düğmesine (kare ve yukarı ok) bas, sonra “Ana Ekrana Ekle”yi seç.'
          : /SamsungBrowser/.test(ua) ? 'Samsung Internet: alttaki ≡ menüsünü aç, “Sayfayı ekle” → “Ana ekran”ı seç.'
          : /Android/.test(ua) ? 'Android: sağ üstteki ⋮ menüsünden “Uygulamayı yükle” ya da “Ana ekrana ekle”yi seç.'
          : 'Bilgisayar: adres çubuğunun sağındaki “Uygulamayı yükle” simgesine ya da menüdeki “Uygulamalar → Bu siteyi uygulama olarak yükle”ye bas.';
      },
      room: { mode: '', code: '', status: '', players: [], joinCode: '', busy: false },

      async api(action, body = {}) {
        // Konuk, oda maçındayken maçı oda sahibinden alır
        if (this.room.mode === 'guest' && net.guestState) {
          if (action === 'poll') return { mode: 'match', match: net.guestState };
          if (action === 'answer') {
            if (net.guestState.phase !== 'question') throw new Error('Şu an cevap verilemez');
            net.host?.send({ t: 'answer', choice: Number(body.choice) });
            return { ok: true };
          }
          if (action === 'emote') { net.host?.send({ t: 'emote', key: body.key }); return { ok: true }; }
          if (action === 'leave_match') {
            if (net.guestState.phase !== 'finished') { net.host?.send({ t: 'leave' }); LocalServer.room.reward('played'); }
            net.guestState = null;
            return { ok: true };
          }
        }
        return localApi(action, { ...body, token: this.token });
      },

      async playAgain() {
        if (!this.room.mode) {
          await this.api('leave_match').catch(() => {});
          return this.findMatch();
        }
        // Odada "Tekrar oyna": oda sahibi yeni maçı başlatana kadar lobide beklenir
        await this.leaveMatch();
      },

      setRoomPlayers(list) { this.room.players = list; },

      hostLobby() {
        const me = LocalServer.room.profile();
        const list = [{ peer: 'host', host: true, name: me.name, color: me.color }];
        for (const [peer, c] of net.conns) if (c.profile) list.push({ peer, name: c.profile.name, color: c.profile.color });
        this.setRoomPlayers(list);
        for (const c of net.conns.values()) if (c.open) c.send({ t: 'lobby', code: this.room.code, players: list });
      },

      async roomCreate() {
        if (this.room.busy) return;
        this.room.busy = true; this.err = '';
        try {
          await loadPeer();
          await LocalServer.ready;
          const code = newCode();
          const peer = new Peer(PREFIX + code);
          net.peer = peer;
          await new Promise((res, rej) => { peer.on('open', res); peer.on('error', rej); });
          this.room.mode = 'host'; this.room.code = code;
          this.room.status = 'Kodu arkadaşlarına söyle. En az 1 kişi katılınca maçı başlatabilirsin.';
          peer.on('connection', c => {
            c.on('open', () => {
              if (net.conns.size >= MAX_GUESTS || LocalServer.room.active()) { c.send({ t: 'closed', reason: net.conns.size >= MAX_GUESTS ? 'Oda dolu (en fazla 5 kişi).' : 'Maç başladı, bir sonrakini bekle.' }); setTimeout(() => c.close(), 300); return; }
              net.conns.set(c.peer, c);
            });
            c.on('data', msg => this.onHostMsg(c, msg));
            c.on('close', () => {
              const id = c.matchId;
              net.conns.delete(c.peer);
              if (id) LocalServer.room.leave(id);
              this.hostLobby();
            });
          });
          peer.on('error', e => { this.err = 'Bağlantı hatası: ' + (e.type || e.message); });
          // Sunucuyla bağlantı koparsa (ör. sekme arka planda) aynı kodla yeniden bağlan
          peer.on('disconnected', () => { if (net.peer === peer && !peer.destroyed) setTimeout(() => { try { peer.reconnect(); } catch {} }, 1000); });
          this.hostLobby();
        } catch (e) {
          this.err = e.type === 'unavailable-id' ? 'Bir sorun oldu, tekrar dene.' : (e.message || 'Oda kurulamadı');
          this.roomReset();
        }
        this.room.busy = false;
      },

      onHostMsg(c, msg) {
        if (!msg || typeof msg !== 'object') return;
        if (msg.t === 'hello' && msg.profile) {
          const p = msg.profile;
          c.profile = { name: String(p.name || 'Oyuncu').slice(0, 20), color: p.color, shape: p.shape, eyes: p.eyes, mouth: p.mouth,
            hat: p.hat || '', aura: p.aura || '', wins: p.wins | 0, games: p.games | 0 };
          this.hostLobby();
        } else if (msg.t === 'answer' && c.matchId) LocalServer.room.answer(c.matchId, Number(msg.choice));
        else if (msg.t === 'emote' && c.matchId) LocalServer.room.emote(c.matchId, msg.key);
        else if (msg.t === 'leave' && c.matchId) { LocalServer.room.leave(c.matchId); c.matchId = 0; }
      },

      async roomStart() {
        const guests = [...net.conns.values()].filter(c => c.open && c.profile);
        if (!guests.length) { this.err = 'Maçı başlatmak için en az 1 arkadaşının katılması gerek.'; return; }
        await this.api('leave_match').catch(() => {});
        const ids = LocalServer.room.start(guests.map(c => ({ ...c.profile, peer: c.peer })));
        for (const { id, peer } of ids) net.conns.get(peer).matchId = id;
        this.m = null; this.shown = {}; this.anim = {}; this.revealKey = '';
        this.screen = 'match';
        this.poll();
        clearInterval(net.loop);
        // Maç durumu her konuğa kendi gözünden yollanır
        net.loop = setInterval(() => {
          let finished = false;
          for (const c of net.conns.values()) {
            if (!c.open || !c.matchId) continue;
            const st = LocalServer.room.state(c.matchId);
            if (st) { c.send({ t: 'state', match: st }); finished = st.phase === 'finished'; }
          }
          if (finished || !LocalServer.room.active()) {
            for (const c of net.conns.values()) c.matchId = 0;
            clearInterval(net.loop);
          }
        }, 400);
      },

      async roomJoin() {
        const code = (this.room.joinCode || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (code.length !== 5) { this.err = 'Oda kodu 5 karakter olmalı'; return; }
        if (this.room.busy) return;
        this.room.busy = true; this.err = '';
        try {
          await loadPeer();
          await LocalServer.ready;
          const peer = new Peer();
          net.peer = peer;
          await new Promise((res, rej) => { peer.on('open', res); peer.on('error', rej); });
          const c = peer.connect(PREFIX + code, { reliable: true });
          net.host = c;
          await new Promise((res, rej) => {
            c.on('open', res);
            peer.on('error', e => rej(e.type === 'peer-unavailable' ? new Error('Bu kodla bir oda bulunamadı') : e));
            setTimeout(() => rej(new Error('Odaya bağlanılamadı')), 12000);
          });
          this.room.mode = 'guest'; this.room.code = code;
          this.room.status = 'Oda sahibinin maçı başlatmasını bekliyorsun.';
          c.on('data', msg => this.onGuestMsg(msg));
          c.on('close', () => {
            if (this.room.mode !== 'guest') return;
            this.err = 'Oda kapandı.';
            if (this.screen === 'match') this.screen = 'lobby';
            this.roomReset();
          });
          c.send({ t: 'hello', profile: LocalServer.room.profile() });
        } catch (e) {
          this.err = e.message || 'Odaya katılınamadı';
          this.roomReset();
        }
        this.room.busy = false;
      },

      onGuestMsg(msg) {
        if (!msg || typeof msg !== 'object') return;
        if (msg.t === 'lobby') this.setRoomPlayers(msg.players || []);
        else if (msg.t === 'closed') { this.err = msg.reason || 'Odaya girilemedi'; this.roomReset(); }
        else if (msg.t === 'state' && msg.match) {
          const m = msg.match;
          if (!net.guestState || net.guestState.id !== m.id) {
            net.rewarded = {};
            if (this.screen !== 'match') { this.m = null; this.shown = {}; this.anim = {}; this.revealKey = ''; this.screen = 'match'; }
          }
          net.guestState = m;
          // Kendi ödülünü kendi cihazına yaz
          const me = m.players.find(p => p.id === 1);
          const r = net.rewarded;
          if (me && (m.phase === 'reveal' || m.phase === 'finished') && me.result_q === m.q_index && me.last_result === 'correct' && !r['q' + m.q_index]) {
            r['q' + m.q_index] = true; LocalServer.room.reward('correct');
          }
          if (m.phase === 'finished' && !r.done) {
            r.done = true; LocalServer.room.reward('played');
            if (m.winner_id === 1) LocalServer.room.reward('win');
            this.loadMe();
          }
          this.poll();
        }
      },

      roomReset() {
        clearInterval(net.loop);
        try { net.peer?.destroy(); } catch {}
        Object.assign(net, { peer: null, conns: new Map(), host: null, loop: 0, guestState: null, rewarded: {} });
        Object.assign(this.room, { mode: '', code: '', status: '', players: [], busy: false });
      },

      async roomClose() {
        if (this.room.mode === 'host' && LocalServer.room.active()) await this.api('leave_match').catch(() => {});
        if (this.room.mode === 'guest' && net.guestState) await this.api('leave_match').catch(() => {});
        this.roomReset();
      },
    });
    return g;
  };
})();
