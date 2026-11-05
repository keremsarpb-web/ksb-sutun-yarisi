<?php
// Sınava Hazırlık etkinlik motoru: konu kataloğu ve her seferinde farklı soru üretimi.
// Etkinlik türleri: mc (test), tf (doğru-yanlış), match (eşleştirme).

const ACTIVITY_TYPES = ['mc', 'tf', 'match'];
const MATCH_SIZE = 4;
const RECENT_EXAMS = 8; // son bu kadar sınavda çıkan sorular mümkünse tekrar gelmez

function topics_all(): array
{
    static $all = null;
    if ($all !== null) return $all;
    $all = [];
    foreach (['matematik', 'fen', 'turkce', 'sosyal', 'ingilizce'] as $f) {
        $path = __DIR__ . "/konular/$f.php";
        if (!is_file($path)) continue;
        $data = require $path;
        foreach ($data['topics'] as $id => $t) {
            $all[$id] = $t + ['subject' => $data['subject'], 'bank' => [], 'mc' => [], 'pairs' => [], 'tf' => [], 'gen' => null];
        }
    }
    return $all;
}

function topic_types(array $t): array
{
    $types = [];
    if ($t['mc'] || $t['bank'] || $t['gen']) $types[] = 'mc';
    if ($t['tf'] || $t['gen']) $types[] = 'tf';
    if ($t['pairs'] || $t['gen']) $types[] = 'match';
    return $types;
}

function exam_catalog(): array
{
    $subjects = [];
    foreach (topics_all() as $id => $t) {
        $subjects[$t['subject']][] = ['id' => $id, 'name' => $t['name'], 'types' => topic_types($t), 'generated' => (bool) $t['gen']];
    }
    $out = [];
    foreach ($subjects as $name => $topics) $out[] = ['subject' => $name, 'topics' => $topics];
    return $out;
}

// Oyuncunun son sınavlarında çıkan soru anahtarları
function recent_keys(int $pid): array
{
    $keys = [];
    $rows = q('SELECT items, question_ids FROM exams WHERE player_id = ? ORDER BY id DESC LIMIT ' . RECENT_EXAMS, [$pid])->fetchAll();
    foreach ($rows as $r) {
        if ($r['items']) {
            foreach (json_decode($r['items'], true) ?: [] as $it) foreach ($it['keys'] as $k) $keys[$k] = true;
        } else {
            foreach (json_decode($r['question_ids'], true) ?: [] as $id) $keys["b:$id"] = true;
        }
    }
    return $keys;
}

// Önce hiç/uzun süredir görülmemiş adaylardan seçer
function pick_fresh(array $cands, array $avoid): ?array
{
    if (!$cands) return null;
    shuffle($cands);
    foreach ($cands as $c) if (!array_intersect($c['keys'], array_keys($avoid['recent'])) && !array_intersect($c['keys'], array_keys($avoid['used']))) return $c;
    foreach ($cands as $c) if (!array_intersect($c['keys'], array_keys($avoid['used']))) return $c;
    return null;
}

function mc_item(array $t, string $text, string $answer, array $wrong, string $exp, string $key): ?array
{
    $wrong = array_values(array_unique(array_filter(array_map('strval', $wrong), fn($w) => $w !== $answer && $w !== '')));
    if (count($wrong) < 3) return null;
    shuffle($wrong);
    $opts = array_merge([$answer], array_slice($wrong, 0, 3));
    shuffle($opts);
    return ['type' => 'mc', 'subject' => $t['subject'], 'topic' => $t['name'], 'text' => $text, 'options' => $opts,
        'correct' => array_search($answer, $opts, true), 'explanation' => $exp, 'keys' => [$key]];
}

function tf_item(array $t, string $text, bool $truth, string $exp, string $key): array
{
    return ['type' => 'tf', 'subject' => $t['subject'], 'topic' => $t['name'], 'text' => $text, 'options' => ['Doğru', 'Yanlış'],
        'correct' => $truth ? 0 : 1, 'explanation' => $exp, 'keys' => [$key]];
}

function match_item(array $t, string $title, array $pairs, string $exp = ''): array
{
    // $pairs: [[sol, sağ, anahtar], ...]
    $right = range(0, count($pairs) - 1);
    shuffle($right);
    return ['type' => 'match', 'subject' => $t['subject'], 'topic' => $t['name'], 'text' => $title,
        'left' => array_column($pairs, 0), 'right' => array_map(fn($i) => $pairs[$i][1], $right),
        'answer' => array_map(fn($i) => array_search($i, $right, true), array_keys($pairs)),
        'explanation' => $exp ?: implode(' • ', array_map(fn($p) => $p[0] . ' → ' . $p[1], $pairs)),
        'keys' => array_column($pairs, 2)];
}

