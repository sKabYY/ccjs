(function () {
    var cases = [
        [1, '1;'],
        [3, '1;2;3;'],
        ['a', '"a"'],
        ['a', "'a'"],
        [3, '1 + a', { a: 2 }],
        [1, 'a = 1; a;', { a: 2 }]
    ];
    QUnit.test('eval', function (assert) {
        cases.each(function (kase) {
            assert.equal(cc.eval(kase[1], kase[2]), kase[0],
                JSON.stringify(kase));
        });
        var ctx = { x: 0 };
        cc.eval('x = 1', ctx);
        assert.equal(ctx.x, 0, 'ctx.x === 0');
    });
    QUnit.test('evil', function (assert) {
        cases.each(function (kase) {
            assert.equal(cc.evil(kase[2], kase[1]), kase[0],
                JSON.stringify(kase));
        });
        var ctx = { x: 0 };
        cc.evil(ctx, 'x = 1');
        assert.equal(ctx.x, 1, 'ctx.x === 1');
    });
})();