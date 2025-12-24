<?php
// api/captcha.php
// 开启输出缓冲，确保没有意外输出
ob_start();

session_start();

error_reporting(0);
ini_set('display_errors', 0);

if (!extension_loaded('gd')) {
    ob_clean();
    http_response_code(503);
    exit;
}

// 清除输出缓冲，确保没有意外输出
ob_clean();

// 设置 headers
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : 'http://localhost';
header('Content-Type: image/png');
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Credentials: true');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

try {
    // 生成随机验证码
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $code = '';
    for ($i = 0; $i < 4; $i++) {
        $code .= $chars[random_int(0, strlen($chars)-1)];
    }
    $_SESSION['captcha'] = $code;
    $_SESSION['captcha_expires'] = time() + 180;

    // 图片尺寸
    $width = 150;
    $height = 50;
    $img = imagecreatetruecolor($width, $height);
    
    if (!$img) {
        throw new Exception('Failed to create image');
    }

    // 背景颜色
    $bgColor = imagecolorallocate($img, rand(200,255), rand(200,255), rand(200,255));
    imagefill($img, 0, 0, $bgColor);

    // 字体路径
    $font = __DIR__ . '/fonts/ARIAL.TTF';

    // 字体颜色
    $colors = [
        imagecolorallocate($img, 0, 0, 0),
        imagecolorallocate($img, 30, 30, 30),
        imagecolorallocate($img, 50, 50, 100),
    ];

    // 检查字体文件是否存在，如果不存在则使用内置字体
    if (file_exists($font)) {
        // 使用 TTF 字体
        for ($i = 0; $i < strlen($code); $i++) {
            $angle = rand(-20, 20);
            $size = rand(22, 28);
            $x = 15 + $i * 30;
            $y = rand(30, 40);
            imagettftext($img, $size, $angle, $x, $y, $colors[array_rand($colors)], $font, $code[$i]);
        }
    } else {
        // 使用内置字体（GD 库内置字体）
        for ($i = 0; $i < strlen($code); $i++) {
            $x = 15 + $i * 30;
            $y = 35;
            imagestring($img, 5, $x, $y, $code[$i], $colors[array_rand($colors)]);
        }
    }

    // 干扰线
    for ($i = 0; $i < 5; $i++) {
        $lineColor = imagecolorallocate($img, rand(100,150), rand(100,150), rand(100,150));
        imageline($img, rand(0,$width), rand(0,$height), rand(0,$width), rand(0,$height), $lineColor);
    }

    // 输出 PNG
    if (isset($_GET['debug']) && $_GET['debug'] === '1') {
        header("X-Captcha-Code: $code");
    }
    imagepng($img);
    imagedestroy($img);
    
} catch (Exception $e) {
    // 如果出错，输出一个简单的错误图片
    ob_clean();
    $img = imagecreatetruecolor(150, 50);
    $bg = imagecolorallocate($img, 255, 0, 0);
    $text = imagecolorallocate($img, 255, 255, 255);
    imagefill($img, 0, 0, $bg);
    imagestring($img, 2, 10, 15, 'Error', $text);
    imagepng($img);
    imagedestroy($img);
}

// 结束输出缓冲并发送内容
ob_end_flush();
exit;
