<?php
// @JSOL v0.2.96 - JavaScript Target Compiler
// [!] ARCHITECTURE NOTICE: The TypeScript and Python compilers have a strict structural dependency 
// on this JavaScript compiler. TypeScript extends these JS rules, and Python relies on the AST 
// cleanups and ternary transformations defined here. Do NOT decouple without architectural review.

$sCompileToJS = function ($sMaskedCode, $sPrefix, $sSuffix, $aRules) {
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
  // NEW (v0.2.95): scans literal "function(" occurrences and appends ": any"
	// to every bare parameter that doesn't already carry a type annotation.
	// JSOL params are always plain identifiers (no destructuring, no defaults),
	// so a top-level comma split is sufficient — no bracket counting needed
	// inside the parameter list itself, only to find where it closes.
	$fProcessParams = function ($sCode) {
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
			$iRelIdx = JSOL::strIndexOf($sSearchArea,  "function");

			if ($iRelIdx === -1) {
        $bContinue = false;
      }
      else {
        $iStartIdx = $iOffset + $iRelIdx;
				$iParenScan = $iStartIdx + 8;
				$iRLen = mb_strlen($sResult, "UTF-8");

				while ($iParenScan < $iRLen && (mb_substr($sResult,  $iParenScan,  1, "UTF-8") === " " || mb_substr($sResult,  $iParenScan,  1, "UTF-8") === "\t" || mb_substr($sResult,  $iParenScan,  1, "UTF-8") === "\n" || mb_substr($sResult,  $iParenScan,  1, "UTF-8") === "\r")) {
          $iParenScan = $iParenScan + 1;
        }
        if ($iParenScan < $iRLen && mb_substr($sResult,  $iParenScan,  1, "UTF-8") === "(") {
          $iOpenParen = $iParenScan;
					$iParenCount = 1;
					$iCloseParen = -1;

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
						$iOffset = $iOpenParen + 1 + mb_strlen($sTypedParams, "UTF-8") + 1;
          }
        }
        else {
          $iOffset = $iStartIdx + 8;
        }
      }
    }
    return $sResult;
  };
  $fProcessRange = function ($sCode) {
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

										$sSetup = "let " . $sFromVar . " = (" . $aArgs[0] . ");\n";
										$sSetup = $sSetup . "let " . $sToVar . " = (" . $aArgs[1] . ");\n";
										if (count($aArgs) > 2 && mb_strlen($aArgs[2], "UTF-8") > 0) {
                      $sSetup = $sSetup . "let " . $sStepVar . " = (" . $aArgs[2] . ");\n";
                    }
                    else {
                      $sSetup = $sSetup . "let " . $sStepVar . " = 1;\n";
                    }
                    $sSetup = $sSetup . "let " . $sIncVar . " = Math.abs(" . $sStepVar . ");\n";
										$sSetup = $sSetup . "if (" . $sFromVar . " > " . $sToVar . ") { " . $sIncVar . " = -" . $sIncVar . "; }\n";
										$sSetup = $sSetup . "let " . $sVarName . " = " . $sFromVar . ";\n";
										$sSetup = $sSetup . "let " . $sIxVar . " = 1;\n";

										$sCond = "((" . $sIncVar . " > 0 && " . $sVarName . " <= " . $sToVar . ") || (" . $sIncVar . " <= 0 && " . $sVarName . " >= " . $sToVar . "))";

										$sNewBody = 'let $JSOL_i = ' . $sIxVar . ';\n';
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
      $sTransformed = Rgx::replace($mRule["search"],  $sTemplate,  $sTransformed,  "g");
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
    else if ($sType === "range") {
      $sTransformed = $fProcessRange($sTransformed);
    }
  }
  $sFinalOutput = $sPrefix . "" . $sTransformed . "" . $sSuffix;
	return $sFinalOutput;
};
