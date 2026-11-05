<?php
require __DIR__ . '/config.php';
require __DIR__ . '/etkinlik.php';
header('Content-Type: application/json; charset=utf-8');

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 5;
const QUEUE_WAIT_MS = 8000;   // 2+ oyuncu olunca maç bu kadar sonra başlar (5 olunca hemen)
const COUNTDOWN_MS = 4000;
const QUESTION_MS = 15000;
const REVEAL_MS = 3500;
const QUESTIONS_PER_MATCH = 10;
const START_LIVES = 3;

// Sınava Hazırlık
const EXAM_SUBJECTS = ['Matematik', 'Fen Bilimleri', 'Türkçe', 'Sosyal Bilgiler', 'İngilizce'];
const EXAM_QUESTIONS = 10;
const EXAM_BOXES_PER_DAY = 3;   // full yapınca kazanılan kutu sınırı (günlük)

const COLORS = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#38d9a9', '#4dabf7', '#748ffc', '#da77f2', '#f783ac', '#8d6e63'];
const EYES = ['normal', 'happy', 'cool', 'sleepy', 'star'];
const SHAPES = ['round', 'square', 'drop', 'cat', 'bear'];
const MOUTHS = ['smile', 'laugh', 'tongue', 'wow', 'cool'];
// Mystery Box ödülleri. Void Aura ayrı: her kutuda %5 şans (VOID_CHANCE).
const LOOT = [
    'common'    => [['hat', 'cap'], ['hat', 'sunhat'], ['hat', 'party'], ['hat', 'beanie'], ['aura', 'leaf'], ['emote', 'fire']],
    'rare'      => [['hat', 'grad'], ['hat', 'helmet'], ['hat', 'chef'], ['hat', 'cowboy'], ['aura', 'ice'], ['aura', 'sakura'], ['emote', 'nerd'], ['emote', 'trophy'], ['emote', 'slay']],
    'epic'      => [['hat', 'tophat'], ['hat', 'wizard'], ['hat', 'viking'], ['hat', 'slayshades'], ['aura', 'fire'], ['aura', 'electric'], ['aura', 'slay'], ['emote', 'hundred'], ['emote', 'griddy']],
    'legendary' => [['hat', 'crown'], ['hat', 'halo'], ['aura', 'rainbow'], ['aura', 'gold'], ['emote', 'party'], ['shape', 'star']],
];
// Kutu türleri: Void şansı %, [efsanevi %, destansı %, nadir %] (kalanı sıradan), coin fiyatı
const BOXES = [
    'classic' => ['price' => 100, 'void' => 5,  'odds' => [4, 12, 30]],
    'gold'    => ['price' => 300, 'void' => 8,  'odds' => [12, 30, 40]],
    'cosmic'  => ['price' => 800, 'void' => 15, 'odds' => [35, 45, 20]],
];
// Çarklar: dilimler [tür, değer, ağırlık]. Günlük çark ücretsiz (günde 1), Altın Çark coin ile.
const WHEELS = [
    'daily' => ['price' => 0, 'slices' => [
        ['coins', 20, 30], ['coins', 50, 24], ['box', 'classic', 14], ['coins', 100, 14],
        ['coins', 200, 8], ['box', 'gold', 6], ['coins', 500, 3], ['box', 'cosmic', 1],
    ]],
    'gold' => ['price' => 150, 'slices' => [
        ['coins', 50, 22], ['coins', 120, 20], ['box', 'classic', 18], ['coins', 300, 14],
        ['box', 'gold', 13], ['coins', 750, 6], ['box', 'cosmic', 5], ['coins', 1500, 2],
    ]],
];
// Coin: doğru cevap/etkinlik başına; takılı auranın değeri kadar yüzde bonus
const COIN_CORRECT = 10;
const COIN_MATCH_ACTIVITY = 15;
const COIN_FULL_BONUS = 50;
const COIN_WIN = 100;
const AURA_RARITY = ['leaf' => 'common', 'ice' => 'rare', 'sakura' => 'rare', 'fire' => 'epic', 'electric' => 'epic', 'slay' => 'epic',
    'rainbow' => 'legendary', 'gold' => 'legendary', 'void' => 'mythic'];
const AURA_BONUS = ['common' => 10, 'rare' => 20, 'epic' => 35, 'legendary' => 50, 'mythic' => 100];

function coin_bonus(string $aura): int { return AURA_BONUS[AURA_RARITY[$aura] ?? ''] ?? 0; }
function coins_for(int $base, string $aura): int { return (int) round($base * (100 + coin_bonus($aura)) / 100); }
function add_coins(int $pid, int $n): void { if ($n > 0) q('UPDATE players SET coins = coins + ? WHERE id = ?', [$n, $pid]); }
function box_kind(string $k): string { return isset(BOXES[$k]) ? $k : 'classic'; }
const VOID_CHANCE = 5; // yüzde
const FREE_EMOTES = ['wave', 'thumbs', 'laugh', 'wow'];
const EMOTE_COOLDOWN_MS = 2500;
const EMOTE_SHOW_MS = 3500;

// Eski veritabanlarını (USB dahil) ilk istekte yeni sürüme getirir
function migrate(): void
{
    if (!q("SHOW COLUMNS FROM match_players LIKE 'emote'")->fetch()) {
        q("ALTER TABLE match_players ADD COLUMN emote VARCHAR(16) NOT NULL DEFAULT '', ADD COLUMN emote_at BIGINT NOT NULL DEFAULT 0");
    }
    if (!q("SHOW COLUMNS FROM players LIKE 'coins'")->fetch()) {
        q("ALTER TABLE players ADD COLUMN coins INT NOT NULL DEFAULT 0, ADD COLUMN last_spin DATE NULL");
    }
    if (!q("SHOW COLUMNS FROM players LIKE 'class_id'")->fetch()) {
        q("ALTER TABLE players ADD COLUMN display_name VARCHAR(30) NOT NULL DEFAULT '', ADD COLUMN class_id INT NULL, ADD INDEX (class_id)");
    }
    if (!q("SHOW COLUMNS FROM exams LIKE 'items'")->fetch()) {
        q("ALTER TABLE exams ADD COLUMN items MEDIUMTEXT NULL, ADD COLUMN coins INT NOT NULL DEFAULT 0, MODIFY subject VARCHAR(40) NOT NULL");
    }
}

function now_ms(): int { return (int) floor(microtime(true) * 1000); }
function out(array $d): void { echo json_encode($d, JSON_UNESCAPED_UNICODE); exit; }
function fail(string $msg, int $code = 400): void { http_response_code($code); out(['error' => $msg]); }

