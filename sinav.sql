-- Sınava Hazırlık bölümü: 6. sınıf, Türkiye Yüzyılı Maarif Modeli temalarına göre soru bankası
-- database.sql'den sonra içe aktar. Tekrar içe aktarmak güvenlidir: sorular yenilenir.
USE sutun_yarisi;

CREATE TABLE IF NOT EXISTS exam_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject VARCHAR(20) NOT NULL,
  unit VARCHAR(60) NOT NULL,
  text VARCHAR(255) NOT NULL,
  a VARCHAR(100) NOT NULL,
  b VARCHAR(100) NOT NULL,
  c VARCHAR(100) NOT NULL,
  d VARCHAR(100) NOT NULL,
  correct TINYINT NOT NULL, -- 0=a 1=b 2=c 3=d
  explanation VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS exams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  player_id INT NOT NULL,
  subject VARCHAR(20) NOT NULL,
  question_ids TEXT NOT NULL,
  answers TEXT NOT NULL,              -- JSON: soru sırası => seçilen şık
  finished TINYINT NOT NULL DEFAULT 0,
  score INT NOT NULL DEFAULT 0,
  rewarded TINYINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (player_id, created_at)
) ENGINE=InnoDB;

DELETE FROM exam_questions;

INSERT INTO exam_questions (subject, unit, text, a, b, c, d, correct, explanation) VALUES
-- MATEMATİK
('Matematik', 'Sayılar ve Nicelikler: Üslü ifadeler', '3⁴ ifadesinin değeri kaçtır?', '12', '64', '81', '27', 2, '3⁴ = 3 × 3 × 3 × 3 = 81. Üs, tabanın kendisiyle kaç kez çarpılacağını gösterir.'),
('Matematik', 'Sayılar ve Nicelikler: Üslü ifadeler', '2⁵ − 4² işleminin sonucu kaçtır?', '16', '26', '6', '22', 0, '2⁵ = 32 ve 4² = 16. 32 − 16 = 16.'),
('Matematik', 'Sayılar ve Nicelikler: İşlem önceliği', '18 − 12 ÷ 3 × 2 işleminin sonucu kaçtır?', '4', '10', '2', '8', 1, 'Önce bölme ve çarpma soldan sağa: 12 ÷ 3 = 4, 4 × 2 = 8. Sonra 18 − 8 = 10.'),
('Matematik', 'Sayılar ve Nicelikler: Bölünebilme', '4A6 üç basamaklı sayısı 9 ile tam bölünüyorsa A kaçtır?', '2', '5', '8', '9', 2, '9 ile bölünebilme için rakamlar toplamı 9’un katı olmalı: 4 + A + 6 = 18 ise A = 8.'),
('Matematik', 'Sayılar ve Nicelikler: Asal çarpanlar', '60 sayısının asal çarpanları hangileridir?', '2, 3 ve 5', '2, 3, 4 ve 5', '2 ve 5', '3, 4 ve 5', 0, '60 = 2 × 2 × 3 × 5. Asal çarpanlar 2, 3 ve 5’tir. 4 asal değildir.'),
('Matematik', 'Sayılar ve Nicelikler: EBOB', '24 elma ve 36 armut, her tabakta aynı sayıda ve tek tür meyve olacak şekilde en az kaç tabağa konur?', '12', '5', '6', '10', 1, 'EBOB(24, 36) = 12. Tabak başına 12 meyve: 24 ÷ 12 = 2, 36 ÷ 12 = 3, toplam 5 tabak.'),
('Matematik', 'Sayılar ve Nicelikler: EKOK', 'Ali 6 günde, Ayşe 8 günde bir kütüphaneye gidiyor. Bugün birlikte gittiler. En az kaç gün sonra yine birlikte giderler?', '14', '48', '24', '12', 2, 'Ortak gün EKOK(6, 8) = 24 gün sonradır.'),
('Matematik', 'Sayılar ve Nicelikler: Tam sayılar', 'Hava sıcaklığı −4 °C iken 7 °C arttı. Yeni sıcaklık kaç °C’dir?', '3', '−11', '11', '−3', 0, '−4 + 7 = 3. Sayı doğrusunda −4’ten 7 birim sağa gidilir.'),
('Matematik', 'Sayılar ve Nicelikler: Tam sayılar', '(−8) − (−5) işleminin sonucu kaçtır?', '−13', '−3', '3', '13', 1, 'Negatif bir sayıyı çıkarmak, pozitifini eklemektir: −8 + 5 = −3.'),
('Matematik', 'Sayılar ve Nicelikler: Kesirler', '2/5 kesrinin 3/4 ile çarpımı kaçtır?', '5/9', '3/10', '8/15', '6/9', 1, 'Paylar ve paydalar çarpılır: (2 × 3) / (5 × 4) = 6/20 = 3/10.'),
('Matematik', 'Sayılar ve Nicelikler: Kesirler', '240 sayfalık bir kitabın 3/8’ini okudum. Kaç sayfa okudum?', '80', '30', '120', '90', 3, '240 ÷ 8 = 30, 30 × 3 = 90 sayfa.'),
('Matematik', 'Sayılar ve Nicelikler: Ondalık gösterim', '2,5 + 1,75 işleminin sonucu kaçtır?', '4,25', '3,30', '4,30', '3,75', 0, 'Virgüller alt alta gelecek şekilde toplanır: 2,50 + 1,75 = 4,25.'),
('Matematik', 'Sayılar ve Nicelikler: Oran', 'Bir tarifte 2 bardak una 3 yumurta kullanılıyor. 6 bardak un için kaç yumurta gerekir?', '6', '12', '9', '18', 2, 'Un 3 katına çıktı (2 → 6), yumurta da 3 katı olur: 3 × 3 = 9.'),
('Matematik', 'İşlemlerle Cebirsel Düşünme', 'a = 3 için 4a + 2 ifadesinin değeri kaçtır?', '9', '14', '12', '20', 1, '4 × 3 + 2 = 12 + 2 = 14.'),
('Matematik', 'Geometrik Şekiller: Açılar', 'Bir doğru üzerindeki iki komşu açıdan biri 65° ise diğeri kaç derecedir?', '25', '65', '105', '115', 3, 'Doğru üzerindeki komşu açılar bütünlerdir, toplamları 180°: 180 − 65 = 115.'),
('Matematik', 'Geometrik Nicelikler: Alan', 'Kenarları 9 cm ve 4 cm olan dikdörtgenin alanı kaç cm²’dir?', '36', '26', '13', '18', 0, 'Dikdörtgenin alanı = uzun kenar × kısa kenar = 9 × 4 = 36 cm².'),
('Matematik', 'İstatistiksel Araştırma Süreci', '5, 7, 7, 9, 12 veri grubunun açıklığı kaçtır?', '7', '5', '8', '12', 0, 'Açıklık = en büyük değer − en küçük değer = 12 − 5 = 7.'),

