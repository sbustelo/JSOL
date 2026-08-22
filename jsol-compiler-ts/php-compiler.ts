declare var JSOL: any;
declare var Rgx: any;

// @JSOL v0.2.94 - Self-Hosted PHP Target Compiler (Dynamic SSOT Iteration)
const $sCompileToPHP = function($sMaskedCode: any, $sPrefix: any, $sSuffix: any, $aRules: any): string {
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
  let $sTransformed: string = $sMaskedCode;
    
    // PHP Target Pre-Processing (Native raw manipulations not mapped in SSOT)
    const $aPrefixes: any[] = ["\n", "\r\n", "\t", " ", "("];
    for (let $iP = 0; $iP < 5; $iP = $iP + 1) {
    $sTransformed = $sTransformed.split( $aPrefixes[$iP] + "const ").join( $aPrefixes[$iP]);
        $sTransformed = $sTransformed.split( $aPrefixes[$iP] + "let ").join( $aPrefixes[$iP]);
        $sTransformed = $sTransformed.split( $aPrefixes[$iP] + "var ").join( $aPrefixes[$iP]);
  }
  if ($sTransformed.indexOf( "const ") === 0) {
    $sTransformed = $sTransformed.substring( 6, ( 6) + ( $sTransformed.length - 6));
  }
  if ($sTransformed.indexOf( "let ") === 0) {
    $sTransformed = $sTransformed.substring( 4, ( 4) + ( $sTransformed.length - 4));
  }
  if ($sTransformed.indexOf( "var ") === 0) {
    $sTransformed = $sTransformed.substring( 4, ( 4) + ( $sTransformed.length - 4));
  }
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
      $sTransformed = $sRegexReplace($mRule["search"], $sTemplate, $sTransformed, 'g');
    }
    else if ($sType === "replace") {
      $sTransformed = $sTransformed.split( $sId).join( $sTemplate);
    }
    else if ($sType === "call") {
      $sTransformed = $fProcessCall($sTransformed, $sId + "(", $sTemplate);
    }
  }
  // PHP Target Post-Processing
    $sTransformed = $sTransformed.split( 'JSOL.').join( 'JSOL::');

    $sTransformed = $sRegexReplace('(__JSOL_(TOKEN|STR|COM)_[0-9]+__)\\s*\\+', '$1 .', $sTransformed, 'g');
    $sTransformed = $sRegexReplace('\\+\\s*(__JSOL_(TOKEN|STR|COM)_[0-9]+__)', '. $1', $sTransformed, 'g');

    $sTransformed = $sRegexReplace('(\\$s[A-Za-z0-9_]*)\\s*\\+', '$1 .', $sTransformed, 'g');
    $sTransformed = $sRegexReplace('\\+\\s*(\\$s[A-Za-z0-9_]*)', '. $1', $sTransformed, 'g');

// ANTI-SABOTAGE: Post-processor to forcibly inject pass-by-reference (&$)
    // to all variables listed inside a PHP `use (...)` block, allowing
    // closures to see themselves and sibling functions upon instantiation.
    let $bFixUse: boolean = true;
    let $iUseOffset: number = 0;
    while ($bFixUse === true) {
    const $iSearchLen: number = $sTransformed.length - $iUseOffset;
        if ($iSearchLen <= 0) {
      $bFixUse = false;
            continue;
    }
    const $sSearchArea: string = $sTransformed.substring( $iUseOffset, ( $iUseOffset) + ( $iSearchLen));
        const $iUseRel: number = $sSearchArea.indexOf( "use (");
        
        if ($iUseRel === -1) {
      $bFixUse = false;
    }
    else {
      const $iStart: number = $iUseOffset + $iUseRel + 5;
            const $iTailLen: number = $sTransformed.length - $iStart;
            const $sTail: string = $sTransformed.substring( $iStart, ( $iStart) + ( $iTailLen));
            const $iEndRel: number = $sTail.indexOf( ")");
            const $iEnd: number = $iStart + $iEndRel;
            
            const $sArgs: string = $sTransformed.substring( $iStart, ( $iStart) + ( $iEnd - $iStart));
            let $sRefArgs: string = $sRegexReplace("\\$", "&$", $sArgs, "g");
            $sRefArgs = $sRegexReplace("&&\\$", "&$", $sRefArgs, "g"); // Previene duplicar si ya tenía &
            
            const $sBefore: string = $sTransformed.substring( 0, ( 0) + ( $iStart));
            const $iAfterLen: number = $sTransformed.length - $iEnd;
            const $sAfter: string = $sTransformed.substring( $iEnd, ( $iEnd) + ( $iAfterLen));
            
            $sTransformed = $sBefore + "" + $sRefArgs + "" + $sAfter;
            $iUseOffset = $iStart + $sRefArgs.length + 1; // Avanza el puntero
    }
  }
  let $sFinalOutput: string = $sPrefix + "" + $sTransformed + "" + $sSuffix;
    if ($sFinalOutput.indexOf( "<?php") === -1) {
    $sFinalOutput = "<?php\n" + $sFinalOutput;
  }
  return $sFinalOutput;
};
