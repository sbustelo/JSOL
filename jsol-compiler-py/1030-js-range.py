import math
import functools
from jsol_core import JSOL

# @JSOL v0.2.97
def fProcessRange(saCode): 

  if JSOL.str_index_of(saCode,  "JSOL.range") == -1: 

    return saCode;


  saResult = saCode;
  bContinue = True;

  while bContinue == True: 

    iRelIdx = JSOL.str_index_of(saResult,  "for");
    if iRelIdx == -1: 

      bContinue = False; continue;


    iStartIdx = iRelIdx;
    i = iStartIdx + 3;

    while i < len(saResult) and (saResult[( i):( i)+( 1)] == " " or saResult[( i):( i)+( 1)] == "\n" or saResult[( i):( i)+( 1)] == "\t" or saResult[( i):( i)+( 1)] == "\r" or saResult[( i):( i)+( 1)] == "("): 

      i = i + 1;


    if saResult[( i):( i)+( 4)] == "let ": 

      i = i + 4;


    iV = i;
    if saResult[( iV):( iV)+( 1)] != "$": 

      saResult = saResult[( 0):( 0)+( iStartIdx)] + "__JSOL_FOR__" + saResult[( iStartIdx + 3):( iStartIdx + 3)+( len(saResult) - iStartIdx - 3)];
      continue;


    while iV < len(saResult): 

      saC = saResult[( iV):( iV)+( 1)];
      if saC == "_" or saC == "$" or (saC >= "a" and saC <= "z") or (saC >= "A" and saC <= "Z") or (saC >= "0" and saC <= "9"): 

        iV = iV + 1;


      else: 

        break;




    saVarName = saResult[( i):( i)+( iV - i)];
    i = iV;

    while i < len(saResult) and (saResult[( i):( i)+( 1)] == " " or saResult[( i):( i)+( 1)] == "\n" or saResult[( i):( i)+( 1)] == "\t" or saResult[( i):( i)+( 1)] == "\r"): 

      i = i + 1;


    if saResult[( i):( i)+( 2)] != "of": 

      saResult = saResult[( 0):( 0)+( iStartIdx)] + "__JSOL_FOR__" + saResult[( iStartIdx + 3):( iStartIdx + 3)+( len(saResult) - iStartIdx - 3)];
      continue;


    i = i + 2;
    while i < len(saResult) and (saResult[( i):( i)+( 1)] == " " or saResult[( i):( i)+( 1)] == "\n" or saResult[( i):( i)+( 1)] == "\t" or saResult[( i):( i)+( 1)] == "\r"): 

      i = i + 1;


    if saResult[( i):( i)+( 11)] != "JSOL.range(": 

      saResult = saResult[( 0):( 0)+( iStartIdx)] + "__JSOL_FOR__" + saResult[( iStartIdx + 3):( iStartIdx + 3)+( len(saResult) - iStartIdx - 3)];
      continue;


    iParenOpen = i + 10;
    mDataArgs = mComp_ParseArgs(saResult, iParenOpen);
    if mDataArgs["close"] == -1: 

      saResult = saResult[( 0):( 0)+( iStartIdx)] + "__JSOL_FOR__" + saResult[( iStartIdx + 3):( iStartIdx + 3)+( len(saResult) - iStartIdx - 3)];
      continue;


    iB = mDataArgs["close"] + 1;
    while iB < len(saResult) and (saResult[( iB):( iB)+( 1)] == " " or saResult[( iB):( iB)+( 1)] == "\n" or saResult[( iB):( iB)+( 1)] == "\t" or saResult[( iB):( iB)+( 1)] == "\r" or saResult[( iB):( iB)+( 1)] == ")"): 

      iB = iB + 1;


    if saResult[( iB):( iB)+( 1)] != "{": 

      saResult = saResult[( 0):( 0)+( iStartIdx)] + "__JSOL_FOR__" + saResult[( iStartIdx + 3):( iStartIdx + 3)+( len(saResult) - iStartIdx - 3)];
      continue;


    iBraceClose = iComp_FindCloseBrace(saResult, iB);
    if iBraceClose == -1: 

      saResult = saResult[( 0):( 0)+( iStartIdx)] + "__JSOL_FOR__" + saResult[( iStartIdx + 3):( iStartIdx + 3)+( len(saResult) - iStartIdx - 3)];
      continue;


    saBody = saResult[( iB + 1):( iB + 1)+( iBraceClose - iB - 1)];
    aArgs = mDataArgs["args"];
    saCleanVar = saVarName[( 1):( 1)+( len(saVarName) - 1)];
    saFromVar = '$JSOL_from_' + saCleanVar;
    saToVar = '$JSOL_to_' + saCleanVar;
    saStepVar = '$JSOL_step_' + saCleanVar;
    saIncVar = '$JSOL_inc_' + saCleanVar;
    saIxVar = '$JSOL_i_' + saCleanVar;

    saSetup = "let " + saFromVar + " = (" + aArgs[0] + ");\nlet " + saToVar + " = (" + aArgs[1] + ");\n";
    if len(aArgs) > 2 and len(aArgs[2]) > 0: 

      saSetup = saSetup + "let " + saStepVar + " = (" + aArgs[2] + ");\n";


    else: 

      saSetup = saSetup + "let " + saStepVar + " = 1;\n";


    saSetup = saSetup + "let " + saIncVar + " = Math.abs(" + saStepVar + ");\nif (" + saFromVar + " > " + saToVar + ") { " + saIncVar + " = -" + saIncVar + "; }\nlet " + saVarName + " = " + saFromVar + ";\nlet " + saIxVar + " = 1;\n";

    saCond = "((" + saIncVar + " > 0 && " + saVarName + " <= " + saToVar + ") || (" + saIncVar + " <= 0 && " + saVarName + " >= " + saToVar + "))";

    saNewBody = 'let $JSOL_i = ' + saIxVar + ';\n' + saBody + "\n" + saVarName + " = " + saVarName + " + " + saIncVar + ";\n" + saIxVar + " = " + saIxVar + " + 1;\n";

    saReplace = "if (true) {\n" + saSetup + "while (" + saCond + ") {\n" + saNewBody + "}\n}";
    saResult = saResult[( 0):( 0)+( iStartIdx)] + "" + saReplace + "" + saResult[( iBraceClose + 1):( iBraceClose + 1)+( len(saResult) - iBraceClose - 1)];


  saResult = saResult.replace( "__JSOL_FOR__",  "for");
  return saResult;


