<?php
declare(strict_types=1);

class JSOL {
    public static $JSOL_m_lastFunction_ok = ["ok" => true, "type" => "NONE", "source" => "NONE", "args" => []];
    public static $_shadowLocked = false;

    public static function resetShadow() {
        self::$JSOL_m_lastFunction_ok = ["ok" => true, "type" => "NONE", "source" => "NONE", "args" => []];
        self::$_shadowLocked = false;
    }

    public static function setShadow($ok, $type, $source, $args) {
        if (self::$_shadowLocked) return;
        self::$JSOL_m_lastFunction_ok = ["ok" => $ok, "type" => $type, "source" => $source, "args" => $args];
        if (!$ok) self::$_shadowLocked = true;
    }

    public static function ok() { return self::$JSOL_m_lastFunction_ok["ok"]; }

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
        return Str::indexOf($haystack, $needle);
    }
    public static function arrIndexOf($arr, $item) {
        return Arr::indexOf($arr, $item);
    }
}


class Cast {
    public static function toInt($val) {
        if (!is_numeric($val)) {
            JSOL::setShadow(false, "PARSE_ERROR", "Cast.toInt", JSOL::dict("val", $val));
            return 0;
        }
        JSOL::setShadow(true, "NONE", "Cast.toInt", JSOL::dict("val", $val));
        return intval($val);
    }
    public static function toFloat($val) {
        if (!is_numeric($val)) {
            JSOL::setShadow(false, "PARSE_ERROR", "Cast.toFloat", JSOL::dict("val", $val));
            return 0.0;
        }
        JSOL::setShadow(true, "NONE", "Cast.toFloat", JSOL::dict("val", $val));
        return floatval($val);
    }
    public static function toStr($val) {
        if ($val === null) return "";
        if ($val === false) return "false";
        if ($val === true) return "true";
        return strval($val);
    }
    public static function toBool($val) {
        if ($val === "0") return false;
        return (bool)$val;
    }
}

class Str {
    public static function indexOf($h, $n) { 
        $r = mb_strpos($h, $n, 0, "UTF-8");
        if ($r === false) {
            JSOL::setShadow(false, "NOT_FOUND", "Str.indexOf", JSOL::dict("needle", $n));
            return -1;
        }
        JSOL::setShadow(true, "NONE", "Str.indexOf", JSOL::dict("needle", $n));
        return $r;
    }
    public static function len($s) { return mb_strlen($s, "UTF-8"); }
    public static function sub($s, $start, $len) { return mb_substr($s, $start, $len, "UTF-8"); }
    public static function char($s, $idx) { return mb_ord(mb_substr($s, $idx, 1, "UTF-8"), "UTF-8"); }
    public static function fromChar($c) { return mb_chr($c, "UTF-8"); }
    public static function contains($h, $n) { return self::indexOf($h, $n) !== -1; }
    public static function startsWith($s, $n) { return str_starts_with($s, $n); }
    public static function endsWith($s, $n) { return str_ends_with($s, $n); }
    public static function replaceAll($s, $search, $replace) { return str_replace($search, $replace, $s); }
    public static function replace($s, $search, $replace) { return str_replace($search, $replace, $s); }
    public static function same($sA, $sB, $mOpts = null) {
        $a = $sA; $b = $sB;
        $bIgnoreCase = $mOpts !== null && isset($mOpts["ignoreCase"]) && $mOpts["ignoreCase"] === true;
        $bIgnoreDiacritics = $mOpts !== null && isset($mOpts["ignoreDiacritics"]) && $mOpts["ignoreDiacritics"] === true;
        if ($bIgnoreCase === true) {
            $a = mb_strtolower($a, "UTF-8");
            $b = mb_strtolower($b, "UTF-8");
        }
        if ($bIgnoreDiacritics === true) {
            $a = preg_replace('/\p{Mn}/u', '', Normalizer::normalize($a, Normalizer::FORM_D));
            $b = preg_replace('/\p{Mn}/u', '', Normalizer::normalize($b, Normalizer::FORM_D));
        }
        return $a === $b;
    }
    public static function padStart($s, $len, $pad) {
        $iCur = mb_strlen($s, "UTF-8");
        if ($iCur >= $len) { return $s; }
        $iNeed = $len - $iCur;
        $sFill = "";
        while (mb_strlen($sFill, "UTF-8") < $iNeed) { $sFill .= $pad; }
        return mb_substr($sFill, 0, $iNeed, "UTF-8") . $s;
    }
    public static function padEnd($s, $len, $pad) {
        $iCur = mb_strlen($s, "UTF-8");
        if ($iCur >= $len) { return $s; }
        $iNeed = $len - $iCur;
        $sFill = "";
        while (mb_strlen($sFill, "UTF-8") < $iNeed) { $sFill .= $pad; }
        return $s . mb_substr($sFill, 0, $iNeed, "UTF-8");
    }
    public static function repeat($s, $q) { return str_repeat($s, $q); }
    public static function split($s, $d) {
        if ($d === "") { return mb_str_split($s, 1, "UTF-8"); }
        return explode($d, $s);
    }
    public static function concat(...$args) {
        $mapped = array_map(function($v) { return Cast::toStr($v); }, $args);
        return implode("", $mapped);
    }
}

