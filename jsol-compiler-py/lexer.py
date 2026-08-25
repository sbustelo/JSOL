import math
from jsol_core import JSOL

# @JSOL v0.2.93 - Self-Hosted Compiler Lexer Module (regex-free)
def mMaskSourceCode(sSourceCode): 

  aTokens = [];
  sResult = "";
  iTokenIndex = 0;
  iLen = len(sSourceCode);
  i = 0;


  while i < iLen: 

    sC = sSourceCode[( i):( i)+( 1)];

    if sC == "\"" or sC == "'" or sC == "`": 

      sQuoteChar = sC;
      iStart = i;
      i = i + 1;
      bScanning = True;
      while i < iLen and bScanning == True: 

        sCC = sSourceCode[( i):( i)+( 1)];
        if sCC == "\\": 

          i = i + 2;


        elif sCC == sQuoteChar: 

          i = i + 1;
          bScanning = False;


        else: 

          i = i + 1;




      sValue = sSourceCode[( iStart):( iStart)+( i - iStart)];
      sKey = "".join(JSOL.to_str(_x) for _x in ["__JSOL_STR_",  iTokenIndex,  "__"]);
      aTokens.append( JSOL.dict("key",  sKey,  "value",  sValue));
      sResult = sResult + "" + sKey;
      iTokenIndex = iTokenIndex + 1;


    elif sC == "/" and sSourceCode[( i):( i)+( 2)] == "//": 

      iStart = i;
      bScanning = True;
      while i < iLen and bScanning == True: 

        if sSourceCode[( i):( i)+( 1)] == "\n": 

          bScanning = False;


        else: 

          i = i + 1;




      sValue = sSourceCode[( iStart):( iStart)+( i - iStart)];
      sKey = "".join(JSOL.to_str(_x) for _x in ["__JSOL_COM_",  iTokenIndex,  "__"]);
      aTokens.append( JSOL.dict("key",  sKey,  "value",  sValue));
      sResult = sResult + "" + sKey;
      iTokenIndex = iTokenIndex + 1;


    elif sC == "/" and sSourceCode[( i):( i)+( 2)] == "/*": 

      iStart = i;
      i = i + 2;
      bScanning = True;
      while i < iLen and bScanning == True: 

        if sSourceCode[( i):( i)+( 2)] == "*/": 

          i = i + 2;
          bScanning = False;


        else: 

          i = i + 1;




      sValue = sSourceCode[( iStart):( iStart)+( i - iStart)];
      sKey = "".join(JSOL.to_str(_x) for _x in ["__JSOL_COM_",  iTokenIndex,  "__"]);
      aTokens.append( JSOL.dict("key",  sKey,  "value",  sValue));
      sResult = sResult + "" + sKey;
      iTokenIndex = iTokenIndex + 1;


    else: 

      sResult = sResult + "" + sC;
      i = i + 1;




  return JSOL.dict("maskedCode",  sResult,  "tokens",  aTokens);


def sUnmaskSourceCode(sMaskedCode, aTokens): 

  sRestoredCode = sMaskedCode;
  iTokenCount = len(aTokens);
  i = 0;
  while i < iTokenCount: 

    mToken = aTokens[i];
    sKey = mToken["key"];
    sVal = mToken["value"];
    sRestoredCode = sRestoredCode.replace( sKey,  sVal);

    i = i + 1;


  return sRestoredCode;


