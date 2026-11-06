# Sütun Yarışı – App Store ve Google Play rehberi

Bu klasör, oyunun telefon uygulamasıdır (Capacitor 7, iOS + Android). Oyunun bütün dosyaları uygulamanın içindedir; internet yalnızca hesap/kayıt (Firebase) ve online odalar için kullanılır.

- Uygulama kimliği (Bundle ID / Package): `com.ksbgames.sutunyarisi`
- Sürüm: 1.9.4
- Gizlilik politikası: https://keremsarpb-web.github.io/ksb-sutun-yarisi/gizlilik.html
- Destek: https://keremsarpb-web.github.io/ksb-sutun-yarisi/destek.html

## Apple'ın sık reddetme sebepleri ve uygulamadaki karşılıkları

| Kural | Uygulamada |
|---|---|
| 5.1.1(v) Hesap açılabiliyorsa uygulama içinden silinebilmeli | Lobi → ⚙️ Hesap ayarları → Hesabımı kalıcı olarak sil |
| 1.2 Kullanıcı içeriği: filtre, şikayet, engelleme, iletişim | Uygunsuz ad filtresi; Köyüm → 👀 Köy gez → 🚩 Şikayet et / 🚫 Engelle; destek sayfası |
| 3.1.1 Loot box olasılıkları gösterilmeli | Mağaza → 📊 Kutu olasılıkları (gerçek parayla satış yok) |
| 4.2 Yalnızca web sitesini açan uygulama olmamalı | Oyun dosyaları uygulamanın içinde; 3D köy, maçlar, sınavlar cihazda çalışır |
| 5.1.1 Gizlilik politikası | Uygulamada ve mağaza sayfasında bağlantı |
| 2.3 Dış indirme bağlantısı olmamalı | Uygulama içinde web şeridi ve indirme bağlantıları gizli |

Bunlar bilinen sebepleri giderir ama kabul **garanti edilemez**; son kararı Apple'ın inceleme ekibi verir.

## 1. Senin yapman gerekenler