// Bir konu ve tür için aday etkinlikler
function candidates(string $tid, array $t, string $type, array $avoid): array
{
    $c = [];
    if ($type === 'mc') {
        if ($t['bank']) {
            $in = implode(',', array_fill(0, count($t['bank']), '?'));
            foreach (q("SELECT * FROM exam_questions WHERE unit IN ($in)", $t['bank'])->fetchAll() as $r) {
                $opts = [$r['a'], $r['b'], $r['c'], $r['d']];
                $ans = $opts[(int) $r['correct']];
                $it = mc_item($t, $r['text'], $ans, array_values(array_diff($opts, [$ans])), $r['explanation'], 'b:' . $r['id']);
                if ($it) $c[] = $it;
            }
        }
        foreach ($t['mc'] as $i => $m) {
            $it = mc_item($t, $m[0], $m[1][0], array_slice($m[1], 1), $m[2], "mc:$tid:$i");
            if ($it) $c[] = $it;
        }
        if ($t['gen']) {
            for ($i = 0; $i < 6; $i++) {
                $g = ($t['gen'])();
                $it = mc_item($t, $g['text'], $g['answer'], $g['wrong'], $g['exp'], "g:$tid:" . $g['short']);
                if ($it) $c[] = $it;
            }
        }
    } elseif ($type === 'tf') {
        foreach ($t['tf'] as $i => $s) $c[] = tf_item($t, $s[0], (bool) $s[1], $s[2], "tf:$tid:$i");
        if ($t['gen']) {
            for ($i = 0; $i < 4; $i++) {
                $g = ($t['gen'])();
                $truth = (bool) random_int(0, 1);
                $shown = $truth ? $g['answer'] : $g['wrong'][array_rand($g['wrong'])];
                $c[] = tf_item($t, $g['short'] . ' → ' . $shown, $truth, $g['exp'], "gtf:$tid:" . $g['short']);
            }
        }
    } else {
        foreach ($t['pairs'] as $si => $set) {
            $items = [];
            foreach ($set['items'] as $i => $p) $items[] = [$p[0], $p[1], "p:$tid:$si:$i"];
            if (count($items) < MATCH_SIZE) continue;
            // Görülmemiş çiftler öne; set 4’lü gruplara bölünür (10 çiftlik set = 2 etkinlik)
            shuffle($items);
            usort($items, fn($a, $b) => (int) isset($avoid['recent'][$a[2]]) - (int) isset($avoid['recent'][$b[2]]));
            foreach (array_chunk($items, MATCH_SIZE) as $chunk) {
                if (count($chunk) === MATCH_SIZE) $c[] = match_item($t, $set['title'], $chunk);
            }
        }
        if ($t['gen']) {
            $pairs = []; $seen = [];
            for ($i = 0; $i < 30 && count($pairs) < MATCH_SIZE; $i++) {
                $g = ($t['gen'])();
                if (isset($seen[$g['answer']]) || isset($seen['s' . $g['short']])) continue;
                $seen[$g['answer']] = $seen['s' . $g['short']] = true;
                $pairs[] = [$g['short'], $g['answer'], "gm:$tid:" . $g['short']];
            }
            if (count($pairs) === MATCH_SIZE) $c[] = match_item($t, 'İşlemleri sonuçlarıyla eşleştir.', $pairs);
        }
    }
    return $c;
}

// Seçilen konu ve türlerden $n etkinlik üretir
function build_items(array $topicIds, array $types, int $pid, int $n): array
{
    $all = topics_all();
    $topicIds = array_values(array_filter(array_unique($topicIds), fn($id) => isset($all[$id])));
    $types = array_values(array_intersect(ACTIVITY_TYPES, $types)) ?: ACTIVITY_TYPES;
    if (!$topicIds) return [];
    $avoid = ['recent' => recent_keys($pid), 'used' => []];

    // Türler dengeli dağılsın: test ağırlıklı, sonra doğru-yanlış ve eşleştirme
    $weights = ['mc' => 5, 'tf' => 3, 'match' => 2];
    $items = [];
    $order = $topicIds;
    shuffle($order);
    $cache = [];
    for ($slot = 0, $tries = 0; count($items) < $n && $tries < $n * 6; $tries++, $slot++) {
        $tid = $order[$slot % count($order)];
        $ok = array_values(array_intersect($types, topic_types($all[$tid])));
        if (!$ok) continue;
        $bag = [];
        foreach ($ok as $ty) $bag = array_merge($bag, array_fill(0, $weights[$ty], $ty));
        $type = $bag[array_rand($bag)];
        // Üretilen konularda her seferinde yeni aday; bankada önbellek
        $ck = "$tid|$type";
        if (!isset($cache[$ck]) || $all[$tid]['gen']) $cache[$ck] = candidates($tid, $all[$tid], $type, $avoid);
        $it = pick_fresh($cache[$ck], $avoid);
        if (!$it) continue;
        foreach ($it['keys'] as $k) $avoid['used'][$k] = true;
        $items[] = $it;
    }
    shuffle($items);
    return $items;
}

// Öğrenciye giden hâli (cevaplar gizli)
function public_item(array $it): array
{
    $o = ['type' => $it['type'], 'subject' => $it['subject'], 'topic' => $it['topic'], 'text' => $it['text']];
    if ($it['type'] === 'match') { $o['left'] = $it['left']; $o['right'] = $it['right']; }
    else $o['options'] = $it['options'];
    return $o;
}

function item_correct(array $it, $answer): bool
{
    if ($it['type'] === 'match') {
        return is_array($answer) && array_map('intval', array_values($answer)) === array_map('intval', $it['answer']);
    }
    return $answer !== null && !is_array($answer) && (int) $answer === (int) $it['correct'];
}
