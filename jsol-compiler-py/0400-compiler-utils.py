import math
import functools
from jsol_core import JSOL

# @JSOL v0.2.97 - AST-Free Global Utilities (1/2)

def bComp_IsWordChar(saCh): 

  if saCh == "": 

    return False;


  iCode = ord(saCh[ 0]);
  if iCode >= 48 and iCode <= 57: 

    return True;


  if iCode >= 65 and iCode <= 90: 

    return True;


  if iCode >= 97 and iCode <= 122: 

    return True;


  if iCode == 95: 

    return True;


  return False;


def mComp_ParseArgs(saCode, iOpenParen): 

  iParenCount = 1;
  iBracketCount = 0;
  iBraceCount = 0;
  bInStr = False;
  iCloseParen = -1;
  aArgs = [];
  iCurrentArgStart = iOpenParen + 1;
  iRLen = len(saCode);

  i = iOpenParen + 1;
  while i < iRLen: 

    saChar = saCode[( i):( i)+( 1)];
    saPrev = saCode[( i - 1):( i - 1)+( 1)];
    if saChar == "\"" and saPrev != "\\": 

      bInStr = not bInStr;


    if bInStr == False: 

      if saChar == "(": 

        iParenCount = iParenCount + 1;


      if saChar == ")": 

        iParenCount = iParenCount - 1;


      if saChar == "[": 

        iBracketCount = iBracketCount + 1;


      if saChar == "]": 

        iBracketCount = iBracketCount - 1;


      if saChar == "{": 

        iBraceCount = iBraceCount + 1;


      if saChar == "}": 

        iBraceCount = iBraceCount - 1;




    if saChar == "," and iParenCount == 1 and iBracketCount == 0 and iBraceCount == 0 and bInStr == False: 

      aArgs.append( saCode[( iCurrentArgStart):( iCurrentArgStart)+( i - iCurrentArgStart)]);
      iCurrentArgStart = i + 1;


    elif iParenCount == 0: 

      aArgs.append( saCode[( iCurrentArgStart):( iCurrentArgStart)+( i - iCurrentArgStart)]);
      iCloseParen = i;
      break;


    i = i + 1;


  return JSOL.dict("close",  iCloseParen,  "args",  aArgs);


def iComp_FindCloseBrace(saCode, iOpenBrace): 

  iBraceCount = 1;
  iRLen = len(saCode);
  i = iOpenBrace + 1;
  while i < iRLen: 

    saChar = saCode[( i):( i)+( 1)];
    if saChar == "{": 

      iBraceCount = iBraceCount + 1;


    if saChar == "}": 

      iBraceCount = iBraceCount - 1;


    if iBraceCount == 0: 

      return i;


    i = i + 1;


  return -1;


def iComp_FindCloseParen(saCode, iOpenParen): 

  iParenCount = 1;
  iRLen = len(saCode);
  i = iOpenParen + 1;
  while i < iRLen: 

    saChar = saCode[( i):( i)+( 1)];
    if saChar == "(": 

      iParenCount = iParenCount + 1;


    if saChar == ")": 

      iParenCount = iParenCount - 1;


    if iParenCount == 0: 

      return i;


    i = i + 1;


  return -1;


def iComp_FindStmtEnd(saCode, iStart): 

  iRLen = len(saCode);
  iEndIdx = iStart;
  bFindingEnd = True;
  while iEndIdx < iRLen and bFindingEnd == True: 

    saChar = saCode[( iEndIdx):( iEndIdx)+( 1)];
    if saChar == " " or saChar == "\n" or saChar == "\r" or saChar == ")" or saChar == ";": 

      iEndIdx = iEndIdx + 1;


    else: 

      bFindingEnd = False;




  return iEndIdx;


