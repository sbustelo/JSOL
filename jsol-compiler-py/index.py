#!/usr/bin/env python3
#
# JSOL CLI Host Runner (Python) — mirrors index.js's logic exactly, since
# that's the known-correct reference. Any future change to how index.js
# calls the pipeline should be mirrored here too.

import sys
import os
import json

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # 1. Load JSOL Polyfills (Str/Arr/Map/JSOL) — same role as jsol-core.js
    stdlib_dir = os.path.join(script_dir, 'dist', 'stdlib')
    if stdlib_dir not in sys.path:
        sys.path.insert(0, stdlib_dir)

    try:
        import jsol_core
    except ImportError:
        print("FATAL: dist/stdlib/jsol_core.py not found. Run bootstrapper first.")
        sys.exit(1)

    shared_globals = {
        '__builtins__': __builtins__,
        'JSOL': jsol_core.JSOL,
        'math': __import__('math'),
        're': __import__('re')
    }

    # 2. Load and execute compiled engine parts — same list/order as index.js
    parts = [
        'lexer.py',
        'linter.py',
        'cli-parser.py',
        'config-parser.py',
        'regex.py',
        'indenter.py',
        'js-compiler.py',
        'php-compiler.py',
        'python-compiler.py',
        'python-ternary.py',
        'python-brace-strip.py',
        'engine.py'
    ]

    for part in parts:
        part_path = os.path.join(script_dir, part)
        if not os.path.exists(part_path):
            print(f"Fatal Error: Compiled engine part '{part_path}' not found. Run bootstrapping first.")
            sys.exit(1)
        with open(part_path, 'r', encoding='utf-8') as f:
            exec(f.read(), shared_globals)

    parse_raw_cli_args = shared_globals.get('_mParseRawCliArgs')
    normalize_targets_config = shared_globals.get('_mNormalizeTargetsConfig')
    execute_pipeline = shared_globals.get('_mExecuteCompilationPipeline')

    if not parse_raw_cli_args:
        print("Fatal Error: '_mParseRawCliArgs' not found.")
        sys.exit(1)
    if not normalize_targets_config:
        print("Fatal Error: '_mNormalizeTargetsConfig' not found.")
        sys.exit(1)
    if not execute_pipeline:
        print("Fatal Error: Pipeline function '_mExecuteCompilationPipeline' not found.")
        sys.exit(1)

    # 3. Parse CLI args THROUGH the real JSOL function, not a hand-rolled dict —
    # same raw argv slice index.js passes to $mParseRawCliArgs.
    raw_args = sys.argv[1:]
    cli_options = parse_raw_cli_args(raw_args)

    source_path = cli_options.get('source')
    if not source_path:
        print("Usage: python3 index.py --source=file.jsol [--out-dir=dir] [--targets=js,php,ts,py]")
        sys.exit(1)

    if not os.path.exists(source_path):
        print(f"Error: Source file '{source_path}' does not exist.")
        sys.exit(1)

    # 4. Load + normalize targets.json — same two-step index.js does.
    targets_json_path = os.path.join(script_dir, 'targets.json')
    raw_config = None
    if os.path.exists(targets_json_path):
        try:
            with open(targets_json_path, 'r', encoding='utf-8') as f:
                raw_config = json.load(f)
        except Exception as e:
            print(f"Warning: Failed to parse targets.json: {e}")
    targets_config = normalize_targets_config(raw_config)

    # 5. Load the SSOT — index.py never did this before, and the pipeline
    # requires it as its 4th argument.
    ssot_path = os.path.join(script_dir, 'dist', 'compiler', 'jsol-spec.json')
    if not os.path.exists(ssot_path):
        print("FATAL: dist/compiler/jsol-spec.json not found. Run bootstrapper first.")
        sys.exit(1)
    with open(ssot_path, 'r', encoding='utf-8') as f:
        ssot_config = json.load(f)

    with open(source_path, 'r', encoding='utf-8') as f:
        source_code = f.read()

    # 6. Call the pipeline with the SAME argument order index.js uses:
    # (sourceCode, targetsConfig, cliOptions, ssotConfig) — NOT the order
    # the old index.py used.
    result = execute_pipeline(source_code, targets_config, cli_options, ssot_config)

    if result.get('success') is False:
        print("Compilation Failed with errors:")
        for err in result.get('errors', []):
            print(f" - {err}")
        sys.exit(1)

    out_dir = cli_options.get('outDir') or os.path.dirname(source_path) or '.'
    os.makedirs(out_dir, exist_ok=True)

    base_name = os.path.basename(source_path)
    if base_name.endswith('.jsol.js'):
        base_name = base_name[:-8]
    elif base_name.endswith('.jsol'):
        base_name = base_name[:-5]

    targets_arg = ['js', 'php', 'ts', 'py']
    if cli_options.get('targets'):
        targets_arg = [t.strip().lower() for t in cli_options['targets'].split(',')]

    print("JSOL Compilation Success:")

    if 'js' in targets_arg and result.get('js'):
        p = os.path.join(out_dir, base_name + '.js')
        with open(p, 'w', encoding='utf-8') as f:
            f.write(result['js'])
        print(f" -> JS:  {p}")

    if 'php' in targets_arg and result.get('php'):
        p = os.path.join(out_dir, base_name + '.php')
        with open(p, 'w', encoding='utf-8') as f:
            f.write(result['php'])
        print(f" -> PHP: {p}")

    if 'ts' in targets_arg and result.get('ts'):
        p = os.path.join(out_dir, base_name + '.ts')
        with open(p, 'w', encoding='utf-8') as f:
            f.write(result['ts'])
        print(f" -> TS:  {p}")

    if 'py' in targets_arg and result.get('py'):
        p = os.path.join(out_dir, base_name + '.py')
        with open(p, 'w', encoding='utf-8') as f:
            f.write(result['py'])
        print(f" -> PY:  {p}")

if __name__ == "__main__":
    main()
