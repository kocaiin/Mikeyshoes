<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
// 处理预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
// api/get-purchases.php
require_once __DIR__ . '/db.php';

// 处理删除订单请求（新增）
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['purchase_id']) || !is_numeric($data['purchase_id'])) {
            http_response_code(400);
            echo json_encode(['message' => '无效的订单ID']);
            exit;
        }

        // 删除订单（外键会自动删除关联的purchase_items）
        $stmt = $pdo->prepare('DELETE FROM purchases WHERE id = ?');
        $stmt->execute([$data['purchase_id']]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(['message' => '订单删除成功']);
        } else {
            http_response_code(404);
            echo json_encode(['message' => '订单不存在']);
        }
        exit;
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['message' => '删除订单失败', 'details' => $e->getMessage()]);
        exit;
    }
}

// 原有查询逻辑（修改：新增返回purchase_id，保留原有字段）
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    header('Allow: GET, DELETE');
    echo json_encode(['message' => 'Method Not Allowed']);
    exit;
}

try {
    // Fetch purchases
    $stmt = $pdo->query(
        'SELECT id, user_id, total, created_at
         FROM purchases
         ORDER BY created_at DESC'
    );
    $purchases = $stmt->fetchAll();

    if (!$purchases) {
        echo json_encode(['orders' => [], 'userIds' => []]); // 补全userIds为空数组
        exit;
    }

    $purchaseIds = array_column($purchases, 'id');
    $userIds = array_column($purchases, 'user_id');

    // Fetch items for all purchases（原有逻辑不变）
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

    // 整理订单数据（新增：purchase_id、user_id）
    $orders = [];
    foreach ($purchases as $p) {
        $pid = (int) $p['id'];
        $orders[] = [
            'purchaseId' => $pid, // 新增：订单ID，用于删除
            'userId'     => (int) $p['user_id'], // 新增：用户ID，用于关联用户信息
            'items'      => $itemsByPurchase[$pid] ?? [],
            'total'      => (float) $p['total'],
            'createdAt'  => $p['created_at'],
        ];
    }

    echo json_encode([
        'orders' => $orders,
        'userIds' => array_values(array_unique($userIds))
    ]);
    
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Failed to fetch purchases.', 'details' => $e->getMessage()]);
}
?>