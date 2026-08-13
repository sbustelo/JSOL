// @JSOL v0.2.92 - Self-Hosted PHP Target Compiler (Pure JSOL)
const $compileToPHP = function($maskedCode, $prefix, $suffix) {
    
    
    const $processBlock = function($code, $keyword, $unwrap) {
        let $result = $code;
        let $continue = true;
        while ($continue === true) {
            const $startIdx = $result.indexOf( $keyword);
            
            if ($startIdx === -1) {
                $continue = false;
            } else {
                const $tailLen = $result.length - $startIdx;
                const $tail = $result.substring( $startIdx, ( $startIdx) + ( $tailLen));
                const $relOpenBrace = $tail.indexOf( "{");
                const $openBrace = $relOpenBrace === -1 ? -1 : $startIdx + $relOpenBrace;
                
                if ($openBrace === -1) {
                    $continue = false;
                } else {
                    let $braceCount = 1;
                    let $closeBrace = -1;
                    const $rLen = $result.length;
                    for (let $i = $openBrace + 1; $i < $rLen; $i = $i + 1) {
                        const $char = $result.substring( $i, ( $i) + ( 1));
                        if ($char === "{") { $braceCount = $braceCount + 1; }
                        if ($char === "}") { $braceCount = $braceCount - 1; }
                        if ($braceCount === 0) {
                            $closeBrace = $i;
                            break;
                        }
                    }
                    
                    if ($closeBrace === -1) {
                        $continue = false;
                    } else {
                        let $endIdx = $closeBrace + 1;
                        let $findingEnd = true;
                        while ($endIdx < $rLen && $findingEnd === true) {
                            const $char = $result.substring( $endIdx, ( $endIdx) + ( 1));
                            if ($char === " " || $char === "\n" || $char === "\r" || $char === ")" || $char === ";") {
                                $endIdx = $endIdx + 1;
                            } else {
                                $findingEnd = false;
                            }
                        }
                        
                        const $before = $result.substring( 0, ( 0) + ( $startIdx));
                        const $afterLen = $result.length - $endIdx;
                        const $after = $result.substring( $endIdx, ( $endIdx) + ( $afterLen));
                        
                        if ($unwrap === true) {
                            const $innerLen = $closeBrace - $openBrace - 1;
                            const $inner = $result.substring( $openBrace + 1, ( $openBrace + 1) + ( $innerLen));
                            $result = $before + "" + $inner + "" + $after;
                        } else {
                            $result = $before + "" + $after;
                        }
                    }
                }
            }
        }
        return $result;
    };

    const $processCall = function($code, $keyword, $type) {
        let $result = $code;
        let $continue = true;
        while ($continue === true) {
            const $startIdx = $result.indexOf( $keyword);
            if ($startIdx === -1) {
                $continue = false;
            } else {
                const $kwLen = $keyword.length;
                const $openParen = $startIdx + $kwLen - 1;
                let $parenCount = 1;
                let $bracketCount = 0;
                let $braceCount = 0;
                let $inStr = false;
                let $closeParen = -1;
                let $args = [];
                let $currentArgStart = $openParen + 1;
                const $rLen = $result.length;
                
                for (let $i = $openParen + 1; $i < $rLen; $i = $i + 1) {
                    const $char = $result.substring( $i, ( $i) + ( 1));
                    const $prev = $result.substring( $i - 1, ( $i - 1) + ( 1));
                    
                    if ($char === "\"" && $prev !== "\\") { $inStr = !$inStr; }
                    
                    if ($inStr === false) {
                        if ($char === "(") { $parenCount = $parenCount + 1; }
                        if ($char === ")") { $parenCount = $parenCount - 1; }
                        if ($char === "[") { $bracketCount = $bracketCount + 1; }
                        if ($char === "]") { $bracketCount = $bracketCount - 1; }
                        if ($char === "{") { $braceCount = $braceCount + 1; }
                        if ($char === "}") { $braceCount = $braceCount - 1; }
                    }
                    
                    if ($char === "," && $parenCount === 1 && $bracketCount === 0 && $braceCount === 0 && $inStr === false) {
                        const $argLen1 = $i - $currentArgStart;
                        const $argVal1 = $result.substring( $currentArgStart, ( $currentArgStart) + ( $argLen1));
                        $args.push( $argVal1);
                        $currentArgStart = $i + 1;
                    } else if ($parenCount === 0) {
                        const $argLen2 = $i - $currentArgStart;
                        const $argVal2 = $result.substring( $currentArgStart, ( $currentArgStart) + ( $argLen2));
                        $args.push( $argVal2);
                        $closeParen = $i;
                        break;
                    }
                }
                
                if ($closeParen === -1) {
                    $continue = false;
                } else {
                    const $before = $result.substring( 0, ( 0) + ( $startIdx));
                    const $afterLen = $result.length - $closeParen - 1;
                    const $after = $result.substring( $closeParen + 1, ( $closeParen + 1) + ( $afterLen));
                    
                    let $rep = "";
                    if ($type === "sub") { $rep = "mb_substr(" + $args[0] + ", " + $args[1] + ", " + $args[2] + ", \"UTF-8\")"; }
                    else if ($type === "len") { $rep = "mb_strlen(" + $args[0] + ", \"UTF-8\")"; }
                    else if ($type === "char") { $rep = "mb_ord(mb_substr(" + $args[0] + ", " + $args[1] + ", 1, \"UTF-8\"))"; }
                    else if ($type === "idx") { $rep = "JSOL::strIndexOf(" + $args[0] + ", " + $args[1] + ")"; }
                    else if ($type === "rep") { $rep = "str_replace(" + $args[1] + ", " + $args[2] + ", " + $args[0] + ")"; }
                    else if ($type === "push") { $rep = $args[0] + "[] = " + $args[1] + ""; }
                    else if ($type === "haskey") { $rep = "isset(" + $args[0] + "[" + $args[1] + "])"; }
                    else if ($type === "fromchar") { $rep = "mb_chr(" + $args[0] + ", \"UTF-8\")"; }
else if ($type === "count") { $rep = "count(" + $args[0] + ")"; }
                    else if ($type === "upper") { $rep = "mb_strtoupper(" + $args[0] + ", \"UTF-8\")"; }
                    else if ($type === "lower") { $rep = "mb_strtolower(" + $args[0] + ", \"UTF-8\")"; }
                    else if ($type === "trim") { $rep = "trim(" + $args[0] + ")"; }
                    else if ($type === "split") { $rep = "explode(" + $args[1] + ", " + $args[0] + ")"; }
                    else if ($type === "join") { $rep = "implode(" + $args[1] + ", " + $args[0] + ")"; }
                    else if ($type === "slice") { $rep = "array_slice(" + $args[0] + ", " + $args[1] + ", " + $args[2] + ")"; }
                    else if ($type === "toint") { $rep = "intval(" + $args[0] + ")"; }
                    else if ($type === "tostr") { $rep = "strval(" + $args[0] + ")"; }
                    else if ($type === "tofloat") { $rep = "floatval(" + $args[0] + ")"; }
                    else if ($type === "bitand") { $rep = "(" + $args[0] + " & " + $args[1] + ")"; }
                    else if ($type === "bitor") { $rep = "(" + $args[0] + " | " + $args[1] + ")"; }
                    else if ($type === "bitxor") { $rep = "(" + $args[0] + " ^ " + $args[1] + ")"; }
                    else if ($type === "bitnot") { $rep = "(~" + $args[0] + ")"; }
                    else if ($type === "bitshiftl") { $rep = "(" + $args[0] + " << " + $args[1] + ")"; }
                    else if ($type === "bitshiftr") { $rep = "(" + $args[0] + " >> " + $args[1] + ")"; }
                    
                    $result = $before + "" + $rep + "" + $after;
                }
            }
        }
        return $result;
    };

    let $transformed = $maskedCode;
    
    $transformed = $processBlock($transformed, "JSOL.JS", false);
    $transformed = $processBlock($transformed, "JSOL.PHP", true);

    const $prefixes = ["\n", "\r\n", "\t", " ", "("];
    for (let $p = 0; $p < 5; $p = $p + 1) {
        $transformed = $transformed.split( $prefixes[$p] + "const ").join( $prefixes[$p]);
        $transformed = $transformed.split( $prefixes[$p] + "let ").join( $prefixes[$p]);
        $transformed = $transformed.split( $prefixes[$p] + "var ").join( $prefixes[$p]);
    }
    if ($transformed.indexOf( "const ") === 0) { $transformed = $transformed.substring( 6, ( 6) + ( $transformed.length - 6)); }
    if ($transformed.indexOf( "let ") === 0) { $transformed = $transformed.substring( 4, ( 4) + ( $transformed.length - 4)); }
    if ($transformed.indexOf( "var ") === 0) { $transformed = $transformed.substring( 4, ( 4) + ( $transformed.length - 4)); }

    $transformed = $transformed.split( "Math.PI").join( "M_PI");
    $transformed = $transformed.split( "Math.").join( "");
    $transformed = $transformed.split( "isNaN(").join( "is_nan(");

    $transformed = $regexReplace("function\\s*\\(([^)]*)\\)\\s*\\{\\s*JSOL\\.use\\s*\\(([^)]+)\\)\\s*;?", "function($1) use ($2) {\n", $transformed, "g");

    $transformed = $transformed.split( "Map.create(").join( "JSOL.dict(");

    $transformed = $transformed.split( "Regex.replace(").join( "$" + "mRegex[\"replace\"](");
    
	
	
	$transformed = $transformed.split( "Regex.match(").join( "$" + "mRegex[\"match\"](");
    $transformed = $transformed.split( "Regex.test(").join( "$" + "mRegex[\"test\"](");

    $transformed = $processCall($transformed, "Str.sub(", "sub");
    $transformed = $processCall($transformed, "Str.len(", "len");
    $transformed = $processCall($transformed, "JSOL.len(", "len");
    $transformed = $processCall($transformed, "Arr.count(", "count");
    $transformed = $processCall($transformed, "JSOL.count(", "count");
    $transformed = $processCall($transformed, "Str.char(", "char");
    $transformed = $processCall($transformed, "Str.indexOf(", "idx");
    $transformed = $processCall($transformed, "Str.replace(", "rep");
    $transformed = $processCall($transformed, "Arr.push(", "push");
    $transformed = $processCall($transformed, "Map.has(", "haskey");
    $transformed = $processCall($transformed, "JSOL.hasKey(", "haskey");
    $transformed = $processCall($transformed, "Str.fromChar(", "fromchar");
    $transformed = $processCall($transformed, "Str.upper(", "upper");
    $transformed = $processCall($transformed, "Str.lower(", "lower");
    $transformed = $processCall($transformed, "Str.trim(", "trim");
    $transformed = $processCall($transformed, "Str.split(", "split");
    $transformed = $processCall($transformed, "Arr.join(", "join");
    $transformed = $processCall($transformed, "Arr.slice(", "slice");
    $transformed = $processCall($transformed, "Cast.toInt(", "toint");
    $transformed = $processCall($transformed, "Cast.toStr(", "tostr");
    $transformed = $processCall($transformed, "Cast.toFloat(", "tofloat");
    $transformed = $processCall($transformed, "Bit.and(", "bitand");
    $transformed = $processCall($transformed, "Bit.or(", "bitor");
    $transformed = $processCall($transformed, "Bit.xor(", "bitxor");
    $transformed = $processCall($transformed, "Bit.not(", "bitnot");
    $transformed = $processCall($transformed, "Bit.shiftL(", "bitshiftl");
    $transformed = $processCall($transformed, "Bit.shiftR(", "bitshiftr");

    $transformed = $transformed.split( "JSOL.").join( "JSOL::");


    $transformed = $regexReplace("(__JSOL_(TOKEN|STR|COM)_[0-9]+__)\\s*\\+", "$1 .", $transformed, "g");
    $transformed = $regexReplace("\\+\\s*(__JSOL_(TOKEN|STR|COM)_[0-9]+__)", ". $1", $transformed, "g");

    let $finalOutput = $prefix + "" + $transformed + "" + $suffix;
    if ($finalOutput.indexOf( "<?php") === -1) {
        $finalOutput = "<?php\n" + $finalOutput;
    }
    return $finalOutput;
};