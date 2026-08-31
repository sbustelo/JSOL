// [!] CREAR ARCHIVO: 00-REGLAS-DE-DESARROLLO.md

# REGLAS ESTRICTAS DE DESARROLLO DEL COMPILADOR JSOL

## 1. PREVENCIÓN DE CORRUPCIÓN EN PHP (EL RIESGO DE LAS COMILLAS DOBLES)
Debido a que el compilador JSOL transpila isomórficamente a PHP, el uso de comillas dobles en cadenas que contengan el sigilo `$` representa un vector crítico de corrupción sintáctica. PHP intentará interpolar automáticamente cualquier variable detectada dentro de comillas dobles, destruyendo expresiones regulares y plantillas AOT.

**REGLA:** 
Queda ESTRICTAMENTE PROHIBIDO usar comillas dobles para envolver strings que contengan explícitamente el signo `$`.
* ❌ MAL: `let $saError = "La variable $name no existe";` (PHP lo evaluará y romperá).
* ❌ MAL: `Regex.replace("(\\$s[A-Za-z0-9_]*)", ...)`
* ✅ BIEN: `let $saError = 'La variable $name no existe';` (Usar siempre comillas simples).
* ✅ BIEN: `Regex.replace('(\\$s[A-Za-z0-9_]*)', ...)`

## 2. VARIABLES DE BUCLE Y TIPADO ESTRICTO
Todo el código del compilador debe ser JSOL válido y auditable por su propio sistema de tipos (`types.json`).
* Los índices de bucle estándar `i`, `j`, `k` DEBEN llevar el prefijo `$i` (Index/Int32).
* ❌ MAL: `for (let $k = 0; ...)` (El tipo 'k' no existe).
* ✅ BIEN: `for (let $iK = 0; ...)`
* ❌ MAL: `for (let $d = $iBraceDepth; ...)` (El tipo 'd' está reservado).
* ✅ BIEN: `for (let $iD = $iBraceDepth; ...)`