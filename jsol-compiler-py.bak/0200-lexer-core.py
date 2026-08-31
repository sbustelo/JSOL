import math
import functools
from jsol_core import JSOL

# @JSOL v0.2.97
def mLex_ScanString(saSource, iStart, iLen): 

  saQuote = saSource[( iStart):( iStart)+( 1)];
  i = iStart + 1;
  while i < iLen: 

    saChar = saSource[( i):( i)+( 1)];
    if saChar == "\\": 

      i = i + 2;


    elif saChar == saQuote: 

      return JSOL.dict("end",  i + 1,  "val",  saSource[( iStart):( iStart)+( (i + 1) - iStart)]);


    else: 

      i = i + 1;




  return JSOL.dict("end",  iLen,  "val",  saSource[( iStart):( iStart)+( iLen - iStart)]);


def mLex_ScanLineComment(saSource, iStart, iLen): 

  i = iStart + 2;
  while i < iLen: 

    if saSource[( i):( i)+( 1)] == "\n": 

      return JSOL.dict("end",  i,  "val",  saSource[( iStart):( iStart)+( i - iStart)]);


    i = i + 1;


  return JSOL.dict("end",  iLen,  "val",  saSource[( iStart):( iStart)+( iLen - iStart)]);


def mLex_ScanBlockComment(saSource, iStart, iLen): 

  i = iStart + 2;
  while i < iLen: 

    if saSource[( i):( i)+( 2)] == "*/": 

      return JSOL.dict("end",  i + 2,  "val",  saSource[( iStart):( iStart)+( (i + 2) - iStart)]);


    i = i + 1;


  return JSOL.dict("end",  iLen,  "val",  saSource[( iStart):( iStart)+( iLen - iStart)]);


def mMaskSourceCode(saSourceCode): 

  aTokens = [];
  saResult = "";
  iTokenIndex = 0;
  iLen = len(saSourceCode);
  i = 0;

  while i < iLen: 

    saChar = saSourceCode[( i):( i)+( 1)];
    saNext = saSourceCode[( i + 1):( i + 1)+( 1)];

    if saChar == "\"" or saChar == "'" or saChar == "`": 

      mData = mLex_ScanString(saSourceCode, i, iLen);
      saKey = "".join(JSOL.to_str(_x) for _x in ["__JSOL_STR_",  iTokenIndex,  "__"]);
      aTokens.append( JSOL.dict("key",  saKey,  "value",  mData["val"]));
      saResult = "".join(JSOL.to_str(_x) for _x in [saResult,  saKey]);
      iTokenIndex = iTokenIndex + 1;
      i = mData["end"];


    elif saChar == "/" and saNext == "/": 

      mData = mLex_ScanLineComment(saSourceCode, i, iLen);
      saKey = "".join(JSOL.to_str(_x) for _x in ["__JSOL_COM_",  iTokenIndex,  "__"]);
      aTokens.append( JSOL.dict("key",  saKey,  "value",  mData["val"]));
      saResult = "".join(JSOL.to_str(_x) for _x in [saResult,  saKey]);
      iTokenIndex = iTokenIndex + 1;
      i = mData["end"];


    elif saChar == "/" and saNext == "*": 

      mData = mLex_ScanBlockComment(saSourceCode, i, iLen);
      saKey = "".join(JSOL.to_str(_x) for _x in ["__JSOL_COM_",  iTokenIndex,  "__"]);
      aTokens.append( JSOL.dict("key",  saKey,  "value",  mData["val"]));
      saResult = "".join(JSOL.to_str(_x) for _x in [saResult,  saKey]);
      iTokenIndex = iTokenIndex + 1;
      i = mData["end"];


    else: 

      saResult = "".join(JSOL.to_str(_x) for _x in [saResult,  saChar]);
      i = i + 1;




  return JSOL.dict("maskedCode",  saResult,  "tokens",  aTokens);


def saUnmaskSourceCode(saMaskedCode, aTokens): 

  saRestoredCode = saMaskedCode;
  iTokenCount = len(aTokens);
  i = 0;
  while i < iTokenCount: 

    mToken = aTokens[i];
    saRestoredCode = saRestoredCode.replace( mToken["key"],  mToken["value"]);

    i = i + 1;


  return saRestoredCode;


