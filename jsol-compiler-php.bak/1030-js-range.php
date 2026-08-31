<?php
// @JSOL v0.2.97
$fProcessRange = function($saCode) use (&$mComp_ParseArgs, &$iComp_FindCloseBrace) {
  if (Str::indexOf($saCode,  "JSOL.range") === -1) {
    return $saCode;
  }
  $saResult = $saCode;
	$bContinue = true;

	while ($bContinue === true) {
    $iRelIdx = Str::indexOf($saResult,  "for");
		if ($iRelIdx === -1) {
      $bContinue = false; continue;
    }
    $iStartIdx = $iRelIdx;
		$i = $iStartIdx + 3;
		
		while ($i < mb_strlen($saResult, "UTF-8") && (mb_substr($saResult,  $i,  1, "UTF-8") === " " || mb_substr($saResult,  $i,  1, "UTF-8") === "\n" || mb_substr($saResult,  $i,  1, "UTF-8") === "\t" || mb_substr($saResult,  $i,  1, "UTF-8") === "\r" || mb_substr($saResult,  $i,  1, "UTF-8") === "(")) {
      $i = $i + 1;
    }
    if (mb_substr($saResult,  $i,  4, "UTF-8") === "let ") {
      $i = $i + 4;
    }
    $iV = $i;
		if (mb_substr($saResult,  $iV,  1, "UTF-8") !== "$") {
      $saResult = mb_substr($saResult,  0,  $iStartIdx, "UTF-8") . "__JSOL_FOR__" . mb_substr($saResult,  $iStartIdx + 3,  mb_strlen($saResult, "UTF-8") - $iStartIdx - 3, "UTF-8");
			continue;
    }
    while ($iV < mb_strlen($saResult, "UTF-8")) {
      $saC = mb_substr($saResult,  $iV,  1, "UTF-8");
			if ($saC === "_" || $saC === "$" || ($saC >= "a" && $saC <= "z") || ($saC >= "A" && $saC <= "Z") || ($saC >= "0" && $saC <= "9")) {
        $iV = $iV + 1;
      }
      else {
        break;
      }
    }
    $saVarName = mb_substr($saResult,  $i,  $iV - $i, "UTF-8");
		$i = $iV;

		while ($i < mb_strlen($saResult, "UTF-8") && (mb_substr($saResult,  $i,  1, "UTF-8") === " " || mb_substr($saResult,  $i,  1, "UTF-8") === "\n" || mb_substr($saResult,  $i,  1, "UTF-8") === "\t" || mb_substr($saResult,  $i,  1, "UTF-8") === "\r")) {
      $i = $i + 1;
    }
    if (mb_substr($saResult,  $i,  2, "UTF-8") !== "of") {
      $saResult = mb_substr($saResult,  0,  $iStartIdx, "UTF-8") . "__JSOL_FOR__" . mb_substr($saResult,  $iStartIdx + 3,  mb_strlen($saResult, "UTF-8") - $iStartIdx - 3, "UTF-8");
			continue;
    }
    $i = $i + 2;
		while ($i < mb_strlen($saResult, "UTF-8") && (mb_substr($saResult,  $i,  1, "UTF-8") === " " || mb_substr($saResult,  $i,  1, "UTF-8") === "\n" || mb_substr($saResult,  $i,  1, "UTF-8") === "\t" || mb_substr($saResult,  $i,  1, "UTF-8") === "\r")) {
      $i = $i + 1;
    }
    if (mb_substr($saResult,  $i,  11, "UTF-8") !== "JSOL.range(") {
      $saResult = mb_substr($saResult,  0,  $iStartIdx, "UTF-8") . "__JSOL_FOR__" . mb_substr($saResult,  $iStartIdx + 3,  mb_strlen($saResult, "UTF-8") - $iStartIdx - 3, "UTF-8");
			continue;
    }
    $iParenOpen = $i + 10;
		$mDataArgs = $mComp_ParseArgs($saResult, $iParenOpen);
		if ($mDataArgs["close"] === -1) {
      $saResult = mb_substr($saResult,  0,  $iStartIdx, "UTF-8") . "__JSOL_FOR__" . mb_substr($saResult,  $iStartIdx + 3,  mb_strlen($saResult, "UTF-8") - $iStartIdx - 3, "UTF-8");
			continue;
    }
    $iB = $mDataArgs["close"] + 1;
		while ($iB < mb_strlen($saResult, "UTF-8") && (mb_substr($saResult,  $iB,  1, "UTF-8") === " " || mb_substr($saResult,  $iB,  1, "UTF-8") === "\n" || mb_substr($saResult,  $iB,  1, "UTF-8") === "\t" || mb_substr($saResult,  $iB,  1, "UTF-8") === "\r" || mb_substr($saResult,  $iB,  1, "UTF-8") === ")")) {
      $iB = $iB + 1;
    }
    if (mb_substr($saResult,  $iB,  1, "UTF-8") !== "{") {
      $saResult = mb_substr($saResult,  0,  $iStartIdx, "UTF-8") . "__JSOL_FOR__" . mb_substr($saResult,  $iStartIdx + 3,  mb_strlen($saResult, "UTF-8") - $iStartIdx - 3, "UTF-8");
			continue;
    }
    $iBraceClose = $iComp_FindCloseBrace($saResult, $iB);
		if ($iBraceClose === -1) {
      $saResult = mb_substr($saResult,  0,  $iStartIdx, "UTF-8") . "__JSOL_FOR__" . mb_substr($saResult,  $iStartIdx + 3,  mb_strlen($saResult, "UTF-8") - $iStartIdx - 3, "UTF-8");
			continue;
    }
    $saBody = mb_substr($saResult,  $iB + 1,  $iBraceClose - $iB - 1, "UTF-8");
		$aArgs = $mDataArgs["args"];
		$saCleanVar = mb_substr($saVarName,  1,  mb_strlen($saVarName, "UTF-8") - 1, "UTF-8");
		$saFromVar = '$JSOL_from_' . $saCleanVar;
		$saToVar = '$JSOL_to_' . $saCleanVar;
		$saStepVar = '$JSOL_step_' . $saCleanVar;
		$saIncVar = '$JSOL_inc_' . $saCleanVar;
		$saIxVar = '$JSOL_i_' . $saCleanVar;

		$saSetup = "let " . $saFromVar . " = (" . $aArgs[0] . ");\nlet " . $saToVar . " = (" . $aArgs[1] . ");\n";
		if (count($aArgs) > 2 && mb_strlen($aArgs[2], "UTF-8") > 0) {
      $saSetup = $saSetup . "let " . $saStepVar . " = (" . $aArgs[2] . ");\n";
    }
    else {
      $saSetup = $saSetup . "let " . $saStepVar . " = 1;\n";
    }
    $saSetup = $saSetup . "let " . $saIncVar . " = Math.abs(" . $saStepVar . ");\nif (" . $saFromVar . " > " . $saToVar . ") { " . $saIncVar . " = -" . $saIncVar . "; }\nlet " . $saVarName . " = " . $saFromVar . ";\nlet " . $saIxVar . " = 1;\n";

		$saCond = "((" . $saIncVar . " > 0 && " . $saVarName . " <= " . $saToVar . ") || (" . $saIncVar . " <= 0 && " . $saVarName . " >= " . $saToVar . "))";

		$saNewBody = 'let $JSOL_i = ' . $saIxVar . ';\n' . $saBody . "\n" . $saVarName . " = " . $saVarName . " + " . $saIncVar . ";\n" . $saIxVar . " = " . $saIxVar . " + 1;\n";

		$saReplace = "if (true) {\n" . $saSetup . "while (" . $saCond . ") {\n" . $saNewBody . "}\n}";
		$saResult = mb_substr($saResult,  0,  $iStartIdx, "UTF-8") . "" . $saReplace . "" . mb_substr($saResult,  $iBraceClose + 1,  mb_strlen($saResult, "UTF-8") - $iBraceClose - 1, "UTF-8");
  }
  $saResult = str_replace( "__JSOL_FOR__",  "for", $saResult);
	return $saResult;
};