-- FEN BİLİMLERİ
('Fen Bilimleri', 'Güneş Sistemi ve Tutulmalar', 'Halkalarıyla bilinen, Güneş sisteminin en büyük ikinci gezegeni hangisidir?', 'Jüpiter', 'Satürn', 'Uranüs', 'Mars', 1, 'Satürn belirgin halkalarıyla bilinir ve Jüpiter’den sonra en büyük gezegendir.'),
('Fen Bilimleri', 'Güneş Sistemi ve Tutulmalar', 'Hangisi iç gezegenlerden biridir?', 'Jüpiter', 'Neptün', 'Mars', 'Satürn', 2, 'İç gezegenler Merkür, Venüs, Dünya ve Mars’tır. Asteroit kuşağının içinde kalırlar.'),
('Fen Bilimleri', 'Güneş Sistemi ve Tutulmalar', 'Güneş tutulması Ay’ın hangi evresinde gerçekleşir?', 'Yeni Ay', 'İlk dördün', 'Dolunay', 'Son dördün', 0, 'Güneş tutulmasında Ay, Güneş ile Dünya arasına girer. Bu sırada Ay yeni Ay evresindedir.'),
('Fen Bilimleri', 'Güneş Sistemi ve Tutulmalar', 'Ay tutulmasında gök cisimlerinin sıralanışı nasıldır?', 'Güneş – Ay – Dünya', 'Güneş – Dünya – Ay', 'Dünya – Güneş – Ay', 'Ay – Güneş – Dünya', 1, 'Ay tutulmasında Dünya, Güneş ile Ay arasına girer ve gölgesi Ay’ın üzerine düşer.'),
('Fen Bilimleri', 'Kuvvetin Etkisinde Hareket', 'Bir cisme etki eden kuvvetlerin bileşkesi sıfırsa ne söylenebilir?', 'Mutlaka hızlanır', 'Yön değiştirir', 'Dengelenmiş kuvvetlerin etkisindedir', 'Şekli bozulur', 2, 'Bileşke kuvvet sıfırsa kuvvetler dengelenmiştir. Duran cisim durur, hareketli cisim sabit süratle gider.'),
('Fen Bilimleri', 'Kuvvetin Etkisinde Hareket', 'Sabit süratle 3 saatte 180 km yol alan aracın sürati kaç km/h’tir?', '540', '60', '90', '183', 1, 'Sürat = alınan yol ÷ geçen süre = 180 ÷ 3 = 60 km/h.'),
('Fen Bilimleri', 'Kuvvetin Etkisinde Hareket', '20 m/s sabit süratle giden bir bisikletli 10 saniyede kaç metre yol alır?', '2', '30', '10', '200', 3, 'Yol = sürat × zaman = 20 × 10 = 200 m.'),
('Fen Bilimleri', 'Canlılarda Sistemler', 'Hangisi destek ve hareket sisteminin bir parçasıdır?', 'Kas', 'Böbrek', 'Mide', 'Akciğer', 0, 'Destek ve hareket sistemi iskelet (kemikler, eklemler) ve kaslardan oluşur.'),
('Fen Bilimleri', 'Canlılarda Sistemler', 'Karbonhidratların kimyasal sindirimi nerede başlar?', 'Mide', 'Ağız', 'İnce bağırsak', 'Yemek borusu', 1, 'Tükürükteki enzim, ağızda karbonhidratların kimyasal sindirimini başlatır.'),
('Fen Bilimleri', 'Canlılarda Sistemler', 'Büyük kan dolaşımı kalbin hangi bölümünden başlar?', 'Sağ kulakçık', 'Sağ karıncık', 'Sol karıncık', 'Sol kulakçık', 2, 'Temiz kan sol karıncıktan aort atardamarı ile tüm vücuda pompalanır.'),
('Fen Bilimleri', 'Canlılarda Sistemler', 'Hangisi boşaltım sistemine yardımcı organlardan biri değildir?', 'Böbrek', 'Akciğer', 'Deri', 'Mide', 3, 'Böbrek idrarla, akciğer karbondioksitle, deri terle atık atar. Mide sindirim organıdır.'),
('Fen Bilimleri', 'Maddenin Ayırt Edici Özellikleri', 'Yoğunluğu 0,9 g/cm³ olan bir cisim suya (1 g/cm³) konursa ne olur?', 'Yüzer', 'Batar', 'Çözünür', 'Erir', 0, 'Yoğunluğu sudan küçük olan cisimler suda yüzer.'),
('Fen Bilimleri', 'Maddenin Ayırt Edici Özellikleri', 'Hacmi 50 cm³, yoğunluğu 3 g/cm³ olan cismin kütlesi kaç gramdır?', '53', '17', '150', '47', 2, 'Kütle = yoğunluk × hacim = 3 × 50 = 150 g.'),
('Fen Bilimleri', 'Işığın Yansıması', 'Düz aynaya gelme açısı 30° olan ışının yansıma açısı kaç derecedir?', '60', '30', '90', '15', 1, 'Yansıma kanununa göre gelme açısı yansıma açısına eşittir.'),
('Fen Bilimleri', 'Işığın Yansıması', 'Pürüzlü yüzeylerde gerçekleşen yansımaya ne ad verilir?', 'Düzgün yansıma', 'Kırılma', 'Dağınık yansıma', 'Soğurma', 2, 'Pürüzlü yüzeye paralel gelen ışınlar farklı yönlere yansır. Buna dağınık yansıma denir.'),
('Fen Bilimleri', 'Ses ve Özellikleri', 'Sesin yayılabilmesi için ne gerekir?', 'Maddesel ortam', 'Işık', 'Boşluk', 'Elektrik', 0, 'Ses titreşimle yayılır ve bunun için katı, sıvı ya da gaz bir ortam gerekir. Boşlukta yayılmaz.'),
('Fen Bilimleri', 'Elektriğin İletimi', 'Hangisi elektriği iletir?', 'Cam', 'Kauçuk', 'Tahta', 'Grafit', 3, 'Kurşun kalem ucundaki grafit, metal olmamasına rağmen elektriği iletir.'),

