// JSOL v0.2.92 Core Polyfill for Browser Execution
window.JSOL = { 
    dict: function(...args) { let o={}; for(let i=0;i<args.length;i+=2) o[args[i]]=args[i+1]; return o; }, 
    use: function(){} 
};
window.Arr = {
    count: function(a) { return a ? a.length : 0; },
    push: function(a, i) { if (a) a.push(i); return a; },
    pop: function(a) { return a ? a.pop() : null; },
    shift: function(a) { return a ? a.shift() : null; },
    indexOf: function(a, i) { return a ? a.indexOf(i) : -1; },
    join: function(a, d) { return a ? a.join(d) : ""; },
    slice: function(a, s, e) { return a ? a.slice(s, e) : []; }
};
window.Map = {
    create: function(...args) { return window.JSOL.dict(...args); },
    has: function(obj, key) { return Object.prototype.hasOwnProperty.call(obj, key); },
    keys: function(obj) { return Object.keys(obj); }
};
window.$mRegex = {
    replace: (p, r, s, f) => { const re = new RegExp(p, f); return s.replace(re, r); },
    match: (p, s, f) => { const re = new RegExp(p, f); const m = re.exec(s); return m ? { matched: true, groups: m } : { matched: false }; },
    test: (p, s, f) => { const re = new RegExp(p, f); return re.test(s); }
};
window.Regex = window.$mRegex;

