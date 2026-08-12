<?php
// @JSOL v0.2.90 - Self-Hosted Compiler Linter Module (regex-free)
$isWordChar = function($ch) {
    if ($ch === "") { return false; }
    $code = mb_ord(mb_substr($ch,  0, 1, "UTF-8"));
    if ($code >= 48 && $code <= 57) { return true; }
    if ($code >= 65 && $code <= 90) { return true; }
    if ($code >= 97 && $code <= 122) { return true; }
    if ($code === 95) { return true; }
    return false;
};

$auditPragma = function($sourceCode) {
    $errors = [];
    $hasPragma = false;
    $len = mb_strlen($sourceCode, "UTF-8");

    $i = 0;
    $skipping = true;
    while ($i < $len && $skipping === true) {
        $c = mb_substr($sourceCode,  $i,  1, "UTF-8");
        if ($c === " " || $c === "\t" || $c === "\n" || $c === "\r") {
            $i = $i + 1;
        } else {
            $skipping = false;
        }
    }

    if (mb_substr($sourceCode,  $i,  2, "UTF-8") === "//") {
        $lineEnd = $i;
        $scanning = true;
        while ($lineEnd < $len && $scanning === true) {
            if (mb_substr($sourceCode,  $lineEnd,  1, "UTF-8") === "\n") {
                $scanning = false;
            } else {
                $lineEnd = $lineEnd + 1;
            }
        }
        $firstLine = mb_substr($sourceCode,  $i,  $lineEnd - $i, "UTF-8");
        if (JSOL::strIndexOf($firstLine,  "JSOL") !== -1) {
            $hasPragma = true;
        }
    }

    if ($hasPragma === false) {
        $errors[] =  "Fatal: Missing MANDATORY @JSOL pragma on Line 1.";
    }
    return JSOL::dict("valid", count($errors) === 0, "errors", $errors);
};

$auditForbiddenPatterns = function($maskedCode) {
    $errors = [];

    $functionalMethods = [".map(", ".filter(", ".reduce(", ".forEach(", ".find("];
    $hasFunctionalMethods = false;
    $fmCount = count($functionalMethods);
    for ($fm = 0; $fm < $fmCount; $fm = $fm + 1) {
        if (JSOL::strIndexOf($maskedCode,  $functionalMethods[$fm]) !== -1) {
            $hasFunctionalMethods = true;
        }
    }
    if ($hasFunctionalMethods === true) {
        $errors[] =  "Linter Error: Functional array methods (.map, .filter, etc.) are FORBIDDEN. Use imperative for/while loops.";
    }

    $hasLengthProperty = false;
    $mLen = mb_strlen($maskedCode, "UTF-8");
    for ($p = 0; $p < $mLen; $p = $p + 1) {
        if (mb_substr($maskedCode,  $p,  7, "UTF-8") === ".length") {
            $nextChar = mb_substr($maskedCode,  $p + 7,  1, "UTF-8");
            if ($isWordChar($nextChar) === false) {
                $hasLengthProperty = true;
                break;
            }
        }
    }
    if ($hasLengthProperty === true) {
        $errors[] =  "Linter Error: Accessing .length is FORBIDDEN. Use Arr.count() for arrays or Str.len() for strings.";
    }

    return JSOL::dict("valid", count($errors) === 0, "errors", $errors);
};