function q(string $sql, array $args = []): PDOStatement
{
    $s = db()->prepare($sql);
    $s->execute($args);
    return $s;
}

function lock(string $name): bool { return (int) q('SELECT GET_LOCK(?, 3)', [$name])->fetchColumn() === 1; }
function unlock(string $name): void { q('SELECT RELEASE_LOCK(?)', [$name]); }

function current_player(array $in): array
{
    $t = $in['token'] ?? '';
    if (!is_string($t) || !preg_match('/^[a-f0-9]{32}$/', $t)) fail('Oturum bulunamadı', 401);
    $p = q('SELECT * FROM players WHERE token = ?', [$t])->fetch();
    if (!$p) fail('Oturum bulunamadı', 401);
    return $p;
}

// "6 a" , "6-a " gibi yazımları "6-A" biçimine getirir
function class_name($raw): string
{
    $name = trim(strip_tags((string) $raw));
    $name = preg_replace('/\s+/u', ' ', $name);
    $name = preg_replace('/^(\d{1,2})\s*[-\/ ]?\s*(\p{L})$/u', '$1-$2', $name);
    return mb_substr(mb_strtoupper($name, 'UTF-8'), 0, 16);
}

// Öğrenci kullanıcı adı: küçük harf, Türkçe harfler sadeleşir (Ali.Yılmaz -> ali.yilmaz)
function username_norm($raw): string
{
    $u = strtr(trim((string) $raw), ['ç' => 'c', 'Ç' => 'c', 'ğ' => 'g', 'Ğ' => 'g', 'ı' => 'i', 'I' => 'i', 'İ' => 'i', 'ö' => 'o', 'Ö' => 'o', 'ş' => 's', 'Ş' => 's', 'ü' => 'u', 'Ü' => 'u', ' ' => '.']);
    return strtolower($u);
}

function public_player(array $p): array
{
    return [
        'id' => (int) $p['id'], 'name' => ($p['display_name'] ?? '') !== '' ? $p['display_name'] : $p['name'], 'color' => $p['color'], 'shape' => $p['shape'], 'eyes' => $p['eyes'], 'mouth' => $p['mouth'],
        'hat' => $p['hat'], 'aura' => $p['aura'], 'wins' => (int) $p['wins'], 'games' => (int) $p['games'],
        'needs_class' => ($p['password_hash'] ?? 'x') === '',
        'role' => $p['role'] ?? 'class',
    ];
}

function current_teacher(array $in): array
{
    $p = current_player($in);
    if ($p['role'] !== 'teacher') fail('Bu işlem yalnızca öğretmen içindir', 403);
    return $p;
}

// Öğretmenin yönettiği hesap: sınıf ya da öğrenci
function class_by_id($id): array
{
    $c = q("SELECT * FROM players WHERE id = ? AND role IN ('class', 'student')", [(int) $id])->fetch();
    if (!$c) fail('Hesap bulunamadı');
    if ($c['role'] === 'student') $c['name'] = $c['display_name'] . ' (' . $c['name'] . ')';
    return $c;
}

function profile(array $p): array
{
    $rows = q('SELECT id, item_type, item_key FROM inventory WHERE player_id = ? ORDER BY id', [$p['id']])->fetchAll();
    $boxes = [];
    $owned = ['hat' => [], 'aura' => [], 'emote' => FREE_EMOTES, 'shape' => SHAPES];
    foreach ($rows as $r) {
        if ($r['item_type'] === 'box') $boxes[] = ['id' => (int) $r['id'], 'kind' => box_kind($r['item_key'])];
        elseif (isset($owned[$r['item_type']]) && !in_array($r['item_key'], $owned[$r['item_type']], true)) $owned[$r['item_type']][] = $r['item_key'];
    }
    $player = public_player($p);
    if ($player['role'] === 'student') {
        $player['username'] = $p['name'];
        $player['class_name'] = $p['class_id'] ? (string) q('SELECT name FROM players WHERE id = ?', [$p['class_id']])->fetchColumn() : '';
    }
    return ['player' => $player, 'boxes' => $boxes, 'owned' => $owned, 'coins' => (int) ($p['coins'] ?? 0),
        'coin_bonus' => coin_bonus((string) $p['aura']), 'free_spin' => ($p['last_spin'] ?? null) !== date('Y-m-d')];
}

function owns(int $pid, string $type, string $key): bool
{
    return (bool) q('SELECT 1 FROM inventory WHERE player_id = ? AND item_type = ? AND item_key = ?', [$pid, $type, $key])->fetchColumn();
}

// ---------- Maç bulma ----------

function matchmake(): void
{
    if (!lock('matchmaking')) return;
    try {
        $now = now_ms();
        q('DELETE FROM queue WHERE last_ping < ?', [$now - 6000]);
        $rows = q('SELECT player_id, joined_at FROM queue ORDER BY joined_at LIMIT ' . MAX_PLAYERS)->fetchAll();
        if (count($rows) < MIN_PLAYERS) return;
        if (count($rows) < MAX_PLAYERS && $now - (int) $rows[MIN_PLAYERS - 1]['joined_at'] < QUEUE_WAIT_MS) return;

        $ids = array_map('intval', array_column($rows, 'player_id'));
        // Oyuncuların son maçlarında çıkan sorular mümkünse tekrar gelmez
        $recent = [];
        $recentMatches = q('SELECT DISTINCT match_id FROM match_players WHERE player_id IN (' . implode(',', $ids) . ') ORDER BY match_id DESC LIMIT 6')->fetchAll(PDO::FETCH_COLUMN);
        if ($recentMatches) {
            foreach (q('SELECT question_ids FROM matches WHERE id IN (' . implode(',', array_map('intval', $recentMatches)) . ')')->fetchAll(PDO::FETCH_COLUMN) as $j) {
                $recent = array_merge($recent, json_decode($j, true) ?: []);
            }
        }
        $not = $recent ? ' WHERE id NOT IN (' . implode(',', array_map('intval', $recent)) . ')' : '';
        $qids = array_map('intval', q('SELECT id FROM questions' . $not . ' ORDER BY RAND() LIMIT ' . QUESTIONS_PER_MATCH)->fetchAll(PDO::FETCH_COLUMN));
        if (count($qids) < QUESTIONS_PER_MATCH) {
            $more = q('SELECT id FROM questions' . ($qids ? ' WHERE id NOT IN (' . implode(',', $qids) . ')' : '') . ' ORDER BY RAND() LIMIT ' . (QUESTIONS_PER_MATCH - count($qids)))->fetchAll(PDO::FETCH_COLUMN);
            $qids = array_merge($qids, array_map('intval', $more));
        }

        $pdo = db();
        $pdo->beginTransaction();
        q('INSERT INTO matches (question_ids, q_index, phase, phase_ends_at) VALUES (?, 0, ?, ?)', [json_encode($qids), 'countdown', $now + COUNTDOWN_MS]);
        $mid = (int) $pdo->lastInsertId();
        foreach ($ids as $pid) {
            q('INSERT INTO match_players (match_id, player_id, lives) VALUES (?, ?, ?)', [$mid, $pid, START_LIVES]);
            q('UPDATE players SET current_match_id = ? WHERE id = ?', [$mid, $pid]);
        }
        q('DELETE FROM queue WHERE player_id IN (' . implode(',', $ids) . ')');
        $pdo->commit();
    } finally {
        unlock('matchmaking');
    }
}

