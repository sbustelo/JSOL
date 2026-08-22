declare var JSOL: any;
declare var Rgx: any;

// @JSOL v0.2.94 - Self-Hosted JS Target Compiler (Dynamic SSOT Iteration)
const $sCompileToJS = function($sMaskedCode: any, $sPrefix: any, $sSuffix: any, $aRules: any): string {
  const $fProcessBlock = function($sCode: any, $sKeyword: any, $bUnwrap: any) {
    let $sResult: string = $sCode;
        let $bContinue: boolean = true;
        let $iOffset: number = 0;
        while ($bContinue === true) {
      const $iSearchLen: number = $sResult.length - $iOffset;
            if ($iSearchLen <= 0) {
        $bContinue = false;
                continue;
      }
      const $sSearchArea: string = $sResult.substring( $iOffset, ( $iOffset) + ( $iSearchLen));
            const $iRelIdx: number = $sSearchArea.indexOf( $sKeyword);
            
            if ($iRelIdx === -1) {
        $bContinue = false;
      }
      else {
        const $iStartIdx: number = $iOffset + $iRelIdx;
                const $iTailLen: number = $sResult.length - $iStartIdx;
                const $sTail: string = $sResult.substring( $iStartIdx, ( $iStartIdx) + ( $iTailLen));
                const $iRelOpenBrace: number = $sTail.indexOf( "{");
                const $iOpenBrace: number = $iRelOpenBrace === -1 ? -1 : $iStartIdx + $iRelOpenBrace;
                
                if ($iOpenBrace === -1) {
          $bContinue = false;
        }
        else {
          let $iBraceCount: number = 1;
                    let $iCloseBrace: number = -1;
                    const $iRLen: number = $sResult.length;
                    for (let $i = $iOpenBrace + 1; $i < $iRLen; $i = $i + 1) {
            const $sChar: string = $sResult.substring( $i, ( $i) + ( 1));
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
            let $iEndIdx: number = $iCloseBrace + 1;
                        let $bFindingEnd: boolean = true;
                        while ($iEndIdx < $iRLen && $bFindingEnd === true) {
              const $sChar: string = $sResult.substring( $iEndIdx, ( $iEndIdx) + ( 1));
                            if ($sChar === " " || $sChar === "\n" || $sChar === "\r" || $sChar === ")" || $sChar === ";") {
                $iEndIdx = $iEndIdx + 1;
              }
              else {
                $bFindingEnd = false;
              }
            }
            const $sBefore: string = $sResult.substring( 0, ( 0) + ( $iStartIdx));
                        const $iAfterLen: number = $sResult.length - $iEndIdx;
                        const $sAfter: string = $sResult.substring( $iEndIdx, ( $iEndIdx) + ( $iAfterLen));
                        
                        if ($bUnwrap === true) {
              const $iInnerLen: number = $iCloseBrace - $iOpenBrace - 1;
                            const $sInner: string = $sResult.substring( $iOpenBrace + 1, ( $iOpenBrace + 1) + ( $iInnerLen));
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
  const $fProcessCall = function($sCode: any, $sKeyword: any, $sTemplate: any) {
    let $sResult: string = $sCode;
        let $bContinue: boolean = true;
        let $iOffset: number = 0;
        while ($bContinue === true) {
      const $iSearchLen: number = $sResult.length - $iOffset;
            if ($iSearchLen <= 0) {
        $bContinue = false;
                continue;
      }
      const $sSearchArea: string = $sResult.substring( $iOffset, ( $iOffset) + ( $iSearchLen));
            const $iRelIdx: number = $sSearchArea.indexOf( $sKeyword);
            
            if ($iRelIdx === -1) {
        $bContinue = false;
      }
      else {
        const $iStartIdx: number = $iOffset + $iRelIdx;
                const $iKwLen: number = $sKeyword.length;
                const $iOpenParen: number = $iStartIdx + $iKwLen - 1;
                let $iParenCount: number = 1;
                let $iBracketCount: number = 0;
                let $iBraceCount: number = 0;
                let $bInStr: boolean = false;
                let $iCloseParen: number = -1;
                let $aArgs: any[] = [];
                let $iCurrentArgStart: number = $iOpenParen + 1;
                const $iRLen: number = $sResult.length;
                
                for (let $i = $iOpenParen + 1; $i < $iRLen; $i = $i + 1) {
          const $sChar: string = $sResult.substring( $i, ( $i) + ( 1));
                    const $sPrev: string = $sResult.substring( $i - 1, ( $i - 1) + ( 1));
                    
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
            const $iArgLen1: number = $i - $iCurrentArgStart;
                        const $sArgVal1: string = $sResult.substring( $iCurrentArgStart, ( $iCurrentArgStart) + ( $iArgLen1));
                        $aArgs.push( $sArgVal1);
                        $iCurrentArgStart = $i + 1;
          }
          else if ($iParenCount === 0) {
            const $iArgLen2: number = $i - $iCurrentArgStart;
                        const $sArgVal2: string = $sResult.substring( $iCurrentArgStart, ( $iCurrentArgStart) + ( $iArgLen2));
                        $aArgs.push( $sArgVal2);
                        $iCloseParen = $i;
                        break;
          }
        }
        if ($iCloseParen === -1) {
          $bContinue = false;
        }
        else {
          const $sBefore: string = $sResult.substring( 0, ( 0) + ( $iStartIdx));
                    const $iAfterLen: number = $sResult.length - $iCloseParen - 1;
                    const $sAfter: string = $sResult.substring( $iCloseParen + 1, ( $iCloseParen + 1) + ( $iAfterLen));
                    
                    let $sRep: string = $sTemplate;
                    if ($sTemplate.indexOf( "{*}") !== -1) {
            $sRep = $sRep.split( "{*}").join( $aArgs.join( ", "));
          }
          else {
            const $iArgsCount: number = $aArgs.length;
for (let $iK = 0; $iK < $iArgsCount; $iK = $iK + 1) {
              const $sPlaceholder: string = ["{",  $iK,  "}"].join("");
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
    const $fProcessParams = function($sCode: any) {
    const $sKeyword: string = "function(";
        let $sResult: string = $sCode;
        let $bContinue: boolean = true;
        let $iOffset: number = 0;
        while ($bContinue === true) {
      const $iSearchLen: number = $sResult.length - $iOffset;
            if ($iSearchLen <= 0) {
        $bContinue = false;
                continue;
      }
      const $sSearchArea: string = $sResult.substring( $iOffset, ( $iOffset) + ( $iSearchLen));
            const $iRelIdx: number = $sSearchArea.indexOf( $sKeyword);

            if ($iRelIdx === -1) {
        $bContinue = false;
      }
      else {
        const $iStartIdx: number = $iOffset + $iRelIdx;
                const $iKwLen: number = $sKeyword.length;
                const $iOpenParen: number = $iStartIdx + $iKwLen - 1;
                let $iParenCount: number = 1;
                let $iCloseParen: number = -1;
                const $iRLen: number = $sResult.length;

                for (let $i = $iOpenParen + 1; $i < $iRLen; $i = $i + 1) {
          const $sChar: string = $sResult.substring( $i, ( $i) + ( 1));
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
          const $iRawLen: number = $iCloseParen - $iOpenParen - 1;
                    const $sRawParams: string = $sResult.substring( $iOpenParen + 1, ( $iOpenParen + 1) + ( $iRawLen));
                    const $sTrimmedParams: string = $sRawParams.trim();

                    let $sTypedParams: string = "";
                    if ($sTrimmedParams.length > 0) {
            const $aParts: any[] = $sTrimmedParams.split( ",");
                        const $iPartsCount: number = $aParts.length;
                        let $aTypedParts: any[] = [];
                        for (let $iP = 0; $iP < $iPartsCount; $iP = $iP + 1) {
              const $sRawPart: string = $aParts[$iP].trim();
                            let $sTypedPart: string = $sRawPart;
                            if ($sRawPart.length > 0 && $sRawPart.indexOf( ":") === -1) {
                $sTypedPart = $sRawPart + ": any";
              }
              $aTypedParts.push( $sTypedPart);
            }
            $sTypedParams = $aTypedParts.join( ", ");
          }
          const $sBefore: string = $sResult.substring( 0, ( 0) + ( $iOpenParen + 1));
                    const $iAfterLen: number = $sResult.length - $iCloseParen;
                    const $sAfter: string = $sResult.substring( $iCloseParen, ( $iCloseParen) + ( $iAfterLen));

                    $sResult = $sBefore + "" + $sTypedParams + "" + $sAfter;
                    $iOffset = $iStartIdx + $iKwLen + $sTypedParams.length;
        }
      }
    }
    return $sResult;
  };
  let $sTransformed: string = $sMaskedCode;

    // Dynamic SSOT Rules Iterator
    const $iRulesCount: number = $aRules.length;
    for (let $iR = 0; $iR < $iRulesCount; $iR = $iR + 1) {
    const $mRule: Record<string, any> = $aRules[$iR];
        const $sType: string = $mRule["type"];
        const $sId: string = $mRule["id"];
        const $sTemplate: string = $mRule["template"];

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
  const $sFinalOutput: string = $sPrefix + "" + $sTransformed + "" + $sSuffix;
    return $sFinalOutput;
};
