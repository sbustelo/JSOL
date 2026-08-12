<?php
// @JSOL v0.2.90 - Self-Hosted JS Target Compiler (Pure JSOL)
$compileToJS = function($maskedCode, $prefix, $suffix) use ($regexReplace) {

    
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
                    if ($type === "sub") { $rep = $args[0] . ".substring(" . $args[1] . ", (" . $args[1] . ") + (" . $args[2] . "))"; }
                    else if ($type === "len") { $rep = $args[0] . ".length"; }
                    else if ($type === "char") { $rep = $args[0] . ".charCodeAt(" . $args[1] . ")"; }
                    else if ($type === "idx") { $rep = $args[0] . ".indexOf(" . $args[1] . ")"; }
                    else if ($type === "rep") { $rep = $args[0] . ".split(" . $args[1] . ").join(" . $args[2] . ")"; }
                    else if ($type === "push") { $rep = $args[0] . ".push(" . $args[1] . ")"; }
                    else if ($type === "haskey") { $rep = "Object.prototype.hasOwnProperty.call(" . $args[0] . ", " . $args[1] . ")"; }
                    else if ($type === "fromchar") { $rep = "String.fromCharCode(" . $args[0] . ")"; }
                    
                    $result = $before . "" . $rep . "" . $after;
                }
            }
        }
        return $result;
    };

    $transformed = $maskedCode;
    
    $transformed = $processBlock($transformed, "JSOL.PHP", false);
    $transformed = $processBlock($transformed, "JSOL.JS", true);

    $transformed = $regexReplace("JSOL\\.use\\s*\\([^)]+\\)\\s*;?", "", $transformed, "g");

    $transformed = str_replace( "Map.create(",  "JSOL.dict(", $transformed);
    $transformed = str_replace( "JSOL.dict(",  "JSOL.dict(", $transformed);

    $transformed = $processCall($transformed, "Str.sub(", "sub");
    $transformed = $processCall($transformed, "Str.len(", "len");
    $transformed = $processCall($transformed, "JSOL.len(", "len");
    $transformed = $processCall($transformed, "Arr.count(", "len");
    $transformed = $processCall($transformed, "JSOL.count(", "len");
    $transformed = $processCall($transformed, "Str.char(", "char");
    $transformed = $processCall($transformed, "Str.indexOf(", "idx");
    $transformed = $processCall($transformed, "Str.replace(", "rep");
    $transformed = $processCall($transformed, "Arr.push(", "push");
    $transformed = $processCall($transformed, "Map.has(", "haskey");
    $transformed = $processCall($transformed, "JSOL.hasKey(", "haskey");
    $transformed = $processCall($transformed, "Str.fromChar(", "fromchar");

    $finalOutput = $prefix . "" . $transformed . "" . $suffix;
    return $finalOutput;
};