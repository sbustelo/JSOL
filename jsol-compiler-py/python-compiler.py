import math
from jsol_core import JSOL

# @JSOL v0.2.95 - Python Control-Flow Translator
#
# Runs on MASKED code, AFTER $sCompileToJS(..., pythonRules) has already
# substituted primitives (Str.*, Arr.*, Map.*, Cast.*), and BEFORE $sIndentCode.
#
# Scope: translates JS-shaped control-flow syntax to Python syntax, but
# DELIBERATELY LEAVES EVERY "{" AND "}" IN PLACE. $sIndentCode depends on
# brace-depth counting to indent correctly; stripping braces here would blind
# it. Braces get removed in a LATER, separate pass, only after indentation is
# already resolved and they're pure noise.
#
# Handled in this pass:
#   - Operators: && -> and, || -> or, ! -> not (word-boundary safe, doesn't
#     touch "!=" or "!==" ), === -> ==, !== -> !=
#   - Keywords: null -> None, true -> True, false -> False (word-boundary safe)
#   - if (cond) {      -> if cond: {
#   - else if (cond) { -> elif cond: {
#   - else {           -> else: {
#   - while (cond) {   -> while cond: {
#   - Canonical for (let $i = A; $i <OP> B; $i = $i <OP2> C) {
#         -> for $i in range(...): {
#     Handles all four comparison directions (<, <=, >, >=). If a for-loop
#     doesn't match this exact canonical shape, it is NOT silently mangled:
#     it's left untouched with a loud "# JSOL-PYTHON-TODO" marker so it's
#     impossible to miss and impossible to ship broken by accident.
#
# NOT handled in this pass, on purpose (separate, harder problem):
#   - Ternary (cond ? a : b) -> (a if cond else b)
#
# Usage: standalone first, same discipline as indenter.jsol. Do not wire into
# engine.jsol until validated against real examples.



# Comments are masked out by the lexer and restored VERBATIM by
# $sUnmaskSourceCode — none of the passes above ever see them, by design.
# That's correct for JS/PHP/TS (all share "//" and "/* */"), but Python
# doesn't understand either. This transforms the TOKEN VALUES themselves,
# before the final unmask, so there's zero risk of touching a "//" that
# happens to live inside an actual string literal elsewhere in the code —
# this only ever touches isolated comment tokens.
def _aTranslateCommentTokensToPython(_aTokens): 

  _aResult = [];
  _i = 0;
  while _i < len(_aTokens): 

    _mToken = _aTokens[_i];
    _sKey = _mToken["key"];
    _sVal = _mToken["value"];

    if _sVal[( 0):( 0)+( 2)] == "//": 

      _sRest = _sVal[( 2):( 2)+( len(_sVal) - 2)];
      _aResult.append( JSOL.dict("key",  _sKey,  "value",  "#" + "" + _sRest));


    elif _sVal[( 0):( 0)+( 2)] == "/*": 

      _sInner = _sVal[( 2):( 2)+( len(_sVal) - 2)];
      if _sInner[( len(_sInner) - 2):( len(_sInner) - 2)+( 2)] == "*/": 

        _sInner = _sInner[( 0):( 0)+( len(_sInner) - 2)];


      _sConverted = "#" + "" + _sInner.replace( "\n",  "\n#");
      _aResult.append( JSOL.dict("key",  _sKey,  "value",  _sConverted));


    else: 

      # Not a comment (starts with a quote char) — a real string
      # literal, leave it byte-for-byte untouched.
      _aResult.append( JSOL.dict("key",  _sKey,  "value",  _sVal));


    _i = _i + 1;


  return _aResult;


def _bIsWhitespaceCharTrim(_sCh): 

  if _sCh == " ": 

    return True;


  if _sCh == "\t": 

    return True;


  if _sCh == "\n": 

    return True;


  if _sCh == "\r": 

    return True;


  return False;


# Local trim, since the raw-execution polyfill (dist/stdlib/jsol-core.js)
# doesn't implement Str.trim — it's only ever used compiled (-> native
# .trim()), never as a raw runtime call before this module. Str.sub is
# pervasively relied on already, safer to build on it than on the polyfill.
def _sTrimWhitespace(_sVal): 

  _iLen = len(_sVal);
  _iStart = 0;
  while _iStart < _iLen and _bIsWhitespaceCharTrim(_sVal[( _iStart):( _iStart)+( 1)]) == True: 

    _iStart = _iStart + 1;


  _iEnd = _iLen;
  while _iEnd > _iStart and _bIsWhitespaceCharTrim(_sVal[( _iEnd - 1):( _iEnd - 1)+( 1)]) == True: 

    _iEnd = _iEnd - 1;


  return _sVal[( _iStart):( _iStart)+( _iEnd - _iStart)];


