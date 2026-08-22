import math
from jsol_core import JSOL

# @JSOL v0.2.93 - Pure JSOL Regex Engine (Thompson VM)

def _mParseAtom(_sPat, _i, _iN, _iGc, _mFns): 

  _sC = _sPat[( _i):( _i)+( 1)];
  if _sC == "(": 

    _i = _i + 1;
    _bCapturing = True;
    if _i + 1 < _iN and _sPat[( _i):( _i)+( 2)] == "?:": 

      _bCapturing = False;
      _i = _i + 2;


    _iIdx = -1;
    if _bCapturing == True: 

      _iGc = _iGc + 1;
      _iIdx = _iGc;


    _fPAltFn = _mFns["parseAlt"];
    _mR = _fPAltFn(_sPat, _i, _iN, _iGc, _mFns);
    _mBody = _mR["node"];
    _i = _mR["i"];
    _iGc = _mR["groupCount"];
    _i = _i + 1;
    return JSOL.dict("node",  JSOL.dict("type",  "group",  "index",  _iIdx,  "capturing",  _bCapturing,  "body",  _mBody),  "i",  _i,  "groupCount",  _iGc);


  if _sC == "[": 

    _i = _i + 1;
    _bNegate = False;
    if _i < _iN and _sPat[( _i):( _i)+( 1)] == "^": 

      _bNegate = True;
      _i = _i + 1;


    _aRanges = [];
    _aSingles = [];
    _bFirst = True;
    while _i < _iN and (_sPat[( _i):( _i)+( 1)] != "]" or _bFirst): 

      _bFirst = False;
      _sCh = _sPat[( _i):( _i)+( 1)];
      _bIsShorthand = False;
      if _sCh == "\\": 

        _i = _i + 1;
        _sE = _sPat[( _i):( _i)+( 1)];
        if _sE == "d": 

          _aR09 = ["0", "9"]; _aRanges.append( _aR09);
          _bIsShorthand = True;
          _i = _i + 1;


        elif _sE == "w": 

          _aRaz = ["a", "z"]; _aRanges.append( _aRaz);
          _aRAZ = ["A", "Z"]; _aRanges.append( _aRAZ);
          _aR09w = ["0", "9"]; _aRanges.append( _aR09w);
          _aSingles.append( "_");
          _bIsShorthand = True;
          _i = _i + 1;


        elif _sE == "s": 

          _aSingles.append( " "); _aSingles.append( "\t"); _aSingles.append( "\n"); _aSingles.append( "\r");
          _bIsShorthand = True;
          _i = _i + 1;


        else: 

          _sCh = _sE;
          _i = _i + 1;




      else: 

        _i = _i + 1;


      if _bIsShorthand == True: 

        continue;


      if _i < _iN and _sPat[( _i):( _i)+( 1)] == "-" and _i + 1 < _iN and _sPat[( _i + 1):( _i + 1)+( 1)] != "]": 

        _i = _i + 1;
        _sCh2 = _sPat[( _i):( _i)+( 1)];
        if _sCh2 == "\\": 

          _i = _i + 1;
          _sCh2 = _sPat[( _i):( _i)+( 1)];
          _i = _i + 1;


        else: 

          _i = _i + 1;


        _aRng = [_sCh, _sCh2];
        _aRanges.append( _aRng);


      else: 

        _aSingles.append( _sCh);




    _i = _i + 1;
    return JSOL.dict("node",  JSOL.dict("type",  "class",  "negate",  _bNegate,  "ranges",  _aRanges,  "singles",  _aSingles),  "i",  _i,  "groupCount",  _iGc);


  if _sC == ".": 

    _i = _i + 1;
    return JSOL.dict("node",  JSOL.dict("type",  "any"),  "i",  _i,  "groupCount",  _iGc);


  if _sC == "^": 

    _i = _i + 1;
    return JSOL.dict("node",  JSOL.dict("type",  "anchorStart"),  "i",  _i,  "groupCount",  _iGc);


  if _sC == "$": 

    _i = _i + 1;
    return JSOL.dict("node",  JSOL.dict("type",  "anchorEnd"),  "i",  _i,  "groupCount",  _iGc);


  if _sC == "\\": 

    _i = _i + 1;
    _sE = _sPat[( _i):( _i)+( 1)];
    _i = _i + 1;
    if _sE == "d": 

      _aRd = [["0", "9"]]; return JSOL.dict("node",  JSOL.dict("type",  "class",  "negate",  False,  "ranges",  _aRd,  "singles",  []),  "i",  _i,  "groupCount",  _iGc);


    if _sE == "w": 

      _aRw = [["a", "z"], ["A", "Z"], ["0", "9"]]; _aSw = ["_"]; return JSOL.dict("node",  JSOL.dict("type",  "class",  "negate",  False,  "ranges",  _aRw,  "singles",  _aSw),  "i",  _i,  "groupCount",  _iGc);


    if _sE == "s": 

      _aSs = [" ", "\t", "\n", "\r"]; return JSOL.dict("node",  JSOL.dict("type",  "class",  "negate",  False,  "ranges",  [],  "singles",  _aSs),  "i",  _i,  "groupCount",  _iGc);


    return JSOL.dict("node",  JSOL.dict("type",  "char",  "value",  _sE),  "i",  _i,  "groupCount",  _iGc);


  _i = _i + 1;
  return JSOL.dict("node",  JSOL.dict("type",  "char",  "value",  _sC),  "i",  _i,  "groupCount",  _iGc);