// ---------- Maç akışı ----------

function get_match(int $id): ?array
{
    $m = q('SELECT * FROM matches WHERE id = ?', [$id])->fetch();
    return $m ?: null;
}

function tick(int $id): void
{
    $m = get_match($id);
    if (!$m || $m['phase'] === 'finished') return;
    if ($m['phase'] !== 'question' && now_ms() < (int) $m['phase_ends_at']) return;
    if (!lock("match_$id")) return;
    try {
        $m = get_match($id);
        $now = now_ms();
        $ends = (int) $m['phase_ends_at'];
        if ($m['phase'] === 'countdown' && $now >= $ends) {
            q('UPDATE matches SET phase = ?, phase_ends_at = ? WHERE id = ?', ['question', $now + QUESTION_MS, $id]);
        } elseif ($m['phase'] === 'question') {
            $alive = (int) q('SELECT COUNT(*) FROM match_players WHERE match_id = ? AND alive = 1', [$id])->fetchColumn();
            $answered = (int) q(
                'SELECT COUNT(*) FROM answers a JOIN match_players mp ON mp.match_id = a.match_id AND mp.player_id = a.player_id
                 WHERE a.match_id = ? AND a.q_index = ? AND mp.alive = 1',
                [$id, $m['q_index']]
            )->fetchColumn();
            if ($now >= $ends || $answered >= $alive) resolve_question($m);
        } elseif ($m['phase'] === 'reveal' && $now >= $ends) {
            $alive = (int) q('SELECT COUNT(*) FROM match_players WHERE match_id = ? AND alive = 1', [$id])->fetchColumn();
            $total = count(json_decode($m['question_ids'], true));
            if ($m['q_index'] + 1 >= $total || $alive <= 1) finish_match($m);
            else q('UPDATE matches SET q_index = q_index + 1, phase = ?, phase_ends_at = ? WHERE id = ?', ['question', $now + QUESTION_MS, $id]);
        }
    } finally {
        unlock("match_$id");
    }
}

function resolve_question(array $m): void
{
    $id = (int) $m['id'];
    $qi = (int) $m['q_index'];
    $players = q('SELECT mp.*, p.aura FROM match_players mp JOIN players p ON p.id = mp.player_id WHERE mp.match_id = ? AND mp.alive = 1', [$id])->fetchAll();
    $ans = [];
    foreach (q('SELECT player_id, correct FROM answers WHERE match_id = ? AND q_index = ?', [$id, $qi])->fetchAll() as $a) {
        $ans[(int) $a['player_id']] = (int) $a['correct'];
    }

    // Herkes aynı anda son canını kaybedecekse kimse elenmez
    $survivors = 0;
    foreach ($players as $p) {
        $ok = ($ans[(int) $p['player_id']] ?? 0) === 1;
        if ($ok || (int) $p['lives'] > 1) $survivors++;
    }

    foreach ($players as $p) {
        $pid = (int) $p['player_id'];
        if (($ans[$pid] ?? 0) === 1) {
            q('UPDATE match_players SET height = height + 1, last_result = ?, result_q = ? WHERE match_id = ? AND player_id = ?', ['correct', $qi, $id, $pid]);
            add_coins($pid, coins_for(COIN_CORRECT, (string) $p['aura']));
        } else {
            $lives = (int) $p['lives'] - 1;
            if ($lives < 1 && $survivors === 0) $lives = 1;
            $result = isset($ans[$pid]) ? 'wrong' : 'timeout';
            q(
                'UPDATE match_players SET height = 0, lives = ?, alive = ?, last_result = ?, result_q = ? WHERE match_id = ? AND player_id = ?',
                [$lives, $lives > 0 ? 1 : 0, $result, $qi, $id, $pid]
            );
        }
    }
    q('UPDATE matches SET phase = ?, phase_ends_at = ? WHERE id = ?', ['reveal', now_ms() + REVEAL_MS, $id]);
}

function finish_match(array $m): void
{
    $id = (int) $m['id'];
    $winner = q('SELECT player_id FROM match_players WHERE match_id = ? AND alive = 1 ORDER BY height DESC, lives DESC, RAND() LIMIT 1', [$id])->fetchColumn();
    if (!$winner) $winner = q('SELECT player_id FROM match_players WHERE match_id = ? ORDER BY height DESC LIMIT 1', [$id])->fetchColumn();
    $winner = (int) $winner;

    $pdo = db();
    $pdo->beginTransaction();
    q('UPDATE matches SET phase = ?, winner_id = ? WHERE id = ?', ['finished', $winner, $id]);
    q('UPDATE players p JOIN match_players mp ON mp.player_id = p.id SET p.games = p.games + 1 WHERE mp.match_id = ?', [$id]);
    q('UPDATE players SET wins = wins + 1 WHERE id = ?', [$winner]);
    q('INSERT INTO inventory (player_id, item_type) VALUES (?, ?)', [$winner, 'box']);
    add_coins($winner, coins_for(COIN_WIN, (string) q('SELECT aura FROM players WHERE id = ?', [$winner])->fetchColumn()));
    $pdo->commit();
}

