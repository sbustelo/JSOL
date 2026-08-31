import math
import functools
from jsol_core import JSOL

# @JSOL v0.2.97 - Targets Configuration Normalizer (generic, target-agnostic)
def mNormalizeTargetsConfig(mRawConfig): 

  aTargetIds = list(mBackendRegistry.keys());
  mResult = JSOL.dict();

  i = 0;
  while i < len(aTargetIds): 

    saTargetId = aTargetIds[i];
    mEmptySub = JSOL.dict();
    mResult[saTargetId] = JSOL.dict("default",  "",  "targets",  mEmptySub);

    i = i + 1;


  if mRawConfig == None: 

    return mResult;


  i = 0;
  while i < len(aTargetIds): 

    saTargetId = aTargetIds[i];
    if ( saTargetId in mRawConfig) == True: 

      mSub = mRawConfig[saTargetId];
      if ( "default" in mSub) == True: 

        mResult[saTargetId]["default"] = mSub["default"];


      if ( "targets" in mSub) == True: 

        mResult[saTargetId]["targets"] = mSub["targets"];




    i = i + 1;


  if ( "default" in mRawConfig) == True and ( "targets" in mRawConfig) == True: 

    i = 0;
    while i < len(aTargetIds): 

      saTargetId = aTargetIds[i];
      mResult[saTargetId]["default"] = mRawConfig["default"];
      mResult[saTargetId]["targets"] = mRawConfig["targets"];

      i = i + 1;




  return mResult;


