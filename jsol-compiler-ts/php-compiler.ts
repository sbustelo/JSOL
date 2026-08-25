declare var JSOL: any;
declare var Rgx: any;

// @JSOL v0.2.96 - Self-Hosted PHP Target Compiler (Dynamic SSOT Iteration)
const $sCompileToPHP = function($sMaskedCode: any, $sPrefix: any, $sSuffix: any, $aRules: any): string {
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
  const $sExtractPHPUse = function($sCode: any): string {
    const $bIsIdentChar = function($sCh: any): boolean {
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
    const $mReadWord = function($sCodeText: any, $iStart: any): Record<string, any> {
      const $iLen: number = $sCodeText.length;
			let $i: number = $iStart;
			while ($i < $iLen && $bIsIdentChar($sCodeText.substring( $i, ( $i) + ( 1)))) {
        $i = $i + 1;
      }
      return JSOL.dict("word",  $sCodeText.substring( $iStart, ( $iStart) + ( $i - $iStart)),  "end",  $i);
    };
    let $sResult: string = $sCode;
		let $iFunc: number = $sResult.length - 8;

		while ($iFunc >= 0) {
      if ($sResult.substring( $iFunc, ( $iFunc) + ( 8)) === "function") {
        const $bPrev: boolean = $iFunc === 0 || !$bIsIdentChar($sResult.substring( $iFunc - 1, ( $iFunc - 1) + ( 1)));
				const $bNext: boolean = $iFunc + 8 === $sResult.length || !$bIsIdentChar($sResult.substring( $iFunc + 8, ( $iFunc + 8) + ( 1)));

				if ($bPrev && $bNext) {
          let $iParenOpen: number = $iFunc + 8;
					while ($iParenOpen < $sResult.length && $sResult.substring( $iParenOpen, ( $iParenOpen) + ( 1)) !== "(" && $sResult.substring( $iParenOpen, ( $iParenOpen) + ( 1)) !== "{") {
            $iParenOpen = $iParenOpen + 1;
          }
          if ($iParenOpen < $sResult.length && $sResult.substring( $iParenOpen, ( $iParenOpen) + ( 1)) === "(") {
            let $iParenDepth: number = 0;
						let $iParenClose: number = -1;
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
              let $iBraceOpen: number = $iParenClose + 1;
							while ($iBraceOpen < $sResult.length && $sResult.substring( $iBraceOpen, ( $iBraceOpen) + ( 1)) !== "{" && $sResult.substring( $iBraceOpen, ( $iBraceOpen) + ( 1)) !== "(") {
                $iBraceOpen = $iBraceOpen + 1;
              }
              if ($iBraceOpen < $sResult.length && $sResult.substring( $iBraceOpen, ( $iBraceOpen) + ( 1)) === "{") {
                let $iBraceDepth: number = 0;
								let $iBraceClose: number = -1;
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
                  const $sParams: string = $sResult.substring( $iParenOpen + 1, ( $iParenOpen + 1) + ( $iParenClose - $iParenOpen - 1));
									const $sBody: string = $sResult.substring( $iBraceOpen + 1, ( $iBraceOpen + 1) + ( $iBraceClose - $iBraceOpen - 1));

									if ($sBody.indexOf( "JSOL.use") === -1) {
                    let $aParams: any[] = [];
										let $aLocals: any[] = [];
										let $aAllVars: any[] = [];

										let $iP: number = 0;
										while ($iP < $sParams.length) {
                      if ($sParams.substring( $iP, ( $iP) + ( 1)) === "$") {
                        const $mWord: Record<string, any> = $mReadWord($sParams, $iP);
												$aParams.push( $mWord["word"]);
												$iP = $mWord["end"];
                      }
                      else {
                        $iP = $iP + 1;
                      }
                    }
                    let $iB: number = 0;
										while ($iB < $sBody.length) {
                      if ($sBody.substring( $iB, ( $iB) + ( 8)) === "function" && !$bIsIdentChar($sBody.substring( $iB + 8, ( $iB + 8) + ( 1)))) {
                        let $iParen: number = $iB + 8;
												while ($iParen < $sBody.length && $sBody.substring( $iParen, ( $iParen) + ( 1)) !== "(") {
                          $iParen = $iParen + 1;
                        }
                        if ($iParen < $sBody.length) {
                          let $iPDepth: number = 0;
													let $iPClose: number = -1;
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
                            const $sInnerParams: string = $sBody.substring( $iParen + 1, ( $iParen + 1) + ( $iPClose - $iParen - 1));
														let $iIP: number = 0;
														while ($iIP < $sInnerParams.length) {
                              if ($sInnerParams.substring( $iIP, ( $iIP) + ( 1)) === "$") {
                                const $mWord: Record<string, any> = $mReadWord($sInnerParams, $iIP);
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
                      let $bIsDecl: boolean = false;
											let $iAfterDecl: number = $iB;
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
                          const $mWord: Record<string, any> = $mReadWord($sBody, $iAfterDecl);
													$aLocals.push( $mWord["word"]);
                        }
                        $iB = $iAfterDecl;
												continue;
                      }
                      if ($sBody.substring( $iB, ( $iB) + ( 1)) === "$") {
                        const $mWord: Record<string, any> = $mReadWord($sBody, $iB);
												if ($mWord["word"] !== '$_') {
                          $aAllVars.push( $mWord["word"]);
                        }
                        $iB = $mWord["end"];
                      }
                      else {
                        $iB = $iB + 1;
                      }
                    }
                    let $aFree: any[] = [];
										const $iAllCount: number = $aAllVars.length;
										for (let $iV = 0; $iV < $iAllCount; $iV = $iV + 1) {
                      const $sVar: string = $aAllVars[$iV];
											if ($aParams.indexOf( $sVar) === -1 && $aLocals.indexOf( $sVar) === -1 && $aFree.indexOf( $sVar) === -1) {
                        $aFree.push( $sVar);
                      }
                    }
                    if ($aFree.length > 0) {
                      let $aRefFree: any[] = [];
											const $iFreeCount: number = $aFree.length;
											for (let $iF = 0; $iF < $iFreeCount; $iF = $iF + 1) {
                        $aRefFree.push( "&$" + $aFree[$iF].substring( 1, ( 1) + ( $aFree[$iF].length - 1)));
                      }
                      const $sUseClause: string = " use (" + $aRefFree.join( ", ") + ")";
											const $sBefore: string = $sResult.substring( 0, ( 0) + ( $iParenClose + 1));
											const $sAfter: string = $sResult.substring( $iParenClose + 1, ( $iParenClose + 1) + ( $sResult.length - ($iParenClose + 1)));
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
  const $fProcessRange = function($sCode: any) {
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
                                        
                                        let $sSetup: string = $sFromVar + " = (" + $aArgs[0] + ");\n";
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
                                        
                                        const $sCond: string = "((" + $sIncVar + " > 0 && " + $sVarName + " <= " + $sToVar + ") || (" + $sIncVar + " <= 0 && " + $sVarName + " >= " + $sToVar + "))";
                                        
                                        let $sNewBody: string = '$JSOL_i = ' + $sIxVar + ';\n';
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

	// Auto-generate use (...) clauses before native stripping
	$sTransformed = $sExtractPHPUse($sTransformed);

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
			let $sRefArgs: string = Rgx.replace("\\$",  "&$",  $sArgs,  "g");
			$sRefArgs = Rgx.replace("&&\\$",  "&$",  $sRefArgs,  "g"); // Previene duplicar si ya tenía &

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
