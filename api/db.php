<?php
// api/db.php
// Simple PDO connection helper for MySQL (XAMPP).
// Adjust the DB name / user / password if your XAMPP config is different.

header('Content-Type: application/json; charset=utf-8');

// CORS with credentials support
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : 'http://localhost';
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dbHost = 'localhost';
$dbName = 'shoes_ecommerce'; // ← create this database in phpMyAdmin or change to your own name
$dbUser = 'root';            // ← default XAMPP user
$dbPass = '';                // ← default XAMPP password (empty)
$charset = 'utf8mb4';

$dsn = "mysql:host=$dbHost;dbname=$dbName;charset=$charset";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $dbUser, $dbPass, $options);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok'      => false,
        'message' => 'Database connection failed',
        'error'   => $e->getMessage(),
    ]);
    exit;
}

?>
