/**
 * JSOL Core Polyfills v0.2.97 (JavaScript Runtime)
 * Se inyectan en el entorno global para soportar funciones primitivas y Canal de Sombras JSOL.
 */
const jsolGlobal = {
    JSOL: {
        $JSOL_m_lastFunction_ok: { ok: true, type: "NONE", source: "NONE", args: {} },
        _shadowLocked: false,
        resetShadow: function() {
            this.$JSOL_m_lastFunction_ok = { ok: true, type: "NONE", source: "NONE", args: {} };
            this._shadowLocked = false;
        },
        setShadow: function(ok, type, source, args) {
            if (this._shadowLocked) return;
            this.$JSOL_m_lastFunction_ok = { ok: ok, type: type, source: source, args: args };
            if (!ok) this._shadowLocked = true;
        },
        ok: function() { return this.$JSOL_m_lastFunction_ok.ok; },
        dict: function(...args) {
            const obj = {};
            for (let i = 0; i < args.length; i += 2) {
                obj[args[i]] = args[i + 1];
            }
            return obj;
        },
        count: function(arr) { return arr ? arr.length : 0; },
        len: function(str) { return str ? str.length : 0; },
        use: function() {}
    },

Cast: {
        toInt: function(val) {
            let num;
            if (typeof val === 'string') {
                // Number() es estricto: "12abc" es NaN. parseInt es laxo ("12abc" -> 12).
                if (val.trim() === '') num = NaN;
                else num = Number(val);
            } else {
                num = Number(val);
            }
            
            if (Number.isNaN(num)) {
                jsolGlobal.JSOL.setShadow(false, "PARSE_ERROR", "Cast.toInt", jsolGlobal.JSOL.dict("val", val));
                return 0;
            }
            
            const parsed = Math.trunc(num);
            if (parsed > 9007199254740991 || parsed < -9007199254740991) {
                jsolGlobal.JSOL.setShadow(false, "OVERFLOW", "Cast.toInt", jsolGlobal.JSOL.dict("val", val));
            } else {
                jsolGlobal.JSOL.setShadow(true, "NONE", "Cast.toInt", jsolGlobal.JSOL.dict("val", val));
            }
            return parsed;
        },
        toFloat: function(val) {
            let num;
            if (typeof val === 'string') {
                if (val.trim() === '') num = NaN;
                else num = Number(val);
            } else {
                num = Number(val);
            }

            if (Number.isNaN(num)) {
                jsolGlobal.JSOL.setShadow(false, "PARSE_ERROR", "Cast.toFloat", jsolGlobal.JSOL.dict("val", val));
                return 0.0;
            }
            jsolGlobal.JSOL.setShadow(true, "NONE", "Cast.toFloat", jsolGlobal.JSOL.dict());
            return num;
        },
        toStr: function(val) {
            if (val === null) return "";
            if (val === false) return "false";
            if (val === true) return "true";
            return String(val);
        },
        toBool: function(val) {
            if (val === "0") return false;
            return Boolean(val);
        }
    },

    Math: (function() {
        const nativeMath = typeof Math !== 'undefined' ? Math : {};
        return {
            floor: nativeMath.floor ? nativeMath.floor.bind(nativeMath) : Math.floor,
            abs: nativeMath.abs ? nativeMath.abs.bind(nativeMath) : Math.abs,
            pow: nativeMath.pow ? nativeMath.pow.bind(nativeMath) : Math.pow,
            min: nativeMath.min ? nativeMath.min.bind(nativeMath) : Math.min,
            max: nativeMath.max ? nativeMath.max.bind(nativeMath) : Math.max,
            sqrt: nativeMath.sqrt ? nativeMath.sqrt.bind(nativeMath) : Math.sqrt,
            ceil: nativeMath.ceil ? nativeMath.ceil.bind(nativeMath) : Math.ceil,
            trunc: nativeMath.trunc ? nativeMath.trunc.bind(nativeMath) : Math.trunc,
            sign: nativeMath.sign ? nativeMath.sign.bind(nativeMath) : Math.sign,
            sin: nativeMath.sin ? nativeMath.sin.bind(nativeMath) : Math.sin,
            cos: nativeMath.cos ? nativeMath.cos.bind(nativeMath) : Math.cos,
            tan: nativeMath.tan ? nativeMath.tan.bind(nativeMath) : Math.tan,
            asin: nativeMath.asin ? nativeMath.asin.bind(nativeMath) : Math.asin,
            acos: nativeMath.acos ? nativeMath.acos.bind(nativeMath) : Math.acos,
            atan: nativeMath.atan ? nativeMath.atan.bind(nativeMath) : Math.atan,
            atan2: nativeMath.atan2 ? nativeMath.atan2.bind(nativeMath) : Math.atan2,
            E: nativeMath.E || Math.E,
            PI: nativeMath.PI || Math.PI,
            sum: function(...args) {
                let t = 0;
                for (let i = 0; i < args.length; i++) t += args[i];
                return t;
            },
            sub: function(...args) {
                if (args.length === 0) return 0;
                let t = args[0];
                for (let i = 1; i < args.length; i++) t -= args[i];
                return t;
            },
            mul: function(...args) {
                if (args.length === 0) return 0;
                let t = args[0];
                for (let i = 1; i < args.length; i++) t *= args[i];
                return t;
            },
            div: function(...args) {
                if (args.length === 0) return 0;
                let t = args[0];
                for (let i = 1; i < args.length; i++) {
                    if (args[i] === 0) {
                        jsolGlobal.JSOL.setShadow(false, "DIVIDE_BY_ZERO", "Math.div", jsolGlobal.JSOL.dict("divisor", 0));
                        return 0;
                    }
                    t /= args[i];
                }
                jsolGlobal.JSOL.setShadow(true, "NONE", "Math.div", jsolGlobal.JSOL.dict());
                return t;
            },
            idiv: function(a, b) {
                if (b === 0) {
                    jsolGlobal.JSOL.setShadow(false, "DIVIDE_BY_ZERO", "Math.idiv", jsolGlobal.JSOL.dict("divisor", 0));
                    return 0;
                }
                jsolGlobal.JSOL.setShadow(true, "NONE", "Math.idiv", jsolGlobal.JSOL.dict());
                return Math.trunc(a / b);
            },
            modX: function(a, b) {
                if (b === 0) {
                    jsolGlobal.JSOL.setShadow(false, "DIVIDE_BY_ZERO", "Math.modX", jsolGlobal.JSOL.dict("divisor", 0));
                    return 0;
                }
                jsolGlobal.JSOL.setShadow(true, "NONE", "Math.modX", jsolGlobal.JSOL.dict());
                return a - b * Math.floor(a / b);
            },

			roundX: function(n) { return Math.floor(Math.abs(n) + 0.5) * Math.sign(n); },

			logX: function(n, base = 10) { 
                // 1. Fast-Paths nativos: evitan problemas de división flotante para bases comunes.
                if (base === 10 && nativeMath.log10) {
                    return nativeMath.log10(n);
                }
                if (base === 2 && nativeMath.log2) {
                    return nativeMath.log2(n);
                }

                // 2. Cambio de base para bases arbitrarias (ej. base 3)
                const res = nativeMath.log(n) / nativeMath.log(base);

                // 3. Estabilización de precisión flotante (Epsilon Rounding)
                // Corrige la basura residual de V8 en divisiones logarítmicas.
                // Ejemplo: log(27)/log(3) = 3.0000000000000004 -> se redondea a 3.
                const rounded = nativeMath.round(res);
                return nativeMath.abs(res - rounded) < 1e-14 ? rounded : res;
            },

            ln: function(n) { return nativeMath.log(n); },
            cbrt: function(n) { return Math.cbrt(n); }

        };
    })(),
    Str: {
        indexOf: function(h, n) {
            if (typeof h !== 'string' || typeof n !== 'string') {
                jsolGlobal.JSOL.setShadow(false, "NOT_FOUND", "Str.indexOf", jsolGlobal.JSOL.dict("needle", n));
                return -1;
            }
            if (!/[\uD800-\uDFFF]/.test(h) && !/[\uD800-\uDFFF]/.test(n)) {
                const idx = h.indexOf(n);
                if (idx === -1) {
                    jsolGlobal.JSOL.setShadow(false, "NOT_FOUND", "Str.indexOf", jsolGlobal.JSOL.dict("needle", n));
                } else {
                    jsolGlobal.JSOL.setShadow(true, "NONE", "Str.indexOf", jsolGlobal.JSOL.dict("needle", n));
                }
                return idx;
            }
            const hCp = Array.from(h);
            const nCp = Array.from(n);
            if (nCp.length === 0) { 
                jsolGlobal.JSOL.setShadow(true, "NONE", "Str.indexOf", jsolGlobal.JSOL.dict("needle", n));
                return 0; 
            }
            for (let i = 0; i <= hCp.length - nCp.length; i++) {
                let bMatch = true;
                for (let j = 0; j < nCp.length; j++) {
                    if (hCp[i + j] !== nCp[j]) { bMatch = false; break; }
                }
                if (bMatch === true) { 
                    jsolGlobal.JSOL.setShadow(true, "NONE", "Str.indexOf", jsolGlobal.JSOL.dict("needle", n));
                    return i; 
                }
            }
            jsolGlobal.JSOL.setShadow(false, "NOT_FOUND", "Str.indexOf", jsolGlobal.JSOL.dict("needle", n));
            return -1;
        },
        len: function(s) {
            if (typeof s !== 'string') return 0;
            if (!/[\uD800-\uDFFF]/.test(s)) return s.length;
            return Array.from(s).length;
        },
        sub: function(s, start, len) {
            if (typeof s !== 'string') return '';
            if (!/[\uD800-\uDFFF]/.test(s)) return s.substring(start, start + len);
            return Array.from(s).slice(start, start + len).join('');
        },
        char: function(s, idx) {
            if (typeof s !== 'string') return NaN;
            if (!/[\uD800-\uDFFF]/.test(s)) {
                const code = s.charCodeAt(idx);
                return Number.isNaN(code) ? NaN : code;
            }
            const cp = Array.from(s)[idx];
            return cp !== undefined ? cp.codePointAt(0) : NaN;
        },
        fromChar: function(c) { return String.fromCodePoint(c); },
        contains: function(h, n) { return jsolGlobal.Str.indexOf(h, n) !== -1; },
        startsWith: function(s, n) { return typeof s === 'string' && s.startsWith(n); },
        endsWith: function(s, n) { return typeof s === 'string' && s.endsWith(n); },
        replaceAll: function(s, search, replace) { return typeof s === 'string' ? s.split(search).join(replace) : ''; },
        replace: function(s, search, replace) { return typeof s === 'string' ? s.split(search).join(replace) : ''; },
        same: function(sA, sB, mOpts) {
            const o = mOpts || {};
            let a = sA; let b = sB;
            if (o.ignoreCase === true) { a = a.toLowerCase(); b = b.toLowerCase(); }
            if (o.ignoreDiacritics === true) {
                a = a.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                b = b.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            }
            return a === b;
        },
        padStart: function(s, len, pad) {
            const sLen = jsolGlobal.Str.len(s);
            if (sLen >= len) { return s; }
            const need = len - sLen;
            let fill = "";
            while (jsolGlobal.Str.len(fill) < need) { fill += pad; }
            return jsolGlobal.Str.sub(fill, 0, need) + s;
        },
        padEnd: function(s, len, pad) {
            const sLen = jsolGlobal.Str.len(s);
            if (sLen >= len) { return s; }
            const need = len - sLen;
            let fill = "";
            while (jsolGlobal.Str.len(fill) < need) { fill += pad; }
            return s + jsolGlobal.Str.sub(fill, 0, need);
        },
        repeat: function(s, q) { return typeof s === 'string' ? s.repeat(q) : ''; },
        split: function(s, sep) {
            if (typeof s !== 'string') return [];
            if (sep === '') {
                if (!/[\uD800-\uDFFF]/.test(s)) return s.split('');
                return Array.from(s);
            }
            return s.split(sep);
        },
        concat: function(...args) { return args.map(a => jsolGlobal.Cast.toStr(a)).join(""); }
    },
    Arr: {
        len: function(a) { return a ? a.length : 0; },
        count: function(a) { return a ? a.length : 0; },
        push: function(a, i) { if (a) a.push(i); return a; },
        pop: function(a) { 
            if (!a || a.length === 0) {
                jsolGlobal.JSOL.setShadow(false, "EMPTY_ARRAY", "Arr.pop", jsolGlobal.JSOL.dict());
                return null;
            }
            jsolGlobal.JSOL.setShadow(true, "NONE", "Arr.pop", jsolGlobal.JSOL.dict());
            return a.pop(); 
        },
        shift: function(a) { 
            if (!a || a.length === 0) {
                jsolGlobal.JSOL.setShadow(false, "EMPTY_ARRAY", "Arr.shift", jsolGlobal.JSOL.dict());
                return null;
            }
            jsolGlobal.JSOL.setShadow(true, "NONE", "Arr.shift", jsolGlobal.JSOL.dict());
            return a.shift(); 
        },
        unshift: function(a, i) { if (a) a.unshift(i); return a; },
        indexOf: function(a, i) { 
            if (!a) return -1;
            const idx = a.indexOf(i); 
            if (idx === -1) {
                jsolGlobal.JSOL.setShadow(false, "NOT_FOUND", "Arr.indexOf", jsolGlobal.JSOL.dict("item", i));
            } else {
                jsolGlobal.JSOL.setShadow(true, "NONE", "Arr.indexOf", jsolGlobal.JSOL.dict("item", i));
            }
            return idx;
        },
        contains: function(a, i) { return a ? a.includes(i) : false; },
        join: function(a, d) { return a ? a.join(d) : ''; },
        slice: function(a, s, e) { return a ? a.slice(s, e) : []; },
        sort: function(a, cmp) { return a ? a.slice().sort(cmp) : []; }
    },
    Map: {
        create: function(...args) { return jsolGlobal.JSOL.dict(...args); },
        has: function(obj, key) { return obj ? Object.prototype.hasOwnProperty.call(obj, key) : false; },
        keys: function(obj) { return obj ? Object.keys(obj) : []; },
        values: function(obj) { return obj ? Object.values(obj) : []; },
        count: function(obj) { return obj ? Object.keys(obj).length : 0; },
        get: function(obj, key) { 
            if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
                jsolGlobal.JSOL.setShadow(true, "NONE", "Map.get", jsolGlobal.JSOL.dict("key", key));
                return obj[key];
            }
            jsolGlobal.JSOL.setShadow(false, "KEY_NOT_FOUND", "Map.get", jsolGlobal.JSOL.dict("key", key));
            return undefined;
        }
    },


    Bool: {
        and: function(...args) { for (let i = 0; i < args.length; i++) { if (!args[i]) return false; } return true; },
        or: function(...args) { for (let i = 0; i < args.length; i++) { if (args[i]) return true; } return false; },
        xor: function(...args) { let t = 0; for (let i = 0; i < args.length; i++) { if (args[i]) t++; } return (t % 2) === 1; },
        eq: function(...args) { if (args.length <= 1) return true; let f = args[0]; for (let i = 1; i < args.length; i++) { if (args[i] !== f) return false; } return true; },
        neq: function(...args) { return !jsolGlobal.Bool.eq(...args); }
    },

    Rgx: {
        match: function(p, s, f) {
            try {
                p = p.replace(/\(\?P</g, '(?<');
                const re = new RegExp(p, f || '');
                const m = re.exec(s);
                if (!m) return jsolGlobal.JSOL.dict("matched", false, "groups", [], "index", -1, "length", 0);
                const g = []; for(let i=0; i<m.length; i++) g.push(m[i] !== undefined ? m[i] : null);
                return jsolGlobal.JSOL.dict("matched", true, "groups", g, "index", m.index, "length", m[0].length);
            } catch(e) { return jsolGlobal.JSOL.dict("matched", false, "groups", [], "index", -1, "length", 0); }
        },
        replace: function(p, r, s, f) {
            try { 
                p = p.replace(/\(\?P</g, '(?<');
                return s.replace(new RegExp(p, f || ''), r); 
            } catch(e) { return s; }
        },
        test: function(p, s, f) {
            try { 
                p = p.replace(/\(\?P</g, '(?<');
                return new RegExp(p, f || '').test(s); 
            } catch(e) { return false; }
        }
    }
};

if (typeof global !== 'undefined') {
    Object.assign(global, jsolGlobal);
} else if (typeof window !== 'undefined') {
    Object.assign(window, jsolGlobal);
}