// TODO: Just for test, don't use it!
cc.evil = function (ctx, src) {
    return (function () {
        if (cc.isNullOrUndefined(ctx)) {
            return eval(src);
        } else {
            with (ctx) {
                return eval(src);
            }
        }
    }).call(null);
};

cc.eval = function (src, ctx) {
    var args = [], values = [];
    cc.each(ctx, function (k, v) {
        args.push(k);
        values.push(v);
    });
    args.push('return eval("' + src.replace(/"/g, '\\"') + '")');
    return Function.apply(null, args).apply(null, values);
};

cc.interval = function (proc, ms) {
    (function loop() {
        setTimeout(function () {
            proc();
            loop();
        }, ms);
    })();
};