def _mParseQuantified(_sPat, _i, _iN, _iGc, _mFns): 

  _fPaFn = _mFns["parseAtom"];
  _mR = _fPaFn(_sPat, _i, _iN, _iGc, _mFns);
  _mAtom = _mR["node"];
  _i = _mR["i"];
  _iGc = _mR["groupCount"];

  while _i < _iN: 

    _sC = _sPat[( _i):( _i)+( 1)];
    if _sC == "*": 

      _i = _i + 1;
      _bLazy = False;
      if _i < _iN and _sPat[( _i):( _i)+( 1)] == "?": 

        _bLazy = True; _i = _i + 1;


      _mAtom = JSOL.dict("type",  "rep",  "min",  0,  "max",  999999,  "lazy",  _bLazy,  "body",  _mAtom);


    elif _sC == "+": 

      _i = _i + 1;
      _bLazy = False;
      if _i < _iN and _sPat[( _i):( _i)+( 1)] == "?": 

        _bLazy = True; _i = _i + 1;


      _mAtom = JSOL.dict("type",  "rep",  "min",  1,  "max",  999999,  "lazy",  _bLazy,  "body",  _mAtom);


    elif _sC == "?": 

      _i = _i + 1;
      _bLazy = False;
      if _i < _iN and _sPat[( _i):( _i)+( 1)] == "?": 

        _bLazy = True; _i = _i + 1;


      _mAtom = JSOL.dict("type",  "rep",  "min",  0,  "max",  1,  "lazy",  _bLazy,  "body",  _mAtom);


    else: 

      break;




  return JSOL.dict("node",  _mAtom,  "i",  _i,  "groupCount",  _iGc);


def _mParseConcat(_sPat, _i, _iN, _iGc, _mFns): 

  _aParts = [];
  _fPqFn = _mFns["parseQuantified"];
  while _i < _iN and _sPat[( _i):( _i)+( 1)] != "|" and _sPat[( _i):( _i)+( 1)] != ")": 

    _mR = _fPqFn(_sPat, _i, _iN, _iGc, _mFns);
    _aParts.append( _mR["node"]);
    _i = _mR["i"];
    _iGc = _mR["groupCount"];


  return JSOL.dict("node",  JSOL.dict("type",  "concat",  "parts",  _aParts),  "i",  _i,  "groupCount",  _iGc);


