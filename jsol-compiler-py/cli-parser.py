import math
from jsol_core import JSOL

# @JSOL v0.2.96 - CLI Arguments Parser (generic, target-agnostic)
#
# No target id is hardcoded here. Any "--<id>-target=", "--<id>-prefix=",
# "--<id>-suffix=" flag is parsed generically into $mOptions[id + "Target"/
# "Prefix"/"Suffix"], for ANY id — adding a new compiler target never
# requires touching this file again.

def bEndsWith(sStr, sSuffix): 

  iStrLen = len(sStr);
  iSufLen = len(sSuffix);
  if iSufLen > iStrLen: 

    return False;


  return sStr[( iStrLen - iSufLen):( iStrLen - iSufLen)+( iSufLen)] == sSuffix;


# The ONLY place "py" gets normalized to "python" in the whole compiler.
# "python" is canonical everywhere else (matches targets/python/rules.json,
# $mSSOT["targets"]["python"], $mBackendRegistry). "py" survives only as the
# CLI's short spelling and the output file extension (handled elsewhere).
def sNormalizeTargetId(sId): 

  if sId == "py": 

    return "python";


  return sId;


def mParseRawCliArgs(aRawArgs): 

  mOptions = JSOL.dict(
  "source",  "", 
  "sourceDir",  "", 
  "outDir",  "", 
  "target",  "", 
  "targets",  ""
  );

  iCount = len(aRawArgs);
  i = 0;
  while i < iCount: 

    sArg = aRawArgs[i];
    bIsFlag = (JSOL.str_index_of(sArg,  "--") == 0);

    if bIsFlag == True: 

      sClean = sArg[( 2):( 2)+( len(sArg) - 2)];
      iEqIndex = JSOL.str_index_of(sClean,  "=");
      sKey = "";
      sVal = "";

      if iEqIndex != -1: 

        sKey = sClean[( 0):( 0)+( iEqIndex)];
        sVal = sClean[( iEqIndex + 1):( iEqIndex + 1)+( len(sClean) - (iEqIndex + 1))];


      else: 

        sKey = sClean;
        sVal = "true";


      if sKey == "source": 

        mOptions["source"] = sVal;


      elif sKey == "source-dir": 

        mOptions["sourceDir"] = sVal;


      elif sKey == "out-dir": 

        mOptions["outDir"] = sVal;


      elif sKey == "targets": 

        mOptions["targets"] = sVal;


      elif sKey == "target": 

        mOptions["target"] = sVal;


      elif bEndsWith(sKey, "-target") == True: 

        sRawId = sKey[( 0):( 0)+( len(sKey) - 7)];
        sId = sNormalizeTargetId(sRawId);
        mOptions[sId + "" + "Target"] = sVal;


      elif bEndsWith(sKey, "-prefix") == True: 

        sRawId = sKey[( 0):( 0)+( len(sKey) - 7)];
        sId = sNormalizeTargetId(sRawId);
        mOptions[sId + "" + "Prefix"] = sVal;


      elif bEndsWith(sKey, "-suffix") == True: 

        sRawId = sKey[( 0):( 0)+( len(sKey) - 7)];
        sId = sNormalizeTargetId(sRawId);
        mOptions[sId + "" + "Suffix"] = sVal;




    i = i + 1;


  return mOptions;