-- TÜRKÇE
('Türkçe', 'Okuma: Anlam', '“Kitap okumak insanın hayal dünyasını genişletir, kelime hazinesini zenginleştirir.” Bu cümlede ne anlatılıyor?', 'Kitapların fiyatı', 'Kitap okumanın faydaları', 'Yazarların hayatı', 'Kütüphanelerin önemi', 1, 'Cümle, kitap okumanın kişiye kazandırdıklarını sıralıyor.'),
('Türkçe', 'Söz Varlığı: Deyimler', '“Sınavı geçmek için çok ter döktü.” cümlesindeki deyimin anlamı nedir?', 'Çok çaba harcamak', 'Çok yorulup hastalanmak', 'Hızlı koşmak', 'Sıcaktan bunalmak', 0, '“Ter dökmek” bir iş için çok emek ve çaba harcamak demektir.'),
('Türkçe', 'Söz Sanatları', 'Hangi cümlede abartma sanatı vardır?', 'Kuşlar şarkı söylüyor.', 'Ay gibi parlak bir yüzü var.', 'Sana bin kere söyledim.', 'Rüzgâr kapıyı çaldı.', 2, '“Bin kere” sözü gerçekte olandan çok daha fazlasını anlatır. Bu abartmadır.'),
('Türkçe', 'Sözcükte Anlam', 'Hangisi eş anlamlı sözcük çiftidir?', 'Uzun – kısa', 'Cevap – yanıt', 'Sıcak – soğuk', 'Gece – gündüz', 1, 'Cevap ve yanıt aynı anlama gelir. Diğerleri zıt anlamlıdır.'),
('Türkçe', 'Yapı Bilgisi: Ekler', 'Hangi sözcükte çekim eki vardır?', 'Kalemler', 'Kalemlik', 'Kalemci', 'Kalemsiz', 0, '“-ler” çoğul ekidir ve sözcüğün anlamını değiştirmez. Diğerleri yapım ekiyle yeni sözcük olmuştur.'),
('Türkçe', 'Yapı Bilgisi: Sözcük yapısı', 'Hangisi türemiş bir sözcüktür?', 'Göz', 'Masa', 'Kitap', 'Gözlük', 3, '“Göz” köküne “-lük” yapım eki gelerek yeni bir sözcük türemiştir.'),
('Türkçe', 'Cümle Bilgisi', '“Bu sabah erkenden kalktım.” cümlesinde zaman bildiren sözcük grubu hangisidir?', 'Bu sabah', 'Erkenden kalktım', 'Kalktım', 'Bu', 0, '“Bu sabah” eylemin ne zaman yapıldığını bildirir.'),
('Türkçe', 'Yazım Kuralları', 'Hangi cümlede “de” bağlacının yazımı yanlıştır?', 'Sen de gel.', 'Ali de okudu.', 'Bende geleceğim.', 'O da gülümsedi.', 2, 'Bağlaç olan “de” ayrı yazılır: “Ben de geleceğim.”'),
('Türkçe', 'Noktalama', 'Hangi cümlede kesme işareti doğru kullanılmıştır?', 'Okul’a gittik.', 'Ankara’ya gittik.', 'Kitap’ı aldım.', 'Masa’ya koydu.', 1, 'Kesme işareti özel isimlere gelen ekleri ayırır. Okul, kitap ve masa özel isim değildir.'),
('Türkçe', 'Metin Türleri', 'Hangisi şiir türüne ait bir özelliktir?', 'Paragraf', 'Diyalog', 'Dize ve kıta', 'Dipnot', 2, 'Şiir dizelerden, dizeler de kıtalardan oluşur.'),
('Türkçe', 'Söz Sanatları', '“Gözleri yıldız gibi parlıyordu.” cümlesinde benzetme yönü nedir?', 'Göz', 'Parlaklık', 'Yıldız', 'Gibi', 1, 'Gözler yıldıza parlaklık yönüyle benzetilmiştir.'),
('Türkçe', 'Okuma: Öznel ve nesnel', 'Hangi cümle öznel bir yargı içerir?', 'Türkiye’nin başkenti Ankara’dır.', 'Su 100 °C’de kaynar.', 'Bir yıl 12 aydır.', 'Bu film çok sıkıcıydı.', 3, '“Sıkıcı” kişiden kişiye değişen bir görüştür. Diğerleri kanıtlanabilir bilgilerdir.'),
('Türkçe', 'Sözcük Türleri: Sıfat', '“Kırık kalemle yazmaya çalıştı.” cümlesindeki sıfat hangisidir?', 'Kırık', 'Kalemle', 'Yazmaya', 'Çalıştı', 0, '“Kırık” sözcüğü kalemin nasıl olduğunu bildirir, sıfattır.'),
('Türkçe', 'Söz Varlığı: İkilemeler', 'Hangisi bir ikilemedir?', 'Okul yolu', 'Kara tahta', 'Yavaş yavaş', 'Güzel gün', 2, 'İkileme, anlamı pekiştirmek için sözcüğün tekrarıdır: “yavaş yavaş”.'),
('Türkçe', 'Sözcük Türleri: Zarf', '“Çocuk hızlı koştu.” cümlesindeki “hızlı” sözcüğünün türü nedir?', 'Sıfat', 'Zarf', 'İsim', 'Zamir', 1, '“Hızlı” burada “koşmak” eyleminin nasıl yapıldığını bildirir, durum zarfıdır.'),

