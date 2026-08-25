import math
from jsol_core import JSOL


# @JSOL v0.2.96 - Python Target Compiler
# [!] ARCHITECTURE NOTICE: This Python target compiler has a direct structural dependency on 
# js-compiler.jsol. It expects the source code to have passed through the JavaScript base 
# transformations (like ternary and brace stripping) before applying Python-specific rules.
#
# Runs on MASKED code, AFTER $sCompileToJS(..., pythonRules) has already
# substituted primitives (Str.*, Arr.*, Map.*, Cast.*), and BEFORE $sIndentCode.
#
# Scope: translates JS-shaped control-flow syntax to Python syntax, but
# DELIBERATELY LEAVES EVERY "{" AND "}" IN PLACE. $sIndentCode depends on
# brace-depth counting to indent correctly; stripping braces here would blind
# it. Braces get removed in a LATER, separate pass, only after indentation is
# already resolved and they're pure noise.
#
# Handled in this pass:
#   - Operators: && -> and, || -> or, ! -> not (word-boundary safe, doesn't
#     touch "!=" or "!==" ), === -> ==, !== -> !=
#   - Keywords: null -> None, true -> True, false -> False (word-boundary safe)
#   - if (cond) {      -> if cond: {
#   - else if (cond) { -> elif cond: {
#   - else {           -> else: {
#   - while (cond) {   -> while cond: {
#   - switch (cond) {  -> converts to while loop with elif chain
#   - for (init; cond; step) { -> converts to while loop mathematically
#
# NOT handled in this pass, on purpose (separate, harder problem):
#   - Ternary (cond ? a : b) -> (a if cond else b)
#
# Usage: standalone first, same discipline as indenter.jsol. Do not wire into
# engine.jsol until validated against real examples.


def aTranslateCommentTokensToPython(aTokens): 

  aResult = [];
  i = 0;
  while i < len(aTokens): 

    mToken = aTokens[i];
    sKey = mToken["key"];
    sVal = mToken["value"];

    if sVal[( 0):( 0)+( 2)] == "//": 

      sRest = sVal[( 2):( 2)+( len(sVal) - 2)];
      aResult.append( JSOL.dict("key",  sKey,  "value",  "#" + "" + sRest));


    elif sVal[( 0):( 0)+( 2)] == "/*": 

      sInner = sVal[( 2):( 2)+( len(sVal) - 2)];
      if sInner[( len(sInner) - 2):( len(sInner) - 2)+( 2)] == "*/": 

        sInner = sInner[( 0):( 0)+( len(sInner) - 2)];


      sConverted = "#" + "" + sInner.replace( "\n",  "\n#");
      aResult.append( JSOL.dict("key",  sKey,  "value",  sConverted));


    else: 

      # Not a comment (starts with a quote char) — a real string
      # literal, leave it byte-for-byte untouched.
      aResult.append( JSOL.dict("key",  sKey,  "value",  sVal));


    i = i + 1;


  return aResult;


def bIsWhitespaceCharTrim(sCh): 

  if sCh == " ": 

    return True;


  if sCh == "\t": 

    return True;


  if sCh == "\n": 

    return True;


  if sCh == "\r": 

    return True;


  return False;


def sTrimWhitespace(sVal): 

  iLen = len(sVal);
  iStart = 0;
  while iStart < iLen and bIsWhitespaceCharTrim(sVal[( iStart):( iStart)+( 1)]) == True: 

    iStart = iStart + 1;


  iEnd = iLen;
  while iEnd > iStart and bIsWhitespaceCharTrim(sVal[( iEnd - 1):( iEnd - 1)+( 1)]) == True: 

    iEnd = iEnd - 1;


  return sVal[( iStart):( iStart)+( iEnd - iStart)];


def bIsIdentChar(sCh): 

  if sCh == "_": 

    return True;


  if sCh == "$": 

    return True;


  if sCh >= "a" and sCh <= "z": 

    return True;


  if sCh >= "A" and sCh <= "Z": 

    return True;


  if sCh >= "0" and sCh <= "9": 

    return True;


  return False;


