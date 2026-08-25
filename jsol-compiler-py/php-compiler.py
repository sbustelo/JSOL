import math
from jsol_core import JSOL

# @JSOL v0.2.96 - Self-Hosted PHP Target Compiler (Dynamic SSOT Iteration)
def sCompileToPHP(sMaskedCode, sPrefix, sSuffix, aRules): 

  def fProcessBlock(sCode, sKeyword, bUnwrap): 

    sResult = sCode;
    bContinue = True;
    iOffset = 0;
    while bContinue == True: 

      iSearchLen = len(sResult) - iOffset;
      if iSearchLen <= 0: 

        bContinue = False;
        continue;


      sSearchArea = sResult[( iOffset):( iOffset)+( iSearchLen)];
      iRelIdx = JSOL.str_index_of(sSearchArea,  sKeyword);

      if iRelIdx == -1: 

        bContinue = False;


      else: 

        iStartIdx = iOffset + iRelIdx;
        iTailLen = len(sResult) - iStartIdx;
        sTail = sResult[( iStartIdx):( iStartIdx)+( iTailLen)];
        iRelOpenBrace = JSOL.str_index_of(sTail,  "{");
        iOpenBrace = (-1 if iRelOpenBrace == -1 else iStartIdx + iRelOpenBrace);

        if iOpenBrace == -1: 

          bContinue = False;


        else: 

          iBraceCount = 1;
          iCloseBrace = -1;
          iRLen = len(sResult);
          i = iOpenBrace + 1;
          while i < iRLen: 

            sChar = sResult[( i):( i)+( 1)];
            if sChar == "{": 

              iBraceCount = iBraceCount + 1;


            if sChar == "}": 

              iBraceCount = iBraceCount - 1;


            if iBraceCount == 0: 

              iCloseBrace = i;
              break;


            i = i + 1;


          if iCloseBrace == -1: 

            bContinue = False;


          else: 

            iEndIdx = iCloseBrace + 1;
            bFindingEnd = True;
            while iEndIdx < iRLen and bFindingEnd == True: 

              sChar = sResult[( iEndIdx):( iEndIdx)+( 1)];
              if sChar == " " or sChar == "\n" or sChar == "\r" or sChar == ")" or sChar == ";": 

                iEndIdx = iEndIdx + 1;


              else: 

                bFindingEnd = False;




            sBefore = sResult[( 0):( 0)+( iStartIdx)];
            iAfterLen = len(sResult) - iEndIdx;
            sAfter = sResult[( iEndIdx):( iEndIdx)+( iAfterLen)];

            if bUnwrap == True: 

              iInnerLen = iCloseBrace - iOpenBrace - 1;
              sInner = sResult[( iOpenBrace + 1):( iOpenBrace + 1)+( iInnerLen)];
              sResult = sBefore + "" + sInner + "" + sAfter;
              iOffset = len(sBefore) + len(sInner);


            else: 

              sResult = sBefore + "" + sAfter;
              iOffset = len(sBefore);










    return sResult;


  def fProcessCall(sCode, sKeyword, sTemplate): 

    sResult = sCode;
    bContinue = True;
    iOffset = 0;
    while bContinue == True: 

      iSearchLen = len(sResult) - iOffset;
      if iSearchLen <= 0: 

        bContinue = False;
        continue;


      sSearchArea = sResult[( iOffset):( iOffset)+( iSearchLen)];
      iRelIdx = JSOL.str_index_of(sSearchArea,  sKeyword);

      if iRelIdx == -1: 

        bContinue = False;


      else: 

        iStartIdx = iOffset + iRelIdx;
        iKwLen = len(sKeyword);
        iOpenParen = iStartIdx + iKwLen - 1;
        iParenCount = 1;
        iBracketCount = 0;
        iBraceCount = 0;
        bInStr = False;
        iCloseParen = -1;
        aArgs = [];
        iCurrentArgStart = iOpenParen + 1;
        iRLen = len(sResult);

        i = iOpenParen + 1;
        while i < iRLen: 

          sChar = sResult[( i):( i)+( 1)];
          sPrev = sResult[( i - 1):( i - 1)+( 1)];

          if sChar == "\"" and sPrev != "\\": 

            bInStr = not bInStr;


          if bInStr == False: 

            if sChar == "(": 

              iParenCount = iParenCount + 1;


            if sChar == ")": 

              iParenCount = iParenCount - 1;


            if sChar == "[": 

              iBracketCount = iBracketCount + 1;


            if sChar == "]": 

              iBracketCount = iBracketCount - 1;


            if sChar == "{": 

              iBraceCount = iBraceCount + 1;


            if sChar == "}": 

              iBraceCount = iBraceCount - 1;




          if sChar == "," and iParenCount == 1 and iBracketCount == 0 and iBraceCount == 0 and bInStr == False: 

            iArgLen1 = i - iCurrentArgStart;
            sArgVal1 = sResult[( iCurrentArgStart):( iCurrentArgStart)+( iArgLen1)];
            aArgs.append( sArgVal1);
            iCurrentArgStart = i + 1;


          elif iParenCount == 0: 

            iArgLen2 = i - iCurrentArgStart;
            sArgVal2 = sResult[( iCurrentArgStart):( iCurrentArgStart)+( iArgLen2)];
            aArgs.append( sArgVal2);
            iCloseParen = i;
            break;


          i = i + 1;


        if iCloseParen == -1: 

          bContinue = False;


        else: 

          sBefore = sResult[( 0):( 0)+( iStartIdx)];
          iAfterLen = len(sResult) - iCloseParen - 1;
          sAfter = sResult[( iCloseParen + 1):( iCloseParen + 1)+( iAfterLen)];

          sRep = sTemplate;
          if JSOL.str_index_of(sTemplate,  "{*}") != -1: 

            sRep = sRep.replace( "{*}",   ", ".join(str(_x) for _x in aArgs));


          else: 

            iArgsCount = len(aArgs);
            iK = 0;
            while iK < iArgsCount: 

              sPlaceholder = "".join(JSOL.to_str(_x) for _x in ["{",  iK,  "}"]);
              sRep = sRep.replace( sPlaceholder,  aArgs[iK]);

              iK = iK + 1;




          sResult = sBefore + "" + sRep + "" + sAfter;
          iOffset = iStartIdx;






    return sResult;


  def sExtractPHPUse(sCode): 

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


    def mReadWord(sCodeText, iStart): 

      iLen = len(sCodeText);
      i = iStart;
      while i < iLen and bIsIdentChar(sCodeText[( i):( i)+( 1)]): 

        i = i + 1;


      return JSOL.dict("word",  sCodeText[( iStart):( iStart)+( i - iStart)],  "end",  i);


    sResult = sCode;
    iFunc = len(sResult) - 8;

    while iFunc >= 0: 

      if sResult[( iFunc):( iFunc)+( 8)] == "function": 

        bPrev = iFunc == 0 or not bIsIdentChar(sResult[( iFunc - 1):( iFunc - 1)+( 1)]);
        bNext = iFunc + 8 == len(sResult) or not bIsIdentChar(sResult[( iFunc + 8):( iFunc + 8)+( 1)]);

        if bPrev and bNext: 

          iParenOpen = iFunc + 8;
          while iParenOpen < len(sResult) and sResult[( iParenOpen):( iParenOpen)+( 1)] != "(" and sResult[( iParenOpen):( iParenOpen)+( 1)] != "{": 

            iParenOpen = iParenOpen + 1;


          if iParenOpen < len(sResult) and sResult[( iParenOpen):( iParenOpen)+( 1)] == "(": 

            iParenDepth = 0;
            iParenClose = -1;
            iK = iParenOpen;
            while iK < len(sResult): 

              if sResult[( iK):( iK)+( 1)] == "(": 

                iParenDepth = iParenDepth + 1;


              elif sResult[( iK):( iK)+( 1)] == ")": 

                iParenDepth = iParenDepth - 1;
                if iParenDepth == 0: 

                  iParenClose = iK;
                  break;




              iK = iK + 1;


            if iParenClose != -1: 

              iBraceOpen = iParenClose + 1;
              while iBraceOpen < len(sResult) and sResult[( iBraceOpen):( iBraceOpen)+( 1)] != "{" and sResult[( iBraceOpen):( iBraceOpen)+( 1)] != "(": 

                iBraceOpen = iBraceOpen + 1;


              if iBraceOpen < len(sResult) and sResult[( iBraceOpen):( iBraceOpen)+( 1)] == "{": 

                iBraceDepth = 0;
                iBraceClose = -1;
                iK = iBraceOpen;
                while iK < len(sResult): 

                  if sResult[( iK):( iK)+( 1)] == "{": 

                    iBraceDepth = iBraceDepth + 1;


                  elif sResult[( iK):( iK)+( 1)] == "}": 

                    iBraceDepth = iBraceDepth - 1;
                    if iBraceDepth == 0: 

                      iBraceClose = iK;
                      break;




                  iK = iK + 1;


                if iBraceClose != -1: 

                  sParams = sResult[( iParenOpen + 1):( iParenOpen + 1)+( iParenClose - iParenOpen - 1)];
                  sBody = sResult[( iBraceOpen + 1):( iBraceOpen + 1)+( iBraceClose - iBraceOpen - 1)];

                  if JSOL.str_index_of(sBody,  "JSOL.use") == -1: 

                    aParams = [];
                    aLocals = [];
                    aAllVars = [];

                    iP = 0;
                    while iP < len(sParams): 

                      if sParams[( iP):( iP)+( 1)] == "$": 

                        mWord = mReadWord(sParams, iP);
                        aParams.append( mWord["word"]);
                        iP = mWord["end"];


                      else: 

                        iP = iP + 1;




                    iB = 0;
                    while iB < len(sBody): 

                      if sBody[( iB):( iB)+( 8)] == "function" and not bIsIdentChar(sBody[( iB + 8):( iB + 8)+( 1)]): 

                        iParen = iB + 8;
                        while iParen < len(sBody) and sBody[( iParen):( iParen)+( 1)] != "(": 

                          iParen = iParen + 1;


                        if iParen < len(sBody): 

                          iPDepth = 0;
                          iPClose = -1;
                          iK = iParen;
                          while iK < len(sBody): 

                            if sBody[( iK):( iK)+( 1)] == "(": 

                              iPDepth = iPDepth + 1;


                            elif sBody[( iK):( iK)+( 1)] == ")": 

                              iPDepth = iPDepth - 1;
                              if iPDepth == 0: 

                                iPClose = iK; break;




                            iK = iK + 1;


                          if iPClose != -1: 

                            sInnerParams = sBody[( iParen + 1):( iParen + 1)+( iPClose - iParen - 1)];
                            iIP = 0;
                            while iIP < len(sInnerParams): 

                              if sInnerParams[( iIP):( iIP)+( 1)] == "$": 

                                mWord = mReadWord(sInnerParams, iIP);
                                aLocals.append( mWord["word"]);
                                iIP = mWord["end"];


                              else: 

                                iIP = iIP + 1;








                        iB = iB + 8;
                        continue;


                      bIsDecl = False;
                      iAfterDecl = iB;
                      if sBody[( iB):( iB)+( 6)] == "const ": 

                        bIsDecl = True;
                        iAfterDecl = iB + 6;


                      elif sBody[( iB):( iB)+( 4)] == "let ": 

                        bIsDecl = True;
                        iAfterDecl = iB + 4;


                      if bIsDecl: 

                        while iAfterDecl < len(sBody) and (sBody[( iAfterDecl):( iAfterDecl)+( 1)] == " " or sBody[( iAfterDecl):( iAfterDecl)+( 1)] == "\t" or sBody[( iAfterDecl):( iAfterDecl)+( 1)] == "\n" or sBody[( iAfterDecl):( iAfterDecl)+( 1)] == "\r"): 

                          iAfterDecl = iAfterDecl + 1;


                        if sBody[( iAfterDecl):( iAfterDecl)+( 1)] == "$": 

                          mWord = mReadWord(sBody, iAfterDecl);
                          aLocals.append( mWord["word"]);


                        iB = iAfterDecl;
                        continue;


                      if sBody[( iB):( iB)+( 1)] == "$": 

                        mWord = mReadWord(sBody, iB);
                        if mWord["word"] != '$_': 

                          aAllVars.append( mWord["word"]);


                        iB = mWord["end"];


                      else: 

                        iB = iB + 1;




                    aFree = [];
                    iAllCount = len(aAllVars);
                    iV = 0;
                    while iV < iAllCount: 

                      sVar = aAllVars[iV];
                      if JSOL.arr_index_of(aParams,  sVar) == -1 and JSOL.arr_index_of(aLocals,  sVar) == -1 and JSOL.arr_index_of(aFree,  sVar) == -1: 

                        aFree.append( sVar);


                      iV = iV + 1;


                    if len(aFree) > 0: 

                      aRefFree = [];
                      iFreeCount = len(aFree);
                      iF = 0;
                      while iF < iFreeCount: 

                        aRefFree.append( "&$" + aFree[iF][( 1):( 1)+( len(aFree[iF]) - 1)]);

                        iF = iF + 1;


                      sUseClause = " use (" +  ", ".join(str(_x) for _x in aRefFree) + ")";
                      sBefore = sResult[( 0):( 0)+( iParenClose + 1)];
                      sAfter = sResult[( iParenClose + 1):( iParenClose + 1)+( len(sResult) - (iParenClose + 1))];
                      sResult = sBefore + "" + sUseClause + "" + sAfter;
















      iFunc = iFunc - 1;


    return sResult;


  def fProcessRange(sCode): 

    if JSOL.str_index_of(sCode,  "JSOL.range") == -1: 

      return sCode;


    sResult = sCode;
    bContinue = True;

    while bContinue == True: 

      iRelIdx = JSOL.str_index_of(sResult,  "for");
      if iRelIdx == -1: 

        bContinue = False;


      else: 

        iStartIdx = iRelIdx;
        i = iStartIdx + 3;
        while i < len(sResult) and (sResult[( i):( i)+( 1)] == " " or sResult[( i):( i)+( 1)] == "\n" or sResult[( i):( i)+( 1)] == "\t" or sResult[( i):( i)+( 1)] == "\r" or sResult[( i):( i)+( 1)] == "("): 

          i = i + 1;


        if sResult[( i):( i)+( 4)] == "let ": 

          i = i + 4;


        iV = i;
        if sResult[( iV):( iV)+( 1)] == "$": 

          while iV < len(sResult): 

            sC = sResult[( iV):( iV)+( 1)];
            if sC == "_" or sC == "$" or (sC >= "a" and sC <= "z") or (sC >= "A" and sC <= "Z") or (sC >= "0" and sC <= "9"): 

              iV = iV + 1;


            else: 

              break;




          sVarName = sResult[( i):( i)+( iV - i)];
          i = iV;

          while i < len(sResult) and (sResult[( i):( i)+( 1)] == " " or sResult[( i):( i)+( 1)] == "\n" or sResult[( i):( i)+( 1)] == "\t" or sResult[( i):( i)+( 1)] == "\r"): 

            i = i + 1;


          if sResult[( i):( i)+( 2)] == "of": 

            i = i + 2;
            while i < len(sResult) and (sResult[( i):( i)+( 1)] == " " or sResult[( i):( i)+( 1)] == "\n" or sResult[( i):( i)+( 1)] == "\t" or sResult[( i):( i)+( 1)] == "\r"): 

              i = i + 1;


            if sResult[( i):( i)+( 11)] == "JSOL.range(": 

              i = i + 10;
              iParenDepth = 0;
              iParenClose = -1;
              iK = i;
              while iK < len(sResult): 

                if sResult[( iK):( iK)+( 1)] == "(": 

                  iParenDepth = iParenDepth + 1;


                elif sResult[( iK):( iK)+( 1)] == ")": 

                  iParenDepth = iParenDepth - 1;
                  if iParenDepth == 0: 

                    iParenClose = iK; break;




                iK = iK + 1;


              if iParenClose != -1: 

                sArgs = sResult[( i + 1):( i + 1)+( iParenClose - i - 1)];
                iB = iParenClose + 1;
                while iB < len(sResult) and (sResult[( iB):( iB)+( 1)] == " " or sResult[( iB):( iB)+( 1)] == "\n" or sResult[( iB):( iB)+( 1)] == "\t" or sResult[( iB):( iB)+( 1)] == "\r" or sResult[( iB):( iB)+( 1)] == ")"): 

                  iB = iB + 1;


                if sResult[( iB):( iB)+( 1)] == "{": 

                  iBraceDepth = 0;
                  iBraceClose = -1;
                  iK = iB;
                  while iK < len(sResult): 

                    if sResult[( iK):( iK)+( 1)] == "{": 

                      iBraceDepth = iBraceDepth + 1;


                    elif sResult[( iK):( iK)+( 1)] == "}": 

                      iBraceDepth = iBraceDepth - 1;
                      if iBraceDepth == 0: 

                        iBraceClose = iK; break;




                    iK = iK + 1;


                  if iBraceClose != -1: 

                    sBody = sResult[( iB + 1):( iB + 1)+( iBraceClose - iB - 1)];

                    aArgs = [];
                    iADepth = 0;
                    iAStart = 0;
                    bInStr = False;
                    iK = 0;
                    while iK < len(sArgs): 

                      sC = sArgs[( iK):( iK)+( 1)];
                      if sC == '"': 

                        bInStr = not bInStr;


                      if bInStr == False: 

                        if sC == "(" or sC == "[" or sC == "{": 

                          iADepth = iADepth + 1;


                        if sC == ")" or sC == "]" or sC == "}": 

                          iADepth = iADepth - 1;


                        if sC == "," and iADepth == 0: 

                          aArgs.append( sArgs[( iAStart):( iAStart)+( iK - iAStart)].strip());
                          iAStart = iK + 1;




                      iK = iK + 1;


                    aArgs.append( sArgs[( iAStart):( iAStart)+( len(sArgs) - iAStart)].strip());

                    sCleanVar = sVarName[( 1):( 1)+( len(sVarName) - 1)];
                    sFromVar = '$JSOL_from_' + sCleanVar;
                    sToVar = '$JSOL_to_' + sCleanVar;
                    sStepVar = '$JSOL_step_' + sCleanVar;
                    sIncVar = '$JSOL_inc_' + sCleanVar;
                    sIxVar = '$JSOL_i_' + sCleanVar;

                    sSetup = sFromVar + " = (" + aArgs[0] + ");\n";
                    sSetup = sSetup + sToVar + " = (" + aArgs[1] + ");\n";
                    if len(aArgs) > 2 and len(aArgs[2]) > 0: 

                      sSetup = sSetup + sStepVar + " = (" + aArgs[2] + ");\n";


                    else: 

                      sSetup = sSetup + sStepVar + " = 1;\n";


                    sSetup = sSetup + sIncVar + " = Math.abs(" + sStepVar + ");\n";
                    sSetup = sSetup + "if (" + sFromVar + " > " + sToVar + ") { " + sIncVar + " = -" + sIncVar + "; }\n";
                    sSetup = sSetup + sVarName + " = " + sFromVar + ";\n";
                    sSetup = sSetup + sIxVar + " = 1;\n";

                    sCond = "((" + sIncVar + " > 0 && " + sVarName + " <= " + sToVar + ") || (" + sIncVar + " <= 0 && " + sVarName + " >= " + sToVar + "))";

                    sNewBody = '$JSOL_i = ' + sIxVar + ';\n';
                    sNewBody = sNewBody + sBody + "\n";
                    sNewBody = sNewBody + sVarName + " = " + sVarName + " + " + sIncVar + ";\n";
                    sNewBody = sNewBody + sIxVar + " = " + sIxVar + " + 1;\n";

                    sReplace = "if (true) {\n" + sSetup + "while (" + sCond + ") {\n" + sNewBody + "}\n}";

                    sBefore = sResult[( 0):( 0)+( iStartIdx)];
                    sAfter = sResult[( iBraceClose + 1):( iBraceClose + 1)+( len(sResult) - iBraceClose - 1)];
                    sResult = sBefore + "" + sReplace + "" + sAfter;

                    continue;












        sResult = sResult[( 0):( 0)+( iStartIdx)] + "__JSOL_FOR__" + sResult[( iStartIdx + 3):( iStartIdx + 3)+( len(sResult) - iStartIdx - 3)];




    sResult = sResult.replace( "__JSOL_FOR__",  "for");
    return sResult;


  sTransformed = sMaskedCode;

  # Auto-generate use (...) clauses before native stripping
  sTransformed = sExtractPHPUse(sTransformed);

  # PHP Target Pre-Processing (Native raw manipulations not mapped in SSOT)
  aPrefixes = ["\n", "\r\n", "\t", " ", "("];
  iP = 0;
  while iP < 5: 

    sTransformed = sTransformed.replace( aPrefixes[iP] + "const ",  aPrefixes[iP]);
    sTransformed = sTransformed.replace( aPrefixes[iP] + "let ",  aPrefixes[iP]);
    sTransformed = sTransformed.replace( aPrefixes[iP] + "var ",  aPrefixes[iP]);

    iP = iP + 1;


  if JSOL.str_index_of(sTransformed,  "const ") == 0: 

    sTransformed = sTransformed[( 6):( 6)+( len(sTransformed) - 6)];


  if JSOL.str_index_of(sTransformed,  "let ") == 0: 

    sTransformed = sTransformed[( 4):( 4)+( len(sTransformed) - 4)];


  if JSOL.str_index_of(sTransformed,  "var ") == 0: 

    sTransformed = sTransformed[( 4):( 4)+( len(sTransformed) - 4)];


  # Dynamic SSOT Rules Iterator
  iRulesCount = len(aRules);
  iR = 0;
  while iR < iRulesCount: 

    mRule = aRules[iR];
    sType = mRule["type"];
    sId = mRule["id"];
    sTemplate = mRule["template"];

    if sType == "block": 

      sTransformed = fProcessBlock(sTransformed, sId, sTemplate == "unwrap");


    elif sType == "regex": 

      sTransformed = JSOL.regex_replace(mRule["search"],  sTemplate,  sTransformed,  'g');


    elif sType == "replace": 

      sTransformed = sTransformed.replace( sId,  sTemplate);


    elif sType == "call": 

      sTransformed = fProcessCall(sTransformed, sId + "(", sTemplate);


    elif sType == "range": 

      sTransformed = fProcessRange(sTransformed);


    iR = iR + 1;


  # PHP Target Post-Processing
  sTransformed = sTransformed.replace( 'JSOL.',  'JSOL::');

  sTransformed = JSOL.regex_replace('(__JSOL_(TOKEN|STR|COM)_[0-9]+__)\\s*\\+',  '$1 .',  sTransformed,  'g');
  sTransformed = JSOL.regex_replace('\\+\\s*(__JSOL_(TOKEN|STR|COM)_[0-9]+__)',  '. $1',  sTransformed,  'g');

  sTransformed = JSOL.regex_replace('(\\$s[A-Za-z0-9_]*)\\s*\\+',  '$1 .',  sTransformed,  'g');
  sTransformed = JSOL.regex_replace('\\+\\s*(\\$s[A-Za-z0-9_]*)',  '. $1',  sTransformed,  'g');

  # ANTI-SABOTAGE: Post-processor to forcibly inject pass-by-reference (&$)
  bFixUse = True;
  iUseOffset = 0;
  while bFixUse == True: 

    iSearchLen = len(sTransformed) - iUseOffset;
    if iSearchLen <= 0: 

      bFixUse = False;
      continue;


    sSearchArea = sTransformed[( iUseOffset):( iUseOffset)+( iSearchLen)];
    iUseRel = JSOL.str_index_of(sSearchArea,  "use (");

    if iUseRel == -1: 

      bFixUse = False;


    else: 

      iStart = iUseOffset + iUseRel + 5;
      iTailLen = len(sTransformed) - iStart;
      sTail = sTransformed[( iStart):( iStart)+( iTailLen)];
      iEndRel = JSOL.str_index_of(sTail,  ")");
      iEnd = iStart + iEndRel;

      sArgs = sTransformed[( iStart):( iStart)+( iEnd - iStart)];
      sRefArgs = JSOL.regex_replace("\\$",  "&$",  sArgs,  "g");
      sRefArgs = JSOL.regex_replace("&&\\$",  "&$",  sRefArgs,  "g"); # Previene duplicar si ya tenía &

      sBefore = sTransformed[( 0):( 0)+( iStart)];
      iAfterLen = len(sTransformed) - iEnd;
      sAfter = sTransformed[( iEnd):( iEnd)+( iAfterLen)];

      sTransformed = sBefore + "" + sRefArgs + "" + sAfter;
      iUseOffset = iStart + len(sRefArgs) + 1; # Avanza el puntero




  sFinalOutput = sPrefix + "" + sTransformed + "" + sSuffix;
  if JSOL.str_index_of(sFinalOutput,  "<?php") == -1: 

    sFinalOutput = "<?php\n" + sFinalOutput;


  return sFinalOutput;


