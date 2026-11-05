<?php
// Yeni sürüm yayınlarken bu numarayı artır: açık uygulamalar güncellemeyi kendiliğinden alır.
const APP_VERSION = '1.8.0';

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'version.php') {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode(['version' => APP_VERSION]);
}