-- SOSYAL BİLGİLER
('Sosyal Bilgiler', 'Ortak Mirasımız: İlk Türk devletleri', 'Göktürk Devleti’nin kurucusu kimdir?', 'Bumin Kağan', 'Mete Han', 'Bilge Kağan', 'Attila', 0, 'Göktürk Devleti 552 yılında Bumin Kağan tarafından kuruldu.'),
('Sosyal Bilgiler', 'Ortak Mirasımız: İlk Türk devletleri', 'Asya Hun Devleti’nin en parlak dönemini yaşatan hükümdar kimdir?', 'Teoman', 'Mete Han', 'Kutluk Kağan', 'Alp Arslan', 1, 'Mete Han döneminde Asya Hun Devleti en geniş sınırlarına ulaştı ve onlu sistemle ordu kurdu.'),
('Sosyal Bilgiler', 'Ortak Mirasımız: İlk Türk devletleri', 'Orhun Yazıtları kimler adına diktirilmiştir?', 'Bumin ve İstemi', 'Mete ve Teoman', 'Bilge Kağan, Kül Tigin ve Tonyukuk', 'Alp Arslan ve Melikşah', 2, 'Orhun Yazıtları II. Göktürk Devleti döneminde Bilge Kağan, Kül Tigin ve Tonyukuk adına dikildi.'),
('Sosyal Bilgiler', 'Ortak Mirasımız: İlk Türk devletleri', 'Uygurların yerleşik hayata geçmesinde etkili olan din hangisidir?', 'İslamiyet', 'Şamanizm', 'Gök Tanrı inancı', 'Maniheizm', 3, 'Maniheizm hayvan eti yemeyi yasakladığı için Uygurlar tarıma ve yerleşik hayata yöneldi.'),
('Sosyal Bilgiler', 'Ortak Mirasımız: Türk-İslam devletleri', '751 Talas Savaşı kimler arasında yapılmıştır?', 'Abbasiler ile Çinliler', 'Bizans ile Selçuklular', 'Göktürkler ile Çinliler', 'Hunlar ile Romalılar', 0, 'Talas’ta Abbasiler ile Çinliler savaştı. Karluk Türkleri Abbasileri destekledi ve Türklerin İslam’a geçişi hızlandı.'),
('Sosyal Bilgiler', 'Ortak Mirasımız: Türk-İslam devletleri', 'Gazneliler’in en ünlü hükümdarı kimdir?', 'Satuk Buğra Han', 'Gazneli Mahmut', 'Tuğrul Bey', 'Alp Arslan', 1, 'Gazneli Mahmut, Hindistan seferleriyle tanınır ve “sultan” unvanını kullanan ilk Türk hükümdarıdır.'),
('Sosyal Bilgiler', 'Evimiz Dünya: Konum', 'Türkiye 36°–42° kuzey paralelleri arasındadır. Bunun bir sonucu nedir?', 'Her yerde aynı saat yaşanır', 'Ekvatora çok yakındır', 'Öğle vakti Güneş ışınları hiçbir zaman dik gelmez', 'Kutup iklimi görülür', 2, 'Güneş ışınları yalnızca iki dönence arasında dik gelir. Türkiye bu alanın kuzeyinde kalır.'),
('Sosyal Bilgiler', 'Evimiz Dünya: Konum', 'Hangisi Türkiye’yi çevreleyen denizlerden biri değildir?', 'Karadeniz', 'Ege Denizi', 'Akdeniz', 'Kızıldeniz', 3, 'Türkiye’nin üç yanı Karadeniz, Ege ve Akdeniz ile çevrilidir. Marmara bir iç denizdir.'),
('Sosyal Bilgiler', 'Evimiz Dünya: İklim', 'Karadeniz ikliminin temel özelliği nedir?', 'Her mevsim yağışlıdır', 'Yazları kuraktır', 'Kışları çok soğuk ve kuraktır', 'Yağış yalnızca ilkbaharda düşer', 0, 'Karadeniz ikliminde her mevsim yağış görülür. Bitki örtüsü ormandır.'),
('Sosyal Bilgiler', 'Evimiz Dünya: Konum', 'Ardışık iki meridyen arasındaki yerel saat farkı ne kadardır?', '1 dakika', '4 dakika', '10 dakika', '1 saat', 1, 'Dünya 360 meridyeni 24 saatte döner: 24 × 60 ÷ 360 = 4 dakika.'),
('Sosyal Bilgiler', 'Yaşayan Demokrasimiz', 'Türkiye Büyük Millet Meclisi hangi tarihte açıldı?', '29 Ekim 1923', '19 Mayıs 1919', '23 Nisan 1920', '30 Ağustos 1922', 2, 'TBMM 23 Nisan 1920’de Ankara’da açıldı. Bu gün Ulusal Egemenlik ve Çocuk Bayramı olarak kutlanır.'),
('Sosyal Bilgiler', 'Yaşayan Demokrasimiz', 'Hangisi yargı organının görevidir?', 'Davaları karara bağlamak', 'Kanun yapmak', 'Ülkeyi yönetmek', 'Vergi toplamak', 0, 'Yasama kanun yapar, yürütme uygular, yargı ise bağımsız mahkemeler eliyle davaları karara bağlar.'),
('Sosyal Bilgiler', 'Hayatımızdaki Ekonomi', 'Türkiye’de çay tarımı en çok hangi bölgede yapılır?', 'Ege', 'Karadeniz', 'İç Anadolu', 'Akdeniz', 1, 'Çay bol yağış ister. En çok Doğu Karadeniz’de, özellikle Rize’de yetiştirilir.'),
('Sosyal Bilgiler', 'Hayatımızdaki Ekonomi', 'Hangisi yenilenebilir bir enerji kaynağıdır?', 'Kömür', 'Petrol', 'Doğal gaz', 'Rüzgâr', 3, 'Rüzgâr, Güneş ve su tükenmeyen kaynaklardır. Kömür, petrol ve doğal gaz fosil yakıttır.'),
('Sosyal Bilgiler', 'Yaşayan Demokrasimiz: Haklar', 'Hangisi anayasa ile güvence altına alınan bir haktır?', 'Vergi vermek', 'Askerlik yapmak', 'Eğitim hakkı', 'Trafik kurallarına uymak', 2, 'Eğitim bir haktır. Vergi vermek, askerlik ve kurallara uymak vatandaşlık sorumluluklarıdır.'),