def mReadWord(sCode, iStart): 

  iLen = len(sCode);
  i = iStart;
  while i < iLen and bIsIdentChar(sCode[( i):( i)+( 1)]) == True: 

    i = i + 1;


  return JSOL.dict("word",  sCode[( iStart):( iStart)+( i - iStart)],  "end",  i);


def iSkipWhitespace(sCode, iStart): 

  iLen = len(sCode);
  i = iStart;
  while i < iLen: 

    sCh = sCode[( i):( i)+( 1)];
    if sCh == " " or sCh == "\t" or sCh == "\n" or sCh == "\r": 

      i = i + 1;


    else: 

      return i;




  return i;


def mReadBalancedParens(sCode, iOpenIndex): 

  iLen = len(sCode);
  iDepth = 0;
  i = iOpenIndex;
  iInsideStart = -1;

  while i < iLen: 

    sCh = sCode[( i):( i)+( 1)];
    if sCh == "(": 

      iDepth = iDepth + 1;
      if iDepth == 1: 

        iInsideStart = i + 1;




    elif sCh == ")": 

      iDepth = iDepth - 1;
      if iDepth == 0: 

        return JSOL.dict(
        "inside",  sCode[( iInsideStart):( iInsideStart)+( i - iInsideStart)], 
        "end",  i + 1
        );




    i = i + 1;


  return JSOL.dict("inside",  "",  "end",  iLen);


def sTranslateOperators(sExpr): 

  sResult = "";
  i = 0;
  iLen = len(sExpr);

  while i < iLen: 

    sCh = sExpr[( i):( i)+( 1)];
    bAtBoundary = (i == 0) or (bIsIdentChar(sExpr[( i - 1):( i - 1)+( 1)]) == False);

    if bAtBoundary == True and bIsIdentChar(sCh) == True: 

      mWord = mReadWord(sExpr, i);
      sWord = mWord["word"];

      if sWord == "true": 

        sResult = sResult + "" + "True";
        i = mWord["end"];


      elif sWord == "false": 

        sResult = sResult + "" + "False";
        i = mWord["end"];


      elif sWord == "null": 

        sResult = sResult + "" + "None";
        i = mWord["end"];


      else: 

        sResult = sResult + "" + sWord;
        i = mWord["end"];




    else: 

      sTwo = sExpr[( i):( i)+( 2)];
      sThree = sExpr[( i):( i)+( 3)];

      if sThree == "===": 

        sResult = sResult + "" + "==";
        i = i + 3;


      elif sThree == "!==": 

        sResult = sResult + "" + "!=";
        i = i + 3;


      elif sTwo == "&&": 

        sResult = sResult + "" + "and";
        i = i + 2;


      elif sTwo == "||": 

        sResult = sResult + "" + "or";
        i = i + 2;


      elif sTwo == "!=": 

        sResult = sResult + "" + "!=";
        i = i + 2;


      elif sExpr[( i):( i)+( 1)] == "!": 

        sResult = sResult + "" + "not ";
        i = i + 1;


      else: 

        sResult = sResult + "" + sCh;
        i = i + 1;






  return sResult;


def mReadBalancedBraces(sCode, iOpenIndex): 

  iLen = len(sCode);
  iDepth = 0;
  i = iOpenIndex;
  iInsideStart = -1;
  while i < iLen: 

    sCh = sCode[( i):( i)+( 1)];
    if sCh == "{": 

      iDepth = iDepth + 1;
      if iDepth == 1: 

        iInsideStart = i + 1;




    elif sCh == "}": 

      iDepth = iDepth - 1;
      if iDepth == 0: 

        return JSOL.dict("inside",  sCode[( iInsideStart):( iInsideStart)+( i - iInsideStart)],  "end",  i + 1);




    i = i + 1;


  return JSOL.dict("inside",  "",  "end",  iLen);


