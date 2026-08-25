// @JSOL v0.2.96 - JavaScript Target Compiler
// [!] ARCHITECTURE NOTICE: The TypeScript and Python compilers have a strict structural dependency 
// on this JavaScript compiler. TypeScript extends these JS rules, and Python relies on the AST 
// cleanups and ternary transformations defined here. Do NOT decouple without architectural review.

const $sCompileToJS = function ($sMaskedCode, $sPrefix, $sSuffix, $aRules) {
  const $fProcessBlock = function ($sCode, $sKeyword, $bUnwrap) {
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
  const $fProcessCall = function ($sCode, $sKeyword, $sTemplate) {
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
              const $sPlaceholder = ["{",  $iK,  "}"].join("");
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
	const $fProcessParams = function ($sCode) {
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
			const $iRelIdx = $sSearchArea.indexOf( "function");

			if ($iRelIdx === -1) {
        $bContinue = false;
      }
      else {
        const $iStartIdx = $iOffset + $iRelIdx;
				let $iParenScan = $iStartIdx + 8;
				const $iRLen = $sResult.length;

				while ($iParenScan < $iRLen && ($sResult.substring( $iParenScan, ( $iParenScan) + ( 1)) === " " || $sResult.substring( $iParenScan, ( $iParenScan) + ( 1)) === "\t" || $sResult.substring( $iParenScan, ( $iParenScan) + ( 1)) === "\n" || $sResult.substring( $iParenScan, ( $iParenScan) + ( 1)) === "\r")) {
          $iParenScan = $iParenScan + 1;
        }
        if ($iParenScan < $iRLen && $sResult.substring( $iParenScan, ( $iParenScan) + ( 1)) === "(") {
          const $iOpenParen = $iParenScan;
					let $iParenCount = 1;
					let $iCloseParen = -1;

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
  const $fProcessRange = function ($sCode) {
    if ($sCode.indexOf( "JSOL.range") === -1) {
      return $sCode;
    }
    let $sResult = $sCode;
		let $bContinue = true;

		while ($bContinue === true) {
      const $iRelIdx = $sResult.indexOf( "for");
			if ($iRelIdx === -1) {
        $bContinue = false;
      }
      else {
        const $iStartIdx = $iRelIdx;
				let $i = $iStartIdx + 3;
				while ($i < $sResult.length && ($sResult.substring( $i, ( $i) + ( 1)) === " " || $sResult.substring( $i, ( $i) + ( 1)) === "\n" || $sResult.substring( $i, ( $i) + ( 1)) === "\t" || $sResult.substring( $i, ( $i) + ( 1)) === "\r" || $sResult.substring( $i, ( $i) + ( 1)) === "(")) {
          $i = $i + 1;
        }
        if ($sResult.substring( $i, ( $i) + ( 4)) === "let ") {
          $i = $i + 4;
        }
        let $iV = $i;
				if ($sResult.substring( $iV, ( $iV) + ( 1)) === "$") {
          while ($iV < $sResult.length) {
            const $sC = $sResult.substring( $iV, ( $iV) + ( 1));
						if ($sC === "_" || $sC === "$" || ($sC >= "a" && $sC <= "z") || ($sC >= "A" && $sC <= "Z") || ($sC >= "0" && $sC <= "9")) {
              $iV = $iV + 1;
            }
            else {
              break;
            }
          }
          const $sVarName = $sResult.substring( $i, ( $i) + ( $iV - $i));
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
							let $iParenDepth = 0;
							let $iParenClose = -1;
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
                const $sArgs = $sResult.substring( $i + 1, ( $i + 1) + ( $iParenClose - $i - 1));
								let $iB = $iParenClose + 1;
								while ($iB < $sResult.length && ($sResult.substring( $iB, ( $iB) + ( 1)) === " " || $sResult.substring( $iB, ( $iB) + ( 1)) === "\n" || $sResult.substring( $iB, ( $iB) + ( 1)) === "\t" || $sResult.substring( $iB, ( $iB) + ( 1)) === "\r" || $sResult.substring( $iB, ( $iB) + ( 1)) === ")")) {
                  $iB = $iB + 1;
                }
                if ($sResult.substring( $iB, ( $iB) + ( 1)) === "{") {
                  let $iBraceDepth = 0;
									let $iBraceClose = -1;
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
                    const $sBody = $sResult.substring( $iB + 1, ( $iB + 1) + ( $iBraceClose - $iB - 1));

										let $aArgs = [];
										let $iADepth = 0;
										let $iAStart = 0;
										let $bInStr = false;
										for (let $iK = 0; $iK < $sArgs.length; $iK = $iK + 1) {
                      const $sC = $sArgs.substring( $iK, ( $iK) + ( 1));
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

										const $sCleanVar = $sVarName.substring( 1, ( 1) + ( $sVarName.length - 1));
										const $sFromVar = '$JSOL_from_' + $sCleanVar;
										const $sToVar = '$JSOL_to_' + $sCleanVar;
										const $sStepVar = '$JSOL_step_' + $sCleanVar;
										const $sIncVar = '$JSOL_inc_' + $sCleanVar;
										const $sIxVar = '$JSOL_i_' + $sCleanVar;

										let $sSetup = "let " + $sFromVar + " = (" + $aArgs[0] + ");\n";
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

										const $sCond = "((" + $sIncVar + " > 0 && " + $sVarName + " <= " + $sToVar + ") || (" + $sIncVar + " <= 0 && " + $sVarName + " >= " + $sToVar + "))";

										let $sNewBody = 'let $JSOL_i = ' + $sIxVar + ';\n';
										$sNewBody = $sNewBody + $sBody + "\n";
										$sNewBody = $sNewBody + $sVarName + " = " + $sVarName + " + " + $sIncVar + ";\n";
										$sNewBody = $sNewBody + $sIxVar + " = " + $sIxVar + " + 1;\n";

										const $sReplace = "if (true) {\n" + $sSetup + "while (" + $sCond + ") {\n" + $sNewBody + "}\n}";

										const $sBefore = $sResult.substring( 0, ( 0) + ( $iStartIdx));
										const $sAfter = $sResult.substring( $iBraceClose + 1, ( $iBraceClose + 1) + ( $sResult.length - $iBraceClose - 1));
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
  const $sFinalOutput = $sPrefix + "" + $sTransformed + "" + $sSuffix;
	return $sFinalOutput;
};
