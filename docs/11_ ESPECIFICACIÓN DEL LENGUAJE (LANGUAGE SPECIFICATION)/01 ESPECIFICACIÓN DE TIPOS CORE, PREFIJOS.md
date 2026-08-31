# ESPECIFICACIÓN DE TIPOS CORE, PREFIJOS Y TABLA DE SÍMBOLOS (JSOL SPEC 0.3.0, draft 0.2.97 2026-08-28)

> DISCLAIMER PRE-1.0: Este documento define la especificación target para la versión 0.3.0, en proceso de validación experimental a partir del build de transición 0.2.97. Todo el contenido se encuentra en proceso de iteración y revisión continua. Ninguna interfaz o definición se considera estable o congelada hasta la declaración formal de la versión 1.0.0.

## 1\. FILOSOFÍA DE DISEÑO Y CRITERIOS GENERALES

### 1.1 Origen y Propósito

JSOL (Javascript Source Of Logic) nace como un experimento de aprovechar las similitudes entre lenguajes C-like para lograr una "lingua franca" para lógica de negocio, económica de traspilar a lenguajes target (actualmente JavaScript, PHP, Python, TypeScript; la visión propone llegar a C) sin requerir un compilador pesado basado en AST (Abstract Syntax Tree) ni tiempo de ejecución complejo.

Pilares:
- Claridad (debe ser legible para el dueño de la lógica de negocio, no sólo por el compilador)
- Portabilidad: el código fuente corre correctamente en todos los target, entregando estrictamente los mismos resultados dados los mismos input. Esto implica resolver divergencias semánticas de los lenguajes target, entre otras complejidades.
- Performance: El código compilado no debe ser más pesado ni más lento que lo necesario.
- Developer Experience: escribir, compilar y debuggear JSOL debe ser tan libre de fricciones como lo permitan las restricciones.

La especificación JSOL se construye sobre el "principio de Ambición": proponer metas que probablemente no sean realistas, pero implican desafíos y restricciones completas. En particular, el dominio de lógica de negocio está hoy dominado en la práctica por Excel, que "funciona de contrabando" por canales informales: _JSOL debería ser comprensible por un usuario de Excel y eventualmente, reemplazarlo como estándar_. Otra medida ambiciosa de claridad es considerar su posible uso como pseudocódigo ejecutable en Ciencias de la Computación; ello cual derivó en mejores decisiones en sistemas de tipos y dominios.


### 1.2 Tono de Ingeniería y Trade-offs Asumidos

La arquitectura de JSOL no pretende ser la solución teórica más elegante, sino la más eficiente bajo restricciones de costos y portabilidad:

