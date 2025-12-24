<?php
// api/register.php
// 必须在任何输出之前启动 session
session_start();
require_once __DIR__ . '/db.php';

// 只允许POST请求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// 接收JSON数据
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// 检查 JSON 解析是否成功
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit;
}

if (isset($_GET['debug']) && $_GET['debug'] === '1') {
    echo json_encode([
        'sid' => session_id(),
        'captcha_server' => isset($_SESSION['captcha']) ? $_SESSION['captcha'] : null,
        'captcha_expires' => isset($_SESSION['captcha_expires']) ? $_SESSION['captcha_expires'] : null,
        'cookies' => $_COOKIE
    ]);
    exit;
}

// 验证邮箱和密码是否为空
if (empty($data['email']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password are required']);
    exit;
}

// 验证验证码
if (empty($data['captcha']) || empty($_SESSION['captcha'])) {
    http_response_code(400);
    echo json_encode(['error' => '验证码错误']);
    exit;
}
if (!empty($_SESSION['captcha_expires']) && time() > $_SESSION['captcha_expires']) {
    unset($_SESSION['captcha'], $_SESSION['captcha_expires']);
    http_response_code(400);
    echo json_encode(['error' => '验证码已过期']);
    exit;
}
if (strtoupper($data['captcha']) !== strtoupper($_SESSION['captcha'])) {
    http_response_code(400);
    echo json_encode(['error' => '验证码错误']);
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

// 支持 dryRun 调试，仅校验验证码，不写入数据库
if (isset($_GET['dryRun']) && $_GET['dryRun'] === '1') {
    unset($_SESSION['captcha'], $_SESSION['captcha_expires']);
    echo json_encode(['ok' => true]);
    exit;
}

// 插入用户
try {
    $stmt = $pdo->prepare(
        'INSERT INTO users (email, password) 
         VALUES (?, ?)'
    );
    $stmt->execute([$data['email'], $plainPassword]);

    // 获取自增ID
    $userId = (int)$pdo->lastInsertId();

    // 清除验证码（使用后清除）
    unset($_SESSION['captcha']);

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
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    exit;
}
?>
