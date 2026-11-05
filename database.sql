-- Sütun Yarışı veritabanı (6. sınıf müfredatı soruları)
-- phpMyAdmin'de "İçe Aktar" ile ya da: mysql -u root < database.sql
-- Tekrar içe aktarmak güvenlidir: tablolar korunur, sorular yenilenir.
-- Sınava Hazırlık soruları için bundan sonra sinav.sql dosyasını da içe aktar.

CREATE DATABASE IF NOT EXISTS sutun_yarisi CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci;
USE sutun_yarisi;

CREATE TABLE IF NOT EXISTS players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token CHAR(32) NOT NULL UNIQUE,
  name VARCHAR(20) NOT NULL UNIQUE,          -- sınıf adı (ör. 6-A)
  password_hash VARCHAR(255) NOT NULL DEFAULT '',
  role VARCHAR(10) NOT NULL DEFAULT 'class',  -- class | teacher
  color VARCHAR(7) NOT NULL DEFAULT '#4dabf7',
  shape VARCHAR(10) NOT NULL DEFAULT 'round',
  eyes VARCHAR(10) NOT NULL DEFAULT 'normal',
  mouth VARCHAR(10) NOT NULL DEFAULT 'smile',
  hat VARCHAR(20) NOT NULL DEFAULT '',
  aura VARCHAR(20) NOT NULL DEFAULT '',
  wins INT NOT NULL DEFAULT 0,
  games INT NOT NULL DEFAULT 0,
  current_match_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Mystery box ve kozmetikler (item_type: box | hat | aura)
CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  player_id INT NOT NULL,
  item_type VARCHAR(10) NOT NULL,
  item_key VARCHAR(20) NOT NULL DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (player_id)
) ENGINE=InnoDB;

