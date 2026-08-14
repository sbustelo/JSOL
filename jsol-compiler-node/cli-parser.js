// @JSOL v0.2.93 - CLI Arguments Parser
const $mParseRawCliArgs = function($aRawArgs) {
    const $mOptions = JSOL.dict("source", "", "outDir", "", "target", "", "jsTarget", "", "jsPrefix", "", "jsSuffix", "", "phpTarget", "", "phpPrefix", "", "phpSuffix", "");
    const $iCount = $aRawArgs.length;
    for (let $i = 0; $i < $iCount; $i = $i + 1) {
        const $sArg = $aRawArgs[$i];
        let $bIsFlag = false;
         $bIsFlag = $sArg.indexOf("--") === 0; if ($bIsFlag === true) {
            let $sKey = ""; let $sVal = "";
            
                const $sClean = $sArg.substring(2);
                const $iEqIndex = $sClean.indexOf("=");
                if ($iEqIndex !== -1) { $sKey = $sClean.substring(0, $iEqIndex); $sVal = $sClean.substring($iEqIndex + 1); } else { $sKey = $sClean; $sVal = "true"; }
            if ($sKey === "source") { $mOptions["source"] = $sVal; }
            if ($sKey === "out-dir") { $mOptions["outDir"] = $sVal; }
            if ($sKey === "target") { $mOptions["target"] = $sVal; $mOptions["jsTarget"] = $sVal; $mOptions["phpTarget"] = $sVal; }
            if ($sKey === "js-target") { $mOptions["jsTarget"] = $sVal; }
            if ($sKey === "js-prefix") { $mOptions["jsPrefix"] = $sVal; }
            if ($sKey === "js-suffix") { $mOptions["jsSuffix"] = $sVal; }
            if ($sKey === "php-target") { $mOptions["phpTarget"] = $sVal; }
            if ($sKey === "php-prefix") { $mOptions["phpPrefix"] = $sVal; }
            if ($sKey === "php-suffix") { $mOptions["phpSuffix"] = $sVal; }
        }
    }
    return $mOptions;
};