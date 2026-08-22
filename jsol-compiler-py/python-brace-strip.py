import math
from jsol_core import JSOL

# @JSOL v0.2.95 - Python Brace Stripper
#
# Runs AFTER $sIndentCode, as the LAST structural pass before $sUnmaskSourceCode.
# By this point indentation is already correct (every "{" opened a new indent
# level, every "}" closed one) — the braces themselves are now pure noise for
# Python, which encodes blocks with indentation alone.
#
# What it does:
#   - Deletes every "{" outright (the newline+indent that $sIndentCode put
#     right after it stays — that IS the correct Python indentation).
#   - Deletes every "}", and if a ";" immediately follows (the leftover
#     statement-terminator from a JS-shaped "};"), deletes that too — a bare
#     ";" with nothing before it on its line is a SyntaxError in Python.
#   - If a block turns out to be EMPTY (nothing but whitespace was written
#     between its "{" and matching "}"), inserts "pass" so the resulting
#     Python is still syntactically valid — Python has no empty-block
#     tolerance the way JS/PHP do with a bare "{}".
#
# Usage: standalone first, same discipline as every other piece in this
# pipeline. Do not wire into engine.jsol until validated.

def _bIsWhitespaceCharPY(_sCh): 

  if _sCh == " ": 

    return True;


  if _sCh == "\t": 

    return True;


  if _sCh == "\n": 

    return True;


  if _sCh == "\r": 

    return True;


  return False;


def _sTrimWithPY(_sVal): 

  _iLen = len(_sVal);
  _iStart = 0;
  while _iStart < _iLen and _bIsWhitespaceCharPY(_sVal[( _iStart):( _iStart)+( 1)]) == True: 

    _iStart = _iStart + 1;


  _iEnd = _iLen;
  while _iEnd > _iStart and _bIsWhitespaceCharPY(_sVal[( _iEnd - 1):( _iEnd - 1)+( 1)]) == True: 

    _iEnd = _iEnd - 1;


  return _sVal[( _iStart):( _iStart)+( _iEnd - _iStart)];


def _sStripPythonBraces(_sIndentedCode, _sIndentUnit): 

  _sResult = "";
  _iDepth = 0;
  _i = 0;
  _iLen = len(_sIndentedCode);
  _bStartOfLine = True;
  _aOpenPositions = [];

  while _i < _iLen: 

    _sCh = _sIndentedCode[( _i):( _i)+( 1)];

    if _sCh == "{": 

      _aOpenPositions.append( len(_sResult));
      _iDepth = _iDepth + 1;
      _sResult = _sResult + "\n";
      _bStartOfLine = True;
      _i = _i + 1;


    elif _sCh == "}": 

      _iContentStart = 0;
      if len(_aOpenPositions) > 0: 

        _iContentStart = _aOpenPositions[len(_aOpenPositions) - 1];
        _aOpenPositions.pop();


      _sSinceOpen = _sResult[( _iContentStart):( _iContentStart)+( len(_sResult) - _iContentStart)];
      if _sTrimWithPY(_sSinceOpen) == "": 

        _iStep = 0;
        while _iStep < _iDepth: 

          _sResult = _sResult + "" + _sIndentUnit; 

          _iStep = _iStep + 1;


        _sResult = _sResult + "pass\n";


      _iDepth = _iDepth - 1;
      _sResult = _sResult + "\n";
      _bStartOfLine = True;
      _i = _i + 1;

      _iPeek = _i;
      while _iPeek < _iLen and _bIsWhitespaceCharPY(_sIndentedCode[( _iPeek):( _iPeek)+( 1)]) == True: 

        _iPeek = _iPeek + 1;


      if _iPeek < _iLen and _sIndentedCode[( _iPeek):( _iPeek)+( 1)] == ";": 

        _i = _iPeek + 1;




    elif _sCh == "\n": 

      _sResult = _sResult + "\n";
      _bStartOfLine = True;
      _i = _i + 1;


    elif _bIsWhitespaceCharPY(_sCh) == True: 

      if _bStartOfLine == True: 

        _i = _i + 1;


      else: 

        _sResult = _sResult + "" + _sCh;
        _i = _i + 1;




    else: 

      if _bStartOfLine == True: 

        _iStep = 0;
        while _iStep < _iDepth: 

          _sResult = _sResult + "" + _sIndentUnit;

          _iStep = _iStep + 1;


        _bStartOfLine = False;


      _sResult = _sResult + "" + _sCh;
      _i = _i + 1;




  return _sResult;


