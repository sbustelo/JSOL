import math
import functools
from jsol_core import JSOL

# @JSOL v0.2.97 - Python Brace Stripper
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


def bIsWhitespaceCharPY(saCh): 

  if saCh == " ": 

    return True;


  if saCh == "\t": 

    return True;


  if saCh == "\n": 

    return True;


  if saCh == "\r": 

    return True;


  return False;


def saTrimWithPY(saVal): 

  iLen = len(saVal);
  iStart = 0;
  while iStart < iLen and bIsWhitespaceCharPY(saVal[( iStart):( iStart)+( 1)]) == True: 

    iStart = iStart + 1;


  iEnd = iLen;
  while iEnd > iStart and bIsWhitespaceCharPY(saVal[( iEnd - 1):( iEnd - 1)+( 1)]) == True: 

    iEnd = iEnd - 1;


  return saVal[( iStart):( iStart)+( iEnd - iStart)];


def saStripPythonBraces(saIndentedCode, saIndentUnit): 

  saResult = "";
  iDepth = 0;
  i = 0;
  iLen = len(saIndentedCode);
  bStartOfLine = True;
  aOpenPositions = [];

  while i < iLen: 

    saCh = saIndentedCode[( i):( i)+( 1)];

    if saCh == "{": 

      aOpenPositions.append( len(saResult));
      iDepth = iDepth + 1;
      saResult = saResult + "\n";
      bStartOfLine = True;
      i = i + 1;


    elif saCh == "}": 

      iContentStart = 0;
      if len(aOpenPositions) > 0: 

        iContentStart = aOpenPositions[len(aOpenPositions) - 1];
        JSOL.arr_pop(aOpenPositions);


      saSinceOpen = saResult[( iContentStart):( iContentStart)+( len(saResult) - iContentStart)];
      if saTrimWithPY(saSinceOpen) == "": 

        iStep = 0;
        while iStep < iDepth: 

          saResult = saResult + "" + saIndentUnit; 

          iStep = iStep + 1;


        saResult = saResult + "pass\n";


      iDepth = iDepth - 1;
      saResult = saResult + "\n";
      bStartOfLine = True;
      i = i + 1;

      iPeek = i;
      while iPeek < iLen and bIsWhitespaceCharPY(saIndentedCode[( iPeek):( iPeek)+( 1)]) == True: 

        iPeek = iPeek + 1;


      if iPeek < iLen and saIndentedCode[( iPeek):( iPeek)+( 1)] == ";": 

        i = iPeek + 1;




    elif saCh == "\n": 

      saResult = saResult + "\n";
      bStartOfLine = True;
      i = i + 1;


    elif bIsWhitespaceCharPY(saCh) == True: 

      if bStartOfLine == True: 

        i = i + 1;


      else: 

        saResult = saResult + "" + saCh;
        i = i + 1;




    else: 

      if bStartOfLine == True: 

        iStep = 0;
        while iStep < iDepth: 

          saResult = saResult + "" + saIndentUnit;

          iStep = iStep + 1;


        bStartOfLine = False;


      saResult = saResult + "" + saCh;
      i = i + 1;




  return saResult;


