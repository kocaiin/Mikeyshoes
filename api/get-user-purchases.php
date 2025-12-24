<?php
// api/get-user-purchases.php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
header("Access-Control-Allow-Credentials: true");

// 处理预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

// 仅允许GET请求
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    header('Allow: GET');
    echo json_encode(['message' => 'Method Not Allowed']);
    exit;
}

try {
    // 获取前端传入的user_id，验证有效性
    $user_id = $_GET['user_id'] ?? '';
    // validate and cast the user id coming from the client
    if (!filter_var($user_id, FILTER_VALIDATE_INT)) {
        http_response_code(400);
        echo json_encode(['message' => '无效的用户ID']);
        exit;
    }
    $user_id = (int) $user_id;

    // 仅查询当前用户的订单（核心过滤逻辑）
    $stmt = $pdo->prepare(
        'SELECT id, user_id, total, created_at
         FROM purchases
         WHERE user_id = ?
         ORDER BY created_at DESC'
    );
    $stmt->execute([$user_id]);
    $purchases = $stmt->fetchAll();

    if (!$purchases) {
        echo json_encode(['orders' => []]);
        exit;
    }

    $purchaseIds = array_column($purchases, 'id');

    // 读取订单关联的商品（复用原有逻辑）
    $inClause = implode(',', array_fill(0, count($purchaseIds), '?'));
    $stmtItems = $pdo->prepare(
        "SELECT purchase_id, name, price, quantity, image
         FROM purchase_items
         WHERE purchase_id IN ($inClause)"
    );
    $stmtItems->execute($purchaseIds);
    $itemsRows = $stmtItems->fetchAll();

    $itemsByPurchase = [];
    foreach ($itemsRows as $row) {
        $pid = (int) $row['purchase_id'];
        if (!isset($itemsByPurchase[$pid])) {
            $itemsByPurchase[$pid] = [];
        }
        $itemsByPurchase[$pid][] = [
            'name'     => $row['name'],
            'price'    => (float) $row['price'],
            'quantity' => (int) $row['quantity'],
            'image'    => $row['image'] ?? null,
        ];
    }

    // 整理订单数据（与get-purchases.php返回格式一致）
    $orders = [];
    foreach ($purchases as $p) {
        $pid = (int) $p['id'];
        $orders[] = [
            'purchaseId' => $pid,
            'userId'     => (int) $p['user_id'],
            'items'      => $itemsByPurchase[$pid] ?? [],
            'total'      => (float) $p['total'],
            'createdAt'  => $p['created_at'],
        ];
    }

    echo json_encode(['orders' => $orders]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['message' => '获取订单失败', 'details' => $e->getMessage()]);
}
?>