QUnit.test('typeOf', function (assert) {
    assert.ok(cc.typeOf('a') === 'string', 'typeOf string');
    assert.ok(cc.typeOf(1) === 'number', 'typeOf number');
    assert.ok(cc.typeOf(function () {}) === 'function', 'typeOf function');
    assert.ok(cc.typeOf(new Function()) === 'function', 'typeOf new Function');
});

QUnit.test('bind', function (assert) {
    var X = 42;
    var obj = {
        x: X,
        f: function () { return this.x; }
    };
    assert.equal(obj.f(), X, 'obj.f() === X');
    var f = obj.f;
    assert.notEqual(f(), X, 'f() !== X');
    var bf = obj.f.bind(obj);
    assert.equal(bf(), X, 'bf() === X');

    var add = function (x, y) { return x + y; };
    var add1  = add.bind(null, 1);
    assert.equal(add1(42), 43, 'add1(42) === 43');

    var otherAdd = add.bind();
    assert.equal(otherAdd(2, 3), 5, 'otherAdd(2, 3) === 5');

    var al = function () {
        return arguments.length;
    };
    var al1 = al.bind(null, 1);
    assert.equal(al1(1), 2, '1: al1(1) === 2');
    assert.equal(al1(1), 2, '2: al1(1) === 2');
});

QUnit.test('pluralSetter', function (assert) {
    var obj = {};
    var setter = function (k, v) {
        obj[k] = v;
    }.overloadPluralSetter();

    setter({
        x: 1,
        y: 2
    });
    assert.equal(obj.x, 1, 'obj.x === 1');
    assert.equal(obj.y, 2, 'obj.y === 2');

    setter('x', 11);
    assert.equal(obj.x, 1, 'obj.x no changed');

    var obj2 = {
        set: function (k, v) {
            this[k] = v;
        }.overloadPluralSetter()
    };

    obj2.set({
        x: 33,
        y: 44
    });
    assert.equal(obj2.x, 33, 'obj2.x === 33');
    assert.equal(obj2.y, 44, 'obj2.y === 44');

    obj2.set();
    assert.equal(obj2.x, 33, 'obj2.x === 33 after set nothing');
    assert.equal(obj2.y, 44, 'obj2.y === 44 after set nothing');

    obj2.set('x', 321);
    assert.equal(obj2.x, 33, 'obj2.x no changed');
});

QUnit.test('multipleSetter', function (assert) {
    var obj = {};
    var setter = function (k, v) {
        obj[k] = v;
    }.overloadSetter();

    setter('a', 123);
    assert.equal(obj.a, 123, 'obj.a === 123');

    setter({
        x: 1,
        y: 2
    });
    assert.equal(obj.x, 1, 'obj.x === 1');
    assert.equal(obj.y, 2, 'obj.y === 2');

    var obj2 = {
        set: function (k, v) {
            this[k] = v;
        }.overloadSetter()
    };

    obj2.set('a', 321);
    assert.equal(obj2.a, 321, 'obj2.a === 321');

    obj2.set({
        x: 33,
        y: 44
    });
    assert.equal(obj2.x, 33, 'obj2.x === 33');
    assert.equal(obj2.y, 44, 'obj2.y === 44');

    obj2.set();
    assert.equal(obj2.x, 33, 'obj2.x === 33 after set nothing');
    assert.equal(obj2.y, 44, 'obj2.y === 44 after set nothing');
});

QUnit.test('string.format', function (assert) {
    var s = '{a}{b}{c}'.format({
        a: 1,
        b: 2
    });
    assert.equal(s, '12{c}', 's === "12{c}"');
});
