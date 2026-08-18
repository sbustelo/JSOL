#!/bin/bash

ROOT_DIR="${1:-.}"

find "$ROOT_DIR" -type f -name "*.jsol.js" -print0 | while IFS= read -r -d '' file; do
    perl -i -pe 's/^(\s+)\*\s?/$1/ if /^\s+\*/ && !/^\s+\/\*/' "$file"
    echo "Procesado: $file"
done