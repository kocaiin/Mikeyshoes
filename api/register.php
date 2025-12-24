<?php
// api/register.php
require_once __DIR__ . '/db.php';

// 只允许POST请求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// 接收JSON数据
$data = json_decode(file_get_contents('php://input'), true);

// 验证邮箱和密码是否为空
if (empty($data['email']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Email password 验证码 are required']);
    exit;
}

// 检查邮箱是否已存在
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$data['email']]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Email already registered']);
    exit;
}

// 【明文存储】直接使用原始密码，不进行哈希（注意：生产环境强烈不建议）
$plainPassword = $data['password'];

// 插入用户（匹配原表结构：email、password、created_at）
$stmt = $pdo->prepare(
    'INSERT INTO users (email, password) 
     VALUES (?, ?)'
);
$stmt->execute([$data['email'], $plainPassword]);

// 获取自增ID
$userId = (int)$pdo->lastInsertId();

// 响应数据（可选：显示明文密码，根据需求决定是否返回）
echo json_encode([
    'ok' => true,
    'user' => [
        'id' => $userId,
        'email' => $data['email'],
        'password' => $plainPassword, // 明文显示（可选，建议生产环境移除）
        'created_at' => date('Y-m-d H:i:s') // 可选：返回创建时间
    ]
]);
?>