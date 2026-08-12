// @JSOL v0.2.90 - Self-Hosted Compiler Lexer Module (regex-free)
const $maskSourceCode = function($sourceCode) {
    const $tokens = [];
    let $result = "";
    let $tokenIndex = 0;
    const $len = $sourceCode.length;
    let $i = 0;

    while ($i < $len) {
        const $c = $sourceCode.substring( $i, ( $i) + ( 1));

        if ($c === "\"" || $c === "'" || $c === "`") {
            const $quoteChar = $c;
            const $start = $i;
            $i = $i + 1;
            let $scanning = true;
            while ($i < $len && $scanning === true) {
                const $cc = $sourceCode.substring( $i, ( $i) + ( 1));
                if ($cc === "\\") {
                    $i = $i + 2;
                } else if ($cc === $quoteChar) {
                    $i = $i + 1;
                    $scanning = false;
                } else {
                    $i = $i + 1;
                }
            }
            const $value = $sourceCode.substring( $start, ( $start) + ( $i - $start));
            const $key = "__JSOL_STR_" + "" + $tokenIndex + "" + "__";
            $tokens.push( JSOL.dict("key", $key, "value", $value));
            $result = $result + "" + $key;
            $tokenIndex = $tokenIndex + 1;

        } else if ($c === "/" && $sourceCode.substring( $i, ( $i) + ( 2)) === "//") {
            const $start = $i;
            let $scanning = true;
            while ($i < $len && $scanning === true) {
                if ($sourceCode.substring( $i, ( $i) + ( 1)) === "\n") {
                    $scanning = false;
                } else {
                    $i = $i + 1;
                }
            }
            const $value = $sourceCode.substring( $start, ( $start) + ( $i - $start));
            const $key = "__JSOL_COM_" + "" + $tokenIndex + "" + "__";
            $tokens.push( JSOL.dict("key", $key, "value", $value));
            $result = $result + "" + $key;
            $tokenIndex = $tokenIndex + 1;

        } else if ($c === "/" && $sourceCode.substring( $i, ( $i) + ( 2)) === "/*") {
            const $start = $i;
            $i = $i + 2;
            let $scanning = true;
            while ($i < $len && $scanning === true) {
                if ($sourceCode.substring( $i, ( $i) + ( 2)) === "*/") {
                    $i = $i + 2;
                    $scanning = false;
                } else {
                    $i = $i + 1;
                }
            }
            const $value = $sourceCode.substring( $start, ( $start) + ( $i - $start));
            const $key = "__JSOL_COM_" + "" + $tokenIndex + "" + "__";
            $tokens.push( JSOL.dict("key", $key, "value", $value));
            $result = $result + "" + $key;
            $tokenIndex = $tokenIndex + 1;

        } else {
            $result = $result + "" + $c;
            $i = $i + 1;
        }
    }

    return JSOL.dict("maskedCode", $result, "tokens", $tokens);
};

const $unmaskSourceCode = function($maskedCode, $tokens) {
    let $restoredCode = $maskedCode;
    const $tokenCount = $tokens.length;
    for (let $i = 0; $i < $tokenCount; $i = $i + 1) {
        const $token = $tokens[$i];
        const $key = $token["key"];
        const $val = $token["value"];
        $restoredCode = $restoredCode.split( $key).join( $val);
    }
    return $restoredCode;
};