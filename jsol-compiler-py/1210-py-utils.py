import math
import functools
from jsol_core import JSOL

# @JSOL v0.2.97 - Python Compiler Utilities
def bIsWhitespaceCharTrim(saCh): 

  if saCh == " ": 

    return True;


  if saCh == "\t": 

    return True;


  if saCh == "\n": 

    return True;


  if saCh == "\r": 

    return True;


  return False;


def saTrimWhitespace(saVal): 

  iLen = len(saVal);
  iStart = 0;
  while iStart < iLen and bIsWhitespaceCharTrim(saVal[( iStart):( iStart)+( 1)]) == True: 

    iStart = iStart + 1;


  iEnd = iLen;
  while iEnd > iStart and bIsWhitespaceCharTrim(saVal[( iEnd - 1):( iEnd - 1)+( 1)]) == True: 

    iEnd = iEnd - 1;


  return saVal[( iStart):( iStart)+( iEnd - iStart)];


def bIsIdentChar(saCh): 

  if saCh == "_": 

    return True;


  if saCh == "$": 

    return True;


  if saCh >= "a" and saCh <= "z": 

    return True;


  if saCh >= "A" and saCh <= "Z": 

    return True;


  if saCh >= "0" and saCh <= "9": 

    return True;


  return False;


def mReadWord(saCode, iStart): 

  iLen = len(saCode);
  i = iStart;
  while i < iLen and bIsIdentChar(saCode[( i):( i)+( 1)]) == True: 

    i = i + 1;


  return JSOL.dict("word",  saCode[( iStart):( iStart)+( i - iStart)],  "end",  i);


def iSkipWhitespace(saCode, iStart): 

  iLen = len(saCode);
  i = iStart;
  while i < iLen: 

    saCh = saCode[( i):( i)+( 1)];
    if saCh == " " or saCh == "\t" or saCh == "\n" or saCh == "\r": 

      i = i + 1;


    else: 

      return i;




  return i;


def mReadBalancedParens(saCode, iOpenIndex): 

  iLen = len(saCode);
  iDepth = 0;
  i = iOpenIndex;
  iInsideStart = -1;

  while i < iLen: 

    saCh = saCode[( i):( i)+( 1)];
    if saCh == "(": 

      iDepth = iDepth + 1;
      if iDepth == 1: 

        iInsideStart = i + 1;




    elif saCh == ")": 

      iDepth = iDepth - 1;
      if iDepth == 0: 

        return JSOL.dict(
        "inside",  saCode[( iInsideStart):( iInsideStart)+( i - iInsideStart)], 
        "end",  i + 1
        );




    i = i + 1;


  return JSOL.dict("inside",  "",  iLen);


def mReadBalancedBraces(saCode, iOpenIndex): 

  iLen = len(saCode);
  iDepth = 0;
  i = iOpenIndex;
  iInsideStart = -1;
  while i < iLen: 

    saCh = saCode[( i):( i)+( 1)];
    if saCh == "{": 

      iDepth = iDepth + 1;
      if iDepth == 1: 

        iInsideStart = i + 1;




    elif saCh == "}": 

      iDepth = iDepth - 1;
      if iDepth == 0: 

        return JSOL.dict("inside",  saCode[( iInsideStart):( iInsideStart)+( i - iInsideStart)],  "end",  i + 1);




    i = i + 1;


  return JSOL.dict("inside",  "",  iLen);


