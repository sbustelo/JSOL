# 06\. ESPECIFICACIÓN DE PIPELINES DE COMPILACIÓN Y BACKENDS (JSOL SPEC 0.3.0)

> DISCLAIMER PRE-1.0: Este documento define la especificación target para la versión 0.3.0, en proceso de validación experimental a partir del build de transición 0.2.97. Todo el contenido se encuentra en proceso de iteración y revisión continua. Ninguna interfaz o definición se considera estable o congelada hasta la declaración formal de la versión 1.0.0.

## 1\. ARQUITECTURA DEL PIPELINE DE COMPILACIÓN

El compilador JSOL opera mediante una secuencia de pasadas secuenciales (Multi-Pass Pipeline). Cada pasada recibe el código transformado por la etapa anterior, aplicando auditorías, extracciones de metadatos o reescrituras sintácticas atómicas hasta emitir el código final en el lenguaje target.

### 1.1 Diagrama Secuencial de Pasadas (0000-9000)

\[Entrada: Código .jsol\] │ ▼ \[0300\] Linter y SSOT Guard ───> Aborta si hay errores fatales (pragmas, .length, colisiones) │ ▼ \[0400\] Escáner AOT y Símbolos ───> Registra variables por raíz y gestiona scope ($iBraceDepth) │ ▼ \[1000\] Módulos de Target ───> Traductores específicos (1010-JS, 1110-PHP, 1220-PY, etc.) │ ▼ \[9000\] Engine Pipeline Registry ───> Orquestador OCP que ejecuta el backend seleccionado │ ▼ \[Salida: Código Target (.js, .php, .py, .c)\]

### 1.2 Descripción de Pasadas Principales

-   Pasada 0300 ('0300-linter-main.jsol'): Auditoría estática previa. Valida la presencia de pragmas obligatorios, detecta construcciones prohibidas (.length, .map(), with), verifica delimitadores de tipo ('\_' o CamelCase) e identifica colisiones de raíz de distinto tipo en la misma profundidad de llaves ($iBraceDepth).
-   Pasada 0400 ('0400-compiler-helpers.jsol'): Construcción de la Tabla de Símbolos AOT. Escanea y registra identificadores, mapea prefijos a tipos físicos y maneja la pila de contextos para aislar variables locales.
-   Pasadas 1000-1900 (Traductores de Backend): Colección de submódulos de transformación específicos por lenguaje. Reemplazan firmas de funciones, ajustan operadores de control de flujo e inyectan la referencia al Canal Sombra ($JSOL\_m\_{v}\_ok).
-   Pasada 9000 ('9000-engine-pipeline.jsol'): Punto de consolidación. Recibe el código transformado y la configuración de build, invocando al backend correspondiente registrado en el mapa maestro.

## 2\. EL REGISTRO DE BACKENDS OCP ($mBackendRegistry)

Para cumplir con el Principio de Abierto/Cerrado (Open/Closed Principle - OCP), el motor reemplaza todas las estructuras condicionales hardcodeadas por un Registro Dinámico de Backends ($mBackendRegistry).

### 2.1 Estructura del Registro

Cada target soportado se registra como un par clave-valor en el mapa asociativo $mBackendRegistry, donde la clave es el identificador del target ("js", "php", "py", "ts", "c") y el valor es la referencia a la función orquestadora principal de ese backend:

$mBackendRegistry\["js"\] = $fCompileBackendJS; $mBackendRegistry\["php"\] = $fCompileBackendPHP; $mBackendRegistry\["py"\] = $fCompileBackendPY; $mBackendRegistry\["ts"\] = $fCompileBackendTS;

### 2.2 Incorporación de Nuevos Targets

Agregar soporte para un nuevo lenguaje (ej. C o Rust) requiere únicamente:

1.  Crear la función orquestadora $fCompileBackendX.
2.  Registrar la función en $mBackendRegistry\["x"\] = $fCompileBackendX.
3.  Cargar las reglas sintácticas en targets/x/rules.json.

El motor central ('9000-engine-pipeline.jsol') permanece intacto y cerrado a modificación.

## 3\. TRADUCTORES Y ORDENAMIENTO EN PIPELINES DE TARGETS

La transpilación basada en transformaciones léxicas y patrones exige un ordenamiento estricto de dependencias entre pasadas. Alterar el orden de ejecución de los traductores puede causar corrupción sintáctica o fallos de parseo.

