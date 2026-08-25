<?php
// @JSOL v0.2.96 - Self-Hosted PHP Target Compiler (Dynamic SSOT Iteration)
$sCompileToPHP = function ($sMaskedCode, $sPrefix, $sSuffix, $aRules) {
  $fProcessBlock = function ($sCode, $sKeyword, $bUnwrap) {
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
  $fProcessCall = function ($sCode, $sKeyword, $sTemplate) {
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
  $sExtractPHPUse = function ($sCode) {
    $bIsIdentChar = function ($sCh) {
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
    $mReadWord = function($sCodeText, $iStart) use (&$bIsIdentChar) {
      $iLen = mb_strlen($sCodeText, "UTF-8");
			$i = $iStart;
			while ($i < $iLen && $bIsIdentChar(mb_substr($sCodeText,  $i,  1, "UTF-8"))) {
        $i = $i + 1;
      }
      return JSOL::dict("word",  mb_substr($sCodeText,  $iStart,  $i - $iStart, "UTF-8"),  "end",  $i);
    };
    $sResult = $sCode;
		$iFunc = mb_strlen($sResult, "UTF-8") - 8;

		while ($iFunc >= 0) {
      if (mb_substr($sResult,  $iFunc,  8, "UTF-8") === "function") {
        $bPrev = $iFunc === 0 || !$bIsIdentChar(mb_substr($sResult,  $iFunc - 1,  1, "UTF-8"));
				$bNext = $iFunc + 8 === mb_strlen($sResult, "UTF-8") || !$bIsIdentChar(mb_substr($sResult,  $iFunc + 8,  1, "UTF-8"));

				if ($bPrev && $bNext) {
          $iParenOpen = $iFunc + 8;
					while ($iParenOpen < mb_strlen($sResult, "UTF-8") && mb_substr($sResult,  $iParenOpen,  1, "UTF-8") !== "(" && mb_substr($sResult,  $iParenOpen,  1, "UTF-8") !== "{") {
            $iParenOpen = $iParenOpen + 1;
          }
          if ($iParenOpen < mb_strlen($sResult, "UTF-8") && mb_substr($sResult,  $iParenOpen,  1, "UTF-8") === "(") {
            $iParenDepth = 0;
						$iParenClose = -1;
						for ($iK = $iParenOpen; $iK < mb_strlen($sResult, "UTF-8"); $iK = $iK + 1) {
              if (mb_substr($sResult,  $iK,  1, "UTF-8") === "(") {
                $iParenDepth = $iParenDepth + 1;
              }
              else if (mb_substr($sResult,  $iK,  1, "UTF-8") === ")") {
                $iParenDepth = $iParenDepth - 1;
								if ($iParenDepth === 0) {
                  $iParenClose = $iK;
									break;
                }
              }
            }
            if ($iParenClose !== -1) {
              $iBraceOpen = $iParenClose + 1;
							while ($iBraceOpen < mb_strlen($sResult, "UTF-8") && mb_substr($sResult,  $iBraceOpen,  1, "UTF-8") !== "{" && mb_substr($sResult,  $iBraceOpen,  1, "UTF-8") !== "(") {
                $iBraceOpen = $iBraceOpen + 1;
              }
              if ($iBraceOpen < mb_strlen($sResult, "UTF-8") && mb_substr($sResult,  $iBraceOpen,  1, "UTF-8") === "{") {
                $iBraceDepth = 0;
								$iBraceClose = -1;
								for ($iK = $iBraceOpen; $iK < mb_strlen($sResult, "UTF-8"); $iK = $iK + 1) {
                  if (mb_substr($sResult,  $iK,  1, "UTF-8") === "{") {
                    $iBraceDepth = $iBraceDepth + 1;
                  }
                  else if (mb_substr($sResult,  $iK,  1, "UTF-8") === "}") {
                    $iBraceDepth = $iBraceDepth - 1;
										if ($iBraceDepth === 0) {
                      $iBraceClose = $iK;
											break;
                    }
                  }
                }
                if ($iBraceClose !== -1) {
                  $sParams = mb_substr($sResult,  $iParenOpen + 1,  $iParenClose - $iParenOpen - 1, "UTF-8");
									$sBody = mb_substr($sResult,  $iBraceOpen + 1,  $iBraceClose - $iBraceOpen - 1, "UTF-8");

									if (JSOL::strIndexOf($sBody,  "JSOL.use") === -1) {
                    $aParams = [];
										$aLocals = [];
										$aAllVars = [];

										$iP = 0;
										while ($iP < mb_strlen($sParams, "UTF-8")) {
                      if (mb_substr($sParams,  $iP,  1, "UTF-8") === "$") {
                        $mWord = $mReadWord($sParams, $iP);
												$aParams[] =  $mWord["word"];
												$iP = $mWord["end"];
                      }
                      else {
                        $iP = $iP + 1;
                      }
                    }
                    $iB = 0;
										while ($iB < mb_strlen($sBody, "UTF-8")) {
                      if (mb_substr($sBody,  $iB,  8, "UTF-8") === "function" && !$bIsIdentChar(mb_substr($sBody,  $iB + 8,  1, "UTF-8"))) {
                        $iParen = $iB + 8;
												while ($iParen < mb_strlen($sBody, "UTF-8") && mb_substr($sBody,  $iParen,  1, "UTF-8") !== "(") {
                          $iParen = $iParen + 1;
                        }
                        if ($iParen < mb_strlen($sBody, "UTF-8")) {
                          $iPDepth = 0;
													$iPClose = -1;
													for ($iK = $iParen; $iK < mb_strlen($sBody, "UTF-8"); $iK = $iK + 1) {
                            if (mb_substr($sBody,  $iK,  1, "UTF-8") === "(") {
                              $iPDepth = $iPDepth + 1;
                            }
                            else if (mb_substr($sBody,  $iK,  1, "UTF-8") === ")") {
                              $iPDepth = $iPDepth - 1;
															if ($iPDepth === 0) {
                                $iPClose = $iK; break;
                              }
                            }
                          }
                          if ($iPClose !== -1) {
                            $sInnerParams = mb_substr($sBody,  $iParen + 1,  $iPClose - $iParen - 1, "UTF-8");
														$iIP = 0;
														while ($iIP < mb_strlen($sInnerParams, "UTF-8")) {
                              if (mb_substr($sInnerParams,  $iIP,  1, "UTF-8") === "$") {
                                $mWord = $mReadWord($sInnerParams, $iIP);
																$aLocals[] =  $mWord["word"];
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
                      $bIsDecl = false;
											$iAfterDecl = $iB;
											if (mb_substr($sBody,  $iB,  6, "UTF-8") === "const ") {
                        $bIsDecl = true;
												$iAfterDecl = $iB + 6;
                      }
                      else if (mb_substr($sBody,  $iB,  4, "UTF-8") === "let ") {
                        $bIsDecl = true;
												$iAfterDecl = $iB + 4;
                      }
                      if ($bIsDecl) {
                        while ($iAfterDecl < mb_strlen($sBody, "UTF-8") && (mb_substr($sBody,  $iAfterDecl,  1, "UTF-8") === " " || mb_substr($sBody,  $iAfterDecl,  1, "UTF-8") === "\t" || mb_substr($sBody,  $iAfterDecl,  1, "UTF-8") === "\n" || mb_substr($sBody,  $iAfterDecl,  1, "UTF-8") === "\r")) {
                          $iAfterDecl = $iAfterDecl + 1;
                        }
                        if (mb_substr($sBody,  $iAfterDecl,  1, "UTF-8") === "$") {
                          $mWord = $mReadWord($sBody, $iAfterDecl);
													$aLocals[] =  $mWord["word"];
                        }
                        $iB = $iAfterDecl;
												continue;
                      }
                      if (mb_substr($sBody,  $iB,  1, "UTF-8") === "$") {
                        $mWord = $mReadWord($sBody, $iB);
												if ($mWord["word"] !== '$_') {
                          $aAllVars[] =  $mWord["word"];
                        }
                        $iB = $mWord["end"];
                      }
                      else {
                        $iB = $iB + 1;
                      }
                    }
                    $aFree = [];
										$iAllCount = count($aAllVars);
										for ($iV = 0; $iV < $iAllCount; $iV = $iV + 1) {
                      $sVar = $aAllVars[$iV];
											if (JSOL::arrIndexOf($aParams,  $sVar) === -1 && JSOL::arrIndexOf($aLocals,  $sVar) === -1 && JSOL::arrIndexOf($aFree,  $sVar) === -1) {
                        $aFree[] =  $sVar;
                      }
                    }
                    if (count($aFree) > 0) {
                      $aRefFree = [];
											$iFreeCount = count($aFree);
											for ($iF = 0; $iF < $iFreeCount; $iF = $iF + 1) {
                        $aRefFree[] =  "&$" . mb_substr($aFree[$iF],  1,  mb_strlen($aFree[$iF], "UTF-8") - 1, "UTF-8");
                      }
                      $sUseClause = " use (" . implode( ", ", $aRefFree) . ")";
											$sBefore = mb_substr($sResult,  0,  $iParenClose + 1, "UTF-8");
											$sAfter = mb_substr($sResult,  $iParenClose + 1,  mb_strlen($sResult, "UTF-8") - ($iParenClose + 1), "UTF-8");
											$sResult = $sBefore . "" . $sUseClause . "" . $sAfter;
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
  $fProcessRange = function($sCode) {
    if (JSOL::strIndexOf($sCode,  "JSOL.range") === -1) {
      return $sCode;
    }
    $sResult = $sCode;
        $bContinue = true;

        while ($bContinue === true) {
      $iRelIdx = JSOL::strIndexOf($sResult,  "for");
            if ($iRelIdx === -1) {
        $bContinue = false;
      }
      else {
        $iStartIdx = $iRelIdx;
                $i = $iStartIdx + 3;
                while ($i < mb_strlen($sResult, "UTF-8") && (mb_substr($sResult,  $i,  1, "UTF-8") === " " || mb_substr($sResult,  $i,  1, "UTF-8") === "\n" || mb_substr($sResult,  $i,  1, "UTF-8") === "\t" || mb_substr($sResult,  $i,  1, "UTF-8") === "\r" || mb_substr($sResult,  $i,  1, "UTF-8") === "(")) {
          $i = $i + 1;
        }
        if (mb_substr($sResult,  $i,  4, "UTF-8") === "let ") {
          $i = $i + 4;
        }
        $iV = $i;
                if (mb_substr($sResult,  $iV,  1, "UTF-8") === "$") {
          while ($iV < mb_strlen($sResult, "UTF-8")) {
            $sC = mb_substr($sResult,  $iV,  1, "UTF-8");
                        if ($sC === "_" || $sC === "$" || ($sC >= "a" && $sC <= "z") || ($sC >= "A" && $sC <= "Z") || ($sC >= "0" && $sC <= "9")) {
              $iV = $iV + 1;
            }
            else {
              break;
            }
          }
          $sVarName = mb_substr($sResult,  $i,  $iV - $i, "UTF-8");
                    $i = $iV;
                    
                    while ($i < mb_strlen($sResult, "UTF-8") && (mb_substr($sResult,  $i,  1, "UTF-8") === " " || mb_substr($sResult,  $i,  1, "UTF-8") === "\n" || mb_substr($sResult,  $i,  1, "UTF-8") === "\t" || mb_substr($sResult,  $i,  1, "UTF-8") === "\r")) {
            $i = $i + 1;
          }
          if (mb_substr($sResult,  $i,  2, "UTF-8") === "of") {
            $i = $i + 2;
                        while ($i < mb_strlen($sResult, "UTF-8") && (mb_substr($sResult,  $i,  1, "UTF-8") === " " || mb_substr($sResult,  $i,  1, "UTF-8") === "\n" || mb_substr($sResult,  $i,  1, "UTF-8") === "\t" || mb_substr($sResult,  $i,  1, "UTF-8") === "\r")) {
              $i = $i + 1;
            }
            if (mb_substr($sResult,  $i,  11, "UTF-8") === "JSOL.range(") {
              $i = $i + 10;
                            $iParenDepth = 0;
                            $iParenClose = -1;
                            for ($iK = $i; $iK < mb_strlen($sResult, "UTF-8"); $iK = $iK + 1) {
                if (mb_substr($sResult,  $iK,  1, "UTF-8") === "(") {
                  $iParenDepth = $iParenDepth + 1;
                }
                else if (mb_substr($sResult,  $iK,  1, "UTF-8") === ")") {
                  $iParenDepth = $iParenDepth - 1;
                                    if ($iParenDepth === 0) {
                    $iParenClose = $iK; break;
                  }
                }
              }
              if ($iParenClose !== -1) {
                $sArgs = mb_substr($sResult,  $i + 1,  $iParenClose - $i - 1, "UTF-8");
                                $iB = $iParenClose + 1;
                                while ($iB < mb_strlen($sResult, "UTF-8") && (mb_substr($sResult,  $iB,  1, "UTF-8") === " " || mb_substr($sResult,  $iB,  1, "UTF-8") === "\n" || mb_substr($sResult,  $iB,  1, "UTF-8") === "\t" || mb_substr($sResult,  $iB,  1, "UTF-8") === "\r" || mb_substr($sResult,  $iB,  1, "UTF-8") === ")")) {
                  $iB = $iB + 1;
                }
                if (mb_substr($sResult,  $iB,  1, "UTF-8") === "{") {
                  $iBraceDepth = 0;
                                    $iBraceClose = -1;
                                    for ($iK = $iB; $iK < mb_strlen($sResult, "UTF-8"); $iK = $iK + 1) {
                    if (mb_substr($sResult,  $iK,  1, "UTF-8") === "{") {
                      $iBraceDepth = $iBraceDepth + 1;
                    }
                    else if (mb_substr($sResult,  $iK,  1, "UTF-8") === "}") {
                      $iBraceDepth = $iBraceDepth - 1;
                                            if ($iBraceDepth === 0) {
                        $iBraceClose = $iK; break;
                      }
                    }
                  }
                  if ($iBraceClose !== -1) {
                    $sBody = mb_substr($sResult,  $iB + 1,  $iBraceClose - $iB - 1, "UTF-8");
                                        
                                        $aArgs = [];
                                        $iADepth = 0;
                                        $iAStart = 0;
                                        $bInStr = false;
                                        for ($iK = 0; $iK < mb_strlen($sArgs, "UTF-8"); $iK = $iK + 1) {
                      $sC = mb_substr($sArgs,  $iK,  1, "UTF-8");
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
                          $aArgs[] =  trim(mb_substr($sArgs,  $iAStart,  $iK - $iAStart, "UTF-8"));
                                                    $iAStart = $iK + 1;
                        }
                      }
                    }
                    $aArgs[] =  trim(mb_substr($sArgs,  $iAStart,  mb_strlen($sArgs, "UTF-8") - $iAStart, "UTF-8"));
                                        
                                        $sCleanVar = mb_substr($sVarName,  1,  mb_strlen($sVarName, "UTF-8") - 1, "UTF-8");
                                        $sFromVar = '$JSOL_from_' . $sCleanVar;
                                        $sToVar = '$JSOL_to_' . $sCleanVar;
                                        $sStepVar = '$JSOL_step_' . $sCleanVar;
                                        $sIncVar = '$JSOL_inc_' . $sCleanVar;
                                        $sIxVar = '$JSOL_i_' . $sCleanVar;
                                        
                                        $sSetup = $sFromVar . " = (" . $aArgs[0] . ");\n";
                                        $sSetup = $sSetup . $sToVar . " = (" . $aArgs[1] . ");\n";
                                        if (count($aArgs) > 2 && mb_strlen($aArgs[2], "UTF-8") > 0) {
                      $sSetup = $sSetup . $sStepVar . " = (" . $aArgs[2] . ");\n";
                    }
                    else {
                      $sSetup = $sSetup . $sStepVar . " = 1;\n";
                    }
                    $sSetup = $sSetup . $sIncVar . " = Math.abs(" . $sStepVar . ");\n";
                                        $sSetup = $sSetup . "if (" . $sFromVar . " > " . $sToVar . ") { " . $sIncVar . " = -" . $sIncVar . "; }\n";
                                        $sSetup = $sSetup . $sVarName . " = " . $sFromVar . ";\n";
                                        $sSetup = $sSetup . $sIxVar . " = 1;\n";
                                        
                                        $sCond = "((" . $sIncVar . " > 0 && " . $sVarName . " <= " . $sToVar . ") || (" . $sIncVar . " <= 0 && " . $sVarName . " >= " . $sToVar . "))";
                                        
                                        $sNewBody = '$JSOL_i = ' . $sIxVar . ';\n';
                                        $sNewBody = $sNewBody . $sBody . "\n";
                                        $sNewBody = $sNewBody . $sVarName . " = " . $sVarName . " + " . $sIncVar . ";\n";
                                        $sNewBody = $sNewBody . $sIxVar . " = " . $sIxVar . " + 1;\n";
                                        
                                        $sReplace = "if (true) {\n" . $sSetup . "while (" . $sCond . ") {\n" . $sNewBody . "}\n}";
                                        
                                        $sBefore = mb_substr($sResult,  0,  $iStartIdx, "UTF-8");
                                        $sAfter = mb_substr($sResult,  $iBraceClose + 1,  mb_strlen($sResult, "UTF-8") - $iBraceClose - 1, "UTF-8");
                                        $sResult = $sBefore . "" . $sReplace . "" . $sAfter;
                                        
                                        continue;
                  }
                }
              }
            }
          }
        }
        $sResult = mb_substr($sResult,  0,  $iStartIdx, "UTF-8") . "__JSOL_FOR__" . mb_substr($sResult,  $iStartIdx + 3,  mb_strlen($sResult, "UTF-8") - $iStartIdx - 3, "UTF-8");
      }
    }
    $sResult = str_replace( "__JSOL_FOR__",  "for", $sResult);
        return $sResult;
  };
  $sTransformed = $sMaskedCode;

	// Auto-generate use (...) clauses before native stripping
	$sTransformed = $sExtractPHPUse($sTransformed);

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
      $sTransformed = Rgx::replace($mRule["search"],  $sTemplate,  $sTransformed,  'g');
    }
    else if ($sType === "replace") {
      $sTransformed = str_replace( $sId,  $sTemplate, $sTransformed);
    }
    else if ($sType === "call") {
      $sTransformed = $fProcessCall($sTransformed, $sId . "(", $sTemplate);
    }
    else if ($sType === "range") {
      $sTransformed = $fProcessRange($sTransformed);
    }
  }
  // PHP Target Post-Processing
	$sTransformed = str_replace( 'JSOL.',  'JSOL::', $sTransformed);

	$sTransformed = Rgx::replace('(__JSOL_(TOKEN|STR|COM)_[0-9]+__)\\s*\\+',  '$1 .',  $sTransformed,  'g');
	$sTransformed = Rgx::replace('\\+\\s*(__JSOL_(TOKEN|STR|COM)_[0-9]+__)',  '. $1',  $sTransformed,  'g');

	$sTransformed = Rgx::replace('(\\$s[A-Za-z0-9_]*)\\s*\\+',  '$1 .',  $sTransformed,  'g');
	$sTransformed = Rgx::replace('\\+\\s*(\\$s[A-Za-z0-9_]*)',  '. $1',  $sTransformed,  'g');

	// ANTI-SABOTAGE: Post-processor to forcibly inject pass-by-reference (&$)
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
			$sRefArgs = Rgx::replace("\\$",  "&$",  $sArgs,  "g");
			$sRefArgs = Rgx::replace("&&\\$",  "&$",  $sRefArgs,  "g"); // Previene duplicar si ya tenía &

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
