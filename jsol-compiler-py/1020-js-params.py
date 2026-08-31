import math
import functools
from jsol_core import JSOL

# @JSOL v0.2.97
def fProcessParams(saCode): 

  saResult = saCode;
  bContinue = True;
  iOffset = 0;

  while bContinue == True: 

    iSearchLen = len(saResult) - iOffset;
    if iSearchLen <= 0: 

      bContinue = False; continue;


    saSearchArea = saResult[( iOffset):( iOffset)+( iSearchLen)];
    iRelIdx = JSOL.str_index_of(saSearchArea,  "function");
    if iRelIdx == -1: 

      bContinue = False; continue;


    iStartIdx = iOffset + iRelIdx;
    iParenScan = iStartIdx + 8;
    iRLen = len(saResult);

    while iParenScan < iRLen and (saResult[( iParenScan):( iParenScan)+( 1)] == " " or saResult[( iParenScan):( iParenScan)+( 1)] == "\t" or saResult[( iParenScan):( iParenScan)+( 1)] == "\n" or saResult[( iParenScan):( iParenScan)+( 1)] == "\r"): 

      iParenScan = iParenScan + 1;


    if iParenScan >= iRLen or saResult[( iParenScan):( iParenScan)+( 1)] != "(": 

      iOffset = iStartIdx + 8;
      continue;


    iCloseParen = iComp_FindCloseParen(saResult, iParenScan);
    if iCloseParen == -1: 

      bContinue = False; continue;


    saRawParams = saResult[( iParenScan + 1):( iParenScan + 1)+( iCloseParen - iParenScan - 1)];
    saTrimmedParams = saRawParams.strip();
    saTypedParams = "";

    if len(saTrimmedParams) > 0: 

      aParts = JSOL.str_split(saTrimmedParams,  ",");
      iPartsCount = len(aParts);
      aTypedParts = [];
      iP = 0;
      while iP < iPartsCount: 

        saRawPart = aParts[iP].strip();
        saTypedPart = saRawPart;
        if len(saRawPart) > 0 and JSOL.str_index_of(saRawPart,  ":") == -1: 

          saTypedPart = saRawPart + ": any";


        aTypedParts.append( saTypedPart);

        iP = iP + 1;


      saTypedParams =  ", ".join(str(_x) for _x in aTypedParts);


    saBefore = saResult[( 0):( 0)+( iParenScan + 1)];
    saAfter = saResult[( iCloseParen):( iCloseParen)+( len(saResult) - iCloseParen)];

    saResult = saBefore + "" + saTypedParams + "" + saAfter;
    iOffset = iParenScan + 1 + len(saTypedParams) + 1;


  return saResult;


