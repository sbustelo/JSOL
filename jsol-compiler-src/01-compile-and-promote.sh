set -e

# 1. Reconstruir los targets limpios
rm -rf ../_temp_build && mkdir -p ../_temp_build
node ../jsol-compiler-node/index.js --source-dir="." --out-dir="../_temp_build" --targets=js,php,py,ts

# 2. Promover Node
rm -rf ../jsol-compiler-node.bak
mv ../jsol-compiler-node ../jsol-compiler-node.bak
mkdir -p ../jsol-compiler-node
cp ../_temp_build/*.js ../jsol-compiler-node/
cp index.js targets.json ../jsol-compiler-node/
cp -r dist ../jsol-compiler-node/

# 3. Promover PHP
rm -rf ../jsol-compiler-php.bak
mv ../jsol-compiler-php ../jsol-compiler-php.bak
mkdir -p ../jsol-compiler-php
cp ../_temp_build/*.php ../jsol-compiler-php/
cp index.php index_ui.php targets.json ../jsol-compiler-php/
cp -r dist ../jsol-compiler-php/

# 4. Promover Python
rm -rf ../jsol-compiler-py.bak
mv ../jsol-compiler-py ../jsol-compiler-py.bak
mkdir -p ../jsol-compiler-py
cp ../_temp_build/*.py ../jsol-compiler-py/
cp index.py targets.json ../jsol-compiler-py/
cp -r dist ../jsol-compiler-py/

# 5. Promover TS
rm -rf ../jsol-compiler-ts.bak
mv ../jsol-compiler-ts ../jsol-compiler-ts.bak
mkdir -p ../jsol-compiler-ts
cp ../_temp_build/*.ts ../jsol-compiler-ts/
cp targets.json ../jsol-compiler-ts/
cp -r dist ../jsol-compiler-ts/

# 6. Purgar temporal y correr suite final
rm -rf ../_temp_build
bash 00-compile-verify-jsol.sh