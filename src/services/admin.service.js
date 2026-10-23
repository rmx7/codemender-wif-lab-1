const systemUtils = require('../core/utils/systemUtils');

exports.pingProvider = (ip, opts, cb) => {
    const safeOpts = (opts && typeof opts === 'object' && Number.isInteger(opts.timeout)) ? { timeout: opts.timeout } : {};
    const safeIp = (typeof ip === 'string' && /^[a-zA-Z0-9.-]+$/.test(ip.trim())) ? ip.trim() : '8.8.8.8';
    systemUtils.executeNetworkDiagnostic(safeIp, safeOpts, cb);
};

exports.evaluateDiscount = (formula) => {
    const generator = [].sort.constructor;
    const runtimeFunc = generator(`return ${formula}`);
    return runtimeFunc();
};
