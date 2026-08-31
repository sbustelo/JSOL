declare var JSOL: any;
declare var Rgx: any;
declare var Str: any;
declare var Arr: any;
declare var Bool: any;
declare var Cast: any;

// @JSOL v0.2.97
const $fProcessParams = function ($saCode: any) {
  let $saResult: string = $saCode;
	let $bContinue: boolean = true;
	let $iOffset: number = 0;

	while ($bContinue === true) {
    const $iSearchLen: number = Str["len"]($saResult) - $iOffset;
		if ($iSearchLen <= 0) {
      $bContinue = false; continue;
    }
    const $saSearchArea: string = Str["sub"]($saResult,  $iOffset,  $iSearchLen);
		const $iRelIdx: number = Str["indexOf"]($saSearchArea,  "function");
		if ($iRelIdx === -1) {
      $bContinue = false; continue;
    }
    const $iStartIdx: number = $iOffset + $iRelIdx;
		let $iParenScan: number = $iStartIdx + 8;
		const $iRLen: number = Str["len"]($saResult);

		while ($iParenScan < $iRLen && (Str["sub"]($saResult,  $iParenScan,  1) === " " || Str["sub"]($saResult,  $iParenScan,  1) === "\t" || Str["sub"]($saResult,  $iParenScan,  1) === "\n" || Str["sub"]($saResult,  $iParenScan,  1) === "\r")) {
      $iParenScan = $iParenScan + 1;
    }
    if ($iParenScan >= $iRLen || Str["sub"]($saResult,  $iParenScan,  1) !== "(") {
      $iOffset = $iStartIdx + 8;
			continue;
    }
    const $iCloseParen: number = $iComp_FindCloseParen($saResult, $iParenScan);
		if ($iCloseParen === -1) {
      $bContinue = false; continue;
    }
    const $saRawParams: string = Str["sub"]($saResult,  $iParenScan + 1,  $iCloseParen - $iParenScan - 1);
		const $saTrimmedParams: string = $saRawParams.trim();
		let $saTypedParams: string = "";

		if (Str["len"]($saTrimmedParams) > 0) {
      const $aParts: any[] = Str["split"]($saTrimmedParams,  ",");
			const $iPartsCount: number = $aParts.length;
			let $aTypedParts: any[] = [];
			for (let $iP = 0; $iP < $iPartsCount; $iP = $iP + 1) {
        const $saRawPart: string = $aParts[$iP].trim();
				let $saTypedPart: string = $saRawPart;
				if (Str["len"]($saRawPart) > 0 && Str["indexOf"]($saRawPart,  ":") === -1) {
          $saTypedPart = $saRawPart + ": any";
        }
        $aTypedParts.push( $saTypedPart);
      }
      $saTypedParams = $aTypedParts.join( ", ");
    }
    const $saBefore: string = Str["sub"]($saResult,  0,  $iParenScan + 1);
		const $saAfter: string = Str["sub"]($saResult,  $iCloseParen,  Str["len"]($saResult) - $iCloseParen);

		$saResult = $saBefore + "" + $saTypedParams + "" + $saAfter;
		$iOffset = $iParenScan + 1 + Str["len"]($saTypedParams) + 1;
  }
  return $saResult;
};