def _mParseAlt(_sPat, _i, _iN, _iGc, _mFns): 

  _aOptions = [];
  _fPcFn = _mFns["parseConcat"];
  _mR1 = _fPcFn(_sPat, _i, _iN, _iGc, _mFns);
  _aOptions.append( _mR1["node"]);
  _i = _mR1["i"];
  _iGc = _mR1["groupCount"];

  while _i < _iN and _sPat[( _i):( _i)+( 1)] == "|": 

    _i = _i + 1;
    _mR2 = _fPcFn(_sPat, _i, _iN, _iGc, _mFns);
    _aOptions.append( _mR2["node"]);
    _i = _mR2["i"];
    _iGc = _mR2["groupCount"];


  if len(_aOptions) == 1: 

    return JSOL.dict("node",  _aOptions[0],  "i",  _i,  "groupCount",  _iGc);


  return JSOL.dict("node",  JSOL.dict("type",  "alt",  "options",  _aOptions),  "i",  _i,  "groupCount",  _iGc);


def _mParsePattern(_sPat): 

  _mFns = JSOL.dict(
  "parseAlt",  _mParseAlt, 
  "parseConcat",  _mParseConcat, 
  "parseQuantified",  _mParseQuantified, 
  "parseAtom",  _mParseAtom
  );
  _iN = len(_sPat);
  _mR = _mParseAlt(_sPat, 0, _iN, 0, _mFns);
  return JSOL.dict("tree",  _mR["node"],  "groupCount",  _mR["groupCount"]);


def _fGen(_mN, _aProg, _fSelfFn): 

  _sType = _mN["type"];
  if _sType == "concat": 

    _aParts = _mN["parts"];
    _iPCount = len(_aParts);
    _iP = 0;
    while _iP < _iPCount: 

      _aProg = _fSelfFn(_aParts[_iP], _aProg, _fSelfFn); 

      _iP = _iP + 1;




  elif _sType == "alt": 

    _aOptions = _mN["options"];
    _iOCount = len(_aOptions);
    _aJmpEnds = [];
    _iIdx = 0;
    while _iIdx < _iOCount: 

      if _iIdx < _iOCount - 1: 

        _iSplitPc = len(_aProg);
        _aProg.append( JSOL.dict("op",  "SPLIT",  "x",  0,  "y",  0));
        _iX = len(_aProg);
        _aProg = _fSelfFn(_aOptions[_iIdx], _aProg, _fSelfFn);
        _iJmpPc = len(_aProg);
        _aProg.append( JSOL.dict("op",  "JMP",  "to",  0));
        _aJmpEnds.append( _iJmpPc);
        _aProg[_iSplitPc]["x"] = _iX;
        _aProg[_iSplitPc]["y"] = len(_aProg);


      else: 

        _aProg = _fSelfFn(_aOptions[_iIdx], _aProg, _fSelfFn);


      _iIdx = _iIdx + 1;


    _iJCount = len(_aJmpEnds);
    _iJ = 0;
    while _iJ < _iJCount: 

      _aProg[_aJmpEnds[_iJ]]["to"] = len(_aProg);

      _iJ = _iJ + 1;




  elif _sType == "rep": 

    _iMin = _mN["min"];
    _iMax = _mN["max"];
    _bLazy = _mN["lazy"];
    _iC = 0;
    while _iC < _iMin: 

      _aProg = _fSelfFn(_mN["body"], _aProg, _fSelfFn); 

      _iC = _iC + 1;


    if _iMax == 999999: 

      _iSplitPc = len(_aProg);
      _aProg.append( JSOL.dict("op",  "SPLIT",  "x",  0,  "y",  0));
      _iBodyStart = len(_aProg);
      _aProg = _fSelfFn(_mN["body"], _aProg, _fSelfFn);
      _aProg.append( JSOL.dict("op",  "JMP",  "to",  _iSplitPc));
      if _bLazy == True: 

        _aProg[_iSplitPc]["x"] = len(_aProg);
        _aProg[_iSplitPc]["y"] = _iBodyStart;


      else: 

        _aProg[_iSplitPc]["x"] = _iBodyStart;
        _aProg[_iSplitPc]["y"] = len(_aProg);




    else: 

      _iOptional = _iMax - _iMin;
      _iC = 0;
      while _iC < _iOptional: 

        _iSplitPc = len(_aProg);
        _aProg.append( JSOL.dict("op",  "SPLIT",  "x",  0,  "y",  0));
        _iBodyStart = len(_aProg);
        _aProg = _fSelfFn(_mN["body"], _aProg, _fSelfFn);
        if _bLazy == True: 

          _aProg[_iSplitPc]["x"] = len(_aProg);
          _aProg[_iSplitPc]["y"] = _iBodyStart;


        else: 

          _aProg[_iSplitPc]["x"] = _iBodyStart;
          _aProg[_iSplitPc]["y"] = len(_aProg);


        _iC = _iC + 1;






  elif _sType == "group": 

    if ( "capturing" in _mN) and _mN["capturing"] == False: 

      _aProg = _fSelfFn(_mN["body"], _aProg, _fSelfFn);


    else: 

      _aProg.append( JSOL.dict("op",  "SAVE",  "slot",  _mN["index"] * 2));
      _aProg = _fSelfFn(_mN["body"], _aProg, _fSelfFn);
      _aProg.append( JSOL.dict("op",  "SAVE",  "slot",  _mN["index"] * 2 + 1));




  elif _sType == "char": 

    _aProg.append( JSOL.dict("op",  "CHAR",  "value",  _mN["value"]));


  elif _sType == "any": 

    _aProg.append( JSOL.dict("op",  "ANY"));


  elif _sType == "class": 

    _aProg.append( JSOL.dict("op",  "CLASS",  "negate",  _mN["negate"],  "ranges",  _mN["ranges"],  "singles",  _mN["singles"]));


  elif _sType == "anchorStart": 

    _aProg.append( JSOL.dict("op",  "BOL"));


  elif _sType == "anchorEnd": 

    _aProg.append( JSOL.dict("op",  "EOL"));


  return _aProg;


