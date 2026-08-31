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

    # 2. Load and execute compiled engine parts. "parts" is no longer a
    # hardcoded list — every *.py file next to this one is loaded, except
    # index.py itself and any file whose name contains "_" (same convention
    # as _logs/_seed_engine/_build_* elsewhere: underscore means "not a
    # compiler part"). Load order doesn't matter: every part only DEFINES
    # functions at load time, nothing calls anything cross-file until the
    # CLI execution below runs, by which point every part is already loaded.
    parts = sorted([
        f for f in os.listdir(script_dir)
        if f.endswith('.py')
        and f != 'index.py'
        and '_' not in f
        and os.path.isfile(os.path.join(script_dir, f))
    ])

    if not parts:
        print("Fatal Error: No compiler parts (*.py) found next to index.py. Run bootstrapping first.")
        sys.exit(1)

    for part in parts:
        part_path = os.path.join(script_dir, part)
        with open(part_path, 'r', encoding='utf-8') as f:
            exec(f.read(), shared_globals)

    parse_raw_cli_args = shared_globals.get('mParseRawCliArgs')
    normalize_targets_config = shared_globals.get('mNormalizeTargetsConfig')
    execute_pipeline = shared_globals.get('mExecuteCompilationPipeline')

    if not parse_raw_cli_args:
        print("Fatal Error: 'mParseRawCliArgs' not found.")
        sys.exit(1)
    if not normalize_targets_config:
        print("Fatal Error: 'mNormalizeTargetsConfig' not found.")
        sys.exit(1)
    if not execute_pipeline:
        print("Fatal Error: Pipeline function 'mExecuteCompilationPipeline' not found.")
        sys.exit(1)

# 3. Parse CLI args
    raw_args = sys.argv[1:]
    cli_options = parse_raw_cli_args(raw_args)

    source_path = cli_options.get('source') or ''
    source_dir = cli_options.get('sourceDir') or ''

    if not source_dir and source_path and os.path.isdir(source_path):
        source_dir = source_path
        source_path = ''

    if not source_path and not source_dir:
        print("Usage: python3 index.py [--source=file.jsol | --source-dir=dir] [--out-dir=dir] [--targets=js,php,ts,py]")
        sys.exit(1)

    files_to_compile = []
    if source_dir:
        if not os.path.exists(source_dir):
            print(f"Error: Source directory '{source_dir}' does not exist.")
            sys.exit(1)
        for f in os.listdir(source_dir):
            if (f.endswith('.jsol') or f.endswith('.jsol.js')) and not f.startswith('_'):
                files_to_compile.append(os.path.join(source_dir, f))
    elif os.path.exists(source_path):
        files_to_compile.append(source_path)
    else:
        print(f"Error: Source file '{source_path}' does not exist.")
        sys.exit(1)

    # 4. Load + normalize targets.json
    targets_json_path = os.path.join(script_dir, 'targets.json')
    raw_config = None
    if os.path.exists(targets_json_path):
        try:
            with open(targets_json_path, 'r', encoding='utf-8') as f:
                raw_config = json.load(f)
        except Exception as e:
            print(f"Warning: Failed to parse targets.json: {e}")
    targets_config = normalize_targets_config(raw_config)

    # 5. Load the SSOT
    ssot_path = os.path.join(script_dir, 'dist', 'compiler', 'jsol-spec.json')
    if not os.path.exists(ssot_path):
        print("FATAL: dist/compiler/jsol-spec.json not found. Run bootstrapper first.")
        sys.exit(1)
    with open(ssot_path, 'r', encoding='utf-8') as f:
        ssot_config = json.load(f)

    # 6. Execute Compilation Pipeline in Batch
    for file_path in files_to_compile:
        with open(file_path, 'r', encoding='utf-8') as f:
            source_code = f.read()

        result = execute_pipeline(source_code, targets_config, cli_options, ssot_config)

        if result.get('success') is False:
            print(f"Compilation Failed for {file_path} with errors:")
            for err in result.get('errors', []):
                print(f" - {err}")
            sys.exit(1)

        out_dir = cli_options.get('outDir') or os.path.dirname(file_path) or '.'
        os.makedirs(out_dir, exist_ok=True)

        base_name = os.path.basename(file_path)
        if base_name.endswith('.jsol.js'):
            base_name = base_name[:-8]
        elif base_name.endswith('.jsol'):
            base_name = base_name[:-5]

        targets_arg = ['js', 'php', 'ts', 'py']
        if cli_options.get('targets'):
            targets_arg = [t.strip().lower() for t in cli_options['targets'].split(',')]

        print(f"JSOL Compilation Success ({base_name}):")

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