import math
from jsol_core import JSOL

# @JSOL v0.2.94 - Self-Hosted JS Target Compiler (Dynamic SSOT Iteration)
def _sCompileToJS(_sMaskedCode, _sPrefix, _sSuffix, _aRules): 

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


  # NEW (v0.2.95): scans literal "function(" occurrences and appends ": any"
  # to every bare parameter that doesn't already carry a type annotation.
  # JSOL params are always plain identifiers (no destructuring, no defaults),
  # so a top-level comma split is sufficient — no bracket counting needed
  # inside the parameter list itself, only to find where it closes.
  def _fProcessParams(_sCode): 

    _sKeyword = "function(";
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
        _iCloseParen = -1;
        _iRLen = len(_sResult);

        _i = _iOpenParen + 1;
        while _i < _iRLen: 

          _sChar = _sResult[( _i):( _i)+( 1)];
          if _sChar == "(": 

            _iParenCount = _iParenCount + 1;


          if _sChar == ")": 

            _iParenCount = _iParenCount - 1;


          if _iParenCount == 0: 

            _iCloseParen = _i;
            break;


          _i = _i + 1;


        if _iCloseParen == -1: 

          _bContinue = False;


        else: 

          _iRawLen = _iCloseParen - _iOpenParen - 1;
          _sRawParams = _sResult[( _iOpenParen + 1):( _iOpenParen + 1)+( _iRawLen)];
          _sTrimmedParams = _sRawParams.strip();

          _sTypedParams = "";
          if len(_sTrimmedParams) > 0: 

            _aParts = _sTrimmedParams.split( ",");
            _iPartsCount = len(_aParts);
            _aTypedParts = [];
            _iP = 0;
            while _iP < _iPartsCount: 

              _sRawPart = _aParts[_iP].strip();
              _sTypedPart = _sRawPart;
              if len(_sRawPart) > 0 and JSOL.str_index_of(_sRawPart,  ":") == -1: 

                _sTypedPart = _sRawPart + ": any";


              _aTypedParts.append( _sTypedPart);

              _iP = _iP + 1;


            _sTypedParams =  ", ".join(str(_x) for _x in _aTypedParts);


          _sBefore = _sResult[( 0):( 0)+( _iOpenParen + 1)];
          _iAfterLen = len(_sResult) - _iCloseParen;
          _sAfter = _sResult[( _iCloseParen):( _iCloseParen)+( _iAfterLen)];

          _sResult = _sBefore + "" + _sTypedParams + "" + _sAfter;
          _iOffset = _iStartIdx + _iKwLen + len(_sTypedParams);






    return _sResult;


  _sTransformed = _sMaskedCode;

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

      _sTransformed = _sRegexReplace(_mRule["search"], _sTemplate, _sTransformed, "g");


    elif _sType == "replace": 

      _sTransformed = _sTransformed.replace( _sId,  _sTemplate);


    elif _sType == "call": 

      _sTransformed = _fProcessCall(_sTransformed, _sId + "(", _sTemplate);


    elif _sType == "paramtype": 

      _sTransformed = _fProcessParams(_sTransformed);


    _iR = _iR + 1;


  _sFinalOutput = _sPrefix + "" + _sTransformed + "" + _sSuffix;
  return _sFinalOutput;