-- Rastgele maç bulma kuyruğu (zamanlar milisaniye)
CREATE TABLE IF NOT EXISTS queue (
  player_id INT PRIMARY KEY,
  joined_at BIGINT NOT NULL,
  last_ping BIGINT NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_ids TEXT NOT NULL,
  q_index INT NOT NULL DEFAULT 0,
  phase VARCHAR(10) NOT NULL DEFAULT 'countdown', -- countdown | question | reveal | finished
  phase_ends_at BIGINT NOT NULL,
  winner_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS match_players (
  match_id INT NOT NULL,
  player_id INT NOT NULL,
  height INT NOT NULL DEFAULT 0,
  lives INT NOT NULL DEFAULT 3,
  alive TINYINT NOT NULL DEFAULT 1,
  last_result VARCHAR(10) NOT NULL DEFAULT 'none', -- correct | wrong | timeout
  result_q INT NOT NULL DEFAULT -1,
  emote VARCHAR(16) NOT NULL DEFAULT '',
  emote_at BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (match_id, player_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS answers (
  match_id INT NOT NULL,
  player_id INT NOT NULL,
  q_index INT NOT NULL,
  choice TINYINT NOT NULL,
  correct TINYINT NOT NULL,
  PRIMARY KEY (match_id, player_id, q_index)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(20) NOT NULL,
  text VARCHAR(255) NOT NULL,
  a VARCHAR(100) NOT NULL,
  b VARCHAR(100) NOT NULL,
  c VARCHAR(100) NOT NULL,
  d VARCHAR(100) NOT NULL,
  correct TINYINT NOT NULL -- 0=a 1=b 2=c 3=d
) ENGINE=InnoDB;

DELETE FROM questions;

INSERT INTO questions (category, text, a, b, c, d, correct) VALUES
-- MATEMATİK: doğal sayılar, üslü ifadeler, işlem önceliği, çarpanlar ve katlar, bölünebilme, EBOB-EKOK, kümeler
('Matematik', '2⁴ ifadesinin değeri kaçtır?', '6', '8', '16', '32', 2),
('Matematik', '5³ ifadesinin değeri kaçtır?', '15', '125', '25', '53', 1),
('Matematik', '10³ ifadesinin değeri kaçtır?', '30', '100', '1000', '13', 2),
('Matematik', '3 + 4 × 2 işleminin sonucu kaçtır?', '14', '11', '10', '24', 1),
('Matematik', '(8 − 3) × 2 + 6 ÷ 3 işleminin sonucu kaçtır?', '12', '10', '16', '8', 0),
('Matematik', 'Hangisi 36’nın çarpanı değildir?', '4', '9', '12', '8', 3),
('Matematik', 'Hangisi asal sayıdır?', '1', '9', '17', '21', 2),
('Matematik', '24 ve 36 sayılarının EBOB’u kaçtır?', '6', '12', '72', '4', 1),
('Matematik', '6 ve 8 sayılarının EKOK’u kaçtır?', '48', '2', '24', '14', 2),
('Matematik', 'Hangi sayı 3 ile kalansız bölünür?', '124', '251', '412', '213', 3),
('Matematik', 'Hangi sayı 5 ile kalansız bölünür?', '1352', '2470', '3333', '4441', 1),
('Matematik', 'A = {1, 2, 3, 4} kümesinin eleman sayısı kaçtır?', '3', '4', '5', '10', 1),
-- tam sayılar
('Matematik', '(−7) + (+3) işleminin sonucu kaçtır?', '−4', '4', '−10', '10', 0),
('Matematik', 'Hangisi en küçük tam sayıdır?', '−2', '0', '−9', '3', 2),
('Matematik', '|−15| ifadesinin değeri kaçtır?', '−15', '0', '15', '1', 2),
-- kesirler ve ondalık gösterim
('Matematik', '2/3 + 1/6 işleminin sonucu kaçtır?', '3/9', '5/6', '1/2', '3/6', 1),
('Matematik', '3/4 × 8 işleminin sonucu kaçtır?', '6', '32/3', '11/4', '3/32', 0),
('Matematik', '1/2 ÷ 1/4 işleminin sonucu kaçtır?', '1/8', '2', '1/2', '4', 1),
('Matematik', '0,4 × 0,2 işleminin sonucu kaçtır?', '0,8', '0,08', '0,6', '8', 1),
('Matematik', '3,75 sayısında onda birler basamağındaki rakam kaçtır?', '3', '7', '5', '0', 1),
-- oran, cebirsel ifadeler, veri
('Matematik', 'Bir sınıfta 12 kız, 18 erkek öğrenci var. Kızların erkeklere oranı nedir?', '2/3', '3/2', '12/30', '1/2', 0),
('Matematik', '"Bir sayının 3 katının 5 fazlası" ifadesi hangisidir?', '3x + 5', '5x + 3', '3(x + 5)', 'x + 8', 0),
('Matematik', 'x = 4 için 2x − 3 ifadesinin değeri kaçtır?', '5', '11', '8', '1', 0),
('Matematik', '4, 8, 6 ve 2 sayılarının aritmetik ortalaması kaçtır?', '4', '5', '6', '20', 1),
-- geometri ve ölçme
('Matematik', 'Dik açı kaç derecedir?', '45', '180', '90', '360', 2),
('Matematik', 'Doğru açı kaç derecedir?', '90', '180', '270', '360', 1),
('Matematik', 'Tümler iki açıdan biri 35° ise diğeri kaç derecedir?', '145', '65', '55', '45', 2),
('Matematik', 'Bütünler iki açıdan biri 120° ise diğeri kaç derecedir?', '60', '30', '240', '80', 0),
('Matematik', 'Tabanı 10 cm, yüksekliği 6 cm olan üçgenin alanı kaç cm²’dir?', '60', '30', '16', '32', 1),
('Matematik', 'Tabanı 8 cm, yüksekliği 5 cm olan paralelkenarın alanı kaç cm²’dir?', '13', '20', '40', '26', 2),
('Matematik', '1 m² kaç cm²’dir?', '100', '1000', '10 000', '10', 2),
('Matematik', 'Yarıçapı 5 cm olan çemberin çapı kaç cm’dir?', '10', '25', '2,5', '15', 0),
('Matematik', '1 dm³ kaç litredir?', '10', '100', '0,1', '1', 3),

-- FEN BİLİMLERİ: Güneş sistemi ve tutulmalar, vücudumuzdaki sistemler, kuvvet ve hareket, madde ve ısı, ses, elektrik
('Fen Bilimleri', 'Güneş tutulmasında Güneş ile Dünya’nın arasına hangisi girer?', 'Ay', 'Mars', 'Venüs', 'Jüpiter', 0),
('Fen Bilimleri', 'Ay tutulması Ay’ın hangi evresinde gerçekleşir?', 'Yeni Ay', 'İlk dördün', 'Dolunay', 'Son dördün', 2),
('Fen Bilimleri', 'Güneş’e en yakın gezegen hangisidir?', 'Venüs', 'Merkür', 'Mars', 'Dünya', 1),
('Fen Bilimleri', 'Vücudumuzdaki en uzun kemik hangisidir?', 'Kaval kemiği', 'Uyluk kemiği', 'Kol kemiği', 'Köprücük kemiği', 1),
('Fen Bilimleri', 'Sindirilen besinler en çok hangi organda kana geçer?', 'Mide', 'Yemek borusu', 'İnce bağırsak', 'Kalın bağırsak', 2),
('Fen Bilimleri', 'Kanı vücuda pompalayan organ hangisidir?', 'Akciğer', 'Kalp', 'Böbrek', 'Karaciğer', 1),
('Fen Bilimleri', 'Kanda oksijen taşıyan hücre hangisidir?', 'Akyuvar', 'Alyuvar', 'Kan pulcuğu', 'Sinir hücresi', 1),
('Fen Bilimleri', 'Akciğerlerde gaz alışverişi hangi yapıda olur?', 'Soluk borusu', 'Bronş', 'Alveol', 'Gırtlak', 2),
('Fen Bilimleri', 'Kanı süzerek idrar oluşturan organ hangisidir?', 'Böbrek', 'Mide', 'Kalp', 'Pankreas', 0),
('Fen Bilimleri', 'Hangisi sinir sisteminin bir parçası değildir?', 'Beyin', 'Omurilik', 'Beyincik', 'Akciğer', 3),
('Fen Bilimleri', 'Kan şekerini düzenleyen insülin hormonunu hangi bez salgılar?', 'Tiroit', 'Pankreas', 'Hipofiz', 'Tükürük bezi', 1),
('Fen Bilimleri', 'Hangisi bir duyu organı değildir?', 'Göz', 'Kulak', 'Deri', 'Kalp', 3),
('Fen Bilimleri', 'Aynı yönlü 5 N ve 3 N iki kuvvetin bileşkesi kaç N’dur?', '2', '8', '15', '5', 1),
('Fen Bilimleri', 'Zıt yönlü 7 N ve 4 N iki kuvvetin bileşkesi kaç N’dur?', '11', '3', '28', '4', 1),
('Fen Bilimleri', '100 metreyi 20 saniyede koşan bir öğrencinin sürati kaç m/s’dir?', '2000', '5', '80', '120', 1),
('Fen Bilimleri', 'Süratin birimi hangisidir?', 'Newton', 'm/s', 'kg', '°C', 1),
('Fen Bilimleri', 'Kütlesi 20 g, hacmi 10 cm³ olan maddenin yoğunluğu kaç g/cm³’tür?', '200', '2', '0,5', '30', 1),
('Fen Bilimleri', 'Tanecikleri en düzenli olan madde hâli hangisidir?', 'Katı', 'Sıvı', 'Gaz', 'Hepsi aynı', 0),
('Fen Bilimleri', 'Hangisi ısıyı en iyi iletir?', 'Tahta', 'Plastik', 'Metal', 'Strafor', 2),
('Fen Bilimleri', 'Ses hangi ortamda yayılamaz?', 'Su', 'Hava', 'Demir', 'Boşluk', 3),
('Fen Bilimleri', 'Ses en hızlı hangi ortamda yayılır?', 'Gaz', 'Sıvı', 'Katı', 'Boşluk', 2),
('Fen Bilimleri', 'Ses şiddetinin birimi hangisidir?', 'Desibel', 'Newton', 'Metre', 'Gram', 0),
('Fen Bilimleri', 'Hangisi elektriği iletmez?', 'Bakır', 'Alüminyum', 'Demir', 'Plastik', 3),

-- TÜRKÇE: sözcükte anlam, sözcük türleri, kök ve ekler, yazım ve noktalama, söz sanatları, metin türleri
('Türkçe', '"Onun kafası çok çalışır." cümlesinde "çalışmak" hangi anlamda kullanılmıştır?', 'Gerçek', 'Mecaz', 'Terim', 'Zıt', 1),
('Türkçe', 'Hangi cümlede "açı" sözcüğü terim anlamıyla kullanılmıştır?', 'Olaya bir de benim açımdan bak.', 'Üçgenin bir açısı 90 derecedir.', 'Onun bakış açısı çok dar.', 'Konuya farklı açıdan yaklaştı.', 1),
('Türkçe', 'Hangisi eş sesli (sesteş) bir sözcüktür?', 'Masa', 'Yüz', 'Kalem', 'Kapı', 1),
('Türkçe', '"Cömert" sözcüğünün zıt anlamlısı hangisidir?', 'Eli açık', 'Cimri', 'Zengin', 'İyi', 1),
('Türkçe', '"Yaşlı" sözcüğünün eş anlamlısı hangisidir?', 'Genç', 'İhtiyar', 'Hasta', 'Uzun', 1),
('Türkçe', 'Hangisi bir isimdir?', 'Okumak', 'Hızlıca', 'Sevgi', 'Güzel', 2),
('Türkçe', '"Kırmızı elbiseyi giydi." cümlesindeki sıfat hangisidir?', 'Kırmızı', 'Elbiseyi', 'Giydi', 'Elbise', 0),
('Türkçe', '"Onlar yarın gelecek." cümlesindeki zamir hangisidir?', 'Yarın', 'Onlar', 'Gelecek', 'Cümlede zamir yok', 1),
('Türkçe', '"Gözlükçü" sözcüğünün kökü hangisidir?', 'Gözlük', 'Göz', 'Gözlükçü', 'Gö', 1),
('Türkçe', 'Hangi sözcükte yapım eki vardır?', 'Evler', 'Kitabı', 'Tuzluk', 'Okula', 2),
('Türkçe', 'Hangi sözcük büyük ünlü uyumuna uymaz?', 'Kitap', 'Okul', 'Defter', 'Çiçek', 0),
('Türkçe', 'Hangisinin yazımı yanlıştır?', 'Yalnız', 'Yanlız', 'Herkes', 'Kirpik', 1),
('Türkçe', 'Eş görevli sözcükleri ayırmak için hangi noktalama işareti kullanılır?', 'Nokta', 'Virgül', 'Ünlem', 'Soru işareti', 1),
('Türkçe', 'Hangi cümlenin sonuna ünlem işareti konmalıdır?', 'Eyvah, yine geç kaldık', 'Yarın okula gideceğim', 'Saat kaç', 'Kitabı masaya koydu', 0),
('Türkçe', '"Ağaçlar rüzgârla dans ediyordu." cümlesindeki söz sanatı hangisidir?', 'Benzetme', 'Kişileştirme', 'Abartma', 'Konuşturma', 1),
('Türkçe', '"Aslan gibi güçlü bir çocuk" sözünde hangi söz sanatı vardır?', 'Benzetme', 'Kişileştirme', 'Abartma', 'Karşıtlık', 0),
('Türkçe', 'Olay, kişi, yer ve zaman unsurlarının bulunduğu metin türü hangisidir?', 'Şiir', 'Hikâye', 'Deneme', 'Makale', 1),
('Türkçe', '"Kalemlik" sözcüğündeki "-lik" eki hangi türdendir?', 'Çekim eki', 'Yapım eki', 'Kök', 'Zamir', 1),

-- SOSYAL BİLGİLER: ilk Türk devletleri, ilk uygarlıklar, konum, iklim, yönetim
('Sosyal Bilgiler', 'İlk Müslüman Türk devleti hangisidir?', 'Göktürkler', 'Karahanlılar', 'Uygurlar', 'Asya Hun', 1),
('Sosyal Bilgiler', '"Türk" adını devlet adı olarak ilk kullanan devlet hangisidir?', 'Asya Hun', 'Göktürkler', 'Uygurlar', 'Selçuklular', 1),
('Sosyal Bilgiler', 'Orhun Yazıtları hangi Türk devletinden kalmıştır?', 'Göktürkler', 'Uygurlar', 'Karahanlılar', 'Avarlar', 0),
('Sosyal Bilgiler', 'Yerleşik hayata geçen ilk Türk devleti hangisidir?', 'Asya Hun', 'Göktürkler', 'Uygurlar', 'Avarlar', 2),
('Sosyal Bilgiler', 'Kavimler Göçü’nden sonra Avrupa’da kurulan Türk devleti hangisidir?', 'Uygurlar', 'Göktürkler', 'Karahanlılar', 'Avrupa Hun', 3),
('Sosyal Bilgiler', 'Malazgirt Meydan Muharebesi hangi yılda yapılmıştır?', '1453', '1071', '1923', '1299', 1),
('Sosyal Bilgiler', '"Divânu Lugâti’t-Türk" adlı eseri kim yazmıştır?', 'Yusuf Has Hacib', 'Kaşgarlı Mahmud', 'Ahmet Yesevi', 'Farabi', 1),
('Sosyal Bilgiler', '"Kutadgu Bilig" adlı eseri kim yazmıştır?', 'Yusuf Has Hacib', 'Kaşgarlı Mahmud', 'Edip Ahmet', 'Ali Kuşçu', 0),
('Sosyal Bilgiler', 'Yazıyı icat eden uygarlık hangisidir?', 'Sümerler', 'Hititler', 'Lidyalılar', 'Urartular', 0),
('Sosyal Bilgiler', 'Parayı ilk kullanan uygarlık hangisidir?', 'Sümerler', 'Mısırlılar', 'Fenikeliler', 'Lidyalılar', 3),
('Sosyal Bilgiler', 'İpek Yolu hangi bölgeleri birbirine bağlar?', 'Çin ile Avrupa’yı', 'Afrika ile Amerika’yı', 'Hindistan ile Avustralya’yı', 'Rusya ile Kanada’yı', 0),
('Sosyal Bilgiler', 'Türkiye hangi iki kıta arasında köprü durumundadır?', 'Afrika – Asya', 'Asya – Avrupa', 'Avrupa – Afrika', 'Amerika – Avrupa', 1),
('Sosyal Bilgiler', 'Türkiye hangi yarım kürelerde yer alır?', 'Güney ve Doğu', 'Kuzey ve Batı', 'Kuzey ve Doğu', 'Güney ve Batı', 2),
('Sosyal Bilgiler', 'Ekvator kaç derecelik paraleldir?', '0', '90', '180', '45', 0),
('Sosyal Bilgiler', 'Akdeniz ikliminin doğal bitki örtüsü hangisidir?', 'Bozkır', 'Maki', 'Tundra', 'Çayır', 1),
('Sosyal Bilgiler', 'Türkiye’nin en büyük gölü hangisidir?', 'Van Gölü', 'Tuz Gölü', 'Beyşehir Gölü', 'Eğirdir Gölü', 0),
('Sosyal Bilgiler', 'Türkiye’de kanun yapma yetkisi hangi kurumdadır?', 'Valilik', 'TBMM', 'Mahkemeler', 'Belediye', 1),
('Sosyal Bilgiler', 'Türkiye’de seçimlerde oy kullanma yaşı kaçtır?', '16', '21', '18', '25', 2),

-- İNGİLİZCE: 6. sınıf üniteleri (Life, Yummy Breakfast, Downtown, Weather and Emotions, At the Fair, Occupations, Holidays, Bookworms, Saving the Planet, Democracy)
('İngilizce', '"Breakfast" ne demektir?', 'Akşam yemeği', 'Kahvaltı', 'Öğle yemeği', 'Tatlı', 1),
('İngilizce', '"I ___ up at 7 o’clock every day." boşluğa ne gelir?', 'get', 'gets', 'getting', 'got', 0),
('İngilizce', '"She ___ to school by bus." boşluğa ne gelir?', 'go', 'goes', 'going', 'gone', 1),
('İngilizce', '"Bakery" ne demektir?', 'Fırın', 'Eczane', 'Kütüphane', 'Banka', 0),
('İngilizce', '"Sunny" hangi hava durumudur?', 'Yağmurlu', 'Karlı', 'Güneşli', 'Rüzgârlı', 2),
('İngilizce', '"What’s the weather like?" sorusunun cevabı hangisidir?', 'I’m twelve.', 'It’s rainy.', 'It’s a pen.', 'I like pizza.', 1),
('İngilizce', '"Scared" hangi duyguyu anlatır?', 'Mutlu', 'Kızgın', 'Korkmuş', 'Şaşkın', 2),
('İngilizce', '"Roller coaster" en çok nerede bulunur?', 'At the fair', 'At school', 'At the hospital', 'In the library', 0),
('İngilizce', '"Firefighter" ne demektir?', 'Polis', 'İtfaiyeci', 'Postacı', 'Garson', 1),
('İngilizce', '"Did you go to the beach last summer?" – "Yes, I ___."', 'do', 'did', 'does', 'done', 1),
('İngilizce', '"Bookworm" kime denir?', 'Bahçıvana', 'Sporcuya', 'Kitap kurduna', 'Ressama', 2),
('İngilizce', '"Recycle" ne demektir?', 'Geri dönüştürmek', 'Atmak', 'Satın almak', 'Kırmak', 0),
('İngilizce', '"Election" ne demektir?', 'Okul', 'Ders', 'Tatil', 'Seçim', 3);
