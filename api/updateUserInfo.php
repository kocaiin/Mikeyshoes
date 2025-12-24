<?php
// api/updateUserInfo.php
require_once 'db.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $user_id = $input['user_id'] ?? '';
    $name = $input['name'] ?? '';
    $address = $input['address'] ?? '';

    if (empty($user_id) || !is_numeric($user_id)) {
        throw new Exception('用户ID无效');
    }
    if (empty($name)) {
        throw new Exception('姓名不能为空');
    }
    if (empty($address)) {
        throw new Exception('地址不能为空');
    }

    // 检查用户信息是否存在
    $stmt = $pdo->prepare('SELECT * FROM usersInfo WHERE user_id = :user_id');
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();
    $exists = $stmt->fetch();

    if ($exists) {
        // 更新
        $stmt = $pdo->prepare('UPDATE usersInfo SET name = :name, address = :address WHERE user_id = :user_id');
    } else {
        // 插入（points 默认为 0）
        $stmt = $pdo->prepare('INSERT INTO usersInfo (user_id, name, address, points) VALUES (:user_id, :name, :address, 0)');
    }
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':address', $address);
    $stmt->execute();

    echo json_encode(['success' => true, 'message' => '信息修改成功']);
} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}