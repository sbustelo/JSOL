declare var JSOL: any;
declare var Rgx: any;

// @JSOL v0.2.96 - CLI Arguments Parser (generic, target-agnostic)
//
// No target id is hardcoded here. Any "--<id>-target=", "--<id>-prefix=",
// "--<id>-suffix=" flag is parsed generically into $mOptions[id + "Target"/
// "Prefix"/"Suffix"], for ANY id — adding a new compiler target never
// requires touching this file again.

const $bEndsWith = function($sStr: any, $sSuffix: any): boolean {
  const $iStrLen: number = $sStr.length;
	const $iSufLen: number = $sSuffix.length;
	if ($iSufLen > $iStrLen) {
    return false;
  }
  return $sStr.substring( $iStrLen - $iSufLen, ( $iStrLen - $iSufLen) + ( $iSufLen)) === $sSuffix;
};
// The ONLY place "py" gets normalized to "python" in the whole compiler.
// "python" is canonical everywhere else (matches targets/python/rules.json,
// $mSSOT["targets"]["python"], $mBackendRegistry). "py" survives only as the
// CLI's short spelling and the output file extension (handled elsewhere).
const $sNormalizeTargetId = function($sId: any): string {
  if ($sId === "py") {
    return "python";
  }
  return $sId;
};
const $mParseRawCliArgs = function($aRawArgs: any): Record<string, any> {
  const $mOptions: Record<string, any> = JSOL.dict(
		"source",  "", 
		"sourceDir",  "", 
		"outDir",  "", 
		"target",  "", 
		"targets",  ""
	);

	const $iCount: number = $aRawArgs.length;
	for (let $i = 0; $i < $iCount; $i = $i + 1) {
    const $sArg: string = $aRawArgs[$i];
		const $bIsFlag: boolean = ($sArg.indexOf( "--") === 0);

		if ($bIsFlag === true) {
      const $sClean: string = $sArg.substring( 2, ( 2) + ( $sArg.length - 2));
			const $iEqIndex: number = $sClean.indexOf( "=");
			let $sKey: string = "";
			let $sVal: string = "";

			if ($iEqIndex !== -1) {
        $sKey = $sClean.substring( 0, ( 0) + ( $iEqIndex));
				$sVal = $sClean.substring( $iEqIndex + 1, ( $iEqIndex + 1) + ( $sClean.length - ($iEqIndex + 1)));
      }
      else {
        $sKey = $sClean;
				$sVal = "true";
      }
      if ($sKey === "source") {
        $mOptions["source"] = $sVal;
      }
      else if ($sKey === "source-dir") {
        $mOptions["sourceDir"] = $sVal;
      }
      else if ($sKey === "out-dir") {
        $mOptions["outDir"] = $sVal;
      }
      else if ($sKey === "targets") {
        $mOptions["targets"] = $sVal;
      }
      else if ($sKey === "target") {
        $mOptions["target"] = $sVal;
      }
      else if ($bEndsWith($sKey, "-target") === true) {
        const $sRawId: string = $sKey.substring( 0, ( 0) + ( $sKey.length - 7));
				const $sId: string = $sNormalizeTargetId($sRawId);
				$mOptions[$sId + "" + "Target"] = $sVal;
      }
      else if ($bEndsWith($sKey, "-prefix") === true) {
        const $sRawId: string = $sKey.substring( 0, ( 0) + ( $sKey.length - 7));
				const $sId: string = $sNormalizeTargetId($sRawId);
				$mOptions[$sId + "" + "Prefix"] = $sVal;
      }
      else if ($bEndsWith($sKey, "-suffix") === true) {
        const $sRawId: string = $sKey.substring( 0, ( 0) + ( $sKey.length - 7));
				const $sId: string = $sNormalizeTargetId($sRawId);
				$mOptions[$sId + "" + "Suffix"] = $sVal;
      }
    }
  }
  return $mOptions;
};
