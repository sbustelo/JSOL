import math
import functools
from jsol_core import JSOL

# @JSOL v0.2.97 - Python Control Flow Converter
def saConvertControlFlowToPython(saMaskedCode): 

  saResult = "";
  i = 0;
  iLen = len(saMaskedCode);

  while i < iLen: 

    saCh = saMaskedCode[( i):( i)+( 1)];
    bAtBoundary = (i == 0) or (bIsIdentChar(saMaskedCode[( i - 1):( i - 1)+( 1)]) == False);

    if bAtBoundary == True and bIsIdentChar(saCh) == True: 

      mWord = mReadWord(saMaskedCode, i);
      saWordStr = mWord["word"];

      if saWordStr == "null": 

        saResult = saResult + "" + "None"; i = mWord["end"];


      elif saWordStr == "true": 

        saResult = saResult + "" + "True"; i = mWord["end"];


      elif saWordStr == "false": 

        saResult = saResult + "" + "False"; i = mWord["end"];


      elif saWordStr == "if": 

        iAfter = iSkipWhitespace(saMaskedCode, mWord["end"]);
        if saMaskedCode[( iAfter):( iAfter)+( 1)] == "(": 

          mParens = mReadBalancedParens(saMaskedCode, iAfter);
          saResult = saResult + "" + "if " + "" + saTranslateOperators(mParens["inside"]) + "" + ":";
          i = mParens["end"];


        else: 

          saResult = saResult + "" + saWordStr; i = mWord["end"];




      elif saWordStr == "switch": 

        iAfter = iSkipWhitespace(saMaskedCode, mWord["end"]);
        if saMaskedCode[( iAfter):( iAfter)+( 1)] == "(": 

          mParens = mReadBalancedParens(saMaskedCode, iAfter);
          iAfterParens = iSkipWhitespace(saMaskedCode, mParens["end"]);
          if saMaskedCode[( iAfterParens):( iAfterParens)+( 1)] == "{": 

            mBraces = mReadBalancedBraces(saMaskedCode, iAfterParens);
            saBody = saConvertControlFlowToPython(mBraces["inside"]);
            saResult = saResult + "" + "_jsol_switch = " + "" + saTranslateOperators(mParens["inside"]) + "" + "\n_jsol_done = False\nwhile not _jsol_done: {\n_jsol_done = True\nif False: pass" + "" + saBody + "\n}";
            i = mBraces["end"];


          else: 

            saResult = saResult + "" + "_jsol_switch = " + "" + saTranslateOperators(mParens["inside"]) + "" + "\nif True:";
            i = mParens["end"];




        else: 

          saResult = saResult + "" + saWordStr; i = mWord["end"];




      elif saWordStr == "case": 

        iAfter = iSkipWhitespace(saMaskedCode, mWord["end"]);
        bFoundColon = False;
        iColon = iAfter;
        while iColon < iLen: 

          saChar = saMaskedCode[( iColon):( iColon)+( 1)];
          if saChar == ":": 

            bFoundColon = True; break;


          if saChar == ";" or saChar == "{" or saChar == "}": 

            break;


          iColon = iColon + 1;


        if bFoundColon == True: 

          saVal = saMaskedCode[( iAfter):( iAfter)+( iColon - iAfter)];
          saResult = saResult + "" + "\nelif _jsol_switch == " + "" + saTranslateOperators(saTrimWhitespace(saVal)) + "" + ":";
          i = iColon + 1;


        else: 

          saResult = saResult + "" + saWordStr; i = mWord["end"];




      elif saWordStr == "default": 

        iAfter = iSkipWhitespace(saMaskedCode, mWord["end"]);
        if saMaskedCode[( iAfter):( iAfter)+( 1)] == ":": 

          saResult = saResult + "" + "\nelse:";
          i = iAfter + 1;


        else: 

          saResult = saResult + "" + saWordStr; i = mWord["end"];




      elif saWordStr == "else": 

        iAfter = iSkipWhitespace(saMaskedCode, mWord["end"]);
        mMaybeIf = mReadWord(saMaskedCode, iAfter);
        if mMaybeIf["word"] == "if": 

          iAfterIf = iSkipWhitespace(saMaskedCode, mMaybeIf["end"]);
          if saMaskedCode[( iAfterIf):( iAfterIf)+( 1)] == "(": 

            mParens = mReadBalancedParens(saMaskedCode, iAfterIf);
            saResult = saResult + "" + "elif " + "" + saTranslateOperators(mParens["inside"]) + "" + ":";
            i = mParens["end"];


          else: 

            saResult = saResult + "" + "else"; i = mWord["end"];




        elif saMaskedCode[( iAfter):( iAfter)+( 1)] == "{": 

          saResult = saResult + "" + "else:"; i = mWord["end"];


        else: 

          saResult = saResult + "" + "else"; i = mWord["end"];




      elif saWordStr == "while": 

        iAfter = iSkipWhitespace(saMaskedCode, mWord["end"]);
        if saMaskedCode[( iAfter):( iAfter)+( 1)] == "(": 

          mParens = mReadBalancedParens(saMaskedCode, iAfter);
          saResult = saResult + "" + "while " + "" + saTranslateOperators(mParens["inside"]) + "" + ":";
          i = mParens["end"];


        else: 

          saResult = saResult + "" + saWordStr; i = mWord["end"];




      elif saWordStr == "for": 

        iAfter = iSkipWhitespace(saMaskedCode, mWord["end"]);
        if saMaskedCode[( iAfter):( iAfter)+( 1)] == "(": 

          mParens = mReadBalancedParens(saMaskedCode, iAfter);
          iAfterParens = iSkipWhitespace(saMaskedCode, mParens["end"]);
          if saMaskedCode[( iAfterParens):( iAfterParens)+( 1)] == "{": 

            mBraces = mReadBalancedBraces(saMaskedCode, iAfterParens);
            saInsideParens = mParens["inside"];
            iSemi1 = JSOL.str_index_of(saInsideParens,  ";");
            saTail1 = saInsideParens[( iSemi1 + 1):( iSemi1 + 1)+( len(saInsideParens) - (iSemi1 + 1))];
            iSemi2 = JSOL.str_index_of(saTail1,  ";");
            saTail2 = saTail1[( iSemi2 + 1):( iSemi2 + 1)+( len(saTail1) - (iSemi2 + 1))];

            saInit = saTrimWhitespace(saInsideParens[( 0):( 0)+( iSemi1)]);
            if saInit[( 0):( 0)+( 4)] == "let ": 

              saInit = saInit[( 4):( 4)+( len(saInit) - 4)];


            saCond = saTrimWhitespace(saTail1[( 0):( 0)+( iSemi2)]);
            saStep = saTrimWhitespace(saTail2);
            saBody = saConvertControlFlowToPython(mBraces["inside"]);

            saResult = saResult + "" + saInit + ";\nwhile " + saTranslateOperators(saCond) + ": {" + saBody + "\n" + saStep + ";\n}";
            i = mBraces["end"];


          else: 

            saResult = saResult + "" + saWordStr; i = mWord["end"];




        else: 

          saResult = saResult + "" + saWordStr; i = mWord["end"];




      elif saWordStr == "const" or saWordStr == "let": 

        iAfterKw = iSkipWhitespace(saMaskedCode, mWord["end"]);
        mIdent = mReadWord(saMaskedCode, iAfterKw);
        iAfterIdent = iSkipWhitespace(saMaskedCode, mIdent["end"]);

        if saMaskedCode[( iAfterIdent):( iAfterIdent)+( 1)] == "=" and saMaskedCode[( iAfterIdent):( iAfterIdent)+( 2)] != "==": 

          iAfterEq = iSkipWhitespace(saMaskedCode, iAfterIdent + 1);
          mMaybeFunc = mReadWord(saMaskedCode, iAfterEq);

          if mMaybeFunc["word"] == "function": 

            iAfterFuncKw = iSkipWhitespace(saMaskedCode, mMaybeFunc["end"]);
            if saMaskedCode[( iAfterFuncKw):( iAfterFuncKw)+( 1)] == "(": 

              mParams = mReadBalancedParens(saMaskedCode, iAfterFuncKw);
              saResult = saResult + "" + "def " + "" + mIdent["word"] + "" + "(" + "" + mParams["inside"] + "" + "):";
              i = mParams["end"];


            else: 

              saResult = saResult + "" + mIdent["word"] + "" + " = "; i = iAfterEq;




          else: 

            saResult = saResult + "" + mIdent["word"] + "" + " = "; i = iAfterEq;




        else: 

          saResult = saResult + "" + mIdent["word"]; i = mIdent["end"];




      else: 

        saResult = saResult + "" + saWordStr;
        i = mWord["end"];




    elif saCh == "&" and saMaskedCode[( i):( i)+( 2)] == "&&": 

      saResult = saResult + "" + "and"; i = i + 2;


    elif saCh == "|" and saMaskedCode[( i):( i)+( 2)] == "||": 

      saResult = saResult + "" + "or"; i = i + 2;


    elif saCh == "=" and saMaskedCode[( i):( i)+( 3)] == "===": 

      saResult = saResult + "" + "=="; i = i + 3;


    elif saCh == "!" and saMaskedCode[( i):( i)+( 3)] == "!==": 

      saResult = saResult + "" + "!="; i = i + 3;


    elif saCh == "!" and saMaskedCode[( i):( i)+( 2)] != "!=": 

      saResult = saResult + "" + "not "; i = i + 1;


    else: 

      saResult = saResult + "" + saCh; i = i + 1;




  return saResult;


