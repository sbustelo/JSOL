<?php
// @JSOL v0.2.95 - Self-Hosted PHP Target Compiler (Dynamic SSOT Iteration)
$sCompileToPHP = function($sMaskedCode, $sPrefix, $sSuffix, $aRules) use (&$sRegexReplace) {
  $fProcessBlock = function($sCode, $sKeyword, $bUnwrap) {
    $sResult = $sCode;
        $bContinue = true;
        $iOffset = 0;
        while ($bContinue === true) {
      $iSearchLen = mb_strlen($sResult, "UTF-8") - $iOffset;
            if ($iSearchLen <= 0) {
        $bContinue = false;
                continue;
      }
      $sSearchArea = mb_substr($sResult,  $iOffset,  $iSearchLen, "UTF-8");
            $iRelIdx = JSOL::strIndexOf($sSearchArea,  $sKeyword);
            
            if ($iRelIdx === -1) {
        $bContinue = false;
      }
      else {
        $iStartIdx = $iOffset + $iRelIdx;
                $iTailLen = mb_strlen($sResult, "UTF-8") - $iStartIdx;
                $sTail = mb_substr($sResult,  $iStartIdx,  $iTailLen, "UTF-8");
                $iRelOpenBrace = JSOL::strIndexOf($sTail,  "{");
                $iOpenBrace = $iRelOpenBrace === -1 ? -1 : $iStartIdx + $iRelOpenBrace;
                
                if ($iOpenBrace === -1) {
          $bContinue = false;
        }
        else {
          $iBraceCount = 1;
                    $iCloseBrace = -1;
                    $iRLen = mb_strlen($sResult, "UTF-8");
                    for ($i = $iOpenBrace + 1; $i < $iRLen; $i = $i + 1) {
            $sChar = mb_substr($sResult,  $i,  1, "UTF-8");
                        if ($sChar === "{") {
              $iBraceCount = $iBraceCount + 1;
            }
            if ($sChar === "}") {
              $iBraceCount = $iBraceCount - 1;
            }
            if ($iBraceCount === 0) {
              $iCloseBrace = $i;
                            break;
            }
          }
          if ($iCloseBrace === -1) {
            $bContinue = false;
          }
          else {
            $iEndIdx = $iCloseBrace + 1;
                        $bFindingEnd = true;
                        while ($iEndIdx < $iRLen && $bFindingEnd === true) {
              $sChar = mb_substr($sResult,  $iEndIdx,  1, "UTF-8");
                            if ($sChar === " " || $sChar === "\n" || $sChar === "\r" || $sChar === ")" || $sChar === ";") {
                $iEndIdx = $iEndIdx + 1;
              }
              else {
                $bFindingEnd = false;
              }
            }
            $sBefore = mb_substr($sResult,  0,  $iStartIdx, "UTF-8");
                        $iAfterLen = mb_strlen($sResult, "UTF-8") - $iEndIdx;
                        $sAfter = mb_substr($sResult,  $iEndIdx,  $iAfterLen, "UTF-8");
                        
                        if ($bUnwrap === true) {
              $iInnerLen = $iCloseBrace - $iOpenBrace - 1;
                            $sInner = mb_substr($sResult,  $iOpenBrace + 1,  $iInnerLen, "UTF-8");
                            $sResult = $sBefore . "" . $sInner . "" . $sAfter;
                            $iOffset = mb_strlen($sBefore, "UTF-8") + mb_strlen($sInner, "UTF-8");
            }
            else {
              $sResult = $sBefore . "" . $sAfter;
                            $iOffset = mb_strlen($sBefore, "UTF-8");
            }
          }
        }
      }
    }
    return $sResult;
  };
  $fProcessCall = function($sCode, $sKeyword, $sTemplate) {
    $sResult = $sCode;
        $bContinue = true;
        $iOffset = 0;
        while ($bContinue === true) {
      $iSearchLen = mb_strlen($sResult, "UTF-8") - $iOffset;
            if ($iSearchLen <= 0) {
        $bContinue = false;
                continue;
      }
      $sSearchArea = mb_substr($sResult,  $iOffset,  $iSearchLen, "UTF-8");
            $iRelIdx = JSOL::strIndexOf($sSearchArea,  $sKeyword);
            
            if ($iRelIdx === -1) {
        $bContinue = false;
      }
      else {
        $iStartIdx = $iOffset + $iRelIdx;
                $iKwLen = mb_strlen($sKeyword, "UTF-8");
                $iOpenParen = $iStartIdx + $iKwLen - 1;
                $iParenCount = 1;
                $iBracketCount = 0;
                $iBraceCount = 0;
                $bInStr = false;
                $iCloseParen = -1;
                $aArgs = [];
                $iCurrentArgStart = $iOpenParen + 1;
                $iRLen = mb_strlen($sResult, "UTF-8");
                
                for ($i = $iOpenParen + 1; $i < $iRLen; $i = $i + 1) {
          $sChar = mb_substr($sResult,  $i,  1, "UTF-8");
                    $sPrev = mb_substr($sResult,  $i - 1,  1, "UTF-8");
                    
                    if ($sChar === "\"" && $sPrev !== "\\") {
            $bInStr = !$bInStr;
          }
          if ($bInStr === false) {
            if ($sChar === "(") {
              $iParenCount = $iParenCount + 1;
            }
            if ($sChar === ")") {
              $iParenCount = $iParenCount - 1;
            }
            if ($sChar === "[") {
              $iBracketCount = $iBracketCount + 1;
            }
            if ($sChar === "]") {
              $iBracketCount = $iBracketCount - 1;
            }
            if ($sChar === "{") {
              $iBraceCount = $iBraceCount + 1;
            }
            if ($sChar === "}") {
              $iBraceCount = $iBraceCount - 1;
            }
          }
          if ($sChar === "," && $iParenCount === 1 && $iBracketCount === 0 && $iBraceCount === 0 && $bInStr === false) {
            $iArgLen1 = $i - $iCurrentArgStart;
                        $sArgVal1 = mb_substr($sResult,  $iCurrentArgStart,  $iArgLen1, "UTF-8");
                        $aArgs[] =  $sArgVal1;
                        $iCurrentArgStart = $i + 1;
          }
          else if ($iParenCount === 0) {
            $iArgLen2 = $i - $iCurrentArgStart;
                        $sArgVal2 = mb_substr($sResult,  $iCurrentArgStart,  $iArgLen2, "UTF-8");
                        $aArgs[] =  $sArgVal2;
                        $iCloseParen = $i;
                        break;
          }
        }
        if ($iCloseParen === -1) {
          $bContinue = false;
        }
        else {
          $sBefore = mb_substr($sResult,  0,  $iStartIdx, "UTF-8");
                    $iAfterLen = mb_strlen($sResult, "UTF-8") - $iCloseParen - 1;
                    $sAfter = mb_substr($sResult,  $iCloseParen + 1,  $iAfterLen, "UTF-8");
                    
                    $sRep = $sTemplate;
                    if (JSOL::strIndexOf($sTemplate,  "{*}") !== -1) {
            $sRep = str_replace( "{*}",  implode( ", ", $aArgs), $sRep);
          }
          else {
            $iArgsCount = count($aArgs);
                        for ($iK = 0; $iK < $iArgsCount; $iK = $iK + 1) {
              $sPlaceholder = implode("", ["{", $iK, "}"]);
                            $sRep = str_replace( $sPlaceholder,  $aArgs[$iK], $sRep);
            }
          }
          $sResult = $sBefore . "" . $sRep . "" . $sAfter;
                    $iOffset = $iStartIdx;
        }
      }
    }
    return $sResult;
  };
  $sTransformed = $sMaskedCode;
    
    // PHP Target Pre-Processing (Native raw manipulations not mapped in SSOT)
    $aPrefixes = ["\n", "\r\n", "\t", " ", "("];
    for ($iP = 0; $iP < 5; $iP = $iP + 1) {
    $sTransformed = str_replace( $aPrefixes[$iP] . "const ",  $aPrefixes[$iP], $sTransformed);
        $sTransformed = str_replace( $aPrefixes[$iP] . "let ",  $aPrefixes[$iP], $sTransformed);
        $sTransformed = str_replace( $aPrefixes[$iP] . "var ",  $aPrefixes[$iP], $sTransformed);
  }
  if (JSOL::strIndexOf($sTransformed,  "const ") === 0) {
    $sTransformed = mb_substr($sTransformed,  6,  mb_strlen($sTransformed, "UTF-8") - 6, "UTF-8");
  }
  if (JSOL::strIndexOf($sTransformed,  "let ") === 0) {
    $sTransformed = mb_substr($sTransformed,  4,  mb_strlen($sTransformed, "UTF-8") - 4, "UTF-8");
  }
  if (JSOL::strIndexOf($sTransformed,  "var ") === 0) {
    $sTransformed = mb_substr($sTransformed,  4,  mb_strlen($sTransformed, "UTF-8") - 4, "UTF-8");
  }
  // Dynamic SSOT Rules Iterator
    $iRulesCount = count($aRules);
    for ($iR = 0; $iR < $iRulesCount; $iR = $iR + 1) {
    $mRule = $aRules[$iR];
        $sType = $mRule["type"];
        $sId = $mRule["id"];
        $sTemplate = $mRule["template"];

        if ($sType === "block") {
      $sTransformed = $fProcessBlock($sTransformed, $sId, $sTemplate === "unwrap");
    }
    else if ($sType === "regex") {
      $sTransformed = $sRegexReplace($mRule["search"], $sTemplate, $sTransformed, 'g');
    }
    else if ($sType === "replace") {
      $sTransformed = str_replace( $sId,  $sTemplate, $sTransformed);
    }
    else if ($sType === "call") {
      $sTransformed = $fProcessCall($sTransformed, $sId . "(", $sTemplate);
    }
  }
  // PHP Target Post-Processing
    $sTransformed = str_replace( 'JSOL.',  'JSOL::', $sTransformed);

    $sTransformed = $sRegexReplace('(__JSOL_(TOKEN|STR|COM)_[0-9]+__)\\s*\\+', '$1 .', $sTransformed, 'g');
    $sTransformed = $sRegexReplace('\\+\\s*(__JSOL_(TOKEN|STR|COM)_[0-9]+__)', '. $1', $sTransformed, 'g');

    $sTransformed = $sRegexReplace('(\\$s[A-Za-z0-9_]*)\\s*\\+', '$1 .', $sTransformed, 'g');
    $sTransformed = $sRegexReplace('\\+\\s*(\\$s[A-Za-z0-9_]*)', '. $1', $sTransformed, 'g');

// ANTI-SABOTAGE: Post-processor to forcibly inject pass-by-reference (&$)
    // to all variables listed inside a PHP `use (...)` block, allowing
    // closures to see themselves and sibling functions upon instantiation.
    $bFixUse = true;
    $iUseOffset = 0;
    while ($bFixUse === true) {
    $iSearchLen = mb_strlen($sTransformed, "UTF-8") - $iUseOffset;
        if ($iSearchLen <= 0) {
      $bFixUse = false;
            continue;
    }
    $sSearchArea = mb_substr($sTransformed,  $iUseOffset,  $iSearchLen, "UTF-8");
        $iUseRel = JSOL::strIndexOf($sSearchArea,  "use (");
        
        if ($iUseRel === -1) {
      $bFixUse = false;
    }
    else {
      $iStart = $iUseOffset + $iUseRel + 5;
            $iTailLen = mb_strlen($sTransformed, "UTF-8") - $iStart;
            $sTail = mb_substr($sTransformed,  $iStart,  $iTailLen, "UTF-8");
            $iEndRel = JSOL::strIndexOf($sTail,  ")");
            $iEnd = $iStart + $iEndRel;
            
            $sArgs = mb_substr($sTransformed,  $iStart,  $iEnd - $iStart, "UTF-8");
            $sRefArgs = $sRegexReplace("\\$", "&$", $sArgs, "g");
            $sRefArgs = $sRegexReplace("&&\\$", "&$", $sRefArgs, "g"); // Previene duplicar si ya tenía &
            
            $sBefore = mb_substr($sTransformed,  0,  $iStart, "UTF-8");
            $iAfterLen = mb_strlen($sTransformed, "UTF-8") - $iEnd;
            $sAfter = mb_substr($sTransformed,  $iEnd,  $iAfterLen, "UTF-8");
            
            $sTransformed = $sBefore . "" . $sRefArgs . "" . $sAfter;
            $iUseOffset = $iStart + mb_strlen($sRefArgs, "UTF-8") + 1; // Avanza el puntero
    }
  }
  $sFinalOutput = $sPrefix . "" . $sTransformed . "" . $sSuffix;
    if (JSOL::strIndexOf($sFinalOutput,  "<?php") === -1) {
    $sFinalOutput = "<?php\n" . $sFinalOutput;
  }
  return $sFinalOutput;
};
