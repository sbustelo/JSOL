import math
import functools
from jsol_core import JSOL

# @JSOL v0.2.97 - PHP Use Clause Extractor (Flat Cyclomatic Complexity)
def bPhp_IsIdentChar(saCh): 

  if saCh == "$": 

    return True;


  if saCh >= "a" and saCh <= "z": 

    return True;


  if saCh >= "A" and saCh <= "Z": 

    return True;


  if saCh >= "0" and saCh <= "9": 

    return True;


  return False;


def mPhp_ReadWord(saCode, iStart): 

  iLen = len(saCode);
  i = iStart;
  while i < iLen and bPhp_IsIdentChar(saCode[( i):( i)+( 1)]): 

    i = i + 1;


  return JSOL.dict("word",  saCode[( iStart):( iStart)+( i - iStart)],  "end",  i);


def aPhp_ExtractVars(saText): 

  aVars = [];
  i = 0;
  iLen = len(saText);
  while i < iLen: 

    if saText[( i):( i)+( 1)] == "$": 

      mWord = mPhp_ReadWord(saText, i);
      if mWord["word"] != '$_': 

        aVars.append( mWord["word"]);


      i = mWord["end"];


    else: 

      i = i + 1;




  return aVars;


def aPhp_ExtractLocals(saBody): 

  aLocals = [];
  i = 0;
  iLen = len(saBody);

  while i < iLen: 

    bIsFunc = saBody[( i):( i)+( 8)] == "function";
    if bIsFunc == True and not bPhp_IsIdentChar(saBody[( i + 8):( i + 8)+( 1)]): 

      iParen = i + 8;
      while iParen < iLen and saBody[( iParen):( iParen)+( 1)] != "(": 

        iParen = iParen + 1;


      if iParen < iLen: 

        iPClose = iComp_FindCloseParen(saBody, iParen);
        if iPClose != -1: 

          saInnerParams = saBody[( iParen + 1):( iParen + 1)+( iPClose - iParen - 1)];
          aInnerVars = aPhp_ExtractVars(saInnerParams);
          iICount = len(aInnerVars);
          iK = 0;
          while iK < iICount: 

            aLocals.append( aInnerVars[iK]); 
            iK = iK + 1;






      i = i + 8; continue;


    bIsDecl = False;
    iAfterDecl = i;
    if saBody[( i):( i)+( 6)] == "const ": 

      bIsDecl = True; iAfterDecl = i + 6;


    elif saBody[( i):( i)+( 4)] == "let ": 

      bIsDecl = True; iAfterDecl = i + 4;


    if bIsDecl == True: 

      while iAfterDecl < iLen and (saBody[( iAfterDecl):( iAfterDecl)+( 1)] == " " or saBody[( iAfterDecl):( iAfterDecl)+( 1)] == "\n" or saBody[( iAfterDecl):( iAfterDecl)+( 1)] == "\r" or saBody[( iAfterDecl):( iAfterDecl)+( 1)] == "\t"): 

        iAfterDecl = iAfterDecl + 1;


      if saBody[( iAfterDecl):( iAfterDecl)+( 1)] == "$": 

        mWord = mPhp_ReadWord(saBody, iAfterDecl);
        aLocals.append( mWord["word"]);


      i = iAfterDecl; continue;


    i = i + 1;


  return aLocals;


def mPhp_AnalyzeClosure(saCode, iFuncStart): 

  iParenOpen = iFuncStart + 8;
  iLen = len(saCode);
  while iParenOpen < iLen and saCode[( iParenOpen):( iParenOpen)+( 1)] != "(" and saCode[( iParenOpen):( iParenOpen)+( 1)] != "{": 

    iParenOpen = iParenOpen + 1;


  if iParenOpen >= iLen or saCode[( iParenOpen):( iParenOpen)+( 1)] != "(": 

    return JSOL.dict("valid",  False);


  iParenClose = iComp_FindCloseParen(saCode, iParenOpen);
  if iParenClose == -1: 

    return JSOL.dict("valid",  False);


  iBraceOpen = iParenClose + 1;
  while iBraceOpen < iLen and saCode[( iBraceOpen):( iBraceOpen)+( 1)] != "{" and saCode[( iBraceOpen):( iBraceOpen)+( 1)] != "(": 

    iBraceOpen = iBraceOpen + 1;


  if iBraceOpen >= iLen or saCode[( iBraceOpen):( iBraceOpen)+( 1)] != "{": 

    return JSOL.dict("valid",  False);


  iBraceClose = iComp_FindCloseBrace(saCode, iBraceOpen);
  if iBraceClose == -1: 

    return JSOL.dict("valid",  False);


  saParamsStr = saCode[( iParenOpen + 1):( iParenOpen + 1)+( iParenClose - iParenOpen - 1)];
  saBody = saCode[( iParenOpen + 1):( iParenOpen + 1)+( iBraceClose - iParenOpen - 1)];

  if JSOL.str_index_of(saBody,  "JSOL.use") != -1: 

    return JSOL.dict("valid",  False);


  aParams = aPhp_ExtractVars(saParamsStr);
  aAllVars = aPhp_ExtractVars(saBody);
  aLocals = aPhp_ExtractLocals(saBody);

  aFree = [];
  iAllCount = len(aAllVars);
  iV = 0;
  while iV < iAllCount: 

    saVar = aAllVars[iV];
    if JSOL.arr_index_of(aParams,  saVar) == -1 and JSOL.arr_index_of(aLocals,  saVar) == -1 and JSOL.arr_index_of(aFree,  saVar) == -1: 

      aFree.append( saVar);


    iV = iV + 1;


  return JSOL.dict("valid",  True,  "free",  aFree,  "parenClose",  iParenClose);


def saExtractPHPUse(saCode): 

  saResult = saCode;
  iFunc = len(saResult) - 8;

  while iFunc >= 0: 

    if saResult[( iFunc):( iFunc)+( 8)] != "function": 

      iFunc = iFunc - 1; continue;


    bPrev = iFunc == 0 or not bPhp_IsIdentChar(saResult[( iFunc - 1):( iFunc - 1)+( 1)]);
    bNext = iFunc + 8 == len(saResult) or not bPhp_IsIdentChar(saResult[( iFunc + 8):( iFunc + 8)+( 1)]);
    if not bPrev or not bNext: 

      iFunc = iFunc - 1; continue;


    mAnalysis = mPhp_AnalyzeClosure(saResult, iFunc);
    if mAnalysis["valid"] == True: 

      aFree = mAnalysis["free"];
      if len(aFree) > 0: 

        aRefFree = [];
        iFreeCount = len(aFree);
        iF = 0;
        while iF < iFreeCount: 

          aRefFree.append( "&$" + aFree[iF][( 1):( 1)+( len(aFree[iF]) - 1)]);

          iF = iF + 1;


        saUseClause = " use (" +  ", ".join(str(_x) for _x in aRefFree) + ")";
        iParenClose = mAnalysis["parenClose"];
        saBefore = saResult[( 0):( 0)+( iParenClose + 1)];
        saAfter = saResult[( iParenClose + 1):( iParenClose + 1)+( len(saResult) - (iParenClose + 1))];
        saResult = saBefore + "" + saUseClause + "" + saAfter;




    iFunc = iFunc - 1;


  return saResult;


