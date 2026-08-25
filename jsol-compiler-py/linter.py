import math
from jsol_core import JSOL


# @JSOL v0.2.96 - Self-Hosted Compiler Linter Module (Dynamic SSOT Validation)
def bIsLinterWordChar(sCh): 

  if sCh == "": 

    return False;


  iCode = ord(sCh[ 0]);
  if iCode >= 48 and iCode <= 57: 

    return True;


  if iCode >= 65 and iCode <= 90: 

    return True;


  if iCode >= 97 and iCode <= 122: 

    return True;


  if iCode == 95: 

    return True;


  return False;


def mAuditPragma(sSourceCode): 

  aErrors = [];
  bHasPragma = False;

  # Perfil-agnóstico: acepta @JSOL, JSOL, y sufijos de perfil como JSOL-X, JSOL-C, etc.
  # sin requerir cambios en el parser por cada perfil nuevo.
  if JSOL.regex_test("^\\s*//\\s*@?JSOL(-[A-Z]+)?\\b",  sSourceCode,  "") == True: 

    bHasPragma = True;


  if bHasPragma == False: 

    aErrors.append( "Fatal: Missing MANDATORY @JSOL pragma on Line 1.");


  return JSOL.dict("valid",  len(aErrors) == 0,  "errors",  aErrors);


def mAuditForbiddenPatterns(sMaskedCode): 

  aErrors = [];
  aWarnings = [];

  aFunctionalMethods = [".map(", ".filter(", ".reduce(", ".forEach(", ".find("];
  bHasFunctionalMethods = False;
  iFmCount = len(aFunctionalMethods);
  iFm = 0;
  while iFm < iFmCount: 

    if JSOL.str_index_of(sMaskedCode,  aFunctionalMethods[iFm]) != -1: 

      bHasFunctionalMethods = True;


    iFm = iFm + 1;


  if bHasFunctionalMethods == True: 

    aErrors.append( "Linter Error: Functional array methods (.map, .filter, etc.) are FORBIDDEN. Use imperative for/while loops.");


  bHasLengthProperty = False;
  iMLen = len(sMaskedCode);
  iP = 0;
  while iP < iMLen: 

    if sMaskedCode[( iP):( iP)+( 7)] == ".length": 

      sNextChar = sMaskedCode[( iP + 7):( iP + 7)+( 1)];
      if bIsLinterWordChar(sNextChar) == False: 

        bHasLengthProperty = True;
        break;




    iP = iP + 1;


  if bHasLengthProperty == True: 

    aErrors.append( "Linter Error: Accessing .length is FORBIDDEN. Use Arr.count() for arrays or Str.len() for strings.");


  if JSOL.str_index_of(sMaskedCode,  "with (") != -1 or JSOL.str_index_of(sMaskedCode,  "with(") != -1: 

    aErrors.append( "Linter Error: The 'with' statement is FORBIDDEN.");


  if JSOL.str_index_of(sMaskedCode,  "JSOL.use(") != -1: 

    aWarnings.append( "Linter Warning: JSOL.use() is DEPRECATED. Auto-use injection handles scope transparency now.");


  if JSOL.str_index_of(sMaskedCode,  "JSOL.JS") != -1 or JSOL.str_index_of(sMaskedCode,  "JSOL.PHP") != -1 or JSOL.str_index_of(sMaskedCode,  "JSOL.PY") != -1: 

    aWarnings.append( "Linter Warning: Asymmetric target blocks (JSOL.JS/PHP/PY) break isomorphic guarantees. Migrate to pure JSOL or native wrappers.");


  return JSOL.dict("valid",  len(aErrors) == 0,  "errors",  aErrors,  "warnings",  aWarnings);


