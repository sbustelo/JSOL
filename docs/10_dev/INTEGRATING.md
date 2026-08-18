# Integration JSOL into your Buil Chain

This document explains how to integrate the JSOL compiler within your own infrastructure, framework, or deployment pipeline (CI/CD), allowing `.jsol`/`.jsol.js` files to be transpiled automatically only when needed.

## The Lazy Compilation Principle

JSOL does not need to run as a daemon or a watcher. The integration standard is **timestamp evaluation**: the integrator script compares the modification date (`mtime`) of the source `.jsol` file against the compiled destination file (e.g. `.php` or `.js`).

-   If the destination does not exist, or if the `.jsol` file is newer (recently modified), the compiler is invoked.
-   If the destination is the same age or newer, the step is skipped.

This way, you can place the integrator script directly in your application's bootstrap during development mode without impacting load times when there are no changes.

## 1. Node.js Integration (Webpack / Vite / Express)

You can create a lightweight Node script that acts as middleware or a pre-build step.

```JavaScript
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function compileJSOLIfNeeded(sourcePath, outDir) {
    const baseName = path.basename(sourcePath).replace(/\.JSOL(\.js)?$/, '');
    const targetJsPath = path.join(outDir, `${baseName}.js`);
    const targetPhpPath = path.join(outDir, `${baseName}.php`);

    let needsCompilation = false;

    // Check if output files exist
    if (!fs.existsSync(targetJsPath) || !fs.existsSync(targetPhpPath)) {
        needsCompilation = true;
    } else {
        // Compare timestamps
        const sourceTime = fs.statSync(sourcePath).mtimeMs;
        const jsTime = fs.statSync(targetJsPath).mtimeMs;
        
        if (sourceTime > jsTime) {
            needsCompilation = true;
        }
    }

    if (needsCompilation) {
        console.log(`[JSOL] Compiling ${baseName}...`);
        try {
            // Calls the JSOL CLI synchronously
            // Adjust the path to your JSOL distribution's index.js
            execSync(`node ./JSOL-compiler-node/index.js --source="${sourcePath}" --out-dir="${outDir}"`, { stdio: 'inherit' });
            console.log(`[JSOL] ${baseName} updated.`);
        } catch (error) {
            console.error(`[JSOL] Compilation failure for ${sourcePath}`);
            process.exit(1); // Fail the build
        }
    }
}

// Example usage in a pipeline:
compileJSOLIfNeeded('./src/logic/taxes.JSOL', './dist/logic');
```

## 2. PHP Integration (Laravel / Symfony / Vanilla)

In a PHP environment, you can inject this routine into your `index.php` (only in local development environments where `APP_ENV=local`) or into an Artisan/Console command for your deployment pipeline.

```PHP
<?php
declare(strict_types=1);

function compileJSOLIfNeeded(string $sourcePath, string $outDir, string $JSOLCompilerPath): void {
    $baseName = preg_replace('/\.JSOL(\.js)?$/', '', basename($sourcePath));
    $targetPhpPath = rtrim($outDir, '/') . '/' . $baseName . '.php';

    $needsCompilation = false;

    if (!file_exists($targetPhpPath)) {
        $needsCompilation = true;
    } else {
        $sourceTime = filemtime($sourcePath);
        $phpTime = filemtime($targetPhpPath);
        
        if ($sourceTime > $phpTime) {
            $needsCompilation = true;
        }
    }

    if ($needsCompilation) {
        // Synchronous call to the JSOL CLI compiler
        $cmd = sprintf(
            'php %s --source=%s --out-dir=%s 2>&1',
            escapeshellarg($JSOLCompilerPath),
            escapeshellarg($sourcePath),
            escapeshellarg($outDir)
        );
        
        exec($cmd, $output, $returnVar);
        
        if ($returnVar !== 0) {
            throw new RuntimeException("[JSOL] Compilation failure in {$sourcePath}:\n" . implode("\n", $output));
        }
    }
}

// Example usage:
$source = __DIR__ . '/business_rules/discount_engine.JSOL';
$outDir = __DIR__ . '/app/CompiledRules';
$compiler = __DIR__ . '/vendor/JSOL/JSOL-compiler-php/index.php';

compileJSOLIfNeeded($source, $outDir, $compiler);

// Now you can safely require the compiled file,
// knowing it is 100% synchronized with the JSOL source code.
require_once $outDir . '/discount_engine.php';
```

## Forced Compilation (CI/CD)

In your Continuous Integration pipeline (GitHub Actions, GitLab CI), do not rely on timestamp caching. Always compile files from scratch before packaging the production artifact to ensure isomorphic parity.

```Bash
# Example pre-build script
echo "Compiling JSOL..."
php vendor/JSOL/JSOL-compiler-php/index.php --source="src/logic/core.JSOL" --out-dir="dist/"
```