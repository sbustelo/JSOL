declare var JSOL: any;
declare var Rgx: any;
declare var Str: any;
declare var Arr: any;
declare var Bool: any;
declare var Cast: any;

// @JSOL v0.2.97
const $fProcessRange = function ($saCode: any) {
  if (Str["indexOf"]($saCode,  "JSOL.range") === -1) {
    return $saCode;
  }
  let $saResult: string = $saCode;
	let $bContinue: boolean = true;

	while ($bContinue === true) {
    const $iRelIdx: number = Str["indexOf"]($saResult,  "for");
		if ($iRelIdx === -1) {
      $bContinue = false; continue;
    }
    const $iStartIdx: number = $iRelIdx;
		let $i: number = $iStartIdx + 3;
		
		while ($i < Str["len"]($saResult) && (Str["sub"]($saResult,  $i,  1) === " " || Str["sub"]($saResult,  $i,  1) === "\n" || Str["sub"]($saResult,  $i,  1) === "\t" || Str["sub"]($saResult,  $i,  1) === "\r" || Str["sub"]($saResult,  $i,  1) === "(")) {
      $i = $i + 1;
    }
    if (Str["sub"]($saResult,  $i,  4) === "let ") {
      $i = $i + 4;
    }
    let $iV: number = $i;
		if (Str["sub"]($saResult,  $iV,  1) !== "$") {
      $saResult = Str["sub"]($saResult,  0,  $iStartIdx) + "__JSOL_FOR__" + Str["sub"]($saResult,  $iStartIdx + 3,  Str["len"]($saResult) - $iStartIdx - 3);
			continue;
    }
    while ($iV < Str["len"]($saResult)) {
      const $saC: string = Str["sub"]($saResult,  $iV,  1);
			if ($saC === "_" || $saC === "$" || ($saC >= "a" && $saC <= "z") || ($saC >= "A" && $saC <= "Z") || ($saC >= "0" && $saC <= "9")) {
        $iV = $iV + 1;
      }
      else {
        break;
      }
    }
    const $saVarName: string = Str["sub"]($saResult,  $i,  $iV - $i);
		$i = $iV;

		while ($i < Str["len"]($saResult) && (Str["sub"]($saResult,  $i,  1) === " " || Str["sub"]($saResult,  $i,  1) === "\n" || Str["sub"]($saResult,  $i,  1) === "\t" || Str["sub"]($saResult,  $i,  1) === "\r")) {
      $i = $i + 1;
    }
    if (Str["sub"]($saResult,  $i,  2) !== "of") {
      $saResult = Str["sub"]($saResult,  0,  $iStartIdx) + "__JSOL_FOR__" + Str["sub"]($saResult,  $iStartIdx + 3,  Str["len"]($saResult) - $iStartIdx - 3);
			continue;
    }
    $i = $i + 2;
		while ($i < Str["len"]($saResult) && (Str["sub"]($saResult,  $i,  1) === " " || Str["sub"]($saResult,  $i,  1) === "\n" || Str["sub"]($saResult,  $i,  1) === "\t" || Str["sub"]($saResult,  $i,  1) === "\r")) {
      $i = $i + 1;
    }
    if (Str["sub"]($saResult,  $i,  11) !== "JSOL.range(") {
      $saResult = Str["sub"]($saResult,  0,  $iStartIdx) + "__JSOL_FOR__" + Str["sub"]($saResult,  $iStartIdx + 3,  Str["len"]($saResult) - $iStartIdx - 3);
			continue;
    }
    const $iParenOpen: number = $i + 10;
		const $mDataArgs: Record<string, any> = $mComp_ParseArgs($saResult, $iParenOpen);
		if ($mDataArgs["close"] === -1) {
      $saResult = Str["sub"]($saResult,  0,  $iStartIdx) + "__JSOL_FOR__" + Str["sub"]($saResult,  $iStartIdx + 3,  Str["len"]($saResult) - $iStartIdx - 3);
			continue;
    }
    let $iB: number = $mDataArgs["close"] + 1;
		while ($iB < Str["len"]($saResult) && (Str["sub"]($saResult,  $iB,  1) === " " || Str["sub"]($saResult,  $iB,  1) === "\n" || Str["sub"]($saResult,  $iB,  1) === "\t" || Str["sub"]($saResult,  $iB,  1) === "\r" || Str["sub"]($saResult,  $iB,  1) === ")")) {
      $iB = $iB + 1;
    }
    if (Str["sub"]($saResult,  $iB,  1) !== "{") {
      $saResult = Str["sub"]($saResult,  0,  $iStartIdx) + "__JSOL_FOR__" + Str["sub"]($saResult,  $iStartIdx + 3,  Str["len"]($saResult) - $iStartIdx - 3);
			continue;
    }
    const $iBraceClose: number = $iComp_FindCloseBrace($saResult, $iB);
		if ($iBraceClose === -1) {
      $saResult = Str["sub"]($saResult,  0,  $iStartIdx) + "__JSOL_FOR__" + Str["sub"]($saResult,  $iStartIdx + 3,  Str["len"]($saResult) - $iStartIdx - 3);
			continue;
    }
    const $saBody: string = Str["sub"]($saResult,  $iB + 1,  $iBraceClose - $iB - 1);
		const $aArgs: any[] = $mDataArgs["args"];
		const $saCleanVar: string = Str["sub"]($saVarName,  1,  Str["len"]($saVarName) - 1);
		const $saFromVar: string = '$JSOL_from_' + $saCleanVar;
		const $saToVar: string = '$JSOL_to_' + $saCleanVar;
		const $saStepVar: string = '$JSOL_step_' + $saCleanVar;
		const $saIncVar: string = '$JSOL_inc_' + $saCleanVar;
		const $saIxVar: string = '$JSOL_i_' + $saCleanVar;

		let $saSetup: string = "let " + $saFromVar + " = (" + $aArgs[0] + ");\nlet " + $saToVar + " = (" + $aArgs[1] + ");\n";
		if ($aArgs.length > 2 && Str["len"]($aArgs[2]) > 0) {
      $saSetup = $saSetup + "let " + $saStepVar + " = (" + $aArgs[2] + ");\n";
    }
    else {
      $saSetup = $saSetup + "let " + $saStepVar + " = 1;\n";
    }
    $saSetup = $saSetup + "let " + $saIncVar + " = Math.abs(" + $saStepVar + ");\nif (" + $saFromVar + " > " + $saToVar + ") { " + $saIncVar + " = -" + $saIncVar + "; }\nlet " + $saVarName + " = " + $saFromVar + ";\nlet " + $saIxVar + " = 1;\n";

		const $saCond: string = "((" + $saIncVar + " > 0 && " + $saVarName + " <= " + $saToVar + ") || (" + $saIncVar + " <= 0 && " + $saVarName + " >= " + $saToVar + "))";

		let $saNewBody: string = 'let $JSOL_i = ' + $saIxVar + ';\n' + $saBody + "\n" + $saVarName + " = " + $saVarName + " + " + $saIncVar + ";\n" + $saIxVar + " = " + $saIxVar + " + 1;\n";

		const $saReplace: string = "if (true) {\n" + $saSetup + "while (" + $saCond + ") {\n" + $saNewBody + "}\n}";
		$saResult = Str["sub"]($saResult,  0,  $iStartIdx) + "" + $saReplace + "" + Str["sub"]($saResult,  $iBraceClose + 1,  Str["len"]($saResult) - $iBraceClose - 1);
  }
  $saResult = Str["replace"]($saResult,  "__JSOL_FOR__",  "for");
	return $saResult;
};