function match_state(int $id, int $me): array
{
    $m = get_match($id);
    $qids = json_decode($m['question_ids'], true);
    $qi = (int) $m['q_index'];
    $question = q('SELECT * FROM questions WHERE id = ?', [$qids[$qi] ?? 0])->fetch();
    $showQ = $m['phase'] !== 'countdown' && $question;
    $reveal = in_array($m['phase'], ['reveal', 'finished'], true);

    $players = q(
        'SELECT p.*, mp.height, mp.lives, mp.alive, mp.last_result, mp.result_q, mp.emote, mp.emote_at,
                (SELECT COUNT(*) FROM answers a WHERE a.match_id = mp.match_id AND a.player_id = mp.player_id AND a.q_index = ?) AS answered
         FROM match_players mp JOIN players p ON p.id = mp.player_id
         WHERE mp.match_id = ? ORDER BY p.id',
        [$qi, $id]
    )->fetchAll();

    $list = [];
    foreach ($players as $p) {
        $list[] = public_player($p) + [
            'height' => (int) $p['height'], 'lives' => (int) $p['lives'], 'alive' => (bool) $p['alive'],
            'last_result' => $p['last_result'], 'result_q' => (int) $p['result_q'], 'answered' => (bool) $p['answered'],
            // emote_at istemcide aynı emote'un tekrarını ayırt etmek için
            'emote' => (int) $p['emote_at'] > now_ms() - EMOTE_SHOW_MS ? $p['emote'] : '',
            'emote_at' => (int) $p['emote_at'],
        ];
    }

    $mine = q('SELECT choice FROM answers WHERE match_id = ? AND player_id = ? AND q_index = ?', [$id, $me, $qi])->fetchColumn();
    $durations = ['countdown' => COUNTDOWN_MS, 'question' => QUESTION_MS, 'reveal' => REVEAL_MS, 'finished' => 1];

    return [
        'id' => $id,
        'phase' => $m['phase'],
        'q_index' => $qi,
        'total' => count($qids),
        'time_left' => max(0, (int) $m['phase_ends_at'] - now_ms()),
        'duration' => $durations[$m['phase']],
        'question' => $showQ ? [
            'category' => $question['category'], 'text' => $question['text'],
            'options' => [$question['a'], $question['b'], $question['c'], $question['d']],
        ] : null,
        'correct' => $reveal && $question ? (int) $question['correct'] : null,
        'my_choice' => $mine === false ? null : (int) $mine,
        'players' => $list,
        'winner_id' => $m['winner_id'] === null ? null : (int) $m['winner_id'],
    ];
}

// ---------- Mystery box ----------

function roll_loot(int $pid, string $kind = 'classic'): array
{
    $box = BOXES[box_kind($kind)];
    // Void Aura (Mitik): klasik kutuda %5. Zaten sende varsa kutu normal çekilişe döner.
    if (random_int(1, 100) <= $box['void'] && !owns($pid, 'aura', 'void')) {
        return ['rarity' => 'mythic', 'type' => 'aura', 'key' => 'void', 'duplicate' => false, 'refund' => 0];
    }
    [$leg, $epic, $rare] = $box['odds'];
    $r = random_int(1, 100);
    $rarity = $r <= $leg ? 'legendary' : ($r <= $leg + $epic ? 'epic' : ($r <= $leg + $epic + $rare ? 'rare' : 'common'));
    $pool = LOOT[$rarity];
    $fresh = array_values(array_filter($pool, fn($it) => !owns($pid, $it[0], $it[1])));
    $pick = $fresh ? $fresh[array_rand($fresh)] : $pool[array_rand($pool)];
    // Sende olan bir eşya tekrar çıkarsa yerine coin verilir
    $refund = $fresh ? 0 : ['common' => 30, 'rare' => 60, 'epic' => 120, 'legendary' => 250][$rarity];
    return ['rarity' => $rarity, 'type' => $pick[0], 'key' => $pick[1], 'duplicate' => !$fresh, 'refund' => $refund];
}

// ---------- İstekler ----------

