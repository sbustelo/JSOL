import math
import functools
from jsol_core import JSOL

# @JSOL v0.2.97 - Python Translators & Sanitizers
def aTranslateCommentTokensToPython(aTokens): 

  aResult = [];
  i = 0;
  while i < len(aTokens): 

    mToken = aTokens[i];
    saKey = mToken["key"];
    saVal = mToken["value"];

    if saVal[( 0):( 0)+( 2)] == "//": 

      saRest = saVal[( 2):( 2)+( len(saVal) - 2)];
      aResult.append( JSOL.dict("key",  saKey,  "value",  "#" + "" + saRest));


    elif saVal[( 0):( 0)+( 2)] == "/*": 

      saInner = saVal[( 2):( 2)+( len(saVal) - 2)];
      if saInner[( len(saInner) - 2):( len(saInner) - 2)+( 2)] == "*/": 

        saInner = saInner[( 0):( 0)+( len(saInner) - 2)];


      saConverted = "#" + "" + saInner.replace( "\n",  "\n#");
      aResult.append( JSOL.dict("key",  saKey,  "value",  saConverted));


    else: 

      aResult.append( JSOL.dict("key",  saKey,  "value",  saVal));


    i = i + 1;


  return aResult;


def saTranslateOperators(saExpr): 

  saResult = "";
  i = 0;
  iLen = len(saExpr);

  while i < iLen: 

    saCh = saExpr[( i):( i)+( 1)];
    bAtBoundary = (i == 0) or (bIsIdentChar(saExpr[( i - 1):( i - 1)+( 1)]) == False);

    if bAtBoundary == True and bIsIdentChar(saCh) == True: 

      mWord = mReadWord(saExpr, i);
      saWordStr = mWord["word"];

      if saWordStr == "true": 

        saResult = saResult + "" + "True"; i = mWord["end"];


      elif saWordStr == "false": 

        saResult = saResult + "" + "False"; i = mWord["end"];


      elif saWordStr == "null": 

        saResult = saResult + "" + "None"; i = mWord["end"];


      else: 

        saResult = saResult + "" + saWordStr; i = mWord["end"];




    else: 

      saTwo = saExpr[( i):( i)+( 2)];
      saThree = saExpr[( i):( i)+( 3)];

      if saThree == "===": 

        saResult = saResult + "" + "=="; i = i + 3;


      elif saThree == "!==": 

        saResult = saResult + "" + "!="; i = i + 3;


      elif saTwo == "&&": 

        saResult = saResult + "" + "and"; i = i + 2;


      elif saTwo == "||": 

        saResult = saResult + "" + "or"; i = i + 2;


      elif saTwo == "!=": 

        saResult = saResult + "" + "!="; i = i + 2;


      elif saExpr[( i):( i)+( 1)] == "!": 

        saResult = saResult + "" + "not "; i = i + 1;


      else: 

        saResult = saResult + "" + saCh; i = i + 1;






  return saResult;


def saSanitizePythonIdentifiers(saMaskedCode): 

  aPyKeywords = [
  "False", "None", "True", "and", "as", "assert", "async", "await", "break", "class", 
  "continue", "def", "del", "elif", "else", "except", "finally", "for", "from", "global", 
  "if", "import", "in", "is", "lambda", "nonlocal", "not", "or", "pass", "raise", "return",
  "try", "while", "with", "yield"
  ];
  aPyBuiltins = [
  "str", "int", "float", "bool", "list", "dict", "set", "tuple", "type", "id", "len", 
  "map", "filter", "sum", "min", "max", "sorted", "input", "print", "format", "object", 
  "super", "next", "iter", "hash", "range", "repr", "slice", "zip", "vars", "dir", "open", 
  "eval", "exec", "abs", "all", "any", "bin", "chr", "ord", "hex", "oct", "pow", "round", 
  "property", "staticmethod", "classmethod"
  ];

  saResult = "";
  iLen = len(saMaskedCode);
  i = 0;
  while i < iLen: 

    saCh = saMaskedCode[( i):( i)+( 1)];
    if saCh == "$": 

      iJ = i + 1;
      while iJ < iLen and bIsIdentChar(saMaskedCode[( iJ):( iJ)+( 1)]) == True: 

        iJ = iJ + 1;


      saName = saMaskedCode[( i + 1):( i + 1)+( iJ - i - 1)];
      if JSOL.arr_index_of(aPyKeywords,  saName) != -1 or JSOL.arr_index_of(aPyBuiltins,  saName) != -1: 

        saName = saName + "_";


      saResult = saResult + "" + saName;
      i = iJ;


    else: 

      saResult = saResult + "" + saCh;
      i = i + 1;




  return saResult;


