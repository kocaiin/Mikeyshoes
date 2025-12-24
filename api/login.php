<?php
// api/login.php
require_once __DIR__ . '/db.php';



if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (empty($data['email']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password are required']);
    exit;
}

// 查询用户（匹配原表结构：仅查询id、email、password）
$stmt = $pdo->prepare('SELECT id, email, password, role FROM users WHERE email = ?');
$stmt->execute([$data['email']]);
$user = $stmt->fetch();

// 验证逻辑：改为直接对比明文密码（生产环境禁止！）
if (!$user || $data['password'] !== $user['password']) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid email or password']);
    exit;
}


unset($user['password']); // 移除明文密码，不返回给前端

echo json_encode([
    'ok' => true,
    'user' => $user
]);
?>