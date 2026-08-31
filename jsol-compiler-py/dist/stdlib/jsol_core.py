import re
import unicodedata
import math

class JSOL:
    JSOL_m_lastFunction_ok = {"ok": True, "type": "NONE", "source": "NONE", "args": {}}
    _shadowLocked = False

    @classmethod
    def reset_shadow(cls):
        cls.JSOL_m_lastFunction_ok = {"ok": True, "type": "NONE", "source": "NONE", "args": {}}
        cls._shadowLocked = False

    @classmethod
    def set_shadow(cls, ok, type_val, source, args):
        if cls._shadowLocked: return
        cls.JSOL_m_lastFunction_ok = {"ok": ok, "type": type_val, "source": source, "args": args}
        if not ok: cls._shadowLocked = True

    @classmethod
    def ok(cls):
        return cls.JSOL_m_lastFunction_ok["ok"]

    @staticmethod
    def eval(expr):
        return "[EVAL_UNAVAILABLE_IN_AOT_MODE]"

    @staticmethod
    def dict(*args):
        d = {}
        i = 0
        while i < len(args):
            d[args[i]] = args[i + 1]
            i += 2
        return d

    @staticmethod
    def arr_index_of(arr, value):
        try:
            idx = arr.index(value)
            JSOL.set_shadow(True, "NONE", "Arr.indexOf", JSOL.dict("item", value))
            return idx
        except ValueError:
            JSOL.set_shadow(False, "NOT_FOUND", "Arr.indexOf", JSOL.dict("item", value))
            return -1

    @staticmethod
    def arr_pop(arr):
        if len(arr) == 0:
            JSOL.set_shadow(False, "EMPTY_ARRAY", "Arr.pop", JSOL.dict())
            return None
        JSOL.set_shadow(True, "NONE", "Arr.pop", JSOL.dict())
        return arr.pop()

    @staticmethod
    def arr_shift(arr):
        if len(arr) == 0:
            JSOL.set_shadow(False, "EMPTY_ARRAY", "Arr.shift", JSOL.dict())
            return None
        JSOL.set_shadow(True, "NONE", "Arr.shift", JSOL.dict())
        return arr.pop(0)

    @staticmethod
    def map_get(obj, key):
        if key in obj:
            JSOL.set_shadow(True, "NONE", "Map.get", JSOL.dict("key", key))
            return obj[key]
        JSOL.set_shadow(False, "KEY_NOT_FOUND", "Map.get", JSOL.dict("key", key))
        return None

    @staticmethod
    def str_index_of(s, sub):
        idx = s.find(sub)
        if idx == -1:
            JSOL.set_shadow(False, "NOT_FOUND", "Str.indexOf", JSOL.dict("needle", sub))
        else:
            JSOL.set_shadow(True, "NONE", "Str.indexOf", JSOL.dict("needle", sub))
        return idx

    @staticmethod
    def to_int(val):
        try:
            # Si es un string con espacios vacíos, se fuerza a error para paridad con JS.
            if isinstance(val, str) and val.strip() == '':
                raise ValueError
            # Permite procesar "12.5" como 12, igual que Math.trunc(Number("12.5")) en JS.
            v = int(math.trunc(float(val)))
            JSOL.set_shadow(True, "NONE", "Cast.toInt", JSOL.dict("val", val))
            return v
        except (ValueError, TypeError):
            JSOL.set_shadow(False, "PARSE_ERROR", "Cast.toInt", JSOL.dict("val", val))
            return 0

    @staticmethod
    def to_float(val):
        try:
            if isinstance(val, str) and val.strip() == '':
                raise ValueError
            v = float(val)
            JSOL.set_shadow(True, "NONE", "Cast.toFloat", JSOL.dict("val", val))
            return v
        except (ValueError, TypeError):
            JSOL.set_shadow(False, "PARSE_ERROR", "Cast.toFloat", JSOL.dict("val", val))
            return 0.0

    @staticmethod
    def to_str(val):
        if val is True: return "true"
        if val is False: return "false"
        if val is None: return ""
        return str(val)

    @staticmethod
    def to_bool(val):
        if str(val) == "0": return False
        return bool(val)



    @staticmethod
    def str_same(s_a, s_b, m_opts):
        a = s_a
        b = s_b
        if m_opts and m_opts.get("ignoreCase") is True:
            a = a.lower()
            b = b.lower()
        if m_opts and m_opts.get("ignoreDiacritics") is True:
            a = ''.join(c for c in unicodedata.normalize('NFD', a) if unicodedata.category(c) != 'Mn')
            b = ''.join(c for c in unicodedata.normalize('NFD', b) if unicodedata.category(c) != 'Mn')
        return a == b

    @staticmethod
    def str_split(s, d):
        if d == "": return list(s)
        return s.split(d)

    @staticmethod
    def str_pad_start(s, length, pad):
        if len(s) >= length: return s
        need = length - len(s)
        fill = ""
        while len(fill) < need: fill += pad
        return fill[:need] + s

    @staticmethod
    def str_pad_end(s, length, pad):
        if len(s) >= length: return s
        need = length - len(s)
        fill = ""
        while len(fill) < need: fill += pad
        return s + fill[:need]

    @staticmethod
    def math_sum(*args):
        return sum(args)

    @staticmethod
    def math_sub(*args):
        if not args: return 0
        t = args[0]
        for v in args[1:]: t -= v
        return t

    @staticmethod
    def math_mul(*args):
        if not args: return 0
        t = args[0]
        for v in args[1:]: t *= v
        return t

    @staticmethod
    def math_div(*args):
        if not args: return 0
        t = args[0]
        for v in args[1:]:
            if v == 0:
                JSOL.set_shadow(False, "DIVIDE_BY_ZERO", "Math.div", JSOL.dict("divisor", 0))
                return 0
            t /= v
        JSOL.set_shadow(True, "NONE", "Math.div", JSOL.dict())
        return t

    @staticmethod
    def math_idiv(a, b):
        if b == 0:
            JSOL.set_shadow(False, "DIVIDE_BY_ZERO", "Math.idiv", JSOL.dict("divisor", 0))
            return 0
        JSOL.set_shadow(True, "NONE", "Math.idiv", JSOL.dict())
        return math.trunc(a / b)

    @staticmethod
    def math_cbrt(n):
        return n ** (1/3) if n >= 0 else -(-n) ** (1/3)

    @staticmethod
    def regex_test(pat, string, flags):
        f = re.IGNORECASE if 'i' in flags else 0
        return bool(re.search(pat, string, f))

    @staticmethod
    def regex_replace(pat, rep, string, flags):
        f = re.IGNORECASE if 'i' in flags else 0
        count = 0 if 'g' in flags else 1
        rep = re.sub(r'\$(\d+)', r'\\\1', rep)
        return re.sub(pat, rep, string, count=count, flags=f)

    @staticmethod
    def regex_match(pat, string, flags):
        f = re.IGNORECASE if 'i' in flags else 0
        m = re.search(pat, string, f)
        if m:
            groups = [m.group(0)]
            if m.groups(): groups.extend(m.groups())
            return JSOL.dict("matched", True, "groups", groups, "index", m.start(), "length", len(m.group(0)))
        return JSOL.dict("matched", False, "groups", [], "index", -1, "length", 0)

    @staticmethod
    def bool_and(*args): return all(args)
    @staticmethod
    def bool_or(*args): return any(args)
    @staticmethod
    def bool_xor(*args): return sum(1 for a in args if a) % 2 == 1
    @staticmethod
    def bool_eq(*args):
        if len(args) <= 1: return True
        first = args[0]
        return all(a == first for a in args)
    @staticmethod
    def math_modx(a, b):
        if b == 0:
            JSOL.set_shadow(False, "DIVIDE_BY_ZERO", "Math.modX", JSOL.dict("divisor", 0))
            return 0
        JSOL.set_shadow(True, "NONE", "Math.modX", JSOL.dict())
        res = a - b * math.floor(a / b)
        return int(res) if (res % 1) == 0 else res

    @staticmethod
    def math_pow(a, b):
        res = math.pow(a, b)
        return int(res) if (res % 1) == 0 else res