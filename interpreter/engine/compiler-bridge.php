<?php
/* PATH: interpreter/engine/compiler-bridge.php */
/* REEMPLAZAR ARCHIVO COMPLETO */
// JSOL v0.2.98

declare(strict_types=1);

function parseJsolMetadata(string $filePath): array
{
	$metadata = [
		'funcName' => null,
		'params' => [],
		'contract' => [],
		'documentation' => '',
		'sourceCode' => ''
	];

	$sourceCode = file_get_contents($filePath);
	if ($sourceCode === false) {
		return $metadata;
	}
	$metadata['sourceCode'] = $sourceCode;

	if (preg_match('/\/\*\*[\s\*]*@contract\s*\n(.*?)\*\//s', $sourceCode, $matches)) {
		$jsonStr = preg_replace('/^\s*\*\s?/m', '', $matches[1]);
		$parsedJson = json_decode($jsonStr, true);
		if (json_last_error() === JSON_ERROR_NONE && isset($parsedJson['cases'])) {
			$metadata['contract'] = $parsedJson['cases'];
		}
	}

	if (preg_match_all('/\/\*(.*?)\*\//s', $sourceCode, $docMatches)) {
		foreach ($docMatches[1] as $docContent) {
			if (strpos($docContent, '@contract') === false) {
				$cleanDoc = preg_replace('/^\s*\*\s?/m', '', $docContent);
				$metadata['documentation'] .= trim($cleanDoc) . "\n\n";
			}
		}
	}

	if (preg_match('/const\s+(\$[a-zA-Z0-9_]+)\s*=\s*function\s*\(([^)]*)\)/', $sourceCode, $matches)) {
		$metadata['funcName'] = $matches[1];
		$rawParams = explode(',', $matches[2]);
		foreach ($rawParams as $p) {
			$p = trim($p);
			if ($p !== '') {
				$metadata['params'][] = $p;
			}
		}
	}

	return $metadata;
}

function compileJsolInMemory(string $sourcePath, string $compilerDir, string $outDir, array $metadata): array
{
	$polyfillPath = rtrim($compilerDir, '/') . '/dist/stdlib/jsol-core.php';
	if (file_exists($polyfillPath)) {
		require_once $polyfillPath;
	} else {
		return [
			'success' => false,
			'outputLog' => "FATAL: Polyfill jsol-core.php not found at {$polyfillPath}. Run bootstrapper first.",
			'compiledFilename' => null,
			'targets' => []
		];
	}

	$parts = [];
	$scanned = scandir($compilerDir);
	if ($scanned !== false) {
		foreach ($scanned as $f) {
			if (str_ends_with($f, '.php') && $f !== 'index.php' && !str_contains($f, '_') && is_file($compilerDir . '/' . $f)) {
				$parts[] = $f;
			}
		}
		sort($parts);

        // [!] TRAMPA DE OUTPUT BUFFERING: Captura y destruye cualquier HTML escupido por los archivos del compilador
		ob_start();
		foreach ($parts as $part) {
			require_once rtrim($compilerDir, '/') . '/' . $part;
		}
		ob_end_clean();
	}

	foreach (get_defined_vars() as $varName => $varVal) {
		if ($varName !== 'sourcePath' && $varName !== 'compilerDir' && $varName !== 'outDir' && $varName !== 'metadata' && $varName !== 'parts' && $varName !== 'scanned' && $varName !== 'f' && $varName !== 'polyfillPath') {
			$GLOBALS[$varName] = $varVal;
		}
	}

	$sourceCode = file_get_contents($sourcePath);
	if ($sourceCode === false) {
		return [
			'success' => false,
			'outputLog' => "FATAL: Cannot read source file at {$sourcePath}.",
			'compiledFilename' => null,
			'targets' => []
		];
	}

	/** @var callable|null $mNormalizeTargetsConfig */
	$mNormalizeTargetsConfig = $GLOBALS['mNormalizeTargetsConfig'] ?? null;
	/** @var callable|null $mExecuteCompilationPipeline */
	$mExecuteCompilationPipeline = $GLOBALS['mExecuteCompilationPipeline'] ?? null;

	if (!is_callable($mNormalizeTargetsConfig) || !is_callable($mExecuteCompilationPipeline)) {
		return [
			'success' => false,
			'outputLog' => "FATAL: Compiler pipeline functions not initialized from {$compilerDir}.",
			'compiledFilename' => null,
			'targets' => []
		];
	}

	$targetsConfig = $mNormalizeTargetsConfig(null);

	$ssotPath = rtrim($compilerDir, '/') . '/dist/compiler/jsol-spec.json';
	if (!file_exists($ssotPath)) {
		return [
			'success' => false,
			'outputLog' => "FATAL: SSOT spec file not found at {$ssotPath}. Run bootstrapper first.",
			'compiledFilename' => null,
			'targets' => []
		];
	}
	$ssotContent = file_get_contents($ssotPath);
	if ($ssotContent === false) {
		return [
			'success' => false,
			'outputLog' => "FATAL: Unable to read SSOT spec file at {$ssotPath}.",
			'compiledFilename' => null,
			'targets' => []
		];
	}
	$mSSOTData = json_decode($ssotContent, true);

	$jsSuffix = "";
	if (!empty($metadata['funcName'])) {
		$jsSuffix = "\nwindow['" . $metadata['funcName'] . "'] = " . $metadata['funcName'] . ";\n";
	}

	$cliOpts = [
		'jsTarget' => '', 'jsPrefix' => '', 'jsSuffix' => $jsSuffix,
		'phpTarget' => '', 'phpPrefix' => '', 'phpSuffix' => '',
		'tsTarget' => '', 'tsPrefix' => '', 'tsSuffix' => '',
		'pyTarget' => '', 'pyPrefix' => '', 'pySuffix' => ''
	];

	$result = $mExecuteCompilationPipeline($sourceCode, $targetsConfig, $cliOpts, $mSSOTData);

	$baseName = preg_replace('/\.jsol(\.js)?$/', '', basename($sourcePath));
	$compiledJsFilename = $baseName . '.js';

	if (is_array($result) && isset($result['success']) && $result['success'] !== false) {
        // Volcar TODOS los lenguajes generados al disco para habilitar endpoints de descarga
		file_put_contents($outDir . '/' . $baseName . '.js', $result['js'] ?? '');
        if (isset($result['php']) && is_string($result['php'])) file_put_contents($outDir . '/' . $baseName . '.php', $result['php']);
        if (isset($result['ts']) && is_string($result['ts'])) file_put_contents($outDir . '/' . $baseName . '.ts', $result['ts']);
        if (isset($result['py']) && is_string($result['py'])) file_put_contents($outDir . '/' . $baseName . '.py', $result['py']);

		$targets = [
			'jsol' => $sourceCode
		];

		foreach ($result as $key => $code) {
			if ($key !== 'success' && $key !== 'outputLog' && $key !== 'errors' && is_string($code)) {
				$targets[$key] = $code;
			}
		}

		return [
			'success' => true,
			'outputLog' => '',
			'compiledFilename' => $compiledJsFilename,
			'targets' => $targets
		];
	} else {
		$errors = (is_array($result) && isset($result['errors']) && is_array($result['errors'])) ? $result['errors'] : ['Unknown compilation error'];
		return [
			'success' => false,
			'outputLog' => implode("\n", $errors),
			'compiledFilename' => null,
			'targets' => []
		];
	}
}