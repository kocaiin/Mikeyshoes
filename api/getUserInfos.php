<?php
// api/getUserInfos.php
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    $user_ids = $_GET['user_ids'] ?? '';
    if (empty($user_ids)) {
        echo json_encode([]);
        exit;
    }

    // 拆分用户ID数组
    $user_id_array = array_map('intval', explode(',', $user_ids));
    $inClause = implode(',', array_fill(0, count($user_id_array), '?'));

    // 查询用户基本信息+用户详情
    $stmt = $pdo->prepare("
        SELECT u.id, u.email, ui.name, ui.address, ui.points
        FROM users u
        LEFT JOIN usersInfo ui ON u.id = ui.user_id
        WHERE u.id IN ($inClause)
    ");
    $stmt->execute($user_id_array);
    $userInfos = $stmt->fetchAll();

    // 整理为键值对（user_id => info）
    $result = [];
    foreach ($userInfos as $info) {
        $result[$info['id']] = [
            'email' => $info['email'],
            'name' => $info['name'] ?? '未设置',
            'address' => $info['address'] ?? '未设置',
            'points' => $info['points'] ?? 0
        ];
    }

    echo json_encode($result);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>