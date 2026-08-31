declare var JSOL: any;
declare var Rgx: any;
declare var Str: any;
declare var Arr: any;
declare var Bool: any;
declare var Cast: any;

// @JSOL v0.2.97 - Blind Router for Function Calls (Agnostic SSOT Consumer)

const $sResolveShadowMap = function($saTemplate: any, $aArgs: any, $saMetaShadowRef: any): string {
  let $sResult: string = $saTemplate;
	let $bContinue: boolean = true;

	while ($bContinue === true) {
    const $iRelIdx: number = Str["indexOf"]($sResult,  "{shadowMap:");
		if ($iRelIdx === -1) {
      $bContinue = false; continue;
    }
    const $iStartIdx: number = $iRelIdx;
		const $iEndIdx: number = Str["indexOf"](Str["sub"]($sResult,  $iStartIdx,  Str["len"]($sResult) - $iStartIdx),  "}") + $iStartIdx;

		if ($iEndIdx === $iStartIdx - 1) {
      $bContinue = false; continue;
    }
    const $saArgIndexStr: string = Str["sub"]($sResult,  $iStartIdx + 11,  $iEndIdx - ($iStartIdx + 11));
		const $iArgIdx: number = Cast["toInt"]($saArgIndexStr);
		const $saArgValue: string = $aArgs[$iArgIdx];

		let $sRoot: string = "";
		let $iScan: number = 0;
		if (Str["sub"]($saArgValue,  0,  1) === "$") {
      $iScan = 1;
			while ($iScan < Str["len"]($saArgValue)) {
        const $sC: string = Str["sub"]($saArgValue,  $iScan,  1);
				if ($sC === "_") {
          $iScan = $iScan + 1;
					break;
        }
        if ($sC >= "A" && $sC <= "Z") {
          break;
        }
        $iScan = $iScan + 1;
      }
      $sRoot = Str["sub"]($saArgValue,  $iScan,  Str["len"]($saArgValue) - $iScan);
    }
    else {
      const $sClean: string = Str["replace"]($saArgValue,  "\"",  "");
			$sRoot = Str["replace"]($sClean,  "'",  "");
    }
    $sRoot = $sRoot.toLowerCase();
		
		const $saShadowRef: string = Str["replace"]($saMetaShadowRef,  "{root}",  $sRoot);

		const $saBefore: string = Str["sub"]($sResult,  0,  $iStartIdx);
		const $saAfter: string = Str["sub"]($sResult,  $iEndIdx + 1,  Str["len"]($sResult) - ($iEndIdx + 1));
		$sResult = $saBefore + "" + $saShadowRef + "" + $saAfter;
  }
  return $sResult;
};
const $fProcessCall = function ($saCode: any, $saKeyword: any, $saTemplate: any, $saMetaShadowRef: any) {
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
		const $iOpenParen: number = $iStartIdx + Str["len"]($saKeyword) - 1;
		
		const $mData: Record<string, any> = $mComp_ParseArgs($saResult, $iOpenParen);
		if ($mData["close"] === -1) {
      $bContinue = false; continue;
    }
    const $saBefore: string = Str["sub"]($saResult,  0,  $iStartIdx);
		const $saAfter: string = Str["sub"]($saResult,  $mData["close"] + 1,  Str["len"]($saResult) - $mData["close"] - 1);
		const $aArgs: any[] = $mData["args"];
		
		let $saRep: string = $saTemplate;

		if (Str["indexOf"]($saRep,  "{shadowMap:") !== -1 && $saMetaShadowRef !== "") {
      $saRep = $sResolveShadowMap($saRep, $aArgs, $saMetaShadowRef);
    }
    if (Str["indexOf"]($saRep,  "{*}") !== -1) {
      $saRep = Str["replace"]($saRep,  "{*}",  $aArgs.join( ", "));
    }
    else {
      const $iArgsCount: number = $aArgs.length;
			for (let $iK = 0; $iK < $iArgsCount; $iK = $iK + 1) {
        const $saPlaceholder: string = Str["concat"]("{",  $iK,  "}");
				$saRep = Str["replace"]($saRep,  $saPlaceholder,  $aArgs[$iK]);
      }
    }
    $saResult = $saBefore + "" + $saRep + "" + $saAfter;
		$iOffset = $iStartIdx + 1;
  }
  return $saResult;
};