class Arr {
    public static function len($a) { return count($a); }
    public static function count($a) { return count($a); }
    public static function push(&$a, $i) { $a[] = $i; return $a; }
    public static function pop(&$a) { 
        if (count($a) === 0) {
            JSOL::setShadow(false, "EMPTY_ARRAY", "Arr.pop", JSOL::dict());
            return null;
        }
        JSOL::setShadow(true, "NONE", "Arr.pop", JSOL::dict());
        return array_pop($a); 
    }
    public static function shift(&$a) { 
        if (count($a) === 0) {
            JSOL::setShadow(false, "EMPTY_ARRAY", "Arr.shift", JSOL::dict());
            return null;
        }
        JSOL::setShadow(true, "NONE", "Arr.shift", JSOL::dict());
        return array_shift($a); 
    }
    public static function unshift(&$a, $i) { array_unshift($a, $i); return $a; }
    public static function contains($a, $i) { return in_array($i, $a, true); }
    public static function indexOf($a, $i) { 
        $r = array_search($i, $a, true);
        if ($r === false) {
            JSOL::setShadow(false, "NOT_FOUND", "Arr.indexOf", JSOL::dict("item", $i));
            return -1;
        }
        JSOL::setShadow(true, "NONE", "Arr.indexOf", JSOL::dict("item", $i));
        return $r;
    }
    public static function join($a, $d) { return implode($d, $a); }
    public static function slice($a, $s, $e) { return array_slice($a, $s, $e - $s); }
    public static function sort($a, $cmp) { $b = $a; usort($b, $cmp); return $b; }
}

class Map {
    public static function create(...$args) { return JSOL::dict(...$args); }
    public static function has($obj, $key) { return isset($obj[$key]); }
    public static function keys($obj) { return array_keys($obj); }
    public static function values($obj) { return array_values($obj); }
    public static function count($obj) { return count($obj); }
    public static function get($obj, $key) { 
        if (isset($obj[$key])) {
            JSOL::setShadow(true, "NONE", "Map.get", JSOL::dict("key", $key));
            return $obj[$key];
        }
        JSOL::setShadow(false, "KEY_NOT_FOUND", "Map.get", JSOL::dict("key", $key));
        return null; 
    }
}

class JSOL_Bool {
    public static function and(...$args) { foreach ($args as $a) { if (!$a) return false; } return true; }
    public static function or(...$args) { foreach ($args as $a) { if ($a) return true; } return false; }
    public static function xor(...$args) { $t = 0; foreach ($args as $a) { if ($a) $t++; } return ($t % 2) === 1; }
    public static function eq(...$args) { if (count($args) <= 1) return true; $f = $args[0]; for ($i = 1; $i < count($args); $i++) { if ($args[$i] !== $f) return false; } return true; }
    public static function neq(...$args) { return !self::eq(...$args); }
}