def _aCompileRegex(_mNode, _iGroupCount): 

  _aProg = [];
  _aProg.append( JSOL.dict("op",  "SAVE",  "slot",  0));
  _aProg = _fGen(_mNode, _aProg, _fGen);
  _aProg.append( JSOL.dict("op",  "SAVE",  "slot",  1));
  _aProg.append( JSOL.dict("op",  "MATCH"));
  return _aProg;


def _sToLower(_sCh): 

  _iCode = ord(_sCh[ 0]);
  if _iCode >= 65 and _iCode <= 90: 

    return chr(_iCode + 32);


  return _sCh;


def _bCharMatches(_mInstr, _sCh, _bCi): 

  _bInSet = False;
  _sChComp = (_sToLower(_sCh) if _bCi == True else _sCh);
  _iCCode = ord(_sChComp[ 0]);

  _aSingles = _mInstr["singles"];
  _iSCount = len(_aSingles);
  _i = 0;
  while _i < _iSCount: 

    _sS = _aSingles[_i];
    _sSComp = (_sToLower(_sS) if _bCi == True else _sS);
    if _sSComp == _sChComp: 

      _bInSet = True;


    _i = _i + 1;


  _aRanges = _mInstr["ranges"];
  _iRCount = len(_aRanges);
  _i = 0;
  while _i < _iRCount: 

    _aR = _aRanges[_i];
    _sA = (_sToLower(_aR[0]) if _bCi == True else _aR[0]);
    _sB = (_sToLower(_aR[1]) if _bCi == True else _aR[1]);
    _iACode = ord(_sA[ 0]);
    _iBCode = ord(_sB[ 0]);
    if _iCCode >= _iACode and _iCCode <= _iBCode: 

      _bInSet = True;


    _i = _i + 1;


  if _mInstr["negate"] == True: 

    return not _bInSet;


  return _bInSet;


