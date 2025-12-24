<?php
// api/uploadAvatar.php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once 'db.php';

try {
    $user_id = $_POST['user_id'] ?? '';
    if (empty($user_id) || !is_numeric($user_id)) {
        throw new Exception('用户ID无效');
    }

    // 检查是否有文件上传
    if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('头像文件上传失败');
    }

    $file = $_FILES['avatar'];
    $fileExt = pathinfo($file['name'], PATHINFO_EXTENSION);
    $allowedExts = ['jpg', 'jpeg', 'png', 'gif'];

    // 验证文件类型
    if (!in_array(strtolower($fileExt), $allowedExts)) {
        throw new Exception('仅支持jpg、jpeg、png、gif格式的图片');
    }

    // 生成唯一文件名（避免重复）
    $fileName = uniqid('avatar_') . '.' . $fileExt;
    // 定义存储路径（相对于 api 目录，需先创建 uploads 文件夹）
    $uploadDir = __DIR__ . '/uploads/';
    $uploadPath = $uploadDir . $fileName;
    // 对外访问的路径（根据你的项目部署路径调整）
    $avatarPath = 'http://localhost/shoesEcomerce/api/uploads/' . $fileName;

    // 创建 uploads 文件夹（如果不存在）
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // 移动上传文件
    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        throw new Exception('文件保存失败');
    }

    // 更新 usersInfo 表的 avatar 字段
    // 先检查是否有记录，没有则插入，有则更新
    $stmt = $pdo->prepare('SELECT * FROM usersInfo WHERE user_id = :user_id');
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();
    $exists = $stmt->fetch();

    if ($exists) {
        // 更新
        $stmt = $pdo->prepare('UPDATE usersInfo SET avatar = :avatar WHERE user_id = :user_id');
    } else {
        // 插入（注意：usersInfo 的 user_id 是外键，需确保 users 表中存在该用户，且 name/address 不能为空，这里用默认值）
        $stmt = $pdo->prepare('INSERT INTO usersInfo (user_id, name, address, avatar) VALUES (:user_id, "未设置", "未设置", :avatar)');
    }
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->bindParam(':avatar', $avatarPath);
    $stmt->execute();

    echo json_encode([
        'success' => true,
        'avatarPath' => $avatarPath
    ]);
} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}