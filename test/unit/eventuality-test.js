QUnit.test('events', function (assert) {
    var A0 = 33, B0 = 44, A = 11, B = 22;
    var a = A0, b = B0;
    var events = cc.Events.new();
    events.trigger('test', [1, 2]);
    assert.equal(a, A0, 'a === A0');
    assert.equal(b, B0, 'a === B0');
    events.on('test', function (pa, pb) {
        a = pa;
        b = pb;
    });
    assert.equal(a, A0, 'a === A0 again');
    assert.equal(b, B0, 'a === B0 again');
    events.trigger('abc', [1, 2]);
    assert.equal(a, A0, 'a === A0 again again');
    assert.equal(b, B0, 'a === B0 again again');
    events.trigger('test', [A, B]);
    assert.equal(a, A, 'a === A');
    assert.equal(b, B, 'a === B');
});

QUnit.test('this', function (assert) {
    var A0 = 1, A = 12;
    var events = cc.Events.new();
    events.a = A0;
    invoke(events.on, ['test', function () {
        this.a = A;
    }]);
    assert.equal(events.a, A0, 'events.a === A0');
    invoke(events.trigger, ['test']);
    assert.equal(events.a, A, 'events.a === A');
});

QUnit.test('namespace', function (assert) {
    var A0 = 1, A1 = 12, A2 = 123;
    var a = A0;
    var events = cc.Events.new();
    events.on('test.abc', function (newA) {
        a = newA;
    });
    events.trigger('test', [A1]);
    assert.equal(a, A1, 'a === A1');
    events.trigger('test.abc.foo', [A2]);
    assert.equal(a, A1, 'a === A1');
});

QUnit.test('namespace 2', function (assert) {
    var A0 = 1, A1 = 12, A2 = 123;
    var a = A0;
    var events = cc.Events.new();
    events.on('test.abc.foo', function (newA) {
        a = newA;
    });
    events.trigger('test.abc', [A1]);
    assert.equal(a, A1, 'a === A1');
    events.trigger('test.abc.foo.bar', [A2]);
    assert.equal(a, A1, 'a === A1');
});

QUnit.test('multiple handlers', function (assert) {
    var lst = [];
    var events = cc.Events.new();
    events.on('test', function () {
        lst.push(1);
    });
    events.on('test', function () {
        lst.push(2);
    });
    events.on('test', function () {
        lst.push(3);
    });
    events.trigger('test');
    assert.equal(lst.length, 3, 'lst.length === 3');
});

QUnit.test('off', function (assert) {

});

// TODO