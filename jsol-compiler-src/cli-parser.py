import math
from jsol_core import JSOL

# @JSOL v0.2.95 - CLI Arguments Parser
def _mParseRawCliArgs(_aRawArgs): 

  _mOptions = JSOL.dict(
  "source",  "", 
  "outDir",  "", 
  "target",  "", 
  "jsTarget",  "", 
  "jsPrefix",  "", 
  "jsSuffix",  "", 
  "phpTarget",  "", 
  "phpPrefix",  "", 
  "phpSuffix",  "", 
  "tsTarget",  "", 
  "tsPrefix",  "", 
  "tsSuffix",  "", 
  "pyTarget",  "", 
  "pyPrefix",  "", 
  "pySuffix",  "", 
  "targets",  ""
  );

  _iCount = len(_aRawArgs);
  _i = 0;
  while _i < _iCount: 

    _sArg = _aRawArgs[_i];
    _bIsFlag = (JSOL.str_index_of(_sArg,  "--") == 0);

    if _bIsFlag == True: 

      _sClean = _sArg[( 2):( 2)+( len(_sArg) - 2)];
      _iEqIndex = JSOL.str_index_of(_sClean,  "=");
      _sKey = "";
      _sVal = "";

      if _iEqIndex != -1: 

        _sKey = _sClean[( 0):( 0)+( _iEqIndex)];
        _sVal = _sClean[( _iEqIndex + 1):( _iEqIndex + 1)+( len(_sClean) - (_iEqIndex + 1))];


      else: 

        _sKey = _sClean;
        _sVal = "true";


      if _sKey == "source": 

        _mOptions["source"] = _sVal;


      if _sKey == "out-dir": 

        _mOptions["outDir"] = _sVal;


      if _sKey == "targets": 

        _mOptions["targets"] = _sVal;


      if _sKey == "target": 

        _mOptions["target"] = _sVal;
        _mOptions["jsTarget"] = _sVal;
        _mOptions["phpTarget"] = _sVal;
        _mOptions["tsTarget"] = _sVal;
        _mOptions["pyTarget"] = _sVal;


      if _sKey == "js-target": 

        _mOptions["jsTarget"] = _sVal;


      if _sKey == "js-prefix": 

        _mOptions["jsPrefix"] = _sVal;


      if _sKey == "js-suffix": 

        _mOptions["jsSuffix"] = _sVal;


      if _sKey == "php-target": 

        _mOptions["phpTarget"] = _sVal;


      if _sKey == "php-prefix": 

        _mOptions["phpPrefix"] = _sVal;


      if _sKey == "php-suffix": 

        _mOptions["phpSuffix"] = _sVal;


      if _sKey == "ts-target": 

        _mOptions["tsTarget"] = _sVal;


      if _sKey == "ts-prefix": 

        _mOptions["tsPrefix"] = _sVal;


      if _sKey == "ts-suffix": 

        _mOptions["tsSuffix"] = _sVal;


      if _sKey == "py-target": 

        _mOptions["pyTarget"] = _sVal;


      if _sKey == "py-prefix": 

        _mOptions["pyPrefix"] = _sVal;


      if _sKey == "py-suffix": 

        _mOptions["pySuffix"] = _sVal;




    _i = _i + 1;


  return _mOptions;


