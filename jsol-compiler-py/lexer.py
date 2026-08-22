import math
from jsol_core import JSOL

# @JSOL v0.2.93 - Self-Hosted Compiler Lexer Module (regex-free)
def _mMaskSourceCode(_sSourceCode): 

  _aTokens = [];
  _sResult = "";
  _iTokenIndex = 0;
  _iLen = len(_sSourceCode);
  _i = 0;


  while _i < _iLen: 

    _sC = _sSourceCode[( _i):( _i)+( 1)];

    if _sC == "\"" or _sC == "'" or _sC == "`": 

      _sQuoteChar = _sC;
      _iStart = _i;
      _i = _i + 1;
      _bScanning = True;
      while _i < _iLen and _bScanning == True: 

        _sCC = _sSourceCode[( _i):( _i)+( 1)];
        if _sCC == "\\": 

          _i = _i + 2;


        elif _sCC == _sQuoteChar: 

          _i = _i + 1;
          _bScanning = False;


        else: 

          _i = _i + 1;




      _sValue = _sSourceCode[( _iStart):( _iStart)+( _i - _iStart)];
      _sKey = "".join(JSOL.to_str(_x) for _x in ["__JSOL_STR_",  _iTokenIndex,  "__"]);
      _aTokens.append( JSOL.dict("key",  _sKey,  "value",  _sValue));
      _sResult = _sResult + "" + _sKey;
      _iTokenIndex = _iTokenIndex + 1;


    elif _sC == "/" and _sSourceCode[( _i):( _i)+( 2)] == "//": 

      _iStart = _i;
      _bScanning = True;
      while _i < _iLen and _bScanning == True: 

        if _sSourceCode[( _i):( _i)+( 1)] == "\n": 

          _bScanning = False;


        else: 

          _i = _i + 1;




      _sValue = _sSourceCode[( _iStart):( _iStart)+( _i - _iStart)];
      _sKey = "".join(JSOL.to_str(_x) for _x in ["__JSOL_COM_",  _iTokenIndex,  "__"]);
      _aTokens.append( JSOL.dict("key",  _sKey,  "value",  _sValue));
      _sResult = _sResult + "" + _sKey;
      _iTokenIndex = _iTokenIndex + 1;


    elif _sC == "/" and _sSourceCode[( _i):( _i)+( 2)] == "/*": 

      _iStart = _i;
      _i = _i + 2;
      _bScanning = True;
      while _i < _iLen and _bScanning == True: 

        if _sSourceCode[( _i):( _i)+( 2)] == "*/": 

          _i = _i + 2;
          _bScanning = False;


        else: 

          _i = _i + 1;




      _sValue = _sSourceCode[( _iStart):( _iStart)+( _i - _iStart)];
      _sKey = "".join(JSOL.to_str(_x) for _x in ["__JSOL_COM_",  _iTokenIndex,  "__"]);
      _aTokens.append( JSOL.dict("key",  _sKey,  "value",  _sValue));
      _sResult = _sResult + "" + _sKey;
      _iTokenIndex = _iTokenIndex + 1;


    else: 

      _sResult = _sResult + "" + _sC;
      _i = _i + 1;




  return JSOL.dict("maskedCode",  _sResult,  "tokens",  _aTokens);


def _sUnmaskSourceCode(_sMaskedCode, _aTokens): 

  _sRestoredCode = _sMaskedCode;
  _iTokenCount = len(_aTokens);
  _i = 0;
  while _i < _iTokenCount: 

    _mToken = _aTokens[_i];
    _sKey = _mToken["key"];
    _sVal = _mToken["value"];
    _sRestoredCode = _sRestoredCode.replace( _sKey,  _sVal);

    _i = _i + 1;


  return _sRestoredCode;


