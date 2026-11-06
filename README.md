# Sütun Yarışı

Okullar için 6. sınıf bilgi yarışması. 2–5 oyuncu rastgele eşleşir. Doğru cevap veren, karakteriyle sütununda yükselir; yanlış cevap veren sütundan düşer. En yüksekte kalan kazanır ve Mystery Box alır.

*made by KSB Games*

## Özellikler

- **Turnuva maçı:** 2–5 oyunculu rastgele eşleşme, 10 soru, 3 can.
- **Sınava Hazırlık:** Maarif Modeli 6. sınıf müfredatından 5 ders ve 37 konu.
  - Konu seçilerek çalışılır. Etkinlik türleri: test, doğru-yanlış, eşleştirme.
  - Her seferinde farklı sorular gelir. Matematik soruları her seferinde yeni sayılarla üretilir.
- **Hesaplar:** sınıf hesapları, öğrenci hesapları (sınıf şifresiyle katılır) ve öğretmen paneli.
- **Ödüller:**
  - Low poly 3D karakterler; şapka, aura, emote ve gövde kozmetikleri.
  - Coin sistemi; aura değerine göre coin bonusu.
  - 3 tür Mystery Box ve 2 çark.
- **Öğretmen paneli:**
  - Sınıf ve öğrenci istatistikleri.
  - Şifre sıfırlama.
  - Adil kura çekme (her ismin şansı eşit).
- PWA olarak yüklenebilir; güncellemeleri kendisi bildirir.

## İndir ya da indirmeden oyna

- **Tarayıcıda oyna:** https://keremsarpb-web.github.io/ksb-sutun-yarisi/oyna/ (telefon ve bilgisayar; uygulama olarak yüklenebilir)
- **Okul sürümü, kurulumsuz (Windows):** [SutunYarisi-Okul-v1.9.1.zip](https://github.com/keremsarpb-web/ksb-sutun-yarisi/releases/download/v1.9.1/SutunYarisi-Okul-v1.9.1.zip). Çıkar, `BASLAT.bat`'a çift tıkla; ilk iş `OGRETMEN-SIFRE.bat` ile öğretmen şifresini belirle.

## Kurulum (XAMPP)

> Oyun PHP ve MySQL ile çalışır. Bu yüzden GitHub Pages gibi düz HTML barındıran yerlerde çalışmaz. Kendi bilgisayarınızda ya da okul sunucusunda çalıştırın.

1. [XAMPP](https://www.apachefriends.org/) kurun. Apache ve MySQL'i başlatın.
2. Bu depoyu `C:\xampp\htdocs\sutun-yarisi` klasörüne indirin.
3. phpMyAdmin'de ya da komut satırında önce `database.sql`, sonra `sinav.sql` dosyasını içe aktarın:
   ```bash
   mysql -u root < database.sql
   mysql -u root < sinav.sql
   ```
4. Tarayıcıda `http://localhost/sutun-yarisi/` adresini açın.
5. Aynı ağdaki tahta, tablet ve telefonlar bilgisayarın IP adresiyle bağlanabilir (ör. `http://192.168.1.20/sutun-yarisi/`).

Veritabanı bilgileri `config.php` dosyasındadır (XAMPP varsayılanı: `root`, boş şifre). Yeni sürümler eski veritabanını ilk açılışta kendiliğinden günceller.

## Öğretmen hesabı

`database.sql` bir öğretmen hesabı oluşturmaz. Bir hesabı öğretmen yapmak için:

```sql
UPDATE players SET role = 'teacher' WHERE name = 'Hesap Adı';
```

## Teknik

- PHP 8.2 (PDO), MySQL/MariaDB
- Alpine.js 3.14.1, Three.js 0.149.0 (`vendor/` içinde, internetsiz çalışır)
