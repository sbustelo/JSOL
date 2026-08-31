import math
import functools
from jsol_core import JSOL

# @JSOL v0.2.97 - CLI Arguments Parser (generic, target-agnostic)
#
# No target id is hardcoded here. Any "--<id>-target=", "--<id>-prefix=",
# "--<id>-suffix=" flag is parsed generically into $mOptions[id + "Target"/
# "Prefix"/"Suffix"], for ANY id — adding a new compiler target never
# requires touching this file again.

# Contains the ONLY place "py" gets normalized to "python" in the whole compiler.
# "python" is canonical everywhere else (matches targets/python/rules.json,
# $mSSOT["targets"]["python"], $mBackendRegistry). "py" survives only as the
# CLI's short spelling and the output file extension (handled elsewhere).


def bCli_EndsWith(saStr, saSuffix): 

  iStrLen = len(saStr);
  iSufLen = len(saSuffix);
  if iSufLen > iStrLen: 

    return False;


  return saStr[( iStrLen - iSufLen):( iStrLen - iSufLen)+( iSufLen)] == saSuffix;


def saCli_NormalizeTargetId(saId): 

  if saId == "py": 

    return "python";


  return saId;


def mParseRawCliArgs(aRawArgs): 

  mOptions = JSOL.dict("source",  "",  "sourceDir",  "",  "outDir",  "",  "target",  "",  "targets",  "");
  iCount = len(aRawArgs);

  i = 0;
  while i < iCount: 

    saArg = aRawArgs[i];
    if JSOL.str_index_of(saArg,  "--") == 0: 

      saClean = saArg[( 2):( 2)+( len(saArg) - 2)];
      iEqIndex = JSOL.str_index_of(saClean,  "=");
      saKey = saClean;
      saVal = "true";

      if iEqIndex != -1: 

        saKey = saClean[( 0):( 0)+( iEqIndex)];
        saVal = saClean[( iEqIndex + 1):( iEqIndex + 1)+( len(saClean) - (iEqIndex + 1))];


      if saKey == "source": 

        mOptions["source"] = saVal;


      elif saKey == "source-dir": 

        mOptions["sourceDir"] = saVal;


      elif saKey == "out-dir": 

        mOptions["outDir"] = saVal;


      elif saKey == "targets": 

        mOptions["targets"] = saVal;


      elif saKey == "target": 

        mOptions["target"] = saVal;


      elif bCli_EndsWith(saKey, "-target") == True: 

        mOptions["".join(JSOL.to_str(_x) for _x in [saCli_NormalizeTargetId(saKey[( 0):( 0)+( len(saKey) - 7)]),  "Target"])] = saVal;


      elif bCli_EndsWith(saKey, "-prefix") == True: 

        mOptions["".join(JSOL.to_str(_x) for _x in [saCli_NormalizeTargetId(saKey[( 0):( 0)+( len(saKey) - 7)]),  "Prefix"])] = saVal;


      elif bCli_EndsWith(saKey, "-suffix") == True: 

        mOptions["".join(JSOL.to_str(_x) for _x in [saCli_NormalizeTargetId(saKey[( 0):( 0)+( len(saKey) - 7)]),  "Suffix"])] = saVal;




    i = i + 1;


  return mOptions;


