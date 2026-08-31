import math
import functools
from jsol_core import JSOL

# @JSOL v0.2.97 - AOT Symbol Table Expander (2/2)

def saComp_ExpandSymbols(saCode): 

  saResult = "";
  iLen = len(saCode);
  iBraceDepth = 0;
  mSymTable = JSOL.dict(); 

  i = 0;
  while i < iLen: 

    saCh = saCode[( i):( i)+( 1)];
    if saCh == "{": 

      iBraceDepth = iBraceDepth + 1;
      saResult = saResult + saCh;
      i = i + 1;


    elif saCh == "}": 

      mSymTable[JSOL.to_str(iBraceDepth)] = None;
      iBraceDepth = iBraceDepth - 1;
      saResult = saResult + saCh;
      i = i + 1;


    elif saCh == "$": 

      iJ = i + 1;
      while iJ < iLen and bComp_IsWordChar(saCode[( iJ):( iJ)+( 1)]): 

        iJ = iJ + 1;


      saVarName = saCode[( i):( i)+( iJ - i)];

      if JSOL.str_index_of(saVarName,  '$_') == 0 or JSOL.str_index_of(saVarName,  '$JSOL_') == 0: 

        saResult = saResult + saVarName;
        i = iJ;
        continue;


      saPrefix = "";
      iK = 1;
      iVarLen = len(saVarName);
      while iK < iVarLen: 

        iCode = ord(saVarName[ iK]);
        if iCode >= 97 and iCode <= 122: 

          saPrefix = saPrefix + chr(iCode);
          iK = iK + 1;


        else: 

          break;




      bIsDeclaration = False;
      saRoot = "";

      if len(saPrefix) > 0 and iVarLen > len(saPrefix) + 1: 

        saDelim = saVarName[( len(saPrefix) + 1):( len(saPrefix) + 1)+( 1)];
        iNextCode = ord(saVarName[ len(saPrefix) + 1]);
        bIsUpper = (iNextCode >= 65 and iNextCode <= 90);

        if saDelim == "_" or bIsUpper == True: 

          bIsDeclaration = True;
          iOffset = 0;
          if saDelim == "_": 

            iOffset = 1;


          saRoot = saVarName[( iK + iOffset):( iK + iOffset)+( iVarLen)].lower();




      if bIsDeclaration == True: 

        saDepthKey = JSOL.to_str(iBraceDepth);
        if ( saDepthKey in mSymTable) == False or mSymTable[saDepthKey] == None: 

          mSymTable[saDepthKey] = JSOL.dict();


        mSymTable[saDepthKey][saRoot] = saVarName;
        saResult = saResult + saVarName;


      else: 

        saQueryRoot = saVarName[( 1):( 1)+( iVarLen - 1)].lower();
        saCanonical = saVarName;

        # CORRECCIÓN: variable de bucle $iD en lugar de la prohibida $d
        iD = iBraceDepth;
        while iD >= 0: 

          saDKey = JSOL.to_str(iD);
          if ( saDKey in mSymTable) and mSymTable[saDKey] != None and ( saQueryRoot in mSymTable[saDKey]): 

            saCanonical = mSymTable[saDKey][saQueryRoot];
            break;


          iD = iD - 1;


        saResult = saResult + saCanonical;


      i = iJ;


    else: 

      saResult = saResult + saCh;
      i = i + 1;




  return saResult;


