<?php
// api/buy-with-points.php
require_once 'db.php';

// 开启事务（确保数据一致性）
$pdo->beginTransaction();

try {
    $data = json_decode(file_get_contents('php://input'), true);
    // 验证参数
    $user_id = $data['user_id'] ?? '';
    $cost = $data['cost'] ?? 0;
    $product = $data['product'] ?? [];
    if (empty($user_id) || !is_numeric($user_id) || $cost <= 0 || empty($product['name'])) {
        throw new Exception('参数无效');
    }

    // 1. 查询用户当前积分
    $stmt = $pdo->prepare('SELECT points FROM usersInfo WHERE user_id = :user_id');
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();
    $userInfo = $stmt->fetch();
    if (!$userInfo) {
        throw new Exception('用户未设置积分信息');
    }
    $currentPoints = $userInfo['points'];
    if ($currentPoints < $cost) {
        throw new Exception('积分不足，无法兑换');
    }

    // 2. 扣除积分（更新usersInfo表）
    $newPoints = $currentPoints - $cost;
    $stmt = $pdo->prepare('UPDATE usersInfo SET points = :points WHERE user_id = :user_id');
    $stmt->bindParam(':points', $newPoints, PDO::PARAM_INT);
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();

    // 3. 创建purchase记录
    $total = $cost; // 积分成本作为订单总额
    $created_at = date('Y-m-d H:i:s'); // 当前时间
    $stmt = $pdo->prepare('INSERT INTO purchases (user_id, total, created_at) VALUES (:user_id, :total, :created_at)');
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->bindParam(':total', $total, PDO::PARAM_STR); // DECIMAL类型用PARAM_STR
    $stmt->bindParam(':created_at', $created_at);
    $stmt->execute();
    $purchase_id = $pdo->lastInsertId(); // 获取新增订单的ID

    // 4. 创建purchase_items记录
    $name = $product['name'];
    $price = $product['price'] ?? 0;
    $quantity = $product['quantity'] ?? 1;
    $image = $product['image'] ?? null;
    $stmt = $pdo->prepare('INSERT INTO purchase_items (purchase_id, name, price, quantity, image) VALUES (:purchase_id, :name, :price, :quantity, :image)');
    $stmt->bindParam(':purchase_id', $purchase_id, PDO::PARAM_INT);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':price', $price, PDO::PARAM_STR);
    $stmt->bindParam(':quantity', $quantity, PDO::PARAM_INT);
    $stmt->bindParam(':image', $image);
    $stmt->execute();

    // 提交事务
    $pdo->commit();

    echo json_encode([
        'ok' => true,
        'message' => '兑换成功，积分已扣除',
        'new_points' => $newPoints
    ]);
} catch (Throwable $e) {
    // 回滚事务
    $pdo->rollBack();
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage(), 'message' => $e->getMessage()]);
}
?>