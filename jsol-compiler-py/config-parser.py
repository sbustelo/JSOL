import math
from jsol_core import JSOL

# @JSOL v0.2.96 - Targets Configuration Normalizer (generic, target-agnostic)
#
# Iterates over $mBackendRegistry's keys (defined in engine.jsol) instead of
# one hardcoded block per target. Adding a new compiler target never
# requires touching this file again — it just needs an entry in the
# registry, and this picks it up automatically.

def mNormalizeTargetsConfig(mRawConfig): 

  aTargetIds = list(mBackendRegistry.keys());
  mResult = JSOL.dict();

  i = 0;
  while i < len(aTargetIds): 

    sTargetId = aTargetIds[i];
    mResult[sTargetId] = JSOL.dict("default",  "",  "targets",  JSOL.dict());

    i = i + 1;


  if mRawConfig == None: 

    return mResult;


  i = 0;
  while i < len(aTargetIds): 

    sTargetId = aTargetIds[i];
    if ( sTargetId in mRawConfig) == True: 

      mResult[sTargetId]["default"] = mRawConfig[sTargetId]["default"] or "";
      mResult[sTargetId]["targets"] = mRawConfig[sTargetId]["targets"] or JSOL.dict();


    i = i + 1;


  # Global default/targets block applies to every registered target.
  if ( "default" in mRawConfig) == True and ( "targets" in mRawConfig) == True: 

    i = 0;
    while i < len(aTargetIds): 

      sTargetId = aTargetIds[i];
      mResult[sTargetId]["default"] = mRawConfig["default"];
      mResult[sTargetId]["targets"] = mRawConfig["targets"];

      i = i + 1;




  return mResult;


