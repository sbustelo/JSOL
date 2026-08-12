<?php
// @JSOL v0.2.90 - Self-Hosted Compiler Lexer Module (regex-free)
$maskSourceCode = function($sourceCode) {
    $tokens = [];
    $result = "";
    $tokenIndex = 0;
    $len = mb_strlen($sourceCode, "UTF-8");
    $i = 0;

    while ($i < $len) {
        $c = mb_substr($sourceCode,  $i,  1, "UTF-8");

        if ($c === "\"" || $c === "'" || $c === "`") {
            $quoteChar = $c;
            $start = $i;
            $i = $i + 1;
            $scanning = true;
            while ($i < $len && $scanning === true) {
                $cc = mb_substr($sourceCode,  $i,  1, "UTF-8");
                if ($cc === "\\") {
                    $i = $i + 2;
                } else if ($cc === $quoteChar) {
                    $i = $i + 1;
                    $scanning = false;
                } else {
                    $i = $i + 1;
                }
            }
            $value = mb_substr($sourceCode,  $start,  $i - $start, "UTF-8");
            $key = "__JSOL_STR_" . "" . $tokenIndex . "" . "__";
            $tokens[] =  JSOL::dict("key", $key, "value", $value);
            $result = $result . "" . $key;
            $tokenIndex = $tokenIndex + 1;

        } else if ($c === "/" && mb_substr($sourceCode,  $i,  2, "UTF-8") === "//") {
            $start = $i;
            $scanning = true;
            while ($i < $len && $scanning === true) {
                if (mb_substr($sourceCode,  $i,  1, "UTF-8") === "\n") {
                    $scanning = false;
                } else {
                    $i = $i + 1;
                }
            }
            $value = mb_substr($sourceCode,  $start,  $i - $start, "UTF-8");
            $key = "__JSOL_COM_" . "" . $tokenIndex . "" . "__";
            $tokens[] =  JSOL::dict("key", $key, "value", $value);
            $result = $result . "" . $key;
            $tokenIndex = $tokenIndex + 1;

        } else if ($c === "/" && mb_substr($sourceCode,  $i,  2, "UTF-8") === "/*") {
            $start = $i;
            $i = $i + 2;
            $scanning = true;
            while ($i < $len && $scanning === true) {
                if (mb_substr($sourceCode,  $i,  2, "UTF-8") === "*/") {
                    $i = $i + 2;
                    $scanning = false;
                } else {
                    $i = $i + 1;
                }
            }
            $value = mb_substr($sourceCode,  $start,  $i - $start, "UTF-8");
            $key = "__JSOL_COM_" . "" . $tokenIndex . "" . "__";
            $tokens[] =  JSOL::dict("key", $key, "value", $value);
            $result = $result . "" . $key;
            $tokenIndex = $tokenIndex + 1;

        } else {
            $result = $result . "" . $c;
            $i = $i + 1;
        }
    }

    return JSOL::dict("maskedCode", $result, "tokens", $tokens);
};

$unmaskSourceCode = function($maskedCode, $tokens) {
    $restoredCode = $maskedCode;
    $tokenCount = count($tokens);
    for ($i = 0; $i < $tokenCount; $i = $i + 1) {
        $token = $tokens[$i];
        $key = $token["key"];
        $val = $token["value"];
        $restoredCode = str_replace( $key,  $val, $restoredCode);
    }
    return $restoredCode;
};