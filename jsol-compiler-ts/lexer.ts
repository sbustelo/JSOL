declare var JSOL: any;
declare var Rgx: any;

// @JSOL v0.2.93 - Self-Hosted Compiler Lexer Module (regex-free)
const $mMaskSourceCode = function($sSourceCode: any): Record<string, any> {
  const $aTokens: any[] = [];
    let $sResult: string = "";
    let $iTokenIndex: number = 0;
    const $iLen: number = $sSourceCode.length;
    let $i: number = 0;

    
	while ($i < $iLen) {
    const $sC: string = $sSourceCode.substring( $i, ( $i) + ( 1));

        if ($sC === "\"" || $sC === "'" || $sC === "`") {
      const $sQuoteChar: string = $sC;
            const $iStart: number = $i;
            $i = $i + 1;
            let $bScanning: boolean = true;
            while ($i < $iLen && $bScanning === true) {
        const $sCC: string = $sSourceCode.substring( $i, ( $i) + ( 1));
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
      const $sValue: string = $sSourceCode.substring( $iStart, ( $iStart) + ( $i - $iStart));
            const $sKey: string = ["__JSOL_STR_",  $iTokenIndex,  "__"].join("");
            $aTokens.push( JSOL.dict("key",  $sKey,  "value",  $sValue));
            $sResult = $sResult + "" + $sKey;
            $iTokenIndex = $iTokenIndex + 1;
    }
    else if ($sC === "/" && $sSourceCode.substring( $i, ( $i) + ( 2)) === "//") {
      const $iStart: number = $i;
            let $bScanning: boolean = true;
            while ($i < $iLen && $bScanning === true) {
        if ($sSourceCode.substring( $i, ( $i) + ( 1)) === "\n") {
          $bScanning = false;
        }
        else {
          $i = $i + 1;
        }
      }
      const $sValue: string = $sSourceCode.substring( $iStart, ( $iStart) + ( $i - $iStart));
            const $sKey: string = ["__JSOL_COM_",  $iTokenIndex,  "__"].join("");
            $aTokens.push( JSOL.dict("key",  $sKey,  "value",  $sValue));
            $sResult = $sResult + "" + $sKey;
            $iTokenIndex = $iTokenIndex + 1;
    }
    else if ($sC === "/" && $sSourceCode.substring( $i, ( $i) + ( 2)) === "/*") {
      const $iStart: number = $i;
            $i = $i + 2;
            let $bScanning: boolean = true;
            while ($i < $iLen && $bScanning === true) {
        if ($sSourceCode.substring( $i, ( $i) + ( 2)) === "*/") {
          $i = $i + 2;
                    $bScanning = false;
        }
        else {
          $i = $i + 1;
        }
      }
      const $sValue: string = $sSourceCode.substring( $iStart, ( $iStart) + ( $i - $iStart));
            const $sKey: string = ["__JSOL_COM_",  $iTokenIndex,  "__"].join("");
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
const $sUnmaskSourceCode = function($sMaskedCode: any, $aTokens: any): string {
  let $sRestoredCode: string = $sMaskedCode;
    const $iTokenCount: number = $aTokens.length;
    for (let $i = 0; $i < $iTokenCount; $i = $i + 1) {
    const $mToken: Record<string, any> = $aTokens[$i];
        const $sKey: string = $mToken["key"];
        const $sVal: string = $mToken["value"];
        $sRestoredCode = $sRestoredCode.split( $sKey).join( $sVal);
  }
  return $sRestoredCode;
};
