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

def bIsWhitespaceCharPY(sCh): 

  if sCh == " ": 

    return True;


  if sCh == "\t": 

    return True;


  if sCh == "\n": 

    return True;


  if sCh == "\r": 

    return True;


  return False;


def sTrimWithPY(sVal): 

  iLen = len(sVal);
  iStart = 0;
  while iStart < iLen and bIsWhitespaceCharPY(sVal[( iStart):( iStart)+( 1)]) == True: 

    iStart = iStart + 1;


  iEnd = iLen;
  while iEnd > iStart and bIsWhitespaceCharPY(sVal[( iEnd - 1):( iEnd - 1)+( 1)]) == True: 

    iEnd = iEnd - 1;


  return sVal[( iStart):( iStart)+( iEnd - iStart)];


def sStripPythonBraces(sIndentedCode, sIndentUnit): 

  sResult = "";
  iDepth = 0;
  i = 0;
  iLen = len(sIndentedCode);
  bStartOfLine = True;
  aOpenPositions = [];

  while i < iLen: 

    sCh = sIndentedCode[( i):( i)+( 1)];

    if sCh == "{": 

      aOpenPositions.append( len(sResult));
      iDepth = iDepth + 1;
      sResult = sResult + "\n";
      bStartOfLine = True;
      i = i + 1;


    elif sCh == "}": 

      iContentStart = 0;
      if len(aOpenPositions) > 0: 

        iContentStart = aOpenPositions[len(aOpenPositions) - 1];
        aOpenPositions.pop();


      sSinceOpen = sResult[( iContentStart):( iContentStart)+( len(sResult) - iContentStart)];
      if sTrimWithPY(sSinceOpen) == "": 

        iStep = 0;
        while iStep < iDepth: 

          sResult = sResult + "" + sIndentUnit; 

          iStep = iStep + 1;


        sResult = sResult + "pass\n";


      iDepth = iDepth - 1;
      sResult = sResult + "\n";
      bStartOfLine = True;
      i = i + 1;

      iPeek = i;
      while iPeek < iLen and bIsWhitespaceCharPY(sIndentedCode[( iPeek):( iPeek)+( 1)]) == True: 

        iPeek = iPeek + 1;


      if iPeek < iLen and sIndentedCode[( iPeek):( iPeek)+( 1)] == ";": 

        i = iPeek + 1;




    elif sCh == "\n": 

      sResult = sResult + "\n";
      bStartOfLine = True;
      i = i + 1;


    elif bIsWhitespaceCharPY(sCh) == True: 

      if bStartOfLine == True: 

        i = i + 1;


      else: 

        sResult = sResult + "" + sCh;
        i = i + 1;




    else: 

      if bStartOfLine == True: 

        iStep = 0;
        while iStep < iDepth: 

          sResult = sResult + "" + sIndentUnit;

          iStep = iStep + 1;


        bStartOfLine = False;


      sResult = sResult + "" + sCh;
      i = i + 1;




  return sResult;


