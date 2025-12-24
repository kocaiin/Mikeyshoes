<?php
// api/getUserInfo.php
require_once 'db.php';

try {
    $user_id = $_GET['user_id'] ?? '';
    if (empty($user_id) || !is_numeric($user_id)) {
        throw new Exception('用户ID无效');
    }

    // 查询 usersInfo 表（关联 users 表的 points？不，usersInfo 表有 points 字段）
    $stmt = $pdo->prepare('
        SELECT ui.name, ui.address, ui.avatar, ui.points 
        FROM usersInfo ui 
        WHERE ui.user_id = :user_id
    ');
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();
    $userInfo = $stmt->fetch();

    if (!$userInfo) {
        // 如果 usersInfo 中没有记录，返回默认值（可根据业务调整）
        $userInfo = [
            'name' => '未设置',
            'address' => '未设置',
            'avatar' => '',
            'points' => 0,
        ];
    }

    echo json_encode($userInfo);
} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}