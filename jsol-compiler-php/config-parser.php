<?php
// @JSOL v0.2.96 - Targets Configuration Normalizer (generic, target-agnostic)
//
// Iterates over $mBackendRegistry's keys (defined in engine.jsol) instead of
// one hardcoded block per target. Adding a new compiler target never
// requires touching this file again — it just needs an entry in the
// registry, and this picks it up automatically.

$mNormalizeTargetsConfig = function($mRawConfig) use (&$mBackendRegistry) {
  $aTargetIds = array_keys($mBackendRegistry);
    $mResult = JSOL::dict();

    for ($i = 0; $i < count($aTargetIds); $i = $i + 1) {
    $sTargetId = $aTargetIds[$i];
        $mResult[$sTargetId] = JSOL::dict("default",  "",  "targets",  JSOL::dict());
  }
  if ($mRawConfig === null) {
    return $mResult;
  }
  for ($i = 0; $i < count($aTargetIds); $i = $i + 1) {
    $sTargetId = $aTargetIds[$i];
        if (isset($mRawConfig[ $sTargetId]) === true) {
      $mResult[$sTargetId]["default"] = $mRawConfig[$sTargetId]["default"] || "";
            $mResult[$sTargetId]["targets"] = $mRawConfig[$sTargetId]["targets"] || JSOL::dict();
    }
  }
  // Global default/targets block applies to every registered target.
    if (isset($mRawConfig[ "default"]) === true && isset($mRawConfig[ "targets"]) === true) {
    for ($i = 0; $i < count($aTargetIds); $i = $i + 1) {
      $sTargetId = $aTargetIds[$i];
            $mResult[$sTargetId]["default"] = $mRawConfig["default"];
            $mResult[$sTargetId]["targets"] = $mRawConfig["targets"];
    }
  }
  return $mResult;
};
