<?php
// api/get-points.php
require_once 'db.php';

try {
    // 接收前端传递的user_id（POST/GET均可，这里用POST更安全）
    $data = json_decode(file_get_contents('php://input'), true);
    $user_id = $data['user_id'] ?? $_GET['user_id'] ?? '';
    
    if (empty($user_id) || !is_numeric($user_id)) {
        throw new Exception('用户ID无效');
    }

    // 查询usersInfo表的积分
    $stmt = $pdo->prepare('SELECT points FROM usersInfo WHERE user_id = :user_id');
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();
    $userInfo = $stmt->fetch();

    // 若没有记录，积分默认0
    $points = $userInfo ? $userInfo['points'] : 0;

    echo json_encode(['points' => $points]);
} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>