// @JSOL v0.2.94 - Targets Configuration Normalizer
const $mNormalizeTargetsConfig = function($mRawConfig) {
    const $mJsConfig = JSOL.dict("default",  "",  "targets",  JSOL.dict());
    const $mPhpConfig = JSOL.dict("default",  "",  "targets",  JSOL.dict());
    const $mTsConfig = JSOL.dict("default",  "",  "targets",  JSOL.dict());
    
    if ($mRawConfig === null) {
        return JSOL.dict("js",  $mJsConfig,  "php",  $mPhpConfig,  "ts",  $mTsConfig);
    }
    
    if (Object.prototype.hasOwnProperty.call($mRawConfig,  "js")) {
        $mJsConfig["default"] = $mRawConfig["js"]["default"] || "";
        $mJsConfig["targets"] = $mRawConfig["js"]["targets"] || JSOL.dict();
    }
    if (Object.prototype.hasOwnProperty.call($mRawConfig,  "php")) {
        $mPhpConfig["default"] = $mRawConfig["php"]["default"] || "";
        $mPhpConfig["targets"] = $mRawConfig["php"]["targets"] || JSOL.dict();
    }
    if (Object.prototype.hasOwnProperty.call($mRawConfig,  "ts")) {
        $mTsConfig["default"] = $mRawConfig["ts"]["default"] || "";
        $mTsConfig["targets"] = $mRawConfig["ts"]["targets"] || JSOL.dict();
    }
    
    if (Object.prototype.hasOwnProperty.call($mRawConfig,  "default") && Object.prototype.hasOwnProperty.call($mRawConfig,  "targets")) {
        $mJsConfig["default"] = $mRawConfig["default"];
        $mPhpConfig["default"] = $mRawConfig["default"];
        $mTsConfig["default"] = $mRawConfig["default"];
        $mJsConfig["targets"] = $mRawConfig["targets"];
        $mPhpConfig["targets"] = $mRawConfig["targets"];
        $mTsConfig["targets"] = $mRawConfig["targets"];
    }
    
    return JSOL.dict("js",  $mJsConfig,  "php",  $mPhpConfig,  "ts",  $mTsConfig);
};