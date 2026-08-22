<?php
// @JSOL v0.2.95 - CLI Arguments Parser
$mParseRawCliArgs = function($aRawArgs) {
  $mOptions = JSOL::dict(
        "source",  "", 
        "outDir",  "", 
        "target",  "", 
        "jsTarget",  "", 
        "jsPrefix",  "", 
        "jsSuffix",  "", 
        "phpTarget",  "", 
        "phpPrefix",  "", 
        "phpSuffix",  "", 
        "tsTarget",  "", 
        "tsPrefix",  "", 
        "tsSuffix",  "", 
        "pyTarget",  "", 
        "pyPrefix",  "", 
        "pySuffix",  "", 
        "targets",  ""
    );

    $iCount = count($aRawArgs);
    for ($i = 0; $i < $iCount; $i = $i + 1) {
    $sArg = $aRawArgs[$i];
        $bIsFlag = (JSOL::strIndexOf($sArg,  "--") === 0);

        if ($bIsFlag === true) {
      $sClean = mb_substr($sArg,  2,  mb_strlen($sArg, "UTF-8") - 2, "UTF-8");
            $iEqIndex = JSOL::strIndexOf($sClean,  "=");
            $sKey = "";
            $sVal = "";

            if ($iEqIndex !== -1) {
        $sKey = mb_substr($sClean,  0,  $iEqIndex, "UTF-8");
                $sVal = mb_substr($sClean,  $iEqIndex + 1,  mb_strlen($sClean, "UTF-8") - ($iEqIndex + 1), "UTF-8");
      }
      else {
        $sKey = $sClean;
                $sVal = "true";
      }
      if ($sKey === "source") {
        $mOptions["source"] = $sVal;
      }
      if ($sKey === "out-dir") {
        $mOptions["outDir"] = $sVal;
      }
      if ($sKey === "targets") {
        $mOptions["targets"] = $sVal;
      }
      if ($sKey === "target") {
        $mOptions["target"] = $sVal;
                $mOptions["jsTarget"] = $sVal;
                $mOptions["phpTarget"] = $sVal;
                $mOptions["tsTarget"] = $sVal;
                $mOptions["pyTarget"] = $sVal;
      }
      if ($sKey === "js-target") {
        $mOptions["jsTarget"] = $sVal;
      }
      if ($sKey === "js-prefix") {
        $mOptions["jsPrefix"] = $sVal;
      }
      if ($sKey === "js-suffix") {
        $mOptions["jsSuffix"] = $sVal;
      }
      if ($sKey === "php-target") {
        $mOptions["phpTarget"] = $sVal;
      }
      if ($sKey === "php-prefix") {
        $mOptions["phpPrefix"] = $sVal;
      }
      if ($sKey === "php-suffix") {
        $mOptions["phpSuffix"] = $sVal;
      }
      if ($sKey === "ts-target") {
        $mOptions["tsTarget"] = $sVal;
      }
      if ($sKey === "ts-prefix") {
        $mOptions["tsPrefix"] = $sVal;
      }
      if ($sKey === "ts-suffix") {
        $mOptions["tsSuffix"] = $sVal;
      }
      if ($sKey === "py-target") {
        $mOptions["pyTarget"] = $sVal;
      }
      if ($sKey === "py-prefix") {
        $mOptions["pyPrefix"] = $sVal;
      }
      if ($sKey === "py-suffix") {
        $mOptions["pySuffix"] = $sVal;
      }
    }
  }
  return $mOptions;
};
