<?php
// @JSOL v0.2.93 - CLI Arguments Parser
$mParseRawCliArgs = function($aRawArgs) {
    $mOptions = JSOL::dict("source", "", "outDir", "", "target", "", "jsTarget", "", "jsPrefix", "", "jsSuffix", "", "phpTarget", "", "phpPrefix", "", "phpSuffix", "");
    $iCount = count($aRawArgs);
    for ($i = 0; $i < $iCount; $i = $i + 1) {
        $sArg = $aRawArgs[$i];
        $bIsFlag = false;
         $bIsFlag = strpos($sArg, "--") === 0; if ($bIsFlag === true) {
            $sKey = ""; $sVal = "";
            
                $sClean = substr($sArg, 2);
                $iEqIndex = strpos($sClean, "=");
                if ($iEqIndex !== false) { $sKey = substr($sClean, 0, $iEqIndex); $sVal = substr($sClean, $iEqIndex + 1); } else { $sKey = $sClean; $sVal = "true"; }
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