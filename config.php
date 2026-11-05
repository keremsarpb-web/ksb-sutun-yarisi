<?php
// MySQL bağlantı bilgileri (XAMPP varsayılanı: root / boş şifre)
const DB_HOST = '127.0.0.1';
// USB sürümü BAŞLAT.bat ile kendi portunu (SY_DB_PORT) verir; XAMPP'ta 3306 kullanılır
define('DB_PORT', (int) (getenv('SY_DB_PORT') ?: 3306));
const DB_NAME = 'sutun_yarisi';
const DB_USER = 'root';
const DB_PASS = '';

function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
    }
    return $pdo;
}
