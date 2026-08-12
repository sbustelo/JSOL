<?php
// @JSOL v0.2.90 - CLI Arguments Parser
$parseRawCliArgs = function($rawArgs) {
    $options = JSOL::dict("source", "", "outDir", "", "target", "", "jsTarget", "", "jsPrefix", "", "jsSuffix", "", "phpTarget", "", "phpPrefix", "", "phpSuffix", "");
    $count = count($rawArgs);
    for ($i = 0; $i < $count; $i = $i + 1) {
        $arg = $rawArgs[$i];
        $isFlag = false;
         $isFlag = strpos($arg, "--") === 0; if ($isFlag === true) {
            $key = ""; $val = "";
            
                $clean = substr($arg, 2);
                $eqIndex = strpos($clean, "=");
                if ($eqIndex !== false) { $key = substr($clean, 0, $eqIndex); $val = substr($clean, $eqIndex + 1); } else { $key = $clean; $val = "true"; }
            if ($key === "source") { $options["source"] = $val; }
            if ($key === "out-dir") { $options["outDir"] = $val; }
            if ($key === "target") { $options["target"] = $val; $options["jsTarget"] = $val; $options["phpTarget"] = $val; }
            if ($key === "js-target") { $options["jsTarget"] = $val; }
            if ($key === "js-prefix") { $options["jsPrefix"] = $val; }
            if ($key === "js-suffix") { $options["jsSuffix"] = $val; }
            if ($key === "php-target") { $options["phpTarget"] = $val; }
            if ($key === "php-prefix") { $options["phpPrefix"] = $val; }
            if ($key === "php-suffix") { $options["phpSuffix"] = $val; }
        }
    }
    return $options;
};