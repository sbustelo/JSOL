// @JSOL v0.2.96 - Self-Hosted PHP Target Compiler (Dynamic SSOT Iteration)
const $sCompileToPHP = function ($sMaskedCode, $sPrefix, $sSuffix, $aRules) {
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
  const $sExtractPHPUse = function ($sCode) {
    const $bIsIdentChar = function ($sCh) {
      if ($sCh === "_") {
        return true;
      }
      if ($sCh === "$") {
        return true;
      }
      if ($sCh >= "a" && $sCh <= "z") {
        return true;
      }
      if ($sCh >= "A" && $sCh <= "Z") {
        return true;
      }
      if ($sCh >= "0" && $sCh <= "9") {
        return true;
      }
      return false;
    };
    const $mReadWord = function ($sCodeText, $iStart) {
      const $iLen = $sCodeText.length;
			let $i = $iStart;
			while ($i < $iLen && $bIsIdentChar($sCodeText.substring( $i, ( $i) + ( 1)))) {
        $i = $i + 1;
      }
      return JSOL.dict("word",  $sCodeText.substring( $iStart, ( $iStart) + ( $i - $iStart)),  "end",  $i);
    };
    let $sResult = $sCode;
		let $iFunc = $sResult.length - 8;

		while ($iFunc >= 0) {
      if ($sResult.substring( $iFunc, ( $iFunc) + ( 8)) === "function") {
        const $bPrev = $iFunc === 0 || !$bIsIdentChar($sResult.substring( $iFunc - 1, ( $iFunc - 1) + ( 1)));
				const $bNext = $iFunc + 8 === $sResult.length || !$bIsIdentChar($sResult.substring( $iFunc + 8, ( $iFunc + 8) + ( 1)));

				if ($bPrev && $bNext) {
          let $iParenOpen = $iFunc + 8;
					while ($iParenOpen < $sResult.length && $sResult.substring( $iParenOpen, ( $iParenOpen) + ( 1)) !== "(" && $sResult.substring( $iParenOpen, ( $iParenOpen) + ( 1)) !== "{") {
            $iParenOpen = $iParenOpen + 1;
          }
          if ($iParenOpen < $sResult.length && $sResult.substring( $iParenOpen, ( $iParenOpen) + ( 1)) === "(") {
            let $iParenDepth = 0;
						let $iParenClose = -1;
						for (let $iK = $iParenOpen; $iK < $sResult.length; $iK = $iK + 1) {
              if ($sResult.substring( $iK, ( $iK) + ( 1)) === "(") {
                $iParenDepth = $iParenDepth + 1;
              }
              else if ($sResult.substring( $iK, ( $iK) + ( 1)) === ")") {
                $iParenDepth = $iParenDepth - 1;
								if ($iParenDepth === 0) {
                  $iParenClose = $iK;
									break;
                }
              }
            }
            if ($iParenClose !== -1) {
              let $iBraceOpen = $iParenClose + 1;
							while ($iBraceOpen < $sResult.length && $sResult.substring( $iBraceOpen, ( $iBraceOpen) + ( 1)) !== "{" && $sResult.substring( $iBraceOpen, ( $iBraceOpen) + ( 1)) !== "(") {
                $iBraceOpen = $iBraceOpen + 1;
              }
              if ($iBraceOpen < $sResult.length && $sResult.substring( $iBraceOpen, ( $iBraceOpen) + ( 1)) === "{") {
                let $iBraceDepth = 0;
								let $iBraceClose = -1;
								for (let $iK = $iBraceOpen; $iK < $sResult.length; $iK = $iK + 1) {
                  if ($sResult.substring( $iK, ( $iK) + ( 1)) === "{") {
                    $iBraceDepth = $iBraceDepth + 1;
                  }
                  else if ($sResult.substring( $iK, ( $iK) + ( 1)) === "}") {
                    $iBraceDepth = $iBraceDepth - 1;
										if ($iBraceDepth === 0) {
                      $iBraceClose = $iK;
											break;
                    }
                  }
                }
                if ($iBraceClose !== -1) {
                  const $sParams = $sResult.substring( $iParenOpen + 1, ( $iParenOpen + 1) + ( $iParenClose - $iParenOpen - 1));
									const $sBody = $sResult.substring( $iBraceOpen + 1, ( $iBraceOpen + 1) + ( $iBraceClose - $iBraceOpen - 1));

									if ($sBody.indexOf( "JSOL.use") === -1) {
                    let $aParams = [];
										let $aLocals = [];
										let $aAllVars = [];

										let $iP = 0;
										while ($iP < $sParams.length) {
                      if ($sParams.substring( $iP, ( $iP) + ( 1)) === "$") {
                        const $mWord = $mReadWord($sParams, $iP);
												$aParams.push( $mWord["word"]);
												$iP = $mWord["end"];
                      }
                      else {
                        $iP = $iP + 1;
                      }
                    }
                    let $iB = 0;
										while ($iB < $sBody.length) {
                      if ($sBody.substring( $iB, ( $iB) + ( 8)) === "function" && !$bIsIdentChar($sBody.substring( $iB + 8, ( $iB + 8) + ( 1)))) {
                        let $iParen = $iB + 8;
												while ($iParen < $sBody.length && $sBody.substring( $iParen, ( $iParen) + ( 1)) !== "(") {
                          $iParen = $iParen + 1;
                        }
                        if ($iParen < $sBody.length) {
                          let $iPDepth = 0;
													let $iPClose = -1;
													for (let $iK = $iParen; $iK < $sBody.length; $iK = $iK + 1) {
                            if ($sBody.substring( $iK, ( $iK) + ( 1)) === "(") {
                              $iPDepth = $iPDepth + 1;
                            }
                            else if ($sBody.substring( $iK, ( $iK) + ( 1)) === ")") {
                              $iPDepth = $iPDepth - 1;
															if ($iPDepth === 0) {
                                $iPClose = $iK; break;
                              }
                            }
                          }
                          if ($iPClose !== -1) {
                            const $sInnerParams = $sBody.substring( $iParen + 1, ( $iParen + 1) + ( $iPClose - $iParen - 1));
														let $iIP = 0;
														while ($iIP < $sInnerParams.length) {
                              if ($sInnerParams.substring( $iIP, ( $iIP) + ( 1)) === "$") {
                                const $mWord = $mReadWord($sInnerParams, $iIP);
																$aLocals.push( $mWord["word"]);
																$iIP = $mWord["end"];
                              }
                              else {
                                $iIP = $iIP + 1;
                              }
                            }
                          }
                        }
                        $iB = $iB + 8;
												continue;
                      }
                      let $bIsDecl = false;
											let $iAfterDecl = $iB;
											if ($sBody.substring( $iB, ( $iB) + ( 6)) === "const ") {
                        $bIsDecl = true;
												$iAfterDecl = $iB + 6;
                      }
                      else if ($sBody.substring( $iB, ( $iB) + ( 4)) === "let ") {
                        $bIsDecl = true;
												$iAfterDecl = $iB + 4;
                      }
                      if ($bIsDecl) {
                        while ($iAfterDecl < $sBody.length && ($sBody.substring( $iAfterDecl, ( $iAfterDecl) + ( 1)) === " " || $sBody.substring( $iAfterDecl, ( $iAfterDecl) + ( 1)) === "\t" || $sBody.substring( $iAfterDecl, ( $iAfterDecl) + ( 1)) === "\n" || $sBody.substring( $iAfterDecl, ( $iAfterDecl) + ( 1)) === "\r")) {
                          $iAfterDecl = $iAfterDecl + 1;
                        }
                        if ($sBody.substring( $iAfterDecl, ( $iAfterDecl) + ( 1)) === "$") {
                          const $mWord = $mReadWord($sBody, $iAfterDecl);
													$aLocals.push( $mWord["word"]);
                        }
                        $iB = $iAfterDecl;
												continue;
                      }
                      if ($sBody.substring( $iB, ( $iB) + ( 1)) === "$") {
                        const $mWord = $mReadWord($sBody, $iB);
												if ($mWord["word"] !== '$_') {
                          $aAllVars.push( $mWord["word"]);
                        }
                        $iB = $mWord["end"];
                      }
                      else {
                        $iB = $iB + 1;
                      }
                    }
                    let $aFree = [];
										const $iAllCount = $aAllVars.length;
										for (let $iV = 0; $iV < $iAllCount; $iV = $iV + 1) {
                      const $sVar = $aAllVars[$iV];
											if ($aParams.indexOf( $sVar) === -1 && $aLocals.indexOf( $sVar) === -1 && $aFree.indexOf( $sVar) === -1) {
                        $aFree.push( $sVar);
                      }
                    }
                    if ($aFree.length > 0) {
                      let $aRefFree = [];
											const $iFreeCount = $aFree.length;
											for (let $iF = 0; $iF < $iFreeCount; $iF = $iF + 1) {
                        $aRefFree.push( "&$" + $aFree[$iF].substring( 1, ( 1) + ( $aFree[$iF].length - 1)));
                      }
                      const $sUseClause = " use (" + $aRefFree.join( ", ") + ")";
											const $sBefore = $sResult.substring( 0, ( 0) + ( $iParenClose + 1));
											const $sAfter = $sResult.substring( $iParenClose + 1, ( $iParenClose + 1) + ( $sResult.length - ($iParenClose + 1)));
											$sResult = $sBefore + "" + $sUseClause + "" + $sAfter;
                    }
                  }
                }
              }
            }
          }
        }
      }
      $iFunc = $iFunc - 1;
    }
    return $sResult;
  };
  const $fProcessRange = function($sCode) {
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
                                        
                                        let $sSetup = $sFromVar + " = (" + $aArgs[0] + ");\n";
                                        $sSetup = $sSetup + $sToVar + " = (" + $aArgs[1] + ");\n";
                                        if ($aArgs.length > 2 && $aArgs[2].length > 0) {
                      $sSetup = $sSetup + $sStepVar + " = (" + $aArgs[2] + ");\n";
                    }
                    else {
                      $sSetup = $sSetup + $sStepVar + " = 1;\n";
                    }
                    $sSetup = $sSetup + $sIncVar + " = Math.abs(" + $sStepVar + ");\n";
                                        $sSetup = $sSetup + "if (" + $sFromVar + " > " + $sToVar + ") { " + $sIncVar + " = -" + $sIncVar + "; }\n";
                                        $sSetup = $sSetup + $sVarName + " = " + $sFromVar + ";\n";
                                        $sSetup = $sSetup + $sIxVar + " = 1;\n";
                                        
                                        const $sCond = "((" + $sIncVar + " > 0 && " + $sVarName + " <= " + $sToVar + ") || (" + $sIncVar + " <= 0 && " + $sVarName + " >= " + $sToVar + "))";
                                        
                                        let $sNewBody = '$JSOL_i = ' + $sIxVar + ';\n';
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

	// Auto-generate use (...) clauses before native stripping
	$sTransformed = $sExtractPHPUse($sTransformed);

	// PHP Target Pre-Processing (Native raw manipulations not mapped in SSOT)
	const $aPrefixes = ["\n", "\r\n", "\t", " ", "("];
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
      $sTransformed = Rgx.replace($mRule["search"],  $sTemplate,  $sTransformed,  'g');
    }
    else if ($sType === "replace") {
      $sTransformed = $sTransformed.split( $sId).join( $sTemplate);
    }
    else if ($sType === "call") {
      $sTransformed = $fProcessCall($sTransformed, $sId + "(", $sTemplate);
    }
    else if ($sType === "range") {
      $sTransformed = $fProcessRange($sTransformed);
    }
  }
  // PHP Target Post-Processing
	$sTransformed = $sTransformed.split( 'JSOL.').join( 'JSOL::');

	$sTransformed = Rgx.replace('(__JSOL_(TOKEN|STR|COM)_[0-9]+__)\\s*\\+',  '$1 .',  $sTransformed,  'g');
	$sTransformed = Rgx.replace('\\+\\s*(__JSOL_(TOKEN|STR|COM)_[0-9]+__)',  '. $1',  $sTransformed,  'g');

	$sTransformed = Rgx.replace('(\\$s[A-Za-z0-9_]*)\\s*\\+',  '$1 .',  $sTransformed,  'g');
	$sTransformed = Rgx.replace('\\+\\s*(\\$s[A-Za-z0-9_]*)',  '. $1',  $sTransformed,  'g');

	// ANTI-SABOTAGE: Post-processor to forcibly inject pass-by-reference (&$)
	let $bFixUse = true;
	let $iUseOffset = 0;
	while ($bFixUse === true) {
    const $iSearchLen = $sTransformed.length - $iUseOffset;
		if ($iSearchLen <= 0) {
      $bFixUse = false;
			continue;
    }
    const $sSearchArea = $sTransformed.substring( $iUseOffset, ( $iUseOffset) + ( $iSearchLen));
		const $iUseRel = $sSearchArea.indexOf( "use (");

		if ($iUseRel === -1) {
      $bFixUse = false;
    }
    else {
      const $iStart = $iUseOffset + $iUseRel + 5;
			const $iTailLen = $sTransformed.length - $iStart;
			const $sTail = $sTransformed.substring( $iStart, ( $iStart) + ( $iTailLen));
			const $iEndRel = $sTail.indexOf( ")");
			const $iEnd = $iStart + $iEndRel;

			const $sArgs = $sTransformed.substring( $iStart, ( $iStart) + ( $iEnd - $iStart));
			let $sRefArgs = Rgx.replace("\\$",  "&$",  $sArgs,  "g");
			$sRefArgs = Rgx.replace("&&\\$",  "&$",  $sRefArgs,  "g"); // Previene duplicar si ya tenía &

			const $sBefore = $sTransformed.substring( 0, ( 0) + ( $iStart));
			const $iAfterLen = $sTransformed.length - $iEnd;
			const $sAfter = $sTransformed.substring( $iEnd, ( $iEnd) + ( $iAfterLen));

			$sTransformed = $sBefore + "" + $sRefArgs + "" + $sAfter;
			$iUseOffset = $iStart + $sRefArgs.length + 1; // Avanza el puntero
    }
  }
  let $sFinalOutput = $sPrefix + "" + $sTransformed + "" + $sSuffix;
	if ($sFinalOutput.indexOf( "<?php") === -1) {
    $sFinalOutput = "<?php\n" + $sFinalOutput;
  }
  return $sFinalOutput;
};