def _bIsIdentChar(_sCh): 

  if _sCh == "_": 

    return True;


  if _sCh == "$": 

    return True;


  if _sCh >= "a" and _sCh <= "z": 

    return True;


  if _sCh >= "A" and _sCh <= "Z": 

    return True;


  if _sCh >= "0" and _sCh <= "9": 

    return True;


  return False;


# Reads a full identifier/keyword starting at $iStart (assumes $iStart is a
# valid identifier-start position). Returns { "word": ..., "end": ... } where
# "end" is the index right after the last identifier char.
def _mReadWord(_sCode, _iStart): 

  _iLen = len(_sCode);
  _i = _iStart;
  while _i < _iLen and _bIsIdentChar(_sCode[( _i):( _i)+( 1)]) == True: 

    _i = _i + 1;


  return JSOL.dict("word",  _sCode[( _iStart):( _iStart)+( _i - _iStart)],  "end",  _i);


# Skips whitespace starting at $iStart, returns the index of the next
# non-whitespace character (or $iLen if the code ends first).
def _iSkipWhitespace(_sCode, _iStart): 

  _iLen = len(_sCode);
  _i = _iStart;
  while _i < _iLen: 

    _sCh = _sCode[( _i):( _i)+( 1)];
    if _sCh == " " or _sCh == "\t" or _sCh == "\n" or _sCh == "\r": 

      _i = _i + 1;


    else: 

      return _i;




  return _i;


# Given the index of an opening "(" (must point exactly at "("), returns the
# balanced substring INSIDE the parens (not including the parens themselves)
# and the index right after the matching ")". Depth-aware, so nested calls
# inside the condition (e.g. "Str.len($s) > 0") are handled correctly.
def _mReadBalancedParens(_sCode, _iOpenIndex): 

  _iLen = len(_sCode);
  _iDepth = 0;
  _i = _iOpenIndex;
  _iInsideStart = -1;

  while _i < _iLen: 

    _sCh = _sCode[( _i):( _i)+( 1)];
    if _sCh == "(": 

      _iDepth = _iDepth + 1;
      if _iDepth == 1: 

        _iInsideStart = _i + 1;




    elif _sCh == ")": 

      _iDepth = _iDepth - 1;
      if _iDepth == 0: 

        return JSOL.dict(
        "inside",  _sCode[( _iInsideStart):( _iInsideStart)+( _i - _iInsideStart)], 
        "end",  _i + 1
        );




    _i = _i + 1;


  # Unbalanced input — should never happen on valid, already-linted JSOL.
  return JSOL.dict("inside",  "",  "end",  _iLen);


# Translates JS-style boolean/comparison operators to Python inside a single
# expression fragment (a condition, a for-loop clause, etc). Word-boundary
# safe for "!" so it never touches "!=" / "!==".
def _sTranslateOperators(_sExpr): 

  _sResult = "";
  _i = 0;
  _iLen = len(_sExpr);

  while _i < _iLen: 

    _sCh = _sExpr[( _i):( _i)+( 1)];
    _bAtBoundary = (_i == 0) or (_bIsIdentChar(_sExpr[( _i - 1):( _i - 1)+( 1)]) == False);

    if _bAtBoundary == True and _bIsIdentChar(_sCh) == True: 

      _mWord = _mReadWord(_sExpr, _i);
      _sWord = _mWord["word"];

      if _sWord == "true": 

        _sResult = _sResult + "" + "True";
        _i = _mWord["end"];


      elif _sWord == "false": 

        _sResult = _sResult + "" + "False";
        _i = _mWord["end"];


      elif _sWord == "null": 

        _sResult = _sResult + "" + "None";
        _i = _mWord["end"];


      else: 

        _sResult = _sResult + "" + _sWord;
        _i = _mWord["end"];




    else: 

      _sTwo = _sExpr[( _i):( _i)+( 2)];
      _sThree = _sExpr[( _i):( _i)+( 3)];

      if _sThree == "===": 

        _sResult = _sResult + "" + "==";
        _i = _i + 3;


      elif _sThree == "!==": 

        _sResult = _sResult + "" + "!=";
        _i = _i + 3;


      elif _sTwo == "&&": 

        _sResult = _sResult + "" + "and";
        _i = _i + 2;


      elif _sTwo == "||": 

        _sResult = _sResult + "" + "or";
        _i = _i + 2;


      elif _sTwo == "!=": 

        _sResult = _sResult + "" + "!=";
        _i = _i + 2;


      elif _sExpr[( _i):( _i)+( 1)] == "!": 

        _sResult = _sResult + "" + "not ";
        _i = _i + 1;


      else: 

        _sResult = _sResult + "" + _sCh;
        _i = _i + 1;






  return _sResult;