def _mRunRegex(_aProg, _sStr, _bCi, _iGroupCount, _iStartSp): 

  _iN = len(_sStr);
  _iPc = 0;
  _iSp = _iStartSp;
  _aSaves = [];
  _iSavesLen = (_iGroupCount + 1) * 2;
  _i = 0;
  while _i < _iSavesLen: 

    _aSaves.append( -1); 
    _i = _i + 1;


  _aStack = [];
  _iStackPtr = 0;

  _bRunning = True;
  _bMatched = False;

  while _bRunning == True: 

    _mInstr = _aProg[_iPc];
    _bOk = True;
    _sOp = _mInstr["op"];

    if _sOp == "CHAR": 

      if _iSp < _iN: 

        _sCh = _sStr[( _iSp):( _iSp)+( 1)];
        _sVal = _mInstr["value"];
        _bMatch = ((_sToLower(_sCh) == _sToLower(_sVal)) if _bCi == True else (_sCh == _sVal));
        if _bMatch == True: 

          _iSp = _iSp + 1; _iPc = _iPc + 1;


        else: 

          _bOk = False;




      else: 

        _bOk = False;




    elif _sOp == "ANY": 

      if _iSp < _iN: 

        _iSp = _iSp + 1; _iPc = _iPc + 1;


      else: 

        _bOk = False;




    elif _sOp == "CLASS": 

      if _iSp < _iN: 

        _sCh = _sStr[( _iSp):( _iSp)+( 1)];
        if _bCharMatches(_mInstr, _sCh, _bCi) == True: 

          _iSp = _iSp + 1; _iPc = _iPc + 1;


        else: 

          _bOk = False;




      else: 

        _bOk = False;




    elif _sOp == "BOL": 

      if _iSp == 0: 

        _iPc = _iPc + 1;


      else: 

        _bOk = False;




    elif _sOp == "EOL": 

      if _iSp == _iN: 

        _iPc = _iPc + 1;


      else: 

        _bOk = False;




    elif _sOp == "JMP": 

      _iPc = _mInstr["to"];


    elif _sOp == "SPLIT": 

      _aSavesCopy = [];
      _i = 0;
      while _i < _iSavesLen: 

        _aSavesCopy.append( _aSaves[_i]); 
        _i = _i + 1;


      _mFrame = JSOL.dict("pc",  _mInstr["y"],  "sp",  _iSp,  "saves",  _aSavesCopy);
      if _iStackPtr < len(_aStack): 

        _aStack[_iStackPtr] = _mFrame;


      else: 

        _aStack.append( _mFrame);


      _iStackPtr = _iStackPtr + 1;

      _iPc = _mInstr["x"];


    elif _sOp == "SAVE": 

      _aSaves[_mInstr["slot"]] = _iSp;
      _iPc = _iPc + 1;


    elif _sOp == "MATCH": 

      _bMatched = True;
      _bRunning = False;


    else: 

      _bOk = False;


    if _bRunning == True and _bOk == False: 

      if _iStackPtr == 0: 

        _bRunning = False;


      else: 

        _iStackPtr = _iStackPtr - 1;
        _mF = _aStack[_iStackPtr];
        _iPc = _mF["pc"];
        _iSp = _mF["sp"];
        _aSaves = _mF["saves"];






  return JSOL.dict("matched",  _bMatched,  "saves",  _aSaves);


def _mRegexMatch(_sPatternStr, _sStr, _sFlags): 

  _bCi = False;
  _bGlobal = False;
  if JSOL.str_index_of(_sFlags,  "i") != -1: 

    _bCi = True;


  if JSOL.str_index_of(_sFlags,  "g") != -1: 

    _bGlobal = True;


  _mParsed = _mParsePattern(_sPatternStr);
  _aProg = _aCompileRegex(_mParsed["tree"], _mParsed["groupCount"]);
  _iGroupCount = _mParsed["groupCount"];

  _iN = len(_sStr);
  _iStart = 0;
  while _iStart <= _iN: 

    _mR = _mRunRegex(_aProg, _sStr, _bCi, _iGroupCount, _iStart);
    if _mR["matched"] == True: 

      _aGroups = [];
      _iG = 0;
      while _iG <= _iGroupCount: 

        _iS = _mR["saves"][_iG * 2];
        _iE = _mR["saves"][_iG * 2 + 1];
        if _iS >= 0 and _iE >= 0: 

          _sSubG = _sStr[( _iS):( _iS)+( _iE - _iS)];
          _aGroups.append( _sSubG);


        else: 

          _aGroups.append( None);


        _iG = _iG + 1;


      return JSOL.dict("matched",  True,  "groups",  _aGroups,  "index",  _iStart,  "length",  _mR["saves"][1] - _mR["saves"][0]);


    _iStart = _iStart + 1;


  return JSOL.dict("matched",  False,  "groups",  [],  "index",  -1,  "length",  0);