def sConvertControlFlowToPython(sMaskedCode): 

  sResult = "";
  i = 0;
  iLen = len(sMaskedCode);

  while i < iLen: 

    sCh = sMaskedCode[( i):( i)+( 1)];
    bAtBoundary = (i == 0) or (bIsIdentChar(sMaskedCode[( i - 1):( i - 1)+( 1)]) == False);

    if bAtBoundary == True and bIsIdentChar(sCh) == True: 

      mWord = mReadWord(sMaskedCode, i);
      sWord = mWord["word"];

      if sWord == "null": 

        sResult = sResult + "" + "None";
        i = mWord["end"];


      elif sWord == "true": 

        sResult = sResult + "" + "True";
        i = mWord["end"];


      elif sWord == "false": 

        sResult = sResult + "" + "False";
        i = mWord["end"];


      elif sWord == "if": 

        iAfter = iSkipWhitespace(sMaskedCode, mWord["end"]);
        if sMaskedCode[( iAfter):( iAfter)+( 1)] == "(": 

          mParens = mReadBalancedParens(sMaskedCode, iAfter);
          sResult = sResult + "" + "if " + "" + sTranslateOperators(mParens["inside"]) + "" + ":";
          i = mParens["end"];


        else: 

          sResult = sResult + "" + sWord;
          i = mWord["end"];




      elif sWord == "switch": 

        iAfter = iSkipWhitespace(sMaskedCode, mWord["end"]);
        if sMaskedCode[( iAfter):( iAfter)+( 1)] == "(": 

          mParens = mReadBalancedParens(sMaskedCode, iAfter);
          iAfterParens = iSkipWhitespace(sMaskedCode, mParens["end"]);
          if sMaskedCode[( iAfterParens):( iAfterParens)+( 1)] == "{": 

            mBraces = mReadBalancedBraces(sMaskedCode, iAfterParens);
            sBody = sConvertControlFlowToPython(mBraces["inside"]);
            sResult = sResult + "" + "_jsol_switch = " + "" + sTranslateOperators(mParens["inside"]) + "" + "\n_jsol_done = False\nwhile not _jsol_done: {\n_jsol_done = True\nif False: pass" + "" + sBody + "\n}";
            i = mBraces["end"];


          else: 

            sResult = sResult + "" + "_jsol_switch = " + "" + sTranslateOperators(mParens["inside"]) + "" + "\nif True:";
            i = mParens["end"];




        else: 

          sResult = sResult + "" + sWord;
          i = mWord["end"];




      elif sWord == "case": 

        iAfter = iSkipWhitespace(sMaskedCode, mWord["end"]);
        bFoundColon = False;
        iColon = iAfter;
        while iColon < iLen: 

          sChar = sMaskedCode[( iColon):( iColon)+( 1)];
          if sChar == ":": 

            bFoundColon = True;
            break;


          if sChar == ";" or sChar == "{" or sChar == "}": 

            break;


          iColon = iColon + 1;


        if bFoundColon == True: 

          sVal = sMaskedCode[( iAfter):( iAfter)+( iColon - iAfter)];
          sResult = sResult + "" + "\nelif _jsol_switch == " + "" + sTranslateOperators(sTrimWhitespace(sVal)) + "" + ":";
          i = iColon + 1;


        else: 

          sResult = sResult + "" + sWord;
          i = mWord["end"];




      elif sWord == "default": 

        iAfter = iSkipWhitespace(sMaskedCode, mWord["end"]);
        if sMaskedCode[( iAfter):( iAfter)+( 1)] == ":": 

          sResult = sResult + "" + "\nelse:";
          i = iAfter + 1;


        else: 

          sResult = sResult + "" + sWord;
          i = mWord["end"];




      elif sWord == "else": 

        iAfter = iSkipWhitespace(sMaskedCode, mWord["end"]);
        mMaybeIf = mReadWord(sMaskedCode, iAfter);
        if mMaybeIf["word"] == "if": 

          iAfterIf = iSkipWhitespace(sMaskedCode, mMaybeIf["end"]);
          if sMaskedCode[( iAfterIf):( iAfterIf)+( 1)] == "(": 

            mParens = mReadBalancedParens(sMaskedCode, iAfterIf);
            sResult = sResult + "" + "elif " + "" + sTranslateOperators(mParens["inside"]) + "" + ":";
            i = mParens["end"];


          else: 

            sResult = sResult + "" + "else";
            i = mWord["end"];




        elif sMaskedCode[( iAfter):( iAfter)+( 1)] == "{": 

          sResult = sResult + "" + "else:";
          i = mWord["end"];


        else: 

          sResult = sResult + "" + "else";
          i = mWord["end"];




      elif sWord == "while": 

        iAfter = iSkipWhitespace(sMaskedCode, mWord["end"]);
        if sMaskedCode[( iAfter):( iAfter)+( 1)] == "(": 

          mParens = mReadBalancedParens(sMaskedCode, iAfter);
          sResult = sResult + "" + "while " + "" + sTranslateOperators(mParens["inside"]) + "" + ":";
          i = mParens["end"];


        else: 

          sResult = sResult + "" + sWord;
          i = mWord["end"];




      elif sWord == "for": 

        iAfter = iSkipWhitespace(sMaskedCode, mWord["end"]);
        if sMaskedCode[( iAfter):( iAfter)+( 1)] == "(": 

          mParens = mReadBalancedParens(sMaskedCode, iAfter);
          iAfterParens = iSkipWhitespace(sMaskedCode, mParens["end"]);
          if sMaskedCode[( iAfterParens):( iAfterParens)+( 1)] == "{": 

            mBraces = mReadBalancedBraces(sMaskedCode, iAfterParens);

            sInsideParens = mParens["inside"];
            iSemi1 = JSOL.str_index_of(sInsideParens,  ";");
            sTail1 = sInsideParens[( iSemi1 + 1):( iSemi1 + 1)+( len(sInsideParens) - (iSemi1 + 1))];
            iSemi2 = JSOL.str_index_of(sTail1,  ";");
            sTail2 = sTail1[( iSemi2 + 1):( iSemi2 + 1)+( len(sTail1) - (iSemi2 + 1))];

            sInit = sTrimWhitespace(sInsideParens[( 0):( 0)+( iSemi1)]);
            if sInit[( 0):( 0)+( 4)] == "let ": 

              sInit = sInit[( 4):( 4)+( len(sInit) - 4)];


            sCond = sTrimWhitespace(sTail1[( 0):( 0)+( iSemi2)]);
            sStep = sTrimWhitespace(sTail2);

            sBody = sConvertControlFlowToPython(mBraces["inside"]);

            sResult = sResult + "" + sInit + ";\nwhile " + sTranslateOperators(sCond) + ": {" + sBody + "\n" + sStep + ";\n}";
            i = mBraces["end"];


          else: 

            sResult = sResult + "" + sWord;
            i = mWord["end"];




        else: 

          sResult = sResult + "" + sWord;
          i = mWord["end"];




      elif sWord == "const" or sWord == "let": 

        iAfterKw = iSkipWhitespace(sMaskedCode, mWord["end"]);
        mIdent = mReadWord(sMaskedCode, iAfterKw);
        iAfterIdent = iSkipWhitespace(sMaskedCode, mIdent["end"]);

        if sMaskedCode[( iAfterIdent):( iAfterIdent)+( 1)] == "=" and sMaskedCode[( iAfterIdent):( iAfterIdent)+( 2)] != "==": 

          iAfterEq = iSkipWhitespace(sMaskedCode, iAfterIdent + 1);
          mMaybeFunc = mReadWord(sMaskedCode, iAfterEq);

          if mMaybeFunc["word"] == "function": 

            iAfterFuncKw = iSkipWhitespace(sMaskedCode, mMaybeFunc["end"]);
            if sMaskedCode[( iAfterFuncKw):( iAfterFuncKw)+( 1)] == "(": 

              mParams = mReadBalancedParens(sMaskedCode, iAfterFuncKw);
              sResult = sResult + "" + "def " + "" + mIdent["word"] + "" + "(" + "" + mParams["inside"] + "" + "):";
              i = mParams["end"];


            else: 

              sResult = sResult + "" + mIdent["word"] + "" + " = ";
              i = iAfterEq;




          else: 

            sResult = sResult + "" + mIdent["word"] + "" + " = ";
            i = iAfterEq;




        else: 

          sResult = sResult + "" + mIdent["word"];
          i = mIdent["end"];




      else: 

        sResult = sResult + "" + sWord;
        i = mWord["end"];




    elif sCh == "&" and sMaskedCode[( i):( i)+( 2)] == "&&": 

      sResult = sResult + "" + "and";
      i = i + 2;


    elif sCh == "|" and sMaskedCode[( i):( i)+( 2)] == "||": 

      sResult = sResult + "" + "or";
      i = i + 2;


    elif sCh == "=" and sMaskedCode[( i):( i)+( 3)] == "===": 

      sResult = sResult + "" + "==";
      i = i + 3;


    elif sCh == "!" and sMaskedCode[( i):( i)+( 3)] == "!==": 

      sResult = sResult + "" + "!=";
      i = i + 3;


    elif sCh == "!" and sMaskedCode[( i):( i)+( 2)] != "!=": 

      sResult = sResult + "" + "not ";
      i = i + 1;


    else: 

      sResult = sResult + "" + sCh;
      i = i + 1;




  return sResult;


