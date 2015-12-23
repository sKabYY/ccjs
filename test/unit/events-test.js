QUnit.test('events', function (assert) {
    var A0 = 33, B0 = 44, A = 11, B = 22;
    var a = A0, b = B0;
    var dispatcher = cc.Dispatcher.new();
    assert.equal(cc.typeOf(dispatcher), 'Dispatcher',
        'typeOf dispatcher is "Dispatcher"');
    assert.ok(cc.instanceOf(dispatcher, cc.Dispatcher),
        'dispatcher is instanceOf cc.Dispatcher');
    dispatcher.trigger('test', [1, 2]);
    assert.equal(a, A0, 'a === A0');
    assert.equal(b, B0, 'a === B0');
    dispatcher.on('test', function (pa, pb) {
        a = pa;
        b = pb;
    });
    assert.equal(a, A0, 'a === A0 again');
    assert.equal(b, B0, 'a === B0 again');
    dispatcher.trigger('abc', [1, 2]);
    assert.equal(a, A0, 'a === A0 again again');
    assert.equal(b, B0, 'a === B0 again again');
    dispatcher.trigger('test', [A, B]);
    assert.equal(a, A, 'a === A');
    assert.equal(b, B, 'a === B');
});

QUnit.test('this', function (assert) {
    var A0 = 1, A1 = 12;
    var dispatcher = cc.Dispatcher.new();
    dispatcher.a = A0;
    invoke(dispatcher.on, ['test', function () {
        this.a = A1;
    }]);
    assert.equal(dispatcher.a, A0, 'dispatcher.a === A0');
    invoke(dispatcher.trigger, ['test']);
    assert.equal(dispatcher.a, A1, 'dispatcher.a === A1');
});

QUnit.test('namespace', function (assert) {
    var A0 = 1, A1 = 12, A2 = 123;
    var a = A0;
    var dispatcher = cc.Dispatcher.new();
    dispatcher.on('test.abc', function (newA) {
        a = newA;
    });
    dispatcher.trigger('test', [A1]);
    assert.equal(a, A1, 'a === A1');
    dispatcher.trigger('test.abc.foo', [A2]);
    assert.equal(a, A1, 'a === A1');
    dispatcher.trigger('test.abc', [A2]);
    assert.equal(a, A2, 'a === A2');
});

QUnit.test('namespace 2', function (assert) {
    var A0 = 1, A1 = 12, A2 = 123;
    var a = A0;
    var dispatcher = cc.Dispatcher.new();
    dispatcher.on('test.abc.foo', function (newA) {
        a = newA;
    });
    dispatcher.trigger('test.abc', [A1]);
    assert.equal(a, A1, 'a === A1');
    dispatcher.trigger('test.abc.foo.bar', [A2]);
    assert.equal(a, A1, 'a === A1');
});

QUnit.test('namespace 3', function (assert) {
    var A0 = 1, A1 = 12, A2 = 123;
    var a = A0;
    var dispatcher = cc.Dispatcher.new();
    dispatcher.on('test.abc.foo.bar', function (newA) {
        a = newA;
    });
    dispatcher.trigger('test.abc.foo', [A1]);
    assert.equal(a, A1, 'a === A1');
    dispatcher.trigger('test.abc.foo.bar.xxx', [A2]);
    assert.equal(a, A1, 'a === A1');
});

QUnit.test('multiple handlers', function (assert) {
    var lst = [];
    var dispatcher = cc.Dispatcher.new();
    dispatcher.on('test', function () {
        lst.push(1);
    }).on('test', function () {
        lst.push(2);
    }).on('test', function () {
        lst.push(3);
    }).trigger('test');
    assert.equal(lst.length, 3, 'lst.length === 3');
});

QUnit.test('off', function (assert) {
    var A0 = 1, A1 = 12;
    var a = A0;
    var dispatcher = cc.Dispatcher.new();
    dispatcher.on('test', function (newA) {
        a = newA;
    }).off('test').trigger('test', [A1]);
    assert.equal(a, A0, 'a === A0');
});

QUnit.test('off namespace 1', function (assert) {
    var A0 = 1, A1 = 12;
    var a = A0;
    var dispatcher = cc.Dispatcher.new();
    dispatcher.on('test.abc', function (newA) { a = newA; });
    dispatcher.off('test');
    dispatcher.trigger('test', [A1]);
    assert.equal(a, A0, 'a === A0');
});

QUnit.test('off namespace 2', function (assert) {
    var A0 = 1, A1 = 12;
    var a = A0;
    var dispatcher = cc.Dispatcher.new();
    dispatcher.on('test.abc', function (newA) { a = newA; });
    dispatcher.on('test.kkk', function (newA) { a = newA; });
    dispatcher.off('test.abc');
    dispatcher.trigger('test.abc', [A1]);
    assert.equal(a, A0, 'a === A0');
    dispatcher.off('test.xxx');
    dispatcher.trigger('test.kkk', [A1]);
    assert.equal(a, A1, 'a === A1');
    dispatcher.trigger('test', [A0]);
    assert.equal(a, A0, 'a === A0 again');
});

QUnit.test('off all', function (assert) {
    var A0 = 1, A1 = 12;
    var a = A0;
    var dispatcher = cc.Dispatcher.new();
    dispatcher.on('test.abc', function (newA) { a = newA; });
    dispatcher.off();
    dispatcher.trigger('test', [A1]);
    assert.equal(a, A0, 'a === A0');
});

// TODO