1. **Apple Developer Program** üyeliği: https://developer.apple.com/programs/ (yıllık 99 USD). Üyelik için 18 yaşından büyük olmak gerekir; değilsen bir veli ya da okul adına açılmalı.
2. **App Store Connect** → Uygulamalarım → **+ Yeni uygulama**: Platform iOS, ad **Sütun Yarışı**, dil Türkçe, Bundle ID `com.ksbgames.sutunyarisi`, SKU `sutun-yarisi`.
3. **İnceleme hesabı:** Apple girişli uygulamalar için deneme hesabı ister. Online sürümde (https://keremsarpb-web.github.io/ksb-sutun-yarisi/oyna/):
   - "Yeni sınıf kaydet" ile `INCELEME` sınıfını aç (şifre: kendin belirle),
   - "Öğrenci hesabı aç" ile bu sınıfa `apple.review` kullanıcı adlı bir öğrenci aç.
   Bu bilgileri aşağıdaki inceleme notuna yaz.

## 2. Mac olmadan derleme (Codemagic)

1. https://codemagic.io adresine GitHub hesabınla gir, `ksb-sutun-yarisi` deposunu ekle.
2. App Store Connect → Kullanıcılar ve Erişim → **Entegrasyonlar → App Store Connect API** → anahtar oluştur (rol: App Manager). Anahtarı (.p8), Issuer ID ve Key ID'yi Codemagic → Teams → Integrations → **App Store Connect** bölümüne `KSB Games App Store Connect` adıyla ekle.
3. Codemagic depodaki `codemagic.yaml` dosyasını görür: **ios-app-store** iş akışını başlat. Sertifika ve profil otomatik oluşturulur, derlenen uygulama **TestFlight**'a yüklenir.
4. TestFlight'ta kendi iPhone'unda dene, sonra App Store Connect'te bu derlemeyi seçip **İncelemeye gönder**.

Mac'in varsa: `cd mobil && npm ci && npm run sync && npx cap open ios`, Xcode'da Signing'de takımını seç, **Product → Archive → Distribute App**.

## 3. Mağaza metinleri (App Store Connect → Uygulama bilgileri)

- **Ad:** Sütun Yarışı
- **Alt başlık:** 6. Sınıf Bilgi Yarışması
- **Kategori:** Eğitim (ikincil: Oyunlar → Bilgi Yarışması)
- **Tanıtım metni:** Sınıfınla yarış: doğru bilen sütununda yükselir, yanlış bilen düşer! Sınava hazırlan, coin kazan, köyünü kur.
- **Açıklama:**

  Sütun Yarışı, 6. sınıf öğrencileri için Maarif Modeli müfredatına uygun bir bilgi yarışmasıdır.

  • Turnuva maçı: 2–5 kişilik maçlarda doğru bilen karakterin sütununda yükselir, yanlış bilen düşer. En yüksekte kalan kazanır.
  • Arkadaşlarla oyna: oda kur, kodu paylaş, arkadaşlarınla aynı maçta yarış.
  • Sınava Hazırlık: Matematik, Fen Bilimleri, Türkçe, Sosyal Bilgiler ve İngilizceden 37 konu; test, doğru-yanlış ve eşleştirme etkinlikleri. Her seferinde farklı sorular, her sorudan sonra açıklama.
  • Köyüm: oynayarak kazandığın coinlerle kendi köyünü kur; evler, dükkanlar, fırınlar, okullar… Herkes aynı 3D dünyada, diğer köyleri gez.
  • Low poly 3D karakterler, şapkalar, auralar ve emote'lar.

  Reklam yok, gerçek parayla satış yok. Coin ve kutular yalnızca oynayarak kazanılır.

- **Anahtar kelimeler (100 karakter):** `6. sınıf,bilgi yarışması,sınav,test,matematik,fen,türkçe,ingilizce,eğitim,okul,quiz,maarif`
- **Destek URL'si:** https://keremsarpb-web.github.io/ksb-sutun-yarisi/destek.html
- **Pazarlama URL'si:** https://keremsarpb-web.github.io/ksb-sutun-yarisi/
- **Gizlilik politikası URL'si:** https://keremsarpb-web.github.io/ksb-sutun-yarisi/gizlilik.html
- **Telif:** © 2026 KSB Games

## 4. Gizlilik etiketi (App Privacy)

- **Takip (tracking):** Hayır.
- **Toplanan veriler:**
  - *Tanımlayıcılar → Kullanıcı kimliği:* Kullanıcıya bağlı, amaç: Uygulama işlevselliği.
  - *Kullanıcı içeriği → Oyun içeriği / Diğer kullanıcı içeriği* (ad, sınıf, köy, ilerleme): Kullanıcıya bağlı, amaç: Uygulama işlevselliği.
- E-posta, telefon, konum, kişiler, fotoğraf, reklam verisi, analiz verisi **toplanmaz**.

## 5. Yaş derecelendirmesi

Şiddet, korku, kumar (gerçek para), uygunsuz içerik: **Yok**. Kullanıcı içeriği/etkileşim: **Var** (adlar ve köyler diğer oyunculara görünür; filtre, şikayet ve engelleme mevcut). Rastgele ödüllü kutular: **Var, gerçek parayla satın alınmaz**. Kids kategorisine **girme** (çocuklar için uygun ama Kids kategorisinin ek kuralları gerekmez).

## 6. İnceleme notu (App Review Information → Notes)

> Sütun Yarışı is an educational quiz game for 6th-grade students (Turkish curriculum). Demo account: class "INCELEME", student username "apple.review", password: ______ (log in on the "Giriş yap" tab with the username and password).
> Account deletion: Lobby → scroll to the bottom → "⚙️ Hesap ayarları" → "Hesabımı kalıcı olarak sil".
> Reporting/blocking: Lobby → "Köyüm" → "👀 Köy gez" → choose a village → "🚩 Şikayet et" / "🚫 Engelle". Offensive names are filtered at sign-up.
> Mystery Boxes are earned only with in-game coins earned by playing; there are no in-app purchases. Odds are shown under "📊 Kutu olasılıkları".
> Online rooms ("Arkadaşlarla oyna") need a second device with the room code; bot matches work alone ("Rastgele maç bul").

## 7. Ekran görüntüleri

App Store Connect en az şunları ister: **iPhone 6,9"** (1320×2868) ve uygulama iPad'de de çalıştığı için **iPad 13"** (2064×2752). Lobi, maç, sınav (eşleştirme), Köyüm ve kozmetik ekranlarından 3–5 görüntü yeterli.

## Android (Samsung) – Google Play

- GitHub Actions (`.github/workflows/mobil.yml`) her güncellemede **Android APK** derler; işin "Artifacts" bölümünden indirilip telefona kurulabilir (Ayarlar'da "bilinmeyen kaynaklar"a izin gerekir).
- Google Play'e göndermek için: Play Console hesabı (tek seferlik 25 USD), imzalı AAB (`./gradlew bundleRelease` + kendi anahtarın), aynı gizlilik politikası ve veri güvenliği formu (yukarıdaki gizlilik etiketiyle aynı cevaplar).
