<?php
// @JSOL v0.2.92 - Self-Hosted PHP Target Compiler (Pure JSOL)
$compileToPHP = function($maskedCode, $prefix, $suffix) use ($regexReplace) {

    
    $processBlock = function($code, $keyword, $unwrap) {
        $result = $code;
        $continue = true;
        while ($continue === true) {
            $startIdx = JSOL::strIndexOf($result,  $keyword);
            
            if ($startIdx === -1) {
                $continue = false;
            } else {
                $tailLen = mb_strlen($result, "UTF-8") - $startIdx;
                $tail = mb_substr($result,  $startIdx,  $tailLen, "UTF-8");
                $relOpenBrace = JSOL::strIndexOf($tail,  "{");
                $openBrace = $relOpenBrace === -1 ? -1 : $startIdx + $relOpenBrace;
                
                if ($openBrace === -1) {
                    $continue = false;
                } else {
                    $braceCount = 1;
                    $closeBrace = -1;
                    $rLen = mb_strlen($result, "UTF-8");
                    for ($i = $openBrace + 1; $i < $rLen; $i = $i + 1) {
                        $char = mb_substr($result,  $i,  1, "UTF-8");
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
                        $endIdx = $closeBrace + 1;
                        $findingEnd = true;
                        while ($endIdx < $rLen && $findingEnd === true) {
                            $char = mb_substr($result,  $endIdx,  1, "UTF-8");
                            if ($char === " " || $char === "\n" || $char === "\r" || $char === ")" || $char === ";") {
                                $endIdx = $endIdx + 1;
                            } else {
                                $findingEnd = false;
                            }
                        }
                        
                        $before = mb_substr($result,  0,  $startIdx, "UTF-8");
                        $afterLen = mb_strlen($result, "UTF-8") - $endIdx;
                        $after = mb_substr($result,  $endIdx,  $afterLen, "UTF-8");
                        
                        if ($unwrap === true) {
                            $innerLen = $closeBrace - $openBrace - 1;
                            $inner = mb_substr($result,  $openBrace + 1,  $innerLen, "UTF-8");
                            $result = $before . "" . $inner . "" . $after;
                        } else {
                            $result = $before . "" . $after;
                        }
                    }
                }
            }
        }
        return $result;
    };

    $processCall = function($code, $keyword, $type) {
        $result = $code;
        $continue = true;
        while ($continue === true) {
            $startIdx = JSOL::strIndexOf($result,  $keyword);
            if ($startIdx === -1) {
                $continue = false;
            } else {
                $kwLen = mb_strlen($keyword, "UTF-8");
                $openParen = $startIdx + $kwLen - 1;
                $parenCount = 1;
                $bracketCount = 0;
                $braceCount = 0;
                $inStr = false;
                $closeParen = -1;
                $args = [];
                $currentArgStart = $openParen + 1;
                $rLen = mb_strlen($result, "UTF-8");
                
                for ($i = $openParen + 1; $i < $rLen; $i = $i + 1) {
                    $char = mb_substr($result,  $i,  1, "UTF-8");
                    $prev = mb_substr($result,  $i - 1,  1, "UTF-8");
                    
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
                        $argLen1 = $i - $currentArgStart;
                        $argVal1 = mb_substr($result,  $currentArgStart,  $argLen1, "UTF-8");
                        $args[] =  $argVal1;
                        $currentArgStart = $i + 1;
                    } else if ($parenCount === 0) {
                        $argLen2 = $i - $currentArgStart;
                        $argVal2 = mb_substr($result,  $currentArgStart,  $argLen2, "UTF-8");
                        $args[] =  $argVal2;
                        $closeParen = $i;
                        break;
                    }
                }
                
                if ($closeParen === -1) {
                    $continue = false;
                } else {
                    $before = mb_substr($result,  0,  $startIdx, "UTF-8");
                    $afterLen = mb_strlen($result, "UTF-8") - $closeParen - 1;
                    $after = mb_substr($result,  $closeParen + 1,  $afterLen, "UTF-8");
                    
                    $rep = "";
                    if ($type === "sub") { $rep = "mb_substr(" . $args[0] . ", " . $args[1] . ", " . $args[2] . ", \"UTF-8\")"; }
                    else if ($type === "len") { $rep = "mb_strlen(" . $args[0] . ", \"UTF-8\")"; }
                    else if ($type === "char") { $rep = "mb_ord(mb_substr(" . $args[0] . ", " . $args[1] . ", 1, \"UTF-8\"))"; }
                    else if ($type === "idx") { $rep = "JSOL::strIndexOf(" . $args[0] . ", " . $args[1] . ")"; }
                    else if ($type === "rep") { $rep = "str_replace(" . $args[1] . ", " . $args[2] . ", " . $args[0] . ")"; }
                    else if ($type === "push") { $rep = $args[0] . "[] = " . $args[1] . ""; }
                    else if ($type === "haskey") { $rep = "isset(" . $args[0] . "[" . $args[1] . "])"; }
                    else if ($type === "fromchar") { $rep = "mb_chr(" . $args[0] . ", \"UTF-8\")"; }
else if ($type === "count") { $rep = "count(" . $args[0] . ")"; }
                    else if ($type === "upper") { $rep = "mb_strtoupper(" . $args[0] . ", \"UTF-8\")"; }
                    else if ($type === "lower") { $rep = "mb_strtolower(" . $args[0] . ", \"UTF-8\")"; }
                    else if ($type === "trim") { $rep = "trim(" . $args[0] . ")"; }
                    else if ($type === "split") { $rep = "explode(" . $args[1] . ", " . $args[0] . ")"; }
                    else if ($type === "join") { $rep = "implode(" . $args[1] . ", " . $args[0] . ")"; }
                    else if ($type === "slice") { $rep = "array_slice(" . $args[0] . ", " . $args[1] . ", " . $args[2] . ")"; }
                    else if ($type === "toint") { $rep = "intval(" . $args[0] . ")"; }
                    else if ($type === "tostr") { $rep = "strval(" . $args[0] . ")"; }
                    else if ($type === "tofloat") { $rep = "floatval(" . $args[0] . ")"; }
                    else if ($type === "bitand") { $rep = "(" . $args[0] . " & " . $args[1] . ")"; }
                    else if ($type === "bitor") { $rep = "(" . $args[0] . " | " . $args[1] . ")"; }
                    else if ($type === "bitxor") { $rep = "(" . $args[0] . " ^ " . $args[1] . ")"; }
                    else if ($type === "bitnot") { $rep = "(~" . $args[0] . ")"; }
                    else if ($type === "bitshiftl") { $rep = "(" . $args[0] . " << " . $args[1] . ")"; }
                    else if ($type === "bitshiftr") { $rep = "(" . $args[0] . " >> " . $args[1] . ")"; }
                    
                    $result = $before . "" . $rep . "" . $after;
                }
            }
        }
        return $result;
    };

    $transformed = $maskedCode;
    
    $transformed = $processBlock($transformed, "JSOL.JS", false);
    $transformed = $processBlock($transformed, "JSOL.PHP", true);

    $prefixes = ["\n", "\r\n", "\t", " ", "("];
    for ($p = 0; $p < 5; $p = $p + 1) {
        $transformed = str_replace( $prefixes[$p] . "const ",  $prefixes[$p], $transformed);
        $transformed = str_replace( $prefixes[$p] . "let ",  $prefixes[$p], $transformed);
        $transformed = str_replace( $prefixes[$p] . "var ",  $prefixes[$p], $transformed);
    }
    if (JSOL::strIndexOf($transformed,  "const ") === 0) { $transformed = mb_substr($transformed,  6,  mb_strlen($transformed, "UTF-8") - 6, "UTF-8"); }
    if (JSOL::strIndexOf($transformed,  "let ") === 0) { $transformed = mb_substr($transformed,  4,  mb_strlen($transformed, "UTF-8") - 4, "UTF-8"); }
    if (JSOL::strIndexOf($transformed,  "var ") === 0) { $transformed = mb_substr($transformed,  4,  mb_strlen($transformed, "UTF-8") - 4, "UTF-8"); }

    $transformed = str_replace( "Math.PI",  "M_PI", $transformed);
    $transformed = str_replace( "Math.",  "", $transformed);
    $transformed = str_replace( "isNaN(",  "is_nan(", $transformed);

    $transformed = $regexReplace("function\\s*\\(([^)]*)\\)\\s*\\{\\s*JSOL\\.use\\s*\\(([^)]+)\\)\\s*;?", "function($1) use ($2) {\n", $transformed, "g");

    $transformed = str_replace( "Map.create(",  "JSOL.dict(", $transformed);

    $transformed = str_replace( "Regex.replace(",  "$" . "mRegex[\"replace\"](", $transformed);
    
	
	
	$transformed = str_replace( "Regex.match(",  "$" . "mRegex[\"match\"](", $transformed);
    $transformed = str_replace( "Regex.test(",  "$" . "mRegex[\"test\"](", $transformed);

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

    $transformed = str_replace( "JSOL.",  "JSOL::", $transformed);


    $transformed = $regexReplace("(__JSOL_(TOKEN|STR|COM)_[0-9]+__)\\s*\\+", "$1 .", $transformed, "g");
    $transformed = $regexReplace("\\+\\s*(__JSOL_(TOKEN|STR|COM)_[0-9]+__)", ". $1", $transformed, "g");

    $finalOutput = $prefix . "" . $transformed . "" . $suffix;
    if (JSOL::strIndexOf($finalOutput,  "<?php") === -1) {
        $finalOutput = "<?php\n" . $finalOutput;
    }
    return $finalOutput;
};