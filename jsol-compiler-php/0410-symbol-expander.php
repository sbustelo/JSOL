<?php
// @JSOL v0.2.97 - AOT Symbol Table Expander (2/2)

$saComp_ExpandSymbols = function($saCode) use (&$bComp_IsWordChar) {
  $saResult = "";
    $iLen = mb_strlen($saCode, "UTF-8");
    $iBraceDepth = 0;
    $mSymTable = JSOL::dict(); 

    $i = 0;
    while ($i < $iLen) {
    $saCh = mb_substr($saCode,  $i,  1, "UTF-8");
        if ($saCh === "{") {
      $iBraceDepth = $iBraceDepth + 1;
            $saResult = $saResult . $saCh;
            $i = $i + 1;
    }
    else if ($saCh === "}") {
      $mSymTable[Cast::toStr($iBraceDepth)] = null;
            $iBraceDepth = $iBraceDepth - 1;
            $saResult = $saResult . $saCh;
            $i = $i + 1;
    }
    else if ($saCh === "$") {
      $iJ = $i + 1;
            while ($iJ < $iLen && $bComp_IsWordChar(mb_substr($saCode,  $iJ,  1, "UTF-8"))) {
        $iJ = $iJ + 1;
      }
      $saVarName = mb_substr($saCode,  $i,  $iJ - $i, "UTF-8");

            if (Str::indexOf($saVarName,  '$_') === 0 || Str::indexOf($saVarName,  '$JSOL_') === 0) {
        $saResult = $saResult . $saVarName;
                $i = $iJ;
                continue;
      }
      $saPrefix = "";
            $iK = 1;
            $iVarLen = mb_strlen($saVarName, "UTF-8");
            while ($iK < $iVarLen) {
        $iCode = mb_ord(mb_substr($saVarName,  $iK, 1, "UTF-8"), "UTF-8");
                if ($iCode >= 97 && $iCode <= 122) {
          $saPrefix = $saPrefix . mb_chr($iCode, "UTF-8");
                    $iK = $iK + 1;
        }
        else {
          break;
        }
      }
      $bIsDeclaration = false;
            $saRoot = "";

            if (mb_strlen($saPrefix, "UTF-8") > 0 && $iVarLen > mb_strlen($saPrefix, "UTF-8") + 1) {
        $saDelim = mb_substr($saVarName,  mb_strlen($saPrefix, "UTF-8") + 1,  1, "UTF-8");
                $iNextCode = mb_ord(mb_substr($saVarName,  mb_strlen($saPrefix, "UTF-8") + 1, 1, "UTF-8"), "UTF-8");
                $bIsUpper = ($iNextCode >= 65 && $iNextCode <= 90);

                if ($saDelim === "_" || $bIsUpper === true) {
          $bIsDeclaration = true;
                    $iOffset = 0;
                    if ($saDelim === "_") {
            $iOffset = 1;
          }
          $saRoot = mb_strtolower(mb_substr($saVarName,  $iK + $iOffset,  $iVarLen, "UTF-8"), "UTF-8");
        }
      }
      if ($bIsDeclaration === true) {
        $saDepthKey = Cast::toStr($iBraceDepth);
                if (isset($mSymTable[ $saDepthKey]) === false || $mSymTable[$saDepthKey] === null) {
          $mSymTable[$saDepthKey] = JSOL::dict();
        }
        $mSymTable[$saDepthKey][$saRoot] = $saVarName;
                $saResult = $saResult . $saVarName;
      }
      else {
        $saQueryRoot = mb_strtolower(mb_substr($saVarName,  1,  $iVarLen - 1, "UTF-8"), "UTF-8");
                $saCanonical = $saVarName;
                
                // CORRECCIÓN: variable de bucle $iD en lugar de la prohibida $d
                for ($iD = $iBraceDepth; $iD >= 0; $iD = $iD - 1) {
          $saDKey = Cast::toStr($iD);
                    if (isset($mSymTable[ $saDKey]) && $mSymTable[$saDKey] !== null && isset($mSymTable[$saDKey][ $saQueryRoot])) {
            $saCanonical = $mSymTable[$saDKey][$saQueryRoot];
                        break;
          }
        }
        $saResult = $saResult . $saCanonical;
      }
      $i = $iJ;
    }
    else {
      $saResult = $saResult . $saCh;
            $i = $i + 1;
    }
  }
  return $saResult;
};
