// @JSOL v0.2.90 - Self-Hosted Compiler Linter Module (regex-free)
const $isWordChar = function($ch) {
    if ($ch === "") { return false; }
    const $code = $ch.charCodeAt( 0);
    if ($code >= 48 && $code <= 57) { return true; }
    if ($code >= 65 && $code <= 90) { return true; }
    if ($code >= 97 && $code <= 122) { return true; }
    if ($code === 95) { return true; }
    return false;
};

const $auditPragma = function($sourceCode) {
    const $errors = [];
    let $hasPragma = false;
    const $len = $sourceCode.length;

    let $i = 0;
    let $skipping = true;
    while ($i < $len && $skipping === true) {
        const $c = $sourceCode.substring( $i, ( $i) + ( 1));
        if ($c === " " || $c === "\t" || $c === "\n" || $c === "\r") {
            $i = $i + 1;
        } else {
            $skipping = false;
        }
    }

    if ($sourceCode.substring( $i, ( $i) + ( 2)) === "//") {
        let $lineEnd = $i;
        let $scanning = true;
        while ($lineEnd < $len && $scanning === true) {
            if ($sourceCode.substring( $lineEnd, ( $lineEnd) + ( 1)) === "\n") {
                $scanning = false;
            } else {
                $lineEnd = $lineEnd + 1;
            }
        }
        const $firstLine = $sourceCode.substring( $i, ( $i) + ( $lineEnd - $i));
        if ($firstLine.indexOf( "JSOL") !== -1) {
            $hasPragma = true;
        }
    }

    if ($hasPragma === false) {
        $errors.push( "Fatal: Missing MANDATORY @JSOL pragma on Line 1.");
    }
    return JSOL.dict("valid", $errors.length === 0, "errors", $errors);
};

const $auditForbiddenPatterns = function($maskedCode) {
    const $errors = [];

    const $functionalMethods = [".map(", ".filter(", ".reduce(", ".forEach(", ".find("];
    let $hasFunctionalMethods = false;
    const $fmCount = $functionalMethods.length;
    for (let $fm = 0; $fm < $fmCount; $fm = $fm + 1) {
        if ($maskedCode.indexOf( $functionalMethods[$fm]) !== -1) {
            $hasFunctionalMethods = true;
        }
    }
    if ($hasFunctionalMethods === true) {
        $errors.push( "Linter Error: Functional array methods (.map, .filter, etc.) are FORBIDDEN. Use imperative for/while loops.");
    }

    let $hasLengthProperty = false;
    const $mLen = $maskedCode.length;
    for (let $p = 0; $p < $mLen; $p = $p + 1) {
        if ($maskedCode.substring( $p, ( $p) + ( 7)) === ".length") {
            const $nextChar = $maskedCode.substring( $p + 7, ( $p + 7) + ( 1));
            if ($isWordChar($nextChar) === false) {
                $hasLengthProperty = true;
                break;
            }
        }
    }
    if ($hasLengthProperty === true) {
        $errors.push( "Linter Error: Accessing .length is FORBIDDEN. Use Arr.count() for arrays or Str.len() for strings.");
    }

    return JSOL.dict("valid", $errors.length === 0, "errors", $errors);
};