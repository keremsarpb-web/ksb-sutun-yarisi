<?php
// Web sürümü için soru ve etkinlik verisini tek JSON dosyasına aktarır
$out = $argv[1];
$pdo = new PDO('mysql:host=127.0.0.1;dbname=sutun_yarisi;charset=utf8mb4', 'root', '', [PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
$data = ['questions' => [], 'bank' => [], 'topics' => []];
foreach ($pdo->query('SELECT * FROM questions ORDER BY id') as $r) {
    $data['questions'][] = [(int) $r['id'], $r['category'], $r['text'], [$r['a'], $r['b'], $r['c'], $r['d']], (int) $r['correct']];
}
foreach ($pdo->query('SELECT * FROM exam_questions ORDER BY id') as $r) {
    $data['bank'][] = [(int) $r['id'], $r['unit'], $r['text'], [$r['a'], $r['b'], $r['c'], $r['d']], (int) $r['correct'], $r['explanation']];
}
foreach (['matematik', 'fen', 'turkce', 'sosyal', 'ingilizce'] as $f) {
    $d = require __DIR__ . "/../konular/$f.php";
    foreach ($d['topics'] as $id => $t) {
        $data['topics'][] = ['id' => $id, 'subject' => $d['subject'], 'name' => $t['name'], 'bank' => $t['bank'] ?? [],
            'mc' => $t['mc'] ?? [], 'pairs' => $t['pairs'] ?? [], 'tf' => $t['tf'] ?? [], 'gen' => isset($t['gen'])];
    }
}
file_put_contents($out, json_encode($data, JSON_UNESCAPED_UNICODE));
printf("questions %d, bank %d, topics %d, bytes %d\n", count($data['questions']), count($data['bank']), count($data['topics']), filesize($out));
