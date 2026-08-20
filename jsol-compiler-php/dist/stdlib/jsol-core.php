<?php
/**
 * JSOL Core Polyfills (PHP Runtime)
 * Clases nativas expuestas globalmente para soportar el entorno de JSOL en PHP.
 */
declare(strict_types=1);

class JSOL {
    public static function dict(...$args) {
        $obj = [];
        for ($i = 0; $i < count($args); $i += 2) {
            if (array_key_exists($i + 1, $args)) {
                $obj[$args[$i]] = $args[$i + 1];
            }
        }
        return $obj;
    }
    public static function use(...$args) {}
    public static function strIndexOf($haystack, $needle) {
        $r = strpos($haystack, $needle);
        return $r === false ? -1 : $r;
    }
    public static function arrIndexOf($arr, $item) {
        $r = array_search($item, $arr, true);
        return $r === false ? -1 : $r;
    }
}

class Str {
    public static function indexOf($h, $n) { 
        $r = strpos($h, $n);
        return $r === false ? -1 : $r; 
    }
    public static function len($s) { return mb_strlen($s, "UTF-8"); }
    public static function sub($s, $start, $len) { return mb_substr($s, $start, $len, "UTF-8"); }
    public static function char($s, $idx) { return mb_ord(mb_substr($s, $idx, 1, "UTF-8")); }
    public static function fromChar($c) { return mb_chr($c, "UTF-8"); }
    public static function replace($s, $search, $replace) { return str_replace($search, $replace, $s); }
}

class Arr {
    public static function count($a) { return count($a); }
    public static function push(&$a, $i) { $a[] = $i; return $a; }
}

class Map {
    public static function create(...$args) { return JSOL::dict(...$args); }
    public static function has($obj, $key) { return isset($obj[$key]); }
}

class Rgx {
    public static function match($p, $s, $f) {
        $mod = $f ? str_replace('g', '', $f) : '';
        $pat = '/' . str_replace('/', '\\/', $p) . '/' . $mod;
        if (@preg_match($pat, $s, $m, PREG_OFFSET_CAPTURE)) {
            $g = []; foreach($m as $match) { $g[] = $match[0]; }
            return JSOL::dict("matched", true, "groups", $g, "index", $m[0][1], "length", mb_strlen($m[0][0], 'UTF-8'));
        }
        return JSOL::dict("matched", false, "groups", [], "index", -1, "length", 0);
    }
    public static function replace($p, $r, $s, $f) {
        $mod = $f ? str_replace('g', '', $f) : '';
        $pat = '/' . str_replace('/', '\\/', $p) . '/' . $mod;
        $res = @preg_replace($pat, $r, $s);
        return $res !== null ? $res : $s;
    }
    public static function test($p, $s, $f) {
        $mod = $f ? str_replace('g', '', $f) : '';
        $pat = '/' . str_replace('/', '\\/', $p) . '/' . $mod;
        return @preg_match($pat, $s) === 1;
    }
}
?>