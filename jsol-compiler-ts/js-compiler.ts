declare var JSOL: any;
declare var Rgx: any;

// @JSOL v0.2.96 - JavaScript Target Compiler
// [!] ARCHITECTURE NOTICE: The TypeScript and Python compilers have a strict structural dependency 
// on this JavaScript compiler. TypeScript extends these JS rules, and Python relies on the AST 
// cleanups and ternary transformations defined here. Do NOT decouple without architectural review.

const $sCompileToJS = function($sMaskedCode: any, $sPrefix: any, $sSuffix: any, $aRules: any): string {
  const $fProcessBlock = function ($sCode: any, $sKeyword: any, $bUnwrap: any) {
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
  const $fProcessCall = function ($sCode: any, $sKeyword: any, $sTemplate: any) {
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
	const $fProcessParams = function ($sCode: any) {
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
			const $iRelIdx: number = $sSearchArea.indexOf( "function");

			if ($iRelIdx === -1) {
        $bContinue = false;
      }
      else {
        const $iStartIdx: number = $iOffset + $iRelIdx;
				let $iParenScan: number = $iStartIdx + 8;
				const $iRLen: number = $sResult.length;

				while ($iParenScan < $iRLen && ($sResult.substring( $iParenScan, ( $iParenScan) + ( 1)) === " " || $sResult.substring( $iParenScan, ( $iParenScan) + ( 1)) === "\t" || $sResult.substring( $iParenScan, ( $iParenScan) + ( 1)) === "\n" || $sResult.substring( $iParenScan, ( $iParenScan) + ( 1)) === "\r")) {
          $iParenScan = $iParenScan + 1;
        }
        if ($iParenScan < $iRLen && $sResult.substring( $iParenScan, ( $iParenScan) + ( 1)) === "(") {
          const $iOpenParen: number = $iParenScan;
					let $iParenCount: number = 1;
					let $iCloseParen: number = -1;

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
						$iOffset = $iOpenParen + 1 + $sTypedParams.length + 1;
          }
        }
        else {
          $iOffset = $iStartIdx + 8;
        }
      }
    }
    return $sResult;
  };
  const $fProcessRange = function ($sCode: any) {
    if ($sCode.indexOf( "JSOL.range") === -1) {
      return $sCode;
    }
    let $sResult: string = $sCode;
		let $bContinue: boolean = true;

		while ($bContinue === true) {
      const $iRelIdx: number = $sResult.indexOf( "for");
			if ($iRelIdx === -1) {
        $bContinue = false;
      }
      else {
        const $iStartIdx: number = $iRelIdx;
				let $i: number = $iStartIdx + 3;
				while ($i < $sResult.length && ($sResult.substring( $i, ( $i) + ( 1)) === " " || $sResult.substring( $i, ( $i) + ( 1)) === "\n" || $sResult.substring( $i, ( $i) + ( 1)) === "\t" || $sResult.substring( $i, ( $i) + ( 1)) === "\r" || $sResult.substring( $i, ( $i) + ( 1)) === "(")) {
          $i = $i + 1;
        }
        if ($sResult.substring( $i, ( $i) + ( 4)) === "let ") {
          $i = $i + 4;
        }
        let $iV: number = $i;
				if ($sResult.substring( $iV, ( $iV) + ( 1)) === "$") {
          while ($iV < $sResult.length) {
            const $sC: string = $sResult.substring( $iV, ( $iV) + ( 1));
						if ($sC === "_" || $sC === "$" || ($sC >= "a" && $sC <= "z") || ($sC >= "A" && $sC <= "Z") || ($sC >= "0" && $sC <= "9")) {
              $iV = $iV + 1;
            }
            else {
              break;
            }
          }
          const $sVarName: string = $sResult.substring( $i, ( $i) + ( $iV - $i));
					$i = $iV;

					while ($i < $sResult.length && ($sResult.substring( $i, ( $i) + ( 1)) === " " || $sResult.substring( $i, ( $i) + ( 1)) === "\n" || $sResult.substring( $i, ( $i) + ( 1)) === "\t" || $sResult.substring( $i, ( $i) + ( 1)) === "\r")) {
            $i = $i + 1;
          }
          if ($sResult.substring( $i, ( $i) + ( 2)) === "of") {
            $i = $i + 2;
						while ($i < $sResult.length && ($sResult.substring( $i, ( $i) + ( 1)) === " " || $sResult.substring( $i, ( $i) + ( 1)) === "\n" || $sResult.substring( $i, ( $i) + ( 1)) === "\t" || $sResult.substring( $i, ( $i) + ( 1)) === "\r")) {
              $i = $i + 1;
            }
            if ($sResult.substring( $i, ( $i) + ( 11)) === "JSOL.range(") {
              $i = $i + 10;
							let $iParenDepth: number = 0;
							let $iParenClose: number = -1;
							for (let $iK = $i; $iK < $sResult.length; $iK = $iK + 1) {
                if ($sResult.substring( $iK, ( $iK) + ( 1)) === "(") {
                  $iParenDepth = $iParenDepth + 1;
                }
                else if ($sResult.substring( $iK, ( $iK) + ( 1)) === ")") {
                  $iParenDepth = $iParenDepth - 1;
									if ($iParenDepth === 0) {
                    $iParenClose = $iK; break;
                  }
                }
              }
              if ($iParenClose !== -1) {
                const $sArgs: string = $sResult.substring( $i + 1, ( $i + 1) + ( $iParenClose - $i - 1));
								let $iB: number = $iParenClose + 1;
								while ($iB < $sResult.length && ($sResult.substring( $iB, ( $iB) + ( 1)) === " " || $sResult.substring( $iB, ( $iB) + ( 1)) === "\n" || $sResult.substring( $iB, ( $iB) + ( 1)) === "\t" || $sResult.substring( $iB, ( $iB) + ( 1)) === "\r" || $sResult.substring( $iB, ( $iB) + ( 1)) === ")")) {
                  $iB = $iB + 1;
                }
                if ($sResult.substring( $iB, ( $iB) + ( 1)) === "{") {
                  let $iBraceDepth: number = 0;
									let $iBraceClose: number = -1;
									for (let $iK = $iB; $iK < $sResult.length; $iK = $iK + 1) {
                    if ($sResult.substring( $iK, ( $iK) + ( 1)) === "{") {
                      $iBraceDepth = $iBraceDepth + 1;
                    }
                    else if ($sResult.substring( $iK, ( $iK) + ( 1)) === "}") {
                      $iBraceDepth = $iBraceDepth - 1;
											if ($iBraceDepth === 0) {
                        $iBraceClose = $iK; break;
                      }
                    }
                  }
                  if ($iBraceClose !== -1) {
                    const $sBody: string = $sResult.substring( $iB + 1, ( $iB + 1) + ( $iBraceClose - $iB - 1));

										let $aArgs: any[] = [];
										let $iADepth: number = 0;
										let $iAStart: number = 0;
										let $bInStr: boolean = false;
										for (let $iK = 0; $iK < $sArgs.length; $iK = $iK + 1) {
                      const $sC: string = $sArgs.substring( $iK, ( $iK) + ( 1));
											if ($sC === '"') {
                        $bInStr = !$bInStr;
                      }
                      if ($bInStr === false) {
                        if ($sC === "(" || $sC === "[" || $sC === "{") {
                          $iADepth = $iADepth + 1;
                        }
                        if ($sC === ")" || $sC === "]" || $sC === "}") {
                          $iADepth = $iADepth - 1;
                        }
                        if ($sC === "," && $iADepth === 0) {
                          $aArgs.push( $sArgs.substring( $iAStart, ( $iAStart) + ( $iK - $iAStart)).trim());
													$iAStart = $iK + 1;
                        }
                      }
                    }
                    $aArgs.push( $sArgs.substring( $iAStart, ( $iAStart) + ( $sArgs.length - $iAStart)).trim());

										const $sCleanVar: string = $sVarName.substring( 1, ( 1) + ( $sVarName.length - 1));
										const $sFromVar: string = '$JSOL_from_' + $sCleanVar;
										const $sToVar: string = '$JSOL_to_' + $sCleanVar;
										const $sStepVar: string = '$JSOL_step_' + $sCleanVar;
										const $sIncVar: string = '$JSOL_inc_' + $sCleanVar;
										const $sIxVar: string = '$JSOL_i_' + $sCleanVar;

										let $sSetup: string = "let " + $sFromVar + " = (" + $aArgs[0] + ");\n";
										$sSetup = $sSetup + "let " + $sToVar + " = (" + $aArgs[1] + ");\n";
										if ($aArgs.length > 2 && $aArgs[2].length > 0) {
                      $sSetup = $sSetup + "let " + $sStepVar + " = (" + $aArgs[2] + ");\n";
                    }
                    else {
                      $sSetup = $sSetup + "let " + $sStepVar + " = 1;\n";
                    }
                    $sSetup = $sSetup + "let " + $sIncVar + " = Math.abs(" + $sStepVar + ");\n";
										$sSetup = $sSetup + "if (" + $sFromVar + " > " + $sToVar + ") { " + $sIncVar + " = -" + $sIncVar + "; }\n";
										$sSetup = $sSetup + "let " + $sVarName + " = " + $sFromVar + ";\n";
										$sSetup = $sSetup + "let " + $sIxVar + " = 1;\n";

										const $sCond: string = "((" + $sIncVar + " > 0 && " + $sVarName + " <= " + $sToVar + ") || (" + $sIncVar + " <= 0 && " + $sVarName + " >= " + $sToVar + "))";

										let $sNewBody: string = 'let $JSOL_i = ' + $sIxVar + ';\n';
										$sNewBody = $sNewBody + $sBody + "\n";
										$sNewBody = $sNewBody + $sVarName + " = " + $sVarName + " + " + $sIncVar + ";\n";
										$sNewBody = $sNewBody + $sIxVar + " = " + $sIxVar + " + 1;\n";

										const $sReplace: string = "if (true) {\n" + $sSetup + "while (" + $sCond + ") {\n" + $sNewBody + "}\n}";

										const $sBefore: string = $sResult.substring( 0, ( 0) + ( $iStartIdx));
										const $sAfter: string = $sResult.substring( $iBraceClose + 1, ( $iBraceClose + 1) + ( $sResult.length - $iBraceClose - 1));
										$sResult = $sBefore + "" + $sReplace + "" + $sAfter;

										continue;
                  }
                }
              }
            }
          }
        }
        $sResult = $sResult.substring( 0, ( 0) + ( $iStartIdx)) + "__JSOL_FOR__" + $sResult.substring( $iStartIdx + 3, ( $iStartIdx + 3) + ( $sResult.length - $iStartIdx - 3));
      }
    }
    $sResult = $sResult.split( "__JSOL_FOR__").join( "for");
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
      $sTransformed = Rgx.replace($mRule["search"],  $sTemplate,  $sTransformed,  "g");
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
    else if ($sType === "range") {
      $sTransformed = $fProcessRange($sTransformed);
    }
  }
  const $sFinalOutput: string = $sPrefix + "" + $sTransformed + "" + $sSuffix;
	return $sFinalOutput;
};