-   **Uso del Sigilo '$':** Se adopta la incomodidad sintáctica de PHP en todos los targets para permitir la extracción de metadatos de tipo directamente en la fase de escaneo léxico O(1).
-   **Transpilación por Sustitución Léxica:** Se limita intencionalmente la gramática para permitir un motor compilador lo más reducido posible (ej. menos de 1000 líneas), potencialmente capaz de ser ejecutado o interpretado en cualquier entorno con cero dependencias.
-   **Ley de Postel (Postel's Law):** Siempre que no conspire contra la simplicidad, el compilador deberá ser liberal en la entrada y estricto en la salida (emite código fuertemente tipado y predecible). La Experiencia de Desarrollador (DX) es estrictamente secundaria frente a la obligación matemática de asegurar que el código compila y produce resultados idénticos en cualquier runtime.
-   **Criterio Excel:** Ante ambigüedades entre lenguajes objetivo, el comportamiento por defecto se resuelve a favor de la expectativa de un usuario de hojas de cálculo de negocios.

## 2\. SISTEMA DE TIPOS Y NIVELES DE ABSTRACCIÓN

A partir de v0.2.97, el sistema de tipos de JSOL se diseña en dos ejes ortogonales: el Eje Semántico (lógica de negocio) y el Eje Físico (representación en memoria para lenguajes de bajo nivel).

### 2.1 Eje Semántico (Tipos Core)

Definidos a nivel de 1 letra minúscula después del sigilo '$', separados del nombre (case insensitive) por guión bajo o uso de mayúsculas:

-   `$n`: Number / Float (Número de punto flotante de doble precisión). Ej.: $nValor, $n_valor.
-   `$s`: String (Cadena de texto genérica / indeterminada). Ej.: $sTexto, $s_texto, $s_TEXTO.
-   `$a`: Array (Arreglo secuencial). Ej.: $aLista, $a_lista, $aLISTA.
-   `$m`: Map (Diccionario Hash / Tabla asociativa). Ej.: $mCosas, $m_COSAS, etc.
-   `$b`: Boolean (Valor lógico estricto `true` o `false`). Ej.: $bEsCierto, $b_escierto, etc.
-   `$f`: Function (Referencia a función / closure). Ej.: const $fFuncion = …
-   `$x`: Regex (Expresión regular acotada a subset seguro). Ej.: $xRegex.
-   `$y`: Byte / Binary (Buffer de bytes crudos). Ej.: $yFlags.

Los nombres largos de los tipos core (ej. "Number") se consideran reservados.

### 2.2 Compatibilidad Histórica (transición) en v.0.2.97.

v0.2.97 es una versión de transición que acepta en la entrada prefijos deprecados, provenientes de versiones anteriores: `$i` (Index / Int32) y `$q` (Quantity / Int64). En la Tabla de Símbolos AOT, `$i` se mapea al tipo físico `$ni32` y `$q` al tipo físico `$ni64`, manteniendo compatibilidad sin degradar la especificación canónica centrada en `$n`. Una vez portado el compilador y todos los ejemplos a la nueva especificación, se eliminará el soporte.

v0.2.97 permite la declaración de variables consistentes solamente de un prefijo (ej. $i).
Se debe considerar deprecado y probablemente no soportado en un futuro.


### 2.3 Eje Físico (`$nxxx` para C / Rust / Go)

Para la transpilación hacia lenguajes de bajo nivel (JSOL-C), el tipo `$n` se despliega (por el dev o en su defecto, por el compilador en los casos posibles según mejor heurística aplicable dentro de las restricciones) en 10 subtipos físicos explícitos mediante la combinación de la letra de naturaleza (`i` para entero con signo, `u` para entero sin signo, `f` para flotante) y los dígitos de ancho de bits.

Los tipos secundarios se identifican con dos letras, y opcionalmente dígitos después.

-   **Enteros con signo:** `$ni8`, `$ni16`, `$ni32`, `$ni64` (mapeados a `int8_t`, `int16_t`, `int32_t`, `int64_t` en C).
-   **Enteros sin signo:** `$nu8`, `$nu16`, `$nu32`, `$nu64` (mapeados a `uint8_t`, `uint16_t`, `uint32_t`, `uint64_t` en C).
-   **Punto flotante:** `$nf32` (`float`), `$nf64` (`double`).

Para una mejor Developer Experience, se está considerando un mecanismo de Shadow Map que permita emplear el prefijo completo tan solo en la declaración de la variable, pudiendo después emplear solamente el nombre sin prefijo.


### 2.4 Subtipos Físicos de String (`$sa`, `$su`, `$s`)

-   `$sa` (ASCII Explícito): Garantiza que cada carácter ocupa exactamente 1 byte. Permite despacho estático a funciones O(1) nativas (`substring` en JS, `substr` en PHP).
-   `$su` (Unicode Explícito): Garantiza operación segura sobre Code Points Unicode. Despacha a funciones O(N) (`mb_substr` en PHP, iteradores de Code Points en JS).
-   `$s` (Indeterminado / Genérico): Representa incertidumbre. En runtime en lenguajes dinámicos, se está considernado que la primera operación funcional evalúe la cadena vía Regex O(N) y memoice el resultado en el Shadow Map para subsiguientes accesos O(1).

### 2.5 Prefijos Custom (Regla de Dominio)

Para dominios especializados (ej. `$colHex` para color science), los tipos custom deben cumplir dos reglas estrictas:

1.  Longitud mínima de 3 caracteres alfabéticos después del sigilo `$`.
2.  Falla obligatoria del test de pertenencia por prefijo (`indexOf`) contra los nombres largos de los tipos core (ej. `$numb` se rechaza porque `number` inicia con `numb`).


## 3\. DECLARACIÓN, DELIMITADORES Y NORMALIZACIÓN DE RAÍZ

### 3.1 Delimitadores Obligatorios (Regla del Linter)

En la primera declaración de una variable, el prefijo de tipo debe separarse de la raíz del nombre mediante un guion bajo (`_`), un salto a Mayúscula (CamelCase), o frontera de dígitos propios del tipo.

-   **Formatos válidos:** `let $ni32_pepito = 10;`, `let $ni32Pepito = 10;`, `let $ni32pepito = 10;`.
-   **Formato inválido:** `let $npepito = 10;` (Provoca error fatal `LINTER_PREFIX_DELIMITER_REQUIRED` por falta de frontera sintáctica).






### 3.2 Normalización de Raíz y Uso Posterior

Una vez registrada la variable en la Tabla de Símbolos, se está evaluando la implementación de Shadow Map que permita referenciarla en el código subsecuente utilizando únicamente la raíz precedida por `$`, case insensitive:

-   **Ejemplo:** Tras declarar `let $ni32Pepito = 10;`, es válido escribir `$pepito = Math.sum($pepito, 1);`.
-   **Normalización Case-Insensitive:** La raíz se almacena en minúsculas en la Tabla de Símbolos. `$pepito`, `$Pepito` y `$PEPITO` refieren exactamente a la misma variable.

## 4\. TABLA DE SÍMBOLOS Y AISLAMIENTO DE SCOPE (AOT)

### 4.1 Registros de la Tabla de Símbolos

Durante la Pasada 1 de escaneo, la Tabla de Símbolos registraría para cada entrada:

-   `canonicalName`: Identificador completo con prefijo (ej. `$ni32Pepito`).
-   `physicalType`: Subtipo físico resuelto (ej. `ni32`).
-   `rootName`: Raíz normalizada (ej. `pepito`).
-   `braceDepth`: Nivel de anidamiento de llaves (`$iBraceDepth`).

### 4.2 Aislamiento de Scope por Pila de Llaves

El compilador mantiene la variable `$iBraceDepth`. Al detectar `{`, el contador incrementa; al detectar `}`, el compilador purga de la Tabla de Símbolos todas las entradas cuyo `braceDepth` coincide con el nivel que se cierra. Esto permitiría reutilizar la misma raíz en bloques `if` o bucles paralelos sin interferencias. **El mecanismo se está evaluando y podría desaparecer** en caso que complique al compilador más alá de lo que se considere aceptable. 

**Lo más recomedable es no reutilizar variables**, lo cual puede tener el efecto secundario de mejorar la legibilidad del código y reducir errores por principiantes (que previsiblemente podrían no entender el scoping).

### 4.3 Detección de Colisiones de Raíz

Si en un mismo nivel de scope se declaran dos variables con distinto tipo pero la misma raíz (ej. `let $sCents` y `let $qCents`), el Linter emite un error fatal `LINTER_FATAL_ROOT_COLLISION` al detectar la ambigüedad, bloqueando la compilación.

_Se había considerado permitir la declaración, y emitir el error sólo si se usaba el nombre ambigüo sin prefijo. Finalmente, la regla resultó demasiado compleja y se simplificó en el criterio documentado._


## 5\. APÉNDICE: TABLA DE ESTADO Y TRAZABILIDAD (SPEC 0.3.0 / BUILD 0.2.97)

| Elemento / Feature | Estado de Disposición | Build / Target | Notas de Implementación |
| --- | --- | --- | --- |
| Subtipos `$sa` / `$su` | DECIDIDO / EN PRUEBA | Build 0.2.97 | Implementado despacho estático y evaluación LAZY en runtime. |
| Subtipos `$nxxx` (10 tipos) | DECIDIDO | Spec 0.3.0 | Mapeo cerrado para JSOL-C. |
| Soporte `$i` / `$q` (Postel) | DECIDIDO | Build 0.2.97 | Soportado en entrada, mapeado AOT a `$ni32` y `$ni64`. |
| Tabla de Símbolos por Raíz | EN PRUEBA | Build 0.2.97 | Implementado en `0400-compiler-helpers.jsol`. |
| Purgado por `$iBraceDepth` | DECIDIDO | Build 0.2.97 | Isolation de scope funcional en lexer. |
| Prefijos Custom (3+ letras) | DECIDIDO | Spec 0.3.0 | Linter de no-colisión contra nombres largos. |
| Linter Colisión de Raíz | EN PRUEBA | Build 0.2.97 | Detecta y frena compilación ante ambigüedad. |
