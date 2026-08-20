declare var JSOL: any;
declare var Rgx: any;

// @JSOL v0.2.94 - CLI Arguments Parser
const $mParseRawCliArgs = function($aRawArgs: any): Record<string, any> {
    const $mOptions: Record<string, any> = JSOL.dict("source",  "",  "outDir",  "",  "target",  "",  "jsTarget",  "",  "jsPrefix",  "",  "jsSuffix",  "",  "phpTarget",  "",  "phpPrefix",  "",  "phpSuffix",  "",  "tsTarget",  "",  "tsPrefix",  "",  "tsSuffix",  "",  "targets",  "");
    const $iCount: number = $aRawArgs.length;
    for (let $i = 0; $i < $iCount; $i = $i + 1) {
        const $sArg: string = $aRawArgs[$i];
        let $bIsFlag: boolean = false;
         $bIsFlag = $sArg.indexOf("--") === 0; if ($bIsFlag === true) {
            let $sKey: string = ""; let $sVal: string = "";
            
                const $sClean: string = $sArg.substring(2);
                const $iEqIndex: number = $sClean.indexOf("=");
                if ($iEqIndex !== -1) { $sKey = $sClean.substring(0, $iEqIndex); $sVal = $sClean.substring($iEqIndex + 1); } else { $sKey = $sClean; $sVal = "true"; }
            if ($sKey === "source") { $mOptions["source"] = $sVal; }
            if ($sKey === "out-dir") { $mOptions["outDir"] = $sVal; }
            if ($sKey === "targets") { $mOptions["targets"] = $sVal; }
            if ($sKey === "target") { $mOptions["target"] = $sVal; $mOptions["jsTarget"] = $sVal; $mOptions["phpTarget"] = $sVal; $mOptions["tsTarget"] = $sVal; }
            if ($sKey === "js-target") { $mOptions["jsTarget"] = $sVal; }
            if ($sKey === "js-prefix") { $mOptions["jsPrefix"] = $sVal; }
            if ($sKey === "js-suffix") { $mOptions["jsSuffix"] = $sVal; }
            if ($sKey === "php-target") { $mOptions["phpTarget"] = $sVal; }
            if ($sKey === "php-prefix") { $mOptions["phpPrefix"] = $sVal; }
            if ($sKey === "php-suffix") { $mOptions["phpSuffix"] = $sVal; }
            if ($sKey === "ts-target") { $mOptions["tsTarget"] = $sVal; }
            if ($sKey === "ts-prefix") { $mOptions["tsPrefix"] = $sVal; }
            if ($sKey === "ts-suffix") { $mOptions["tsSuffix"] = $sVal; }
        }
    }
    return $mOptions;
};