/**
 * JSOL (JavaScript Source Of Logic) - VS Code Environment Definitions
 */
declare const JSOL: {
    count: (arr: any[]) => number;
    len: (str: string) => number;
    dict: (...args: any[]) => any;
    hasKey: (dict: any, key: string) => boolean;
    closure: (deps: any[], fn: Function) => Function;
    
    bwAnd: (a: number, b: number) => number;
    bwOr: (a: number, b: number) => number;
    bwXor: (a: number, b: number) => number;
    bwNot: (a: number) => number;
    bwShiftL: (a: number, b: number) => number;
    bwShiftR: (a: number, b: number) => number;
    
    hexToInt: (hexStr: string) => number;

    PHP: (cb: () => void) => void;
    JS: (cb: () => void) => void;
};