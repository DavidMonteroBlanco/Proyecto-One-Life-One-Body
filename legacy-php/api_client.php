<?php

function api_get($path) {
    global $API_BASE;

    $url = rtrim($API_BASE, "/") . "/" . ltrim($path, "/");

    $context = stream_context_create([
        "http" => [
            "method" => "GET",
            "timeout" => 4,
            "header" => "Accept: application/json\r\n"
        ]
    ]);

    $json = @file_get_contents($url, false, $context);
    if ($json === false) return [];

    $data = json_decode($json, true);
    return is_array($data) ? $data : [];
}

function api_site_value($siteList, $key, $default = "") {
    foreach ($siteList as $item) {
        if (($item["key"] ?? "") === $key) return $item["value"] ?? $default;
    }
    return $default;
}
