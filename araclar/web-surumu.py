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
rep('<link rel="manifest" href="manifest.json">\n', '')
rep('<title>Sütun Yarışı</title>', '<title>Sütun Yarışı – Tarayıcıda oyna</title>\n<link rel="canonical" href="https://keremsarpb-web.github.io/ksb-sutun-yarisi/oyna/">')
# Yerel sunucu, oyun kodundan sonra ve Alpine başlamadan yüklenir
rep(f'<script src="char3d.js?v={version}"></script>',
    f'<script src="char3d.js?v={version}"></script>\n<script src="matematik.js?v={version}"></script>\n<script src="server.js?v={version}"></script>\n<script src="web.js?v={version}"></script>\n<link rel="stylesheet" href="web.css?v={version}">')

# Giriş: tek sekme, şifresiz oyuncu oluşturma
rep("""<h2 x-text="authTab==='student' ? 'Kendi hesabını aç' : 'Sınıfını kaydet'"></h2>""",
    """<h2>Oyuncu oluştur</h2>
    <p class="hint">Hiçbir şey indirmeden oyna. İlerlemen bu cihazda, bu tarayıcıda kaydedilir.</p>""")
rep('<label for="name">Sınıf adı</label>', '<label for="name">Adın</label>')
rep('<input id="name" maxlength="16" x-model="form.name" placeholder="ör. 6-A" autocomplete="username">',
    '<input id="name" maxlength="20" x-model="form.name" placeholder="ör. Ali" autocomplete="nickname">')
s, n = re.subn(r'\n    <div class="pair">\n      <div>\n        <label for="reg-pass".*?\n    </div>\n    <p class="hint" x-show="authTab===.register.">.*?</p>\n    <p class="hint" x-show="authTab===.student.">.*?</p>\n', '\n', s, flags=re.S)
assert n == 1, 'şifre alanları'
rep("""x-text="authTab==='student' ? 'Hesabımı aç' : 'Sınıfı kaydet'\"""", 'x-text="\'Oyna!\'"')
rep('Yeni açılan her hesaba hediye olarak 1 Mystery Box verilir.', 'Hediye olarak 1 Mystery Box ile başlarsın.')

# Lobi metinleri
rep('<p>2–5 oyuncu, 10 soru. ', '<p>Bilgisayar oyuncularına karşı 2–5 kişilik maç, 10 soru. ')

# Üst bilgi şeridi
rep('  <p class="error" x-show="err"', """  <div class="web-bar">Tarayıcı sürümü · ilerlemen bu cihazda kaydedilir · <a href="../">Okulunda kur</a> · <a href="https://keremsarpb-web.github.io/">KSB Games</a></div>

  <p class="error" x-show="err\"""")

(WEB / 'index.html').write_text(s, encoding='utf-8')
print('docs/oyna/index.html hazır, sürüm', version)
