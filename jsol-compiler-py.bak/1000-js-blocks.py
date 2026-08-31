import math
import functools
from jsol_core import JSOL

# @JSOL v0.2.97
def fProcessBlock(saCode, saKeyword, bUnwrap): 

  saResult = saCode;
  bContinue = True;
  iOffset = 0;

  while bContinue == True: 

    iSearchLen = len(saResult) - iOffset;
    if iSearchLen <= 0: 

      bContinue = False; continue;


    saSearchArea = saResult[( iOffset):( iOffset)+( iSearchLen)];
    iRelIdx = JSOL.str_index_of(saSearchArea,  saKeyword);
    if iRelIdx == -1: 

      bContinue = False; continue;


    iStartIdx = iOffset + iRelIdx;
    saTail = saResult[( iStartIdx):( iStartIdx)+( len(saResult) - iStartIdx)];
    iRelOpenBrace = JSOL.str_index_of(saTail,  "{");

    if iRelOpenBrace == -1: 

      bContinue = False; continue;


    iOpenBrace = iStartIdx + iRelOpenBrace;

    iCloseBrace = iComp_FindCloseBrace(saResult, iOpenBrace);
    if iCloseBrace == -1: 

      bContinue = False; continue;


    iEndIdx = iComp_FindStmtEnd(saResult, iCloseBrace + 1);
    saBefore = saResult[( 0):( 0)+( iStartIdx)];
    saAfter = saResult[( iEndIdx):( iEndIdx)+( len(saResult) - iEndIdx)];

    if bUnwrap == True: 

      saInner = saResult[( iOpenBrace + 1):( iOpenBrace + 1)+( iCloseBrace - iOpenBrace - 1)];
      saResult = saBefore + "" + saInner + "" + saAfter;
      iOffset = len(saBefore) + len(saInner);


    else: 

      saResult = saBefore + "" + saAfter;
      iOffset = len(saBefore);




  return saResult;


