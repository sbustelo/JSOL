// @JSOL v0.2.97 - Blind Router for Function Calls (Agnostic SSOT Consumer)

const $sResolveShadowMap = function($saTemplate, $aArgs, $saMetaShadowRef) {
  let $sResult = $saTemplate;
	let $bContinue = true;

	while ($bContinue === true) {
    const $iRelIdx = Str["indexOf"]($sResult,  "{shadowMap:");
		if ($iRelIdx === -1) {
      $bContinue = false; continue;
    }
    const $iStartIdx = $iRelIdx;
		const $iEndIdx = Str["indexOf"](Str["sub"]($sResult,  $iStartIdx,  Str["len"]($sResult) - $iStartIdx),  "}") + $iStartIdx;

		if ($iEndIdx === $iStartIdx - 1) {
      $bContinue = false; continue;
    }
    const $saArgIndexStr = Str["sub"]($sResult,  $iStartIdx + 11,  $iEndIdx - ($iStartIdx + 11));
		const $iArgIdx = Cast["toInt"]($saArgIndexStr);
		const $saArgValue = $aArgs[$iArgIdx];

		let $sRoot = "";
		let $iScan = 0;
		if (Str["sub"]($saArgValue,  0,  1) === "$") {
      $iScan = 1;
			while ($iScan < Str["len"]($saArgValue)) {
        const $sC = Str["sub"]($saArgValue,  $iScan,  1);
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
      const $sClean = Str["replace"]($saArgValue,  "\"",  "");
			$sRoot = Str["replace"]($sClean,  "'",  "");
    }
    $sRoot = $sRoot.toLowerCase();
		
		const $saShadowRef = Str["replace"]($saMetaShadowRef,  "{root}",  $sRoot);

		const $saBefore = Str["sub"]($sResult,  0,  $iStartIdx);
		const $saAfter = Str["sub"]($sResult,  $iEndIdx + 1,  Str["len"]($sResult) - ($iEndIdx + 1));
		$sResult = $saBefore + "" + $saShadowRef + "" + $saAfter;
  }
  return $sResult;
};
const $fProcessCall = function ($saCode, $saKeyword, $saTemplate, $saMetaShadowRef) {
  let $saResult = $saCode;
	let $bContinue = true;
	let $iOffset = 0;

	while ($bContinue === true) {
    const $iSearchLen = Str["len"]($saResult) - $iOffset;
		if ($iSearchLen <= 0) {
      $bContinue = false; continue;
    }
    const $saSearchArea = Str["sub"]($saResult,  $iOffset,  $iSearchLen);
		const $iRelIdx = Str["indexOf"]($saSearchArea,  $saKeyword);
		if ($iRelIdx === -1) {
      $bContinue = false; continue;
    }
    const $iStartIdx = $iOffset + $iRelIdx;
		const $iOpenParen = $iStartIdx + Str["len"]($saKeyword) - 1;
		
		const $mData = $mComp_ParseArgs($saResult, $iOpenParen);
		if ($mData["close"] === -1) {
      $bContinue = false; continue;
    }
    const $saBefore = Str["sub"]($saResult,  0,  $iStartIdx);
		const $saAfter = Str["sub"]($saResult,  $mData["close"] + 1,  Str["len"]($saResult) - $mData["close"] - 1);
		const $aArgs = $mData["args"];
		
		let $saRep = $saTemplate;

		if (Str["indexOf"]($saRep,  "{shadowMap:") !== -1 && $saMetaShadowRef !== "") {
      $saRep = $sResolveShadowMap($saRep, $aArgs, $saMetaShadowRef);
    }
    if (Str["indexOf"]($saRep,  "{*}") !== -1) {
      $saRep = Str["replace"]($saRep,  "{*}",  $aArgs.join( ", "));
    }
    else {
      const $iArgsCount = $aArgs.length;
			for (let $iK = 0; $iK < $iArgsCount; $iK = $iK + 1) {
        const $saPlaceholder = Str["concat"]("{",  $iK,  "}");
				$saRep = Str["replace"]($saRep,  $saPlaceholder,  $aArgs[$iK]);
      }
    }
    $saResult = $saBefore + "" + $saRep + "" + $saAfter;
		$iOffset = $iStartIdx + 1;
  }
  return $saResult;
};
