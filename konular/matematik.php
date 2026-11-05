<?php
// Matematik — 6. sınıf soru üreticileri (Maarif Modeli)
// Her konu 'gen' ile her çağrıda yeni sayılarla soru üretir:
// ['text' => soru, 'short' => kısa işlem (eşleştirme/doğru-yanlış için), 'answer' => doğru cevap,
//  'wrong' => 3+ yanlış cevap adayı, 'exp' => açıklama]

function m_num($n): string
{
    if (is_float($n)) {
        $s = rtrim(rtrim(number_format($n, 3, ',', ''), '0'), ',');
        return str_replace('-', '−', $s);
    }
    return $n < 0 ? '−' . abs($n) : (string) $n;
}
function m_par(int $n): string { return $n < 0 ? '(' . m_num($n) . ')' : m_num($n); }
function m_gcd(int $a, int $b): int { return $b === 0 ? abs($a) : m_gcd($b, $a % $b); }
function m_lcm(int $a, int $b): int { return intdiv($a * $b, m_gcd($a, $b)); }
function m_sup(int $n): string { return strtr((string) $n, ['0' => '⁰', '1' => '¹', '2' => '²', '3' => '³', '4' => '⁴', '5' => '⁵', '6' => '⁶', '7' => '⁷', '8' => '⁸', '9' => '⁹']); }
function m_frac(int $a, int $b): string
{
    $g = m_gcd($a, $b);
    $a = intdiv($a, $g); $b = intdiv($b, $g);
    return $b === 1 ? m_num($a) : m_num($a) . '/' . $b;
}
// Doğru cevabın yakınından farklı yanlış cevaplar
function m_near(int $ans, array $extra = [], bool $positive = true): array
{
    $c = $extra;
    foreach ([1, -1, 2, -2, 10, -10, 3, 5] as $d) $c[] = $ans + $d;
    $c = array_values(array_unique(array_filter($c, fn($x) => $x !== $ans && (!$positive || $x > 0))));
    return array_map('m_num', $c);
}

