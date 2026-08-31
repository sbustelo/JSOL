import math
import functools
from jsol_core import JSOL

# @JSOL v0.2.97 - Self-Hosted Compiler Linter Module (Dynamic SSOT Validation)
def bIsLinterWordChar(saCh): 

  if saCh == "": 

    return False;


  iCode = ord(saCh[ 0]);
  if iCode >= 48 and iCode <= 57: 

    return True;


  if iCode >= 65 and iCode <= 90: 

    return True;


  if iCode >= 97 and iCode <= 122: 

    return True;


  if iCode == 95: 

    return True;


  return False;


def mAuditPragma(saSourceCode): 

  aErrors = [];
  if JSOL.regex_test("^\\s*//\\s*@?JSOL(-[A-Z]+)?\\b",  saSourceCode,  "") == False: 

    aErrors.append( "Fatal: Missing MANDATORY @JSOL pragma on Line 1.");


  return JSOL.dict("valid",  len(aErrors) == 0,  "errors",  aErrors);


def mAuditForbiddenPatterns(saMaskedCode): 

  aErrors = [];
  aWarnings = [];

  aFunctionalMethods = [".map(", ".filter(", ".reduce(", ".forEach(", ".find("];
  iFm = 0;
  while iFm < len(aFunctionalMethods): 

    if JSOL.str_index_of(saMaskedCode,  aFunctionalMethods[iFm]) != -1: 

      aErrors.append( "Linter Error: Native functional array methods (.map, .filter, etc.) are FORBIDDEN. Use Arr.map / Arr.filter or imperative loops.");
      break;


    iFm = iFm + 1;


  iMLen = len(saMaskedCode);
  iP = 0;
  while iP < iMLen: 

    if saMaskedCode[( iP):( iP)+( 7)] == ".length": 

      saNextChar = saMaskedCode[( iP + 7):( iP + 7)+( 1)];
      if bIsLinterWordChar(saNextChar) == False: 

        aErrors.append( "Linter Error: Accessing .length is FORBIDDEN. Use Arr.len() for arrays or Str.len() for strings.");
        break;




    iP = iP + 1;


  if JSOL.str_index_of(saMaskedCode,  "with (") != -1 or JSOL.str_index_of(saMaskedCode,  "with(") != -1: 

    aErrors.append( "Linter Error: The 'with' statement is FORBIDDEN.");


  if JSOL.str_index_of(saMaskedCode,  "JSOL.use(") != -1: 

    aWarnings.append( "Linter Warning: JSOL.use() is DEPRECATED. Auto-use injection handles scope transparency now.");


  if JSOL.regex_test("Arr\\.sort\\s*\\(\\s*[^,)]+\\s*\\)",  saMaskedCode,  ""): 

    aErrors.append( "Linter Error: Arr.sort requires an explicit comparator function as the second argument.");


  if JSOL.regex_test("Arr\\.(map|filter|reduce)\\s*\\(.*=>\\s*\\{",  saMaskedCode,  ""): 

    aErrors.append( "Linter Error: Arr.map/filter/reduce lambdas cannot use multi-line blocks { ... }. Use single-expression lambdas or named functions.");


  if JSOL.str_index_of(saMaskedCode,  "%") != -1: 

    aErrors.append( "Linter Error: The modulo operator '%' is FORBIDDEN. Use Math.modX($a, $b).");


  return JSOL.dict("valid",  len(aErrors) == 0,  "errors",  aErrors,  "warnings",  aWarnings);


def mAuditStrictTyping(saMaskedCode, mSSOT): 

  aErrors = [];
  aWarnings = [];
  iLen = len(saMaskedCode);
  iBraceDepth = 0;
  mDeclaredRootsByDepth = JSOL.dict();

  i = 0;
  while i < iLen: 

    saCh = saMaskedCode[( i):( i)+( 1)];

    if saCh == "{": 

      iBraceDepth = iBraceDepth + 1;


    elif saCh == "}": 

      mDeclaredRootsByDepth[JSOL.to_str(iBraceDepth)] = None;
      iBraceDepth = iBraceDepth - 1;


    elif saCh == "$": 

      iJ = i + 1;
      while iJ < iLen and bIsLinterWordChar(saMaskedCode[( iJ):( iJ)+( 1)]): 

        iJ = iJ + 1;


      saVarName = saMaskedCode[( i):( i)+( iJ - i)];

      if JSOL.str_index_of(saVarName,  '$_') == 0 or JSOL.str_index_of(saVarName,  '$JSOL_') == 0: 

        i = iJ - 1;
        continue;


      saPrefix = "";
      iK = 1;
      iVarLen = len(saVarName);
      while iK < iVarLen: 

        iCode = ord(saVarName[ iK]);
        if iCode >= 97 and iCode <= 122: 

          saPrefix = "".join(JSOL.to_str(_x) for _x in [saPrefix,  chr(iCode)]);
          iK = iK + 1;


        else: 

          break;




      if len(saPrefix) > 0: 

        if iVarLen == len(saPrefix) + 1: 

          i = iJ - 1;
          continue;


        saDelim = saVarName[( len(saPrefix) + 1):( len(saPrefix) + 1)+( 1)];
        iNextCode = ord(saVarName[ len(saPrefix) + 1]);
        bIsUpper = (iNextCode >= 65 and iNextCode <= 90);

        if saDelim != "_" and bIsUpper == False: 

          aErrors.append( "".join(JSOL.to_str(_x) for _x in ["LINTER_PREFIX_DELIMITER_REQUIRED: Variable '",  saVarName,  "' lacks '_' or CamelCase delimiter after prefix '",  saPrefix,  "'."]));


        iOffset = 0;
        if saDelim == "_": 

          iOffset = 1;


        saRoot = saVarName[( iK + iOffset):( iK + iOffset)+( iVarLen)].lower();

        if len(saRoot) > 0: 

          saDepthKey = JSOL.to_str(iBraceDepth);
          if ( saDepthKey in mDeclaredRootsByDepth) == False or mDeclaredRootsByDepth[saDepthKey] == None: 

            mDeclaredRootsByDepth[saDepthKey] = JSOL.dict();


          if ( saRoot in mDeclaredRootsByDepth[saDepthKey]) == True: 

            saExistingType = mDeclaredRootsByDepth[saDepthKey][saRoot];
            if saExistingType != saPrefix: 

              aErrors.append( "".join(JSOL.to_str(_x) for _x in ["Linter Error: Root name collision for '",  saRoot,  "' with different types ('",  saExistingType,  "' vs '",  saPrefix,  "') at scope depth ",  saDepthKey,  "."]));




          else: 

            mDeclaredRootsByDepth[saDepthKey][saRoot] = saPrefix;






      i = iJ - 1;


    i = i + 1;


  return JSOL.dict("valid",  len(aErrors) == 0,  "errors",  aErrors,  "warnings",  aWarnings);


