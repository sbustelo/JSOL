// @JSOL v0.2.95 - Self-Hosted JS Target Compiler (Dynamic SSOT Iteration)
const $sCompileToJS = function($sMaskedCode, $sPrefix, $sSuffix, $aRules) {
  const $fProcessBlock = function($sCode, $sKeyword, $bUnwrap) {
    let $sResult = $sCode;
        let $bContinue = true;
        let $iOffset = 0;
        while ($bContinue === true) {
      const $iSearchLen = $sResult.length - $iOffset;
            if ($iSearchLen <= 0) {
        $bContinue = false;
                continue;
      }
      const $sSearchArea = $sResult.substring( $iOffset, ( $iOffset) + ( $iSearchLen));
            const $iRelIdx = $sSearchArea.indexOf( $sKeyword);
            
            if ($iRelIdx === -1) {
        $bContinue = false;
      }
      else {
        const $iStartIdx = $iOffset + $iRelIdx;
                const $iTailLen = $sResult.length - $iStartIdx;
                const $sTail = $sResult.substring( $iStartIdx, ( $iStartIdx) + ( $iTailLen));
                const $iRelOpenBrace = $sTail.indexOf( "{");
                const $iOpenBrace = $iRelOpenBrace === -1 ? -1 : $iStartIdx + $iRelOpenBrace;
                
                if ($iOpenBrace === -1) {
          $bContinue = false;
        }
        else {
          let $iBraceCount = 1;
                    let $iCloseBrace = -1;
                    const $iRLen = $sResult.length;
                    for (let $i = $iOpenBrace + 1; $i < $iRLen; $i = $i + 1) {
            const $sChar = $sResult.substring( $i, ( $i) + ( 1));
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
            let $iEndIdx = $iCloseBrace + 1;
                        let $bFindingEnd = true;
                        while ($iEndIdx < $iRLen && $bFindingEnd === true) {
              const $sChar = $sResult.substring( $iEndIdx, ( $iEndIdx) + ( 1));
                            if ($sChar === " " || $sChar === "\n" || $sChar === "\r" || $sChar === ")" || $sChar === ";") {
                $iEndIdx = $iEndIdx + 1;
              }
              else {
                $bFindingEnd = false;
              }
            }
            const $sBefore = $sResult.substring( 0, ( 0) + ( $iStartIdx));
                        const $iAfterLen = $sResult.length - $iEndIdx;
                        const $sAfter = $sResult.substring( $iEndIdx, ( $iEndIdx) + ( $iAfterLen));
                        
                        if ($bUnwrap === true) {
              const $iInnerLen = $iCloseBrace - $iOpenBrace - 1;
                            const $sInner = $sResult.substring( $iOpenBrace + 1, ( $iOpenBrace + 1) + ( $iInnerLen));
                            $sResult = $sBefore + "" + $sInner + "" + $sAfter;
                            $iOffset = $sBefore.length + $sInner.length;
            }
            else {
              $sResult = $sBefore + "" + $sAfter;
                            $iOffset = $sBefore.length;
            }
          }
        }
      }
    }
    return $sResult;
  };
  const $fProcessCall = function($sCode, $sKeyword, $sTemplate) {
    let $sResult = $sCode;
        let $bContinue = true;
        let $iOffset = 0;
        while ($bContinue === true) {
      const $iSearchLen = $sResult.length - $iOffset;
            if ($iSearchLen <= 0) {
        $bContinue = false;
                continue;
      }
      const $sSearchArea = $sResult.substring( $iOffset, ( $iOffset) + ( $iSearchLen));
            const $iRelIdx = $sSearchArea.indexOf( $sKeyword);
            
            if ($iRelIdx === -1) {
        $bContinue = false;
      }
      else {
        const $iStartIdx = $iOffset + $iRelIdx;
                const $iKwLen = $sKeyword.length;
                const $iOpenParen = $iStartIdx + $iKwLen - 1;
                let $iParenCount = 1;
                let $iBracketCount = 0;
                let $iBraceCount = 0;
                let $bInStr = false;
                let $iCloseParen = -1;
                let $aArgs = [];
                let $iCurrentArgStart = $iOpenParen + 1;
                const $iRLen = $sResult.length;
                
                for (let $i = $iOpenParen + 1; $i < $iRLen; $i = $i + 1) {
          const $sChar = $sResult.substring( $i, ( $i) + ( 1));
                    const $sPrev = $sResult.substring( $i - 1, ( $i - 1) + ( 1));
                    
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
            const $iArgLen1 = $i - $iCurrentArgStart;
                        const $sArgVal1 = $sResult.substring( $iCurrentArgStart, ( $iCurrentArgStart) + ( $iArgLen1));
                        $aArgs.push( $sArgVal1);
                        $iCurrentArgStart = $i + 1;
          }
          else if ($iParenCount === 0) {
            const $iArgLen2 = $i - $iCurrentArgStart;
                        const $sArgVal2 = $sResult.substring( $iCurrentArgStart, ( $iCurrentArgStart) + ( $iArgLen2));
                        $aArgs.push( $sArgVal2);
                        $iCloseParen = $i;
                        break;
          }
        }
        if ($iCloseParen === -1) {
          $bContinue = false;
        }
        else {
          const $sBefore = $sResult.substring( 0, ( 0) + ( $iStartIdx));
                    const $iAfterLen = $sResult.length - $iCloseParen - 1;
                    const $sAfter = $sResult.substring( $iCloseParen + 1, ( $iCloseParen + 1) + ( $iAfterLen));
                    
                    let $sRep = $sTemplate;
                    if ($sTemplate.indexOf( "{*}") !== -1) {
            $sRep = $sRep.split( "{*}").join( $aArgs.join( ", "));
          }
          else {
            const $iArgsCount = $aArgs.length;
                        for (let $iK = 0; $iK < $iArgsCount; $iK = $iK + 1) {
              const $sPlaceholder = [ "{", $iK, "}" ].join("");
                            $sRep = $sRep.split( $sPlaceholder).join( $aArgs[$iK]);
            }
          }
          $sResult = $sBefore + "" + $sRep + "" + $sAfter;
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
    const $fProcessParams = function($sCode) {
    const $sKeyword = "function(";
        let $sResult = $sCode;
        let $bContinue = true;
        let $iOffset = 0;
        while ($bContinue === true) {
      const $iSearchLen = $sResult.length - $iOffset;
            if ($iSearchLen <= 0) {
        $bContinue = false;
                continue;
      }
      const $sSearchArea = $sResult.substring( $iOffset, ( $iOffset) + ( $iSearchLen));
            const $iRelIdx = $sSearchArea.indexOf( $sKeyword);

            if ($iRelIdx === -1) {
        $bContinue = false;
      }
      else {
        const $iStartIdx = $iOffset + $iRelIdx;
                const $iKwLen = $sKeyword.length;
                const $iOpenParen = $iStartIdx + $iKwLen - 1;
                let $iParenCount = 1;
                let $iCloseParen = -1;
                const $iRLen = $sResult.length;

                for (let $i = $iOpenParen + 1; $i < $iRLen; $i = $i + 1) {
          const $sChar = $sResult.substring( $i, ( $i) + ( 1));
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
          const $iRawLen = $iCloseParen - $iOpenParen - 1;
                    const $sRawParams = $sResult.substring( $iOpenParen + 1, ( $iOpenParen + 1) + ( $iRawLen));
                    const $sTrimmedParams = $sRawParams.trim();

                    let $sTypedParams = "";
                    if ($sTrimmedParams.length > 0) {
            const $aParts = $sTrimmedParams.split( ",");
                        const $iPartsCount = $aParts.length;
                        let $aTypedParts = [];
                        for (let $iP = 0; $iP < $iPartsCount; $iP = $iP + 1) {
              const $sRawPart = $aParts[$iP].trim();
                            let $sTypedPart = $sRawPart;
                            if ($sRawPart.length > 0 && $sRawPart.indexOf( ":") === -1) {
                $sTypedPart = $sRawPart + ": any";
              }
              $aTypedParts.push( $sTypedPart);
            }
            $sTypedParams = $aTypedParts.join( ", ");
          }
          const $sBefore = $sResult.substring( 0, ( 0) + ( $iOpenParen + 1));
                    const $iAfterLen = $sResult.length - $iCloseParen;
                    const $sAfter = $sResult.substring( $iCloseParen, ( $iCloseParen) + ( $iAfterLen));

                    $sResult = $sBefore + "" + $sTypedParams + "" + $sAfter;
                    $iOffset = $iStartIdx + $iKwLen + $sTypedParams.length;
        }
      }
    }
    return $sResult;
  };
  let $sTransformed = $sMaskedCode;

    // Dynamic SSOT Rules Iterator
    const $iRulesCount = $aRules.length;
    for (let $iR = 0; $iR < $iRulesCount; $iR = $iR + 1) {
    const $mRule = $aRules[$iR];
        const $sType = $mRule["type"];
        const $sId = $mRule["id"];
        const $sTemplate = $mRule["template"];

        if ($sType === "block") {
      $sTransformed = $fProcessBlock($sTransformed, $sId, $sTemplate === "unwrap");
    }
    else if ($sType === "regex") {
      $sTransformed = $sRegexReplace($mRule["search"], $sTemplate, $sTransformed, "g");
    }
    else if ($sType === "replace") {
      $sTransformed = $sTransformed.split( $sId).join( $sTemplate);
    }
    else if ($sType === "call") {
      $sTransformed = $fProcessCall($sTransformed, $sId + "(", $sTemplate);
    }
    else if ($sType === "paramtype") {
      $sTransformed = $fProcessParams($sTransformed);
    }
  }
  const $sFinalOutput = $sPrefix + "" + $sTransformed + "" + $sSuffix;
    return $sFinalOutput;
};
