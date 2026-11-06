// Tarayıcı sürümünü (docs/oyna) uygulamanın içine (www) kopyalar.
// Uygulama oyunun bütün dosyalarını içinde taşır; yalnızca hesap/kayıt (Firebase) ve online odalar internet kullanır.
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'docs', 'oyna');
const dst = path.join(__dirname, 'www');
// Uygulamada gerek olmayanlar: servis çalışanı ve web'e kurulum dosyası
const SKIP = new Set(['sw.js', 'manifest.json']);

fs.rmSync(dst, { recursive: true, force: true });
fs.mkdirSync(dst, { recursive: true });
fs.cpSync(src, dst, { recursive: true, filter: p => !SKIP.has(path.basename(p)) });

// Uygulamada web kurulum bağlantısı (manifest) olmasın
const index = path.join(dst, 'index.html');
fs.writeFileSync(index, fs.readFileSync(index, 'utf8').replace(/<link rel="manifest"[^>]*>\s*/, ''));
console.log('www hazır:', fs.readdirSync(dst).length, 'dosya/klasör');
