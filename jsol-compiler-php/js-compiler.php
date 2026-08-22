<?php
// @JSOL v0.2.94 - Self-Hosted JS Target Compiler (Dynamic SSOT Iteration)
$sCompileToJS = function($sMaskedCode, $sPrefix, $sSuffix, $aRules) use (&$sRegexReplace) {
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
              $sPlaceholder = implode("", ["{",  $iK,  "}"]);
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
  // NEW (v0.2.95): scans literal "function(" occurrences and appends ": any"
    // to every bare parameter that doesn't already carry a type annotation.
    // JSOL params are always plain identifiers (no destructuring, no defaults),
    // so a top-level comma split is sufficient — no bracket counting needed
    // inside the parameter list itself, only to find where it closes.
    $fProcessParams = function($sCode) {
    $sKeyword = "function(";
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
                $iCloseParen = -1;
                $iRLen = mb_strlen($sResult, "UTF-8");

                for ($i = $iOpenParen + 1; $i < $iRLen; $i = $i + 1) {
          $sChar = mb_substr($sResult,  $i,  1, "UTF-8");
                    if ($sChar === "(") {
            $iParenCount = $iParenCount + 1;
          }
          if ($sChar === ")") {
            $iParenCount = $iParenCount - 1;
          }
          if ($iParenCount === 0) {
            $iCloseParen = $i;
                        break;
          }
        }
        if ($iCloseParen === -1) {
          $bContinue = false;
        }
        else {
          $iRawLen = $iCloseParen - $iOpenParen - 1;
                    $sRawParams = mb_substr($sResult,  $iOpenParen + 1,  $iRawLen, "UTF-8");
                    $sTrimmedParams = trim($sRawParams);

                    $sTypedParams = "";
                    if (mb_strlen($sTrimmedParams, "UTF-8") > 0) {
            $aParts = explode( ",", $sTrimmedParams);
                        $iPartsCount = count($aParts);
                        $aTypedParts = [];
                        for ($iP = 0; $iP < $iPartsCount; $iP = $iP + 1) {
              $sRawPart = trim($aParts[$iP]);
                            $sTypedPart = $sRawPart;
                            if (mb_strlen($sRawPart, "UTF-8") > 0 && JSOL::strIndexOf($sRawPart,  ":") === -1) {
                $sTypedPart = $sRawPart . ": any";
              }
              $aTypedParts[] =  $sTypedPart;
            }
            $sTypedParams = implode( ", ", $aTypedParts);
          }
          $sBefore = mb_substr($sResult,  0,  $iOpenParen + 1, "UTF-8");
                    $iAfterLen = mb_strlen($sResult, "UTF-8") - $iCloseParen;
                    $sAfter = mb_substr($sResult,  $iCloseParen,  $iAfterLen, "UTF-8");

                    $sResult = $sBefore . "" . $sTypedParams . "" . $sAfter;
                    $iOffset = $iStartIdx + $iKwLen + mb_strlen($sTypedParams, "UTF-8");
        }
      }
    }
    return $sResult;
  };
  $sTransformed = $sMaskedCode;

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
      $sTransformed = $sRegexReplace($mRule["search"], $sTemplate, $sTransformed, "g");
    }
    else if ($sType === "replace") {
      $sTransformed = str_replace( $sId,  $sTemplate, $sTransformed);
    }
    else if ($sType === "call") {
      $sTransformed = $fProcessCall($sTransformed, $sId . "(", $sTemplate);
    }
    else if ($sType === "paramtype") {
      $sTransformed = $fProcessParams($sTransformed);
    }
  }
  $sFinalOutput = $sPrefix . "" . $sTransformed . "" . $sSuffix;
    return $sFinalOutput;
};