def _sRegexReplace(_sPatternStr, _sReplacementStr, _sStr, _sFlags): 

  _bCi = False;
  _bGlobal = False;
  if JSOL.str_index_of(_sFlags,  "i") != -1: 

    _bCi = True;


  if JSOL.str_index_of(_sFlags,  "g") != -1: 

    _bGlobal = True;


  _mParsed = _mParsePattern(_sPatternStr);
  _aProg = _aCompileRegex(_mParsed["tree"], _mParsed["groupCount"]);
  _iGroupCount = _mParsed["groupCount"];

  _sResult = "";
  _i = 0;
  _iN = len(_sStr);

  while _i <= _iN: 

    _bMatchFound = False;
    _mR = JSOL.dict("matched",  False,  "saves",  []);
    _iMatchIndex = _i;

    _iStart = _i;
    while _iStart <= _iN: 

      _mR = _mRunRegex(_aProg, _sStr, _bCi, _iGroupCount, _iStart);
      if _mR["matched"] == True: 

        _bMatchFound = True;
        _iMatchIndex = _iStart;
        break;


      _iStart = _iStart + 1;


    if _bMatchFound == True: 

      _iMatchStart = _mR["saves"][0];
      _iMatchEnd = _mR["saves"][1];

      _sSubA = _sStr[( _i):( _i)+( _iMatchStart - _i)];
      _sResult = _sResult + "" + _sSubA;

      _sRepResult = "";
      _iRepLen = len(_sReplacementStr);
      _iK = 0;
      while _iK < _iRepLen: 

        _sC = _sReplacementStr[( _iK):( _iK)+( 1)];
        if _sC == "$" and _iK + 1 < _iRepLen: 

          _sNextC = _sReplacementStr[( _iK + 1):( _iK + 1)+( 1)];
          _iCode = ord(_sNextC[ 0]);
          if _iCode >= 48 and _iCode <= 57: 

            _iGIdx = _iCode - 48;
            if _iGIdx <= _iGroupCount: 

              _iGs = _mR["saves"][_iGIdx * 2];
              _iGe = _mR["saves"][_iGIdx * 2 + 1];
              if _iGs >= 0 and _iGe >= 0: 

                _sSubB = _sStr[( _iGs):( _iGs)+( _iGe - _iGs)];
                _sRepResult = _sRepResult + "" + _sSubB;




            _iK = _iK + 1;


          else: 

            _sRepResult = _sRepResult + "" + _sC;




        else: 

          _sRepResult = _sRepResult + "" + _sC;


        _iK = _iK + 1;


      _sResult = _sResult + "" + _sRepResult;

      if _iMatchEnd == _iMatchIndex: 

        if _iMatchIndex < _iN: 

          _sSubC = _sStr[( _iMatchIndex):( _iMatchIndex)+( 1)];
          _sResult = _sResult + "" + _sSubC;


        _i = _iMatchIndex + 1;


      else: 

        _i = _iMatchEnd;


      if _bGlobal == False: 

        _sSubD = _sStr[( _i):( _i)+( _iN - _i)];
        _sResult = _sResult + "" + _sSubD;
        break;




    else: 

      _sSubE = _sStr[( _i):( _i)+( _iN - _i)];
      _sResult = _sResult + "" + _sSubE;
      break;




  return _sResult;


def _bRegexTest(_sPatternStr, _sStr, _sFlags): 

  _mR = _mRegexMatch(_sPatternStr, _sStr, _sFlags);
  if ( "matched" in _mR) and _mR["matched"] == True: 

    return True;


  return False;


_mRgx = JSOL.dict(
"match",  _mRegexMatch, 
"replace",  _sRegexReplace, 
"test",  _bRegexTest
);