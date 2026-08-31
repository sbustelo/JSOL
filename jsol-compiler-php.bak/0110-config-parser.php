<?php
// @JSOL v0.2.97 - Targets Configuration Normalizer (generic, target-agnostic)
$mNormalizeTargetsConfig = function($mRawConfig) use (&$mBackendRegistry) {
  $aTargetIds = array_keys($mBackendRegistry);
    $mResult = JSOL::dict();

    for ($i = 0; $i < count($aTargetIds); $i = $i + 1) {
    $saTargetId = $aTargetIds[$i];
        $mEmptySub = JSOL::dict();
        $mResult[$saTargetId] = JSOL::dict("default",  "",  "targets",  $mEmptySub);
  }
  if ($mRawConfig === null) {
    return $mResult;
  }
  for ($i = 0; $i < count($aTargetIds); $i = $i + 1) {
    $saTargetId = $aTargetIds[$i];
        if (isset($mRawConfig[ $saTargetId]) === true) {
      $mSub = $mRawConfig[$saTargetId];
            if (isset($mSub[ "default"]) === true) {
        $mResult[$saTargetId]["default"] = $mSub["default"];
      }
      if (isset($mSub[ "targets"]) === true) {
        $mResult[$saTargetId]["targets"] = $mSub["targets"];
      }
    }
  }
  if (isset($mRawConfig[ "default"]) === true && isset($mRawConfig[ "targets"]) === true) {
    for ($i = 0; $i < count($aTargetIds); $i = $i + 1) {
      $saTargetId = $aTargetIds[$i];
            $mResult[$saTargetId]["default"] = $mRawConfig["default"];
            $mResult[$saTargetId]["targets"] = $mRawConfig["targets"];
    }
  }
  return $mResult;
};
