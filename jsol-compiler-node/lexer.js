// @JSOL v0.2.93 - Self-Hosted Compiler Lexer Module (regex-free)
const $mMaskSourceCode = function($sSourceCode) {
  const $aTokens = [];
    let $sResult = "";
    let $iTokenIndex = 0;
    const $iLen = $sSourceCode.length;
    let $i = 0;

    
	while ($i < $iLen) {
    const $sC = $sSourceCode.substring( $i, ( $i) + ( 1));

        if ($sC === "\"" || $sC === "'" || $sC === "`") {
      const $sQuoteChar = $sC;
            const $iStart = $i;
            $i = $i + 1;
            let $bScanning = true;
            while ($i < $iLen && $bScanning === true) {
        const $sCC = $sSourceCode.substring( $i, ( $i) + ( 1));
                if ($sCC === "\\") {
          $i = $i + 2;
        }
        else if ($sCC === $sQuoteChar) {
          $i = $i + 1;
                    $bScanning = false;
        }
        else {
          $i = $i + 1;
        }
      }
      const $sValue = $sSourceCode.substring( $iStart, ( $iStart) + ( $i - $iStart));
            const $sKey = ["__JSOL_STR_",  $iTokenIndex,  "__"].join("");
            $aTokens.push( JSOL.dict("key",  $sKey,  "value",  $sValue));
            $sResult = $sResult + "" + $sKey;
            $iTokenIndex = $iTokenIndex + 1;
    }
    else if ($sC === "/" && $sSourceCode.substring( $i, ( $i) + ( 2)) === "//") {
      const $iStart = $i;
            let $bScanning = true;
            while ($i < $iLen && $bScanning === true) {
        if ($sSourceCode.substring( $i, ( $i) + ( 1)) === "\n") {
          $bScanning = false;
        }
        else {
          $i = $i + 1;
        }
      }
      const $sValue = $sSourceCode.substring( $iStart, ( $iStart) + ( $i - $iStart));
            const $sKey = ["__JSOL_COM_",  $iTokenIndex,  "__"].join("");
            $aTokens.push( JSOL.dict("key",  $sKey,  "value",  $sValue));
            $sResult = $sResult + "" + $sKey;
            $iTokenIndex = $iTokenIndex + 1;
    }
    else if ($sC === "/" && $sSourceCode.substring( $i, ( $i) + ( 2)) === "/*") {
      const $iStart = $i;
            $i = $i + 2;
            let $bScanning = true;
            while ($i < $iLen && $bScanning === true) {
        if ($sSourceCode.substring( $i, ( $i) + ( 2)) === "*/") {
          $i = $i + 2;
                    $bScanning = false;
        }
        else {
          $i = $i + 1;
        }
      }
      const $sValue = $sSourceCode.substring( $iStart, ( $iStart) + ( $i - $iStart));
            const $sKey = ["__JSOL_COM_",  $iTokenIndex,  "__"].join("");
            $aTokens.push( JSOL.dict("key",  $sKey,  "value",  $sValue));
            $sResult = $sResult + "" + $sKey;
            $iTokenIndex = $iTokenIndex + 1;
    }
    else {
      $sResult = $sResult + "" + $sC;
            $i = $i + 1;
    }
  }
  return JSOL.dict("maskedCode",  $sResult,  "tokens",  $aTokens);
};
const $sUnmaskSourceCode = function($sMaskedCode, $aTokens) {
  let $sRestoredCode = $sMaskedCode;
    const $iTokenCount = $aTokens.length;
    for (let $i = 0; $i < $iTokenCount; $i = $i + 1) {
    const $mToken = $aTokens[$i];
        const $sKey = $mToken["key"];
        const $sVal = $mToken["value"];
        $sRestoredCode = $sRestoredCode.split( $sKey).join( $sVal);
  }
  return $sRestoredCode;
};
