QUnit.test('attributes get & set', function (assert) {
    var A0 = 11, B0 = 21, A1 = 12, B1 = 22;
    var model = cc.Model.new({
        a: A0,
        b: B0
    });
    assert.equal(model.get('a'), A0, 'model.get("a") === A0');
    assert.equal(model.get('b'), B0, 'model.get("b") === B0');
    model.set('a', A1);
    assert.equal(model.get('a'), A1, 'model.get("a") === A1');
    model.set({
        a: A0,
        b: B1
    });
    assert.equal(model.get('a'), A0, 'model.get("a") === A0 again');
    assert.equal(model.get('b'), B1, 'model.get("b") === B1');
});

QUnit.test('change events count', function (assert) {
    var res = [];
    var model = cc.Model.new({ a: 1 });
    model.on('change:a', function () {
        res.push(1);
    }).on('changes', function () {
        res.push(0);
    });
    model.set('a', 2);
    assert.equal(res.length, 2, 'res.length === 2');
    model.set('a', 2);
    assert.equal(res.length, 2, 'res.length === 2 again');
    model.set({ a: 3 });
    assert.equal(res.length, 4, 'res.length === 4');
    model.set('a', 4, { silence: true });
    assert.equal(res.length, 4, 'res.length === 4 again');
    model.off('changes');
    model.set({ a: 5 });
    assert.equal(res.length, 5, 'res.length === 5 again again');
});

QUnit.test('change:key content', function (assert) {
    var model = cc.Model.new();
    var A0 = 1, A1 = 2;
    var from = null, to = null;
    model.on('change:a', function (f, t) {
        from = f; to = t;
    });
    model.set('a', A0);
    assert.equal(from, undefined, 'from === undefined');
    assert.equal(to, A0, 'to === A0');
    invoke(model.set, [{ a: A1 }]);
    assert.equal(from, A0, 'from === A0');
    assert.equal(to, A1, 'to === A1');
});

QUnit.test('changes content', function (assert) {
    var A0 = 1, A1 = 2, B0 = 3;
    var model = cc.Model.new({
        a: A0,
        b: B0
    });
    var attrs = {};
    model.on('changes', function (a) {
        attrs = a;
    });
    model.set('a', A1);
    var count = 0;
    cc.each(attrs, function () { ++count; });
    assert.equal(count, 1, 'attrs has 1 key');
    assert.equal(attrs.a, A1, 'attrs.a === A1');
    assert.equal(attrs.b, undefined, 'attrs.b === undefined');
});

QUnit.test('toJSON', function (assert) {
    var A0 = 1, B0 = 2, A1 = 11, A2 = 22;
    var model = cc.Model.new({
        a: A0,
        b: B0
    });
    var json = model.toJSON();
    assert.equal(json.a, A0, 'json.a === A0');
    assert.equal(json.b, B0, 'json.b === B0');
    model.set('a', A1);
    assert.equal(json.a, A0, 'json.a === A0 again');
    assert.equal(json.b, B0, 'json.b === B0 again');
    assert.equal(model.get('a'), A1, 'model.get("a") === A1');
    assert.equal(model.get('b'), B0, 'model.get("b") === B0');
    json.a = A2;
    assert.equal(json.a, A2, 'json.a === A2');
    assert.equal(json.b, B0, 'json.b === B0 again again');
    assert.equal(model.get('a'), A1, 'model.get("a") === A1 again');
});

QUnit.test('set params', function (assert) {
    var model = cc.Model.new({ a: 222 });
    var ca = 0, cs = 1, EXTRA = 123;
    model.on('change:a', function (_, _, extra) {
        ca = extra;
    });
    model.on('changes', function (_, extra) {
        cs = extra;
    });
    model.set('a', 2, { extra: EXTRA });
    assert.equal(ca, EXTRA);
    assert.equal(cs, EXTRA);
});