def mAuditStrictTyping(sMaskedCode, mSSOT): 

  aErrors = [];
  aWarnings = [];
  iLen = len(sMaskedCode);

  iBraceDepth = 0;
  aActiveLoops = [];

  i = 0;
  while i < iLen: 

    sCh = sMaskedCode[( i):( i)+( 1)];

    if sCh == "{": 

      iBraceDepth = iBraceDepth + 1;


    elif sCh == "}": 

      aNewLoops = [];
      iCount = len(aActiveLoops);
      iK = 0;
      while iK < iCount: 

        if aActiveLoops[iK]["depth"] < iBraceDepth: 

          aNewLoops.append( aActiveLoops[iK]);


        iK = iK + 1;


      aActiveLoops = aNewLoops;
      iBraceDepth = iBraceDepth - 1;


    elif sMaskedCode[( i):( i)+( 4)] == "for ": 

      iPeek = i + 4;
      while iPeek < iLen and (sMaskedCode[( iPeek):( iPeek)+( 1)] == " " or sMaskedCode[( iPeek):( iPeek)+( 1)] == "("): 

        iPeek = iPeek + 1;


      if sMaskedCode[( iPeek):( iPeek)+( 4)] == "let ": 

        iPeek = iPeek + 4;
        iV = iPeek;
        while iV < iLen and bIsLinterWordChar(sMaskedCode[( iV):( iV)+( 1)]): 

          iV = iV + 1;


        sVarName = sMaskedCode[( iPeek):( iPeek)+( iV - iPeek)];

        iOf = iV;
        while iOf < iLen and sMaskedCode[( iOf):( iOf)+( 1)] == " ": 

          iOf = iOf + 1;


        if sMaskedCode[( iOf):( iOf)+( 2)] == "of": 

          iR = iOf + 2;
          while iR < iLen and sMaskedCode[( iR):( iR)+( 1)] == " ": 

            iR = iR + 1;


          if sMaskedCode[( iR):( iR)+( 11)] == "JSOL.range(": 

            bShadow = False;
            iK = 0;
            while iK < len(aActiveLoops): 

              if aActiveLoops[iK]["var"] == sVarName: 

                bShadow = True; break;


              iK = iK + 1;


            if bShadow == True: 

              aErrors.append( "Linter Fatal Error: Shadowing of loop variable '" + sVarName + "' is forbidden.");


            aActiveLoops.append( JSOL.dict("var",  sVarName,  "depth",  iBraceDepth + 1));

            iParenDepth = 0;
            iArgsEnd = -1;
            iK = iR + 10;
            while iK < iLen: 

              if sMaskedCode[( iK):( iK)+( 1)] == "(": 

                iParenDepth = iParenDepth + 1;


              elif sMaskedCode[( iK):( iK)+( 1)] == ")": 

                iParenDepth = iParenDepth - 1;
                if iParenDepth == 0: 

                  iArgsEnd = iK; break;




              iK = iK + 1;


            if iArgsEnd != -1: 

              sArgs = sMaskedCode[( iR + 11):( iR + 11)+( iArgsEnd - iR - 11)];
              iCommas = 0;
              iADepth = 0;
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

                    iCommas = iCommas + 1;




                iK = iK + 1;


              if iCommas < 3: 

                aWarnings.append( "Linter Warning: JSOL.range lacks $qMaxTimes argument (4th arg). Recommended for JSOL-X profile.");












    elif sMaskedCode[( i):( i)+( 8)] == "".join(JSOL.to_str(_x) for _x in ["$",  "JSOL_i_"]): 

      iV = i + 8;
      while iV < iLen and bIsLinterWordChar(sMaskedCode[( iV):( iV)+( 1)]): 

        iV = iV + 1;


      sBaseVar = "".join(JSOL.to_str(_x) for _x in ["$",  sMaskedCode[( i + 8):( i + 8)+( iV - i - 8)]]);
      bFound = False;
      iK = 0;
      while iK < len(aActiveLoops): 

        if aActiveLoops[iK]["var"] == sBaseVar: 

          bFound = True; break;


        iK = iK + 1;


      if bFound == False: 

        aErrors.append( "".join(JSOL.to_str(_x) for _x in ["Linter Fatal Error: Invalid reference to '$",  "JSOL_i_",  sMaskedCode[( i + 8):( i + 8)+( iV - i - 8)],  "'. Loop variable '",  sBaseVar,  "' is not active in this scope."]));




    if sCh == "$": 

      iJ = i + 1;
      while iJ < iLen and bIsLinterWordChar(sMaskedCode[( iJ):( iJ)+( 1)]): 

        iJ = iJ + 1;


      sVarName = sMaskedCode[( i):( i)+( iJ - i)];

      if JSOL.str_index_of(sVarName,  "".join(JSOL.to_str(_x) for _x in ["$",  "_"])) == 0 or JSOL.str_index_of(sVarName,  "".join(JSOL.to_str(_x) for _x in ["$",  "JSOL_"])) == 0: 

        iBack = i - 1;
        while iBack >= 0 and (sMaskedCode[( iBack):( iBack)+( 1)] == " " or sMaskedCode[( iBack):( iBack)+( 1)] == "\t" or sMaskedCode[( iBack):( iBack)+( 1)] == "\n" or sMaskedCode[( iBack):( iBack)+( 1)] == "("): 

          iBack = iBack - 1;


        if iBack >= 2 and sMaskedCode[( iBack - 2):( iBack - 2)+( 3)] == "let": 

          aErrors.append( "".join(JSOL.to_str(_x) for _x in ["Linter Error: Variable '",  sVarName,  "' uses reserved internal prefix in declaration."]));


        elif iBack >= 4 and sMaskedCode[( iBack - 4):( iBack - 4)+( 5)] == "const": 

          aErrors.append( "".join(JSOL.to_str(_x) for _x in ["Linter Error: Variable '",  sVarName,  "' uses reserved internal prefix in declaration."]));


        i = iJ - 1;
        continue;


      sPrefix = "";
      iK = 1;
      iVarLen = len(sVarName);
      while iK < iVarLen: 

        iCode = ord(sVarName[ iK]);
        if iCode >= 97 and iCode <= 122: 

          sPrefix = sPrefix + "" + chr(iCode);
          iK = iK + 1;


        else: 

          break;




      if len(sPrefix) == 0: 

        if len(sVarName) > 1: 

          aErrors.append( "Linter Error: Variable '" + sVarName + "' lacks a valid lowercase type prefix.");




      else: 

        bValid = False;
        aTypes = list(mSSOT["types"]["core"].keys());
        iTCount = len(aTypes);

        iT = 0;
        while iT < iTCount: 

          aAliases = mSSOT["types"]["core"][aTypes[iT]];
          if JSOL.arr_index_of(aAliases,  sPrefix) != -1: 

            bValid = True;
            break;


          iT = iT + 1;


        if bValid == False: 

          aReserved = mSSOT["types"]["reserved"];
          if JSOL.arr_index_of(aReserved,  sPrefix) != -1: 

            aErrors.append( "Linter Error: Type prefix '" + sPrefix + "' in variable '" + sVarName + "' is RESERVED and not implemented.");
            bValid = True;




        if bValid == False and ( "custom" in mSSOT["types"]) == True: 

          aCustom = mSSOT["types"]["custom"];
          if JSOL.arr_index_of(aCustom,  sPrefix) != -1: 

            if len(sPrefix) >= 3: 

              bValid = True;


            else: 

              aErrors.append( "Linter Error: Custom type prefix '" + sPrefix + "' in variable '" + sVarName + "' must be 3 or more characters.");
              bValid = True;






        if bValid == False: 

          aErrors.append( "Linter Error: Unknown or unregistered type prefix '" + sPrefix + "' in variable '" + sVarName + "'. No truncation fallback allowed.");




      i = iJ - 1;


    i = i + 1;


  return JSOL.dict("valid",  len(aErrors) == 0,  "errors",  aErrors,  "warnings",  aWarnings);


