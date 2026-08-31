declare var JSOL: any;
declare var Rgx: any;
declare var Str: any;
declare var Arr: any;
declare var Bool: any;
declare var Cast: any;

// @JSOL v0.2.97 - Targets Configuration Normalizer (generic, target-agnostic)
const $mNormalizeTargetsConfig = function($mRawConfig: any): Record<string, any> {
  const $aTargetIds: any[] = Object.keys($mBackendRegistry);
    const $mResult: Record<string, any> = JSOL.dict();

    for (let $i = 0; $i < $aTargetIds.length; $i = $i + 1) {
    const $saTargetId: string = $aTargetIds[$i];
        const $mEmptySub: Record<string, any> = JSOL.dict();
        $mResult[$saTargetId] = JSOL.dict("default",  "",  "targets",  $mEmptySub);
  }
  if ($mRawConfig === null) {
    return $mResult;
  }
  for (let $i = 0; $i < $aTargetIds.length; $i = $i + 1) {
    const $saTargetId: string = $aTargetIds[$i];
        if (Object.prototype.hasOwnProperty.call($mRawConfig,  $saTargetId) === true) {
      const $mSub: Record<string, any> = $mRawConfig[$saTargetId];
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
      const $saTargetId: string = $aTargetIds[$i];
            $mResult[$saTargetId]["default"] = $mRawConfig["default"];
            $mResult[$saTargetId]["targets"] = $mRawConfig["targets"];
    }
  }
  return $mResult;
};
