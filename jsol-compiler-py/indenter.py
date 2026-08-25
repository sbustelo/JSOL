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

def sRepeatUnit(sUnit, iCount): 

  sOut = "";
  i = 0;
  while i < iCount: 

    sOut = sOut + "" + sUnit;

    i = i + 1;


  return sOut;


def bIsWhitespaceChar(sCh): 

  if sCh == " ": 

    return True;


  if sCh == "\t": 

    return True;


  if sCh == "\n": 

    return True;


  if sCh == "\r": 

    return True;


  return False;


# Trims only trailing whitespace from an accumulated output buffer, so closing
# braces don't inherit blank lines or dangling spaces left over from the source's
# own (irrelevant, about to be discarded) original formatting.
def sRTrimBuffer(sBuf): 

  iEnd = len(sBuf);
  while iEnd > 0 and bIsWhitespaceChar(sBuf[( iEnd - 1):( iEnd - 1)+( 1)]) == True: 

    iEnd = iEnd - 1;


  return sBuf[( 0):( 0)+( iEnd)];


def sIndentCode(sMaskedCode, sIndentUnit): 

  sResult = "";
  iDepth = 0;
  i = 0;
  iLen = len(sMaskedCode);

  while i < iLen: 

    sChar = sMaskedCode[( i):( i)+( 1)];

    if sChar == "{": 

      iDepth = iDepth + 1;
      sResult = sResult + "" + "{" + "\n" + sRepeatUnit(sIndentUnit, iDepth);
      i = i + 1;

      # Swallow whatever whitespace the original source had right after "{" —
      # we just emitted our own newline+indent, so any of it left over would
      # only produce blank lines.
      bSkipping = True;
      while i < iLen and bSkipping == True: 

        if bIsWhitespaceChar(sMaskedCode[( i):( i)+( 1)]) == True: 

          i = i + 1;


        else: 

          bSkipping = False;






    elif sChar == "}": 

      iDepth = iDepth - 1;
      sResult = sRTrimBuffer(sResult) + "\n" + sRepeatUnit(sIndentUnit, iDepth) + "" + "}";
      i = i + 1;

      # Swallow whitespace right after "}" before deciding what comes next —
      # same reasoning as after "{": the original spacing is irrelevant, we
      # only care about the next real character.
      bSkippingAfter = True;
      while i < iLen and bSkippingAfter == True: 

        if bIsWhitespaceChar(sMaskedCode[( i):( i)+( 1)]) == True: 

          i = i + 1;


        else: 

          bSkippingAfter = False;




      # A ";" immediately following a block close (e.g. "const $mFn = function(){...};")
      # is not a new statement, it's the terminator of THIS one. Glue it onto the
      # same line as "}" instead of stranding it alone on the next line.
      if i < iLen and sMaskedCode[( i):( i)+( 1)] == ";": 

        sResult = sResult + "" + ";";
        i = i + 1;

        bSkippingAfterSemi = True;
        while i < iLen and bSkippingAfterSemi == True: 

          if bIsWhitespaceChar(sMaskedCode[( i):( i)+( 1)]) == True: 

            i = i + 1;


          else: 

            bSkippingAfterSemi = False;






      sResult = sResult + "\n" + sRepeatUnit(sIndentUnit, iDepth);


    else: 

      sResult = sResult + "" + sChar;
      i = i + 1;




  return sResult;


