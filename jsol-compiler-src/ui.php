<?php
declare(strict_types=1);

$outputHTML = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $source = $_POST['source'] ?? '';
    $outDir = $_POST['outDir'] ?? '';
    
    if (empty($source) || !file_exists($source)) {
        $outputHTML = "<strong>Error:</strong> Source file '{$source}' does not exist.";
    } else {
        if (!empty($outDir) && !is_dir($outDir)) {
            mkdir($outDir, 0777, true);
        }
        
        $sourceCode = file_get_contents($source);
        $targetsJsonPath = __DIR__ . '/targets.json';
        $rawConfig = file_exists($targetsJsonPath) ? json_decode(file_get_contents($targetsJsonPath), true) : null;
        
        $targetsConfig = $mNormalizeTargetsConfig($rawConfig);
        
        $cliOptions = [
            'source' => $source,
            'outDir' => $outDir,
            'jsTarget' => '', 'jsPrefix' => '', 'jsSuffix' => '',
            'phpTarget' => '', 'phpPrefix' => '', 'phpSuffix' => ''
        ];
        
        $result = $mExecuteCompilationPipeline($sourceCode, $targetsConfig, $cliOptions);
        
        if ($result['success'] === false) {
            $outputHTML = "<strong>Compilation Failed with errors:</strong><br>" . implode("<br>", $result['errors']);
        } else {
            $finalOutDir = strlen($outDir) > 0 ? $outDir : dirname($source);
            $baseName = preg_replace('/\.jsol(\.js)?$/', '', basename($source));
            
            $targetJsFile = $finalOutDir . '/' . $baseName . '.js';
            $targetPhpFile = $finalOutDir . '/' . $baseName . '.php';
            
            file_put_contents($targetJsFile, $result['js']);
            file_put_contents($targetPhpFile, $result['php']);
            
            $outputHTML = "<strong>JSOL Compilation Success:</strong><br> -> JS: {$targetJsFile}<br> -> PHP: {$targetPhpFile}";
        }
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>JSOL Web Compiler</title>
</head>
<body>
    <h1>JSOL Web Compiler</h1>
    
    <?php if ($outputHTML !== ''): ?>
        <div>
            <?= $outputHTML ?>
        </div>
        <hr>
    <?php endif; ?>

    <form method="POST">
        <div style="margin-bottom: 15px;">
            <label><strong>Current Working Directory:</strong></label><br>
            <code><?= __DIR__ ?></code>
        </div>
        <div style="margin-bottom: 15px;">
            <label for="source"><strong>Source File (Absolute or Relative):</strong></label><br>
            <input type="text" id="source" name="source" value="<?= htmlspecialchars($_POST['source'] ?? '') ?>" required size="80">
        </div>
        <div style="margin-bottom: 15px;">
            <label for="outDir"><strong>Output Directory (Leave empty for same as source):</strong></label><br>
            <input type="text" id="outDir" name="outDir" value="<?= htmlspecialchars($_POST['outDir'] ?? '') ?>" size="80">
        </div>
        <button type="submit">Compile</button>
    </form>
</body>
</html>