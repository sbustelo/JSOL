import math
import functools
from jsol_core import JSOL

# @JSOL v0.2.97 - Blind Router for Function Calls (Agnostic SSOT Consumer)

def sResolveShadowMap(saTemplate, aArgs, saMetaShadowRef): 

  sResult = saTemplate;
  bContinue = True;

  while bContinue == True: 

    iRelIdx = JSOL.str_index_of(sResult,  "{shadowMap:");
    if iRelIdx == -1: 

      bContinue = False; continue;


    iStartIdx = iRelIdx;
    iEndIdx = JSOL.str_index_of(sResult[( iStartIdx):( iStartIdx)+( len(sResult) - iStartIdx)],  "}") + iStartIdx;

    if iEndIdx == iStartIdx - 1: 

      bContinue = False; continue;


    saArgIndexStr = sResult[( iStartIdx + 11):( iStartIdx + 11)+( iEndIdx - (iStartIdx + 11))];
    iArgIdx = JSOL.to_int(saArgIndexStr);
    saArgValue = aArgs[iArgIdx];

    sRoot = "";
    iScan = 0;
    if saArgValue[( 0):( 0)+( 1)] == "$": 

      iScan = 1;
      while iScan < len(saArgValue): 

        sC = saArgValue[( iScan):( iScan)+( 1)];
        if sC == "_": 

          iScan = iScan + 1;
          break;


        if sC >= "A" and sC <= "Z": 

          break;


        iScan = iScan + 1;


      sRoot = saArgValue[( iScan):( iScan)+( len(saArgValue) - iScan)];


    else: 

      sClean = saArgValue.replace( "\"",  "");
      sRoot = sClean.replace( "'",  "");


    sRoot = sRoot.lower();

    saShadowRef = saMetaShadowRef.replace( "{root}",  sRoot);

    saBefore = sResult[( 0):( 0)+( iStartIdx)];
    saAfter = sResult[( iEndIdx + 1):( iEndIdx + 1)+( len(sResult) - (iEndIdx + 1))];
    sResult = saBefore + "" + saShadowRef + "" + saAfter;


  return sResult;


def fProcessCall(saCode, saKeyword, saTemplate, saMetaShadowRef): 

  saResult = saCode;
  bContinue = True;
  iOffset = 0;

  while bContinue == True: 

    iSearchLen = len(saResult) - iOffset;
    if iSearchLen <= 0: 

      bContinue = False; continue;


    saSearchArea = saResult[( iOffset):( iOffset)+( iSearchLen)];
    iRelIdx = JSOL.str_index_of(saSearchArea,  saKeyword);
    if iRelIdx == -1: 

      bContinue = False; continue;


    iStartIdx = iOffset + iRelIdx;
    iOpenParen = iStartIdx + len(saKeyword) - 1;

    mData = mComp_ParseArgs(saResult, iOpenParen);
    if mData["close"] == -1: 

      bContinue = False; continue;


    saBefore = saResult[( 0):( 0)+( iStartIdx)];
    saAfter = saResult[( mData["close"] + 1):( mData["close"] + 1)+( len(saResult) - mData["close"] - 1)];
    aArgs = mData["args"];

    saRep = saTemplate;

    if JSOL.str_index_of(saRep,  "{shadowMap:") != -1 and saMetaShadowRef != "": 

      saRep = sResolveShadowMap(saRep, aArgs, saMetaShadowRef);


    if JSOL.str_index_of(saRep,  "{*}") != -1: 

      saRep = saRep.replace( "{*}",   ", ".join(str(_x) for _x in aArgs));


    else: 

      iArgsCount = len(aArgs);
      iK = 0;
      while iK < iArgsCount: 

        saPlaceholder = "".join(JSOL.to_str(_x) for _x in ["{",  iK,  "}"]);
        saRep = saRep.replace( saPlaceholder,  aArgs[iK]);

        iK = iK + 1;




    saResult = saBefore + "" + saRep + "" + saAfter;
    iOffset = iStartIdx + 1;


  return saResult;


