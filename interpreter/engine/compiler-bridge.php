<?php

declare(strict_types=1);

// 1. PHP Polyfills required by the JSOL Compiler to run natively in memory
if (!class_exists('JSOL')) {
	class JSOL
	{
		public static function dict(...$args)
		{
			$obj = [];
			for ($i = 0; $i < count($args); $i += 2) {
				if (array_key_exists($i + 1, $args)) {
					$obj[$args[$i]] = $args[$i + 1];
				}
			}
			return $obj;
		}
		public static function use(...$args) {}
		public static function strIndexOf($haystack, $needle)
		{
			$r = strpos($haystack, $needle);
			return $r === false ? -1 : $r;
		}
		public static function arrIndexOf($arr, $item)
		{
			$r = array_search($item, $arr, true);
			return $r === false ? -1 : $r;
		}
	}
}
if (!class_exists('Str')) {
	class Str
	{
		public static function indexOf($h, $n)
		{
			$r = strpos($h, $n);
			return $r === false ? -1 : $r;
		}
		public static function len($s)
		{
			return mb_strlen($s, "UTF-8");
		}
		public static function sub($s, $start, $len)
		{
			return mb_substr($s, $start, $len, "UTF-8");
		}
		public static function char($s, $idx)
		{
			return mb_ord(mb_substr($s, $idx, 1, "UTF-8"));
		}
		public static function fromChar($c)
		{
			return mb_chr($c, "UTF-8");
		}
		public static function replace($s, $search, $replace)
		{
			return str_replace($search, $replace, $s);
		}
	}
}
if (!class_exists('Arr')) {
	class Arr
	{
		public static function count($a)
		{
			return count($a);
		}
		public static function push(&$a, $i)
		{
			$a[] = $i;
			return $a;
		}
	}
}
if (!class_exists('Map')) {
	class Map
	{
		public static function create(...$args)
		{
			return JSOL::dict(...$args);
		}
		public static function has($obj, $key)
		{
			return isset($obj[$key]);
		}
	}
}


function parseJsolMetadata(string $filePath): array {
    $metadata = [
        'funcName' => null,
        'params' => [],
        'contract' => [],
        'documentation' => '',
        'sourceCode' => ''
    ];

    $sourceCode = file_get_contents($filePath);
    $metadata['sourceCode'] = $sourceCode;
    
    // Extract @contract block
if (preg_match('/\/\*\*[\s\*]*@contract\s*\n(.*?)\*\//s', $sourceCode, $matches)) {
        $jsonStr = preg_replace('/^\s*\*\s?/m', '', $matches[1]);
        $parsedJson = json_decode($jsonStr, true);
        if (json_last_error() === JSON_ERROR_NONE && isset($parsedJson['cases'])) {
            $metadata['contract'] = $parsedJson['cases'];
        }
    }

    // Extract documentation
    if (preg_match_all('/\/\*(.*?)\*\//s', $sourceCode, $docMatches)) {
        foreach ($docMatches[1] as $docContent) {
            if (strpos($docContent, '@contract') === false) {
                $cleanDoc = preg_replace('/^\s*\*\s?/m', '', $docContent);
                $metadata['documentation'] .= trim($cleanDoc) . "\n\n";
            }
        }
    }

    // Extract function signature
    if (preg_match('/const\s+(\$[a-zA-Z0-9_]+)\s*=\s*function\s*\(([^)]*)\)/', $sourceCode, $matches)) {
        $metadata['funcName'] = $matches[1];
        $rawParams = explode(',', $matches[2]);
        foreach ($rawParams as $p) {
            $p = trim($p);
            if ($p !== '') $metadata['params'][] = $p;
        }
    }

    return $metadata;
}


function compileJsolInMemory(string $sourcePath, string $compilerDir, string $outDir, array $metadata): array
{
	// Load all compiler parts into the current function scope
	$parts = [
		'lexer.php',
		'linter.php',
		'cli-parser.php',
		'config-parser.php',
		'regex.php',
		'js-compiler.php',
		'php-compiler.php',
		'engine.php'
	];

	foreach ($parts as $part) {
		require_once rtrim($compilerDir, '/') . '/' . $part;
	}

	$sourceCode = file_get_contents($sourcePath);

	// $mNormalizeTargetsConfig and $mExecuteCompilationPipeline are now available in this scope
	$targetsConfig = $mNormalizeTargetsConfig(null);

	// Export the compiled function explicitly to the browser's window object
	$jsSuffix = "";
	if (!empty($metadata['funcName'])) {
		$jsSuffix = "\nwindow['" . $metadata['funcName'] . "'] = " . $metadata['funcName'] . ";\n";
	}

	$cliOpts = [
		'jsTarget' => '',
		'jsPrefix' => '',
		'jsSuffix' => $jsSuffix,
		'phpTarget' => '',
		'phpPrefix' => '',
		'phpSuffix' => ''
	];

	$result = $mExecuteCompilationPipeline($sourceCode, $targetsConfig, $cliOpts);

	$baseName = preg_replace('/\.jsol(\.js)?$/', '', basename($sourcePath));
	$compiledJsFilename = $baseName . '.js';

	if ($result['success'] !== false) {
		file_put_contents($outDir . '/' . $compiledJsFilename, $result['js']);
		return [
			'success' => true,
			'outputLog' => '',
			'compiledFilename' => $compiledJsFilename
		];
	} else {
		return [
			'success' => false,
			'outputLog' => implode("\n", $result['errors'] ?? ['Unknown compilation error']),
			'compiledFilename' => null
		];
	}
}
