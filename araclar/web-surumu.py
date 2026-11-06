# Okul sürümünden tarayıcıda oynanan web sürümünü (docs/oyna) üretir.
# Kullanım (depo kökünden):  python araclar/web-surumu.py
# Soru verisi için ayrıca: php araclar/veri-aktar.php docs/oyna/data.json  (XAMPP veritabanı açıkken)
import pathlib, re, shutil

ROOT = pathlib.Path(__file__).resolve().parent.parent
WEB = ROOT / 'docs' / 'oyna'
WEB.mkdir(parents=True, exist_ok=True)
(WEB / 'vendor').mkdir(exist_ok=True)

for f in ['game.js', 'style.css', 'char3d.js', 'icon-192.png', 'icon-512.png']:
    shutil.copy(ROOT / f, WEB / f)
for f in ['alpine.min.js', 'three.min.js']:
    shutil.copy(ROOT / 'vendor' / f, WEB / 'vendor' / f)

version = re.search(r"APP_VERSION = '([^']+)'", (ROOT / 'version.php').read_text(encoding='utf-8')).group(1)
s = (ROOT / 'index.php').read_text(encoding='utf-8')

def rep(a, b, count=1):
    global s
    assert s.count(a) == count, (a, s.count(a))
    s = s.replace(a, b)

# PHP kısımları
s = s[s.index('<!doctype html>'):]
s = s.replace('<?= APP_VERSION ?>', version).replace('<?= $v ?>', '?v=' + version)
# manifest.json ve sw.js docs/oyna içinde: Android (Samsung, Chrome) ve iPhone/iPad ana ekranına kurulur
rep('<title>Sütun Yarışı</title>', '<title>Sütun Yarışı – Tarayıcıda oyna</title>\n<link rel="canonical" href="https://keremsarpb-web.github.io/ksb-sutun-yarisi/oyna/">\n'
    '<meta name="apple-mobile-web-app-status-bar-style" content="default">\n<meta name="application-name" content="Sütun Yarışı">')
# Yerel sunucu, oyun kodundan sonra ve Alpine başlamadan yüklenir
rep(f'<script src="char3d.js?v={version}"></script>',
    f'<script src="char3d.js?v={version}"></script>\n<script src="matematik.js?v={version}"></script>\n<script src="cloud.js?v={version}"></script>\n<script src="server.js?v={version}"></script>\n<script src="web.js?v={version}"></script>\n<link rel="stylesheet" href="web.css?v={version}">')

# Giriş: okul sürümündeki sekmeler aynen; hesaplar sunucuda (Firebase), her cihazdan girilir
rep('<p class="hint">Sınıfının kayıtlı olması gerekir. Sınıf şifresini öğretmeninden öğren; sadece katılmak için sorulur.</p>',
    '<p class="hint">Sınıfının kayıtlı olması gerekir. Sınıf şifresini öğretmeninden öğren; sadece katılmak için sorulur. Hesabınla her cihazdan girebilirsin.</p>')

# Lobi metinleri
rep('<p>2–5 oyuncu, 10 soru. ', '<p>Bilgisayar oyuncularına karşı 2–5 kişilik maç, 10 soru. ')

# Arkadaşlarla oyna (online oda) paneli: turnuva panelinin hemen altında
rep("""        <button class="btn primary big" @click="findMatch()">Rastgele maç bul</button>
      </div>
""", """        <button class="btn primary big" @click="findMatch()">Rastgele maç bul</button>
      </div>

      <div class="panel room">
        <h2>Arkadaşlarla oyna <span class="count small">online</span></h2>
        <template x-if="!room.mode">
          <div>
            <p>Oda kur, kodu arkadaşlarına söyle; onlar kendi telefon ya da bilgisayarlarından bu sayfayı açıp katılsın. 2–5 kişi.</p>
            <div class="room-actions">
              <button class="btn primary" @click="roomCreate()" :disabled="room.busy">Oda kur</button>
              <span class="or">ya da</span>
              <input class="room-code-in" maxlength="5" x-model="room.joinCode" placeholder="KOD" autocapitalize="characters" autocomplete="off" @keydown.enter="roomJoin()" aria-label="Oda kodu">
              <button class="btn" @click="roomJoin()" :disabled="room.busy">Katıl</button>
            </div>
            <p class="hint" x-show="room.busy">Bağlanıyor…</p>
          </div>
        </template>
        <template x-if="room.mode">
          <div>
            <div class="room-code">Oda kodu <b x-text="room.code"></b></div>
            <ul class="room-players">
              <template x-for="p in room.players" :key="p.peer">
                <li><span class="dot" :style="'background:' + p.color"></span><span x-text="p.name"></span><small x-show="p.host">oda sahibi</small></li>
              </template>
            </ul>
            <p class="hint" x-text="room.status"></p>
            <div class="room-actions">
              <button class="btn primary" x-show="room.mode==='host'" @click="roomStart()" :disabled="room.players.length < 2">Maçı başlat</button>
              <button class="btn" @click="roomClose()" x-text="room.mode==='host' ? 'Odayı kapat' : 'Odadan çık'"></button>
            </div>
          </div>
        </template>
      </div>
""")

# Üst bilgi şeridi
rep('  <p class="error" x-show="err"', """  <div class="web-bar">Tarayıcı sürümü · hesabınla her cihazdan gir · <a href="../">Okulunda kur</a> · <a href="https://keremsarpb-web.github.io/">KSB Games</a><button class="web-install" x-show="!standalone" @click="installApp()">📲 Uygulama olarak yükle</button></div>
  <p class="web-tip" x-show="installTip" x-text="installTip" @click="installTip=''" role="status"></p>

  <p class="error" x-show="err\"""")

(WEB / 'index.html').write_text(s, encoding='utf-8')
# Güncelleme kontrolü: oyun version.php okur; burada aynı adlı düz JSON dosyası
(WEB / 'version.php').write_text('{"version": "' + version + '"}', encoding='utf-8')
print('docs/oyna/index.html hazır, sürüm', version)
