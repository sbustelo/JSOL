import math
from jsol_core import JSOL

# @JSOL v0.2.96 - JavaScript Target Compiler
# [!] ARCHITECTURE NOTICE: The TypeScript and Python compilers have a strict structural dependency 
# on this JavaScript compiler. TypeScript extends these JS rules, and Python relies on the AST 
# cleanups and ternary transformations defined here. Do NOT decouple without architectural review.

def sCompileToJS(sMaskedCode, sPrefix, sSuffix, aRules): 

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


  # NEW (v0.2.95): scans literal "function(" occurrences and appends ": any"
  # to every bare parameter that doesn't already carry a type annotation.
  # JSOL params are always plain identifiers (no destructuring, no defaults),
  # so a top-level comma split is sufficient — no bracket counting needed
  # inside the parameter list itself, only to find where it closes.
  def fProcessParams(sCode): 

    sResult = sCode;
    bContinue = True;
    iOffset = 0;
    while bContinue == True: 

      iSearchLen = len(sResult) - iOffset;
      if iSearchLen <= 0: 

        bContinue = False;
        continue;


      sSearchArea = sResult[( iOffset):( iOffset)+( iSearchLen)];
      iRelIdx = JSOL.str_index_of(sSearchArea,  "function");

      if iRelIdx == -1: 

        bContinue = False;


      else: 

        iStartIdx = iOffset + iRelIdx;
        iParenScan = iStartIdx + 8;
        iRLen = len(sResult);

        while iParenScan < iRLen and (sResult[( iParenScan):( iParenScan)+( 1)] == " " or sResult[( iParenScan):( iParenScan)+( 1)] == "\t" or sResult[( iParenScan):( iParenScan)+( 1)] == "\n" or sResult[( iParenScan):( iParenScan)+( 1)] == "\r"): 

          iParenScan = iParenScan + 1;


        if iParenScan < iRLen and sResult[( iParenScan):( iParenScan)+( 1)] == "(": 

          iOpenParen = iParenScan;
          iParenCount = 1;
          iCloseParen = -1;

          i = iOpenParen + 1;
          while i < iRLen: 

            sChar = sResult[( i):( i)+( 1)];
            if sChar == "(": 

              iParenCount = iParenCount + 1;


            if sChar == ")": 

              iParenCount = iParenCount - 1;


            if iParenCount == 0: 

              iCloseParen = i;
              break;


            i = i + 1;


          if iCloseParen == -1: 

            bContinue = False;


          else: 

            iRawLen = iCloseParen - iOpenParen - 1;
            sRawParams = sResult[( iOpenParen + 1):( iOpenParen + 1)+( iRawLen)];
            sTrimmedParams = sRawParams.strip();

            sTypedParams = "";
            if len(sTrimmedParams) > 0: 

              aParts = sTrimmedParams.split( ",");
              iPartsCount = len(aParts);
              aTypedParts = [];
              iP = 0;
              while iP < iPartsCount: 

                sRawPart = aParts[iP].strip();
                sTypedPart = sRawPart;
                if len(sRawPart) > 0 and JSOL.str_index_of(sRawPart,  ":") == -1: 

                  sTypedPart = sRawPart + ": any";


                aTypedParts.append( sTypedPart);

                iP = iP + 1;


              sTypedParams =  ", ".join(str(_x) for _x in aTypedParts);


            sBefore = sResult[( 0):( 0)+( iOpenParen + 1)];
            iAfterLen = len(sResult) - iCloseParen;
            sAfter = sResult[( iCloseParen):( iCloseParen)+( iAfterLen)];

            sResult = sBefore + "" + sTypedParams + "" + sAfter;
            iOffset = iOpenParen + 1 + len(sTypedParams) + 1;




        else: 

          iOffset = iStartIdx + 8;






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

                    sSetup = "let " + sFromVar + " = (" + aArgs[0] + ");\n";
                    sSetup = sSetup + "let " + sToVar + " = (" + aArgs[1] + ");\n";
                    if len(aArgs) > 2 and len(aArgs[2]) > 0: 

                      sSetup = sSetup + "let " + sStepVar + " = (" + aArgs[2] + ");\n";


                    else: 

                      sSetup = sSetup + "let " + sStepVar + " = 1;\n";


                    sSetup = sSetup + "let " + sIncVar + " = Math.abs(" + sStepVar + ");\n";
                    sSetup = sSetup + "if (" + sFromVar + " > " + sToVar + ") { " + sIncVar + " = -" + sIncVar + "; }\n";
                    sSetup = sSetup + "let " + sVarName + " = " + sFromVar + ";\n";
                    sSetup = sSetup + "let " + sIxVar + " = 1;\n";

                    sCond = "((" + sIncVar + " > 0 && " + sVarName + " <= " + sToVar + ") || (" + sIncVar + " <= 0 && " + sVarName + " >= " + sToVar + "))";

                    sNewBody = 'let $JSOL_i = ' + sIxVar + ';\n';
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

      sTransformed = JSOL.regex_replace(mRule["search"],  sTemplate,  sTransformed,  "g");


    elif sType == "replace": 

      sTransformed = sTransformed.replace( sId,  sTemplate);


    elif sType == "call": 

      sTransformed = fProcessCall(sTransformed, sId + "(", sTemplate);


    elif sType == "paramtype": 

      sTransformed = fProcessParams(sTransformed);


    elif sType == "range": 

      sTransformed = fProcessRange(sTransformed);


    iR = iR + 1;


  sFinalOutput = sPrefix + "" + sTransformed + "" + sSuffix;
  return sFinalOutput;


