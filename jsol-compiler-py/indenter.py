import math
from jsol_core import JSOL

# @JSOL v0.2.95 - Self-Hosted Brace-to-Indent Formatter (structural pretty-printer)
#
# Operates on MASKED code (strings/comments already replaced by __JSOL_STR_N__ /
# __JSOL_COM_N__ tokens by lexer.jsol), BEFORE $sUnmaskSourceCode runs.
#
# Because JSOL forbids raw object literals at the source level (dicts are always
# Map.create(...)), every "{" and "}" that survives compilation into masked target
# code is a genuine block delimiter: function bodies, if/for/while, JSOL.JS/JSOL.PHP.
# There is no case where a brace means anything else, so counting depth doubles as
# an unambiguous indentation oracle with zero risk of mistaking an object-literal
# brace for a block brace.
#
# Scope, deliberately: this pass only inserts structure around "{" and "}". It does
# NOT split multiple ";"-terminated statements that already share a line in the
# compiler's dense output. That's a separate, later decision, not part of this pass.
#
# Usage: run standalone against already-compiled JS/PHP/TS output first (before
# wiring it into engine.jsol) to confirm it doesn't change program behavior, only
# layout. Once validated, the natural insertion point is inside $mExecuteCompilationPipeline,
# applied to $sCompiledJS / $sCompiledPHP / $sCompiledTS right before each is passed
# to $sUnmaskSourceCode.

def _sRepeatUnit(_sUnit, _iCount): 

  _sOut = "";
  _i = 0;
  while _i < _iCount: 

    _sOut = _sOut + "" + _sUnit;

    _i = _i + 1;


  return _sOut;


def _bIsWhitespaceChar(_sCh): 

  if _sCh == " ": 

    return True;


  if _sCh == "\t": 

    return True;


  if _sCh == "\n": 

    return True;


  if _sCh == "\r": 

    return True;


  return False;


# Trims only trailing whitespace from an accumulated output buffer, so closing
# braces don't inherit blank lines or dangling spaces left over from the source's
# own (irrelevant, about to be discarded) original formatting.
def _sRTrimBuffer(_sBuf): 

  _iEnd = len(_sBuf);
  while _iEnd > 0 and _bIsWhitespaceChar(_sBuf[( _iEnd - 1):( _iEnd - 1)+( 1)]) == True: 

    _iEnd = _iEnd - 1;


  return _sBuf[( 0):( 0)+( _iEnd)];


def _sIndentCode(_sMaskedCode, _sIndentUnit): 

  _sResult = "";
  _iDepth = 0;
  _i = 0;
  _iLen = len(_sMaskedCode);

  while _i < _iLen: 

    _sChar = _sMaskedCode[( _i):( _i)+( 1)];

    if _sChar == "{": 

      _iDepth = _iDepth + 1;
      _sResult = _sResult + "" + "{" + "\n" + _sRepeatUnit(_sIndentUnit, _iDepth);
      _i = _i + 1;

      # Swallow whatever whitespace the original source had right after "{" —
      # we just emitted our own newline+indent, so any of it left over would
      # only produce blank lines.
      _bSkipping = True;
      while _i < _iLen and _bSkipping == True: 

        if _bIsWhitespaceChar(_sMaskedCode[( _i):( _i)+( 1)]) == True: 

          _i = _i + 1;


        else: 

          _bSkipping = False;






    elif _sChar == "}": 

      _iDepth = _iDepth - 1;
      _sResult = _sRTrimBuffer(_sResult) + "\n" + _sRepeatUnit(_sIndentUnit, _iDepth) + "" + "}";
      _i = _i + 1;

      # Swallow whitespace right after "}" before deciding what comes next —
      # same reasoning as after "{": the original spacing is irrelevant, we
      # only care about the next real character.
      _bSkippingAfter = True;
      while _i < _iLen and _bSkippingAfter == True: 

        if _bIsWhitespaceChar(_sMaskedCode[( _i):( _i)+( 1)]) == True: 

          _i = _i + 1;


        else: 

          _bSkippingAfter = False;




      # A ";" immediately following a block close (e.g. "const $mFn = function(){...};")
      # is not a new statement, it's the terminator of THIS one. Glue it onto the
      # same line as "}" instead of stranding it alone on the next line.
      if _i < _iLen and _sMaskedCode[( _i):( _i)+( 1)] == ";": 

        _sResult = _sResult + "" + ";";
        _i = _i + 1;

        _bSkippingAfterSemi = True;
        while _i < _iLen and _bSkippingAfterSemi == True: 

          if _bIsWhitespaceChar(_sMaskedCode[( _i):( _i)+( 1)]) == True: 

            _i = _i + 1;


          else: 

            _bSkippingAfterSemi = False;






      _sResult = _sResult + "\n" + _sRepeatUnit(_sIndentUnit, _iDepth);


    else: 

      _sResult = _sResult + "" + _sChar;
      _i = _i + 1;




  return _sResult;


