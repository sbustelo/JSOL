import math
from jsol_core import JSOL

# @JSOL v0.2.94 - Self-Hosted Compiler Linter Module (Dynamic SSOT Validation)
def _bIsWordChar(_sCh): 

  if _sCh == "": 

    return False;


  _iCode = ord(_sCh[ 0]);
  if _iCode >= 48 and _iCode <= 57: 

    return True;


  if _iCode >= 65 and _iCode <= 90: 

    return True;


  if _iCode >= 97 and _iCode <= 122: 

    return True;


  if _iCode == 95: 

    return True;


  return False;


def _mAuditPragma(_sSourceCode): 

  _aErrors = [];
  _bHasPragma = False;
  _iLen = len(_sSourceCode);

  _i = 0;
  _bSkipping = True;
  while _i < _iLen and _bSkipping == True: 

    _sC = _sSourceCode[( _i):( _i)+( 1)];
    if _sC == " " or _sC == "\t" or _sC == "\n" or _sC == "\r": 

      _i = _i + 1;


    else: 

      _bSkipping = False;




  if _sSourceCode[( _i):( _i)+( 2)] == "//": 

    _iLineEnd = _i;
    _bScanning = True;
    while _iLineEnd < _iLen and _bScanning == True: 

      if _sSourceCode[( _iLineEnd):( _iLineEnd)+( 1)] == "\n": 

        _bScanning = False;


      else: 

        _iLineEnd = _iLineEnd + 1;




    _sFirstLine = _sSourceCode[( _i):( _i)+( _iLineEnd - _i)];
    if JSOL.str_index_of(_sFirstLine,  "@JSOL") != -1 or JSOL.str_index_of(_sFirstLine,  "// JSOL") != -1: 

      _bHasPragma = True;




  if _bHasPragma == False: 

    _aErrors.append( "Fatal: Missing MANDATORY @JSOL pragma on Line 1.");


  return JSOL.dict("valid",  len(_aErrors) == 0,  "errors",  _aErrors);


def _mAuditForbiddenPatterns(_sMaskedCode): 

  _aErrors = [];

  _aFunctionalMethods = [".map(", ".filter(", ".reduce(", ".forEach(", ".find("];
  _bHasFunctionalMethods = False;
  _iFmCount = len(_aFunctionalMethods);
  _iFm = 0;
  while _iFm < _iFmCount: 

    if JSOL.str_index_of(_sMaskedCode,  _aFunctionalMethods[_iFm]) != -1: 

      _bHasFunctionalMethods = True;


    _iFm = _iFm + 1;


  if _bHasFunctionalMethods == True: 

    _aErrors.append( "Linter Error: Functional array methods (.map, .filter, etc.) are FORBIDDEN. Use imperative for/while loops.");


  _bHasLengthProperty = False;
  _iMLen = len(_sMaskedCode);
  _iP = 0;
  while _iP < _iMLen: 

    if _sMaskedCode[( _iP):( _iP)+( 7)] == ".length": 

      _sNextChar = _sMaskedCode[( _iP + 7):( _iP + 7)+( 1)];
      if _bIsWordChar(_sNextChar) == False: 

        _bHasLengthProperty = True;
        break;




    _iP = _iP + 1;


  if _bHasLengthProperty == True: 

    _aErrors.append( "Linter Error: Accessing .length is FORBIDDEN. Use Arr.count() for arrays or Str.len() for strings.");


  if JSOL.str_index_of(_sMaskedCode,  "with (") != -1 or JSOL.str_index_of(_sMaskedCode,  "with(") != -1: 

    _aErrors.append( "Linter Error: The 'with' statement is FORBIDDEN.");


  return JSOL.dict("valid",  len(_aErrors) == 0,  "errors",  _aErrors);


def _mAuditStrictTyping(_sMaskedCode, _mSSOT): 

  _aErrors = [];
  _iLen = len(_sMaskedCode);

  _i = 0;
  while _i < _iLen: 

    if _sMaskedCode[( _i):( _i)+( 1)] == "$": 

      _iJ = _i + 1;
      while _iJ < _iLen and _bIsWordChar(_sMaskedCode[( _iJ):( _iJ)+( 1)]): 

        _iJ = _iJ + 1;


      _sVarName = _sMaskedCode[( _i):( _i)+( _iJ - _i)];

      if JSOL.str_index_of(_sVarName,  '$_') == 0: 

        _iBack = _i - 1;
        while _iBack >= 0 and (_sMaskedCode[( _iBack):( _iBack)+( 1)] == " " or _sMaskedCode[( _iBack):( _iBack)+( 1)] == "\t" or _sMaskedCode[( _iBack):( _iBack)+( 1)] == "\n"): 

          _iBack = _iBack - 1;


        if _iBack >= 2 and _sMaskedCode[( _iBack - 2):( _iBack - 2)+( 3)] == "let": 

          _aErrors.append( "Linter Error: Variable '" + _sVarName + "' uses reserved internal prefix '" + '$_' + "' in declaration.");


        elif _iBack >= 4 and _sMaskedCode[( _iBack - 4):( _iBack - 4)+( 5)] == "const": 

          _aErrors.append( "Linter Error: Variable '" + _sVarName + "' uses reserved internal prefix '" + '$_' + "' in declaration.");


        _i = _iJ - 1;
        continue;


      _sPrefix = "";
      _iK = 1;
      _iVarLen = len(_sVarName);
      while _iK < _iVarLen: 

        _iCode = ord(_sVarName[ _iK]);
        if _iCode >= 97 and _iCode <= 122: 

          _sPrefix = _sPrefix + "" + chr(_iCode);
          _iK = _iK + 1;


        else: 

          break;




      if len(_sPrefix) == 0: 

        if len(_sVarName) > 1: 

          _aErrors.append( "Linter Error: Variable '" + _sVarName + "' lacks a valid lowercase type prefix.");




      else: 

        _bValid = False;
        _aTypes = list(_mSSOT["types"]["core"].keys());
        _iTCount = len(_aTypes);

        _iT = 0;
        while _iT < _iTCount: 

          _aAliases = _mSSOT["types"]["core"][_aTypes[_iT]];
          if JSOL.arr_index_of(_aAliases,  _sPrefix) != -1: 

            _bValid = True;
            break;


          _iT = _iT + 1;


        if _bValid == False: 

          _aReserved = _mSSOT["types"]["reserved"];
          if JSOL.arr_index_of(_aReserved,  _sPrefix) != -1: 

            _aErrors.append( "Linter Error: Type prefix '" + _sPrefix + "' in variable '" + _sVarName + "' is RESERVED and not implemented.");
            _bValid = True;




        if _bValid == False: 

          _aErrors.append( "Linter Error: Unknown type prefix '" + _sPrefix + "' in variable '" + _sVarName + "'. No truncation fallback allowed.");




      _i = _iJ - 1;


    _i = _i + 1;


  return JSOL.dict("valid",  len(_aErrors) == 0,  "errors",  _aErrors);


