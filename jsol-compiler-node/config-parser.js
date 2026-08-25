// @JSOL v0.2.96 - Targets Configuration Normalizer (generic, target-agnostic)
//
// Iterates over $mBackendRegistry's keys (defined in engine.jsol) instead of
// one hardcoded block per target. Adding a new compiler target never
// requires touching this file again — it just needs an entry in the
// registry, and this picks it up automatically.

const $mNormalizeTargetsConfig = function($mRawConfig) {
  const $aTargetIds = Object.keys($mBackendRegistry);
    const $mResult = JSOL.dict();

    for (let $i = 0; $i < $aTargetIds.length; $i = $i + 1) {
    const $sTargetId = $aTargetIds[$i];
        $mResult[$sTargetId] = JSOL.dict("default",  "",  "targets",  JSOL.dict());
  }
  if ($mRawConfig === null) {
    return $mResult;
  }
  for (let $i = 0; $i < $aTargetIds.length; $i = $i + 1) {
    const $sTargetId = $aTargetIds[$i];
        if (Object.prototype.hasOwnProperty.call($mRawConfig,  $sTargetId) === true) {
      $mResult[$sTargetId]["default"] = $mRawConfig[$sTargetId]["default"] || "";
            $mResult[$sTargetId]["targets"] = $mRawConfig[$sTargetId]["targets"] || JSOL.dict();
    }
  }
  // Global default/targets block applies to every registered target.
    if (Object.prototype.hasOwnProperty.call($mRawConfig,  "default") === true && Object.prototype.hasOwnProperty.call($mRawConfig,  "targets") === true) {
    for (let $i = 0; $i < $aTargetIds.length; $i = $i + 1) {
      const $sTargetId = $aTargetIds[$i];
            $mResult[$sTargetId]["default"] = $mRawConfig["default"];
            $mResult[$sTargetId]["targets"] = $mRawConfig["targets"];
    }
  }
  return $mResult;
};
