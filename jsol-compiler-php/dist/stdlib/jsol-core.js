/**
 * JSOL Core Polyfills (JavaScript Runtime)
 * Se inyectan en el entorno global para soportar funciones primitivas de JSOL.
 */
const jsolGlobal = {
    JSOL: {
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
    Str: {
        indexOf: function(h, n) { return h.indexOf(n); },
        len: function(s) { return s.length; },
        sub: function(s, start, len) { return s.substring(start, start + len); },
        char: function(s, idx) { return s.charCodeAt(idx); },
        fromChar: function(c) { return String.fromCharCode(c); },
        replace: function(s, search, replace) { return s.split(search).join(replace); }
    },
    Arr: {
        count: function(a) { return a.length; },
        push: function(a, i) { a.push(i); return a; },
        pop: function(a) { return a.pop(); },
        shift: function(a) { return a.shift(); },
        indexOf: function(a, i) { return a.indexOf(i); },
        join: function(a, d) { return a.join(d); },
        slice: function(a, s, e) { return a.slice(s, e); }
    },
    Map: {
        create: function(...args) { return jsolGlobal.JSOL.dict(...args); },
        has: function(obj, key) { return Object.prototype.hasOwnProperty.call(obj, key); },
        keys: function(obj) { return Object.keys(obj); }
    },
    Rgx: {
        match: function(p, s, f) {
            try {
                const re = new RegExp(p, f || '');
                const m = re.exec(s);
                if (!m) return jsolGlobal.JSOL.dict("matched", false, "groups", [], "index", -1, "length", 0);
                const g = []; for(let i=0; i<m.length; i++) g.push(m[i] !== undefined ? m[i] : null);
                return jsolGlobal.JSOL.dict("matched", true, "groups", g, "index", m.index, "length", m[0].length);
            } catch(e) { return jsolGlobal.JSOL.dict("matched", false, "groups", [], "index", -1, "length", 0); }
        },
        replace: function(p, r, s, f) {
            try { return s.replace(new RegExp(p, f || ''), r); } catch(e) { return s; }
        },
        test: function(p, s, f) {
            try { return new RegExp(p, f || '').test(s); } catch(e) { return false; }
        }
    }
};

if (typeof global !== 'undefined') {
    Object.assign(global, jsolGlobal);
} else if (typeof window !== 'undefined') {
    Object.assign(window, jsolGlobal);
}