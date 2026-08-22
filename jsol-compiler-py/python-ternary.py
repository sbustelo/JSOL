import math
from jsol_core import JSOL

# @JSOL v0.2.95 - Python Ternary Reorderer
#
# Runs on MASKED code, BEFORE $sConvertControlFlowToPython (still JS-shaped
# operators: &&, ||, ===, null, true, false — the next pass handles those
# generically wherever they land, so this pass doesn't need to translate
# anything inside cond/trueBranch/falseBranch itself, only reorder them).
#
# SCOPE, DELIBERATELY NARROW:
#   - Only detects "X = <cond> ? <a> : <b>;" and "return <cond> ? <a> : <b>;"
#   - Does NOT support nested ternaries (a ternary inside a or b's own text).
#   - Does NOT support a ternary used as a function call argument.
# If neither shape matches at a given "?", the character is left untouched —
# no silent mangling, no guessing.
#
# Usage: standalone first, same discipline as indenter.jsol and
# python-compiler.jsol. Do not wire into engine.jsol until validated.

# NOTE: $bIsWhitespaceCharTrim / $sTrimWhitespace are defined in
# python-compiler.jsol, not duplicated here — both files always load
# together in the same concatenated script (harness or, later, the real
# `parts` array), and a duplicate top-level const would collide.

def _bIsIdentChar2(_sCh): 

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


# Scans forward from $iStart looking for the terminating ";" of the CURRENT
# statement, tracking paren/bracket depth so a ";" inside a nested call isn't
# mistaken for the statement end. Returns the index of that ";" (or $iLen if
# none found — malformed input, caller should treat as "no ternary found").
def _iFindStatementEnd(_sCode, _iStart): 

  _iLen = len(_sCode);
  _iParenDepth = 0;
  _iBracketDepth = 0;
  _i = _iStart;

  while _i < _iLen: 

    _sCh = _sCode[( _i):( _i)+( 1)];
    if _sCh == "(": 

      _iParenDepth = _iParenDepth + 1;


    elif _sCh == ")": 

      _iParenDepth = _iParenDepth - 1;


    elif _sCh == "[": 

      _iBracketDepth = _iBracketDepth + 1;


    elif _sCh == "]": 

      _iBracketDepth = _iBracketDepth - 1;


    elif _sCh == ";" and _iParenDepth == 0 and _iBracketDepth == 0: 

      return _i;


    _i = _i + 1;


  return _iLen;


# Within $sExpr (a full statement RHS, no trailing ";"), finds a top-level
# "?" and its matching top-level ":" (both at paren/bracket depth 0). Returns
# "ok"=false if no top-level "?" exists at all — meaning this is a plain
# expression, not a ternary, and must be left untouched by the caller.
def _mSplitTernary(_sExpr): 

  _iLen = len(_sExpr);
  _iParenDepth = 0;
  _iBracketDepth = 0;
  _iQuestionIndex = -1;
  _iColonIndex = -1;
  _i = 0;

  while _i < _iLen: 

    _sCh = _sExpr[( _i):( _i)+( 1)];
    if _sCh == "(": 

      _iParenDepth = _iParenDepth + 1;


    elif _sCh == ")": 

      _iParenDepth = _iParenDepth - 1;


    elif _sCh == "[": 

      _iBracketDepth = _iBracketDepth + 1;


    elif _sCh == "]": 

      _iBracketDepth = _iBracketDepth - 1;


    elif _sCh == "?" and _iParenDepth == 0 and _iBracketDepth == 0 and _iQuestionIndex == -1: 

      _iQuestionIndex = _i;


    elif _sCh == ":" and _iParenDepth == 0 and _iBracketDepth == 0 and _iQuestionIndex != -1 and _iColonIndex == -1: 

      _iColonIndex = _i;


    _i = _i + 1;


  if _iQuestionIndex == -1 or _iColonIndex == -1: 

    return JSOL.dict("ok",  False);


  _sCond = _sTrimWhitespace(_sExpr[( 0):( 0)+( _iQuestionIndex)]);
  _sTrue = _sTrimWhitespace(_sExpr[( _iQuestionIndex + 1):( _iQuestionIndex + 1)+( _iColonIndex - (_iQuestionIndex + 1))]);
  _sFalse = _sTrimWhitespace(_sExpr[( _iColonIndex + 1):( _iColonIndex + 1)+( _iLen - (_iColonIndex + 1))]);

  return JSOL.dict("ok",  True,  "cond",  _sCond,  "true",  _sTrue,  "false",  _sFalse);


def _sConvertTernaries(_sMaskedCode): 

  _sResult = "";
  _i = 0;
  _iLen = len(_sMaskedCode);

  while _i < _iLen: 

    _sCh = _sMaskedCode[( _i):( _i)+( 1)];

    # Trigger 1: "return <expr>;"
    _bAtBoundary = (_i == 0) or (_bIsIdentChar2(_sMaskedCode[( _i - 1):( _i - 1)+( 1)]) == False);
    _bHandled = False;

    if _bAtBoundary == True and _sMaskedCode[( _i):( _i)+( 7)] == "return " and _bIsIdentChar2(_sMaskedCode[( _i + 6):( _i + 6)+( 1)]) == False: 

      _iRhsStart = _i + 7;
      _iStmtEnd = _iFindStatementEnd(_sMaskedCode, _iRhsStart);
      _sRhs = _sMaskedCode[( _iRhsStart):( _iRhsStart)+( _iStmtEnd - _iRhsStart)];
      _mSplit = _mSplitTernary(_sRhs);

      if _mSplit["ok"] == True: 

        _sResult = _sResult + "" + "return (" + "" + _mSplit["true"] + "" + " if " + "" + _mSplit["cond"] + "" + " else " + "" + _mSplit["false"] + "" + ")" + ";";
        _i = _iStmtEnd + 1;
        _bHandled = True;




    # Trigger 2: a lone "=" (assignment, not "==" / "===" / "<=" / ">=" / "!=")
    if _bHandled == False and _sCh == "=": 

      _sPrevCh = _sMaskedCode[( _i - 1):( _i - 1)+( 1)];
      _sNextCh = _sMaskedCode[( _i + 1):( _i + 1)+( 1)];
      _bIsPlainAssign = ((_sNextCh != "=") and
      (_sPrevCh != "=") and (_sPrevCh != "<") and (_sPrevCh != ">") and (_sPrevCh != "!"));

      if _bIsPlainAssign == True: 

        _iRhsStart = _i + 1;
        _iStmtEnd = _iFindStatementEnd(_sMaskedCode, _iRhsStart);
        _sRhs = _sMaskedCode[( _iRhsStart):( _iRhsStart)+( _iStmtEnd - _iRhsStart)];
        _mSplit = _mSplitTernary(_sRhs);

        if _mSplit["ok"] == True: 

          _sResult = _sResult + "" + "= (" + "" + _mSplit["true"] + "" + " if " + "" + _mSplit["cond"] + "" + " else " + "" + _mSplit["false"] + "" + ")" + ";";
          _i = _iStmtEnd + 1;
          _bHandled = True;






    if _bHandled == False: 

      _sResult = _sResult + "" + _sCh;
      _i = _i + 1;




  return _sResult;