class Math {
    public static function sum(...$args) {
        $t = 0; foreach ($args as $a) $t += $a; return $t;
    }
    public static function sub(...$args) {
        if (count($args) === 0) return 0;
        $t = $args[0]; for ($i = 1; $i < count($args); $i++) $t -= $args[$i]; return $t;
    }
    public static function mul(...$args) {
        if (count($args) === 0) return 0;
        $t = $args[0]; for ($i = 1; $i < count($args); $i++) $t *= $args[$i]; return $t;
    }
    public static function div(...$args) {
        if (count($args) === 0) return 0;
        $t = $args[0]; 
        for ($i = 1; $i < count($args); $i++) {
            if ($args[$i] == 0) {
                JSOL::setShadow(false, "DIVIDE_BY_ZERO", "Math.div", JSOL::dict("divisor", 0));
                return 0;
            }
            $t /= $args[$i];
        }
        JSOL::setShadow(true, "NONE", "Math.div", JSOL::dict());
        return $t;
    }
    public static function idiv($a, $b) {
        if ($b == 0) {
            JSOL::setShadow(false, "DIVIDE_BY_ZERO", "Math.idiv", JSOL::dict("divisor", 0));
            return 0;
        }
        JSOL::setShadow(true, "NONE", "Math.idiv", JSOL::dict());
        return self::trunc($a / $b);
    }
    public static function cbrt($n) { return $n < 0 ? -pow(abs($n), 1/3) : pow($n, 1/3); }
    public static function trunc($n) { return $n < 0 ? ceil($n) : floor($n); }
    
public static function modX($a, $b) {
        if ($b == 0) {
            JSOL::setShadow(false, "DIVIDE_BY_ZERO", "Math.modX", JSOL::dict("divisor", 0));
            return 0;
        }
        JSOL::setShadow(true, "NONE", "Math.modX", JSOL::dict());
        $res = $a - $b * floor($a / $b);
        return (fmod($res, 1.0) == 0.0) ? (int)$res : $res;
    }
	
    public static function roundX($n) { return (int)(floor(abs($n) + 0.5) * ($n < 0 ? -1 : 1)); }
    public static function logX($n, $base = 10) { return log($n, $base); }
    public static function ln($n) { return log($n); }
}

class Rgx {
    public static function match($p, $s, $f) {
        $p = preg_replace('/\\\\u([0-9A-Fa-f]{4})/', '\\x{$1}', $p);
        $mod = $f ? str_replace('g', '', $f) : '';
        if (strpos($mod, 'u') === false) $mod .= 'u';
        $pat = '/' . str_replace('/', '\\/', $p) . '/' . $mod;
        if (@preg_match($pat, $s, $m, PREG_OFFSET_CAPTURE)) {
            $g = []; foreach($m as $match) { $g[] = $match[0]; }
            $iByteOffset = $m[0][1];
            $sBeforeBytes = substr($s, 0, $iByteOffset);
            $iCpOffset = mb_strlen($sBeforeBytes, "UTF-8");
            return JSOL::dict("matched", true, "groups", $g, "index", $iCpOffset, "length", mb_strlen($m[0][0], 'UTF-8'));
        }
        return JSOL::dict("matched", false, "groups", [], "index", -1, "length", 0);
    }
    public static function replace($p, $r, $s, $f) {
        $p = preg_replace('/\\\\u([0-9A-Fa-f]{4})/', '\\x{$1}', $p);
        $mod = $f ? str_replace('g', '', $f) : '';
        if (strpos($mod, 'u') === false) $mod .= 'u';
        $pat = '/' . str_replace('/', '\\/', $p) . '/' . $mod;
        $res = @preg_replace($pat, $r, $s);
        return $res !== null ? $res : $s;
    }
    public static function test($p, $s, $f) {
        $p = preg_replace('/\\\\u([0-9A-Fa-f]{4})/', '\\x{$1}', $p);
        $mod = $f ? str_replace('g', '', $f) : '';
        if (strpos($mod, 'u') === false) $mod .= 'u';
        $pat = '/' . str_replace('/', '\\/', $p) . '/' . $mod;
        return @preg_match($pat, $s) === 1;
    }
}
?>