# Attempts to parse the canonical "let $i = A; $i <OP> B; $i = $i <OP2> C"
# shape. Returns "ok"=false if the shape doesn't match — callers MUST check
# "ok" and never assume success.
def _mReadBalancedBraces(_sCode, _iOpenIndex): 

  _iLen = len(_sCode);
  _iDepth = 0;
  _i = _iOpenIndex;
  _iInsideStart = -1;
  while _i < _iLen: 

    _sCh = _sCode[( _i):( _i)+( 1)];
    if _sCh == "{": 

      _iDepth = _iDepth + 1;
      if _iDepth == 1: 

        _iInsideStart = _i + 1;




    elif _sCh == "}": 

      _iDepth = _iDepth - 1;
      if _iDepth == 0: 

        return JSOL.dict("inside",  _sCode[( _iInsideStart):( _iInsideStart)+( _i - _iInsideStart)],  "end",  _i + 1);




    _i = _i + 1;


  return JSOL.dict("inside",  "",  "end",  _iLen);


def _sConvertControlFlowToPython(_sMaskedCode): 

  _sResult = "";
  _i = 0;
  _iLen = len(_sMaskedCode);

  while _i < _iLen: 

    _sCh = _sMaskedCode[( _i):( _i)+( 1)];
    _bAtBoundary = (_i == 0) or (_bIsIdentChar(_sMaskedCode[( _i - 1):( _i - 1)+( 1)]) == False);

    if _bAtBoundary == True and _bIsIdentChar(_sCh) == True: 

      _mWord = _mReadWord(_sMaskedCode, _i);
      _sWord = _mWord["word"];

      if _sWord == "null": 

        _sResult = _sResult + "" + "None";
        _i = _mWord["end"];


      elif _sWord == "true": 

        _sResult = _sResult + "" + "True";
        _i = _mWord["end"];


      elif _sWord == "false": 

        _sResult = _sResult + "" + "False";
        _i = _mWord["end"];


      elif _sWord == "if": 

        _iAfter = _iSkipWhitespace(_sMaskedCode, _mWord["end"]);
        if _sMaskedCode[( _iAfter):( _iAfter)+( 1)] == "(": 

          _mParens = _mReadBalancedParens(_sMaskedCode, _iAfter);
          _sResult = _sResult + "" + "if " + "" + _sTranslateOperators(_mParens["inside"]) + "" + ":";
          _i = _mParens["end"];


        else: 

          _sResult = _sResult + "" + _sWord;
          _i = _mWord["end"];




      elif _sWord == "switch": 

        _iAfter = _iSkipWhitespace(_sMaskedCode, _mWord["end"]);
        if _sMaskedCode[( _iAfter):( _iAfter)+( 1)] == "(": 

          _mParens = _mReadBalancedParens(_sMaskedCode, _iAfter);
          _iAfterParens = _iSkipWhitespace(_sMaskedCode, _mParens["end"]);
          if _sMaskedCode[( _iAfterParens):( _iAfterParens)+( 1)] == "{": 

            _mBraces = _mReadBalancedBraces(_sMaskedCode, _iAfterParens);
            _sBody = _sConvertControlFlowToPython(_mBraces["inside"]);
            _sResult = _sResult + "" + "_jsol_switch = " + "" + _sTranslateOperators(_mParens["inside"]) + "" + "\n_jsol_done = False\nwhile not _jsol_done: {\n_jsol_done = True\nif False: pass" + "" + _sBody + "\n}";
            _i = _mBraces["end"];


          else: 

            _sResult = _sResult + "" + "_jsol_switch = " + "" + _sTranslateOperators(_mParens["inside"]) + "" + "\nif True:";
            _i = _mParens["end"];




        else: 

          _sResult = _sResult + "" + _sWord;
          _i = _mWord["end"];




      elif _sWord == "case": 

        _iAfter = _iSkipWhitespace(_sMaskedCode, _mWord["end"]);
        _bFoundColon = False;
        _iColon = _iAfter;
        while _iColon < _iLen: 

          _sChar = _sMaskedCode[( _iColon):( _iColon)+( 1)];
          if _sChar == ":": 

            _bFoundColon = True;
            break;


          if _sChar == ";" or _sChar == "{" or _sChar == "}": 

            break;


          _iColon = _iColon + 1;


        if _bFoundColon == True: 

          _sVal = _sMaskedCode[( _iAfter):( _iAfter)+( _iColon - _iAfter)];
          _sResult = _sResult + "" + "\nelif _jsol_switch == " + "" + _sTranslateOperators(_sTrimWhitespace(_sVal)) + "" + ":";
          _i = _iColon + 1;


        else: 

          _sResult = _sResult + "" + _sWord;
          _i = _mWord["end"];




      elif _sWord == "default": 

        _iAfter = _iSkipWhitespace(_sMaskedCode, _mWord["end"]);
        if _sMaskedCode[( _iAfter):( _iAfter)+( 1)] == ":": 

          _sResult = _sResult + "" + "\nelse:";
          _i = _iAfter + 1;


        else: 

          _sResult = _sResult + "" + _sWord;
          _i = _mWord["end"];




      elif _sWord == "else": 

        _iAfter = _iSkipWhitespace(_sMaskedCode, _mWord["end"]);
        _mMaybeIf = _mReadWord(_sMaskedCode, _iAfter);
        if _mMaybeIf["word"] == "if": 

          _iAfterIf = _iSkipWhitespace(_sMaskedCode, _mMaybeIf["end"]);
          if _sMaskedCode[( _iAfterIf):( _iAfterIf)+( 1)] == "(": 

            _mParens = _mReadBalancedParens(_sMaskedCode, _iAfterIf);
            _sResult = _sResult + "" + "elif " + "" + _sTranslateOperators(_mParens["inside"]) + "" + ":";
            _i = _mParens["end"];


          else: 

            _sResult = _sResult + "" + "else";
            _i = _mWord["end"];




        elif _sMaskedCode[( _iAfter):( _iAfter)+( 1)] == "{": 

          # Real control-flow else — goes straight to a block.
          _sResult = _sResult + "" + "else:";
          _i = _mWord["end"];


        else: 

          # Not followed by "{" — this is the "else" that
          # python-ternary.jsol already emitted as part of
          # "a if cond else b". Leave it exactly as plain text,
          # no colon, don't touch anything else on the line.
          _sResult = _sResult + "" + "else";
          _i = _mWord["end"];




      elif _sWord == "while": 

        _iAfter = _iSkipWhitespace(_sMaskedCode, _mWord["end"]);
        if _sMaskedCode[( _iAfter):( _iAfter)+( 1)] == "(": 

          _mParens = _mReadBalancedParens(_sMaskedCode, _iAfter);
          _sResult = _sResult + "" + "while " + "" + _sTranslateOperators(_mParens["inside"]) + "" + ":";
          _i = _mParens["end"];


        else: 

          _sResult = _sResult + "" + _sWord;
          _i = _mWord["end"];




      elif _sWord == "for": 

        _iAfter = _iSkipWhitespace(_sMaskedCode, _mWord["end"]);
        if _sMaskedCode[( _iAfter):( _iAfter)+( 1)] == "(": 

          _mParens = _mReadBalancedParens(_sMaskedCode, _iAfter);
          _iAfterParens = _iSkipWhitespace(_sMaskedCode, _mParens["end"]);
          if _sMaskedCode[( _iAfterParens):( _iAfterParens)+( 1)] == "{": 

            _mBraces = _mReadBalancedBraces(_sMaskedCode, _iAfterParens);

            _sInsideParens = _mParens["inside"];
            _iSemi1 = JSOL.str_index_of(_sInsideParens,  ";");
            _sTail1 = _sInsideParens[( _iSemi1 + 1):( _iSemi1 + 1)+( len(_sInsideParens) - (_iSemi1 + 1))];
            _iSemi2 = JSOL.str_index_of(_sTail1,  ";");
            _sTail2 = _sTail1[( _iSemi2 + 1):( _iSemi2 + 1)+( len(_sTail1) - (_iSemi2 + 1))];

            _sInit = _sTrimWhitespace(_sInsideParens[( 0):( 0)+( _iSemi1)]);
            if _sInit[( 0):( 0)+( 4)] == "let ": 

              _sInit = _sInit[( 4):( 4)+( len(_sInit) - 4)];


            _sCond = _sTrimWhitespace(_sTail1[( 0):( 0)+( _iSemi2)]);
            _sStep = _sTrimWhitespace(_sTail2);

            _sBody = _sConvertControlFlowToPython(_mBraces["inside"]);

            _sResult = _sResult + "" + _sInit + ";\nwhile " + _sTranslateOperators(_sCond) + ": {" + _sBody + "\n" + _sStep + ";\n}";
            _i = _mBraces["end"];


          else: 

            _sResult = _sResult + "" + _sWord;
            _i = _mWord["end"];




        else: 

          _sResult = _sResult + "" + _sWord;
          _i = _mWord["end"];




      elif _sWord == "const" or _sWord == "let": 

        _iAfterKw = _iSkipWhitespace(_sMaskedCode, _mWord["end"]);
        _mIdent = _mReadWord(_sMaskedCode, _iAfterKw);
        _iAfterIdent = _iSkipWhitespace(_sMaskedCode, _mIdent["end"]);

        if _sMaskedCode[( _iAfterIdent):( _iAfterIdent)+( 1)] == "=" and _sMaskedCode[( _iAfterIdent):( _iAfterIdent)+( 2)] != "==": 

          _iAfterEq = _iSkipWhitespace(_sMaskedCode, _iAfterIdent + 1);
          _mMaybeFunc = _mReadWord(_sMaskedCode, _iAfterEq);

          if _mMaybeFunc["word"] == "function": 

            _iAfterFuncKw = _iSkipWhitespace(_sMaskedCode, _mMaybeFunc["end"]);
            if _sMaskedCode[( _iAfterFuncKw):( _iAfterFuncKw)+( 1)] == "(": 

              _mParams = _mReadBalancedParens(_sMaskedCode, _iAfterFuncKw);
              _sResult = _sResult + "" + "def " + "" + _mIdent["word"] + "" + "(" + "" + _mParams["inside"] + "" + "):";
              _i = _mParams["end"];


            else: 

              _sResult = _sResult + "" + _mIdent["word"] + "" + " = ";
              _i = _iAfterEq;




          else: 

            _sResult = _sResult + "" + _mIdent["word"] + "" + " = ";
            _i = _iAfterEq;




        else: 

          _sResult = _sResult + "" + _mIdent["word"];
          _i = _mIdent["end"];




      else: 

        _sResult = _sResult + "" + _sWord;
        _i = _mWord["end"];




    elif _sCh == "&" and _sMaskedCode[( _i):( _i)+( 2)] == "&&": 

      _sResult = _sResult + "" + "and";
      _i = _i + 2;


    elif _sCh == "|" and _sMaskedCode[( _i):( _i)+( 2)] == "||": 

      _sResult = _sResult + "" + "or";
      _i = _i + 2;


    elif _sCh == "=" and _sMaskedCode[( _i):( _i)+( 3)] == "===": 

      _sResult = _sResult + "" + "==";
      _i = _i + 3;


    elif _sCh == "!" and _sMaskedCode[( _i):( _i)+( 3)] == "!==": 

      _sResult = _sResult + "" + "!=";
      _i = _i + 3;


    elif _sCh == "!" and _sMaskedCode[( _i):( _i)+( 2)] != "!=": 

      _sResult = _sResult + "" + "not ";
      _i = _i + 1;


    else: 

      _sResult = _sResult + "" + _sCh;
      _i = _i + 1;




  return _sResult;


def _sSanitizePythonIdentifiers(_sMaskedCode): 

  _sResult = "";
  _iLen = len(_sMaskedCode);
  _i = 0;
  while _i < _iLen: 

    _sCh = _sMaskedCode[( _i):( _i)+( 1)];
    if _sCh == "$": 

      _sResult = _sResult + "" + "_";


    else: 

      _sResult = _sResult + "" + _sCh;


    _i = _i + 1;


  return _sResult;


