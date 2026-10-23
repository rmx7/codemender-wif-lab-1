const adminService = require('../../services/admin.service');

function evaluateFormula(expr) {
    if (typeof expr === 'number') {
        if (!isFinite(expr)) throw new Error('Invalid number');
        return expr;
    }
    if (typeof expr !== 'string') throw new Error('Invalid formula');

    const tokens = [];
    let i = 0;
    while (i < expr.length) {
        const ch = expr[i];
        if (/\s/.test(ch)) {
            i++;
            continue;
        }
        if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(expr[i + 1] || ''))) {
            let numStr = '';
            while (i < expr.length && /[0-9.]/.test(expr[i])) {
                numStr += expr[i];
                i++;
            }
            if (numStr.indexOf('.') !== numStr.lastIndexOf('.')) {
                throw new Error('Invalid number format');
            }
            tokens.push({ type: 'number', value: parseFloat(numStr) });
            continue;
        }
        if ('+-*/%()'.includes(ch)) {
            tokens.push({ type: 'op', value: ch });
            i++;
            continue;
        }
        throw new Error(`Unexpected character: ${ch}`);
    }

    if (tokens.length === 0) throw new Error('Empty formula');

    let pos = 0;

    function parseExpression() {
        let left = parseTerm();
        while (pos < tokens.length && (tokens[pos].value === '+' || tokens[pos].value === '-')) {
            const op = tokens[pos++].value;
            const right = parseTerm();
            if (op === '+') left += right;
            else left -= right;
        }
        return left;
    }

    function parseTerm() {
        let left = parseFactor();
        while (pos < tokens.length && (tokens[pos].value === '*' || tokens[pos].value === '/' || tokens[pos].value === '%')) {
            const op = tokens[pos++].value;
            const right = parseFactor();
            if (op === '*') left *= right;
            else if (op === '/') left /= right;
            else left %= right;
        }
        return left;
    }

    function parseFactor() {
        if (pos < tokens.length && tokens[pos].value === '+') {
            pos++;
            return parseFactor();
        }
        if (pos < tokens.length && tokens[pos].value === '-') {
            pos++;
            return -parseFactor();
        }
        return parsePrimary();
    }

    function parsePrimary() {
        if (pos >= tokens.length) throw new Error('Unexpected end of expression');
        const token = tokens[pos++];
        if (token.type === 'number') return token.value;
        if (token.value === '(') {
            const val = parseExpression();
            if (pos >= tokens.length || tokens[pos++].value !== ')') {
                throw new Error('Mismatched parentheses');
            }
            return val;
        }
        throw new Error(`Unexpected token: ${token.value}`);
    }

    const result = parseExpression();
    if (pos < tokens.length) throw new Error('Extra tokens');
    if (!isFinite(result)) throw new Error('Result is not a finite number');
    return result;
}

exports.checkShippingStatus = (req, res) => {
    adminService.pingProvider(req.body.providerIP, req.body.options, out => res.send(out));
};

exports.previewDynamicPricing = (req, res) => {
    try {
        if (!req.body || req.body.formula === undefined) {
            return res.status(400).send("Evaluation Failed");
        }
        res.json({ price: evaluateFormula(req.body.formula) });
    } catch (e) {
        res.status(400).send("Evaluation Failed");
    }
};
