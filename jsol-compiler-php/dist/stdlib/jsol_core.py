# REEMPLAZAR ARCHIVO COMPLETO EN dist/stdlib/jsol_core.py
import re

class JSOL:
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
            return arr.index(value)
        except ValueError:
            return -1

    @staticmethod
    def str_index_of(s, sub):
        return s.find(sub)

    @staticmethod
    def to_str(val):
        if val is True: return "true"
        if val is False: return "false"
        return str(val)

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
            if m.groups():
                groups.extend(m.groups())
            return JSOL.dict("matched", True, "groups", groups, "index", m.start(), "length", len(m.group(0)))
        return JSOL.dict("matched", False, "groups", [], "index", -1, "length", 0)