declare var JSOL: any;
declare var Rgx: any;
declare var Str: any;
declare var Arr: any;
declare var Bool: any;
declare var Cast: any;

// @JSOL v0.2.97
const $fProcessBlock = function ($saCode: any, $saKeyword: any, $bUnwrap: any) {
  let $saResult: string = $saCode;
	let $bContinue: boolean = true;
	let $iOffset: number = 0;

	while ($bContinue === true) {
    const $iSearchLen: number = Str["len"]($saResult) - $iOffset;
		if ($iSearchLen <= 0) {
      $bContinue = false; continue;
    }
    const $saSearchArea: string = Str["sub"]($saResult,  $iOffset,  $iSearchLen);
		const $iRelIdx: number = Str["indexOf"]($saSearchArea,  $saKeyword);
		if ($iRelIdx === -1) {
      $bContinue = false; continue;
    }
    const $iStartIdx: number = $iOffset + $iRelIdx;
		const $saTail: string = Str["sub"]($saResult,  $iStartIdx,  Str["len"]($saResult) - $iStartIdx);
		const $iRelOpenBrace: number = Str["indexOf"]($saTail,  "{");
		
		if ($iRelOpenBrace === -1) {
      $bContinue = false; continue;
    }
    const $iOpenBrace: number = $iStartIdx + $iRelOpenBrace;

		const $iCloseBrace: number = $iComp_FindCloseBrace($saResult, $iOpenBrace);
		if ($iCloseBrace === -1) {
      $bContinue = false; continue;
    }
    const $iEndIdx: number = $iComp_FindStmtEnd($saResult, $iCloseBrace + 1);
		const $saBefore: string = Str["sub"]($saResult,  0,  $iStartIdx);
		const $saAfter: string = Str["sub"]($saResult,  $iEndIdx,  Str["len"]($saResult) - $iEndIdx);

		if ($bUnwrap === true) {
      const $saInner: string = Str["sub"]($saResult,  $iOpenBrace + 1,  $iCloseBrace - $iOpenBrace - 1);
			$saResult = $saBefore + "" + $saInner + "" + $saAfter;
			$iOffset = Str["len"]($saBefore) + Str["len"]($saInner);
    }
    else {
      $saResult = $saBefore + "" + $saAfter;
			$iOffset = Str["len"]($saBefore);
    }
  }
  return $saResult;
};
