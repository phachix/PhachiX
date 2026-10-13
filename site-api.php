<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

$file = __DIR__ . "/data/script.json";

if (!file_exists($file)) {
    http_response_code(404);

    echo json_encode([
        "success" => false,
        "error" => "script.json not found"
    ]);

    exit;
}

$content = file_get_contents($file);

$data = json_decode($content, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "error" => "Invalid site.json"
    ]);

    exit;
}

echo json_encode([
    "success" => true,
    "data" => $data
], JSON_UNESCAPED_SLASHES);