try {
    migrate();
    $in = json_decode(file_get_contents('php://input'), true) ?: [];
    $action = $_GET['action'] ?? '';

    switch ($action) {
        case 'register':
            $name = class_name($in['name'] ?? '');
            if (mb_strlen($name) < 2) fail('Sınıf adı en az 2 karakter olmalı (ör. 6-A)');
            $password = (string) ($in['password'] ?? '');
            if (mb_strlen($password) < 4) fail('Sınıf şifresi en az 4 karakter olmalı');
            if (q('SELECT 1 FROM players WHERE name = ?', [$name])->fetchColumn()) fail('Bu sınıf zaten kayıtlı. "Giriş yap" sekmesinden sınıf şifresiyle gir.');
            $color = in_array($in['color'] ?? '', COLORS, true) ? $in['color'] : COLORS[5];
            $eyes = in_array($in['eyes'] ?? '', EYES, true) ? $in['eyes'] : 'normal';
            $shape = in_array($in['shape'] ?? '', SHAPES, true) ? $in['shape'] : 'round';
            $mouth = in_array($in['mouth'] ?? '', MOUTHS, true) ? $in['mouth'] : 'smile';
            $token = bin2hex(random_bytes(16));
            try {
                q('INSERT INTO players (token, name, password_hash, color, shape, eyes, mouth) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [$token, $name, password_hash($password, PASSWORD_DEFAULT), $color, $shape, $eyes, $mouth]);
            } catch (PDOException $e) {
                if ($e->getCode() === '23000') fail('Bu sınıf zaten kayıtlı. "Giriş yap" sekmesinden sınıf şifresiyle gir.');
                throw $e;
            }
            q('INSERT INTO inventory (player_id, item_type) VALUES (?, ?)', [(int) db()->lastInsertId(), 'box']); // hoş geldin kutusu
            out(['token' => $token]);

        // Eski (şifresiz) hesabı sınıf hesabına çevirir; kutular ve kozmetikler korunur
        case 'claim_class':
            $p = current_player($in);
            if ($p['password_hash'] !== '') fail('Bu hesap zaten bir sınıf hesabı');
            $name = class_name($in['name'] ?? '');
            if (mb_strlen($name) < 2) fail('Sınıf adı en az 2 karakter olmalı (ör. 6-A)');
            $password = (string) ($in['password'] ?? '');
            if (mb_strlen($password) < 4) fail('Sınıf şifresi en az 4 karakter olmalı');
            if (q('SELECT 1 FROM players WHERE name = ? AND id <> ?', [$name, $p['id']])->fetchColumn()) fail('Bu sınıf adı başka bir hesapta kayıtlı');
            q('UPDATE players SET name = ?, password_hash = ? WHERE id = ?', [$name, password_hash($password, PASSWORD_DEFAULT), $p['id']]);
            out(profile(current_player($in)));

        // Öğrenci kendi hesabını açar. Sınıf şifresini bilmesi, o sınıftan olduğunu gösterir.
        case 'register_student':
            $class = q("SELECT * FROM players WHERE name = ? AND role = 'class'", [class_name($in['class_name'] ?? '')])->fetch();
            if (!$class || $class['password_hash'] === '' || !password_verify((string) ($in['class_password'] ?? ''), $class['password_hash'])) {
                usleep(800000);
                fail('Sınıf adı veya sınıf şifresi yanlış. Sınıf şifresini öğretmeninden öğrenebilirsin.');
            }
            $display = trim(preg_replace('/\s+/u', ' ', strip_tags((string) ($in['display_name'] ?? ''))));
            if (mb_strlen($display) < 2 || mb_strlen($display) > 20 || !preg_match('/^[\p{L} .\-]+$/u', $display)) fail('Adın 2–20 harf olmalı (ör. Ali Y.)');
            $user = username_norm($in['username'] ?? '');
            if (!preg_match('/^[a-z][a-z0-9._]{2,19}$/', $user)) fail('Kullanıcı adı 3–20 karakter olmalı, harfle başlamalı; yalnızca harf, rakam, nokta ve alt çizgi (ör. ali.y)');
            $password = (string) ($in['password'] ?? '');
            if (mb_strlen($password) < 4) fail('Şifren en az 4 karakter olmalı');
            if (q('SELECT 1 FROM players WHERE name = ?', [$user])->fetchColumn()) fail('Bu kullanıcı adı alınmış. Başka bir tane dene (ör. ' . $user . '2)');
            $color = in_array($in['color'] ?? '', COLORS, true) ? $in['color'] : COLORS[5];
            $eyes = in_array($in['eyes'] ?? '', EYES, true) ? $in['eyes'] : 'normal';
            $shape = in_array($in['shape'] ?? '', SHAPES, true) ? $in['shape'] : 'round';
            $mouth = in_array($in['mouth'] ?? '', MOUTHS, true) ? $in['mouth'] : 'smile';
            $token = bin2hex(random_bytes(16));
            try {
                q('INSERT INTO players (token, name, display_name, class_id, role, password_hash, color, shape, eyes, mouth) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [$token, $user, $display, $class['id'], 'student', password_hash($password, PASSWORD_DEFAULT), $color, $shape, $eyes, $mouth]);
            } catch (PDOException $e) {
                if ($e->getCode() === '23000') fail('Bu kullanıcı adı alınmış. Başka bir tane dene.');
                throw $e;
            }
            q('INSERT INTO inventory (player_id, item_type) VALUES (?, ?)', [(int) db()->lastInsertId(), 'box']); // hoş geldin kutusu
            out(['token' => $token]);

        case 'login':
            // Önce öğrenci kullanıcı adı, sonra sınıf/öğretmen adı denenir
            $p = q("SELECT * FROM players WHERE name = ? AND role = 'student'", [username_norm($in['name'] ?? '')])->fetch();
            if (!$p) $p = q("SELECT * FROM players WHERE name = ? AND role <> 'student'", [class_name($in['name'] ?? '')])->fetch();
            if (!$p || !password_verify((string) ($in['password'] ?? ''), $p['password_hash'])) {
                usleep(800000); // şifre denemelerini yavaşlatır
                fail('Ad veya şifre yanlış');
            }
            out(['token' => $p['token']]);

        case 'me':
            out(profile(current_player($in)));

        case 'look':
            $p = current_player($in);
            $color = in_array($in['color'] ?? '', COLORS, true) ? $in['color'] : $p['color'];
            $eyes = in_array($in['eyes'] ?? '', EYES, true) ? $in['eyes'] : $p['eyes'];
            $shape = (string) ($in['shape'] ?? '');
            if (!in_array($shape, SHAPES, true) && !owns((int) $p['id'], 'shape', $shape)) $shape = $p['shape'];
            $mouth = in_array($in['mouth'] ?? '', MOUTHS, true) ? $in['mouth'] : $p['mouth'];
            $hat = (string) ($in['hat'] ?? '');
            $aura = (string) ($in['aura'] ?? '');
            if ($hat !== '' && !owns((int) $p['id'], 'hat', $hat)) $hat = $p['hat'];
            if ($aura !== '' && !owns((int) $p['id'], 'aura', $aura)) $aura = $p['aura'];
            q('UPDATE players SET color = ?, shape = ?, eyes = ?, mouth = ?, hat = ?, aura = ? WHERE id = ?', [$color, $shape, $eyes, $mouth, $hat, $aura, $p['id']]);
            out(profile(current_player($in)));

        case 'open_box':
            $p = current_player($in);
            $boxId = (int) ($in['id'] ?? 0);
            $kind = box_kind((string) q('SELECT item_key FROM inventory WHERE id = ? AND player_id = ? AND item_type = ?', [$boxId, $p['id'], 'box'])->fetchColumn());
            $del = q('DELETE FROM inventory WHERE id = ? AND player_id = ? AND item_type = ?', [$boxId, $p['id'], 'box']);
            if ($del->rowCount() !== 1) fail('Kutu bulunamadı');
            $loot = roll_loot((int) $p['id'], $kind) + ['box' => $kind];
            if ($loot['duplicate']) add_coins((int) $p['id'], $loot['refund']);
            else q('INSERT INTO inventory (player_id, item_type, item_key) VALUES (?, ?, ?)', [$p['id'], $loot['type'], $loot['key']]);
            out(['loot' => $loot] + profile(current_player($in)));

        case 'buy_box':
            $p = current_player($in);
            $kind = (string) ($in['kind'] ?? '');
            if (!isset(BOXES[$kind])) fail('Böyle bir kutu yok');
            $price = BOXES[$kind]['price'];
            if (q('UPDATE players SET coins = coins - ? WHERE id = ? AND coins >= ?', [$price, $p['id'], $price])->rowCount() !== 1) fail('Yeterli coin yok');
            q('INSERT INTO inventory (player_id, item_type, item_key) VALUES (?, ?, ?)', [$p['id'], 'box', $kind === 'classic' ? '' : $kind]);
            out(profile(current_player($in)));

        case 'wheels':
            out(['wheels' => array_map(fn($w) => ['price' => $w['price'], 'slices' => array_map(fn($s) => [$s[0], $s[1]], $w['slices'])], WHEELS),
                'boxes' => array_map(fn($b) => ['price' => $b['price'], 'void' => $b['void'], 'odds' => $b['odds']], BOXES)]);

        case 'spin':
            $p = current_player($in);
            $wk = (string) ($in['wheel'] ?? '');
            if (!isset(WHEELS[$wk])) fail('Böyle bir çark yok');
            $w = WHEELS[$wk];
            if ($w['price'] === 0) {
                $ok = q('UPDATE players SET last_spin = CURDATE() WHERE id = ? AND (last_spin IS NULL OR last_spin < CURDATE())', [$p['id']])->rowCount() === 1;
                if (!$ok) fail('Günlük çarkı bugün çevirdin. Yarın yine gel!');
            } elseif (q('UPDATE players SET coins = coins - ? WHERE id = ? AND coins >= ?', [$w['price'], $p['id'], $w['price']])->rowCount() !== 1) {
                fail('Yeterli coin yok');
            }
            $total = array_sum(array_column($w['slices'], 2));
            $r = random_int(1, $total);
            foreach ($w['slices'] as $idx => $s) { $r -= $s[2]; if ($r <= 0) break; }
            if ($s[0] === 'coins') add_coins((int) $p['id'], $s[1]);
            else q('INSERT INTO inventory (player_id, item_type, item_key) VALUES (?, ?, ?)', [$p['id'], 'box', $s[1] === 'classic' ? '' : $s[1]]);
            out(['slice' => $idx, 'prize' => [$s[0], $s[1]]] + profile(current_player($in)));

        case 'queue_join':
            $p = current_player($in);
            if ($p['current_match_id']) {
                $m = get_match((int) $p['current_match_id']);
                if ($m && $m['phase'] !== 'finished') fail('Zaten bir maçtasın');
                q('UPDATE players SET current_match_id = NULL WHERE id = ?', [$p['id']]);
            }
            $now = now_ms();
            q('INSERT INTO queue (player_id, joined_at, last_ping) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE last_ping = VALUES(last_ping)', [$p['id'], $now, $now]);
            out(['ok' => true]);

        case 'queue_leave':
            $p = current_player($in);
            q('DELETE FROM queue WHERE player_id = ?', [$p['id']]);
            out(['ok' => true]);

        case 'poll':
            $p = current_player($in);
            if (!$p['current_match_id']) {
                $row = q('SELECT * FROM queue WHERE player_id = ?', [$p['id']])->fetch();
                if (!$row) out(['mode' => 'idle']);
                q('UPDATE queue SET last_ping = ? WHERE player_id = ?', [now_ms(), $p['id']]);
                matchmake();
                $p = current_player($in);
            }
            if ($p['current_match_id']) {
                tick((int) $p['current_match_id']);
                out(['mode' => 'match', 'match' => match_state((int) $p['current_match_id'], (int) $p['id'])]);
            }
            $rows = q('SELECT joined_at FROM queue ORDER BY joined_at LIMIT ' . MAX_PLAYERS)->fetchAll(PDO::FETCH_COLUMN);
            $count = (int) q('SELECT COUNT(*) FROM queue')->fetchColumn();
            $startIn = count($rows) >= MIN_PLAYERS ? max(0, (int) $rows[MIN_PLAYERS - 1] + QUEUE_WAIT_MS - now_ms()) : null;
            out(['mode' => 'queue', 'count' => min($count, MAX_PLAYERS), 'max' => MAX_PLAYERS, 'min' => MIN_PLAYERS, 'start_in' => $startIn]);

        case 'answer':
            $p = current_player($in);
            $mid = (int) $p['current_match_id'];
            if (!$mid) fail('Maçta değilsin');
            tick($mid);
            $m = get_match($mid);
            if ($m['phase'] !== 'question') fail('Şu an cevap verilemez');
            $alive = q('SELECT alive FROM match_players WHERE match_id = ? AND player_id = ?', [$mid, $p['id']])->fetchColumn();
            if (!$alive) fail('Elendin, izlemeye devam edebilirsin');
            $choice = (int) ($in['choice'] ?? -1);
            if ($choice < 0 || $choice > 3) fail('Geçersiz seçenek');
            $qid = json_decode($m['question_ids'], true)[(int) $m['q_index']];
            $correct = (int) q('SELECT correct FROM questions WHERE id = ?', [$qid])->fetchColumn();
            q('INSERT IGNORE INTO answers (match_id, player_id, q_index, choice, correct) VALUES (?, ?, ?, ?, ?)',
                [$mid, $p['id'], $m['q_index'], $choice, (int) ($choice === $correct)]);
            tick($mid);
            out(['ok' => true]);

        case 'emote':
            $p = current_player($in);
            $mid = (int) $p['current_match_id'];
            if (!$mid) fail('Maçta değilsin');
            $key = (string) ($in['key'] ?? '');
            if (!in_array($key, FREE_EMOTES, true) && !owns((int) $p['id'], 'emote', $key)) fail('Bu emote sende yok');
            $now = now_ms();
            // Bekleme süresi: üst üste emote atılamaz
            $sent = q('UPDATE match_players SET emote = ?, emote_at = ? WHERE match_id = ? AND player_id = ? AND emote_at < ?',
                [$key, $now, $mid, $p['id'], $now - EMOTE_COOLDOWN_MS])->rowCount();
            out(['ok' => $sent === 1]);

        case 'leave_match':
            $p = current_player($in);
            $mid = (int) $p['current_match_id'];
            if ($mid) {
                $m = get_match($mid);
                if ($m && $m['phase'] !== 'finished') {
                    q('UPDATE match_players SET lives = 0, alive = 0 WHERE match_id = ? AND player_id = ?', [$mid, $p['id']]);
                }
                q('UPDATE players SET current_match_id = NULL WHERE id = ?', [$p['id']]);
            }
            out(['ok' => true]);

        // ---------- Sınava Hazırlık ----------

        case 'exam_catalog':
            out(['catalog' => exam_catalog()]);

        case 'exam_start':
            $p = current_player($in);
            $all = topics_all();
            $subject = (string) ($in['subject'] ?? '');
            $topics = is_array($in['topics'] ?? null) ? array_values(array_filter($in['topics'], 'is_string')) : [];
            $types = is_array($in['types'] ?? null) ? array_values(array_filter($in['types'], 'is_string')) : ACTIVITY_TYPES;
            // Hızlı başlatma: bir dersin ya da bütün derslerin (Karma) tüm konuları
            if (!$topics) {
                if ($subject !== 'Karma' && !in_array($subject, EXAM_SUBJECTS, true)) fail('Geçersiz ders');
                $topics = array_keys(array_filter($all, fn($t) => $subject === 'Karma' || $t['subject'] === $subject));
            }
            $topics = array_values(array_filter($topics, fn($id) => isset($all[$id])));
            if (!$topics) fail('En az bir konu seç');
            $subs = array_unique(array_map(fn($id) => $all[$id]['subject'], $topics));
            $label = count($subs) > 1 ? 'Karma' : $subs[0];
            if (count($topics) === 1) $label = mb_substr($all[$topics[0]]['name'], 0, 40);
            $items = build_items($topics, $types, (int) $p['id'], EXAM_QUESTIONS);
            if (!$items) fail('Bu seçimde soru bulunamadı');
            q('INSERT INTO exams (player_id, subject, question_ids, answers, items) VALUES (?, ?, ?, ?, ?)',
                [$p['id'], $label, '[]', '{}', json_encode($items, JSON_UNESCAPED_UNICODE)]);
            out(['exam_id' => (int) db()->lastInsertId(), 'subject' => $label, 'questions' => array_map('public_item', $items),
                'coin_bonus' => coin_bonus((string) $p['aura'])]);

        case 'exam_answer':
            $p = current_player($in);
            $exam = q('SELECT * FROM exams WHERE id = ? AND player_id = ?', [(int) ($in['exam_id'] ?? 0), $p['id']])->fetch();
            if (!$exam || $exam['finished'] || !$exam['items']) fail('Sınav bulunamadı');
            $items = json_decode($exam['items'], true);
            $index = (int) ($in['index'] ?? -1);
            if (!isset($items[$index])) fail('Geçersiz cevap');
            $it = $items[$index];
            $choice = $in['choice'] ?? null;
            if ($it['type'] === 'match') {
                if (!is_array($choice) || count($choice) !== count($it['left'])) fail('Bütün eşleştirmeleri yap');
                $choice = array_map('intval', array_values($choice));
            } else {
                $choice = (int) $choice;
                if ($choice < 0 || $choice >= count($it['options'])) fail('Geçersiz cevap');
            }
            $answers = json_decode($exam['answers'], true) ?: [];
            if (!isset($answers[$index])) {
                $answers[$index] = $choice;
                q('UPDATE exams SET answers = ? WHERE id = ?', [json_encode($answers, JSON_FORCE_OBJECT), $exam['id']]);
            }
            $ok = item_correct($it, $answers[$index]);
            $base = $it['type'] === 'match' ? COIN_MATCH_ACTIVITY : COIN_CORRECT;
            out(['choice' => $answers[$index], 'correct' => $it['type'] === 'match' ? $it['answer'] : (int) $it['correct'],
                'is_correct' => $ok, 'explanation' => $it['explanation'], 'coins' => $ok ? coins_for($base, (string) $p['aura']) : 0]);

        case 'exam_finish':
            $p = current_player($in);
            $exam = q('SELECT * FROM exams WHERE id = ? AND player_id = ?', [(int) ($in['exam_id'] ?? 0), $p['id']])->fetch();
            if (!$exam || !$exam['items']) fail('Sınav bulunamadı');
            $items = json_decode($exam['items'], true);
            $answers = json_decode($exam['answers'], true) ?: [];
            if (!$exam['finished']) {
                $score = 0; $coins = 0;
                foreach ($items as $i => $it) {
                    if (isset($answers[$i]) && item_correct($it, $answers[$i])) {
                        $score++;
                        $coins += coins_for($it['type'] === 'match' ? COIN_MATCH_ACTIVITY : COIN_CORRECT, (string) $p['aura']);
                    }
                }
                if ($score === count($items) && count($items) >= EXAM_QUESTIONS) $coins += coins_for(COIN_FULL_BONUS, (string) $p['aura']);
                // Sınavı yalnızca bir istek bitirebilir; ödül de yalnızca o istekte verilir
                $claimed = q('UPDATE exams SET finished = 1, score = ?, coins = ? WHERE id = ? AND finished = 0', [$score, $coins, $exam['id']])->rowCount() === 1;
                if ($claimed) {
                    add_coins((int) $p['id'], $coins);
                    if ($score === count($items) && count($items) >= EXAM_QUESTIONS) {
                        $today = (int) q('SELECT COUNT(*) FROM exams WHERE player_id = ? AND rewarded = 1 AND DATE(created_at) = CURDATE()', [$p['id']])->fetchColumn();
                        if ($today < EXAM_BOXES_PER_DAY) {
                            q('UPDATE exams SET rewarded = 1 WHERE id = ?', [$exam['id']]);
                            q('INSERT INTO inventory (player_id, item_type) VALUES (?, ?)', [$p['id'], 'box']);
                        }
                    }
                }
                $exam = q('SELECT * FROM exams WHERE id = ?', [$exam['id']])->fetch();
            }
            $todayBoxes = (int) q('SELECT COUNT(*) FROM exams WHERE player_id = ? AND rewarded = 1 AND DATE(created_at) = CURDATE()', [$p['id']])->fetchColumn();
            out([
                'score' => (int) $exam['score'], 'total' => count($items), 'rewarded' => (bool) $exam['rewarded'],
                'earned' => (int) $exam['coins'],
                'limit_reached' => !$exam['rewarded'] && (int) $exam['score'] === count($items) && count($items) >= EXAM_QUESTIONS,
                'short' => count($items) < EXAM_QUESTIONS,
                'boxes_left_today' => max(0, EXAM_BOXES_PER_DAY - $todayBoxes),
            ] + profile(current_player($in)));

        case 'leaderboard':
            $rows = q('SELECT * FROM players WHERE role = ? AND games > 0 ORDER BY wins DESC, games ASC LIMIT 10', ['class'])->fetchAll();
            $studs = q("SELECT s.*, c.name AS class_label FROM players s LEFT JOIN players c ON c.id = s.class_id
                        WHERE s.role = 'student' AND s.games > 0 ORDER BY s.wins DESC, s.games ASC LIMIT 10")->fetchAll();
            out(['players' => array_map('public_player', $rows),
                'students' => array_map(fn($r) => public_player($r) + ['class_name' => (string) $r['class_label']], $studs)]);

        // ---------- Öğretmen paneli ----------

        case 'set_password': // şifresi olmayan hesap (öğretmen dahil) ilk şifresini belirler
            $p = current_player($in);
            if ($p['password_hash'] !== '') fail('Bu hesabın zaten şifresi var');
            $password = (string) ($in['password'] ?? '');
            if (mb_strlen($password) < 6) fail('Şifre en az 6 karakter olmalı');
            q('UPDATE players SET password_hash = ? WHERE id = ?', [password_hash($password, PASSWORD_DEFAULT), $p['id']]);
            out(profile(current_player($in)));

        case 'teacher_overview':
            current_teacher($in);
            $rows = q(
                "SELECT p.id, p.name, p.role, p.display_name, p.class_id, p.coins, p.color, p.shape, p.eyes, p.mouth, p.hat, p.aura, p.wins, p.games, p.created_at,
                        (SELECT COUNT(*) FROM inventory i WHERE i.player_id = p.id AND i.item_type = 'box') AS boxes,
                        (SELECT COUNT(*) FROM exams e WHERE e.player_id = p.id AND e.finished = 1) AS exams,
                        (SELECT ROUND(AVG(e.score), 1) FROM exams e WHERE e.player_id = p.id AND e.finished = 1) AS avg_score,
                        (SELECT COUNT(*) FROM exams e WHERE e.player_id = p.id AND e.finished = 1 AND e.score = 10) AS fulls
                 FROM players p WHERE p.role IN ('class', 'student') ORDER BY p.name"
            )->fetchAll();
            $classNames = [];
            foreach ($rows as $r) if ($r['role'] === 'class') $classNames[(int) $r['id']] = $r['name'];
            $row = fn($r) => [
                'id' => (int) $r['id'], 'name' => $r['role'] === 'student' ? $r['display_name'] : $r['name'], 'color' => $r['color'], 'shape' => $r['shape'], 'eyes' => $r['eyes'],
                'mouth' => $r['mouth'], 'hat' => $r['hat'], 'aura' => $r['aura'],
                'wins' => (int) $r['wins'], 'games' => (int) $r['games'], 'boxes' => (int) $r['boxes'], 'coins' => (int) $r['coins'],
                'exams' => (int) $r['exams'], 'avg_score' => $r['avg_score'] === null ? null : (float) $r['avg_score'],
                'fulls' => (int) $r['fulls'], 'created_at' => $r['created_at'],
                'username' => $r['role'] === 'student' ? $r['name'] : null,
                'class_id' => $r['class_id'] === null ? null : (int) $r['class_id'],
                'class_name' => $classNames[(int) $r['class_id']] ?? '',
            ];
            $classes = array_values(array_filter($rows, fn($r) => $r['role'] === 'class'));
            $students = array_values(array_filter($rows, fn($r) => $r['role'] === 'student'));
            usort($students, fn($a, $b) => [$classNames[(int) $a['class_id']] ?? 'zz', $a['display_name']] <=> [$classNames[(int) $b['class_id']] ?? 'zz', $b['display_name']]);
            $subjects = q("SELECT eq.subject, COUNT(*) AS answered,
                                  SUM(JSON_EXTRACT(e.answers, CONCAT('$.\"', jt.idx, '\"')) = eq.correct) AS correct
                           FROM exams e
                           JOIN (SELECT 0 idx UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) jt
                           JOIN exam_questions eq ON eq.id = JSON_EXTRACT(e.question_ids, CONCAT('$[', jt.idx, ']'))
                           WHERE e.finished = 1 AND e.player_id IN (SELECT id FROM players WHERE role IN ('class', 'student')) AND JSON_EXTRACT(e.answers, CONCAT('$.\"', jt.idx, '\"')) IS NOT NULL
                           GROUP BY eq.subject ORDER BY eq.subject")->fetchAll();
            // Yeni etkinlik sınavları: sorular sınavın içinde saklı
            $agg = [];
            foreach ($subjects as $s) $agg[$s['subject']] = ['subject' => $s['subject'], 'answered' => (int) $s['answered'], 'correct' => (int) $s['correct']];
            $rowsNew = q("SELECT e.items, e.answers FROM exams e JOIN players p ON p.id = e.player_id WHERE e.finished = 1 AND e.items IS NOT NULL AND p.role IN ('class', 'student')")->fetchAll();
            foreach ($rowsNew as $e) {
                $answers = json_decode($e['answers'], true) ?: [];
                foreach (json_decode($e['items'], true) ?: [] as $i => $it) {
                    if (!isset($answers[$i])) continue;
                    $agg[$it['subject']] ??= ['subject' => $it['subject'], 'answered' => 0, 'correct' => 0];
                    $agg[$it['subject']]['answered']++;
                    if (item_correct($it, $answers[$i])) $agg[$it['subject']]['correct']++;
                }
            }
            ksort($agg);
            $subjects = array_values($agg);
            out([
                'classes' => array_map($row, $classes),
                'students' => array_map($row, $students),
                'subjects' => array_map(fn($s) => [
                    'subject' => $s['subject'], 'answered' => (int) $s['answered'], 'correct' => (int) $s['correct'],
                ], $subjects),
            ]);

        case 'teacher_reset_password':
            current_teacher($in);
            $c = class_by_id($in['class_id'] ?? 0);
            $password = (string) ($in['password'] ?? '');
            if (mb_strlen($password) < 4) fail('Şifre en az 4 karakter olmalı');
            q('UPDATE players SET password_hash = ?, token = ? WHERE id = ?', [password_hash($password, PASSWORD_DEFAULT), bin2hex(random_bytes(16)), $c['id']]);
            out(['ok' => true, 'message' => $c['name'] . ' şifresi değişti. Açık cihazlardan çıkış yapıldı.']);

        case 'teacher_give_box':
            current_teacher($in);
            $c = class_by_id($in['class_id'] ?? 0);
            $count = max(1, min(5, (int) ($in['count'] ?? 1)));
            for ($i = 0; $i < $count; $i++) q('INSERT INTO inventory (player_id, item_type) VALUES (?, ?)', [$c['id'], 'box']);
            out(['ok' => true, 'message' => $c['name'] . ' sınıfına ' . $count . ' Mystery Box verildi.']);

        case 'teacher_delete_class':
            current_teacher($in);
            $c = class_by_id($in['class_id'] ?? 0);
            $pdo = db();
            $pdo->beginTransaction();
            foreach (['inventory', 'queue', 'exams', 'answers', 'match_players'] as $t) {
                q("DELETE FROM $t WHERE player_id = ?", [$c['id']]);
            }
            q('DELETE FROM players WHERE id = ?', [$c['id']]);
            q('UPDATE players SET class_id = NULL WHERE class_id = ?', [$c['id']]);
            $pdo->commit();
            out(['ok' => true, 'message' => $c['name'] . ' silindi.']);

        case 'teacher_reset_season':
            current_teacher($in);
            q("UPDATE players SET wins = 0, games = 0 WHERE role IN ('class', 'student')");
            out(['ok' => true, 'message' => 'Yeni sezon başladı. Bütün sınıfların galibiyetleri sıfırlandı. Kutular ve kozmetikler duruyor.']);

        default:
            fail('Bilinmeyen istek', 404);
    }
} catch (PDOException $e) {
    fail('Veritabanı hatası: config.php ayarlarını ve database.sql kurulumunu kontrol et', 500);
}