return [
    'subject' => 'Matematik',
    'topics' => [
        'm_uslu' => [
            'name' => 'Üslü İfadeler',
            'bank' => ['Sayılar ve Nicelikler: Üslü ifadeler'],
            'gen' => function () {
                $a = random_int(2, 9);
                $n = $a <= 3 ? random_int(2, 5) : ($a <= 5 ? random_int(2, 4) : random_int(2, 3));
                $v = $a ** $n;
                if (random_int(0, 2) === 0) {
                    $b = random_int(2, 5);
                    $w = $b ** 2;
                    $ans = $v + $w;
                    $short = $a . m_sup($n) . ' + ' . $b . '²';
                    return ['text' => "$short işleminin sonucu kaçtır?", 'short' => $short, 'answer' => m_num($ans),
                        'wrong' => m_near($ans, [$a * $n + $b * 2, $v + $b * 2, $a * $n + $w]),
                        'exp' => "$a" . m_sup($n) . " = $v, {$b}² = $w. $v + $w = $ans."];
                }
                $short = $a . m_sup($n);
                return ['text' => "$short ifadesinin değeri kaçtır?", 'short' => $short, 'answer' => m_num($v),
                    'wrong' => m_near($v, [$a * $n, $a + $n, $n ** $a <= 99999 ? $n ** $a : $v + 4]),
                    'exp' => "$short, $a sayısının kendisiyle $n kez çarpımıdır: $v. ($a × $n değil!)"];
            },
        ],
        'm_islem' => [
            'name' => 'İşlem Önceliği',
            'bank' => ['Sayılar ve Nicelikler: İşlem önceliği'],
            'gen' => function () {
                if (random_int(0, 1)) {
                    $c = random_int(2, 6); $q = random_int(2, 6); $b = $c * $q; $d = random_int(2, 4);
                    $a = $q * $d + random_int(1, 30);
                    $ans = $a - $q * $d;
                    $short = "$a − $b ÷ $c × $d";
                    $lr = intdiv(($a - $b), $c) * $d; // soldan sağa yapma hatası
                    return ['text' => "$short işleminin sonucu kaçtır?", 'short' => $short, 'answer' => m_num($ans),
                        'wrong' => m_near($ans, [($a - $b) % $c === 0 ? $lr : $ans + 4, $a - intdiv($b, $c * $d) ?: $ans + 6]),
                        'exp' => "Önce bölme ve çarpma soldan sağa: $b ÷ $c = $q, $q × $d = " . ($q * $d) . ". Sonra $a − " . ($q * $d) . " = $ans."];
                }
                $a = random_int(2, 12); $b = random_int(2, 9); $c = random_int(2, 6); $d = random_int(1, 9);
                $ans = ($a + $b) * $c - $d;
                $short = "($a + $b) × $c − $d";
                return ['text' => "$short işleminin sonucu kaçtır?", 'short' => $short, 'answer' => m_num($ans),
                    'wrong' => m_near($ans, [$a + $b * $c - $d, ($a + $b) * ($c - $d) > 0 ? ($a + $b) * ($c - $d) : $ans + 7]),
                    'exp' => "Önce parantez: $a + $b = " . ($a + $b) . ". Sonra çarpma: " . (($a + $b) * $c) . ". En son çıkarma: $ans."];
            },
        ],
        'm_bolun' => [
            'name' => 'Bölünebilme Kuralları',
            'bank' => ['Sayılar ve Nicelikler: Bölünebilme'],
            'gen' => function () {
                $k = [3, 9][random_int(0, 1)];
                do {
                    $x = random_int(1, 9); $z = random_int(0, 9);
                    $opts = array_values(array_filter(range(0, 9), fn($a) => ($x + $a + $z) % $k === 0));
                } while (!$opts);
                $a = max($opts);
                $short = "{$x}A{$z} sayısı $k ile bölünüyor";
                return ['text' => "{$x}A{$z} üç basamaklı sayısı $k ile tam bölünebiliyorsa A en çok kaçtır?", 'short' => $short . ', en büyük A', 'answer' => (string) $a,
                    'wrong' => array_map('strval', array_values(array_diff(range(0, 9), [$a]))),
                    'exp' => "$k ile bölünebilme için rakamlar toplamı $k ile bölünebilmeli: $x + A + $z. En büyük uygun A = $a."];
            },
        ],
        'm_asal' => [
            'name' => 'Asal Çarpanlar, EBOB ve EKOK',
            'bank' => ['Sayılar ve Nicelikler: Asal çarpanlar', 'Sayılar ve Nicelikler: EBOB', 'Sayılar ve Nicelikler: EKOK'],
            'gen' => function () {
                $g = [2, 3, 4, 5, 6, 8][random_int(0, 5)];
                do { $p = random_int(2, 7); $r = random_int(2, 7); } while ($p === $r || m_gcd($p, $r) !== 1);
                $a = $g * $p; $b = $g * $r;
                if (random_int(0, 1)) {
                    $short = "EBOB($a, $b)";
                    return ['text' => "$a ve $b sayılarının en büyük ortak böleni (EBOB) kaçtır?", 'short' => $short, 'answer' => m_num($g),
                        'wrong' => m_near($g, [m_lcm($a, $b), $g * 2, intdiv($g, 2) ?: 1]),
                        'exp' => "$a ve $b sayılarını bölen en büyük sayı: $g. $a = $g × $p, $b = $g × $r."];
                }
                $l = m_lcm($a, $b);
                $short = "EKOK($a, $b)";
                return ['text' => "$a ve $b sayılarının en küçük ortak katı (EKOK) kaçtır?", 'short' => $short, 'answer' => m_num($l),
                    'wrong' => m_near($l, [$a * $b, $g, $l * 2]),
                    'exp' => "Ortak katların en küçüğü: $l. EKOK = $g × $p × $r = $l."];
            },
        ],
        'm_tam' => [
            'name' => 'Tam Sayılar',
            'bank' => ['Sayılar ve Nicelikler: Tam sayılar'],
            'gen' => function () {
                $a = random_int(-15, 15) ?: 4; $b = random_int(-15, 15) ?: -6;
                if (random_int(0, 1)) {
                    $ans = $a + $b;
                    $short = m_par($a) . ' + ' . m_par($b);
                    return ['text' => "$short işleminin sonucu kaçtır?", 'short' => $short, 'answer' => m_num($ans),
                        'wrong' => m_near($ans, [$a - $b, -$ans, abs($a) + abs($b)], false),
                        'exp' => "İşaretleri " . (($a < 0) === ($b < 0) ? 'aynı olan sayılar toplanır, işaret korunur' : 'farklı olan sayılarda büyükten küçük çıkarılır, büyüğün işareti alınır') . ": $short = " . m_num($ans) . "."];
                }
                $ans = $a - $b;
                $short = m_par($a) . ' − ' . m_par($b);
                return ['text' => "$short işleminin sonucu kaçtır?", 'short' => $short, 'answer' => m_num($ans),
                    'wrong' => m_near($ans, [$a + $b, -$ans], false),
                    'exp' => "Çıkarma, çıkanın ters işaretlisiyle toplamadır: " . m_par($a) . ' + ' . m_par(-$b) . ' = ' . m_num($ans) . '.'];
            },
        ],
        'm_kesir' => [
            'name' => 'Kesirlerle İşlemler',
            'bank' => ['Sayılar ve Nicelikler: Kesirler'],
            'gen' => function () {
                $t = random_int(0, 2);
                if ($t === 0) {
                    $d = [4, 6, 8, 9, 10, 12][random_int(0, 5)];
                    $a = random_int(1, $d - 1); $b = random_int(1, $d - 1);
                    $short = "$a/$d + $b/$d";
                    $ans = m_frac($a + $b, $d);
                    return ['text' => "$short işleminin sonucu kaçtır?", 'short' => $short, 'answer' => $ans,
                        'wrong' => array_values(array_diff([($a + $b) . '/' . ($d * 2), m_frac($a + $b + 1, $d), m_frac(abs($a + $b - 1) ?: 2, $d), m_frac($a * $b, $d)], [$ans])),
                        'exp' => "Paydalar eşitse paylar toplanır, payda aynı kalır: " . ($a + $b) . "/$d = $ans."];
                }
                if ($t === 1) {
                    $d = [2, 3, 4, 5, 6][random_int(0, 4)]; $a = random_int(1, $d - 1); $k = random_int(2, 9);
                    $n = $d * $k;
                    $ans = intdiv($n, $d) * $a;
                    $short = "$n × $a/$d";
                    return ['text' => "$n sayısının $a/$d kadarı kaçtır?", 'short' => $short, 'answer' => m_num($ans),
                        'wrong' => m_near($ans, [$k, $n - $ans, $n * $a]),
                        'exp' => "$n ÷ $d = $k, $k × $a = $ans."];
                }
                $d1 = [2, 3, 4][random_int(0, 2)]; $d2 = [3, 4, 6, 8][random_int(0, 3)];
                if ($d1 === $d2) $d2 = 6;
                $a = random_int(1, $d1 - 1) ?: 1; $b = random_int(1, $d2 - 1);
                $l = m_lcm($d1, $d2);
                $num = $a * intdiv($l, $d1) + $b * intdiv($l, $d2);
                $short = "$a/$d1 + $b/$d2";
                $ans = m_frac($num, $l);
                return ['text' => "$short işleminin sonucu kaçtır?", 'short' => $short, 'answer' => $ans,
                    'wrong' => array_values(array_diff([($a + $b) . '/' . ($d1 + $d2), m_frac($num + 1, $l), m_frac($a + $b, $l), m_frac($num, $l * 2)], [$ans])),
                    'exp' => "Paydalar $l olacak şekilde eşitlenir: " . ($a * intdiv($l, $d1)) . "/$l + " . ($b * intdiv($l, $d2)) . "/$l = $num/$l = $ans."];
            },
        ],
        'm_ondalik' => [
            'name' => 'Ondalık Gösterim',
            'bank' => ['Sayılar ve Nicelikler: Ondalık gösterim'],
            'gen' => function () {
                if (random_int(0, 1)) {
                    $a = random_int(11, 99) / 10; $b = random_int(101, 499) / 100;
                    $ans = round($a + $b, 2);
                    $short = m_num($a) . ' + ' . m_num($b);
                    return ['text' => "$short işleminin sonucu kaçtır?", 'short' => $short, 'answer' => m_num($ans),
                        'wrong' => [m_num(round($ans + 0.1, 2)), m_num(round($ans - 0.01, 2) + 0.0), m_num(round($a * 10 + $b, 2)), m_num(round($ans + 1, 2))],
                        'exp' => "Virgüller alt alta gelecek şekilde toplanır: " . m_num($ans) . "."];
                }
                $a = random_int(101, 999) / 100; $k = [10, 100][random_int(0, 1)];
                $ans = round($a * $k, 2);
                $short = m_num($a) . " × $k";
                return ['text' => "$short işleminin sonucu kaçtır?", 'short' => $short, 'answer' => m_num($ans),
                    'wrong' => array_values(array_unique(array_diff([m_num(round($a * $k * 10, 2)), m_num(round($a * $k / 10, 2)), m_num(round($a + $k, 2)), m_num(round($a * $k / 100, 3))], [m_num($ans)]))),
                    'exp' => "$k ile çarpınca virgül " . ($k === 10 ? 'bir' : 'iki') . " basamak sağa kayar: " . m_num($ans) . "."];
            },
        ],
        'm_oran' => [
            'name' => 'Oran',
            'bank' => ['Sayılar ve Nicelikler: Oran'],
            'gen' => function () {
                do { $x = random_int(1, 7); $y = random_int(2, 9); } while ($x === $y || m_gcd($x, $y) !== 1);
                $k = random_int(2, 8);
                if (random_int(0, 1)) {
                    $short = ($x * $k) . ' : ' . ($y * $k) . ' en sade hâli';
                    return ['text' => ($x * $k) . ' : ' . ($y * $k) . ' oranının en sade hâli hangisidir?', 'short' => $short, 'answer' => "$x : $y",
                        'wrong' => array_values(array_diff([($x + 1) . " : $y", "$y : $x", "$x : " . ($y + 1), ($x * 2) . ' : ' . ($y * 3)], ["$x : $y"])),
                        'exp' => "İki terim de $k ile bölünür: $x : $y."];
                }
                $b = $y * $k; $a = $x * $k;
                $short = "Kız : erkek = $x : $y, erkek $b → kız";
                return ['text' => "Bir kulüpte kızların sayısının erkeklerin sayısına oranı $x/$y ve kulüpte $b erkek varsa kaç kız vardır?", 'short' => $short, 'answer' => m_num($a),
                    'wrong' => m_near($a, [$a + $b, $b, $k]),
                    'exp' => "$b ÷ $y = $k, kızlar $x × $k = $a."];
            },
        ],
        'm_cebir' => [
            'name' => 'Cebirsel İfadeler',
            'bank' => ['İşlemlerle Cebirsel Düşünme'],
            'gen' => function () {
                $a = random_int(2, 9); $b = random_int(1, 15); $x = random_int(2, 9);
                if (random_int(0, 1)) {
                    $ans = $a * $x + $b;
                    $short = "{$a}x + $b (x = $x)";
                    return ['text' => "{$a}x + $b cebirsel ifadesinin x = $x için değeri kaçtır?", 'short' => $short, 'answer' => m_num($ans),
                        'wrong' => m_near($ans, [$a + $x + $b, (int) ($a . $x) + $b, $a * ($x + $b)]),
                        'exp' => "x yerine $x yazılır: $a × $x + $b = $ans."];
                }
                $ans = $a * ($x - 1);
                $short = "$a(x − 1) (x = $x)";
                return ['text' => "$a(x − 1) ifadesinin x = $x için değeri kaçtır?", 'short' => $short, 'answer' => m_num($ans),
                    'wrong' => m_near($ans, [$a * $x - 1, $a * $x, $a + $x - 1]),
                    'exp' => "Önce parantez: $x − 1 = " . ($x - 1) . ", sonra $a × " . ($x - 1) . " = $ans."];
            },
        ],
        'm_aci' => [
            'name' => 'Açılar',
            'bank' => ['Geometrik Şekiller: Açılar'],
            'gen' => function () {
                if (random_int(0, 1)) {
                    $a = random_int(5, 85);
                    $short = "{$a}° açının tümleri";
                    return ['text' => "Ölçüsü {$a}° olan açının tümleri kaç derecedir?", 'short' => $short, 'answer' => (90 - $a) . '°',
                        'wrong' => [(180 - $a) . '°', (100 - $a) . '°', (90 - $a + 10) . '°', ($a + 90) . '°', (95 - $a) . '°', (85 - $a) . '°'],
                        'exp' => "Tümler açıların toplamı 90°’dir: 90 − $a = " . (90 - $a) . "°."];
                }
                $a = random_int(10, 170);
                $short = "{$a}° açının bütünleri";
                return ['text' => "Ölçüsü {$a}° olan açının bütünleri kaç derecedir?", 'short' => $short, 'answer' => (180 - $a) . '°',
                    'wrong' => array_values(array_filter([abs(90 - $a) . '°', (190 - $a) . '°', (360 - $a) . '°', (170 - $a) . '°'], fn($w) => $w !== (180 - $a) . '°')),
                    'exp' => "Bütünler açıların toplamı 180°’dir: 180 − $a = " . (180 - $a) . "°."];
            },
        ],
        'm_alan' => [
            'name' => 'Alan Ölçme',
            'bank' => ['Geometrik Nicelikler: Alan'],
            'gen' => function () {
                $b = random_int(3, 14); $h = random_int(2, 12);
                $t = random_int(0, 2);
                if ($t === 0) {
                    if (($b * $h) % 2) $h++;
                    $ans = intdiv($b * $h, 2);
                    $short = "Üçgen: taban $b, yükseklik $h";
                    return ['text' => "Taban uzunluğu $b cm, yüksekliği $h cm olan üçgenin alanı kaç cm²’dir?", 'short' => $short, 'answer' => "$ans cm²",
                        'wrong' => array_map(fn($v) => "$v cm²", [$b * $h, $b + $h, $ans + $b, 2 * ($b + $h)]),
                        'exp' => "Üçgenin alanı = taban × yükseklik ÷ 2 = $b × $h ÷ 2 = $ans cm²."];
                }
                if ($t === 1) {
                    $ans = $b * $h;
                    $short = "Paralelkenar: taban $b, yükseklik $h";
                    return ['text' => "Taban uzunluğu $b cm, bu tabana ait yüksekliği $h cm olan paralelkenarın alanı kaç cm²’dir?", 'short' => $short, 'answer' => "$ans cm²",
                        'wrong' => array_map(fn($v) => "$v cm²", [intdiv($ans, 2) ?: 1, 2 * ($b + $h), $b + $h, $ans + $h, $ans * 2, $ans + $b + 1]),
                        'exp' => "Paralelkenarın alanı = taban × yükseklik = $b × $h = $ans cm²."];
                }
                $ans = $b * $h;
                $short = "Dikdörtgen: $b cm × $h cm";
                return ['text' => "Kenar uzunlukları $b cm ve $h cm olan dikdörtgenin alanı kaç cm²’dir?", 'short' => $short, 'answer' => "$ans cm²",
                    'wrong' => array_map(fn($v) => "$v cm²", [2 * ($b + $h), $b + $h, $ans + 2, $ans - $b]),
                    'exp' => "Dikdörtgenin alanı = uzun kenar × kısa kenar = $ans cm². (" . (2 * ($b + $h)) . " cm çevresidir.)"];
            },
        ],
        'm_veri' => [
            'name' => 'Veri ve Aritmetik Ortalama',
            'bank' => ['İstatistiksel Araştırma Süreci'],
            'gen' => function () {
                $n = random_int(3, 5);
                $mean = random_int(4, 20);
                $vals = [];
                for ($i = 0; $i < $n - 1; $i++) $vals[] = $mean + random_int(-4, 4);
                $last = $mean * $n - array_sum($vals);
                if ($last < 1) $last = $mean;
                $vals[] = $last;
                $mean = intdiv(array_sum($vals), $n);
                if (array_sum($vals) % $n) { $vals[$n - 1] += $n - array_sum($vals) % $n; $mean = intdiv(array_sum($vals), $n); }
                $list = implode(', ', $vals);
                if (random_int(0, 2) === 0) {
                    $range = max($vals) - min($vals);
                    if ($range === 0) { $vals[0] += 2; $list = implode(', ', $vals); $range = max($vals) - min($vals); }
                    $short = "$list verisinin açıklığı";
                    return ['text' => "$list veri grubunun açıklığı kaçtır?", 'short' => $short, 'answer' => m_num($range),
                        'wrong' => m_near($range, [max($vals), array_sum($vals)]),
                        'exp' => "Açıklık = en büyük − en küçük = " . max($vals) . " − " . min($vals) . " = $range."];
                }
                $short = "$list ortalaması";
                return ['text' => "$list sayılarının aritmetik ortalaması kaçtır?", 'short' => $short, 'answer' => m_num($mean),
                    'wrong' => m_near($mean, [array_sum($vals), $mean + $n]),
                    'exp' => "Toplam " . array_sum($vals) . ", veri sayısı $n. " . array_sum($vals) . " ÷ $n = $mean."];
            },
        ],
    ],
];
