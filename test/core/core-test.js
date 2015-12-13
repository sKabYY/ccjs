QUnit.test('typeOf', function (assert) {
    assert.ok(cc.typeOf('a') === 'string', 'typeOf string');
    assert.ok(cc.typeOf(1) === 'number', 'typeOf number');
    assert.ok(cc.typeOf(function () {}) === 'function', 'typeOf function');
    assert.ok(cc.typeOf(new Function()) === 'function', 'typeOf new Function');
});

QUnit.test('multipleSetter', function (assert) {
    var obj = {};
    var setter = function (k, v) {
        obj[k] = v;
    }.overloadSetter();

    setter('a', 123);
    assert.equal(obj.a, 123);

    setter({
        x: 1,
        y: 2
    });
    assert.equal(obj.x, 1);
    assert.equal(obj.y, 2);

    var obj2 = {
        set: function (k, v) {
            this[k] = v;
        }.overloadSetter()
    };

    obj2.set('a', 321);
    assert.equal(obj2.a, 321);

    obj2.set({
        x: 33,
        y: 44
    });
    assert.equal(obj2.x, 33);
    assert.equal(obj2.y, 44);
});