### 3.1 Pipeline del Backend Python (1200-1290)

En el backend de Python, el orden de las pasadas es crítico debido a la transformación de operadores infijos y ternarios:

-   Paso 1220 ('1220-py-translators.jsol'): Sanitización Nivel 2. Elimina el sigilo '$' de las variables y apendiza un guion bajo a las palabras reservadas de Python (ej. pass ──> pass\_).
-   Paso 1230 ('1230-py-operators.jsol'): Transforma operadores lógicos y relacionales C-like a sintaxis Python (&& ──> and, || ──> or, ! ──> not, true ──> True, false ──> False).
-   Paso 1240 ('1240-python-ternary.jsol'): Traduce expresiones ternarias (A ? B : C ──> B if A else C).

Regla de Dependencia Inviolable (1230 antes de 1240): La pasada 1230 DEBE ejecutarse estrictamente antes que la pasada 1240. Si 1240 intentara procesar un ternario conteniendo operandos booleanos no traducidos (ej. !$b1 ? $n2 :$n3), la expresión regular del ternario fallaría o produciría una sintaxis corrupta en Python.

### 3.2 Extractor de Closures en PHP ('1110-php-use-extractor.jsol')

En el backend de PHP, las funciones anónimas no heredan por defecto las variables del scope padre. La pasada 1110 analiza el cuerpo de las funciones anónimas, identifica las variables libres (no declaradas localmente ni como parámetros) e inyecta automáticamente la cláusula 'use (&$var)' en la firma de la función. Esto elimina la necesidad de llamadas manuales a 'JSOL.use()' en el código de negocio.

## 4\. HOST RUNNERS Y CARGA DINÁMICA DE MÓDULOS

Los orquestadores de entrada en cada entorno ('index.js' en Node.js, 'index.php' en PHP CLI, 'index.py' en Python CLI) aplican un mecanismo de Carga Dinámica de Módulos desacoplado de listas fijas de archivos.

### 4.1 La Convención de Ignorado (\_ = ignore)

Los host runners escanean el directorio de módulos del compilador aplicando la convención universal del proyecto:

-   Archivos Válidos: Cualquier archivo .jsol cuyo nombre inicie con un prefijo numérico de pasada (ej. 0300, 0400, 1010, 9000) se carga y concatena automáticamente en el pipeline de ejecución.
-   Archivos Ignorados (_): Cualquier archivo o carpeta cuyo nombre contenga o inicie con un guion bajo '_' (ej. \_archive/, \_draft.jsol) es ignorado automáticamente por el escáner del host runner.

### 4.2 Cero Modificación en Host Runners

Gracias al escaneo dinámico y la convención '\_ = ignore', incorporar un nuevo módulo de compilación (ej. '1020-js-regex.jsol') sólo requiere soltar el archivo en la carpeta correspondiente. El host runner lo descubre e incluye automáticamente en el siguiente ciclo de compilación sin modificar los archivos 'index.\*'.

## 5\. APÉNDICE: TABLA DE ESTADO Y TRAZABILIDAD (SPEC 0.3.0 / BUILD 0.2.97)

| Componente / Módulo | Estado de Disposición | Build / Target | Notas de Implementación |
| --- | --- | --- | --- |
| Linter y SSOT Guard (0300) | IMPLEMENTADO / ESTABLE | Build 0.2.97 | Valida pragmas, delimitadores y previene colisiones. |
| Tabla Símbolos AOT (0400) | IMPLEMENTADO / ESTABLE | Build 0.2.97 | Normalización de raíces y control por $iBraceDepth. |
| Extractor PHP Closures (1110) | IMPLEMENTADO / ESTABLE | Build 0.2.97 | Inyección automática de use (&$var). |
| Sanitización Python N2 (1220) | IMPLEMENTADO / ESTABLE | Build 0.2.97 | Remoción de $ y escapado de palabras reservadas. |
| Orden Pipeline Python (1230 -> 1240) | IMPLEMENTADO / FIX OK | Build 0.2.97 | Orden de ejecución corregido para evitar corrupción. |
| Registro OCP $mBackendRegistry (9000) | IMPLEMENTADO / ESTABLE | Build 0.2.97 | Despacho de backends por mapa asociativo. |
| Convención \\_ = ignore en Hosts | IMPLEMENTADO / ESTABLE | Build 0.2.96 | Escaneo dinámico de directorio en runners. |
