<?php
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    echo json_encode(['message' => 'Method Not Allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$items = isset($input['items']) && is_array($input['items']) ? $input['items'] : [];
$total = isset($input['total']) ? (float) $input['total'] : 0.0;
// 新增：获取前端传递的登录用户ID
$userId = isset($input['userId']) ? (int) $input['userId'] : 0;


if (empty($items) || $userId <= 0) {
    http_response_code(400);
    echo json_encode(['message' => 'No items to save or invalid user.']);
    exit;
}
// --- 新增：检查用户信息 ---
$stmtUserInfo = $pdo->prepare('SELECT name, address FROM usersInfo WHERE user_id = ?');
$stmtUserInfo->execute([$userId]);
$userInfo = $stmtUserInfo->fetch();

if (!$userInfo || empty($userInfo['name']) || empty($userInfo['address'])) {
    http_response_code(400);
    echo json_encode([
        'message' => '请先在个人资料中填写姓名和地址，然后再进行购买。'
    ]);
    exit;
}
try {
    $pdo->beginTransaction();

    // 移除：不再调用默认用户函数
    // $user = getOrCreateDefaultUser($pdo);
    // $userId = (int) $user['id'];

    // 保留原逻辑：插入purchase（使用登录用户的ID）
    $stmtPurchase = $pdo->prepare(
        'INSERT INTO purchases (user_id, total, created_at) VALUES (?, ?, NOW())'
    );
    $stmtPurchase->execute([$userId, number_format($total, 2, '.', '')]);

    $purchaseId = (int) $pdo->lastInsertId();

    // 保留原逻辑：插入purchase_items
    $stmtItem = $pdo->prepare(
        'INSERT INTO purchase_items (purchase_id, name, price, quantity, image) VALUES (?, ?, ?, ?, ?)'
    );

    foreach ($items as $item) {
        $name     = isset($item['name']) ? (string) $item['name'] : '';
        $price    = isset($item['price']) ? (float) $item['price'] : 0.0;
        $quantity = isset($item['quantity']) ? (int) $item['quantity'] : 0;
        $image    = isset($item['image']) ? (string) $item['image'] : null;

        if ($name === '' || $quantity <= 0) {
            continue;
        }

        $stmtItem->execute([
            $purchaseId,
            $name,
            number_format($price, 2, '.', ''),
            $quantity,
            $image,
        ]);
    }

    // 保留原逻辑：更新用户积分（使用登录用户的ID）
    $stmtPoints = $pdo->prepare('UPDATE usersInfo SET points = points + 200 WHERE user_id = ?');
    $stmtPoints->execute([$userId]);

    $pdo->commit();

    echo json_encode(['ok' => true]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode(['message' => 'Failed to save purchase.', 'details' => $e->getMessage()]);
}

?>