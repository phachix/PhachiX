<?php

header("Content-Type: application/json; charset=UTF-8");

$API_KEY = "APhachi@-ay";
$DATA_DIR = __DIR__ . "/data";

function response($data, $code = 200) {
    http_response_code($code);
    echo json_encode(
        $data,
        JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
    );
    exit;
}

if (!is_dir($DATA_DIR)) {
    mkdir($DATA_DIR, 0755, true);
}

$headers = getallheaders();
$clientKey = $headers["X-API-Key"] ?? "";

if (!hash_equals($API_KEY, $clientKey)) {
    response([
        "success" => false,
        "error" => "Invalid API key"
    ], 401);
}

function safeName($name) {
    if (!$name) return false;

    if (!preg_match('/^[a-zA-Z0-9_-]+\.json$/', $name)) {
        return false;
    }

    return $name;
}

$method = $_SERVER["REQUEST_METHOD"];
$name = $_GET["name"] ?? "";

if ($method === "GET") {

    if ($name !== "") {

        $safe = safeName($name);

        if (!$safe) {
            response([
                "success" => false,
                "error" => "Invalid file name"
            ], 400);
        }

        $file = $DATA_DIR . "/" . $safe;

        if (!file_exists($file)) {
            response([
                "success" => false,
                "error" => "File not found"
            ], 404);
        }

        response([
            "success" => true,
            "name" => $safe,
            "content" => file_get_contents($file)
        ]);
    }

    $files = [];

    foreach (glob($DATA_DIR . "/*.json") as $file) {
        $files[] = basename($file);
    }

    response([
        "success" => true,
        "files" => $files
    ]);
}

if ($method === "POST") {

    if ($name === "") {
        response([
            "success" => false,
            "error" => "File name missing"
        ], 400);
    }

    $safe = safeName($name);

    if (!$safe) {
        response([
            "success" => false,
            "error" => "Invalid file name"
        ], 400);
    }

    $input = file_get_contents("php://input");

    if ($input === "") {
        response([
            "success" => false,
            "error" => "Empty JSON"
        ], 400);
    }

    json_decode($input);

    if (json_last_error() !== JSON_ERROR_NONE) {
        response([
            "success" => false,
            "error" => "Invalid JSON: " . json_last_error_msg()
        ], 400);
    }

    $file = $DATA_DIR . "/" . $safe;

    if (file_put_contents($file, $input, LOCK_EX) === false) {
        response([
            "success" => false,
            "error" => "Could not save file"
        ], 500);
    }

    response([
        "success" => true,
        "message" => "JSON saved successfully",
        "name" => $safe
    ]);
}

response([
    "success" => false,
    "error" => "Method not allowed"
], 405);