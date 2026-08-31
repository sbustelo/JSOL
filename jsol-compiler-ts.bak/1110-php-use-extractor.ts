declare var JSOL: any;
declare var Rgx: any;
declare var Str: any;
declare var Arr: any;
declare var Bool: any;
declare var Cast: any;

// @JSOL v0.2.97 - PHP Use Clause Extractor (Flat Cyclomatic Complexity)
const $bPhp_IsIdentChar = function($saCh: any): boolean {
  if ($saCh === "$") {
    return true;
  }
  if ($saCh >= "a" && $saCh <= "z") {
    return true;
  }
  if ($saCh >= "A" && $saCh <= "Z") {
    return true;
  }
  if ($saCh >= "0" && $saCh <= "9") {
    return true;
  }
  return false;
};
const $mPhp_ReadWord = function($saCode: any, $iStart: any): Record<string, any> {
  const $iLen: number = Str["len"]($saCode);
	let $i: number = $iStart;
	while ($i < $iLen && $bPhp_IsIdentChar(Str["sub"]($saCode,  $i,  1))) {
    $i = $i + 1;
  }
  return JSOL.dict("word",  Str["sub"]($saCode,  $iStart,  $i - $iStart),  "end",  $i);
};
const $aPhp_ExtractVars = function($saText: any): any[] {
  let $aVars: any[] = [];
	let $i: number = 0;
	const $iLen: number = Str["len"]($saText);
	while ($i < $iLen) {
    if (Str["sub"]($saText,  $i,  1) === "$") {
      const $mWord: Record<string, any> = $mPhp_ReadWord($saText, $i);
			if ($mWord["word"] !== '$_') {
        $aVars.push( $mWord["word"]);
      }
      $i = $mWord["end"];
    }
    else {
      $i = $i + 1;
    }
  }
  return $aVars;
};
const $aPhp_ExtractLocals = function($saBody: any): any[] {
  let $aLocals: any[] = [];
	let $i: number = 0;
	const $iLen: number = Str["len"]($saBody);
	
	while ($i < $iLen) {
    const $bIsFunc: boolean = Str["sub"]($saBody,  $i,  8) === "function";
		if ($bIsFunc === true && !$bPhp_IsIdentChar(Str["sub"]($saBody,  $i + 8,  1))) {
      let $iParen: number = $i + 8;
			while ($iParen < $iLen && Str["sub"]($saBody,  $iParen,  1) !== "(") {
        $iParen = $iParen + 1;
      }
      if ($iParen < $iLen) {
        const $iPClose: number = $iComp_FindCloseParen($saBody, $iParen);
				if ($iPClose !== -1) {
          const $saInnerParams: string = Str["sub"]($saBody,  $iParen + 1,  $iPClose - $iParen - 1);
					const $aInnerVars: any[] = $aPhp_ExtractVars($saInnerParams);
					const $iICount: number = $aInnerVars.length;
					for (let $iK = 0; $iK < $iICount; $iK = $iK + 1) {
            $aLocals.push( $aInnerVars[$iK]);
          }
        }
      }
      $i = $i + 8; continue;
    }
    let $bIsDecl: boolean = false;
		let $iAfterDecl: number = $i;
		if (Str["sub"]($saBody,  $i,  6) === "const ") {
      $bIsDecl = true; $iAfterDecl = $i + 6;
    }
    else if (Str["sub"]($saBody,  $i,  4) === "let ") {
      $bIsDecl = true; $iAfterDecl = $i + 4;
    }
    if ($bIsDecl === true) {
      while ($iAfterDecl < $iLen && (Str["sub"]($saBody,  $iAfterDecl,  1) === " " || Str["sub"]($saBody,  $iAfterDecl,  1) === "\n" || Str["sub"]($saBody,  $iAfterDecl,  1) === "\r" || Str["sub"]($saBody,  $iAfterDecl,  1) === "\t")) {
        $iAfterDecl = $iAfterDecl + 1;
      }
      if (Str["sub"]($saBody,  $iAfterDecl,  1) === "$") {
        const $mWord: Record<string, any> = $mPhp_ReadWord($saBody, $iAfterDecl);
				$aLocals.push( $mWord["word"]);
      }
      $i = $iAfterDecl; continue;
    }
    $i = $i + 1;
  }
  return $aLocals;
};
const $mPhp_AnalyzeClosure = function($saCode: any, $iFuncStart: any): Record<string, any> {
  let $iParenOpen: number = $iFuncStart + 8;
	const $iLen: number = Str["len"]($saCode);
	while ($iParenOpen < $iLen && Str["sub"]($saCode,  $iParenOpen,  1) !== "(" && Str["sub"]($saCode,  $iParenOpen,  1) !== "{") {
    $iParenOpen = $iParenOpen + 1;
  }
  if ($iParenOpen >= $iLen || Str["sub"]($saCode,  $iParenOpen,  1) !== "(") {
    return JSOL.dict("valid",  false);
  }
  const $iParenClose: number = $iComp_FindCloseParen($saCode, $iParenOpen);
	if ($iParenClose === -1) {
    return JSOL.dict("valid",  false);
  }
  let $iBraceOpen: number = $iParenClose + 1;
	while ($iBraceOpen < $iLen && Str["sub"]($saCode,  $iBraceOpen,  1) !== "{" && Str["sub"]($saCode,  $iBraceOpen,  1) !== "(") {
    $iBraceOpen = $iBraceOpen + 1;
  }
  if ($iBraceOpen >= $iLen || Str["sub"]($saCode,  $iBraceOpen,  1) !== "{") {
    return JSOL.dict("valid",  false);
  }
  const $iBraceClose: number = $iComp_FindCloseBrace($saCode, $iBraceOpen);
	if ($iBraceClose === -1) {
    return JSOL.dict("valid",  false);
  }
  const $saParamsStr: string = Str["sub"]($saCode,  $iParenOpen + 1,  $iParenClose - $iParenOpen - 1);
	const $saBody: string = Str["sub"]($saCode,  $iParenOpen + 1,  $iBraceClose - $iParenOpen - 1);

	if (Str["indexOf"]($saBody,  "JSOL.use") !== -1) {
    return JSOL.dict("valid",  false);
  }
  const $aParams: any[] = $aPhp_ExtractVars($saParamsStr);
	const $aAllVars: any[] = $aPhp_ExtractVars($saBody);
	const $aLocals: any[] = $aPhp_ExtractLocals($saBody);

	let $aFree: any[] = [];
	const $iAllCount: number = $aAllVars.length;
	for (let $iV = 0; $iV < $iAllCount; $iV = $iV + 1) {
    const $saVar: string = $aAllVars[$iV];
		if (Arr["indexOf"]($aParams,  $saVar) === -1 && Arr["indexOf"]($aLocals,  $saVar) === -1 && Arr["indexOf"]($aFree,  $saVar) === -1) {
      $aFree.push( $saVar);
    }
  }
  return JSOL.dict("valid",  true,  "free",  $aFree,  "parenClose",  $iParenClose);
};
const $saExtractPHPUse = function($saCode: any): string {
  let $saResult: string = $saCode;
	let $iFunc: number = Str["len"]($saResult) - 8;

	while ($iFunc >= 0) {
    if (Str["sub"]($saResult,  $iFunc,  8) !== "function") {
      $iFunc = $iFunc - 1; continue;
    }
    const $bPrev: boolean = $iFunc === 0 || !$bPhp_IsIdentChar(Str["sub"]($saResult,  $iFunc - 1,  1));
		const $bNext: boolean = $iFunc + 8 === Str["len"]($saResult) || !$bPhp_IsIdentChar(Str["sub"]($saResult,  $iFunc + 8,  1));
		if (!$bPrev || !$bNext) {
      $iFunc = $iFunc - 1; continue;
    }
    const $mAnalysis: Record<string, any> = $mPhp_AnalyzeClosure($saResult, $iFunc);
		if ($mAnalysis["valid"] === true) {
      const $aFree: any[] = $mAnalysis["free"];
			if ($aFree.length > 0) {
        let $aRefFree: any[] = [];
				const $iFreeCount: number = $aFree.length;
				for (let $iF = 0; $iF < $iFreeCount; $iF = $iF + 1) {
          $aRefFree.push( "&$" + Str["sub"]($aFree[$iF],  1,  Str["len"]($aFree[$iF]) - 1));
        }
        const $saUseClause: string = " use (" + $aRefFree.join( ", ") + ")";
				const $iParenClose: number = $mAnalysis["parenClose"];
				const $saBefore: string = Str["sub"]($saResult,  0,  $iParenClose + 1);
				const $saAfter: string = Str["sub"]($saResult,  $iParenClose + 1,  Str["len"]($saResult) - ($iParenClose + 1));
				$saResult = $saBefore + "" + $saUseClause + "" + $saAfter;
      }
    }
    $iFunc = $iFunc - 1;
  }
  return $saResult;
};
