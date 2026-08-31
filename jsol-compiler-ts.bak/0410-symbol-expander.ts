declare var JSOL: any;
declare var Rgx: any;
declare var Str: any;
declare var Arr: any;
declare var Bool: any;
declare var Cast: any;

// @JSOL v0.2.97 - AOT Symbol Table Expander (2/2)

const $saComp_ExpandSymbols = function($saCode: any): string {
  let $saResult: string = "";
    const $iLen: number = Str["len"]($saCode);
    let $iBraceDepth: number = 0;
    let $mSymTable: Record<string, any> = JSOL.dict(); 

    let $i: number = 0;
    while ($i < $iLen) {
    const $saCh: string = Str["sub"]($saCode,  $i,  1);
        if ($saCh === "{") {
      $iBraceDepth = $iBraceDepth + 1;
            $saResult = $saResult + $saCh;
            $i = $i + 1;
    }
    else if ($saCh === "}") {
      $mSymTable[Cast["toStr"]($iBraceDepth)] = null;
            $iBraceDepth = $iBraceDepth - 1;
            $saResult = $saResult + $saCh;
            $i = $i + 1;
    }
    else if ($saCh === "$") {
      let $iJ: number = $i + 1;
            while ($iJ < $iLen && $bComp_IsWordChar(Str["sub"]($saCode,  $iJ,  1))) {
        $iJ = $iJ + 1;
      }
      const $saVarName: string = Str["sub"]($saCode,  $i,  $iJ - $i);

            if (Str["indexOf"]($saVarName,  '$_') === 0 || Str["indexOf"]($saVarName,  '$JSOL_') === 0) {
        $saResult = $saResult + $saVarName;
                $i = $iJ;
                continue;
      }
      let $saPrefix: string = "";
            let $iK: number = 1;
            const $iVarLen: number = Str["len"]($saVarName);
            while ($iK < $iVarLen) {
        const $iCode: number = Str["char"]($saVarName,  $iK);
                if ($iCode >= 97 && $iCode <= 122) {
          $saPrefix = $saPrefix + Str["fromChar"]($iCode);
                    $iK = $iK + 1;
        }
        else {
          break;
        }
      }
      let $bIsDeclaration: boolean = false;
            let $saRoot: string = "";

            if (Str["len"]($saPrefix) > 0 && $iVarLen > Str["len"]($saPrefix) + 1) {
        const $saDelim: string = Str["sub"]($saVarName,  Str["len"]($saPrefix) + 1,  1);
                const $iNextCode: number = Str["char"]($saVarName,  Str["len"]($saPrefix) + 1);
                const $bIsUpper: boolean = ($iNextCode >= 65 && $iNextCode <= 90);

                if ($saDelim === "_" || $bIsUpper === true) {
          $bIsDeclaration = true;
                    let $iOffset: number = 0;
                    if ($saDelim === "_") {
            $iOffset = 1;
          }
          $saRoot = Str["sub"]($saVarName,  $iK + $iOffset,  $iVarLen).toLowerCase();
        }
      }
      if ($bIsDeclaration === true) {
        const $saDepthKey: string = Cast["toStr"]($iBraceDepth);
                if (Object.prototype.hasOwnProperty.call($mSymTable,  $saDepthKey) === false || $mSymTable[$saDepthKey] === null) {
          $mSymTable[$saDepthKey] = JSOL.dict();
        }
        $mSymTable[$saDepthKey][$saRoot] = $saVarName;
                $saResult = $saResult + $saVarName;
      }
      else {
        const $saQueryRoot: string = Str["sub"]($saVarName,  1,  $iVarLen - 1).toLowerCase();
                let $saCanonical: string = $saVarName;
                
                // CORRECCIÓN: variable de bucle $iD en lugar de la prohibida $d
                for (let $iD = $iBraceDepth; $iD >= 0; $iD = $iD - 1) {
          const $saDKey: string = Cast["toStr"]($iD);
                    if (Object.prototype.hasOwnProperty.call($mSymTable,  $saDKey) && $mSymTable[$saDKey] !== null && Object.prototype.hasOwnProperty.call($mSymTable[$saDKey],  $saQueryRoot)) {
            $saCanonical = $mSymTable[$saDKey][$saQueryRoot];
                        break;
          }
        }
        $saResult = $saResult + $saCanonical;
      }
      $i = $iJ;
    }
    else {
      $saResult = $saResult + $saCh;
            $i = $i + 1;
    }
  }
  return $saResult;
};
