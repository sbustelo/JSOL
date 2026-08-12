<?php
// @JSOL v0.2.90 - Targets Configuration Normalizer
$normalizeTargetsConfig = function($rawConfig) {
    $jsConfig = JSOL::dict("default", "", "targets", JSOL::dict());
    $phpConfig = JSOL::dict("default", "", "targets", JSOL::dict());
    if ($rawConfig === null) {
        return JSOL::dict("js", $jsConfig, "php", $phpConfig);
    }
    if (isset($rawConfig[ "js"])) {
        $jsConfig["default"] = $rawConfig["js"]["default"] || "";
        $jsConfig["targets"] = $rawConfig["js"]["targets"] || JSOL::dict();
    }
    if (isset($rawConfig[ "php"])) {
        $phpConfig["default"] = $rawConfig["php"]["default"] || "";
        $phpConfig["targets"] = $rawConfig["php"]["targets"] || JSOL::dict();
    }
    if (isset($rawConfig[ "default"]) && isset($rawConfig[ "targets"])) {
        $jsConfig["default"] = $rawConfig["default"];
        $phpConfig["default"] = $rawConfig["default"];
        $jsConfig["targets"] = $rawConfig["targets"];
        $phpConfig["targets"] = $rawConfig["targets"];
    }
    return JSOL::dict("js", $jsConfig, "php", $phpConfig);
};