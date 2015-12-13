QUnit.test('Class', function (assert) {
    var initX = 42;
    var newX = 22;
    var Test = cc.Class.extends(function (self) {
        var x = initX;
        return {
            setX: function (v) { x = v; },
            getX: function () { return x; }
        };
    });
    var obj = Test.new();
    assert.equal(obj.getX(), initX,
        'obj.getX()===initX');
    obj.setX(newX);
    assert.equal(obj.getX(), newX,
        'obj.getX()===newX');
    assert.ok(cc.instanceOf(Test, cc.BasicObject),
        'Test is instanceof BasicObject');
    assert.ok(cc.instanceOf(obj, cc.BasicObject),
        'obj is instanceof BasicObject');
});

QUnit.test('instanceOf', function (assert) {
    var Test = cc.Class.extends();
    var obj = Test.new();

    assert.ok(cc.instanceOf(obj, Test),
        'obj is instanceof Test');
    assert.ok(cc.instanceOf(obj, cc.BasicObject),
        'obj is instanceof BasicObject');
    assert.ok(cc.instanceOf(Test, cc.Class),
        'Test is instanceof Class');
    assert.ok(cc.instanceOf(Test, cc.BasicObject),
        'Test is instanceof BasicObject');
    assert.ok(cc.instanceOf(cc.Class, cc.BasicObject),
        'Class is instanceof BasicObject');
});
