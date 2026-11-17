// Gelişim takibi: Minikler, Sınava Hazırlık ve maç sonuçlarının özeti, son 14 günün etkinliği,
// güçlü ve çalışılması gereken konular. Öğretmen, sınıf/öğrenci gelişimine de buradan bakar.
// Masaüstü kısayolu ...#gelisim adresiyle açılırsa giriş yapınca doğrudan bu ekran gelir.
(() => {
  const AREAS = [['matematik', '🔢', 'Matematik'], ['turkce', '🔤', 'Türkçe'], ['hayat', '🌱', 'Hayat Bilgisi'],
    ['ingilizce', '🇬🇧', 'İngilizce'], ['dikkat', '🧠', 'Dikkat'], ['hafiza', '🃏', 'Hafıza']];
  const DAYS = 14;
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const pct = (c, t) => t ? Math.round(c * 100 / t) : 0;
  const TR_DAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

  const base = window.game;
  window.game = function () {
    const g = base();
    const baseInit = g.init;
    Object.assign(g, {
      prog: { data: null, loading: false, err: '', forId: null, back: 'lobby', hover: null },

      async init() {
        const wantProgress = location.hash === '#gelisim';
        await baseInit.call(this);
        if (!wantProgress) return;
        // Giriş ekranındaysa girişten sonra aç
        if (this.screen === 'lobby') this.openProgress();
        else { const stop = this.$watch('screen', s => { if (s === 'lobby') { stop?.(); this.openProgress(); } }); }
      },

      async openProgress(playerId = null) {
        const pr = this.prog;
        pr.back = playerId ? 'teacher' : 'lobby';
        pr.forId = playerId; pr.loading = true; pr.err = ''; pr.data = null;
        this.screen = 'progress';
        window.scrollTo(0, 0);
        try { pr.data = await this.api('progress', playerId ? { player_id: playerId } : {}); }
        catch (e) { pr.err = e.message; }
        pr.loading = false;
      },
      progressBack() {
        this.screen = this.prog.back;
        if (location.hash === '#gelisim') history.replaceState(null, '', location.pathname + location.search);
      },

      // ---- hesaplananlar ----
      progDays() {
        const d = this.prog.data?.days || {}, out = [];
        const t = new Date();
        for (let i = DAYS - 1; i >= 0; i--) {
          const x = new Date(t.getFullYear(), t.getMonth(), t.getDate() - i), k = ymd(x);
          out.push({ key: k, label: TR_DAYS[x.getDay()], date: x.getDate() + '.' + (x.getMonth() + 1), kids: d[k]?.kids || 0, exam: d[k]?.exam || 0 });
        }
        return out;
      },
      progMax() { return Math.max(10, ...this.progDays().map(x => x.kids + x.exam)); },
      progActiveDays() { return this.progDays().filter(x => x.kids + x.exam > 0).length; },
      progStreak() {
        const d = this.prog.data?.days || {};
        const t = new Date(); let n = 0;
        // Bugün henüz oynamadıysa seri dünden sayılır
        let i = d[ymd(t)] ? 0 : 1;
        for (; ; i++) { const k = ymd(new Date(t.getFullYear(), t.getMonth(), t.getDate() - i)); if (!d[k]) break; n++; }
        return n;
      },
      progAreas() {
        const a = this.prog.data?.kids?.areas || {};
        return AREAS.map(([key, icon, name]) => ({ key, icon, name, correct: a[key]?.[0] || 0, total: a[key]?.[1] || 0, pct: pct(a[key]?.[0] || 0, a[key]?.[1] || 0) }));
      },
      progSubjects() {
        return (this.prog.data?.exams?.subjects || []).map(s => ({ ...s, pct: pct(s.correct, s.total) })).sort((x, y) => y.total - x.total);
      },
      progExamPct() {
        const s = this.prog.data?.exams?.subjects || [];
        return pct(s.reduce((a, x) => a + x.correct, 0), s.reduce((a, x) => a + x.total, 0));
      },
      progTopics(strong) {
        const list = (this.prog.data?.exams?.topics || []).filter(t => t.total >= 3).map(t => ({ ...t, pct: pct(t.correct, t.total) }));
        list.sort((x, y) => strong ? (y.pct - x.pct) || (y.total - x.total) : (x.pct - y.pct) || (y.total - x.total));
        return (strong ? list.filter(t => t.pct >= 70) : list.filter(t => t.pct < 70)).slice(0, 4);
      },
      progTopicsReady() { return (this.prog.data?.exams?.topics || []).some(t => t.total >= 3); },
      progKidsAdvice() {
        const played = this.progAreas().filter(a => a.total > 0);
        if (!played.length) return null;
        return played.reduce((w, a) => (a.pct < w.pct ? a : w));
      },
      progLevel(p) { return p >= 85 ? 'Çok iyi' : p >= 70 ? 'İyi' : p >= 50 ? 'Gelişiyor' : 'Çalışmalı'; },
      progLevelClass(p) { return p >= 85 ? 'lv4' : p >= 70 ? 'lv3' : p >= 50 ? 'lv2' : 'lv1'; },
      progEmpty() {
        const d = this.prog.data;
        return d && !d.kids.sets && !(d.exams.subjects || []).length && !d.match.games;
      },
      async practiceTopic(t) {
        try {
          if (!this.catalog) this.catalog = (await this.api('exam_catalog')).catalog;
          const s = this.catalog.find(x => x.subject === t.subject);
          const topic = s?.topics.find(x => x.name === t.topic);
          if (topic) this.startExam({ topics: [topic.id] }); else this.startExam(t.subject);
        } catch (e) { this.err = e.message; }
      },
    });
    return g;
  };
})();
