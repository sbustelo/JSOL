import math
from jsol_core import JSOL

# @JSOL v0.2.94 - Self-Hosted PHP Target Compiler (Dynamic SSOT Iteration)
def _sCompileToPHP(_sMaskedCode, _sPrefix, _sSuffix, _aRules): 

  def _fProcessBlock(_sCode, _sKeyword, _bUnwrap): 

    _sResult = _sCode;
    _bContinue = True;
    _iOffset = 0;
    while _bContinue == True: 

      _iSearchLen = len(_sResult) - _iOffset;
      if _iSearchLen <= 0: 

        _bContinue = False;
        continue;


      _sSearchArea = _sResult[( _iOffset):( _iOffset)+( _iSearchLen)];
      _iRelIdx = JSOL.str_index_of(_sSearchArea,  _sKeyword);

      if _iRelIdx == -1: 

        _bContinue = False;


      else: 

        _iStartIdx = _iOffset + _iRelIdx;
        _iTailLen = len(_sResult) - _iStartIdx;
        _sTail = _sResult[( _iStartIdx):( _iStartIdx)+( _iTailLen)];
        _iRelOpenBrace = JSOL.str_index_of(_sTail,  "{");
        _iOpenBrace = (-1 if _iRelOpenBrace == -1 else _iStartIdx + _iRelOpenBrace);

        if _iOpenBrace == -1: 

          _bContinue = False;


        else: 

          _iBraceCount = 1;
          _iCloseBrace = -1;
          _iRLen = len(_sResult);
          _i = _iOpenBrace + 1;
          while _i < _iRLen: 

            _sChar = _sResult[( _i):( _i)+( 1)];
            if _sChar == "{": 

              _iBraceCount = _iBraceCount + 1;


            if _sChar == "}": 

              _iBraceCount = _iBraceCount - 1;


            if _iBraceCount == 0: 

              _iCloseBrace = _i;
              break;


            _i = _i + 1;


          if _iCloseBrace == -1: 

            _bContinue = False;


          else: 

            _iEndIdx = _iCloseBrace + 1;
            _bFindingEnd = True;
            while _iEndIdx < _iRLen and _bFindingEnd == True: 

              _sChar = _sResult[( _iEndIdx):( _iEndIdx)+( 1)];
              if _sChar == " " or _sChar == "\n" or _sChar == "\r" or _sChar == ")" or _sChar == ";": 

                _iEndIdx = _iEndIdx + 1;


              else: 

                _bFindingEnd = False;




            _sBefore = _sResult[( 0):( 0)+( _iStartIdx)];
            _iAfterLen = len(_sResult) - _iEndIdx;
            _sAfter = _sResult[( _iEndIdx):( _iEndIdx)+( _iAfterLen)];

            if _bUnwrap == True: 

              _iInnerLen = _iCloseBrace - _iOpenBrace - 1;
              _sInner = _sResult[( _iOpenBrace + 1):( _iOpenBrace + 1)+( _iInnerLen)];
              _sResult = _sBefore + "" + _sInner + "" + _sAfter;
              _iOffset = len(_sBefore) + len(_sInner);


            else: 

              _sResult = _sBefore + "" + _sAfter;
              _iOffset = len(_sBefore);










    return _sResult;


  def _fProcessCall(_sCode, _sKeyword, _sTemplate): 

    _sResult = _sCode;
    _bContinue = True;
    _iOffset = 0;
    while _bContinue == True: 

      _iSearchLen = len(_sResult) - _iOffset;
      if _iSearchLen <= 0: 

        _bContinue = False;
        continue;


      _sSearchArea = _sResult[( _iOffset):( _iOffset)+( _iSearchLen)];
      _iRelIdx = JSOL.str_index_of(_sSearchArea,  _sKeyword);

      if _iRelIdx == -1: 

        _bContinue = False;


      else: 

        _iStartIdx = _iOffset + _iRelIdx;
        _iKwLen = len(_sKeyword);
        _iOpenParen = _iStartIdx + _iKwLen - 1;
        _iParenCount = 1;
        _iBracketCount = 0;
        _iBraceCount = 0;
        _bInStr = False;
        _iCloseParen = -1;
        _aArgs = [];
        _iCurrentArgStart = _iOpenParen + 1;
        _iRLen = len(_sResult);

        _i = _iOpenParen + 1;
        while _i < _iRLen: 

          _sChar = _sResult[( _i):( _i)+( 1)];
          _sPrev = _sResult[( _i - 1):( _i - 1)+( 1)];

          if _sChar == "\"" and _sPrev != "\\": 

            _bInStr = not _bInStr;


          if _bInStr == False: 

            if _sChar == "(": 

              _iParenCount = _iParenCount + 1;


            if _sChar == ")": 

              _iParenCount = _iParenCount - 1;


            if _sChar == "[": 

              _iBracketCount = _iBracketCount + 1;


            if _sChar == "]": 

              _iBracketCount = _iBracketCount - 1;


            if _sChar == "{": 

              _iBraceCount = _iBraceCount + 1;


            if _sChar == "}": 

              _iBraceCount = _iBraceCount - 1;




          if _sChar == "," and _iParenCount == 1 and _iBracketCount == 0 and _iBraceCount == 0 and _bInStr == False: 

            _iArgLen1 = _i - _iCurrentArgStart;
            _sArgVal1 = _sResult[( _iCurrentArgStart):( _iCurrentArgStart)+( _iArgLen1)];
            _aArgs.append( _sArgVal1);
            _iCurrentArgStart = _i + 1;


          elif _iParenCount == 0: 

            _iArgLen2 = _i - _iCurrentArgStart;
            _sArgVal2 = _sResult[( _iCurrentArgStart):( _iCurrentArgStart)+( _iArgLen2)];
            _aArgs.append( _sArgVal2);
            _iCloseParen = _i;
            break;


          _i = _i + 1;


        if _iCloseParen == -1: 

          _bContinue = False;


        else: 

          _sBefore = _sResult[( 0):( 0)+( _iStartIdx)];
          _iAfterLen = len(_sResult) - _iCloseParen - 1;
          _sAfter = _sResult[( _iCloseParen + 1):( _iCloseParen + 1)+( _iAfterLen)];

          _sRep = _sTemplate;
          if JSOL.str_index_of(_sTemplate,  "{*}") != -1: 

            _sRep = _sRep.replace( "{*}",   ", ".join(str(_x) for _x in _aArgs));


          else: 

            _iArgsCount = len(_aArgs);
            _iK = 0;
            while _iK < _iArgsCount: 

              _sPlaceholder = "".join(JSOL.to_str(_x) for _x in ["{",  _iK,  "}"]);
              _sRep = _sRep.replace( _sPlaceholder,  _aArgs[_iK]);

              _iK = _iK + 1;




          _sResult = _sBefore + "" + _sRep + "" + _sAfter;
          _iOffset = _iStartIdx;






    return _sResult;


  _sTransformed = _sMaskedCode;

  # PHP Target Pre-Processing (Native raw manipulations not mapped in SSOT)
  _aPrefixes = ["\n", "\r\n", "\t", " ", "("];
  _iP = 0;
  while _iP < 5: 

    _sTransformed = _sTransformed.replace( _aPrefixes[_iP] + "const ",  _aPrefixes[_iP]);
    _sTransformed = _sTransformed.replace( _aPrefixes[_iP] + "let ",  _aPrefixes[_iP]);
    _sTransformed = _sTransformed.replace( _aPrefixes[_iP] + "var ",  _aPrefixes[_iP]);

    _iP = _iP + 1;


  if JSOL.str_index_of(_sTransformed,  "const ") == 0: 

    _sTransformed = _sTransformed[( 6):( 6)+( len(_sTransformed) - 6)];


  if JSOL.str_index_of(_sTransformed,  "let ") == 0: 

    _sTransformed = _sTransformed[( 4):( 4)+( len(_sTransformed) - 4)];


  if JSOL.str_index_of(_sTransformed,  "var ") == 0: 

    _sTransformed = _sTransformed[( 4):( 4)+( len(_sTransformed) - 4)];


  # Dynamic SSOT Rules Iterator
  _iRulesCount = len(_aRules);
  _iR = 0;
  while _iR < _iRulesCount: 

    _mRule = _aRules[_iR];
    _sType = _mRule["type"];
    _sId = _mRule["id"];
    _sTemplate = _mRule["template"];

    if _sType == "block": 

      _sTransformed = _fProcessBlock(_sTransformed, _sId, _sTemplate == "unwrap");


    elif _sType == "regex": 

      _sTransformed = _sRegexReplace(_mRule["search"], _sTemplate, _sTransformed, 'g');


    elif _sType == "replace": 

      _sTransformed = _sTransformed.replace( _sId,  _sTemplate);


    elif _sType == "call": 

      _sTransformed = _fProcessCall(_sTransformed, _sId + "(", _sTemplate);


    _iR = _iR + 1;


  # PHP Target Post-Processing
  _sTransformed = _sTransformed.replace( 'JSOL.',  'JSOL::');

  _sTransformed = _sRegexReplace('(__JSOL_(TOKEN|STR|COM)_[0-9]+__)\\s*\\+', '$1 .', _sTransformed, 'g');
  _sTransformed = _sRegexReplace('\\+\\s*(__JSOL_(TOKEN|STR|COM)_[0-9]+__)', '. $1', _sTransformed, 'g');

  _sTransformed = _sRegexReplace('(\\$s[A-Za-z0-9_]*)\\s*\\+', '$1 .', _sTransformed, 'g');
  _sTransformed = _sRegexReplace('\\+\\s*(\\$s[A-Za-z0-9_]*)', '. $1', _sTransformed, 'g');

  # ANTI-SABOTAGE: Post-processor to forcibly inject pass-by-reference (&$)
  # to all variables listed inside a PHP `use (...)` block, allowing
  # closures to see themselves and sibling functions upon instantiation.
  _bFixUse = True;
  _iUseOffset = 0;
  while _bFixUse == True: 

    _iSearchLen = len(_sTransformed) - _iUseOffset;
    if _iSearchLen <= 0: 

      _bFixUse = False;
      continue;


    _sSearchArea = _sTransformed[( _iUseOffset):( _iUseOffset)+( _iSearchLen)];
    _iUseRel = JSOL.str_index_of(_sSearchArea,  "use (");

    if _iUseRel == -1: 

      _bFixUse = False;


    else: 

      _iStart = _iUseOffset + _iUseRel + 5;
      _iTailLen = len(_sTransformed) - _iStart;
      _sTail = _sTransformed[( _iStart):( _iStart)+( _iTailLen)];
      _iEndRel = JSOL.str_index_of(_sTail,  ")");
      _iEnd = _iStart + _iEndRel;

      _sArgs = _sTransformed[( _iStart):( _iStart)+( _iEnd - _iStart)];
      _sRefArgs = _sRegexReplace("\\$", "&$", _sArgs, "g");
      _sRefArgs = _sRegexReplace("&&\\$", "&$", _sRefArgs, "g"); # Previene duplicar si ya tenía &

      _sBefore = _sTransformed[( 0):( 0)+( _iStart)];
      _iAfterLen = len(_sTransformed) - _iEnd;
      _sAfter = _sTransformed[( _iEnd):( _iEnd)+( _iAfterLen)];

      _sTransformed = _sBefore + "" + _sRefArgs + "" + _sAfter;
      _iUseOffset = _iStart + len(_sRefArgs) + 1; # Avanza el puntero




  _sFinalOutput = _sPrefix + "" + _sTransformed + "" + _sSuffix;
  if JSOL.str_index_of(_sFinalOutput,  "<?php") == -1: 

    _sFinalOutput = "<?php\n" + _sFinalOutput;


  return _sFinalOutput;