def sSanitizePythonIdentifiers(sMaskedCode): 

  def bIsIdentChar(sCh): 

    if sCh == "_": 

      return True;


    if sCh >= "a" and sCh <= "z": 

      return True;


    if sCh >= "A" and sCh <= "Z": 

      return True;


    if sCh >= "0" and sCh <= "9": 

      return True;


    return False;


  # Python 3 hard keywords. Nunca pueden ser identificadores, sin excepcion.
  aPyKeywords = [
  "False", "None", "True", "and", "as", "assert", "async", "await",
  "break", "class", "continue", "def", "del", "elif", "else", "except",
  "finally", "for", "from", "global", "if", "import", "in", "is",
  "lambda", "nonlocal", "not", "or", "pass", "raise", "return",
  "try", "while", "with", "yield"
  ];

  # Builtins de uso frecuente que un nombre de variable de negocio puede
  # pisar una vez removido el prefijo tipado (ej. $str, $map, $type, $id).
  aPyBuiltins = [
  "str", "int", "float", "bool", "list", "dict", "set", "tuple",
  "type", "id", "len", "map", "filter", "sum", "min", "max",
  "sorted", "input", "print", "format", "object", "super", "next",
  "iter", "hash", "range", "repr", "slice", "zip", "vars", "dir",
  "open", "eval", "exec", "abs", "all", "any", "bin", "chr", "ord",
  "hex", "oct", "pow", "round", "property", "staticmethod", "classmethod"
  ];

  sResult = "";
  iLen = len(sMaskedCode);
  i = 0;
  while i < iLen: 

    sCh = sMaskedCode[( i):( i)+( 1)];
    if sCh == "$": 

      iJ = i + 1;
      while iJ < iLen and bIsIdentChar(sMaskedCode[( iJ):( iJ)+( 1)]) == True: 

        iJ = iJ + 1;


      sName = sMaskedCode[( i + 1):( i + 1)+( iJ - i - 1)];
      if JSOL.arr_index_of(aPyKeywords,  sName) != -1 or JSOL.arr_index_of(aPyBuiltins,  sName) != -1: 

        sName = sName + "_";


      # Estado original puro: NO SE AGREGA EL GUION BAJO
      sResult = sResult + "" + sName;
      i = iJ;


    else: 

      sResult = sResult + "" + sCh;
      i = i + 1;




  return sResult;