document.addEventListener('DOMContentLoaded', () => {
    // 0. Persistir y Restaurar la Posición de Scroll de la Barra Lateral
    const sidebar = document.querySelector('.jsol-repl-sidebar');
    if (sidebar) {
        const savedScroll = sessionStorage.getItem('jsol_sidebar_scroll');
        if (savedScroll !== null) {
            sidebar.scrollTop = parseInt(savedScroll, 10);
        }
        sidebar.addEventListener('scroll', () => {
            sessionStorage.setItem('jsol_sidebar_scroll', sidebar.scrollTop);
        });
    }

    const metaNode = document.querySelector('[data-js-hook="metadata"]');
    if (!metaNode) return;

    const metadata = JSON.parse(metaNode.textContent);
    const funcName = metadata.funcName;
    const inputCols = metadata.params || [];
    const contractCases = metadata.contract || [];
    
    const table = document.querySelector('[data-js-hook="repl-table"]');
    const thead = document.querySelector('[data-js-hook="repl-thead"]');
    const tbody = document.querySelector('[data-js-hook="repl-tbody"]');

    if (!window[funcName]) {
        console.error(`Compiled function ${funcName} not found in scope.`);
        return;
    }

    // SSOT: Read the function's return signature directly from the source code
    let outputCols = ['_result'];
    const fnStr = window[funcName].toString();
    const dictMatch = fnStr.match(/return\s+(?:window\.)?JSOL\.dict\(([\s\S]*?)\);?/);
    
    if (dictMatch) {
        const argsStr = dictMatch[1];
        let args = [];
        let current = '';
        let inStr = false;
        let strQuote = '';
        let pCount = 0, bCount = 0, cCount = 0;
        
        for (let i = 0; i < argsStr.length; i++) {
            const ch = argsStr[i];
            const prev = i > 0 ? argsStr[i-1] : '';
            if ((ch === '"' || ch === "'") && prev !== '\\') {
                if (!inStr) { inStr = true; strQuote = ch; }
                else if (ch === strQuote) { inStr = false; }
            }
            if (!inStr) {
                if (ch === '(') pCount++;
                else if (ch === ')') pCount--;
                else if (ch === '[') bCount++;
                else if (ch === ']') bCount--;
                else if (ch === '{') cCount++;
                else if (ch === '}') cCount--;
            }
            if (ch === ',' && !inStr && pCount === 0 && bCount === 0 && cCount === 0) {
                args.push(current.trim());
                current = '';
            } else {
                current += ch;
            }
        }
        if (current.trim() !== '') args.push(current.trim());

        if (args.length >= 2) {
            outputCols = [];
            for (let i = 0; i < args.length; i += 2) {
                const keyStr = args[i].replace(/^["']|["']$/g, '');
                outputCols.push(keyStr);
            }
        }
    }

    // DOM Templates
    const tplThIn = document.querySelector('[data-tpl="th-input"]').content;
    const tplThOut = document.querySelector('[data-tpl="th-output"]').content;
    const tplTdIn = document.querySelector('[data-tpl="td-input"]').content;
    const tplTdOut = document.querySelector('[data-tpl="td-output"]').content;

    // Helper: Map prefix to HTML input attributes
    const getAttr = (paramName) => {
        const prefix = paramName.substring(1, 2);
        let type = 'text', step = '', ph = '...';
        
        if (prefix === 's') { ph = 'string...'; }
        else if (['n', 'c', 'p'].includes(prefix)) { type = 'number'; step = 'any'; ph = '0.00'; }
        else if (['q', 'i'].includes(prefix)) { type = 'number'; step = '1'; ph = '0'; }
        else if (prefix === 'b') { ph = 'true/false'; }
        else if (['a', 'm'].includes(prefix)) { ph = '[] or {}'; }
        
        return { type, step, ph, prefix };
    };

    // 1. Build Header
    const trHead = document.createElement('tr');
    inputCols.forEach(col => {
        const clone = tplThIn.cloneNode(true);
        clone.querySelector('[data-node="name"]').textContent = col;
        trHead.appendChild(clone);
    });
    outputCols.forEach(col => {
        const clone = tplThOut.cloneNode(true);
        clone.querySelector('[data-node="name"]').textContent = col;
        trHead.appendChild(clone);
    });
    thead.appendChild(trHead);

    // 2. Build Rows function
    const buildRow = (inData = {}) => {
        const tr = document.createElement('tr');
        inputCols.forEach(col => {
            const clone = tplTdIn.cloneNode(true);
            const input = clone.querySelector('input');
            const attr = getAttr(col);
            
            input.type = attr.type;
            if (attr.step) input.step = attr.step;
            input.placeholder = attr.ph;
            input.setAttribute('data-prefix', attr.prefix);
            input.setAttribute('data-param', col);
            
            if (inData[col] !== undefined) {
                const val = inData[col];
                input.value = typeof val === 'boolean' ? (val ? 'true' : 'false') : (typeof val === 'object' ? JSON.stringify(val) : String(val));
            }
            tr.appendChild(clone);
        });
        
        outputCols.forEach(col => {
            const clone = tplTdOut.cloneNode(true);
            const span = clone.querySelector('span');
            span.setAttribute('data-out', col);
            tr.appendChild(clone);
        });
        tbody.appendChild(tr);
        return tr;
    };

    // 3. Initialize Data Rows
    if (contractCases.length > 0) {
        contractCases.forEach(c => {
            const inData = (c && typeof c === 'object' && c.in) ? c.in : c;
            buildRow(inData);
        });
    } else {
        buildRow();
    }
    buildRow(); // Always add one empty trailing row

    // 4. Reactive Evaluation Logic
    const evaluateRow = (row) => {
        const inputs = row.querySelectorAll('[data-js-hook="repl-input"]');
        const outputs = row.querySelectorAll('[data-js-hook="repl-output"]');
        
        let hasEmptyOrInvalid = false;
        let hasAnyData = false;
        const args = [];
        
        inputs.forEach(input => {
            const val = input.value.trim();
            const prefix = input.getAttribute('data-prefix');

            if (val !== '') hasAnyData = true;
            if (val === '') { hasEmptyOrInvalid = true; args.push(null); return; }

            let parsed = val;
            
            if (prefix === 's') {
                parsed = String(val);
            } else if (['n', 'c', 'p', 'q', 'i'].includes(prefix)) {
                parsed = Number(val);
                if (isNaN(parsed)) hasEmptyOrInvalid = true;
            } else if (prefix === 'b') {
                if (val === 'true') parsed = true;
                else if (val === 'false') parsed = false;
                else hasEmptyOrInvalid = true;
            } else if (['a', 'm'].includes(prefix)) {
                try { parsed = JSON.parse(val); } catch (e) { hasEmptyOrInvalid = true; }
            }
            args.push(parsed);
        });

        if (!hasAnyData || hasEmptyOrInvalid) {
            outputs.forEach(out => { 
                out.textContent = '-'; 
                out.removeAttribute('data-error'); 
                out.removeAttribute('data-bool');
            });
            return;
        }

        try {
            const result = window[funcName](...args);

            outputs.forEach(out => {
                const key = out.getAttribute('data-out');
                out.removeAttribute('data-error');
                out.removeAttribute('data-bool');
                
                let outVal;
                if (key === '_result') {
                    outVal = result;
                } else {
                    outVal = (result && typeof result === 'object' && key in result) ? result[key] : null;
                }

                out.textContent = typeof outVal === 'object' && outVal !== null ? JSON.stringify(outVal) : String(outVal);
                if (outVal === false) out.setAttribute('data-bool', 'false');
            });
        } catch (error) {
            outputs.forEach(out => {
                out.textContent = 'ERR';
                out.setAttribute('data-error', 'true');
                out.removeAttribute('data-bool');
            });
        }
    };

    // 5. Events
    const btnAdd = document.querySelector('[data-js-hook="repl-add-row"]');
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            const newRow = buildRow();
            const firstInput = newRow.querySelector('input');
            if (firstInput) firstInput.focus();
        });
    }

    table.addEventListener('input', e => {
        if (e.target.matches('[data-js-hook="repl-input"]')) evaluateRow(e.target.closest('tr'));
    });

    table.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            const input = e.target;
            if (!input.matches('[data-js-hook="repl-input"]')) return;
            
            const row = input.closest('tr');
            if (row.nextElementSibling === null) {
                const newRow = buildRow();
                const targetInput = newRow.querySelector('input');
                if (targetInput) targetInput.focus();
            } else {
                const currentIdx = Array.from(row.children).indexOf(input.closest('td'));
                const targetInput = row.nextElementSibling.children[currentIdx].querySelector('input');
                if (targetInput) targetInput.focus();
            }
        }
    });

    // Initial evaluation
    tbody.querySelectorAll('tr').forEach(evaluateRow);
});