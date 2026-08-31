import math
import functools
from jsol_core import JSOL

# @JSOL v0.2.97 - Self-Hosted Brace-to-Indent Formatter (structural pretty-printer)
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


def saInd_RepeatUnit(saUnit, iCount): 

  saOut = "";
  i = 0;
  while i < iCount: 

    saOut = "".join(JSOL.to_str(_x) for _x in [saOut,  saUnit]);

    i = i + 1;


  return saOut;


def bInd_IsWhitespace(saCh): 

  return saCh == " " or saCh == "\t" or saCh == "\n" or saCh == "\r";


def saInd_RTrimBuffer(saBuf): 

  iEnd = len(saBuf);
  while iEnd > 0 and bInd_IsWhitespace(saBuf[( iEnd - 1):( iEnd - 1)+( 1)]) == True: 

    iEnd = iEnd - 1;


  return saBuf[( 0):( 0)+( iEnd)];


def iInd_SkipWhitespace(saCode, iStart, iLen): 

  i = iStart;
  while i < iLen and bInd_IsWhitespace(saCode[( i):( i)+( 1)]) == True: 

    i = i + 1;


  return i;


def saIndentCode(saMaskedCode, saIndentUnit): 

  saResult = "";
  iDepth = 0;
  i = 0;
  iLen = len(saMaskedCode);

  while i < iLen: 

    saChar = saMaskedCode[( i):( i)+( 1)];

    if saChar == "{": 

      iDepth = iDepth + 1;
      saResult = "".join(JSOL.to_str(_x) for _x in [saResult,  "{\n",  saInd_RepeatUnit(saIndentUnit, iDepth)]);
      i = iInd_SkipWhitespace(saMaskedCode, i + 1, iLen);


    elif saChar == "}": 

      iDepth = iDepth - 1;
      saResult = "".join(JSOL.to_str(_x) for _x in [saInd_RTrimBuffer(saResult),  "\n",  saInd_RepeatUnit(saIndentUnit, iDepth),  "}"]);
      i = iInd_SkipWhitespace(saMaskedCode, i + 1, iLen);

      if i < iLen and saMaskedCode[( i):( i)+( 1)] == ";": 

        saResult = "".join(JSOL.to_str(_x) for _x in [saResult,  ";"]);
        i = iInd_SkipWhitespace(saMaskedCode, i + 1, iLen);


      saResult = "".join(JSOL.to_str(_x) for _x in [saResult,  "\n",  saInd_RepeatUnit(saIndentUnit, iDepth)]);


    else: 

      saResult = "".join(JSOL.to_str(_x) for _x in [saResult,  saChar]);
      i = i + 1;




  return saResult;


