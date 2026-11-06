// Sütun Yarışı çevrimiçi hesaplar (Firebase): her cihazdan aynı hesapla giriş, kayıt sunucuda.
// Kullanıcılar kullanıcı adıyla girer; Firebase için arka planda sahte bir e-posta adresi kullanılır.
window.CloudSync = (() => {
  const CONFIG = {
    apiKey: 'AIzaSyBf2HfHWhUICqSreL6qcWI2NfmsApnv1UQ',
    authDomain: 'project-school-ksb.firebaseapp.com',
    projectId: 'project-school-ksb',
    storageBucket: 'project-school-ksb.firebasestorage.app',
    messagingSenderId: '46760896021',
    appId: '1:46760896021:web:71809615f209cfa506901c',
  };
  const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
  const DOMAIN = '@sutunyarisi.example.com';
  // Firebase en az 6 karakter ister; oyunda 4 karakterlik şifreler de geçerli
  const PEPPER = '#ksb';

  const loadScript = src => new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = () => rej(new Error('Sunucuya bağlanılamadı. İnternetini kontrol et.'));
    document.head.appendChild(s);
  });
  let boot = null;
  function ready() {
    return boot || (boot = (async () => {
      await loadScript(SDK + 'firebase-app-compat.js');
      await Promise.all([loadScript(SDK + 'firebase-auth-compat.js'), loadScript(SDK + 'firebase-firestore-compat.js')]);
      const app = firebase.initializeApp(CONFIG);
      const auth = app.auth(), db = app.firestore();
      // Oturum bilgisi (kimin girdiği) gelene kadar bekle
      await new Promise(r => { const off = auth.onAuthStateChanged(() => { off(); r(); }); });
      return { app, auth, db };
    })().catch(e => { boot = null; throw e; }));
  }

  const slug = s => String(s).toLowerCase().replace(/[^a-z0-9._-]/g, '_');
  const emailFor = (role, login, ascii) => (role === 'class' ? 'sinif.' : 'ogr.') + slug(ascii(login)) + DOMAIN;
  const pw = p => String(p) + PEPPER;

  // Firebase hata kodlarını oyunun Türkçe mesajlarına çevirir
  function why(e, fallback) {
    const c = e?.code || '';
    if (c.includes('network')) return 'Sunucuya bağlanılamadı. İnternetini kontrol et.';
    if (c.includes('email-already-in-use')) return 'already';
    if (c.includes('invalid-credential') || c.includes('wrong-password') || c.includes('user-not-found') || c.includes('invalid-login')) return 'Ad veya şifre yanlış';
    if (c.includes('too-many-requests')) return 'Çok fazla deneme yapıldı. Biraz bekleyip tekrar dene.';
    return fallback || e?.message || 'Sunucu hatası';
  }

  async function signUp(email, password) {
    const { auth } = await ready();
    try { return (await auth.createUserWithEmailAndPassword(email, pw(password))).user.uid; }
    catch (e) { throw new Error(why(e)); }
  }
  async function signIn(email, password) {
    const { auth } = await ready();
    try { return (await auth.signInWithEmailAndPassword(email, pw(password))).user.uid; }
    catch (e) { throw new Error(why(e)); }
  }
  // Sınıf şifresini, oturumu bozmadan ikinci bir bağlantıyla doğrular
  async function checkClassPassword(email, password) {
    await ready();
    const tmp = firebase.apps.find(a => a.name === 'sinif-kontrol') || firebase.initializeApp(CONFIG, 'sinif-kontrol');
    try { await tmp.auth().signInWithEmailAndPassword(email, pw(password)); await tmp.auth().signOut(); return true; }
    catch (e) { if (why(e) === 'Ad veya şifre yanlış') return false; throw new Error(why(e)); }
  }
  async function getClass(key) {
    const { db } = await ready();
    const d = await db.collection('classes').doc(slug(key)).get();
    return d.exists ? d.data() : null;
  }
  async function addClass(key, name, uid) {
    const { db } = await ready();
    await db.collection('classes').doc(slug(key)).set({ name, uid });
  }
  async function pull(uid) {
    const { db } = await ready();
    const d = await db.collection('users').doc(uid).get();
    return d.exists ? d.data() : null;
  }
  // Kayıt (coin, kutu, kozmetik, sınavlar) ve sıralama bilgisi
  let pushTimer = 0, pending = null;
  function schedulePush(uid, meta, save, publicInfo) {
    pending = { uid, meta, save, publicInfo };
    clearTimeout(pushTimer);
    pushTimer = setTimeout(flush, 1200);
  }
  async function flush() {
    const p = pending; pending = null;
    if (!p) return;
    try {
      const { auth, db } = await ready();
      if (auth.currentUser?.uid !== p.uid) return;
      const now = Date.now();
      // merge: adminin bıraktığı hediye coin (giftCoins) silinmesin
      await db.collection('users').doc(p.uid).set({ ...p.meta, save: JSON.stringify(p.save), updatedAt: now }, { merge: true });
      if (p.publicInfo) await db.collection('public').doc(p.uid).set({ ...p.publicInfo, updatedAt: now });
    } catch (e) { console.warn('Kayıt sunucuya gönderilemedi', e); }
  }
  addEventListener('pagehide', flush);
  addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });

  async function leaderboard() {
    const { db } = await ready();
    const snap = await db.collection('public').orderBy('wins', 'desc').limit(60).get();
    return snap.docs.map(d => d.data()).filter(p => p.games > 0);
  }
  async function signOut() {
    await flush();
    unwatch?.(); unwatch = null;
    try { const { auth } = await ready(); await auth.signOut(); } catch {}
  }
  const currentUid = async () => { try { return (await ready()).auth.currentUser?.uid || ''; } catch { return ''; } };

  // ---- Admin: hediye coin ----
  // Admin, oyuncunun kaydına "giftCoins" bırakır; oyuncunun oyunu bunu alıp coinlerine ekler.
  async function adminList() {
    const { db } = await ready();
    const snap = await db.collection('users').get();
    return snap.docs.map(d => {
      let p = {};
      try { p = JSON.parse(d.data().save || '{}').player || {}; } catch {}
      const u = d.data();
      return { id: d.id, name: p.name || u.login, username: u.role === 'student' ? u.login : '', role: u.role || p.role,
        class_name: u.cls || p.className || '', color: p.color || '#adb5bd', coins: (p.coins | 0) + (u.giftCoins | 0) };
    }).sort((a, b) => (a.role > b.role ? 1 : a.role < b.role ? -1 : a.name.localeCompare(b.name, 'tr')));
  }
  async function adminGive(uids, amount) {
    const { db } = await ready();
    const inc = firebase.firestore.FieldValue.increment(amount);
    for (let i = 0; i < uids.length; i += 400) {
      const batch = db.batch();
      for (const uid of uids.slice(i, i + 400)) batch.update(db.collection('users').doc(uid), { giftCoins: inc });
      await batch.commit();
    }
  }
  // Kendi kaydındaki hediyeyi izler; gelen coin bir kez (işlemle) alınır
  let unwatch = null;
  async function watchGifts(uid, onGift) {
    const { db } = await ready();
    unwatch?.();
    const ref = db.collection('users').doc(uid);
    unwatch = ref.onSnapshot(async snap => {
      if (!((snap.data()?.giftCoins | 0) > 0)) return;
      try {
        const n = await db.runTransaction(async tx => {
          const d = await tx.get(ref);
          const g = d.data()?.giftCoins | 0;
          if (g > 0) tx.update(ref, { giftCoins: 0 });
          return g;
        });
        if (n > 0) onGift(n);
      } catch (e) { console.warn('Hediye alınamadı', e); }
    }, () => {});
  }

  return { adminList, adminGive, watchGifts, ready, emailFor, signUp, signIn, checkClassPassword, getClass, addClass, pull, schedulePush, flush, leaderboard, signOut, currentUid };
})();
