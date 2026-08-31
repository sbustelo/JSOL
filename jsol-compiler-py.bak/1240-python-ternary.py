import math
import functools
from jsol_core import JSOL

# @JSOL v0.2.97 - Python Ternary Reorderer
def bIsIdentChar2(saCh): 

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


def iFindStatementEnd(saCode, iStart): 

  iLen = len(saCode);
  iParenDepth = 0;
  iBracketDepth = 0;
  i = iStart;

  while i < iLen: 

    saCh = saCode[( i):( i)+( 1)];
    if saCh == "(": 

      iParenDepth = iParenDepth + 1;


    elif saCh == ")": 

      iParenDepth = iParenDepth - 1;


    elif saCh == "[": 

      iBracketDepth = iBracketDepth + 1;


    elif saCh == "]": 

      iBracketDepth = iBracketDepth - 1;


    elif saCh == ";" and iParenDepth == 0 and iBracketDepth == 0: 

      return i;


    i = i + 1;


  return iLen;


def mSplitTernary(saExpr): 

  iLen = len(saExpr);
  iParenDepth = 0;
  iBracketDepth = 0;
  iQuestionIndex = -1;
  iColonIndex = -1;
  i = 0;

  while i < iLen: 

    saCh = saExpr[( i):( i)+( 1)];
    if saCh == "(": 

      iParenDepth = iParenDepth + 1;


    elif saCh == ")": 

      iParenDepth = iParenDepth - 1;


    elif saCh == "[": 

      iBracketDepth = iBracketDepth + 1;


    elif saCh == "]": 

      iBracketDepth = iBracketDepth - 1;


    elif saCh == "?" and iParenDepth == 0 and iBracketDepth == 0: 

      if iQuestionIndex == -1: 

        iQuestionIndex = i;


      else: 

        return JSOL.dict("ok",  False);




    elif saCh == ":" and iParenDepth == 0 and iBracketDepth == 0 and iQuestionIndex != -1 and iColonIndex == -1: 

      iColonIndex = i;


    i = i + 1;


  if iQuestionIndex == -1 or iColonIndex == -1: 

    return JSOL.dict("ok",  False);


  saCond = saTrimWhitespace(saExpr[( 0):( 0)+( iQuestionIndex)]);
  saTrue = saTrimWhitespace(saExpr[( iQuestionIndex + 1):( iQuestionIndex + 1)+( iColonIndex - (iQuestionIndex + 1))]);
  saFalse = saTrimWhitespace(saExpr[( iColonIndex + 1):( iColonIndex + 1)+( iLen - (iColonIndex + 1))]);

  return JSOL.dict("ok",  True,  "cond",  saCond,  "true",  saTrue,  "false",  saFalse);


def saConvertTernaries(saMaskedCode): 

  saResult = "";
  i = 0;
  iLen = len(saMaskedCode);

  while i < iLen: 

    saCh = saMaskedCode[( i):( i)+( 1)];
    bAtBoundary = (i == 0) or (bIsIdentChar2(saMaskedCode[( i - 1):( i - 1)+( 1)]) == False);
    bHandled = False;

    if bAtBoundary == True and saMaskedCode[( i):( i)+( 7)] == "return " and bIsIdentChar2(saMaskedCode[( i + 6):( i + 6)+( 1)]) == False: 

      iRhsStart = i + 7;
      iStmtEnd = iFindStatementEnd(saMaskedCode, iRhsStart);
      saRhs = saMaskedCode[( iRhsStart):( iRhsStart)+( iStmtEnd - iRhsStart)];
      mSplit = mSplitTernary(saRhs);

      if mSplit["ok"] == True: 

        saResult = saResult + "" + "return (" + "" + mSplit["true"] + "" + " if " + "" + mSplit["cond"] + "" + " else " + "" + mSplit["false"] + "" + ")" + ";";
        i = iStmtEnd + 1;
        bHandled = True;




    if bHandled == False and saCh == "=": 

      saPrevCh = saMaskedCode[( i - 1):( i - 1)+( 1)];
      saNextCh = saMaskedCode[( i + 1):( i + 1)+( 1)];
      bIsPlainAssign = ((saNextCh != "=") and (saPrevCh != "=") and (saPrevCh != "<") and (saPrevCh != ">") and (saPrevCh != "!"));

      if bIsPlainAssign == True: 

        iRhsStart = i + 1;
        iStmtEnd = iFindStatementEnd(saMaskedCode, iRhsStart);
        saRhs = saMaskedCode[( iRhsStart):( iRhsStart)+( iStmtEnd - iRhsStart)];
        mSplit = mSplitTernary(saRhs);

        if mSplit["ok"] == True: 

          saResult = saResult + "" + "= (" + "" + mSplit["true"] + "" + " if " + "" + mSplit["cond"] + "" + " else " + "" + mSplit["false"] + "" + ")" + ";";
          i = iStmtEnd + 1;
          bHandled = True;






    if bHandled == False: 

      saResult = saResult + "" + saCh;
      i = i + 1;




  return saResult;


