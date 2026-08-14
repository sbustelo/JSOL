<?php
// @JSOL v0.2.93 - Self-Hosted Compiler Lexer Module (regex-free)
$mMaskSourceCode = function($sSourceCode) {
    $aTokens = [];
    $sResult = "";
    $iTokenIndex = 0;
    $iLen = mb_strlen($sSourceCode, "UTF-8");
    $i = 0;

    while ($i < $iLen) {
        $sC = mb_substr($sSourceCode,  $i,  1, "UTF-8");

        if ($sC === "\"" || $sC === "'" || $sC === "`") {
            $sQuoteChar = $sC;
            $iStart = $i;
            $i = $i + 1;
            $bScanning = true;
            while ($i < $iLen && $bScanning === true) {
                $sCC = mb_substr($sSourceCode,  $i,  1, "UTF-8");
                if ($sCC === "\\") {
                    $i = $i + 2;
                } else if ($sCC === $sQuoteChar) {
                    $i = $i + 1;
                    $bScanning = false;
                } else {
                    $i = $i + 1;
                }
            }
            $sValue = mb_substr($sSourceCode,  $iStart,  $i - $iStart, "UTF-8");
            $sKey = "__JSOL_STR_" . "" . $iTokenIndex . "" . "__";
            $aTokens[] =  JSOL::dict("key", $sKey, "value", $sValue);
            $sResult = $sResult . "" . $sKey;
            $iTokenIndex = $iTokenIndex + 1;

        } else if ($sC === "/" && mb_substr($sSourceCode,  $i,  2, "UTF-8") === "//") {
            $iStart = $i;
            $bScanning = true;
            while ($i < $iLen && $bScanning === true) {
                if (mb_substr($sSourceCode,  $i,  1, "UTF-8") === "\n") {
                    $bScanning = false;
                } else {
                    $i = $i + 1;
                }
            }
            $sValue = mb_substr($sSourceCode,  $iStart,  $i - $iStart, "UTF-8");
            $sKey = "__JSOL_COM_" . "" . $iTokenIndex . "" . "__";
            $aTokens[] =  JSOL::dict("key", $sKey, "value", $sValue);
            $sResult = $sResult . "" . $sKey;
            $iTokenIndex = $iTokenIndex + 1;

        } else if ($sC === "/" && mb_substr($sSourceCode,  $i,  2, "UTF-8") === "/*") {
            $iStart = $i;
            $i = $i + 2;
            $bScanning = true;
            while ($i < $iLen && $bScanning === true) {
                if (mb_substr($sSourceCode,  $i,  2, "UTF-8") === "*/") {
                    $i = $i + 2;
                    $bScanning = false;
                } else {
                    $i = $i + 1;
                }
            }
            $sValue = mb_substr($sSourceCode,  $iStart,  $i - $iStart, "UTF-8");
            $sKey = "__JSOL_COM_" . "" . $iTokenIndex . "" . "__";
            $aTokens[] =  JSOL::dict("key", $sKey, "value", $sValue);
            $sResult = $sResult . "" . $sKey;
            $iTokenIndex = $iTokenIndex + 1;

        } else {
            $sResult = $sResult . "" . $sC;
            $i = $i + 1;
        }
    }

    return JSOL::dict("maskedCode", $sResult, "tokens", $aTokens);
};

$sUnmaskSourceCode = function($sMaskedCode, $aTokens) {
    $sRestoredCode = $sMaskedCode;
    $iTokenCount = count($aTokens);
    for ($i = 0; $i < $iTokenCount; $i = $i + 1) {
        $mToken = $aTokens[$i];
        $sKey = $mToken["key"];
        $sVal = $mToken["value"];
        $sRestoredCode = str_replace( $sKey,  $sVal, $sRestoredCode);
    }
    return $sRestoredCode;
};