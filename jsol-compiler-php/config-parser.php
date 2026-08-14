<?php
// @JSOL v0.2.93 - Targets Configuration Normalizer
$mNormalizeTargetsConfig = function($mRawConfig) {
    $mJsConfig = JSOL::dict("default", "", "targets", JSOL::dict());
    $mPhpConfig = JSOL::dict("default", "", "targets", JSOL::dict());
    if ($mRawConfig === null) {
        return JSOL::dict("js", $mJsConfig, "php", $mPhpConfig);
    }
    if (isset($mRawConfig[ "js"])) {
        $mJsConfig["default"] = $mRawConfig["js"]["default"] || "";
        $mJsConfig["targets"] = $mRawConfig["js"]["targets"] || JSOL::dict();
    }
    if (isset($mRawConfig[ "php"])) {
        $mPhpConfig["default"] = $mRawConfig["php"]["default"] || "";
        $mPhpConfig["targets"] = $mRawConfig["php"]["targets"] || JSOL::dict();
    }
    if (isset($mRawConfig[ "default"]) && isset($mRawConfig[ "targets"])) {
        $mJsConfig["default"] = $mRawConfig["default"];
        $mPhpConfig["default"] = $mRawConfig["default"];
        $mJsConfig["targets"] = $mRawConfig["targets"];
        $mPhpConfig["targets"] = $mRawConfig["targets"];
    }
    return JSOL::dict("js", $mJsConfig, "php", $mPhpConfig);
};