-- İNGİLİZCE
('İngilizce', 'Family Life', 'My mother’s mother is my ___.', 'grandmother', 'aunt', 'sister', 'cousin', 0, 'Annenin annesi “grandmother” yani büyükannedir.'),
('İngilizce', 'Life in the House', 'There ___ two books on the desk.', 'is', 'are', 'am', 'be', 1, 'Çoğul isimlerle “there are” kullanılır.'),
('İngilizce', 'Personal Life', 'I usually ___ breakfast at 7 a.m.', 'has', 'having', 'have', 'haves', 2, '“I” öznesiyle geniş zamanda fiil yalın kullanılır: I have.'),
('İngilizce', 'Life in the House', 'Where is the cat? – It’s ___ the table. (masanın altında)', 'at', 'of', 'from', 'under', 3, '“Under” altında demektir.'),
('İngilizce', 'School Life', 'What time is it? (08:30)', 'It’s half past eight.', 'It’s eight o’clock.', 'It’s quarter to eight.', 'It’s half past nine.', 0, '“Half past eight” sekizi yarım geçiyor, yani 08:30 demektir.'),
('İngilizce', 'Life in the Neighbourhood', 'He ___ a doctor. He works at a hospital.', 'am', 'is', 'are', 'be', 1, '“He / She / It” ile “is” kullanılır.'),
('İngilizce', 'Life in the World', 'Yesterday it ___ sunny.', 'is', 'were', 'was', 'are', 2, 'Geçmiş zamanda “it” ile “was” kullanılır.'),
('İngilizce', 'Personal Life', 'Which one is a fruit?', 'carrot', 'cheese', 'bread', 'banana', 3, 'Banana (muz) bir meyvedir. Carrot havuçtur.'),
('İngilizce', 'Classroom Life', 'Can you help me? – ___', 'Sure!', 'Goodbye!', 'I’m eleven.', 'It’s Monday.', 0, 'Yardım isteğine “Sure!” (Tabii!) diye cevap verilir.'),
('İngilizce', 'Life in the Neighbourhood', 'What is the opposite of “cheap”?', 'old', 'expensive', 'small', 'slow', 1, '“Cheap” ucuz, “expensive” pahalı demektir.'),
('İngilizce', 'Life in the Neighbourhood', '“Kütüphane” İngilizcede hangisidir?', 'bakery', 'pharmacy', 'library', 'museum', 2, 'Library kütüphane, bakery fırın, pharmacy eczanedir.'),
('İngilizce', 'Personal Life', 'She ___ playing chess every weekend.', 'likes', 'like', 'liking', 'to like', 0, '“She” öznesiyle geniş zamanda fiile -s gelir: likes.'),
('İngilizce', 'Life in Nature', 'We should ___ water to protect nature.', 'waste', 'throw', 'pollute', 'save', 3, '“Save water” su tasarrufu yapmak demektir.'),
('İngilizce', 'Personal Life', 'I was born ___ 2014.', 'on', 'in', 'at', 'to', 1, 'Yıllardan önce “in” kullanılır: in 2014.'),
('İngilizce', 'Personal Life', 'How often do you read books? – ___', 'In the kitchen.', 'With my friend.', 'Every day.', 'Ten books.', 2, '“How often” ne sıklıkla demektir. Cevap sıklık bildirir: every day.');
