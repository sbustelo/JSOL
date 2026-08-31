// @JSOL v0.2.97 - Targets Configuration Normalizer (generic, target-agnostic)
const $mNormalizeTargetsConfig = function($mRawConfig) {
  const $aTargetIds = Object.keys($mBackendRegistry);
    const $mResult = JSOL.dict();

    for (let $i = 0; $i < $aTargetIds.length; $i = $i + 1) {
    const $saTargetId = $aTargetIds[$i];
        const $mEmptySub = JSOL.dict();
        $mResult[$saTargetId] = JSOL.dict("default",  "",  "targets",  $mEmptySub);
  }
  if ($mRawConfig === null) {
    return $mResult;
  }
  for (let $i = 0; $i < $aTargetIds.length; $i = $i + 1) {
    const $saTargetId = $aTargetIds[$i];
        if (Object.prototype.hasOwnProperty.call($mRawConfig,  $saTargetId) === true) {
      const $mSub = $mRawConfig[$saTargetId];
            if (Object.prototype.hasOwnProperty.call($mSub,  "default") === true) {
        $mResult[$saTargetId]["default"] = $mSub["default"];
      }
      if (Object.prototype.hasOwnProperty.call($mSub,  "targets") === true) {
        $mResult[$saTargetId]["targets"] = $mSub["targets"];
      }
    }
  }
  if (Object.prototype.hasOwnProperty.call($mRawConfig,  "default") === true && Object.prototype.hasOwnProperty.call($mRawConfig,  "targets") === true) {
    for (let $i = 0; $i < $aTargetIds.length; $i = $i + 1) {
      const $saTargetId = $aTargetIds[$i];
            $mResult[$saTargetId]["default"] = $mRawConfig["default"];
            $mResult[$saTargetId]["targets"] = $mRawConfig["targets"];
    }
  }
  return $mResult;
};
