<?php
// @JSOL v0.2.94 - Targets Configuration Normalizer
$mNormalizeTargetsConfig = function($mRawConfig) {
    $mJsConfig = JSOL::dict("default",  "",  "targets",  JSOL::dict());
    $mPhpConfig = JSOL::dict("default",  "",  "targets",  JSOL::dict());
    $mTsConfig = JSOL::dict("default",  "",  "targets",  JSOL::dict());
    
    if ($mRawConfig === null) {
        return JSOL::dict("js",  $mJsConfig,  "php",  $mPhpConfig,  "ts",  $mTsConfig);
    }
    
    if (isset($mRawConfig[ "js"])) {
        $mJsConfig["default"] = $mRawConfig["js"]["default"] || "";
        $mJsConfig["targets"] = $mRawConfig["js"]["targets"] || JSOL::dict();
    }
    if (isset($mRawConfig[ "php"])) {
        $mPhpConfig["default"] = $mRawConfig["php"]["default"] || "";
        $mPhpConfig["targets"] = $mRawConfig["php"]["targets"] || JSOL::dict();
    }
    if (isset($mRawConfig[ "ts"])) {
        $mTsConfig["default"] = $mRawConfig["ts"]["default"] || "";
        $mTsConfig["targets"] = $mRawConfig["ts"]["targets"] || JSOL::dict();
    }
    
    if (isset($mRawConfig[ "default"]) && isset($mRawConfig[ "targets"])) {
        $mJsConfig["default"] = $mRawConfig["default"];
        $mPhpConfig["default"] = $mRawConfig["default"];
        $mTsConfig["default"] = $mRawConfig["default"];
        $mJsConfig["targets"] = $mRawConfig["targets"];
        $mPhpConfig["targets"] = $mRawConfig["targets"];
        $mTsConfig["targets"] = $mRawConfig["targets"];
    }
    
    return JSOL::dict("js",  $mJsConfig,  "php",  $mPhpConfig,  "ts",  $mTsConfig);
};